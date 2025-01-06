import torch
import chess
import numpy as np
from gym_chess.alphazero.move_encoding import utils
from typing import Optional


def encodeBoard(board: chess.Board) -> np.array:
    """Converts a board to numpy array representation."""

    array = np.zeros((8, 8, 14), dtype=int)

    for square, piece in board.piece_map().items():
        rank, file = chess.square_rank(square), chess.square_file(square)
        piece_type, color = piece.piece_type, piece.color

        # The first six planes encode the pieces of the active player,
        # the following six those of the active player's opponent. Since
        # this class always stores boards oriented towards the white player,
        # White is considered to be the active player here.
        offset = 0 if color == chess.WHITE else 6

        # Chess enumerates piece types beginning with one, which you have
        # to account for
        idx = piece_type - 1

        array[rank, file, idx + offset] = 1

    # Repetition counters
    array[:, :, 12] = board.is_repetition(2)
    array[:, :, 13] = board.is_repetition(3)

    return array


def _decodeKnight(action: int) -> Optional[chess.Move]:
    _NUM_TYPES: int = 8

    _TYPE_OFFSET: int = 56

    _DIRECTIONS = utils.IndexedTuple(
        (+2, +1),
        (+1, +2),
        (-1, +2),
        (-2, +1),
        (-2, -1),
        (-1, -2),
        (+1, -2),
        (+2, -1),
    )

    from_rank, from_file, move_type = np.unravel_index(action, (8, 8, 73))

    is_knight_move = (
        _TYPE_OFFSET <= move_type
        and move_type < _TYPE_OFFSET + _NUM_TYPES
    )

    if not is_knight_move:
        return None

    knight_move_type = move_type - _TYPE_OFFSET

    delta_rank, delta_file = _DIRECTIONS[knight_move_type]

    to_rank = from_rank + delta_rank
    to_file = from_file + delta_file

    move = utils.pack(from_rank, from_file, to_rank, to_file)
    return move


def _decodeQueen(action: int) -> Optional[chess.Move]:

    _NUM_TYPES: int = 56

    _DIRECTIONS = utils.IndexedTuple(
        (+1, 0),
        (+1, +1),
        (0, +1),
        (-1, +1),
        (-1, 0),
        (-1, -1),
        (0, -1),
        (+1, -1),
    )
    from_rank, from_file, move_type = np.unravel_index(action, (8, 8, 73))

    is_queen_move = move_type < _NUM_TYPES

    if not is_queen_move:
        return None

    direction_idx, distance_idx = np.unravel_index(
        indices=move_type,
        shape=(8, 7)
    )

    direction = _DIRECTIONS[direction_idx]
    distance = distance_idx + 1

    delta_rank = direction[0] * distance
    delta_file = direction[1] * distance

    to_rank = from_rank + delta_rank
    to_file = from_file + delta_file

    move = utils.pack(from_rank, from_file, to_rank, to_file)
    return move


def _decodeUnderPromotion(action):
    _NUM_TYPES: int = 9

    _TYPE_OFFSET: int = 64

    _DIRECTIONS = utils.IndexedTuple(
        -1,
        0,
        +1,
    )

    _PROMOTIONS = utils.IndexedTuple(
        chess.KNIGHT,
        chess.BISHOP,
        chess.ROOK,
    )

    from_rank, from_file, move_type = np.unravel_index(action, (8, 8, 73))

    is_underpromotion = (
        _TYPE_OFFSET <= move_type
        and move_type < _TYPE_OFFSET + _NUM_TYPES
    )

    if not is_underpromotion:
        return None

    underpromotion_type = move_type - _TYPE_OFFSET

    direction_idx, promotion_idx = np.unravel_index(
        indices=underpromotion_type,
        shape=(3, 3)
    )

    direction = _DIRECTIONS[direction_idx]
    promotion = _PROMOTIONS[promotion_idx]

    to_rank = from_rank + 1
    to_file = from_file + direction

    move = utils.pack(from_rank, from_file, to_rank, to_file)
    move.promotion = promotion

    return move


def decodeMove(action: int, board) -> chess.Move:
    move = _decodeQueen(action)
    is_queen_move = move is not None

    if not move:
        move = _decodeKnight(action)

    if not move:
        move = _decodeUnderPromotion(action)

    if not move:
        raise ValueError(f"{action} is not a valid action")

    turn = board.turn

    if turn is False:
        move = utils.rotate(move)

    if is_queen_move:

        to_rank = chess.square_rank(move.to_square)

        is_promoting_move = (
            (to_rank == 7 and turn is True) or
            (to_rank == 0 and turn is False)
        )

        piece = board.piece_at(move.from_square)

        if piece is None:
            return None
        is_pawn = piece.piece_type == chess.PAWN

        if is_pawn and is_promoting_move:
            move.promotion = chess.QUEEN

    return move


class Model(torch.nn.Module):

    def __init__(self):
        super(Model, self).__init__()
        self.INPUT_SIZE = 896
        self.OUTPUT_SIZE = 4672

        self.activation = torch.nn.ReLU()
        self.linear1 = torch.nn.Linear(self.INPUT_SIZE, 1000)
        self.linear2 = torch.nn.Linear(1000, 1000)
        self.linear3 = torch.nn.Linear(1000, 1000)
        self.linear4 = torch.nn.Linear(1000, 200)
        self.linear5 = torch.nn.Linear(200, self.OUTPUT_SIZE)
        self.softmax = torch.nn.Softmax(1)

    def forward(self, x):
        x = x.to(torch.float32)
        x = x.reshape(x.shape[0], -1)
        x = self.linear1(x)
        x = self.activation(x)
        x = self.linear2(x)
        x = self.activation(x)
        x = self.linear3(x)
        x = self.activation(x)
        x = self.linear4(x)
        x = self.activation(x)
        x = self.linear5(x)
        return x

    # def predict(self, board: chess.Board):
    #     with torch.no_grad():
    #         encodedBoard = encodeBoard(board)
    #         encodedBoard = encodedBoard.reshape(1, -1)
    #         encodedBoard = torch.from_numpy(encodedBoard)
    #         res = self.forward(encodedBoard)
    #         probs = self.softmax(res)
    #         probs = probs.numpy()[0]

    #         print(f"Prediction probabilities: {probs}")  # Debug

    #         while len(probs) > 0:
    #             moveIdx = probs.argmax()
    #             try:
    #                 uciMove = decodeMove(moveIdx, board)
    #                 print(f"Decoded move index {moveIdx} to UCI move: {uciMove}")  # Debug

    #                 if uciMove is None:
    #                     probs = np.delete(probs, moveIdx)
    #                     continue

    #                 move = chess.Move.from_uci(str(uciMove))
    #                 if move in board.legal_moves:
    #                     print(f"Valid AI move: {move}")  # Debug
    #                     return move
    #             except ValueError as ve:
    #                 print(f"ValueError for move index {moveIdx}: {ve}")
    #             except AttributeError as ae:
    #                 print(f"AttributeError for move index {moveIdx}: {ae}")
                
    #             probs = np.delete(probs, moveIdx)

    #         print("No valid moves found.")
    #         return None

    def predict(self, board: chess.Board):
        """
        takes in a chess board and returns a chess.move object.
        NOTE: this function should definitely be written better, but it works for now
        """
        with torch.no_grad():
            encodedBoard = encodeBoard(board)
            encodedBoard = encodedBoard.reshape(1, -1)
            encodedBoard = torch.from_numpy(encodedBoard)
            res = self.forward(encodedBoard)
            probs = self.softmax(res)

            probs = probs.numpy()[0]

            while len(probs) > 0:
                moveIdx = probs.argmax()
                try:
                    uciMove = decodeMove(moveIdx, board)
                    if uciMove is None:
                        probs = np.delete(probs, moveIdx)
                        continue
                    move = chess.Move.from_uci(str(uciMove))
                    if move in board.legal_moves:
                        return move
                except (ValueError, TypeError, IndexError, AttributeError):
                    pass
                probs = np.delete(probs, moveIdx)

            return None

from django.views.generic import TemplateView
import torch
import pickle
import numpy as np
from django.http import JsonResponse, HttpResponseBadRequest
from chess import Board
# from .chess.chess_model_code_1 import Model
from .chess.chess_model_code_2 import ChessModel, board_to_matrix


class GamesListView(TemplateView):
    template_name = 'games_list.html'


class CrosswordView(TemplateView):
    template_name = 'crossword.html'


class ChessView(TemplateView):
    template_name = 'chess.html'


class HanziView(TemplateView):
    template_name = 'hanzi.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Default level to 0 if not present in query parameters
        level = self.request.GET.get('level', '0')
        context['level'] = int(level) if level.isdigit() else 0
        return context

# model = None

def prepare_input(board: Board):
    matrix = board_to_matrix(board)
    X_tensor = torch.tensor(matrix, dtype=torch.float32).unsqueeze(0)
    return X_tensor

# Load model and auxiliary data
with open("/home/nikitos/Projects/edu/tutors_django/apps/games/chess/move_to_int_latest_122", "rb") as file:
    move_to_int = pickle.load(file)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = ChessModel(num_classes=len(move_to_int))
model.load_state_dict(torch.load("/home/nikitos/Projects/edu/tutors_django/apps/games/chess/latest_chess_model_122.pth", map_location=device))
model.to(device)
model.eval()
## STALE MATE IS NOT IMPLEMENTED! 
int_to_move = {v: k for k, v in move_to_int.items()}

def predict_move(board: Board):
    """
    Predict the best move for a given chess board.
    """
    X_tensor = prepare_input(board).to(device)
    with torch.no_grad():
        logits = model(X_tensor)

    logits = logits.squeeze(0)  # Remove batch dimension
    probabilities = torch.softmax(logits, dim=0).cpu().numpy()
    legal_moves = list(board.legal_moves)
    legal_moves_uci = [move.uci() for move in legal_moves]

    # Sort moves by probabilities
    sorted_indices = np.argsort(probabilities)[::-1]
    for move_index in sorted_indices:
        move = int_to_move[move_index]
        if move in legal_moves_uci:
            return move

    return None

def ai_move(request):
    """
    Django view to provide AI-generated moves.
    """
    fen = request.GET.get('fen')
    if not fen:
        return HttpResponseBadRequest("FEN string is required.")

    try:
        board = Board(fen)
        best_move = predict_move(board)
        if best_move:
            return JsonResponse({"move": best_move})
        else:
            return JsonResponse({"error": "No valid move found."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

###########################################################
# def load_model():
#     """Load the trained chess model if not already loaded."""
#     global model
#     if model is None:
#         model = Model()
#         model.load_state_dict(torch.load('/home/nikitos/Projects/edu/tutors_django/apps/games/chess/chess_model.pth',
#             weights_only=True))
#         model.eval()


# def get_ai_move(fen):
#     """Get the AI's move based on the current board state."""
#     load_model()
#     board = chess.Board(fen)
#     move = model.predict(board)
#     if move:
#         return move.uci()
#     return None


# def ai_move(request):
#     """Handle the request to get the AI's move."""
#     fen = request.GET.get('fen')
#     if not fen:
#         return JsonResponse({'error': 'FEN string is required.'}, status=400)

#     move = get_ai_move(fen)
#     if move:
#         return JsonResponse({'move': move})
#     return JsonResponse({'error': 'No valid moves found.'}, status=400)

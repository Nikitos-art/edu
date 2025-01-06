from django.views.generic import TemplateView
from django.http import JsonResponse
import chess
import torch
from .chess.chess_model_code import Model


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

model = None


def load_model():
    """Load the trained chess model if not already loaded."""
    global model
    if model is None:
        model = Model()
        model.load_state_dict(torch.load('/home/nikitos/Projects/edu/tutors_django/apps/games/chess/chess_model_Jan6', 
            weights_only=True))
        model.eval()

# def get_ai_move(fen):
#     """Get the AI's move based on the current board state."""
#     print(f"Received FEN: {fen}")  # Debug: Print the incoming FEN
#     load_model()

#     try:
#         board = chess.Board(fen)
#         print(f"Board created successfully: {board}")  # Debug: Verify board creation
#     except ValueError as e:
#         print(f"Error creating board with FEN: {fen}. Error: {e}")
#         return None

#     move = model.predict(board)
#     if move:
#         print(f"AI move predicted: {move.uci()}")  # Debug: Print the predicted move
#         return move.uci()

#     print("No move predicted by the model.")  # Debug: Log when no move is found
#     return None

def get_ai_move(fen):
    """Get the AI's move based on the current board state."""
    load_model()
    board = chess.Board(fen)
    move = model.predict(board)
    if move:
        return move.uci()
    return None


def ai_move(request):
    """Handle the request to get the AI's move."""
    fen = request.GET.get('fen')
    if not fen:
        return JsonResponse({'error': 'FEN string is required.'}, status=400)

    move = get_ai_move(fen)
    if move:
        return JsonResponse({'move': move})
    return JsonResponse({'error': 'No valid moves found.'}, status=400)

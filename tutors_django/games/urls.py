from django.urls import path
from .views import GamesListView, GuessWordView, CrosswordView, ChessView, HanziView


app_name = 'games'

urlpatterns = [
    path('', GamesListView.as_view(), name='games'),
    path('guess_word/', GuessWordView.as_view(), name='guess_word'),
    path('crossword/', CrosswordView.as_view(), name='crossword'),
    path('chess/', ChessView.as_view(), name='chess'),
    path('hanzi/', HanziView.as_view(), name='hanzi')
]
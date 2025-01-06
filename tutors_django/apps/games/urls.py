from django.urls import path
from .views import GamesListView, CrosswordView, ChessView, HanziView


app_name = 'games'

urlpatterns = [
    path('', GamesListView.as_view(), name='games'),
    path('crossword/', CrosswordView.as_view(), name='crossword'),
    path('chess/', ChessView.as_view(), name='chess'),
    # path('ai_move/', ai_move, name='ai_move'),
    path('hanzi/', HanziView.as_view(), name='hanzi')
]

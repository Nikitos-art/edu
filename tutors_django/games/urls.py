from django.urls import path
from .views import GamesListiew, GuessWordView, CrosswordView


app_name = 'games'

urlpatterns = [
    path('', GamesListiew.as_view(), name='games'),
    path('guess_word/', GuessWordView.as_view(), name='guess_word'),
    path('crossword/', CrosswordView.as_view(), name='crossword'),
]
#from django.shortcuts import render
from django.views.generic import TemplateView


class GamesListiew(TemplateView):
    template_name = 'games_list.html'

class GuessWordView(TemplateView):
    template_name = 'guess_word.html'

class CrosswordView(TemplateView):
    template_name = 'crossword.html'

class ChessView(TemplateView):
    template_name = 'chess.html'

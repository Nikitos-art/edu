#from django.shortcuts import render
from django.views.generic import TemplateView


class GamesListView(TemplateView):
    template_name = 'games_list.html'

class GuessWordView(TemplateView):
    template_name = 'guess_word.html'

class CrosswordView(TemplateView):
    template_name = 'crossword.html'

class ChessView(TemplateView):
    template_name = 'chess.html'

class HanziView(TemplateView):
    template_name = 'hanzi.html'
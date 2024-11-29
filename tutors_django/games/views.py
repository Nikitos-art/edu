#from django.shortcuts import render
from django.views.generic import TemplateView


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
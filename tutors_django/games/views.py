from django.shortcuts import render
from django.views.generic import TemplateView

# Create your views here.
# class GamesListiew(TemplateView):
#     template_name = 'games_list.html'
class GamesListiew(TemplateView):
    template_name = 'games_list.html'

class GuessWordView(TemplateView):
    template_name = 'guess_word.html'
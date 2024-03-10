from django import forms
from django.forms import TextInput

from .models import Quiz, Question, Answer
from django.forms.models import inlineformset_factory


class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['name', 'topic', 'number_of_questions', 'time', 'required_score_to_pass', 'difficulty']


class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['text', 'quiz']

        widgets = {
            'text': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter your question here.'}),
            'quiz': forms.Select(attrs={'class': 'form-control'}),
        }
        labels = {'text': 'Question text'},


AnswerFormSet = inlineformset_factory(
    Question, Answer,
    fields=('text', 'correct'),
    extra=4,
    can_delete=False,
    widgets={'text': TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter your answer here.'})}
)

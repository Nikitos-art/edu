from django.contrib import messages
from django.views import generic
from .models import Quiz, Question, Answer, Result
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import CreateView
from django.shortcuts import redirect
from .forms import QuizForm, QuestionForm, AnswerFormSet
from django.urls import reverse_lazy
from django.shortcuts import render, get_object_or_404
from django.views.generic.edit import FormView


class QuizList(generic.ListView):
    queryset = Quiz.objects.all()
    template_name = 'quiz.html'
    context_object_name = 'quizzes'


def quiz_view(request, pk):
    quiz = Quiz.objects.get(pk=pk)
    return render(request, 'quiz_detail.html', {'obj': quiz})


def quiz_data_view(request, pk):
    quiz = Quiz.objects.get(pk=pk)
    questions = []
    for q in quiz.get_questions():
        answers = []
        for a in q.get_answers():
            answers.append(a.text)
        questions.append({str(q): answers})
    return JsonResponse({
        'data': questions,
        'time': quiz.time
    })


def save_quiz_view(request, pk):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        questions = []
        data = request.POST
        data_ = dict(data.lists())
        data_.pop('csrfmiddlewaretoken')
        for k in data_.keys():
            question = Question.objects.get(text=k)
            questions.append(question)

        user = request.user
        quiz = Quiz.objects.get(pk=pk)

        score = 0
        multiplier = 100 / quiz.number_of_questions
        results = []
        correct_answer = None

        for q in questions:
            a_selected = request.POST.get(str(q))
            if a_selected != "":
                question_answers = Answer.objects.filter(question=q)
                for a in question_answers:
                    if a_selected == a.text:
                        if a.correct:
                            score += 1
                            correct_answer = a.text
                    else:
                        if a.correct:
                            correct_answer = a.text
                results.append({str(q): {'correct_answer': correct_answer, 'answered': a_selected}})
            else:
                results.append({str(q): 'not answered'})

        score_ = score * multiplier
        Result.objects.create(quiz=quiz, user=user, score=score_)

        if score_ >= quiz.required_score_to_pass:
            return JsonResponse({'passed': True, 'score': score_, 'results': results})
        else:
            return JsonResponse({'passed': False, 'score': score_, 'results': results})


class QuizCreateView(LoginRequiredMixin, CreateView):
    template_name = 'quiz_create.html'
    model = Quiz
    form_class = QuizForm

    def dispatch(self, request, *args, **kwargs):
        if request.user.user_roles != "tutor":
            return redirect('/error')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('tutor_account', kwargs={'full_name': self.request.user.full_name})


class CreateQuestionsView(FormView):
    template_name = 'questions_create.html'
    form_class = QuestionForm

    def get_initial(self):
        initial = super().get_initial()
        # Check if there's a question ID in the URL, indicating editing
        question_id = self.kwargs.get('question_id')

        if question_id:
            question = get_object_or_404(Question, pk=question_id)
            initial['quiz'] = question.quiz.pk
            initial['text'] = question.text  # Adjust based on your actual field names
            # Add other fields as needed
        else:
            # If not editing, set initial values based on the quiz ID in the URL
            initial['quiz'] = self.kwargs['pk']
        return initial


    def dispatch(self, request, *args, **kwargs):
        # Retrieve the quiz based on the quiz ID in the URL
        quiz_pk = self.kwargs['pk']
        self.quiz = get_object_or_404(Quiz, pk=quiz_pk)

        # Check if there's a question ID in the URL, indicating editing
        question_id = self.kwargs.get('question_id')

        if question_id:
            # If editing, retrieve the existing question and associated quiz
            self.question = get_object_or_404(Question, pk=question_id)
            self.quiz = self.question.quiz

        if request.user.user_roles != "tutor":
            return redirect('/error')

        return super().dispatch(request, *args, **kwargs)


    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)

        # Check if there's a question ID in the URL, indicating editing
        question_id = self.kwargs.get('question_id')

        if question_id:
            # If editing, include the existing question instance in the context
            data['editing_question'] = self.question

        else:
            # If not editing, retrieve all questions for the current quiz
            questions = self.get_questions_for_quiz()
            data['questions'] = questions

        if self.request.POST:
            data['formset'] = AnswerFormSet(self.request.POST)
        else:
            data['formset'] = AnswerFormSet()

        return data


    def form_valid(self, form):
        context = self.get_context_data()
        formset = context['formset']

        # Check if there's a question ID in the URL, indicating editing
        question_id = self.kwargs.get('question_id')

        total_questions = Question.objects.filter(quiz=self.quiz).count()
        cur_quiz_q_num = self.quiz.number_of_questions

        if question_id:
            # If editing, update the existing question instance
            self.object = form.save(commit=False)
            self.question.text = self.object.text
            self.question.save()

        elif total_questions < cur_quiz_q_num:
            # If not editing and within the limit, create a new question
            self.object = form.save()

        else:
            messages.error(self.request, f'This quiz is limited with {cur_quiz_q_num} questions only.')
            return self.form_invalid(form)

        formset.instance = self.object
        formset.save()

        return super().form_valid(form)


    def get_success_url(self):
        return reverse_lazy('tutor_account', kwargs={'full_name': self.request.user.full_name})

    def get_questions_for_quiz(self):
        questions = Question.objects.filter(quiz=self.quiz)
        return questions
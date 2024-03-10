from django.shortcuts import render
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import LoginView, LogoutView
from django.core.exceptions import BadRequest
from django.shortcuts import redirect
from django.views.generic import CreateView, TemplateView
from accounts_app.forms import RegisterUserForm, UserProfilePictureForm
from django.contrib.auth.mixins import LoginRequiredMixin
from blog_app.models import Post
from quiz_app.models import Quiz
from courses_app.models import Lesson
from .models import UserAccount
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.contrib import messages
from django.urls import reverse
#
from calendar import HTMLCalendar
from datetime import date
from collections import defaultdict
import re


def index_view(request):
    return render(request, 'index.html')


class AboutView(TemplateView):
    template_name = 'about.html'
    model = UserAccount

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        return data


class CoursesView(TemplateView):
    template_name = 'courses.html'


class NikitaView(TemplateView):
    template_name = 'nikita.html'


def privacy_view(request):
    return render(request, 'privacy.html')


@method_decorator(ratelimit(key='user_or_ip', rate='20/m'), name='dispatch')
@method_decorator(ratelimit(key='user_or_ip', rate='100/10m'), name='dispatch')
@method_decorator(ratelimit(key='user_or_ip', rate='150/d'), name='dispatch')
class LoginUser(LoginView):
    form_class = AuthenticationForm
    template_name = 'login.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

    def form_valid(self, form):
        user = form.get_user()
        login(self.request, user)
        if user.user_roles == "student":
            return redirect(reverse('student_account', args=[user.full_name]))
        elif user.user_roles == "tutor":
            return redirect(reverse('tutor_account', args=[user.full_name]))
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, 'Sorry! Login unsuccessful. Try again.') 
        return super().form_invalid(form)

@method_decorator(ratelimit(key='user_or_ip', rate='50/m'), name='dispatch')
@method_decorator(ratelimit(key='user_or_ip', rate='60/10m'), name='dispatch')
@method_decorator(ratelimit(key='user_or_ip', rate='70/d'), name='dispatch')
class RegisterUser(CreateView):
    form_class = RegisterUserForm
    template_name = 'register.html'

    def form_valid(self, form):
        user = form.save()

        if form.cleaned_data['user_role'] == 'tutor':
            user.tutor = True
            user.save()
            login(self.request, user)
            messages.success(self.request, 'Congrats! Registration successful! Welcome to your profile!')
            return redirect(reverse('tutor_account', args=[user.full_name]))
        
        elif form.cleaned_data['user_role'] == 'student':
            user.student = True
            user.save()
            login(self.request, user)
            messages.success(self.request, 'Congrats! Registration successful! Welcome to your profile!')
            return redirect(reverse('student_account', args=[user.full_name]))
        else:
            raise BadRequest

    def form_invalid(self, form):
        messages.error(self.request, 'Please fill in all the fields.')
        return super().form_invalid(form)


class StudentAccount(LoginRequiredMixin, TemplateView):
    template_name = 'student_page.html'

    def get(self, request, *args, **kwargs):
        user = request.user
        form = UserProfilePictureForm(instance=user)
        current_date = date.today()
        year, month = current_date.year, current_date.month
        cal = self.generate_calendar_with_lessons(year, month, user)

        context = {
            'cal': cal,
            'lessons': Lesson.objects.filter(tutor=user.pk),
            'quizzes': Quiz.objects.filter(author=user),
            'tutors': UserAccount.objects.filter(user_roles="tutor"),
            'form': form,
        }

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        user = request.user
        form = UserProfilePictureForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return redirect('student_account', full_name=user.full_name)

        current_date = date.today()
        year, month = current_date.year, current_date.month
        cal = self.generate_calendar_with_lessons(year, month, user)

        context = {
            'cal': cal,
            'lessons': Lesson.objects.filter(student=user.pk),
            'tutors': UserAccount.objects.filter(user_roles="tutor"),
            'form': form,
        }

        return render(request, self.template_name, context)

    def generate_calendar_with_lessons(self, year, month, user):
        cal = HTMLCalendar().formatmonth(year, month)
        lessons_by_day = defaultdict(list)

        lessons = Lesson.objects.filter(student=user.pk)
        for lesson in lessons:
            lesson_day = lesson.lesson_date.day
            lessons_by_day[lesson_day].append(lesson)

        for day, day_lessons in lessons_by_day.items():
            for match in re.finditer(f'<td class=".*?">{day}</td>', cal):
                td_start, td_end = match.span()
                button_html = f'{self.get_lesson_buttons(day_lessons)}'
                cal = cal[:td_start] + match.group().replace(f'>{day}</td>', f'>{day}<br>{button_html}') + cal[td_end:]
        return cal

    def get_lesson_buttons(self, lessons):
        buttons_html = ""
        for lesson in lessons:
            buttons_html += f'<button class="lesson-button" data-lesson-id="{lesson.id}">{lesson.start}</button>'
        return buttons_html

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            if request.user.user_roles != "student":
                return redirect('/error')
        else:
            return redirect(reverse('log_in'))
        return super().dispatch(request, *args, **kwargs)


class TutorAccount(LoginRequiredMixin, TemplateView):
    template_name = 'tutor_page.html'

    def get(self, request, *args, **kwargs):
        user = request.user
        form = UserProfilePictureForm(instance=user)
        current_date = date.today()
        year, month = current_date.year, current_date.month
        cal = self.generate_calendar_with_lessons(year, month, user)
        
        context = {
            'cal': cal,
            'lessons': Lesson.objects.filter(tutor=user.pk),
            'blog_posts': Post.objects.filter(author=user),
            'quizzes': Quiz.objects.filter(author=user),
            'students': UserAccount.objects.filter(user_roles="student"),
            'form': form,
        }

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        user = request.user
        form = UserProfilePictureForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return redirect('tutor_account', full_name=user.full_name)

        current_date = date.today()
        year, month = current_date.year, current_date.month
        cal = self.generate_calendar_with_lessons(year, month, user)

        context = {
            'cal': cal,
            'lessons': Lesson.objects.filter(tutor=user.pk),
            'blog_posts': Post.objects.filter(author=user),
            'quizzes': Quiz.objects.filter(author=user),
            'students': UserAccount.objects.filter(user_roles="student"),
            'form': form,
        }

        return render(request, self.template_name, context)

    def generate_calendar_with_lessons(self, year, month, user):
        cal = HTMLCalendar().formatmonth(year, month)
        lessons_by_day = defaultdict(list)

        lessons = Lesson.objects.filter(tutor=user.pk)
        for lesson in lessons:
            lesson_day = lesson.lesson_date.day
            lessons_by_day[lesson_day].append(lesson)

        for day, day_lessons in lessons_by_day.items():
            for match in re.finditer(f'<td class=".*?">{day}</td>', cal):
                td_start, td_end = match.span()
                button_html = f'{self.get_lesson_buttons(day_lessons)}'
                cal = cal[:td_start] + match.group().replace(f'>{day}</td>', f'>{day}<br>{button_html}') + cal[td_end:]
        return cal

    def get_lesson_buttons(self, lessons):
        buttons_html = ""
        for lesson in lessons:
            buttons_html += f'<button class="lesson-button" data-lesson-id="{lesson.id}">{lesson.start}</button>'
        return buttons_html

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            if request.user.user_roles != "tutor":
                return redirect('/error')
        else:
            return redirect(reverse('log_in'))
        return super().dispatch(request, *args, **kwargs)


class LogoutUser(LogoutView):
    next_page = '/log_in'


def custom_404(request, exception):
    return render(request, 'error.html', status=404)

from .models import Lesson
from django.shortcuts import get_object_or_404
from accounts_app.models import UserAccount
from django.shortcuts import redirect
from django.views import generic
# from .models import Course
from django.shortcuts import reverse
from django.core.exceptions import ValidationError
from django.contrib import messages
# import os


def add_lesson(request):
    full_name = request.user.full_name
    if request.method == "POST":
        lesson_date = request.POST.get('lesson_date')
        start_time = request.POST.get('start_time')
        finish_time = request.POST.get('finish_time')
        tutor_email = request.user.email
        student_name = request.POST.get('student_name')
        print(student_name)
        description = request.POST.get('description')
        # Get the UserAccount objects for the tutor and student
        tutor = get_object_or_404(UserAccount, email=tutor_email)
        student = get_object_or_404(UserAccount, full_name=student_name)
        # Check if the tutor is the same as the student
        try:
            # Check if the tutor is the same as the student
            if tutor == student:
                raise ValidationError("There was an error while adding the lesson.")
        except ValidationError:
            messages.error(request, "There was an error while adding the lesson.")
            return redirect(reverse('tutor_account', args=[full_name]))
        # Create the Lessons instance
        Lesson.objects.create(
            lesson_date=lesson_date,
            start=start_time,
            finish=finish_time,
            tutor=tutor,
            student=student,
            description=description
        )

        return redirect(reverse('tutor_account', args=[full_name]))


class CoursesView(generic.TemplateView):
    template_name = 'courses.html'


class PythonView(generic.TemplateView):
    template_name = 'py/python.html'


class PyOneView(generic.TemplateView):
    template_name = 'py/ip_validator.html'


class PyTwoView(generic.TemplateView):
    template_name = 'py/cipher.html'


class PyBankAccView(generic.TemplateView):
    template_name = 'py/py_bankacc.html'


class PyDataStructureListView(generic.TemplateView):
    template_name = 'py/py_data_structure_list.html'


class PyDataStructureDictView(generic.TemplateView):
    template_name = 'py/py_data_structure_dict.html'


class PyAlgoAxisView(generic.TemplateView):
    template_name = 'py/py_algo_axis.html'


class PyLogAnalyzerView(generic.TemplateView):
    template_name = 'py/log_analyzer.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        file_path = 'courses_app/templates/py/access_log.txt'
        try:
            with open(file_path, 'r') as file:
                context['file_content'] = file.read()
        except FileNotFoundError:
            context['file_content'] = "Error: File not found."
        return context

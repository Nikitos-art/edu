from django.db import models
from accounts_app.models import UserAccount
from quiz_app.models import Quiz
from django.utils.text import slugify
from datetime import date
from datetime import datetime


class Lesson(models.Model):
    lesson_date = models.DateField(default='2024-01-11')
    start = models.CharField(max_length=10)
    finish = models.CharField(max_length=10)
    tutor = models.ForeignKey(UserAccount, related_name='lessons_as_tutor', on_delete=models.CASCADE,
                              limit_choices_to={'user_roles': 'tutor'})
    student = models.ForeignKey(UserAccount, related_name='lessons_as_student', on_delete=models.CASCADE,
                                limit_choices_to={'user_roles': 'student'})
    description = models.CharField(max_length=64)

    def save(self, *args, **kwargs):
        # Ensure self.lesson_date is a date object or a string
        if isinstance(self.lesson_date, str):
            parts = self.lesson_date.split('/')
            if len(parts) == 3:
                # Assuming self.lesson_date is in the 'dd/mm/yyyy' format
                self.lesson_date = f'{parts[2]}-{parts[1]}-{parts[0]}'

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Lesson between {self.tutor.full_name} and {self.student.full_name}"


class Course(models.Model):
    course_name = models.CharField(max_length=64)
    slug = models.SlugField(max_length=200, unique=True, default="Default")
    description = models.CharField(max_length=256)
    num_of_lessons = models.IntegerField()
    tutors = models.ManyToManyField(UserAccount, related_name='course_tutor')
    student = models.ManyToManyField(UserAccount, related_name='course_student')
    quiz = models.ManyToManyField(Quiz, related_name='course_quiz')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.course_name

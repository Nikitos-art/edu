from django.urls import path
from courses_app.views import CoursesView, PythonView, PyOneView, PyTwoView


app_name = 'courses_app'

urlpatterns = [
    path('', CoursesView.as_view(), name='courses'),
    path('python/', PythonView.as_view(), name='python'),
    path('python_one/', PyOneView.as_view(), name='python_one'),
    path('python_two/', PyTwoView.as_view(), name='python_two'),
]
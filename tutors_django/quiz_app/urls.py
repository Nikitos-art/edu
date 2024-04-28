from django.urls import path
from .views import QuizList, quiz_view, quiz_data_view, save_quiz_view, QuizCreateView, CreateQuestionsView


app_name = 'quiz_app'

urlpatterns = [
    path('', QuizList.as_view(), name='quiz'),
    path('create_quiz/', QuizCreateView.as_view(), name='create_quiz'),
    path('create_questions/<int:pk>/', CreateQuestionsView.as_view(), name='questions_create'),
    path('<int:pk>/edit_question/<int:question_id>/', CreateQuestionsView.as_view(), name='edit_question'),
    path('<int:pk>/', quiz_view, name='quiz_detail'),
    path('<int:pk>/save/', save_quiz_view, name='save_quiz'),
    path('<int:pk>/data', quiz_data_view, name='quiz_detail_data'),
]
from django.urls import path
from apps.courses_app.views import (
    CoursesView, PythonView, PyOneView, PyTwoView, PyBankAccView,
    PyDataStructureListView, PyDataStructureDictView, PyAlgoAxisView, PyLogAnalyzerView, ThaiMainView,
    ThaiL1AView, ThaiL1BView, ThaiAlphabetView
)


app_name = 'courses_app'

urlpatterns = [
    path('', CoursesView.as_view(), name='courses'),
    path('python/', PythonView.as_view(), name='python'),
    path('python_one/', PyOneView.as_view(), name='python_one'),
    path('python_two/', PyTwoView.as_view(), name='python_two'),
    path('python_bankacc/', PyBankAccView.as_view(), name='python_bankacc'),
    path('python_data_structure_list/', PyDataStructureListView.as_view(), name='python_data_structure_list'),
    path('python_data_structure_dict/', PyDataStructureDictView.as_view(), name='python_data_structure_dict'),
    path('python_algo_axis/', PyAlgoAxisView.as_view(), name='python_algo_axis'),
    path('python_log_analyzer/', PyLogAnalyzerView.as_view(), name='python_log_analyzer'),
    path('thai/', ThaiMainView.as_view(), name='thai'),
    path('thai_l1a/', ThaiL1AView.as_view(), name='thai_l1a'),
    path('thai_l1b/', ThaiL1BView.as_view(), name='thai_l1b'),
    path('thai_alphabet/', ThaiAlphabetView.as_view(), name='thai_alphabet')
]

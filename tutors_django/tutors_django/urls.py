"""
URL configuration for tutors_django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from accounts_app.views import index_view, CoursesView, AboutView, NikitaView, LoginUser, RegisterUser, LogoutUser, StudentAccount, \
    TutorAccount, custom_404, privacy_view
# from quiz_app.views import PlacementA, PlacementB
from courses_app.views import add_lesson
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import RedirectView
from django.urls import include

from message_app.views import inquiry_form
from django.conf.urls.i18n import i18n_patterns

urlpatterns = [
    path('batumi-sloboda/', admin.site.urls),
    path('admin/', include('admin_honeypot.urls')),
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico', permanent=True)),
    path('', index_view, name='index'),
    path('courses/', CoursesView.as_view(), name='courses'),
    path('inquiry_sent/', inquiry_form, name='inquiry_form'),
    path('about/', AboutView.as_view(), name='about'),
    path('about/nikita', NikitaView.as_view(), name='about/nikita'),
    # path('course/<slug:slug>/', CourseDetail.as_view(), name='course_detail'),
    path('blog/', include('blog_app.urls', namespace='blog')),
    path('quiz/', include('quiz_app.urls', namespace='quiz')),
    path('add_lesson/', add_lesson, name='add_lesson'),
    path('log_in/', LoginUser.as_view(), name='log_in'),
    path('sign_up/', RegisterUser.as_view(), name='sign_up'),
    path('tinymce/', include('tinymce.urls')),
    path('student_account/<str:full_name>/', StudentAccount.as_view(), name='student_account'),
    path('tutor_account/<str:full_name>/', TutorAccount.as_view(), name='tutor_account'),
    path('log_out/', LogoutUser.as_view(), name='log_out'),
    path('privacy/', privacy_view, name='privacy'),
    path('dialogues/', include('message_app.urls', namespace='message')),
]
handler404 = custom_404

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

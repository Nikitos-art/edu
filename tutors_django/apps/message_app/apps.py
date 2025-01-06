from django.apps import AppConfig


class MessageAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.message_app'

    # def ready(self):
    #     import tutors_django.message_app.receivers
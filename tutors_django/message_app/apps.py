from django.apps import AppConfig


class MessageAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'message_app'

    def ready(self):
        import message_app.receivers
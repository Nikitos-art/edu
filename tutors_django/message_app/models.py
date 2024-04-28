from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone


class ChatManager(models.Manager):
    use_for_related_fields = True

    # Метод принимает пользователя, для которого должна производиться выборка
    # Если пользователь не добавлен, то будет возвращены все диалоги,
    # в которых хотя бы одно сообщение не прочитано
    def unread(self, user):
        qs = self.get_queryset().exclude(last_message__isnull=True).filter(last_message__is_readed=False)
        return qs.exclude(last_message__author=user) if user else qs


class Chat(models.Model):
    DIALOG = 'D'
    CHAT = 'C'
    CHAT_TYPE_CHOICES = (
        (DIALOG, 'Dialog'),
        (CHAT, 'Chat')
    )

    type = models.CharField(
        'Type',
        max_length=1,
        choices=CHAT_TYPE_CHOICES,
        default=DIALOG
    )
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, verbose_name="Participator")
    last_message = models.ForeignKey('Message', related_name='last_message', null=True, blank=True,
                                     on_delete=models.SET_NULL)

    objects = ChatManager()

    def get_absolute_url(self):
        return reverse('message_app:messages', kwargs={'chat_id': self.pk})


class Message(models.Model):
    chat = models.ForeignKey(Chat, verbose_name="Chat", on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="User", on_delete=models.CASCADE)
    message = models.TextField("Message")
    pub_date = models.DateTimeField('Message date', default=timezone.now)
    is_read = models.BooleanField('Read', default=False)

    class Meta:
        ordering = ['pub_date']

    def __str__(self):
        return self.message

class Inquiry(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
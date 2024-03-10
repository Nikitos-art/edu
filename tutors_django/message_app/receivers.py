from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Message


@receiver(post_save, sender=Message)
def post_save_comment(sender, instance, created, **kwargs):
    if created:
        instance.chat.last_message = instance
        instance.chat.save(update_fields=['last_message'])
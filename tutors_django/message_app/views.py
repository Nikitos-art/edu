
from django.core.mail import send_mail
from django.conf import settings
from .forms import InquiryForm
#######################################
from django.db.models import Count
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views import View
from message_app.forms import MessageForm
from message_app.models import Chat
from django.http import HttpResponse
############################## inquiry message #########################
from django_ratelimit.decorators import ratelimit


@ratelimit(key='user_or_ip', rate='3/m')
@ratelimit(key='user_or_ip', rate='5/10m')
@ratelimit(key='user_or_ip', rate='6/d')
def inquiry_form(request):
    if request.method == 'POST':
        form = InquiryForm(request.POST)
        if form.is_valid():
            # Get form data
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            time_zone = form.cleaned_data['time_zone']
            prefered_platform = form.cleaned_data['prefered_platform']
            message = form.cleaned_data['message']

            # Send an email
            subject = 'New Inquiry'
            message_body = f'Name: {name}\n' \
                           f'Email: {email}\n' \
                           f'Time Zone: {time_zone}\n' \
                           f'Prefered_Platform: {prefered_platform}\n' \
                           f'Message: {message}'
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = ['lighthouse.tutors.inquiry@gmail.com']  # Replace with your email address
            send_mail(subject, message_body, from_email, recipient_list)
            print('Message sent')
            return render(request, 'inq_sent.html')
        else:
            print('Message NOT sent:', form.errors)
            return HttpResponse('Form is not valid. Please check the form data.')
    else:
        print('Message NOT sent')
        form = InquiryForm()
    return render(request, 'index.html', {'form': form})


############################ message app ################################
class DialogsView(View):
    def get(self, request):
        if request.user.is_authenticated:
            chats = Chat.objects.filter(members__in=[request.user.id])
            return render(request, 'dialogues.html', {'user_profile': request.user, 'chats': chats})
        else:
            return render(request, '404.html')


class MessagesView(View):
    def get(self, request, chat_id):
        if request.user.is_authenticated:
            try:
                chat = Chat.objects.get(id=chat_id)
                user_chats = Chat.objects.filter(members__in=[request.user.id])

                members_except_current_user = chat.members.exclude(id=request.user.id)
                interlocutor = members_except_current_user.first() if members_except_current_user.exists() else None

                if request.user in chat.members.all():
                    chat.message_set.filter(is_read=False).exclude(author=request.user).update(is_read=True)
                else:
                    chat = None
                    interlocutor = None
                    user_chats = None
            except Chat.DoesNotExist:
                chat = None
                interlocutor = None
                user_chats = None

            return render(
                request,
                'messages.html',
                {
                    'user_profile': request.user,
                    'chat': chat,
                    'user_chats': user_chats,
                    'interlocutor': interlocutor,
                    'form': MessageForm()
                }
            )
        else:
            return render(request, '404.html')

    def post(self, request, chat_id):
        if request.user.is_authenticated:
            form = MessageForm(data=request.POST)
            if form.is_valid():
                message = form.save(commit=False)
                message.chat_id = chat_id
                message.author = request.user
                message.save()
            return redirect(reverse('message_app:messages', kwargs={'chat_id': chat_id}))
        else:
            return render(request, '404.html')


class CreateDialogView(View):
    def get(self, request, user_id):
        if request.user.is_authenticated:
            chats = Chat.objects.filter(
                members__in=[request.user.id, user_id], type=Chat.DIALOG
            ).annotate(c=Count('members')).filter(c=2)
            if chats.count() == 0:
                chat = Chat.objects.create()
                chat.members.add(request.user)
                chat.members.add(user_id)
            else:
                chat = chats.first()
            return redirect(reverse('message_app:messages', kwargs={'chat_id': chat.id}))
        else:
            return render(request, '404.html')

from django.forms import ModelForm, TextInput
from django import forms
from message_app.models import Message


class MessageForm(ModelForm):
    class Meta:
        model = Message
        fields = ['message']
        labels = {'message': ""}
        widgets = {
            'message': TextInput(attrs={
                'class': "form-control",
                'style': 'padding-bottom : 10px',
                'placeholder': 'Type the message'
                }),
        }


class InquiryForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    time_zone = forms.CharField(max_length=100)
    prefered_platform = forms.CharField(max_length=100)
    message = forms.CharField(widget=forms.Textarea)
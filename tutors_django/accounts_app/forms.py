from django import forms
from django.contrib.auth.forms import UserCreationForm
from accounts_app.models import UserAccount


class UserProfilePictureForm(forms.ModelForm):
    class Meta:
        model = UserAccount
        fields = ['avatar']


class RegisterUserForm(UserCreationForm):
    USER_ROLE = [
        ('tutor', 'Tutor'),
        ('student', 'Student'),
    ]
    full_name = forms.CharField(label='Name', widget=forms.TextInput(attrs={'class': 'form-input'}))
    email = forms.EmailField(label='Email', widget=forms.EmailInput(attrs={'class': 'form-input'}))
    user_role = forms.ChoiceField(
        label='Your role',
        widget=forms.Select(attrs={'class': 'form-select'}),
        choices=USER_ROLE
    )
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput(attrs={'class': 'form-input'}))
    password2 = forms.CharField(label='Password double check',
                                widget=forms.PasswordInput(attrs={'class': 'form-input'}))

    def save(self, commit=True):
        user = super(RegisterUserForm, self).save(commit=False)
        user.user_roles = self.cleaned_data['user_role']  
        if commit:
            user.save()
        return user

    class Meta:
        model = UserAccount
        fields = (
            'email',
            'full_name',
            'user_role',
            'password1',
            'password2',
            'agreed_with_policy')



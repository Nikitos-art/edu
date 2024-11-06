from django import forms
from .models import Post


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'status', 'image']
        widgets = {
            'content': forms.Textarea(attrs={'cols': 80, 'rows': 30}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control-file'})
        }

# class PostForm(forms.ModelForm):
#     class Meta:
#         model = Post
#         fields = ['title', 'content', 'status']
#         widgets = {'content': TinyMCE(attrs={'cols': 80, 'rows': 30})}
from django.views import generic
from .models import Post
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.shortcuts import redirect
from .forms import PostForm
from django.urls import reverse
from django.core.exceptions import PermissionDenied


# Create your views here.

class PostList(generic.ListView):
    queryset = Post.objects.filter(status=1).order_by('-created_on')
    template_name = 'blog.html'
    context_object_name = 'posts'


class PostDetail(generic.DetailView):
    model = Post
    template_name = 'blog_detail.html'
    context_object_name = 'post'


class BlogpostCreateView(LoginRequiredMixin, CreateView):
    template_name = 'blog_create.html'
    model = Post
    form_class = PostForm

    def dispatch(self, request, *args, **kwargs):
        if request.user.user_roles != "tutor":
            return redirect('/error')
        try:
            response = super().dispatch(request, *args, **kwargs)
            return response
        except TypeError:
            return redirect(reverse('tutor_account', args=[self.request.user.full_name]))

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        user = self.request.user
        return redirect(reverse('tutor_account', args=[user.full_name]))


class BlogpostEditView(LoginRequiredMixin, UpdateView):
    template_name = 'blog_edit.html'
    model = Post
    form_class = PostForm

    def dispatch(self, request, *args, **kwargs):
        if request.user.user_roles != "tutor":
            return redirect('/error')
        try:
            response = super().dispatch(request, *args, **kwargs)
            return response
        except TypeError:
            return redirect(reverse('tutor_account', args=[self.request.user.full_name]))

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not obj.author == self.request.user:
            raise PermissionDenied("You do not have permission to edit this post.")
        return obj

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        user = self.request.user
        return redirect(reverse('tutor_account', args=[user.full_name]))


class BlogpostDeleteView(LoginRequiredMixin, DeleteView):
    model = Post
    template_name = 'blog_delete.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.user_roles != "tutor":
            return redirect('/error')
        try:
            response = super().dispatch(request, *args, **kwargs)
            return response
        except TypeError:
            return redirect(reverse('tutor_account', args=[self.request.user.full_name]))

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not obj.author == self.request.user:
            raise PermissionDenied("You do not have permission to delete this post.")
        return obj

    def get_success_url(self):
        user = self.request.user
        return redirect(reverse('tutor_account', args=[user.full_name]))
from django.views import generic
from .models import Post
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import CreateView, UpdateView, DeleteView
from django.shortcuts import redirect, get_object_or_404
from .forms import PostForm
from django.urls import reverse
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse


# Create your views here.
class PostList(generic.ListView):
    queryset = Post.objects.filter(status=1).order_by('-created_on')
    template_name = 'blog.html'
    context_object_name = 'posts'


class PostDetail(generic.DetailView):
    model = Post
    template_name = 'blog_detail.html'
    context_object_name = 'post'

    def post(self, request, *args, **kwargs):
        post = get_object_or_404(Post, slug=self.kwargs.get('slug'))
        # Check if the user has already liked this post in the session
        liked_posts = request.session.get('liked_posts', [])

        if post.id not in liked_posts:
            post.likes += 1
            post.save()

            # Add this post to the session so the user cannot like it again
            liked_posts.append(post.id)
            request.session['liked_posts'] = liked_posts

            # Respond with JSON for AJAX requests
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'likes': post.likes})

        # Return the same JSON response without incrementing if already liked
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'likes': post.likes})

        # Fall back to standard detail view response if not AJAX
        return super().get(request, *args, **kwargs)


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
        print("Request FILES:", self.request.FILES)
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

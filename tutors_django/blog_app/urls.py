from django.urls import path
from blog_app.views import PostList, PostDetail, BlogpostCreateView, BlogpostEditView, BlogpostDeleteView


app_name = 'blog_app'

urlpatterns = [
    path('', PostList.as_view(), name='blog'),
    path('create_blogpost/', BlogpostCreateView.as_view(), name='create_blogpost'),
    path('update_blogpost/<int:pk>/', BlogpostEditView.as_view(), name='update_blogpost'),
    path('delete_blogpost/<int:pk>/', BlogpostDeleteView.as_view(), name='delete_blogpost'),
    path('<slug:slug>/', PostDetail.as_view(), name='post_detail'),
]
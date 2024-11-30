from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from courses_app import urls as courses_urls
from games import urls as games_urls
from blog_app import urls as blog_urls
from quiz_app.models import Quiz
from blog_app.models import Post


class StaticViewSitemap(Sitemap):
    def items(self):
        return ['index', 'blog_app:blog', 'quiz_app:quiz', 'about', 'log_in', 'sign_up']  

    def location(self, item):
        return reverse(item)


class CoursesAppSitemap(Sitemap):
    def items(self):
        return [url.name for url in courses_urls.urlpatterns if url.name]

    def location(self, item):
        return reverse(f'courses_app:{item}')


class GamesAppSitemap(Sitemap):
    def items(self):
        # Fetch all named URLs in games.urls
        return [url.name for url in games_urls.urlpatterns if url.name]

    def location(self, item):
        return reverse(f'games:{item}')


class BlogAppSitemap(Sitemap):
    def items(self):
        return Post.objects.all()  # Include only public blog post detail pages

    def location(self, item):
        return reverse('blog_app:post_detail', kwargs={'slug': item.slug})

    def lastmod(self, item):
        return item.created_at if hasattr(item, 'created_at') else None


class QuizAppSitemap(Sitemap):
    def items(self):
        # Handle static URLs plus dynamic quiz-related URLs
        static_urls = [
            'quiz',  # Static views in quiz_app
        ]
        dynamic_quizzes = Quiz.objects.all()  # For dynamic quiz-related URLs
        return static_urls + list(dynamic_quizzes)

    def location(self, item):
        if isinstance(item, str):  # Static URLs
            return reverse(f'quiz_app:{item}')
        return reverse('quiz_app:quiz_detail', kwargs={'pk': item.pk})  # Dynamic quizzes

    def lastmod(self, item):
        return None  # Since Quiz model has no updated_at field, return None for lastmod

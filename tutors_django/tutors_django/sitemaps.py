from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from courses_app import urls as courses_urls
from games import urls as games_urls
# from blog_app import urls as blog_urls
from quiz_app.models import Quiz
from blog_app.models import Post


class StaticViewSitemap(Sitemap):
    def items(self):
        return ['index', 'about', 'log_in', 'sign_up']

    def location(self, item):
        return reverse(item)


class CoursesAppSitemap(Sitemap):
    def items(self):
        return [url.name for url in courses_urls.urlpatterns if url.name]

    def location(self, item):
        return reverse(f'courses_app:{item}')


class GamesAppSitemap(Sitemap):
    def items(self):
        return [url.name for url in games_urls.urlpatterns if url.name]

    def location(self, item):
        return reverse(f'games:{item}')


class BlogAppSitemap(Sitemap):
    def items(self):
        static_urls = ['blog_app:blog']
        dynamic_posts = Post.objects.all()
        return list(static_urls) + list(dynamic_posts)

    def location(self, item):
        if isinstance(item, str):
            return reverse(item)
        return reverse('blog_app:post_detail', kwargs={'slug': item.slug})

    def lastmod(self, item):
        return item.created_on if hasattr(item, 'created_on') else None


class QuizAppSitemap(Sitemap):
    def items(self):
        static_urls = ['quiz_app:quiz']
        dynamic_quizzes = Quiz.objects.all()
        return list(static_urls) + list(dynamic_quizzes)

    def location(self, item):
        if isinstance(item, str):
            return reverse(item)
        return reverse('quiz_app:quiz_detail', kwargs={'pk': item.pk})

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR.parent / '.env')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

INSTALLED_APPS = [
    "admin_interface",
    "colorfield",
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    'apps.accounts_app',
    'apps.blog_app',
    'apps.quiz_app',
    'apps.courses_app',
    'apps.message_app',
    'apps.games',
    'login_history',
    'channels',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_auto_logout.middleware.auto_logout',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            # 'apps.account_app/templates',
            # 'apps.blog_app/templates',
            # 'apps.games/templates',
            # 'apps.courses_app/templates'
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django_auto_logout.context_processors.auto_logout_client',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_APP_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('EMAIL')

# Database configuration (to be overridden in specific environments)
DATABASES = {
     'default': {
         'ENGINE': 'django.db.backends.postgresql_psycopg2',
         'NAME': os.environ.get('PSQL_DB_NAME'),
         'USER': os.environ.get('PSQL_USER'),
         'PASSWORD': os.environ.get('PSQL_PSWD'),
         ##'HOST': 'localhost',
         'HOST': os.environ.get('DB_HOST', 'db'),
         'PORT': '',
     }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Bangkok'
USE_I18N = True
USE_TZ = True

# Static and Media files
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR / 'apps/quiz_app/static'),
    os.path.join(BASE_DIR / 'apps/games/static'),
    os.path.join(BASE_DIR / 'apps/courses_app/static'),
]


MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Authentication
AUTH_USER_MODEL = 'accounts_app.UserAccount'

# Auto logout settings
AUTO_LOGOUT = {
    'IDLE_TIME': 1800,
    'REDIRECT_TO_LOGIN_IMMEDIATELY': True,
    'MESSAGE': 'The session has expired. Please login again to continue.',
}

# CSRF and CORS
CSRF_TRUSTED_ORIGINS = [
    'https://www.lighthouse-tutors.com',
    'https://lighthouse-tutors.com',
]

CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

ASGI_APPLICATION = 'config.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

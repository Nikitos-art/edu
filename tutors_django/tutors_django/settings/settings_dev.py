from .settings_base import *

DEBUG = True

STATICFILES_DIRS = [
    os.path.join(BASE_DIR / 'quiz_app/static'),
    os.path.join(BASE_DIR / 'games/static'),
]

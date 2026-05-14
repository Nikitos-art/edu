from .settings_base import *
import os


STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
ALLOWED_HOSTS = ["*"]

DEBUG = True

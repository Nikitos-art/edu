"""
WSGI config for tutors_django project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

# from pathlib import Path
# from dotenv import load_dotenv

# BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
# load_dotenv(BASE_DIR.parent / '.env')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', os.environ['DJANGO_SETTINGS_MODULE'])

application = get_wsgi_application()

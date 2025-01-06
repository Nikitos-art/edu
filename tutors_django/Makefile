# Makefile

# Default environment variables
ENV_FILE = .env

# Virtual environment setup
install:
	poetry install

# Run the Django development server
runserver:
	poetry run python manage.py runserver

daphne:
	poetry run daphne -b 127.0.0.1 -p 8001 config.asgi:application

# Run Django migrations
migrate:
	poetry run python manage.py migrate

# Collect static files
collectstatic:
	poetry run python manage.py collectstatic --noinput

# Run tests
test:
	poetry run python manage.py test

# Lint the code (using flake8 as an example)
lint:
	poetry run flake8 .

# Clean up pyc files
clean:
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

# Load environment variables from the .env file
export:
	set -o allexport; source $(ENV_FILE); set +o allexport

# Makefile

# Default environment file
ENV_FILE = .env

# Build and run the project with docker-compose (using your custom YAML file)
build:
	docker-compose -f docker-compose.dev.yml up --build -d

build_no_cache:
	docker-compose -f docker-compose.dev.yml build --no-cache

up:
	docker-compose -f docker-compose.dev.yml up -d

# Stop and remove containers
down:
	docker-compose -f docker-compose.dev.yml down

remove_orphans:
	docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans

# Restart containers
restart:
	docker-compose -f docker-compose.dev.yml down && docker-compose -f docker-compose.dev.yml up -d

# Run Django migrations inside the container
migrate:
	docker-compose -f docker-compose.dev.yml exec web poetry run python manage.py migrate

# Collect static files inside the container
collectstatic:
	docker-compose -f docker-compose.dev.yml exec web poetry run python manage.py collectstatic --noinput

# Run tests inside the container
test:
	docker-compose -f docker-compose.dev.yml exec web poetry run python manage.py test

# Open a Django shell inside the container
shell:
	docker-compose -f docker-compose.dev.yml exec web poetry run python manage.py shell

# Run a Bash shell inside the container
bash:
	docker-compose -f docker-compose.dev.yml exec web /bin/bash


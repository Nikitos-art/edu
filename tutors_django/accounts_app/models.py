from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

class UserAccountManager(BaseUserManager):
    def create_user(self, email, agreed_with_policy, password=None, **extra_fields):
        try:
            validate_email(email)
        except ValidationError as e:
            raise ValueError('Invalid email address.') from e

        if not agreed_with_policy:
            raise ValueError('Users have to agree with our Privacy Policy to use our website.')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superusers must be assigned is_staff=True")

        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superusers must be assigned is_superuser=True")

        return self.create_user(email, agreed_with_policy=True, password=password, **extra_fields)


class UserAccount(AbstractBaseUser, PermissionsMixin):
    USER_ROLES = [
        ('tutor', 'Tutor'),
        ('student', 'Student'),
    ]
    email = models.EmailField(max_length=63, unique=True)
    full_name = models.CharField(max_length=63, blank=True)
    agreed_with_policy = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    user_roles = models.CharField(max_length=10, choices=USER_ROLES, null=False)
    avatar = models.ImageField(upload_to='user_images/', blank=True, null=True)
    about = models.CharField(max_length=1000, blank=True, null=True)

    objects = UserAccountManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.email

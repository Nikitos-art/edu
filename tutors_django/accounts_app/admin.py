from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserAccount


# Register your models here.
class UserAccountAdmin(UserAdmin):
    list_display = ('email', 'full_name', 'agreed_with_policy',
                    'user_roles', 'is_active', 'is_staff', 'is_superuser')
    list_filter = ('is_active', 'user_roles')
    search_fields = ('email', 'full_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {
         'fields': ('full_name', 'user_roles', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important Dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('full_name', 'email', 'password1', 'password2', 'user_roles'),
        }),
    )


admin.site.register(UserAccount, UserAccountAdmin)

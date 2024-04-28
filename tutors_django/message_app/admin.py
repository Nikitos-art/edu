from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Chat, Message, Inquiry

class MessageInline(admin.TabularInline):
    model = Message
    extra = 1

class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'get_members', 'last_message', 'get_absolute_url')
    list_filter = ('type',)
    inlines = [MessageInline]

    def get_members(self, obj):
        return ", ".join([str(member) for member in obj.members.all()])

    get_members.short_description = 'Members'

admin.site.register(Chat, ChatAdmin)

class MessageAdmin(admin.ModelAdmin):
    list_display = ('chat', 'author', 'message', 'pub_date', 'is_read')
    list_filter = ('is_read',)
    search_fields = ('chat__id', 'author__username', 'message')

admin.site.register(Message, MessageAdmin)

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'message')
    search_fields = ('name', 'email')


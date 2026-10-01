from django.contrib import admin

from .models import Achievement, Certification, ContactMessage, Education, Experience, PortfolioProfile, Project, Service, Skill, Testimonial


@admin.register(PortfolioProfile)
class PortfolioProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "email", "available_for_work", "updated_at")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_featured", "is_published", "sort_order")
    list_filter = ("category", "is_published", "is_featured")
    search_fields = ("title", "summary", "description")
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("sort_order", "title")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "proficiency", "is_published", "sort_order")
    list_filter = ("category", "is_published")
    search_fields = ("name",)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("subject", "name", "email", "message")
    readonly_fields = ("name", "email", "subject", "message", "created_at")
    actions = ("mark_as_read",)

    @admin.action(description="Mark selected messages as read")
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)


for model in (Education, Certification, Experience, Achievement, Service, Testimonial):
    admin.site.register(model)

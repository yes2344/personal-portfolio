from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class OrderedPublishedModel(models.Model):
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ("sort_order", "-created_at")


class PortfolioProfile(models.Model):
    name = models.CharField(max_length=120)
    title = models.CharField(max_length=240)
    biography = models.TextField()
    career_objective = models.TextField(blank=True)
    email = models.EmailField()
    linkedin_email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    telegram_url = models.URLField(blank=True)
    location = models.CharField(max_length=120, blank=True)
    photo_url = models.URLField(blank=True)
    resume_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    available_for_work = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Skill(OrderedPublishedModel):
    class Category(models.TextChoices):
        FRONTEND = "frontend", "Frontend"
        BACKEND = "backend", "Backend"
        DATABASE = "database", "Database"
        TOOLS = "tools", "Tools"

    name = models.CharField(max_length=80)
    category = models.CharField(max_length=20, choices=Category.choices)
    proficiency = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])

    def __str__(self):
        return self.name


class Project(OrderedPublishedModel):
    class Category(models.TextChoices):
        WEB = "web", "Web"
        AI = "ai", "AI"
        OTHER = "other", "Other"

    title = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    summary = models.CharField(max_length=280)
    description = models.TextField()
    image_url = models.URLField(blank=True)
    image_alt = models.CharField(max_length=180, blank=True)
    tech_stack = models.JSONField(default=list, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.WEB)
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Education(OrderedPublishedModel):
    institution = models.CharField(max_length=180)
    degree = models.CharField(max_length=160)
    field_of_study = models.CharField(max_length=160, blank=True)
    start_year = models.PositiveSmallIntegerField(null=True, blank=True)
    end_year = models.PositiveSmallIntegerField(null=True, blank=True)
    gpa = models.CharField(max_length=30, blank=True)
    description = models.TextField(blank=True)
    achievements = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.degree} — {self.institution}"


class Certification(OrderedPublishedModel):
    name = models.CharField(max_length=180)
    issuer = models.CharField(max_length=140)
    issued_on = models.DateField(null=True, blank=True)
    credential_url = models.URLField(blank=True)

    def __str__(self):
        return self.name


class Experience(OrderedPublishedModel):
    organization = models.CharField(max_length=180)
    role = models.CharField(max_length=160)
    location = models.CharField(max_length=120, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    summary = models.TextField()
    achievements = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.role} — {self.organization}"


class Achievement(OrderedPublishedModel):
    title = models.CharField(max_length=180)
    description = models.TextField()
    achieved_on = models.DateField(null=True, blank=True)
    url = models.URLField(blank=True)

    def __str__(self):
        return self.title


class Service(OrderedPublishedModel):
    title = models.CharField(max_length=140)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.title


class Testimonial(OrderedPublishedModel):
    author = models.CharField(max_length=120)
    role = models.CharField(max_length=140, blank=True)
    organization = models.CharField(max_length=140, blank=True)
    quote = models.TextField()
    avatar_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.author} — {self.organization}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254)
    subject = models.CharField(max_length=180)
    message = models.TextField(max_length=5000)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.subject} — {self.name}"

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Achievement, Certification, ContactMessage, Education, Experience, PortfolioProfile, Project, Service, Skill, Testimonial


class StaffTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_staff or not self.user.is_active:
            raise serializers.ValidationError("Admin access is required.")
        return data


class PortfolioProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProfile
        fields = ("id", "name", "title", "biography", "career_objective", "email", "linkedin_email", "phone", "telegram_url", "location", "photo_url", "resume_url", "github_url", "linkedin_url", "available_for_work", "updated_at")
        read_only_fields = ("id", "updated_at")


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ("id", "name", "category", "proficiency", "sort_order", "is_published")


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "title", "slug", "summary", "description", "image_url", "image_alt", "tech_stack", "category", "github_url", "live_url", "is_featured", "sort_order", "is_published", "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at")


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ("id", "institution", "degree", "field_of_study", "start_year", "end_year", "gpa", "description", "achievements", "sort_order", "is_published")


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ("id", "name", "issuer", "issued_on", "credential_url", "sort_order", "is_published")


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ("id", "organization", "role", "location", "start_date", "end_date", "is_current", "summary", "achievements", "sort_order", "is_published")


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ("id", "title", "description", "achieved_on", "url", "sort_order", "is_published")


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ("id", "title", "description", "icon", "sort_order", "is_published")


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ("id", "author", "role", "organization", "quote", "avatar_url", "sort_order", "is_published")


class ContactMessageSerializer(serializers.ModelSerializer):
    website = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=200)

    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "subject", "message", "is_read", "created_at", "website")
        read_only_fields = ("id", "is_read", "created_at")

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Invalid submission.")
        return value

    def create(self, validated_data):
        validated_data.pop("website", None)
        return super().create(validated_data)

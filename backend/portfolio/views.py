import logging

from django.conf import settings
from django.core.mail import EmailMessage
from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Achievement, Certification, ContactMessage, Education, Experience, PortfolioProfile, Project, Service, Skill, Testimonial
from .permissions import PublicCreateOrStaff, PublicReadOnlyOrStaff
from .serializers import AchievementSerializer, CertificationSerializer, ContactMessageSerializer, EducationSerializer, ExperienceSerializer, PortfolioProfileSerializer, ProjectSerializer, ServiceSerializer, SkillSerializer, StaffTokenObtainPairSerializer, TestimonialSerializer

logger = logging.getLogger(__name__)


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = StaffTokenObtainPairSerializer


class ContactRateThrottle(AnonRateThrottle):
    scope = "contact"


class PublishedContentViewSet(viewsets.ModelViewSet):
    permission_classes = (PublicReadOnlyOrStaff,)

    def get_queryset(self):
        queryset = self.queryset
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        return queryset


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = PortfolioProfile.objects.all().order_by("-updated_at")
    serializer_class = PortfolioProfileSerializer
    permission_classes = (PublicReadOnlyOrStaff,)


class ProjectViewSet(PublishedContentViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = "slug"
    search_fields = ("title", "summary", "description")
    ordering_fields = ("sort_order", "created_at", "title")


class SkillViewSet(PublishedContentViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    filterset_fields = ("category",)


class EducationViewSet(PublishedContentViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class CertificationViewSet(PublishedContentViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer


class ExperienceViewSet(PublishedContentViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer


class AchievementViewSet(PublishedContentViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer


class ServiceViewSet(PublishedContentViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class TestimonialViewSet(PublishedContentViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = (PublicCreateOrStaff,)
    throttle_classes = (ContactRateThrottle,)
    http_method_names = ("get", "post", "patch", "delete", "head", "options")

    def perform_create(self, serializer):
        contact = serializer.save()
        recipient = settings.CONTACT_NOTIFICATION_EMAIL
        if not recipient:
            return
        notification = EmailMessage(
            subject=f"Portfolio contact: {contact.subject}",
            body=f"From: {contact.name} <{contact.email}>\n\n{contact.message}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=(recipient,),
            reply_to=(contact.email,),
        )
        try:
            notification.send(fail_silently=False)
        except Exception:
            logger.exception("Contact notification email failed for message %s", contact.pk)


class DashboardStatsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        month_rows = ContactMessage.objects.annotate(month=TruncMonth("created_at")).values("month").annotate(total=Count("id")).order_by("month")
        months = [{"month": row["month"].strftime("%Y-%m"), "total": row["total"]} for row in list(month_rows)[-12:]]
        return Response({
            "projects": Project.objects.filter(is_published=True).count(),
            "skills": Skill.objects.filter(is_published=True).count(),
            "certifications": Certification.objects.filter(is_published=True).count(),
            "unread_messages": ContactMessage.objects.filter(is_read=False).count(),
            "messages_by_month": months,
            "recent_messages": ContactMessageSerializer(ContactMessage.objects.all()[:5], many=True).data,
        })

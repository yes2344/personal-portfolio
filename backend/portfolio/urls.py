from rest_framework.routers import DefaultRouter

from .views import AchievementViewSet, CertificationViewSet, ContactMessageViewSet, EducationViewSet, ExperienceViewSet, ProfileViewSet, ProjectViewSet, ServiceViewSet, SkillViewSet, TestimonialViewSet

router = DefaultRouter()
router.register("profile", ProfileViewSet, basename="profile")
router.register("projects", ProjectViewSet, basename="project")
router.register("skills", SkillViewSet, basename="skill")
router.register("education", EducationViewSet, basename="education")
router.register("certifications", CertificationViewSet, basename="certification")
router.register("experience", ExperienceViewSet, basename="experience")
router.register("achievements", AchievementViewSet, basename="achievement")
router.register("services", ServiceViewSet, basename="service")
router.register("testimonials", TestimonialViewSet, basename="testimonial")
router.register("contact-messages", ContactMessageViewSet, basename="contact-message")

urlpatterns = router.urls

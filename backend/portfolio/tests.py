from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APITestCase

from .models import ContactMessage, Education, PortfolioProfile, Project, Skill


class PublicPortfolioApiTests(APITestCase):
    def test_seed_command_creates_profile_projects_and_skills_idempotently(self):
        Project.objects.create(
            title="Legacy SachaBot",
            slug="sachatbot",
            summary="Existing project",
            description="Existing project details.",
            image_url="/projects/sachatbot.jpg",
            image_alt="Stock image",
        )
        call_command("seed_portfolio")
        call_command("seed_portfolio")

        self.assertEqual(PortfolioProfile.objects.get(pk=1).email, "shumetyeserah60@gmail.com")
        self.assertEqual(Project.objects.count(), 4)
        self.assertEqual(Skill.objects.count(), 12)
        self.assertEqual(Education.objects.count(), 1)
        self.assertEqual(Project.objects.get(slug="sachatbot").image_url, "")
        response = self.client.get("/api/v1/profile/")
        public_profile = response.data["results"][0]
        self.assertEqual(public_profile["phone"], "+251923442839")
        self.assertEqual(public_profile["linkedin_email"], "shumetyeserah8@gmail.com")

    def test_published_projects_are_public_and_unpublished_projects_are_hidden(self):
        Project.objects.create(title="Public", slug="public", summary="Public project", description="Details")
        Project.objects.create(title="Private", slug="private", summary="Private project", description="Details", is_published=False)

        response = self.client.get("/api/v1/projects/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["slug"] for item in response.data["results"]], ["public"])

    def test_public_clients_can_create_contact_messages(self):
        response = self.client.post("/api/v1/contact-messages/", {
            "name": "Ada Example", "email": "ada@example.com", "subject": "Hello",
            "message": "I would like to discuss a project.", "website": "",
        }, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_honeypot_rejects_filled_submissions(self):
        response = self.client.post("/api/v1/contact-messages/", {
            "name": "Bot", "email": "bot@example.com", "subject": "Spam",
            "message": "Automated message content.", "website": "https://spam.example",
        }, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_project_search_filters_public_results(self):
        Project.objects.create(title="University Chatbot", slug="chatbot", summary="Campus answers", description="Student assistant")
        Project.objects.create(title="Property Manager", slug="properties", summary="Rental workflow", description="Property system")

        response = self.client.get("/api/v1/projects/?search=chatbot")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["slug"] for item in response.data["results"]], ["chatbot"])

    def test_contact_inbox_requires_staff_authentication(self):
        self.assertEqual(self.client.get("/api/v1/contact-messages/").status_code, 401)

    def test_staff_can_create_content(self):
        user = get_user_model().objects.create_user(username="admin", password="A-long-test-password-123", is_staff=True)
        self.client.force_authenticate(user)

        response = self.client.post("/api/v1/skills/", {"name": "Python", "category": "backend", "proficiency": 85}, format="json")

        self.assertEqual(response.status_code, 201)

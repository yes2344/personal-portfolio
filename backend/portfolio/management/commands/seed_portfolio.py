from django.core.management.base import BaseCommand

from portfolio.models import Education, PortfolioProfile, Project, Skill


PROFILE = {
    "name": "Shumet Yeserah",
    "title": "Computer Science Graduate | Full Stack Developer | AI Enthusiast",
    "biography": "Computer Science graduate from the University of Gondar, interested in software engineering, web development, and applied AI.",
    "career_objective": "Looking for opportunities to contribute to thoughtful software products and grow as a full stack developer.",
    "email": "shumetyeserah60@gmail.com",
    "linkedin_email": "shumetyeserah8@gmail.com",
    "phone": "+251923442839",
    "github_url": "https://github.com/yes2344",
    "telegram_url": "https://t.me/yes2344",
    "available_for_work": True,
}

PROJECTS = [
    {
        "slug": "sachatbot",
        "title": "SachaBot — University Chatbot",
        "summary": "A chatbot project for university information and student questions.",
        "description": "SachaBot is a conversational university project designed to help students find useful campus information.",
        "image_alt": "",
        "image_url": "",
        "tech_stack": ["Chatbot", "University project"],
        "category": Project.Category.AI,
        "github_url": "https://github.com/yes2344/SACHATBOT",
        "is_featured": True,
        "sort_order": 0,
    },
    {
        "slug": "church-management-system",
        "title": "Church Management System",
        "summary": "A management system for church information and administration.",
        "description": "A central workspace for church information and administrative tasks.",
        "image_alt": "",
        "image_url": "",
        "tech_stack": [],
        "category": Project.Category.WEB,
        "github_url": "https://github.com/yes2344/church",
        "is_featured": True,
        "sort_order": 1,
    },
    {
        "slug": "house-sales-rental-management",
        "title": "House Sales & Rental Management System",
        "summary": "A system for organizing properties offered for sale and rent.",
        "description": "A property management project for homes offered for sale or rent.",
        "image_alt": "",
        "image_url": "",
        "tech_stack": [],
        "category": Project.Category.WEB,
        "github_url": "https://github.com/yes2344/house-sales-rental-management",
        "is_featured": True,
        "sort_order": 2,
    },
    {
        "slug": "personal-portfolio",
        "title": "Personal Portfolio",
        "summary": "A personal portfolio for selected software projects and contact details.",
        "description": "This responsive portfolio pairs a React frontend with a Django REST API, PostgreSQL-ready models, and a staff content dashboard.",
        "image_alt": "",
        "image_url": "",
        "tech_stack": ["React", "TypeScript", "Django REST", "PostgreSQL"],
        "category": Project.Category.WEB,
        "github_url": "https://github.com/yes2344/personal-portfolio",
        "is_featured": True,
        "sort_order": 3,
    },
]

SKILLS = [
    ("React", Skill.Category.FRONTEND),
    ("HTML", Skill.Category.FRONTEND),
    ("CSS", Skill.Category.FRONTEND),
    ("JavaScript", Skill.Category.FRONTEND),
    ("Django", Skill.Category.BACKEND),
    ("Python", Skill.Category.BACKEND),
    ("REST API", Skill.Category.BACKEND),
    ("PostgreSQL", Skill.Category.DATABASE),
    ("MySQL", Skill.Category.DATABASE),
    ("Git", Skill.Category.TOOLS),
    ("GitHub", Skill.Category.TOOLS),
    ("VS Code", Skill.Category.TOOLS),
]


class Command(BaseCommand):
    help = "Create the initial editable portfolio profile, projects, education, and skills."

    def handle(self, *args, **options):
        PortfolioProfile.objects.get_or_create(pk=1, defaults=PROFILE)
        Education.objects.get_or_create(
            institution="University of Gondar",
            degree="Bachelor of Science in Computer Science",
            defaults={"description": "Computer Science degree."},
        )
        for project in PROJECTS:
            record, created = Project.objects.get_or_create(
                slug=project["slug"], defaults=project
            )
            if not created:
                changed_fields = []
                if record.image_url in {
                    "/projects/sachatbot.jpg",
                    "/projects/church-management.jpg",
                    "/projects/house-management.jpg",
                    "/projects/portfolio.jpg",
                }:
                    record.image_url = ""
                    record.image_alt = ""
                    changed_fields.extend(("image_url", "image_alt"))
                if changed_fields:
                    record.save(update_fields=changed_fields)
        for order, (name, category) in enumerate(SKILLS):
            Skill.objects.get_or_create(
                name=name,
                category=category,
                defaults={"proficiency": 70, "sort_order": order},
            )
        self.stdout.write(self.style.SUCCESS("Initial portfolio content is ready to edit in Django admin."))

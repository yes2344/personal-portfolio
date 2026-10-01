import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Check,
  Code2,
  Database,
  Download,
  Code2 as Github,
  GraduationCap,
  Layers3,
  Mail,
  Menu,
  Moon,
  Phone,
  Send,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import "./portfolio.css";

type Project = {
  title: string;
  type: string;
  description: string;
  details: string;
  tags: string[];
  category: string;
  image: string;
  alt: string;
  github: string;
  demo: string;
};

const API_BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(
      /\/$/,
      "",
    )
  : "https://personal-portfolio-fym4.onrender.com/api/v1";

const fallbackProjects: Project[] = [
  {
    title: "SachaBot — University Chatbot",
    type: "AI · Education",
    description:
      "A university chatbot project for answering student questions and sharing campus information.",
    details:
      "SachaBot is a conversational university project designed to help students find useful campus information.",
    tags: ["SachaBot", "University", "Chatbot"],
    category: "AI",
    image: "",
    alt: "Laptop displaying a collaborative digital workspace",
    github: "https://github.com/yes2344/SACHATBOT",
    demo: "#contact",
  },
  {
    title: "Church Management System",
    type: "Full Stack · Operations",
    description:
      "A management system for church information and administration.",
    details:
      "A central workspace for church information and administrative tasks.",
    tags: ["Church management", "Administration"],
    category: "Web",
    image: "",
    alt: "Illustrative modern building facade",
    github: "https://github.com/yes2344/church",
    demo: "#contact",
  },
  {
    title: "House Sales & Rental Management System",
    type: "Full Stack · Property",
    description:
      "A system for organizing properties offered for sale and rent.",
    details:
      "A property management project for homes offered for sale or rent.",
    tags: ["Property sales", "Rental management"],
    category: "Web",
    image: "",
    alt: "Residential properties in an urban neighborhood",
    github: "https://github.com/yes2344/house-sales-rental-management",
    demo: "#contact",
  },
  {
    title: "Personal Portfolio",
    type: "Web · Personal",
    description:
      "A fast, accessible home for selected work, technical interests, and ways to get in touch.",
    details:
      "A responsive personal portfolio with a React frontend, Django REST API, PostgreSQL-ready data model, and staff dashboard.",
    tags: ["React", "TypeScript", "Django", "PostgreSQL"],
    category: "Web",
    image: "",
    alt: "Developer workspace with a laptop and code editor",
    github: "https://github.com/yes2344/personal-portfolio",
    demo: "#contact",
  },
];
const fallbackSkills = [
  { name: "React", level: 86, group: "Frontend", icon: Code2 },
  { name: "JavaScript", level: 84, group: "Frontend", icon: Code2 },
  { name: "HTML & CSS", level: 90, group: "Frontend", icon: Layers3 },
  { name: "Python", level: 86, group: "Backend", icon: Code2 },
  { name: "Django / REST", level: 80, group: "Backend", icon: Code2 },
  { name: "PostgreSQL", level: 76, group: "Data", icon: Database },
];
type Profile = {
  name: string;
  title: string;
  biography: string;
  career_objective: string;
  email: string;
  phone: string;
  location: string;
  telegram_url: string;
  linkedin_email: string;
  github_url: string;
  linkedin_url: string;
  photo_url: string;
  resume_url: string;
  available_for_work: boolean;
};
const fallbackProfile: Profile = {
  name: "Shumet Yeserah",
  title: "Computer Science Graduate | Full Stack Developer | AI Enthusiast",
  biography:
    "Computer Science graduate from the University of Gondar, interested in software engineering, web development, and applied AI.",
  career_objective:
    "Looking for opportunities to contribute to thoughtful software products and grow as a full stack developer.",
  email: "shumetyeserah60@gmail.com",
  phone: "+251923442839",
  location: "",
  telegram_url: "https://t.me/yes2344",
  linkedin_email: "shumetyeserah8@gmail.com",
  github_url: "https://github.com/yes2344",
  linkedin_url: "",
  photo_url: "",
  resume_url: "/cv.pdf",
  available_for_work: true,
};
const navItems = [
  ["About", "#about"],
  ["Work", "#projects"],
  ["Skills", "#skills"],
  ["Journey", "#journey"],
  ["Contact", "#contact"],
];
const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

function Heading({
  index,
  label,
  title,
  detail,
}: {
  index: string;
  label: string;
  title: ReactNode;
  detail?: string;
}) {
  return (
    <motion.div
      className="section-heading"
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <span className="section-index">
        {index} / {label}
      </span>
      <div className="heading-row">
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
    </motion.div>
  );
}

function PortfolioPage() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("portfolio-theme") || "dark",
  );
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [projects, setProjects] = useState(fallbackProjects);
  const [skills, setSkills] = useState(fallbackSkills);
  const [profile, setProfile] = useState(fallbackProfile);
  const [education, setEducation] = useState<Record<string, unknown>[]>([]);
  const [experience, setExperience] = useState<Record<string, unknown>[]>([]);
  const [certifications, setCertifications] = useState<Record<string, unknown>[]>([]);
  const [achievements, setAchievements] = useState<Record<string, unknown>[]>([]);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [testimonials, setTestimonials] = useState<Record<string, unknown>[]>([]);
  const profileRoles = profile.title
    .split(/[|·]/)
    .map((role) => role.trim())
    .filter(Boolean);
  const skillGroups = useMemo(
    () =>
      [...new Set(skills.map((skill) => skill.group))].map((group) => [
        group,
        ...skills
          .filter((skill) => skill.group === group)
          .map((skill) => skill.name),
      ]),
    [skills],
  );
  const socialLinks = [
    ...(profile.github_url
      ? [{ label: "GitHub", href: profile.github_url, icon: Github }]
      : []),
    ...(profile.telegram_url
      ? [{ label: "Telegram", href: profile.telegram_url, icon: Send }]
      : []),
    ...(profile.linkedin_url
      ? [{ label: "LinkedIn", href: profile.linkedin_url, icon: AtSign }]
      : profile.linkedin_email
        ? [{
            label: "LinkedIn contact email",
            href: `mailto:${profile.linkedin_email}`,
            icon: AtSign,
          }]
        : []),
    ...(profile.email
      ? [{ label: "Email", href: `mailto:${profile.email}`, icon: Mail }]
      : []),
  ];

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.title = `${profile.name} — ${profile.title}`;
  }, [profile.name, profile.title]);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(
      () => setRoleIndex((i) => (i + 1) % Math.max(profileRoles.length, 1)),
      2600,
    );
    return () => window.clearInterval(timer);
  }, [profileRoles.length]);
  useEffect(() => {
    document.body.style.overflow = selected || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected, menuOpen]);
  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled)",
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    modalRef.current?.querySelector<HTMLButtonElement>(".modal-close")?.focus();
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [selected]);
  useEffect(() => {
    const controller = new AbortController();
    const rows = <T,>(data: T[] | { results?: T[] }) =>
      Array.isArray(data) ? data : data.results || [];
    void fetch(`${API_BASE_URL}/projects/`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as
          | Record<string, unknown>[]
          | { results?: Record<string, unknown>[] };
        const items = rows(data);
        setProjects(
            items.map((item) => ({
              title: String(item.title || "Project"),
              type: `${String(item.category || "web").toUpperCase()} · PROJECT`,
              description: String(item.summary || ""),
              details: String(item.description || item.summary || ""),
              tags: Array.isArray(item.tech_stack)
                ? item.tech_stack.map(String)
                : [],
              category:
                String(item.category || "web").toLowerCase() === "ai"
                  ? "AI"
                  : "Web",
              image: String(item.image_url || ""),
              alt: String(item.image_alt || item.title || "Project preview"),
              github: String(item.github_url || "#contact"),
              demo: String(item.live_url || "#contact"),
            })),
          );
      })
      .catch(() => undefined);
    void fetch(`${API_BASE_URL}/profile/`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as
          | Record<string, unknown>[]
          | { results?: Record<string, unknown>[] };
        const item = rows(data)[0];
        if (!item) return;
        setProfile({
          ...fallbackProfile,
          name: String(item.name || fallbackProfile.name),
          title: String(item.title || fallbackProfile.title),
          biography: String(item.biography || fallbackProfile.biography),
          career_objective: String(
            item.career_objective || fallbackProfile.career_objective,
          ),
          email: String(item.email || ""),
          phone: String(item.phone || ""),
          location: String(item.location || ""),
          telegram_url: String(item.telegram_url || ""),
          linkedin_email: String(item.linkedin_email || ""),
          github_url: String(item.github_url || ""),
          linkedin_url: String(item.linkedin_url || ""),
          photo_url: String(item.photo_url || ""),
          resume_url: String(item.resume_url || "/cv.pdf"),
          available_for_work: Boolean(item.available_for_work),
        });
      })
      .catch(() => undefined);
    void fetch(`${API_BASE_URL}/skills/`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as
          | Record<string, unknown>[]
          | { results?: Record<string, unknown>[] };
        const items = rows(data);
        setSkills(
            items.map((item) => ({
              name: String(item.name || "Skill"),
              level: Number(item.proficiency || 70),
              group: String(item.category || "tools").replace(/^./, (letter) =>
                letter.toUpperCase(),
              ),
              icon: String(item.category) === "database" ? Database : Code2,
            })),
          );
      })
      .catch(() => undefined);
    const loadContent = async (
      path: string,
      receive: (items: Record<string, unknown>[]) => void,
    ) => {
      const response = await fetch(`${API_BASE_URL}/${path}/`, {
        signal: controller.signal,
      });
      if (!response.ok) return;
      const data = (await response.json()) as
        | Record<string, unknown>[]
        | { results?: Record<string, unknown>[] };
      receive(rows(data));
    };
    void loadContent("education", setEducation).catch(() => undefined);
    void loadContent("experience", setExperience).catch(() => undefined);
    void loadContent("certifications", setCertifications).catch(() => undefined);
    void loadContent("achievements", setAchievements).catch(() => undefined);
    void loadContent("services", setServices).catch(() => undefined);
    void loadContent("testimonials", setTestimonials).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const shownProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          (filter === "All" || p.category === filter) &&
          `${p.title} ${p.description} ${p.tags.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, query, projects],
  );

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus("sending");
    const form = event.currentTarget;
    try {
      const response = await fetch(
        `${API_BASE_URL}/contact-messages/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            Object.fromEntries(new FormData(form).entries()),
          ),
        },
      );
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="loader-mark">
              {profile.name.split(/\s+/)[0]}<span>.</span>
            </span>
            <span className="loader-line" />
          </motion.div>
        )}
      </AnimatePresence>
      <header className="site-header">
        <a
          className="wordmark"
          href="#top"
          aria-label={`${profile.name}, home`}
        >
          {profile.name.split(/\s+/)[0]}<span>.</span>
        </a>
        <nav
          className={menuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Main navigation"
        >
          {navItems.map(([label, href], i) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>
              <span>0{i + 1}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <a className="header-cta" href="#contact">
            Let’s talk <ArrowUpRight size={15} />
          </a>
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero section-wrap" id="top">
          <div className="hero-orb orb-one" aria-hidden="true" />
          <div className="hero-orb orb-two" aria-hidden="true" />
          <div className="hero-copy">
            <motion.div
              className="availability"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {profile.available_for_work && (
                <>
                  <i /> OPEN TO OPPORTUNITIES
                </>
              )}
            </motion.div>
            <motion.p
              className="hero-intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Hello, I’m
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              {profile.name}
              <span>.</span>
            </motion.h1>
            <div className="hero-role">
              <b>[</b>
              <AnimatePresence mode="wait">
                <motion.span
                  key={roleIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {profileRoles[roleIndex] || profile.title}
                </motion.span>
              </AnimatePresence>
              <i className="role-cursor" />
              <b>]</b>
            </div>
            <p className="hero-title">{profile.title}</p>
            <p className="hero-description">{profile.career_objective}</p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href={profile.resume_url}
                download={profile.resume_url.startsWith("/") ? true : undefined}
                target={profile.resume_url.startsWith("/") ? undefined : "_blank"}
                rel={profile.resume_url.startsWith("/") ? undefined : "noreferrer"}
              >
                <Download size={16} /> Download CV
              </a>
              <a className="button button-secondary" href="#contact">
                Contact me <ArrowDownRight size={16} />
              </a>
            </div>
            <div className="hero-socials">
              <span>FIND ME ON</span>
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a href={href} aria-label={label} key={label}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>
          <motion.div
            className="hero-portrait-wrap"
            initial={{ opacity: 0, scale: 0.94, x: 18 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.65, duration: 0.85 }}
          >
            <div className="portrait-frame">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`Portrait of ${profile.name}`}
                  fetchPriority="high"
                />
              ) : (
                <div className="portrait-empty" aria-label="No portrait uploaded">
                  {profile.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </div>
              )}
            </div>
            <div className="portrait-index">
              01
              <br />
              PROFILE IMAGE
            </div>
            <div className="floating-note">
              <Sparkles size={14} /> Ideas into impact
            </div>
            <div className="hero-coordinates">
              COMPUTER SCIENCE
              <br />
              FULL STACK
            </div>
          </motion.div>
          <a href="#about" className="scroll-cue">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown size={15} />
          </a>
          <div className="hero-vertical-label">PORTFOLIO · 2026</div>
        </section>

        <div className="ticker">
          <div className="ticker-track">
            {Array.from({ length: 2 }, (_, n) => (
              <div className="ticker-group" key={n}>
                <span>SOFTWARE ENGINEERING</span>
                <i /> <span>ARTIFICIAL INTELLIGENCE</span>
                <i /> <span>WEB DEVELOPMENT</span>
                <i /> <span>HUMAN-CENTERED DESIGN</span>
                <i />
              </div>
            ))}
          </div>
        </div>

        <section className="section-wrap section-block" id="about">
          <Heading
            index="01"
            label="A LITTLE ABOUT ME"
            title={
              <>
                Building with <em>curiosity.</em>
              </>
            }
          />
          <div className="about-grid">
            <motion.div
              className="about-story"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="micro-label">THE PERSON BEHIND THE PIXELS</span>
              <p className="about-lead">{profile.biography}</p>
              {profile.career_objective && <p>{profile.career_objective}</p>}
              <a className="text-link" href="#journey">
                A little more about my journey <ArrowUpRight size={15} />
              </a>
            </motion.div>
            <motion.div
              className="about-aside"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="quote-card">
                <span>“</span>
                <p>Good software feels obvious to use and took care to make.</p>
                <small>A PRINCIPLE I TRY TO BUILD BY</small>
              </div>
              <div className="stats-row">
                <div>
                  <strong>01</strong>
                  <span>CS degree</span>
                </div>
                <div>
                  <strong>04</strong>
                  <span>skill domains</span>
                </div>
                <div>
                  <strong>∞</strong>
                  <span>things to learn</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          className="section-wrap section-block skills-section"
          id="skills"
        >
          <Heading
            index="02"
            label="MY TOOLKIT"
            title={
              <>
                Skills with <em>range.</em>
              </>
            }
            detail="A practical toolkit across interface, backend, and data, with room to keep growing."
          />
          <div className="skills-layout">
            <div className="skill-bars">
              {skills.map((skill, i) => (
                <motion.div
                  className="skill-row"
                  key={skill.name}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="skill-row-label">
                    <span>
                      <skill.icon size={15} />
                      {skill.name}
                    </span>
                    <small>{skill.group}</small>
                    <b>{skill.level}%</b>
                  </div>
                  <div className="skill-track">
                    <motion.span
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: skill.level / 100 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="skill-groups">
              {skillGroups.map(([title, ...items], i) => (
                <motion.article
                  className="skill-card"
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div>
                    <span>0{i + 1}</span>
                    <h3>{title}</h3>
                    <ArrowUpRight size={15} />
                  </div>
                  <div className="skill-pills">
                    {items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section-wrap section-block projects-section"
          id="projects"
        >
          <Heading
            index="03"
            label="SELECTED WORK"
            title={
              <>
                Made to be <em>useful.</em>
              </>
            }
            detail="A few projects exploring how software can make everyday tasks clearer."
          />
          <div className="project-tools">
            <div
              className="filter-tabs"
              role="group"
              aria-label="Filter projects"
            >
              {["All", "Web", "AI"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={filter === item ? "active" : ""}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="project-search">
              <span className="sr-only">Search projects</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects"
              />
              <kbd>/</kbd>
            </label>
          </div>
          <div className="project-grid">
            {shownProjects.map((p, i) => (
              <motion.article
                className="project-card"
                key={p.title}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <button
                  className="project-image"
                  type="button"
                  onClick={(event) => {
                    returnFocusRef.current = event.currentTarget;
                    setSelected(p);
                  }}
                  aria-label={`View details for ${p.title}`}
                >
                  {p.image ? (
                    <img src={p.image} alt={p.alt} loading="lazy" />
                  ) : (
                    <span className="project-image-empty">Add your project image in admin</span>
                  )}
                  <span>0{i + 1}</span>
                  <i>
                    <ArrowUpRight size={18} />
                  </i>
                </button>
                <div className="project-info">
                  <div className="project-meta">
                    <span>{p.type}</span>
                    <span>2026</span>
                  </div>
                  <button
                    className="project-title"
                    type="button"
                    onClick={(event) => {
                      returnFocusRef.current = event.currentTarget;
                      setSelected(p);
                    }}
                  >
                    <h3>{p.title}</h3>
                    <ArrowUpRight size={17} />
                  </button>
                  <p>{p.description}</p>
                  <div className="project-tags">
                    {p.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          {shownProjects.length === 0 && (
            <p className="empty-state">No projects match that search yet.</p>
          )}
        </section>

        <section
          className="section-wrap section-block journey-section"
          id="journey"
        >
          <Heading
            index="04"
            label="EDUCATION & EXPERIENCE"
            title={
              <>
                A foundation for <em>what’s next.</em>
              </>
            }
            detail="The start of a career shaped by computer science, independent work, and a drive to keep learning."
          />
          <div className="journey-grid">
            <div>
              <span className="micro-label">EDUCATION</span>
              {education.map((item) => (
                <motion.article
                  className="timeline-item"
                  key={String(item.id)}
                  variants={reveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <i />
                  <small>
                    {[item.start_year, item.end_year]
                      .filter(Boolean)
                      .map(String)
                      .join(" – ")}
                  </small>
                  <h3>{String(item.degree || "")}</h3>
                  <p className="timeline-place">
                    <GraduationCap size={15} /> {String(item.institution || "")}
                  </p>
                  {Boolean(item.field_of_study) && <p>{String(item.field_of_study)}</p>}
                  {Boolean(item.description) && <p>{String(item.description)}</p>}
                  {Array.isArray(item.achievements) && item.achievements.length > 0 && (
                    <ul>
                      {item.achievements.map((achievement) => (
                        <li key={String(achievement)}>{String(achievement)}</li>
                      ))}
                    </ul>
                  )}
                  {Boolean(item.gpa) && (
                    <div className="gpa-card">
                      <small>ACADEMIC RECORD</small>
                      <strong>{String(item.gpa)}</strong>
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
            <div>
              <span className="micro-label">EXPERIENCE</span>
              {experience.map((item) => (
                <motion.article
                  className="timeline-item"
                  key={String(item.id)}
                  variants={reveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <i />
                  <small>
                    {String(item.start_date || "")}
                    {item.is_current
                      ? " – Present"
                      : item.end_date
                        ? ` – ${String(item.end_date)}`
                        : ""}
                  </small>
                  <h3>{String(item.role || "")}</h3>
                  <p className="timeline-place">
                    <Code2 size={15} /> {String(item.organization || "")}
                    {item.location ? ` · ${String(item.location)}` : ""}
                  </p>
                  <p>{String(item.summary || "")}</p>
                  {Array.isArray(item.achievements) && item.achievements.length > 0 && (
                    <ul>
                      {item.achievements.map((achievement) => (
                        <li key={String(achievement)}>{String(achievement)}</li>
                      ))}
                    </ul>
                  )}
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {(certifications.length > 0 || achievements.length > 0) && (
        <section className="section-wrap section-block more-section" id="more">
          <Heading
            index="05"
            label="BEYOND THE BUILD"
            title={
              <>
                The work around <em>the work.</em>
              </>
            }
            detail="A thoughtful practice is more than a list of frameworks."
          />
          <div className="more-grid">
            <article className="more-panel">
              <div className="panel-label">
                <span>01</span> CERTIFICATIONS
              </div>
              {certifications.map((item) => (
                <a
                  className="placeholder-entry"
                  href={String(item.credential_url || "#more")}
                  key={String(item.id)}
                >
                  <GraduationCap size={19} />
                  <div>
                    <h3>{String(item.name || "")}</h3>
                    <p>
                      {String(item.issuer || "")}
                      {item.issued_on ? ` · ${String(item.issued_on)}` : ""}
                    </p>
                  </div>
                  <ArrowUpRight size={15} />
                </a>
              ))}
            </article>
            <article className="more-panel">
              <div className="panel-label">
                <span>02</span> ACHIEVEMENTS
              </div>
              {achievements.map((item) => (
                <div className="achievement-feature" key={String(item.id)}>
                  <span>✳</span>
                  <div>
                    <h3>{String(item.title || "")}</h3>
                    {Boolean(item.achieved_on) && (
                      <small>{String(item.achieved_on)}</small>
                    )}
                    <p>{String(item.description || "")}</p>
                    {item.url ? (
                      <a className="text-link" href={String(item.url)}>
                        Learn more <ArrowUpRight size={14} />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </article>
          </div>
        </section>
        )}

        {services.length > 0 && <section className="services-band" id="services">
          <div className="section-wrap services-inner">
            <div>
              <span className="section-index">06 / HOW I CAN HELP</span>
              <h2>
                Good work starts
                <br />
                with a <em>good question.</em>
              </h2>
              <p>
                From a new idea to an existing product, I’m interested in
                collaborative work that solves real problems.
              </p>
            </div>
            <div className="service-list">
              {services.map((item, i) => (
                <div key={String(item.id)}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{String(item.title || "")}</h3>
                    {item.description ? <p>{String(item.description)}</p> : null}
                  </div>
                  <ArrowUpRight size={16} />
                </div>
              ))}
            </div>
          </div>
        </section>
        }

        {testimonials.length > 0 && <section
          className="section-wrap section-block testimonial-section"
          id="testimonials"
        >
          <Heading
            index="07"
            label="KIND WORDS"
            title={
              <>
                People make the <em>difference.</em>
              </>
            }
            detail="A note from someone who has worked with you belongs here."
          />
          {testimonials.map((item) => <motion.blockquote
            className="testimonial-quote"
            key={String(item.id)}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span>“</span>
            <p>{String(item.quote || "")}</p>
            <footer>
              {item.avatar_url ? (
                <img src={String(item.avatar_url)} alt="" />
              ) : <i>{String(item.author || "").slice(0, 2).toUpperCase()}</i>}
              <div>
                <strong>{String(item.author || "")}</strong>
                <small>
                  {[item.role, item.organization].filter(Boolean).map(String).join(" · ")}
                </small>
              </div>
            </footer>
          </motion.blockquote>)}
        </section>
        }

        <section className="contact-section" id="contact">
          <div className="section-wrap contact-inner">
            <div className="contact-copy">
              <span className="section-index">08 / GET IN TOUCH</span>
              <h2>
                Have a good one
                <br />
                in <em>mind?</em>
              </h2>
              <p>
                I’m open to thoughtful conversations, early-career
                opportunities, and interesting problems.
              </p>
              <a className="contact-email" href={`mailto:${profile.email}`}>
                {profile.email} <ArrowUpRight size={18} />
              </a>
              <div className="contact-socials">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a href={href} aria-label={label} key={label}>
                    <Icon size={17} />
                  </a>
                ))}
              </div>
              <div className="contact-details">
                {profile.phone && (
                  <a href={`tel:${profile.phone}`}>
                    <Phone size={14} /> {profile.phone}
                  </a>
                )}
                {profile.telegram_url && (
                  <a href={profile.telegram_url}>
                    <Send size={14} /> Telegram
                  </a>
                )}
                {profile.linkedin_email && (
                  <a href={`mailto:${profile.linkedin_email}`}>
                    <AtSign size={14} /> {profile.linkedin_email}
                  </a>
                )}
                {profile.location && <span>{profile.location}</span>}
              </div>
            </div>
            <form className="contact-form" onSubmit={submitContact}>
              <label className="honeypot" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <div className="form-row">
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Name"
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label>
                Subject
                <input
                  name="subject"
                  required
                  minLength={3}
                  maxLength={180}
                  placeholder="What would you like to discuss?"
                />
              </label>
              <label>
                Message
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={4}
                  placeholder="A little context goes a long way..."
                />
              </label>
              <div className="form-footer">
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={formStatus === "sending"}
                >
                  {formStatus === "sending" ? "Sending..." : "Send message"}{" "}
                  {formStatus === "success" ? (
                    <Check size={16} />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
                <span
                  className={`form-status ${formStatus}`}
                  aria-live="polite"
                >
                  {formStatus === "success"
                    ? "Message sent. Thank you."
                    : formStatus === "error"
                      ? "Could not send. Email me directly instead."
                      : "Usually replies within 2 business days."}
                </span>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#top">
          {profile.name.split(/\s+/)[0]}<span>.</span>
        </a>
        <span>Designed with intent. Built with care.</span>
        <div>
          <a href="#top">
            BACK TO TOP <ArrowRight size={13} />
          </a>
          <small>© 2026 {profile.name.toUpperCase()}</small>
        </div>
      </footer>
      <div className="floating-socials" aria-label="Social links">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <a href={href} aria-label={label} key={label}>
            <Icon size={16} />
          </a>
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            className="modal-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
          >
            <motion.section
              className="project-modal"
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
            >
              <button
                className="icon-button modal-close"
                type="button"
                aria-label="Close project details"
                onClick={() => setSelected(null)}
              >
                <X size={19} />
              </button>
              {selected.image && <img src={selected.image} alt={selected.alt} />}
              <div className="modal-content">
                <span className="section-index">{selected.type}</span>
                <h2 id="modal-title">{selected.title}</h2>
                <p>{selected.details}</p>
                <div className="project-tags">
                  {selected.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="modal-links">
                  <a href={selected.github} target="_blank" rel="noreferrer">
                    <Github size={16} /> Source code <ArrowUpRight size={14} />
                  </a>
                  <a href={selected.demo}>
                    Live demo <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PortfolioPage;

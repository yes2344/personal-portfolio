import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  Code2,
  FolderKanban,
  Inbox,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import "./admin.css";

type RecordItem = Record<string, unknown> & { id: number };
type ViewName =
  | "overview"
  | "profile"
  | "projects"
  | "skills"
  | "education"
  | "certifications"
  | "experience"
  | "achievements"
  | "services"
  | "testimonials"
  | "messages";
type ContentView = Exclude<ViewName, "overview" | "messages">;
type Stats = {
  projects: number;
  skills: number;
  certifications: number;
  unread_messages: number;
  messages_by_month: { month: string; total: number }[];
  recent_messages: RecordItem[];
};
type Field = {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
};

const API = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(
      /\/$/,
      "",
    )
  : "/api/v1";
const resources: Record<Exclude<ViewName, "overview">, string> = {
  profile: "profile",
  projects: "projects",
  skills: "skills",
  education: "education",
  certifications: "certifications",
  experience: "experience",
  achievements: "achievements",
  services: "services",
  testimonials: "testimonials",
  messages: "contact-messages",
};
const fields: Record<ContentView, Field[]> = {
  profile: [
    { key: "name", label: "Full name" },
    { key: "title", label: "Professional title" },
    { key: "biography", label: "Biography", type: "textarea" },
    { key: "career_objective", label: "Career objective", type: "textarea" },
    { key: "email", label: "Public email", type: "email" },
    { key: "linkedin_email", label: "LinkedIn contact email", type: "email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "photo_url", label: "Your portrait image URL", type: "url" },
    { key: "resume_url", label: "CV download URL", type: "url" },
    { key: "github_url", label: "GitHub profile URL", type: "url" },
    { key: "linkedin_url", label: "LinkedIn profile URL", type: "url" },
    { key: "telegram_url", label: "Telegram URL", type: "url" },
    { key: "available_for_work", label: "Available for work", type: "checkbox" },
  ],
  projects: [
    { key: "title", label: "Title" },
    { key: "slug", label: "URL slug" },
    { key: "summary", label: "Summary" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "image_url", label: "Your project image URL", type: "url" },
    { key: "image_alt", label: "Image description" },
    { key: "tech_stack", label: "Technologies (comma separated)" },
    { key: "category", label: "Category (web, ai, other)" },
    { key: "github_url", label: "GitHub URL" },
    { key: "live_url", label: "Live demo URL" },
    { key: "is_featured", label: "Featured project", type: "checkbox" },
    { key: "sort_order", label: "Display order", type: "number" },
  ],
  skills: [
    { key: "name", label: "Skill name" },
    { key: "category", label: "Category (frontend, backend, database, tools)" },
    { key: "proficiency", label: "Proficiency (1–100)", type: "number" },
    { key: "sort_order", label: "Display order", type: "number" },
  ],
  certifications: [
    { key: "name", label: "Certification" },
    { key: "issuer", label: "Issuer" },
    { key: "issued_on", label: "Issue date", type: "date" },
    { key: "credential_url", label: "Credential URL" },
    { key: "sort_order", label: "Display order", type: "number" },
  ],
  education: [
    { key: "institution", label: "Institution" },
    { key: "degree", label: "Degree" },
    { key: "field_of_study", label: "Field of study" },
    { key: "start_year", label: "Start year", type: "number" },
    { key: "end_year", label: "End year", type: "number" },
    { key: "gpa", label: "GPA" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "achievements", label: "Achievements (comma separated)" },
    { key: "sort_order", label: "Display order", type: "number" },
  ],
  experience: [
    { key: "organization", label: "Organization" },
    { key: "role", label: "Role" },
    { key: "location", label: "Location" },
    { key: "start_date", label: "Start date", type: "date" },
    { key: "end_date", label: "End date", type: "date" },
    { key: "is_current", label: "Current position", type: "checkbox" },
    { key: "summary", label: "Summary", type: "textarea" },
    { key: "achievements", label: "Achievements (comma separated)" },
    { key: "sort_order", label: "Display order", type: "number" },
  ],
  achievements: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "achieved_on", label: "Date", type: "date" },
    { key: "url", label: "Related URL", type: "url" },
    { key: "sort_order", label: "Display order", type: "number" },
  ],
  services: [
    { key: "title", label: "Service title" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "icon", label: "Icon key" },
    { key: "sort_order", label: "Display order", type: "number" },
  ],
  testimonials: [
    { key: "author", label: "Author" },
    { key: "role", label: "Role" },
    { key: "organization", label: "Organization" },
    { key: "quote", label: "Quote", type: "textarea" },
    { key: "avatar_url", label: "Portrait image URL", type: "url" },
    { key: "sort_order", label: "Display order", type: "number" },
  ],
};

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API}/${path.replace(/^\//, "")}`;
  const send = (accessToken: string) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });
  let response = await send(token);
  if (response.status === 401) {
    const refresh = sessionStorage.getItem("portfolio-admin-refresh");
    if (refresh) {
      const renewed = await fetch(`${API}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (renewed.ok) {
        const tokens = (await renewed.json()) as {
          access: string;
          refresh?: string;
        };
        sessionStorage.setItem("portfolio-admin-token", tokens.access);
        if (tokens.refresh)
          sessionStorage.setItem("portfolio-admin-refresh", tokens.refresh);
        response = await send(tokens.access);
      }
    }
  }
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Session expired. Please sign in again."
        : `Request failed (${response.status}).`,
    );
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
}

async function fetchRows(view: Exclude<ViewName, "overview">, token: string) {
  const result = await request<{ results?: RecordItem[] } | RecordItem[]>(
    `${resources[view]}/`,
    token,
  );
  return Array.isArray(result) ? result : result.results || [];
}

function fieldValue(field: Field, row: RecordItem | null) {
  const value = row?.[field.key];
  if (["tech_stack", "achievements"].includes(field.key) && Array.isArray(value))
    return value.join(", ");
  if (field.type === "checkbox") return value === true ? "true" : "false";
  return value == null ? "" : String(value);
}

export default function AdminDashboard() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("portfolio-admin-token") || "",
  );
  const [view, setView] = useState<ViewName>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<RecordItem[]>([]);
  const [loginError, setLoginError] = useState("");
  const [pageError, setPageError] = useState("");
  const [loadedView, setLoadedView] = useState<ViewName | null>(null);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const loading = Boolean(token) && loadedView !== view;

  useEffect(() => {
    if (!token) return;
    let current = true;
    const statsRequest = request<Stats>("admin/stats/", token)
      .then((data) => {
        if (current) setStats(data);
      })
      .catch((error: Error) => {
        if (current) setPageError(error.message);
      });
    const rowsRequest =
      view === "overview"
        ? Promise.resolve()
        : fetchRows(view, token)
            .then((data) => {
              if (current) setRows(data);
            })
            .catch((error: Error) => {
              if (current) setPageError(error.message);
            });
    void Promise.all([statsRequest, rowsRequest]).finally(() => {
      if (current) setLoadedView(view);
    });
    return () => {
      current = false;
    };
  }, [token, view]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      if (!response.ok)
        throw new Error("Invalid credentials or admin access required.");
      const data = (await response.json()) as {
        access: string;
        refresh: string;
      };
      sessionStorage.setItem("portfolio-admin-token", data.access);
      sessionStorage.setItem("portfolio-admin-refresh", data.refresh);
      setToken(data.access);
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    }
  }

  function signOut() {
    sessionStorage.removeItem("portfolio-admin-token");
    sessionStorage.removeItem("portfolio-admin-refresh");
    setToken("");
    setStats(null);
    setRows([]);
  }

  function openEditor(row: RecordItem | null = null) {
    setEditing(row);
    const activeFields =
      view === "overview" || view === "messages" ? [] : fields[view];
    const initial = Object.fromEntries(
      activeFields.map((field) => [field.key, fieldValue(field, row)]),
    );
    setDraft(
      view === "profile"
        ? initial
        : {
            ...initial,
            is_published: row?.is_published === false ? "false" : "true",
          },
    );
    setEditorOpen(true);
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (view === "overview" || view === "messages") return;
    setPageError("");
    const payload: Record<string, unknown> = { ...draft };
    if (view !== "profile")
      payload.is_published = draft.is_published !== "false";
    for (const key of ["available_for_work", "is_current", "is_featured"])
      if (key in draft) payload[key] = draft[key] === "true";
    if (view === "projects")
      payload.tech_stack = (draft.tech_stack || "").split(",").map((value) => value.trim()).filter(Boolean);
    if (view === "education" || view === "experience")
      payload.achievements = (draft.achievements || "").split(",").map((value) => value.trim()).filter(Boolean);
    if (view === "skills") payload.proficiency = Number(draft.proficiency);
    for (const key of ["sort_order", "start_year", "end_year"])
      if (key in draft) payload[key] = draft[key] ? Number(draft[key]) : null;
    for (const key of ["issued_on", "start_date", "end_date", "achieved_on"])
      if (key in draft && !draft[key]) payload[key] = null;
    const suffix = editing ? `${editing.id}/` : "";
    try {
      await request(`${resources[view]}/${suffix}`, token, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setRows(await fetchRows(view, token));
      setStats(await request<Stats>("admin/stats/", token));
      setEditorOpen(false);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Could not save changes.",
      );
    }
  }

  async function deleteRecord(row: RecordItem) {
    if (
      !window.confirm(`Delete ${String(row.title || row.name || row.subject)}?`)
    )
      return;
    try {
      await request(
        `${resources[view as Exclude<ViewName, "overview">]}/${row.id}/`,
        token,
        { method: "DELETE" },
      );
      if (view !== "overview") setRows(await fetchRows(view, token));
      setStats(await request<Stats>("admin/stats/", token));
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Could not delete item.",
      );
    }
  }

  async function markRead(row: RecordItem) {
    try {
      await request(`contact-messages/${row.id}/`, token, {
        method: "PATCH",
        body: JSON.stringify({ is_read: true }),
      });
      setRows(await fetchRows("messages", token));
      setStats(await request<Stats>("admin/stats/", token));
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Could not update message.",
      );
    }
  }

  if (!token)
    return (
      <main className="admin-login-wrap">
        <form className="admin-login" onSubmit={signIn}>
          <a className="admin-brand" href="/">
            Shumet<span>.</span>
            <small>PORTFOLIO ADMIN</small>
          </a>
          <span className="section-index">PRIVATE WORKSPACE</span>
          <h1>Welcome back.</h1>
          <p>Sign in with a Django staff account.</p>
          <label>
            Username
            <input name="username" required autoComplete="username" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          {loginError && (
            <p className="admin-error" role="alert">
              {loginError}
            </p>
          )}
          <button className="button button-primary" type="submit">
            <ShieldCheck size={16} /> Sign in securely
          </button>
          <a className="admin-back" href="/">
            ← Back to portfolio
          </a>
        </form>
      </main>
    );

  const nav: { id: ViewName; label: string; icon: typeof Activity }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "profile", label: "Profile & CV", icon: UserRound },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "education", label: "Education", icon: BadgeCheck },
    { id: "certifications", label: "Certifications", icon: BadgeCheck },
    { id: "experience", label: "Experience", icon: Activity },
    { id: "achievements", label: "Achievements", icon: Check },
    { id: "services", label: "Services", icon: Wrench },
    { id: "testimonials", label: "Testimonials", icon: UserRound },
    { id: "messages", label: "Messages", icon: Inbox },
  ];
  const filteredRows = rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  const title = nav.find((item) => item.id === view)?.label || "Overview";
  const chartMax = Math.max(
    1,
    ...(stats?.messages_by_month || []).map((item) => item.total),
  );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          Shumet<span>.</span>
          <small>PORTFOLIO ADMIN</small>
        </a>
        <div className="admin-workspace">
          <span className="admin-avatar">SY</span>
          <div>
            <strong>Workspace</strong>
            <small>Personal portfolio</small>
          </div>
          <ChevronRight size={15} />
        </div>
        <span className="admin-nav-label">MANAGE</span>
        <nav aria-label="Dashboard navigation">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => setView(id)}
            >
              <Icon size={17} />
              {label}
              {id === "messages" && stats?.unread_messages ? (
                <b>{stats.unread_messages}</b>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span>
            <i /> API CONNECTED
          </span>
          <button type="button" onClick={signOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="section-index">
              YOUR SPACE / {title.toUpperCase()}
            </span>
            <h1>{view === "overview" ? "Overview" : title}</h1>
          </div>
          <div className="admin-top-actions">
            <a href="/" target="_blank" rel="noreferrer">
              View portfolio <ArrowUpRight size={15} />
            </a>
            <button
              className="admin-avatar"
              type="button"
              aria-label="Sign out"
              onClick={signOut}
            >
              SY
            </button>
          </div>
        </header>
        {pageError && (
          <p className="admin-error" role="alert">
            {pageError}{" "}
            {pageError.includes("Session expired") && (
              <button type="button" onClick={signOut}>
                Sign in again
              </button>
            )}
          </p>
        )}
        {view === "overview" ? (
          <section className="admin-overview">
            <div className="admin-welcome">
              <div>
                <span className="section-index">GOOD TO SEE YOU</span>
                <h2>Your work, at a glance.</h2>
                <p>
                  Keep your public portfolio current and your conversations
                  moving.
                </p>
              </div>
              <Activity size={26} />
            </div>
            <div className="admin-stat-grid">
              {[
                {
                  label: "Published projects",
                  value: stats?.projects ?? 0,
                  icon: FolderKanban,
                },
                {
                  label: "Skills listed",
                  value: stats?.skills ?? 0,
                  icon: Code2,
                },
                {
                  label: "Certifications",
                  value: stats?.certifications ?? 0,
                  icon: BadgeCheck,
                },
                {
                  label: "Unread messages",
                  value: stats?.unread_messages ?? 0,
                  icon: Inbox,
                },
              ].map(({ label, value, icon: Icon }) => (
                <article className="admin-stat" key={label}>
                  <div>
                    <span>{label}</span>
                    <Icon size={17} />
                  </div>
                  <strong>{value}</strong>
                  <small>LIVE CONTENT</small>
                </article>
              ))}
            </div>
            <div className="admin-analytics">
              <article className="admin-panel chart-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Message activity</h2>
                    <p>Inbound conversations by month</p>
                  </div>
                  <span>LAST 12 MONTHS</span>
                </div>
                <div
                  className="bar-chart"
                  role="img"
                  aria-label="Contact messages by month"
                >
                  {(stats?.messages_by_month || []).map((item) => (
                    <div
                      key={item.month}
                      title={`${item.month}: ${item.total} messages`}
                    >
                      <span
                        style={{
                          height: `${Math.max(5, (item.total / chartMax) * 100)}%`,
                        }}
                      />
                      <small>{item.month.slice(5)}</small>
                    </div>
                  ))}
                </div>
              </article>
              <article className="admin-panel recent-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Recent messages</h2>
                    <p>Latest notes from your contact form</p>
                  </div>
                  <button type="button" onClick={() => setView("messages")}>
                    View inbox <ArrowUpRight size={14} />
                  </button>
                </div>
                {stats?.recent_messages?.length ? (
                  stats.recent_messages.slice(0, 4).map((message) => (
                    <div className="recent-message" key={message.id}>
                      <span className="admin-avatar">
                        {String(message.name || "SY")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div>
                        <strong>{String(message.name)}</strong>
                        <small>{String(message.subject)}</small>
                      </div>
                      <span>
                        {String(message.created_at || "").slice(0, 10)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="admin-empty">No messages yet.</p>
                )}
              </article>
            </div>
          </section>
        ) : (
          <section className="admin-content">
            <div className="admin-content-toolbar">
              <div>
                <h2>
                  {view === "messages"
                    ? "Contact inbox"
                    : view === "profile"
                      ? "Update your public identity"
                      : `Manage ${title.toLowerCase()}`}
                </h2>
                <p>
                  {view === "messages"
                    ? "Review and follow up on incoming messages."
                    : view === "profile"
                      ? "Change the name, bio, portrait, CV link, contact details, and social profiles shown on the site."
                      : "Changes are published through the portfolio API."}
                </p>
              </div>
              <div className="admin-content-actions">
                <label className="admin-search">
                  <Search size={15} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search"
                  />
                </label>
                {view !== "messages" && (
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() =>
                      view === "profile"
                        ? openEditor(rows[0] || null)
                        : openEditor()
                    }
                  >
                    {view === "profile" ? (
                      <>
                        <Wrench size={16} /> {rows.length ? "Edit profile" : "Set up profile"}
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Add{" "}
                        {view === "certifications"
                          ? "certificate"
                          : view.slice(0, -1)}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <p className="admin-empty">Loading content...</p>
            ) : view === "messages" ? (
              <div className="admin-message-list">
                {filteredRows.map((row) => (
                  <article
                    className={
                      row.is_read ? "inbox-message is-read" : "inbox-message"
                    }
                    key={row.id}
                  >
                    <div className="inbox-message-top">
                      <span className="inbox-dot" />
                      <div>
                        <h3>{String(row.subject)}</h3>
                        <p>
                          {String(row.name)} ·{" "}
                          <a href={`mailto:${String(row.email)}`}>
                            {String(row.email)}
                          </a>
                        </p>
                      </div>
                      <time>{String(row.created_at || "").slice(0, 10)}</time>
                    </div>
                    <p className="inbox-body">{String(row.message)}</p>
                    <div className="inbox-actions">
                      {!row.is_read && (
                        <button type="button" onClick={() => markRead(row)}>
                          <Check size={14} /> Mark as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void deleteRecord(row)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </article>
                ))}
                {filteredRows.length === 0 && (
                  <p className="admin-empty">Your inbox is clear.</p>
                )}
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        {view === "projects"
                          ? "Project"
                          : view === "skills"
                            ? "Skill"
                            : String(
                                rows[0]?.title ||
                                  rows[0]?.name ||
                                  rows[0]?.institution ||
                                  rows[0]?.organization ||
                                  rows[0]?.author ||
                                  title,
                              )}
                      </th>
                      <th>
                        {view === "projects"
                          ? "Category"
                          : view === "skills"
                            ? "Proficiency"
                            : view === "certifications"
                              ? "Issuer"
                              : "Details"}
                      </th>
                      <th>Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>{String(row.title || row.name)}</strong>
                          <small>
                            {String(
                              row.summary ||
                                row.category ||
                                row.issued_on ||
                                "",
                            )}
                          </small>
                        </td>
                        <td>
                          {String(
                            row.category ||
                              row.issuer ||
                              (row.proficiency ? `${row.proficiency}%` : "") ||
                              row.degree ||
                              row.role ||
                              row.description ||
                              row.quote ||
                              "",
                          )}
                        </td>
                        <td>
                          <span
                            className={
                              row.is_published === false
                                ? "visibility hidden"
                                : "visibility"
                            }
                          >
                            {row.is_published === false ? "Draft" : "Published"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              aria-label="Edit"
                              onClick={() => openEditor(row)}
                            >
                              <Wrench size={15} />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete"
                              onClick={() => void deleteRecord(row)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRows.length === 0 && (
                  <p className="admin-empty">No content found.</p>
                )}
              </div>
            )}
          </section>
        )}
      </main>
      {editorOpen && view !== "overview" && view !== "messages" && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditorOpen(false);
          }}
        >
          <form
            className="admin-editor"
            onSubmit={saveRecord}
            aria-label={editing ? "Edit content" : "Add content"}
          >
            <div className="admin-editor-heading">
              <div>
                <span className="section-index">CONTENT MANAGEMENT</span>
                <h2>{editing ? "Edit item" : "Add item"}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close editor"
                onClick={() => setEditorOpen(false)}
              >
                <X size={17} />
              </button>
            </div>
            {fields[view].map((field) => (
              <label key={field.key}>
                {field.label}
                {field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={draft[field.key] === "true"}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        [field.key]: String(event.target.checked),
                      })
                    }
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    required={view === "profile" && field.key === "biography"}
                    rows={3}
                    value={draft[field.key] || ""}
                    onChange={(event) =>
                      setDraft({ ...draft, [field.key]: event.target.value })
                    }
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    required={
                      view === "profile"
                        ? ["name", "title", "biography", "email"].includes(field.key)
                        : ![
                            "image_url", "image_alt", "github_url", "live_url",
                            "issued_on", "credential_url", "start_year", "end_year",
                            "gpa", "field_of_study", "location", "start_date",
                            "end_date", "achieved_on", "url", "icon", "role",
                            "organization", "avatar_url", "achievements",
                          ].includes(field.key)
                    }
                    value={draft[field.key] || ""}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setDraft({ ...draft, [field.key]: event.target.value })
                    }
                  />
                )}
              </label>
            ))}
            {view !== "profile" && (
              <label className="admin-publish-toggle">
                <input
                  type="checkbox"
                  checked={draft.is_published !== "false"}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      is_published: String(event.target.checked),
                    })
                  }
                />{" "}
                Publish immediately
              </label>
            )}
            <div className="admin-editor-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setEditorOpen(false)}
              >
                Cancel
              </button>
              <button className="button button-primary" type="submit">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

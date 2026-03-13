import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════
   HELPERS — localStorage with prefix
   ═══════════════════════════════════════════════ */

const PREFIX = "schwarz_admin_";

function save(key: string, data: unknown) {
  localStorage.setItem(PREFIX + key, JSON.stringify(data));
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ═══════════════════════════════════════════════
   TYPES — shared between admin and public pages
   ═══════════════════════════════════════════════ */

export interface NavItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  isCustom?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  text: string;
  date: string;
  priority: "low" | "normal" | "high";
  pinned?: boolean;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  headerGradient: string;
  accentColor: string;
  visible: boolean;
  createdAt: string;
}

export interface PageOverride {
  pageId: string;
  sections: Record<string, string>;
}

export interface AdminMember {
  id: string;
  name: string;
  role: "owner" | "dep_owner" | "close" | "old" | "main" | "academy";
  joinDate: string;
  active: boolean;
  badges?: string[];
}

export interface BadgeDef {
  id: string;
  label: string;
  color: string;
  category: string;
}

export const AVAILABLE_BADGES: BadgeDef[] = [
  { id: "fisherman", label: "Рыбак", color: "#3b82f6", category: "Работы" },
  { id: "miner", label: "Шахтёр", color: "#a855f7", category: "Работы" },
  { id: "trucker", label: "Дальнобойщик", color: "#f97316", category: "Работы" },
  { id: "farmer", label: "Фермер", color: "#22c55e", category: "Работы" },
  { id: "mechanic", label: "Механик", color: "#ef4444", category: "Работы" },
  { id: "pilot", label: "Пилот", color: "#06b6d4", category: "Работы" },
  { id: "lspd", label: "LSPD", color: "#3b82f6", category: "Фракции" },
  { id: "lssd", label: "LSSD", color: "#f59e0b", category: "Фракции" },
  { id: "fib", label: "FIB", color: "#8b5cf6", category: "Фракции" },
  { id: "ems", label: "EMS", color: "#ef4444", category: "Фракции" },
  { id: "gov", label: "GOV", color: "#10b981", category: "Фракции" },
  { id: "army", label: "Army", color: "#6b7280", category: "Фракции" },
  { id: "news", label: "News", color: "#ec4899", category: "Фракции" },
  { id: "streamer", label: "Стример", color: "#9146ff", category: "Особые" },
  { id: "leader", label: "Эк-лидер", color: "#ff3366", category: "Особые" },
  { id: "developer", label: "Разработчик", color: "#9b2335", category: "Особые" },
];

export const BADGE_MAP = Object.fromEntries(AVAILABLE_BADGES.map((b) => [b.id, b]));

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: "members" | "leaderships" | "announcements" | "rules" | "settings" | "nav" | "pages" | "applications" | "news" | "media";
  details: string;
  staffName: string;
}

export function addAuditLog(action: string, category: AuditLogEntry["category"], details: string, staffName: string = "Admin") {
  const logs: AuditLogEntry[] = load("auditLog", []);
  const entry: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    action,
    category,
    details,
    staffName,
  };
  logs.unshift(entry);
  // Keep last 200 entries
  if (logs.length > 200) logs.length = 200;
  save("auditLog", logs);
}

export interface Application {
  id: string;
  nickname: string;
  discord: string;
  age: string;
  server: string;
  primetime: string;
  referral: string;
  expectations: string;
  /** @deprecated kept for backward compat with old submissions */
  experience?: string;
  /** @deprecated kept for backward compat */
  motivation?: string;
  status: "pending" | "accepted" | "rejected";
  adminComment: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

/* ═══════════════════════════════════════════════
   POLLS / VOTING SYSTEM
   ═══════════════════════════════════════════════ */

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  active: boolean;
  access: "all" | "members"; // "all" = anyone, "members" = must enter schwarz name
  createdAt: string;
  closedAt: string | null;
  /** Set of voter identifiers who already voted (stored separately) */
}

export function usePolls() {
  const [polls, setPollsState] = useState<Poll[]>(() => load("polls", []));

  const setPolls = (p: Poll[]) => {
    setPollsState(p);
    save("polls", p);
  };

  const addPoll = (poll: Omit<Poll, "id" | "createdAt" | "closedAt">) => {
    const newPoll: Poll = {
      ...poll,
      id: `poll_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      closedAt: null,
    };
    const updated = [newPoll, ...polls];
    setPolls(updated);
    return newPoll;
  };

  const togglePoll = (id: string) => {
    const updated = polls.map((p) =>
      p.id === id
        ? { ...p, active: !p.active, closedAt: p.active ? new Date().toISOString() : null }
        : p
    );
    setPolls(updated);
  };

  const deletePoll = (id: string) => {
    setPolls(polls.filter((p) => p.id !== id));
    // Also clean up voters
    localStorage.removeItem(`schwarz_admin_poll_voters_${id}`);
  };

  return { polls, setPolls, addPoll, togglePoll, deletePoll };
}

/** Vote on a poll — returns true if successful, false if already voted */
export function voteOnPoll(pollId: string, optionId: string, voterId: string): boolean {
  const voters: string[] = load(`poll_voters_${pollId}`, []);

  if (voters.includes(voterId)) return false; // already voted

  // Record vote
  voters.push(voterId);
  save(`poll_voters_${pollId}`, voters);

  // Update poll option count
  const polls: Poll[] = load("polls", []);
  const updated = polls.map((p) => {
    if (p.id !== pollId) return p;
    return {
      ...p,
      options: p.options.map((o) =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
      ),
    };
  });
  save("polls", updated);
  return true;
}

/** Check if a voter already voted */
export function hasVoted(pollId: string, voterId: string): boolean {
  const voters: string[] = load(`poll_voters_${pollId}`, []);
  return voters.includes(voterId);
}

/* ═══════════════════════════════════════════════
   DEFAULTS
   ═══════════════════════════════════════════════ */

export const defaultNavItems: NavItem[] = [
  { id: "home", label: "Главная", path: "/", visible: true },
  { id: "about", label: "О нас", path: "/about", visible: true },
  { id: "history", label: "История", path: "/history", visible: true },
  { id: "current-leadership", label: "Текущая лидерка", path: "/current-leadership", visible: true },
  { id: "media", label: "Медиа", path: "/media", visible: true },
  { id: "members", label: "Состав", path: "/members", visible: true },
  { id: "redux", label: "Редукс", path: "/redux", visible: true },
  { id: "rules", label: "Правила", path: "/rules", visible: true },
  { id: "how-to-play", label: "Как играть?", path: "/how-to-play", visible: true },
  { id: "join", label: "В семью", path: "/join", visible: false },
  { id: "news", label: "Schwarz News", path: "/news", visible: true },
  { id: "moments", label: "Моменты", path: "/moments", visible: true },
  { id: "polls", label: "Голосования", path: "/polls", visible: false },
  { id: "stats", label: "Статистика", path: "/stats", visible: false },
];

/* ═══════════════════════════════════════════════
   SUBMIT APPLICATION (public form → localStorage)
   ═══════════════════════════════════════════════ */

export function submitApplication(form: {
  nickname: string;
  discord: string;
  age: string;
  primetime: string;
  referral: string;
  expectations: string;
  changeSurname?: string;
  [key: string]: unknown;
}): Application {
  const apps: Application[] = load("applications", []);
  const app: Application = {
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    nickname: form.nickname,
    discord: form.discord,
    age: form.age,
    server: "Seattle",
    primetime: form.primetime,
    referral: form.referral,
    expectations: form.expectations,
    status: "pending",
    adminComment: "",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
  };
  apps.unshift(app);
  save("applications", apps);
  return app;
}

/* ═══════════════════════════════════════════════
   useApplications — for admin panel
   ═══════════════════════════════════════════════ */

export function useApplications() {
  const [applications, setAppsState] = useState<Application[]>(() =>
    load("applications", [])
  );

  const refresh = () => setAppsState(load("applications", []));

  const updateApplication = (id: string, updates: Partial<Application>) => {
    const apps = load<Application[]>("applications", []).map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    save("applications", apps);
    setAppsState(apps);
  };

  const deleteApplication = (id: string) => {
    const apps = load<Application[]>("applications", []).filter(
      (a) => a.id !== id
    );
    save("applications", apps);
    setAppsState(apps);
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return { applications, updateApplication, deleteApplication, pendingCount, refresh };
}

/* ═══════════════════════════════════════════════
   useAdminData — read-only hook for public pages
   ═══════════════════════════════════════════════ */

export function useAdminData() {
  const [navItems] = useState<NavItem[]>(() =>
    load("navItems", defaultNavItems)
  );
  const [members] = useState<AdminMember[]>(() => load("members", []));
  const [announcements] = useState<Announcement[]>(() =>
    load("announcements", [])
  );
  const [customPages] = useState<CustomPage[]>(() => load("customPages", []));
  const [pageOverrides] = useState<PageOverride[]>(() =>
    load("pageOverrides", [])
  );

  const visibleNavItems = navItems.filter((n) => n.visible);
  const visibleCustomPages = customPages.filter((p) => p.visible);
  const pinnedAnnouncements = announcements.filter((a) => a.pinned);

  const getPageOverride = (pageId: string, section: string): string | null => {
    const po = pageOverrides.find((p) => p.pageId === pageId);
    return po?.sections[section] ?? null;
  };

  return {
    navItems,
    visibleNavItems,
    members,
    announcements,
    pinnedAnnouncements,
    customPages,
    visibleCustomPages,
    pageOverrides,
    getPageOverride,
  };
}

/* ═══════════════════════════════════════════════
   useAdminDataWritable — writable hook for admin panel
   ═══════════════════════════════════════════════ */

export function useAdminDataWritable() {
  const [navItems, setNavItemsState] = useState<NavItem[]>(() =>
    load("navItems", defaultNavItems)
  );
  const [members, setMembersState] = useState<AdminMember[]>(() =>
    load("members", [])
  );
  const [announcements, setAnnouncementsState] = useState<Announcement[]>(() =>
    load("announcements", [])
  );
  const [customPages, setCustomPagesState] = useState<CustomPage[]>(() =>
    load("customPages", [])
  );
  const [pageOverrides, setPageOverridesState] = useState<PageOverride[]>(() =>
    load("pageOverrides", [])
  );

  const setNavItems = useCallback((items: NavItem[]) => {
    setNavItemsState(items);
    save("navItems", items);
  }, []);

  const setMembers = useCallback((m: AdminMember[]) => {
    setMembersState(m);
    save("members", m);
  }, []);

  const setAnnouncements = useCallback((a: Announcement[]) => {
    setAnnouncementsState(a);
    save("announcements", a);
  }, []);

  const setCustomPages = useCallback((p: CustomPage[]) => {
    setCustomPagesState(p);
    save("customPages", p);
  }, []);

  const setPageOverrides = useCallback((po: PageOverride[]) => {
    setPageOverridesState(po);
    save("pageOverrides", po);
  }, []);

  const updatePageOverride = useCallback(
    (pageId: string, section: string, content: string) => {
      setPageOverridesState((prev) => {
        const existing = prev.find((p) => p.pageId === pageId);
        let updated: PageOverride[];
        if (existing) {
          updated = prev.map((p) =>
            p.pageId === pageId
              ? { ...p, sections: { ...p.sections, [section]: content } }
              : p
          );
        } else {
          updated = [...prev, { pageId, sections: { [section]: content } }];
        }
        save("pageOverrides", updated);
        return updated;
      });
    },
    []
  );

  const removePageOverride = useCallback(
    (pageId: string, section: string) => {
      setPageOverridesState((prev) => {
        const updated = prev
          .map((p) => {
            if (p.pageId !== pageId) return p;
            const sections = { ...p.sections };
            delete sections[section];
            return { ...p, sections };
          })
          .filter((p) => Object.keys(p.sections).length > 0);
        save("pageOverrides", updated);
        return updated;
      });
    },
    []
  );

  const visibleNavItems = navItems.filter((n) => n.visible);
  const visibleCustomPages = customPages.filter((p) => p.visible);
  const pinnedAnnouncements = announcements.filter((a) => a.pinned);

  const getPageOverride = (pageId: string, section: string): string | null => {
    const po = pageOverrides.find((p) => p.pageId === pageId);
    return po?.sections[section] ?? null;
  };

  return {
    navItems,
    setNavItems,
    visibleNavItems,
    members,
    setMembers,
    announcements,
    setAnnouncements,
    pinnedAnnouncements,
    customPages,
    setCustomPages,
    visibleCustomPages,
    pageOverrides,
    setPageOverrides,
    updatePageOverride,
    removePageOverride,
    getPageOverride,
  };
}

/* ═══════════════════════════════════════════════
   NEWS ARTICLE
   ═══════════════════════════════════════════════ */

export const NEWS_CATEGORIES = [
  "Семейные дела",
  "Крим. хроника",
  "Репортаж",
  "Объявление",
  "Обновление",
  "Другое",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  excerpt: string;
  coverImage?: string;
  content: string; // HTML
  author: string;
  publishedAt: string; // ISO date string for display
  published: boolean;
  createdAt: string;
}

const defaultNewsArticles: NewsArticle[] = [
  {
    id: "news_default_1",
    title: "Schwarz Family берёт од контроль FIB на Seattle",
    category: "Семейные дела",
    excerpt: "Семья Schwarz официально возглавила Федеральное Бюро Расследований на сервере Seattle. Это уже шестая лидерка в истории клана.",
    coverImage: "",
    content: `<p>В начале февраля 2026 года <strong>Schwarz Family</strong> официально получила лидерку в <strong>FIB (Федеральное Бюро Расследований)</strong> на сервере Seattle — шестую лидерку в истории семьи.</p>

<p>Руководство организации рассматривает это событие как закономерный итог многолетней работы и накопленного опыта. За плечами семьи — пять завершённых лидерок: LSPD, FIB I, LSSD, Якудза и FIB II, каждая из которых оставила след в истории сервера.</p>

<h2>Что это значит для семьи?</h2>

<p>Вступление в ряды государственной фракции означает новый цикл RP-активности: работа в паре с сервером, специальные операции, внутренние расследования. Весь состав семьи, занятый на лидерке, переключается в режим усиленной игровой активности.</p>

<p>Набор в состав лидерки продолжается. Если ты готов показать себя — подавай заявку в нашем Discord.</p>`,
    author: "Madara Schwarz",
    publishedAt: "2026-02-15",
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "news_default_2",
    title: "Открыт набор в Schwarz Family — волна 2026",
    category: "Объявление",
    excerpt: "Семья объявляет об открытии нового набора. Ищем адекватных людей с опытом RP, готовых влиться в сплочённый коллектив.",
    coverImage: "",
    content: `<p>Schwarz Family открывает набор. Мы ищем игроков, которые разделяют наши ценности: <strong>уважение, адекватность, командная игра</strong>.</p>

<h2>Требования</h2>

<p>— Возраст 16+<br/>
— Наличие микрофона<br/>
— Знание базовых правил сервера<br/>
— Опыт RP приветствуется<br/>
— Готовность сменить фамилию на <strong>Schwarz</strong></p>

<h2>Как подать заявку?</h2>

<p>Перейди на страницу <strong>«В семью»</strong> на нашем сайте и заполни форму. Рассмотрение занимает от 1 до 3 дней. Результат придёт в Discord.</p>

<p>Присоединяйся — семья ждёт.</p>`,
    author: "Madara Schwarz",
    publishedAt: "2026-02-20",
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "news_default_3",
    title: "Schwarz Redux v2.1 — обновление текстур и оптимизация",
    category: "Обновление",
    excerpt: "Выпущена новая версия фамильного Redux-пака. Обновлены текстуры персонажей, добавлены новые элементы и улучшена общая производительность.",
    coverImage: "",
    content: `<p><strong>Schwarz Redux v2.1</strong> — очередное обновление нашего фирменного пака текстур для GTA 5 RP.</p>

<h2>Что нового</h2>

<p>— Обновлены текстуры основных персонажей<br/>
— Добавлены новые элементы одежды в стиле семьи<br/>
— Оптимизация: снижен размер архива на 15%<br/>
— Исправлены конфликты с популярными модами<br/>
— Новая обложка загрузочного экрана</p>

<h2>Как установить?</h2>

<p>Ссылка на скачивание доступна в нашем <strong>Discord-сервере</strong> в канале <em>#redux</em>. Инструкция по установке прилагается.</p>

<p>Если у тебя возникли вопросы — обращайся в <em>#support</em>.</p>`,
    author: "Sebastian Schwarz",
    publishedAt: "2026-02-10",
    published: true,
    createdAt: new Date().toISOString(),
  },
];

export function useNews() {
  const [articles, setArticlesState] = useState<NewsArticle[]>(() =>
    load("newsArticles", defaultNewsArticles)
  );

  const setArticles = useCallback((a: NewsArticle[]) => {
    setArticlesState(a);
    save("newsArticles", a);
  }, []);

  const addArticle = (article: Omit<NewsArticle, "id" | "createdAt">) => {
    const newArticle: NewsArticle = {
      ...article,
      id: `news_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newArticle, ...articles];
    setArticles(updated);
    return newArticle;
  };

  const updateArticle = (id: string, updates: Partial<NewsArticle>) => {
    const updated = articles.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setArticles(updated);
  };

  const deleteArticle = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
  };

  const publishedArticles = articles.filter((a) => a.published);

  return { articles, setArticles, addArticle, updateArticle, deleteArticle, publishedArticles };
}

// Read-only version for public pages
export function usePublicNews(): NewsArticle[] {
  return load<NewsArticle[]>("newsArticles", defaultNewsArticles).filter((a) => a.published);
}
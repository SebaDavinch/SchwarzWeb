import { useState, useEffect, useCallback } from "react";
import {
  createApplication,
  deleteApplicationById,
  getAdminSnapshot,
  listApplications,
  listNews,
  listMoments,
  listPolls,
  putAdminSnapshot,
  putApplications,
  putNews,
  putMoments,
  putPolls,
  updateApplication as updateApplicationEndpoint,
  votePoll,
} from "../api/endpoints";


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

export interface Leadership {
  id: string;
  faction: string;
  server: string;
  leader: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "planned";
  color: string;
}

export interface AdminMember {
  id: string;
  name: string;
  role: "owner" | "dep_owner" | "close" | "old" | "main" | "academy" | "veteran" | "member";
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

  useEffect(() => {
    void listPolls<Poll>().then((remotePolls) => {
      if (!remotePolls) return;
      setPollsState(remotePolls);
      save("polls", remotePolls);
    });
  }, []);

  const setPolls = (p: Poll[]) => {
    setPollsState(p);
    save("polls", p);
    void putPolls(p);
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
  void votePoll({ pollId, optionId, voterId });
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
  { id: "contacts", label: "Контакты", path: "/contacts", visible: true },
  { id: "news", label: "Schwarz News", path: "/news", visible: true },
  { id: "moments", label: "Моменты", path: "/moments", visible: true },
  { id: "polls", label: "Голосования", path: "/polls", visible: false },
];

/* ══════════════════════════════════════════════
   STORAGE HELPERS
   ═══════════════════════════════════════════════ */

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`schwarz_admin_${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(`schwarz_admin_${key}`, JSON.stringify(data));
}

function syncAdminPartial(snapshot: {
  navItems?: NavItem[];
  announcements?: Announcement[];
  customPages?: CustomPage[];
  pageOverrides?: PageOverride[];
  members?: AdminMember[];
}) {
  void putAdminSnapshot(snapshot);
}

/* ═══════════════════════════════════════════════
   HOOK — read-only for public pages
   ═══════════════════════════════════════════════ */

export function useAdminData() {
  const [navItems, setNavItems] = useState<NavItem[]>(() => load("navItems", defaultNavItems));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => load("announcements", []));
  const [customPages, setCustomPages] = useState<CustomPage[]>(() => load("customPages", []));
  const [pageOverrides, setPageOverrides] = useState<PageOverride[]>(() => load("pageOverrides", []));
  const [members, setMembers] = useState<AdminMember[]>(() => load("members", []));
  const [leaderships, setLeaderships] = useState<Leadership[]>(() => load("leaderships", []));

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key?.startsWith("schwarz_admin_")) return;
      const k = e.key.replace("schwarz_admin_", "");
      if (k === "navItems") setNavItems(load("navItems", defaultNavItems));
      if (k === "announcements") setAnnouncements(load("announcements", []));
      if (k === "customPages") setCustomPages(load("customPages", []));
      if (k === "pageOverrides") setPageOverrides(load("pageOverrides", []));
      if (k === "members") setMembers(load("members", []));      if (k === "leaderships") setLeaderships(load("leaderships", []));    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    void getAdminSnapshot().then((snapshot) => {
      if (!snapshot) return;

      if (Array.isArray(snapshot.navItems)) {
        const next = snapshot.navItems as NavItem[];
        setNavItems(next);
        save("navItems", next);
      }
      if (Array.isArray(snapshot.announcements)) {
        const next = snapshot.announcements as Announcement[];
        setAnnouncements(next);
        save("announcements", next);
      }
      if (Array.isArray(snapshot.customPages)) {
        const next = snapshot.customPages as CustomPage[];
        setCustomPages(next);
        save("customPages", next);
      }
      if (Array.isArray(snapshot.pageOverrides)) {
        const next = snapshot.pageOverrides as PageOverride[];
        setPageOverrides(next);
        save("pageOverrides", next);
      }
      if (Array.isArray(snapshot.members)) {
        const next = snapshot.members as AdminMember[];
        setMembers(next);
        save("members", next);
      }
      if (Array.isArray(snapshot.leaderships)) {
        const next = snapshot.leaderships as Leadership[];
        setLeaderships(next);
        save("leaderships", next);
      }
    });
  }, []);

  const getPageOverride = useCallback(
    (pageId: string, section: string): string | null => {
      const ov = pageOverrides.find((p) => p.pageId === pageId);
      return ov?.sections?.[section] ?? null;
    },
    [pageOverrides]
  );

  const visibleNavItems = navItems.filter((n) => n.visible);
  const pinnedAnnouncements = announcements.filter((a) => a.pinned);
  const visibleCustomPages = customPages.filter((p) => p.visible);
  const activeLeadership = leaderships.find((l) => l.status === "active") ?? null;

  return {
    navItems,
    visibleNavItems,
    announcements,
    pinnedAnnouncements,
    customPages,
    visibleCustomPages,
    pageOverrides,
    getPageOverride,
    members,
    leaderships,
    activeLeadership,
  };
}

/* ═══════════════════════════════════════════════
   HOOK — writable for admin panel
   ═══════════════════════════════════════════════ */

export function useAdminDataWritable() {
  const [navItems, setNavItemsState] = useState<NavItem[]>(() => load("navItems", defaultNavItems));
  const [customPages, setCustomPagesState] = useState<CustomPage[]>(() => load("customPages", []));
  const [pageOverrides, setPageOverridesState] = useState<PageOverride[]>(() => load("pageOverrides", []));

  // Hydrate from API so edits persist across devices/browsers
  useEffect(() => {
    void getAdminSnapshot().then((snapshot) => {
      if (!snapshot) return;
      if (Array.isArray(snapshot.navItems)) {
        const next = snapshot.navItems as NavItem[];
        setNavItemsState(next);
        save("navItems", next);
      }
      if (Array.isArray(snapshot.customPages)) {
        const next = snapshot.customPages as CustomPage[];
        setCustomPagesState(next);
        save("customPages", next);
      }
      if (Array.isArray(snapshot.pageOverrides)) {
        const next = snapshot.pageOverrides as PageOverride[];
        setPageOverridesState(next);
        save("pageOverrides", next);
      }
    });
  }, []);

  const setNavItems = (items: NavItem[]) => {
    setNavItemsState(items);
    save("navItems", items);
    syncAdminPartial({ navItems: items });
  };

  const setCustomPages = (pages: CustomPage[]) => {
    setCustomPagesState(pages);
    save("customPages", pages);
    syncAdminPartial({ customPages: pages });
  };

  const setPageOverrides = (overrides: PageOverride[]) => {
    setPageOverridesState(overrides);
    save("pageOverrides", overrides);
    syncAdminPartial({ pageOverrides: overrides });
  };

  const updatePageOverride = (pageId: string, section: string, content: string) => {
    const updated = [...pageOverrides];
    const idx = updated.findIndex((p) => p.pageId === pageId);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], sections: { ...updated[idx].sections, [section]: content } };
    } else {
      updated.push({ pageId, sections: { [section]: content } });
    }
    setPageOverrides(updated);
  };

  const removePageOverride = (pageId: string, section: string) => {
    const updated = pageOverrides.map((p) => {
      if (p.pageId !== pageId) return p;
      const { [section]: _, ...rest } = p.sections;
      return { ...p, sections: rest };
    }).filter((p) => Object.keys(p.sections).length > 0);
    setPageOverrides(updated);
  };

  return {
    navItems,
    setNavItems,
    customPages,
    setCustomPages,
    pageOverrides,
    setPageOverrides,
    updatePageOverride,
    removePageOverride,
  };
}

/* ═══════════════════════════════════════════════
   APPLICATIONS — submit from public, manage in admin
   ═══════════════════════════════════════════════ */

export function submitApplication(app: Omit<Application, "id" | "status" | "adminComment" | "submittedAt" | "reviewedAt" | "reviewedBy">) {
  const applications: Application[] = load("applications", []);
  const newApp: Application = {
    ...app,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    status: "pending",
    adminComment: "",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
  };
  applications.unshift(newApp);
  save("applications", applications);
  void createApplication(newApp);
  return newApp;
}

export function useApplications() {
  const [applications, setApplicationsState] = useState<Application[]>(() => load("applications", []));

  useEffect(() => {
    void listApplications<Application>().then((remoteApps) => {
      if (!remoteApps) return;
      setApplicationsState(remoteApps);
      save("applications", remoteApps);
    });
  }, []);

  const setApplications = (apps: Application[]) => {
    setApplicationsState(apps);
    save("applications", apps);
    void putApplications(apps);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    const updated = applications.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setApplications(updated);
    void updateApplicationEndpoint<Application>(id, updates);
  };

  const deleteApplication = (id: string) => {
    setApplications(applications.filter((a) => a.id !== id));
    void deleteApplicationById(id);
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return { applications, setApplications, updateApplication, deleteApplication, pendingCount };
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
  publishedAt: string;
  published: boolean;
  createdAt: string;
}

const defaultNewsArticles: NewsArticle[] = [];

export function useNews() {
  const [articles, setArticlesState] = useState<NewsArticle[]>(() =>
    load("newsArticles", defaultNewsArticles)
  );

  useEffect(() => {
    void listNews<NewsArticle>().then((remote) => {
      if (!remote || remote.length === 0) return;
      setArticlesState(remote);
      save("newsArticles", remote);
    });
  }, []);

  const setArticles = useCallback((a: NewsArticle[]) => {
    setArticlesState(a);
    save("newsArticles", a);
    void putNews(a);
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

export function usePublicNews(): NewsArticle[] {
  return load<NewsArticle[]>("newsArticles", defaultNewsArticles).filter((a) => a.published);
}

/* ═══════════════════════════════════════════════
   MOMENTS
   ═══════════════════════════════════════════════ */

export type MomentCategory =
  | "leadership"
  | "vzp"
  | "family"
  | "raids"
  | "streams"
  | "other";

export const MOMENT_CATEGORIES: { id: MomentCategory; label: string; color: string; emoji: string }[] = [
  { id: "leadership", label: "Лидерки", color: "#9b2335", emoji: "🏆" },
  { id: "vzp", label: "ВЗП", color: "#f59e0b", emoji: "🏙" },
  { id: "family", label: "Семья", color: "#ff3366", emoji: "👨‍👩‍👦" },
  { id: "raids", label: "Рейды", color: "#a855f7", emoji: "⚔️" },
  { id: "streams", label: "Стримы", color: "#9146ff", emoji: "📡" },
  { id: "other", label: "Другое", color: "#6b7280", emoji: "📸" },
];

export interface Moment {
  id: string;
  title: string;
  description?: string;
  url: string;
  videoUrl?: string;
  type: "photo" | "video";
  category: MomentCategory;
  date: string;
  author: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

export function useMoments() {
  const [moments, setMomentsState] = useState<Moment[]>(() =>
    load("moments", [] as Moment[])
  );

  useEffect(() => {
    void listMoments<Moment>().then((remote) => {
      if (!remote || remote.length === 0) return;
      setMomentsState(remote);
      save("moments", remote);
    });
  }, []);

  const setMoments = useCallback((m: Moment[]) => {
    setMomentsState(m);
    save("moments", m);
    void putMoments(m);
  }, []);

  return { moments, setMoments };
}

export function usePublicMoments(): Moment[] {
  return load<Moment[]>("moments", []).filter((m) => m.visible);
}
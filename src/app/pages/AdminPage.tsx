import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Eye,
  EyeOff,
  LayoutDashboard,
  Users,
  Crown,
  FileText,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronRight,
  Shield,
  Star,
  User,
  Activity,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Gamepad2,
  Megaphone,
  Image as ImageIcon,
  ExternalLink,
  PanelTop,
  Globe,
  UserPlus,
  Home,
  ClipboardList,
  Bell,
  Send,
  ToggleLeft,
  ToggleRight,
  Vote,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router";
import { useAdminDataWritable, useApplications, addAuditLog, type AuditLogEntry } from "../hooks/useAdminData";
import {
  putAdminSnapshot,
  getAdminSnapshot,
  loginAdmin,
  listAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
  type StaffAccountResponse,
} from "../api/endpoints";
import { NavbarEditor } from "../components/admin/NavbarEditor";
import { PagesEditor } from "../components/admin/PagesEditor";
import { ApplicationsTab } from "../components/admin/ApplicationsTab";
import { PollsTab } from "../components/admin/PollsTab";
import { TelegramBotTab } from "../components/admin/TelegramBotTab";
import {
  getWebhookConfig,
  saveWebhookConfig,
  getWebhookEvents,
  saveWebhookEvents,
  testWebhook,
  notifyMemberAdded,
  notifyMemberRemoved,
  notifyNewAnnouncement,
  notifyLeadershipChange,
  DEFAULT_WEBHOOK_CONFIG,
  DEFAULT_WEBHOOK_EVENTS,
  type WebhookConfig,
  type WebhookEvents,
} from "../hooks/useDiscordWebhook";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

type Tab =
  | "dashboard"
  | "members"
  | "leaderships"
  | "announcements"
  | "applications"
  | "rules"
  | "pages"
  | "navbar"
  | "settings"
  | "polls"
  | "auditlog"
  | "accounts"
  | "telegram_bot";

/* Permission-to-tab mapping */
const tabPermissions: Record<Tab, string | null> = {
  dashboard: "view_admin",
  members: "manage_members",
  leaderships: "manage_leaderships",
  announcements: "manage_announcements",
  applications: "manage_members",
  rules: "manage_rules",
  settings: "manage_settings",
  pages: "manage_settings",
  navbar: "manage_settings",
  polls: "manage_settings",
  auditlog: "manage_settings",
  accounts: "all",
  telegram_bot: "manage_settings",
};

interface Member {
  id: string;
  name: string;
  role: "owner" | "dep_owner" | "veteran" | "member";
  joinDate: string;
  active: boolean;
  badges?: string[];
}

interface Leadership {
  id: string;
  faction: string;
  server: string;
  leader: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "planned";
  color: string;
}

interface Announcement {
  id: string;
  title: string;
  text: string;
  date: string;
  priority: "low" | "normal" | "high";
  pinned?: boolean;
}

interface Rule {
  id: string;
  num: string;
  title: string;
  text: string;
  accent: string;
}

interface Principle {
  id: string;
  text: string;
}

interface StaffMember {
  id: string;
  name: string;
  position: string;
  permissions: string[];
  active: boolean;
}

/* ═══════════════════════════════════════════════
   INITIAL DATA
   ═══════════════════════════════════════════════ */

const defaultMembers: Member[] = [
  { id: "1", name: "Madara Schwarz", role: "owner", joinDate: "2024-01-01", active: true, badges: ["streamer", "fib", "leader"] },
  { id: "2", name: "Akihiro Schwarz", role: "dep_owner", joinDate: "2024-02-15", active: true, badges: ["fib", "leader"] },
  { id: "3", name: "Roman Schwarz", role: "dep_owner", joinDate: "2024-03-10", active: true, badges: ["fib", "leader"] },
  { id: "4", name: "Kerro Schwarz", role: "veteran", joinDate: "2024-04-01", active: true },
  { id: "5", name: "Turbo Schwarz", role: "veteran", joinDate: "2024-04-15", active: true },
  { id: "6", name: "Ilia Schwarz", role: "veteran", joinDate: "2024-05-01", active: true },
  { id: "7", name: "Jay Schwarz", role: "veteran", joinDate: "2024-05-20", active: true },
  { id: "8", name: "Anti Schwarz", role: "veteran", joinDate: "2024-06-01", active: true },
  { id: "9", name: "Richie Schwarz", role: "veteran", joinDate: "2024-06-15", active: true },
  { id: "10", name: "Voldemar Schwarz", role: "veteran", joinDate: "2024-07-01", active: true },
  { id: "11", name: "Brooklyn Schwarz", role: "member", joinDate: "2024-08-01", active: true },
  { id: "12", name: "Marka Schwarz", role: "member", joinDate: "2024-08-15", active: true },
  { id: "13", name: "Krasty Schwarz", role: "member", joinDate: "2024-09-01", active: true },
  { id: "14", name: "Patrick Schwarz", role: "member", joinDate: "2024-09-15", active: true },
];

const defaultLeaderships: Leadership[] = [
  { id: "1", faction: "LSPD", server: "Harmony", leader: "Madara Schwarz", startDate: "2024-08-15", endDate: "2024-10-01", status: "completed", color: "#3b82f6" },
  { id: "2", faction: "FIB I", server: "Harmony", leader: "Roman Schwarz", startDate: "2024-12-18", endDate: "2025-01-18", status: "completed", color: "#1e40af" },
  { id: "3", faction: "LSSD", server: "Harmony", leader: "Borsch Schwarz", startDate: "2025-03-01", endDate: "2025-05-15", status: "completed", color: "#92400e" },
  { id: "4", faction: "Yakuza", server: "Harmony", leader: "Madara Schwarz", startDate: "2025-07-01", endDate: "2025-09-30", status: "completed", color: "#dc2626" },
  { id: "5", faction: "FIB II", server: "Harmony", leader: "Akihiro Schwarz", startDate: "2025-10-27", endDate: "2026-01-12", status: "completed", color: "#1e3a5f" },
  { id: "6", faction: "FIB", server: "Seattle", leader: "TBD", startDate: "2026-02-01", endDate: "", status: "active", color: "#f59e0b" },
];

const defaultAnnouncements: Announcement[] = [
  { id: "1", title: "Набор в семью открыт", text: "Принимаем заявки от адекватных игроков с опытом RP. Требования: 16+, микрофон, знание правил сервера.", date: "2026-02-20", priority: "high", pinned: true },
  { id: "2", title: "Новая лидерка FIB Seattle", text: "Schwarz Family берёт под контроль FIB на сервере Seattle. Подробности в разделе «Текущая лидерка».", date: "2026-02-15", priority: "normal", pinned: true },
  { id: "3", title: "Обновление Redux v2.1", text: "Вышла новая версия Schwarz Redux с улучшенными текстурами и оптимизацией. Скачивайте в Discord.", date: "2026-02-10", priority: "low" },
];

const defaultRules: Rule[] = [
  { id: "1", num: "I", title: "Уважай своих", text: "Не делай того, что может задеть твоего софамовца. У каждого свои границы — и у каждого они разные. Избегай конфликтов внутри. Семья — это безопасная территория, а не поле боя.", accent: "#ff3366" },
  { id: "2", num: "II", title: "Решай, а не молчи", text: "Стал участником конфликта — выходи на контакт, разговаривай, прикладывай усилия, чтобы всё сошло на нет. Тот, кто молчит, усугубляет. Если компромисс не найден — фаму покидают оба.", accent: "#ff5577" },
  { id: "3", num: "III", title: "Ушёл — не вернёшься", text: "Кто покинул фаму по собственной воле — обратной дороги нет. Эмоции не должны стоить двух кликов и покинутого дискорда. Исключения возможны — но причина должна быть железной.", accent: "#ff7744" },
  { id: "4", num: "IV", title: "Что внутри — остаётся внутри", text: "Всё, что происходит в фаме — ссоры, обсуждения, мысли, фразы, разговоры — не выносится наружу. Ни при каких обстоятельствах. Нарушитель покидает фаму без права на возврат.", accent: "#cc44ff" },
];

const defaultPrinciples: Principle[] = [
  { id: "1", text: "Не нарушать жёстко правила сервера" },
  { id: "2", text: "Быть адекватным за пределами семьи" },
  { id: "3", text: "Рассудительно относиться к любым РП-ситуациям" },
  { id: "4", text: "Помогать и поддерживать друг друга" },
  { id: "5", text: "Уважать каждого — без исключений" },
  { id: "6", text: "Не опускаться до уровня животных, даже если животное напротив тебя" },
];

const allPermissions = [
  "manage_members",
  "manage_rules",
  "manage_leaderships",
  "manage_announcements",
  "manage_settings",
  "manage_media",
  "manage_staff",
  "view_admin",
] as const;

const permissionLabels: Record<string, string> = {
  manage_members: "Управление составом",
  manage_rules: "Редактирование правил",
  manage_leaderships: "Управление лидерками",
  manage_announcements: "Объявления",
  manage_settings: "Настройки",
  manage_media: "Управление медиа",
  manage_staff: "Управление стаффом",
  view_admin: "Доступ к админке",
};

const defaultStaff: StaffMember[] = [
  { id: "1", name: "Madara Schwarz", position: "Owner", permissions: [...allPermissions], active: true },
  { id: "2", name: "Akihiro Schwarz", position: "Dep. Owner", permissions: ["manage_members", "manage_leaderships", "manage_announcements", "view_admin"], active: true },
  { id: "3", name: "Roman Schwarz", position: "Dep. Owner", permissions: ["manage_members", "manage_leaderships", "manage_announcements", "view_admin"], active: true },
  { id: "4", name: "Sebastian Schwarz", position: "Web Developer", permissions: ["manage_settings", "manage_media", "view_admin"], active: true },
];

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */

function loadState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`schwarz_admin_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, data: T) {
  localStorage.setItem(`schwarz_admin_${key}`, JSON.stringify(data));
}

const roleLabels: Record<Member["role"], string> = {
  owner: "Owner",
  dep_owner: "Dep. Owner",
  veteran: "Ветеран",
  member: "Участник",
};

const roleColors: Record<Member["role"], string> = {
  owner: "#9b2335",
  dep_owner: "#7a1c2a",
  veteran: "#f59e0b",
  member: "#888899",
};

/* Badge definitions */
const AVAILABLE_BADGES: { id: string; label: string; color: string; category: string }[] = [
  // Работы
  { id: "fisherman", label: "Рыбак", color: "#3b82f6", category: "Работы" },
  { id: "miner", label: "Шахтёр", color: "#a855f7", category: "Работы" },
  { id: "trucker", label: "Дальнобойщик", color: "#f97316", category: "Работы" },
  { id: "farmer", label: "Фермер", color: "#22c55e", category: "Работы" },
  { id: "mechanic", label: "Механик", color: "#ef4444", category: "Работы" },
  { id: "pilot", label: "Пилот", color: "#06b6d4", category: "Работы" },
  // Фракции
  { id: "lspd", label: "LSPD", color: "#3b82f6", category: "Фракции" },
  { id: "lssd", label: "LSSD", color: "#f59e0b", category: "Фракции" },
  { id: "fib", label: "FIB", color: "#8b5cf6", category: "Фракции" },
  { id: "ems", label: "EMS", color: "#ef4444", category: "Фракции" },
  { id: "gov", label: "GOV", color: "#10b981", category: "Фракции" },
  { id: "army", label: "Army", color: "#6b7280", category: "Фракции" },
  { id: "news", label: "News", color: "#ec4899", category: "Фракции" },
  // Особые
  { id: "streamer", label: "Стример", color: "#9146ff", category: "Особые" },
  { id: "leader", label: "Экс-л��дер", color: "#ff3366", category: "Особые" },
  { id: "developer", label: "Разработчик", color: "#9b2335", category: "Особые" },
];

const badgeMap = Object.fromEntries(AVAILABLE_BADGES.map((b) => [b.id, b]));

const roleIcons: Record<Member["role"], typeof Crown> = {
  owner: Crown,
  dep_owner: Shield,
  veteran: Star,
  member: User,
};

const priorityColors: Record<Announcement["priority"], string> = {
  low: "#888899",
  normal: "#9b2335",
  high: "#ff3366",
};

const statusLabels: Record<Leadership["status"], string> = {
  active: "Активна",
  completed: "Завершена",
  planned: "Планируется",
};

const statusColors: Record<Leadership["status"], string> = {
  active: "#9b2335",
  completed: "#888899",
  planned: "#f59e0b",
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ═══════════════════════════════════════════════
   LOGIN SCREEN
   ═══════════════════════════════════════════════ */

function LoginScreen({
  onLogin,
}: {
  onLogin: (account: StaffAccountResponse) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setErrorMsg("");

    const result = await loginAdmin(username.trim(), password);
    if (result?.ok && result.account) {
      onLogin(result.account);
    } else {
      const msg = result === null ? "Сервер недоступен. Запустите npm run api" : "Неверный логин или пароль";
      setErrorMsg(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#9b2335]/3 blur-[200px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative"
      >
        <div className="text-center mb-10">
          <h1
            className="font-['Russo_One'] text-[#9b2335]"
            style={{ fontSize: "1.5rem", letterSpacing: "0.05em" }}
          >
            SCHWARZ FAMILY
          </h1>
          <p
            className="font-['Oswald'] text-white/20 uppercase tracking-[0.3em] mt-2"
            style={{ fontSize: "0.65rem" }}
          >
            Панель управления
          </p>
        </div>

        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="border border-white/8 bg-white/[0.02] p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#9b2335]/15 bg-[#9b2335]/5">
              <Lock size={18} className="text-[#9b2335]/50" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-['Oswald'] text-white uppercase tracking-wider" style={{ fontSize: "0.85rem" }}>
                Авторизация
              </p>
              <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.7rem" }}>
                Введите логин и пароль
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Логин"
              autoFocus
              autoComplete="username"
              className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-4 py-3 outline-none transition-colors duration-300"
              style={{ fontSize: "0.85rem" }}
            />
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                autoComplete="current-password"
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-4 py-3 pr-12 outline-none transition-colors duration-300"
                style={{ fontSize: "0.85rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="font-['Oswald'] text-[#ff3366]/60 tracking-wide"
                  style={{ fontSize: "0.72rem" }}
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full font-['Oswald'] uppercase tracking-[0.2em] text-white bg-[#9b2335] hover:bg-[#b52a40] py-3 transition-all duration-300 hover:shadow-[0_0_30px_rgba(155,35,53,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontSize: "0.8rem" }}
            >
              {loading ? "Проверка..." : "Войти"}
            </button>
          </form>
        </motion.div>

        <p className="text-center mt-6 font-['Oswald'] text-white/10 tracking-wide" style={{ fontSize: "0.65rem" }}>
          Доступ только для администрации Schwarz Family
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════ */

const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Дашборд", icon: LayoutDashboard },
  { id: "members", label: "Состав", icon: Users },
  { id: "leaderships", label: "Лидерки", icon: Crown },
  { id: "announcements", label: "Объявления", icon: Megaphone },
  { id: "applications", label: "Заявки", icon: UserPlus },
  { id: "rules", label: "Правила & Стафф", icon: FileText },
  { id: "pages", label: "Страницы", icon: Globe },
  { id: "navbar", label: "Навигация", icon: PanelTop },
  { id: "polls", label: "Голосования", icon: Vote },
  { id: "auditlog", label: "Аудит-лог", icon: ClipboardList },
  { id: "settings", label: "Настройки", icon: Settings },
  { id: "accounts", label: "Аккаунты", icon: KeyRound },
  { id: "telegram_bot", label: "Telegram Bot", icon: Send },
];

function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  collapsed,
  pendingApps,
  allowedTabs,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onLogout: () => void;
  collapsed: boolean;
  pendingApps?: number;
  allowedTabs?: Tab[];
}) {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#0d0d15] border-r border-white/5 flex flex-col z-40 transition-all duration-300 ${
        collapsed ? "w-[60px]" : "w-[220px]"
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-white/5 shrink-0">
        <span
          className="font-['Russo_One'] text-[#9b2335] truncate"
          style={{ fontSize: collapsed ? "0.8rem" : "0.95rem" }}
        >
          {collapsed ? "SF" : "SCHWARZ"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {sidebarItems.map((item) => {
          const active = activeTab === item.id;
          const blocked = allowedTabs && !allowedTabs.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => !blocked && onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 ${
                blocked
                  ? "text-white/8 cursor-not-allowed"
                  : active
                    ? "text-[#9b2335] bg-[#9b2335]/5 border-r-2 border-[#9b2335]"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
              }`}
              title={blocked ? `${item.label} — нет доступа` : item.label}
              disabled={!!blocked}
            >
              <item.icon size={18} strokeWidth={1.5} className="shrink-0" />
              {!collapsed && (
                <span className="font-['Oswald'] uppercase tracking-wider truncate flex-1" style={{ fontSize: "0.72rem" }}>
                  {item.label}
                </span>
              )}
              {blocked && !collapsed && (
                <Lock size={12} className="shrink-0 text-white/8" />
              )}
              {!blocked && item.id === "applications" && !!pendingApps && pendingApps > 0 && (
                <span
                  className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#ff3366] text-white font-['Oswald']"
                  style={{ fontSize: "0.55rem", padding: "0 4px" }}
                >
                  {pendingApps}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-white/5 p-3 space-y-1">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 text-white/20 hover:text-[#9b2335]/60 transition-colors duration-300"
          title="На главную"
        >
          <Home size={16} strokeWidth={1.5} className="shrink-0" />
          {!collapsed && (
            <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.68rem" }}>
              На главную
            </span>
          )}
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-white/20 hover:text-[#ff3366]/60 transition-colors duration-300"
          title="Выйти"
        >
          <LogOut size={16} strokeWidth={1.5} className="shrink-0" />
          {!collapsed && (
            <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.68rem" }}>
              Выйти
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════════ */

function DashboardTab({
  members,
  leaderships,
  announcements,
  pendingApps,
}: {
  members: Member[];
  leaderships: Leadership[];
  announcements: Announcement[];
  pendingApps: number;
}) {
  const activeMembers = members.filter((m) => m.active).length;
  const activeLeaderships = leaderships.filter((l) => l.status === "active").length;
  const completedLeaderships = leaderships.filter((l) => l.status === "completed").length;

  const stats = [
    { label: "Участников", value: activeMembers, icon: Users, color: "#9b2335" },
    { label: "Активных лидерок", value: activeLeaderships, icon: Crown, color: "#f59e0b" },
    { label: "Заявок ожидает", value: pendingApps, icon: UserPlus, color: "#ff3366" },
    { label: "Объявлений", value: announcements.length, icon: Megaphone, color: "#9146ff" },
  ];

  return (
    <div>
      <h2 className="font-['Russo_One'] text-white mb-8" style={{ fontSize: "1.5rem" }}>
        Дашборд
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="border border-white/5 bg-white/[0.01] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon size={18} style={{ color: s.color, opacity: 0.5 }} strokeWidth={1.5} />
              <span
                className="font-['Russo_One']"
                style={{ fontSize: "1.8rem", color: s.color, filter: `drop-shadow(0 0 10px ${s.color}33)` }}
              >
                {s.value}
              </span>
            </div>
            <p className="font-['Oswald'] text-white/25 uppercase tracking-wider" style={{ fontSize: "0.65rem" }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members by role */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <h3 className="font-['Oswald'] text-white/60 uppercase tracking-wider mb-5" style={{ fontSize: "0.75rem" }}>
            Состав по рангам
          </h3>
          {(["owner", "dep_owner", "veteran", "member"] as Member["role"][]).map((role) => {
            const count = members.filter((m) => m.role === role && m.active).length;
            const total = activeMembers;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={role} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.75rem" }}>
                    {roleLabels[role]}
                  </span>
                  <span className="font-['Oswald'] text-white/25" style={{ fontSize: "0.7rem" }}>
                    {count}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-full"
                    style={{ background: roleColors[role] }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent announcements */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <h3 className="font-['Oswald'] text-white/60 uppercase tracking-wider mb-5" style={{ fontSize: "0.75rem" }}>
            Последние объявления
          </h3>
          {announcements.slice(0, 4).map((a) => (
            <div key={a.id} className="flex items-start gap-3 mb-4 last:mb-0">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ background: priorityColors[a.priority] }}
              />
              <div>
                <p className="font-['Oswald'] text-white/50 tracking-wide" style={{ fontSize: "0.78rem" }}>
                  {a.title}
                </p>
                <p className="font-['Oswald'] text-white/15 tracking-wide mt-0.5" style={{ fontSize: "0.65rem" }}>
                  {a.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active leaderships */}
      <div className="mt-6 border border-white/5 bg-white/[0.01] p-6">
        <h3 className="font-['Oswald'] text-white/60 uppercase tracking-wider mb-5" style={{ fontSize: "0.75rem" }}>
          Активные лидерки
        </h3>
        {leaderships.filter((l) => l.status === "active").length === 0 ? (
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.75rem" }}>
            Нет активных лидерок
          </p>
        ) : (
          <div className="space-y-3">
            {leaderships
              .filter((l) => l.status === "active")
              .map((l) => (
                <div key={l.id} className="flex items-center gap-4 p-3 border border-white/5 bg-white/[0.01]">
                  <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                  <div className="flex-1">
                    <span className="font-['Oswald'] text-white/60 tracking-wide" style={{ fontSize: "0.82rem" }}>
                      {l.faction}
                    </span>
                    <span className="font-['Oswald'] text-white/20 tracking-wide ml-3" style={{ fontSize: "0.7rem" }}>
                      {l.server}
                    </span>
                  </div>
                  <span className="font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.72rem" }}>
                    {l.leader}
                  </span>
                  <span
                    className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider border"
                    style={{
                      fontSize: "0.55rem",
                      color: statusColors[l.status],
                      borderColor: `${statusColors[l.status]}30`,
                      background: `${statusColors[l.status]}08`,
                    }}
                  >
                    {statusLabels[l.status]}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BADGE PICKER
   ═══════════════════════════════════════════════ */

function BadgePicker({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const categories = [...new Set(AVAILABLE_BADGES.map((b) => b.category))];
  return (
    <div className="mt-2 border border-white/8 bg-[#0d0d15] p-3">
      {categories.map((cat) => (
        <div key={cat} className="mb-3 last:mb-0">
          <span className="font-['Oswald'] text-white/20 uppercase tracking-wider block mb-1.5" style={{ fontSize: "0.55rem" }}>
            {cat}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_BADGES.filter((b) => b.category === cat).map((b) => {
              const isSelected = selected.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => onToggle(b.id)}
                  className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
                  style={{
                    fontSize: "0.55rem",
                    color: isSelected ? b.color : "rgba(255,255,255,0.2)",
                    background: isSelected ? `${b.color}15` : "transparent",
                    borderColor: isSelected ? `${b.color}40` : "rgba(255,255,255,0.06)",
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MEMBERS TAB
   ═════════════════════════════════════════════���═ */

function MembersTab({
  members,
  setMembers,
}: {
  members: Member[];
  setMembers: (m: Member[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Member["role"]>("member");
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<Member["role"]>("member");
  const [editBadges, setEditBadges] = useState<string[]>([]);
  const [filter, setFilter] = useState<Member["role"] | "all">("all");
  const [badgePickerFor, setBadgePickerFor] = useState<"add" | "edit" | null>(null);

  const filtered = filter === "all" ? members : members.filter((m) => m.role === filter);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const updated = [
      ...members,
      {
        id: generateId(),
        name: newName.trim(),
        role: newRole,
        joinDate: new Date().toISOString().split("T")[0],
        active: true,
        badges: newBadges.length > 0 ? [...newBadges] : undefined,
      },
    ];
    setMembers(updated);
    addAuditLog("Добавлен участник", "members", `${newName.trim()} (${newRole})`);
    notifyMemberAdded(newName.trim(), newRole);
    setNewName("");
    setNewRole("member");
    setNewBadges([]);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const member = members.find((m) => m.id === id);
    setMembers(members.filter((m) => m.id !== id));
    if (member) {
      addAuditLog("Удалён участник", "members", member.name);
      notifyMemberRemoved(member.name);
    }
  };

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditRole(m.role);
    setEditBadges(m.badges || []);
  };

  const handleSaveEdit = (id: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, name: editName.trim() || m.name, role: editRole, badges: editBadges.length > 0 ? [...editBadges] : undefined } : m
      )
    );
    addAuditLog("Отредактирован участник", "members", editName.trim() || id);
    setEditingId(null);
    setBadgePickerFor(null);
  };

  const toggleActive = (id: string) => {
    const member = members.find((m) => m.id === id);
    setMembers(members.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));
    if (member) addAuditLog(member.active ? "Деактивирован" : "Активирован", "members", member.name);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.5rem" }}>
          Состав
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all duration-300"
          style={{ fontSize: "0.72rem" }}
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(["all", "owner", "dep_owner", "veteran", "member"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-300 ${
              filter === r
                ? "text-[#9b2335] border-[#9b2335]/30 bg-[#9b2335]/5"
                : "text-white/25 border-white/5 hover:border-white/10"
            }`}
            style={{ fontSize: "0.62rem" }}
          >
            {r === "all" ? "Все" : roleLabels[r]}
          </button>
        ))}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
              <div className="flex items-end gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    Имя
                  </label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Имя Schwarz"
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>
                <div className="min-w-[150px]">
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    Роль
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Member["role"])}
                    className="w-full bg-[#0d0d15] border border-white/8 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <option value="member">Участник</option>
                    <option value="veteran">Ветеран</option>
                    <option value="dep_owner">Dep. Owner</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
                    style={{ fontSize: "0.7rem" }}
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={() => { setShowAdd(false); setNewBadges([]); }}
                    className="px-4 py-2 font-['Oswald'] text-white/30 border border-white/8 hover:border-white/15 transition-all"
                    style={{ fontSize: "0.7rem" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Badges for new member */}
              <div className="mt-4">
                <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                  Бейджи
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newBadges.map((bId) => {
                    const b = badgeMap[bId];
                    if (!b) return null;
                    return (
                      <span
                        key={bId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 font-['Oswald'] uppercase tracking-wider cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ fontSize: "0.55rem", color: b.color, background: `${b.color}12`, border: `1px solid ${b.color}30` }}
                        onClick={() => setNewBadges(newBadges.filter((x) => x !== bId))}
                        title="Убрать"
                      >
                        {b.label} <X size={10} />
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => setBadgePickerFor(badgePickerFor === "add" ? null : "add")}
                  className="px-3 py-1 font-['Oswald'] text-white/25 uppercase tracking-wider border border-white/8 hover:border-white/15 transition-all"
                  style={{ fontSize: "0.6rem" }}
                >
                  + Добавить бейдж
                </button>
                {badgePickerFor === "add" && (
                  <BadgePicker
                    selected={newBadges}
                    onToggle={(id) =>
                      setNewBadges(newBadges.includes(id) ? newBadges.filter((x) => x !== id) : [...newBadges, id])
                    }
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members list */}
      <div className="space-y-2">
        {filtered.map((m) => {
          const Icon = roleIcons[m.role];
          const isEditing = editingId === m.id;
          return (
            <motion.div
              key={m.id}
              layout
              className={`flex items-center gap-4 p-4 border transition-all duration-300 ${
                m.active
                  ? "border-white/5 bg-white/[0.01]"
                  : "border-white/[0.03] bg-white/[0.005] opacity-50"
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${roleColors[m.role]}10`, border: `1px solid ${roleColors[m.role]}25` }}
              >
                <Icon size={14} style={{ color: roleColors[m.role], opacity: 0.6 }} />
              </div>

              {isEditing ? (
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-[180px] bg-[#0d0d15] border border-white/10 text-white/80 font-['Oswald'] tracking-wide px-3 py-1.5 outline-none"
                      style={{ fontSize: "0.82rem" }}
                      autoFocus
                    />
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as Member["role"])}
                      className="bg-[#0d0d15] border border-white/10 text-white/80 font-['Oswald'] tracking-wide px-2 py-1.5 outline-none"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <option value="member">Участник</option>
                      <option value="veteran">Ветеран</option>
                      <option value="dep_owner">Dep. Owner</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button onClick={() => handleSaveEdit(m.id)} className="text-[#9b2335]/60 hover:text-[#9b2335] transition-colors">
                      <Save size={16} />
                    </button>
                    <button onClick={() => { setEditingId(null); setBadgePickerFor(null); }} className="text-white/20 hover:text-white/40 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  {/* Edit badges */}
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {editBadges.map((bId) => {
                        const b = badgeMap[bId];
                        if (!b) return null;
                        return (
                          <span
                            key={bId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 font-['Oswald'] uppercase tracking-wider cursor-pointer hover:opacity-70 transition-opacity"
                            style={{ fontSize: "0.5rem", color: b.color, background: `${b.color}12`, border: `1px solid ${b.color}30` }}
                            onClick={() => setEditBadges(editBadges.filter((x) => x !== bId))}
                            title="Убрать"
                          >
                            {b.label} <X size={9} />
                          </span>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setBadgePickerFor(badgePickerFor === "edit" ? null : "edit")}
                      className="px-2 py-0.5 font-['Oswald'] text-white/20 uppercase tracking-wider border border-white/6 hover:border-white/12 transition-all"
                      style={{ fontSize: "0.55rem" }}
                    >
                      + Бейдж
                    </button>
                    {badgePickerFor === "edit" && (
                      <BadgePicker
                        selected={editBadges}
                        onToggle={(id) =>
                          setEditBadges(editBadges.includes(id) ? editBadges.filter((x) => x !== id) : [...editBadges, id])
                        }
                      />
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="font-['Oswald'] text-white/70 tracking-wide" style={{ fontSize: "0.85rem" }}>
                      {m.name}
                    </span>
                    {m.badges && m.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.badges.map((bId) => {
                          const b = badgeMap[bId];
                          if (!b) return null;
                          return (
                            <span
                              key={bId}
                              className="px-1.5 py-px font-['Oswald'] uppercase tracking-wider"
                              style={{ fontSize: "0.48rem", color: b.color, background: `${b.color}10`, border: `1px solid ${b.color}20` }}
                            >
                              {b.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <span
                    className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider border shrink-0"
                    style={{
                      fontSize: "0.55rem",
                      color: roleColors[m.role],
                      borderColor: `${roleColors[m.role]}25`,
                      background: `${roleColors[m.role]}08`,
                    }}
                  >
                    {roleLabels[m.role]}
                  </span>
                  <span className="font-['Oswald'] text-white/15 tracking-wide hidden sm:inline" style={{ fontSize: "0.68rem" }}>
                    {m.joinDate}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(m.id)}
                      className={`p-1.5 transition-colors ${m.active ? "text-[#9b2335]/30 hover:text-[#9b2335]/60" : "text-white/10 hover:text-white/30"}`}
                      title={m.active ? "Деактивировать" : "Активировать"}
                    >
                      <Activity size={14} />
                    </button>
                    <button onClick={() => startEdit(m)} className="text-white/15 hover:text-[#f59e0b]/60 p-1.5 transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-white/15 hover:text-[#ff3366]/60 p-1.5 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="font-['Oswald'] text-white/10 tracking-wide mt-6 text-center" style={{ fontSize: "0.65rem" }}>
        Всего: {members.length} · Активных: {members.filter((m) => m.active).length}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LEADERSHIPS TAB
   ═══════════════════════════════════════════════ */

function LeadershipsTab({
  leaderships,
  setLeaderships,
}: {
  leaderships: Leadership[];
  setLeaderships: (l: Leadership[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    faction: "",
    server: "",
    leader: "",
    startDate: "",
    endDate: "",
    status: "planned" as Leadership["status"],
    color: "#9b2335",
  });

  const resetForm = () => {
    setForm({ faction: "", server: "", leader: "", startDate: "", endDate: "", status: "planned", color: "#9b2335" });
  };

  const handleAdd = () => {
    if (!form.faction.trim()) return;
    setLeaderships([...leaderships, { ...form, id: generateId() }]);
    addAuditLog("Добавлена лидерка", "leaderships", `${form.faction} — ${form.leader}`);
    notifyLeadershipChange("add", form.faction, form.leader);
    resetForm();
    setShowAdd(false);
  };

  const startEdit = (l: Leadership) => {
    setEditId(l.id);
    setForm({
      faction: l.faction,
      server: l.server,
      leader: l.leader,
      startDate: l.startDate,
      endDate: l.endDate,
      status: l.status,
      color: l.color,
    });
  };

  const handleSaveEdit = () => {
    if (!editId) return;
    setLeaderships(leaderships.map((l) => (l.id === editId ? { ...l, ...form } : l)));
    addAuditLog("Отредактирована лидерка", "leaderships", `${form.faction} — ${form.leader}`);
    notifyLeadershipChange("edit", form.faction, form.leader);
    setEditId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const entry = leaderships.find((x) => x.id === id);
    setLeaderships(leaderships.filter((l) => l.id !== id));
    if (entry) {
      addAuditLog("Удалена лидерка", "leaderships", `${entry.faction} — ${entry.leader}`);
      notifyLeadershipChange("delete", entry.faction, entry.leader);
    }
  };

  const isFormOpen = showAdd || editId;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.5rem" }}>
          Лидерки
        </h2>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditId(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all duration-300"
          style={{ fontSize: "0.72rem" }}
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Фракция", key: "faction", placeholder: "FIB" },
                  { label: "Сервер", key: "server", placeholder: "Seattle" },
                  { label: "Лидер", key: "leader", placeholder: "Имя Schwarz" },
                  { label: "Начало", key: "startDate", placeholder: "2026-01-01", type: "date" },
                  { label: "Конец", key: "endDate", placeholder: "2026-03-01", type: "date" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type || "text"}
                      value={(form as any)[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                      style={{ fontSize: "0.82rem" }}
                    />
                  </div>
                ))}
                <div>
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    Статус
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Leadership["status"] })}
                    className="w-full bg-[#0d0d15] border border-white/8 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <option value="planned">Планируется</option>
                    <option value="active">Активна</option>
                    <option value="completed">Завершена</option>
                  </select>
                </div>
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-3 mb-4">
                <label className="font-['Oswald'] text-white/30 uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>
                  Цвет
                </label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-8 h-8 border border-white/10 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-white/20" style={{ fontSize: "0.7rem" }}>{form.color}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={editId ? handleSaveEdit : handleAdd}
                  className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all flex items-center gap-2"
                  style={{ fontSize: "0.72rem" }}
                >
                  <Save size={14} />
                  {editId ? "Сохранить" : "Добавить"}
                </button>
                <button
                  onClick={() => { setShowAdd(false); setEditId(null); resetForm(); }}
                  className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
                  style={{ fontSize: "0.72rem" }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderships list */}
      <div className="space-y-3">
        {leaderships.map((l, i) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="border border-white/5 bg-white/[0.01] p-5 group hover:border-white/10 transition-all duration-300"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-4 h-4 rounded-full shrink-0" style={{ background: l.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-['Oswald'] text-white/70 uppercase tracking-wider" style={{ fontSize: "0.95rem" }}>
                    {l.faction}
                  </span>
                  <span className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.7rem" }}>
                    {l.server}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  <span className="font-['Oswald'] text-white/35 tracking-wide" style={{ fontSize: "0.75rem" }}>
                    {l.leader}
                  </span>
                  <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.68rem" }}>
                    {l.startDate} {l.endDate ? `— ${l.endDate}` : "— н.в."}
                  </span>
                </div>
              </div>
              <span
                className="px-2.5 py-1 font-['Oswald'] uppercase tracking-wider border shrink-0"
                style={{
                  fontSize: "0.58rem",
                  color: statusColors[l.status],
                  borderColor: `${statusColors[l.status]}25`,
                  background: `${statusColors[l.status]}08`,
                }}
              >
                {statusLabels[l.status]}
              </span>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => startEdit(l)} className="text-white/20 hover:text-[#f59e0b]/60 p-1.5 transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(l.id)} className="text-white/20 hover:text-[#ff3366]/60 p-1.5 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ANNOUNCEMENTS TAB
   ═══════════════════════════════════════════════ */

function AnnouncementsTab({
  announcements,
  setAnnouncements,
}: {
  announcements: Announcement[];
  setAnnouncements: (a: Announcement[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", text: "", priority: "normal" as Announcement["priority"], pinned: false });

  const resetForm = () => setForm({ title: "", text: "", priority: "normal", pinned: false });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    setAnnouncements([
      { ...form, id: generateId(), date: new Date().toISOString().split("T")[0] },
      ...announcements,
    ]);
    addAuditLog("Добавлено объявление", "announcements", form.title.trim());
    notifyNewAnnouncement(form.title.trim(), form.priority);
    resetForm();
    setShowAdd(false);
  };

  const startEdit = (a: Announcement) => {
    setEditId(a.id);
    setForm({ title: a.title, text: a.text, priority: a.priority, pinned: !!(a as any).pinned });
  };

  const handleSaveEdit = () => {
    if (!editId) return;
    setAnnouncements(announcements.map((a) => (a.id === editId ? { ...a, ...form } : a)));
    addAuditLog("Отредактировано объявление", "announcements", form.title);
    setEditId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const ann = announcements.find((a) => a.id === id);
    setAnnouncements(announcements.filter((a) => a.id !== id));
    if (ann) addAuditLog("Удалено объявление", "announcements", ann.title);
  };

  const isFormOpen = showAdd || editId;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.5rem" }}>
          Объявления
        </h2>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditId(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all duration-300"
          style={{ fontSize: "0.72rem" }}
        >
          <Plus size={14} />
          Новое
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
              <div className="space-y-4 mb-4">
                <div>
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    Заголовок
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Заголовок объявления"
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    Текст
                  </label>
                  <textarea
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    placeholder="Текст объявления..."
                    rows={3}
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors resize-none"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>
                <div className="max-w-[200px]">
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    Приоритет
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Announcement["priority"] })}
                    className="w-full bg-[#0d0d15] border border-white/8 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <option value="low">Низкий</option>
                    <option value="normal">Обычный</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 self-end pb-1">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, pinned: !form.pinned })}
                    className={`flex items-center gap-2 px-3 py-2 border transition-all duration-300 ${
                      form.pinned
                        ? "border-[#f59e0b]/25 bg-[#f59e0b]/8 text-[#f59e0b]/60"
                        : "border-white/5 text-white/20 hover:border-white/10"
                    }`}
                  >
                    <MapPin size={12} />
                    <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>
                      {form.pinned ? "Закреплено" : "Закрепить"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editId ? handleSaveEdit : handleAdd}
                  className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all flex items-center gap-2"
                  style={{ fontSize: "0.72rem" }}
                >
                  <Save size={14} />
                  {editId ? "Сохранить" : "Опубликовать"}
                </button>
                <button
                  onClick={() => { setShowAdd(false); setEditId(null); resetForm(); }}
                  className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
                  style={{ fontSize: "0.72rem" }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {announcements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="border border-white/5 bg-white/[0.01] p-5 group hover:border-white/10 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                style={{ background: priorityColors[a.priority] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-['Oswald'] text-white/60 tracking-wide" style={{ fontSize: "0.88rem" }}>
                    {a.title}
                  </span>
                  <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.65rem" }}>
                    {a.date}
                  </span>
                  {a.pinned && (
                    <span
                      className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider border border-[#f59e0b]/15 bg-[#f59e0b]/5 text-[#f59e0b]/40"
                      style={{ fontSize: "0.48rem" }}
                    >
                      Закреплено
                    </span>
                  )}
                </div>
                <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.78rem", lineHeight: 1.7 }}>
                  {a.text}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => setAnnouncements(announcements.map((x) => (x.id === a.id ? { ...x, pinned: !x.pinned } : x)))}
                  className={`p-1.5 transition-colors ${a.pinned ? "text-[#f59e0b]/50 hover:text-[#f59e0b]/80" : "text-white/20 hover:text-[#f59e0b]/40"}`}
                  title={a.pinned ? "Открепить" : "Закрепить"}
                >
                  <MapPin size={14} />
                </button>
                <button onClick={() => startEdit(a)} className="text-white/20 hover:text-[#f59e0b]/60 p-1.5 transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(a.id)} className="text-white/20 hover:text-[#ff3366]/60 p-1.5 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {announcements.length === 0 && (
          <p className="text-center font-['Oswald'] text-white/15 tracking-wide py-10" style={{ fontSize: "0.8rem" }}>
            Нет объявлений
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RULES & STAFF TAB
   ═���═��═══════════════════════════════════════════ */

function RulesStaffTab({
  rules,
  setRules,
  principles,
  setPrinciples,
  staff,
  setStaff,
}: {
  rules: Rule[];
  setRules: (r: Rule[]) => void;
  principles: Principle[];
  setPrinciples: (p: Principle[]) => void;
  staff: StaffMember[];
  setStaff: (s: StaffMember[]) => void;
}) {
  const [subTab, setSubTab] = useState<"rules" | "principles" | "staff">("rules");
  const [editId, setEditId] = useState<string | null>(null);

  /* ── Rules CRUD ── */
  const [ruleForm, setRuleForm] = useState({ num: "", title: "", text: "", accent: "#ff3366" });
  const [showAddRule, setShowAddRule] = useState(false);

  const resetRuleForm = () => setRuleForm({ num: "", title: "", text: "", accent: "#ff3366" });

  const handleAddRule = () => {
    if (!ruleForm.title.trim()) return;
    setRules([...rules, { ...ruleForm, id: generateId() }]);
    resetRuleForm();
    setShowAddRule(false);
  };

  const startEditRule = (r: Rule) => {
    setEditId(r.id);
    setRuleForm({ num: r.num, title: r.title, text: r.text, accent: r.accent });
  };

  const saveEditRule = () => {
    if (!editId) return;
    setRules(rules.map((r) => (r.id === editId ? { ...r, ...ruleForm } : r)));
    setEditId(null);
    resetRuleForm();
  };

  const deleteRule = (id: string) => setRules(rules.filter((r) => r.id !== id));

  const moveRule = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= rules.length) return;
    const arr = [...rules];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setRules(arr);
  };

  /* ── Principles CRUD ── */
  const [newPrinciple, setNewPrinciple] = useState("");
  const [editPrincipleId, setEditPrincipleId] = useState<string | null>(null);
  const [editPrincipleText, setEditPrincipleText] = useState("");

  const handleAddPrinciple = () => {
    if (!newPrinciple.trim()) return;
    setPrinciples([...principles, { id: generateId(), text: newPrinciple.trim() }]);
    setNewPrinciple("");
  };

  const startEditPrinciple = (p: Principle) => {
    setEditPrincipleId(p.id);
    setEditPrincipleText(p.text);
  };

  const saveEditPrinciple = () => {
    if (!editPrincipleId) return;
    setPrinciples(principles.map((p) => (p.id === editPrincipleId ? { ...p, text: editPrincipleText } : p)));
    setEditPrincipleId(null);
  };

  const deletePrinciple = (id: string) => setPrinciples(principles.filter((p) => p.id !== id));

  /* ── Staff CRUD ── */
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ name: "", position: "", permissions: [] as string[] });

  const resetStaffForm = () => setStaffForm({ name: "", position: "", permissions: [] });

  const handleAddStaff = () => {
    if (!staffForm.name.trim()) return;
    setStaff([...staff, { ...staffForm, id: generateId(), active: true }]);
    resetStaffForm();
    setShowAddStaff(false);
  };

  const startEditStaff = (s: StaffMember) => {
    setEditStaffId(s.id);
    setStaffForm({ name: s.name, position: s.position, permissions: [...s.permissions] });
  };

  const saveEditStaff = () => {
    if (!editStaffId) return;
    setStaff(staff.map((s) => (s.id === editStaffId ? { ...s, ...staffForm } : s)));
    setEditStaffId(null);
    resetStaffForm();
  };

  const deleteStaff = (id: string) => setStaff(staff.filter((s) => s.id !== id));

  const togglePermission = (perm: string) => {
    setStaffForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const toggleStaffActive = (id: string) => {
    setStaff(staff.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const isRuleFormOpen = showAddRule || (editId && subTab === "rules");
  const isStaffFormOpen = showAddStaff || editStaffId;

  return (
    <div>
      <h2 className="font-['Russo_One'] text-white mb-6" style={{ fontSize: "1.5rem" }}>
        Правила & Стафф
      </h2>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-8">
        {([
          { id: "rules" as const, label: "Основные правила" },
          { id: "principles" as const, label: "Принципы" },
          { id: "staff" as const, label: "Стафф & Права" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => { setSubTab(t.id); setEditId(null); setEditPrincipleId(null); setEditStaffId(null); }}
            className={`px-4 py-2 font-['Oswald'] uppercase tracking-wider border transition-all duration-300 ${
              subTab === t.id
                ? "text-[#9b2335] border-[#9b2335]/30 bg-[#9b2335]/5"
                : "text-white/25 border-white/5 hover:border-white/10"
            }`}
            style={{ fontSize: "0.65rem" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ CORE RULES SUB-TAB ═══ */}
      {subTab === "rules" && (
        <div>
          <div className="flex justify-end mb-5">
            <button
              onClick={() => { setShowAddRule(!showAddRule); setEditId(null); resetRuleForm(); }}
              className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
              style={{ fontSize: "0.72rem" }}
            >
              <Plus size={14} />
              Добавить правило
            </button>
          </div>

          {/* Rule form */}
          <AnimatePresence>
            {isRuleFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="border border-[#ff3366]/15 bg-[#ff3366]/[0.02] p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                        Номер (I, II, III...)
                      </label>
                      <input
                        value={ruleForm.num}
                        onChange={(e) => setRuleForm({ ...ruleForm, num: e.target.value })}
                        placeholder="V"
                        className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#ff3366]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                        style={{ fontSize: "0.85rem" }}
                      />
                    </div>
                    <div>
                      <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                        Заголовок
                      </label>
                      <input
                        value={ruleForm.title}
                        onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                        placeholder="Название правила"
                        className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#ff3366]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                        style={{ fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                      Текст правила
                    </label>
                    <textarea
                      value={ruleForm.text}
                      onChange={(e) => setRuleForm({ ...ruleForm, text: e.target.value })}
                      placeholder="Подробное описание..."
                      rows={3}
                      className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#ff3366]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors resize-none"
                      style={{ fontSize: "0.82rem" }}
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <label className="font-['Oswald'] text-white/30 uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>
                      Цвет акцента
                    </label>
                    <input
                      type="color"
                      value={ruleForm.accent}
                      onChange={(e) => setRuleForm({ ...ruleForm, accent: e.target.value })}
                      className="w-8 h-8 border border-white/10 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-white/20" style={{ fontSize: "0.7rem" }}>{ruleForm.accent}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editId ? saveEditRule : handleAddRule}
                      className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-[#0a0a0f] bg-[#ff3366] hover:bg-[#ff4477] transition-all flex items-center gap-2"
                      style={{ fontSize: "0.72rem" }}
                    >
                      <Save size={14} />
                      {editId ? "Сохранить" : "Добавить"}
                    </button>
                    <button
                      onClick={() => { setShowAddRule(false); setEditId(null); resetRuleForm(); }}
                      className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rules list */}
          <div className="space-y-3">
            {rules.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                className="border border-white/5 bg-white/[0.01] group hover:border-white/10 transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Accent bar */}
                  <div className="w-1 shrink-0" style={{ background: r.accent }} />

                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span
                        className="font-['Russo_One'] opacity-40"
                        style={{ fontSize: "1.2rem", color: r.accent }}
                      >
                        {r.num}
                      </span>
                      <span className="font-['Oswald'] text-white/60 uppercase tracking-wider" style={{ fontSize: "0.9rem" }}>
                        {r.title}
                      </span>
                    </div>
                    <p className="font-['Oswald'] text-white/25 tracking-wide mt-2" style={{ fontSize: "0.78rem", lineHeight: 1.7 }}>
                      {r.text}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => moveRule(i, -1)}
                      disabled={i === 0}
                      className="text-white/15 hover:text-white/40 p-1 transition-colors disabled:opacity-20"
                      title="Вверх"
                    >
                      <ChevronRight size={14} className="-rotate-90" />
                    </button>
                    <button
                      onClick={() => startEditRule(r)}
                      className="text-white/15 hover:text-[#f59e0b]/60 p-1 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteRule(r.id)}
                      className="text-white/15 hover:text-[#ff3366]/60 p-1 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => moveRule(i, 1)}
                      disabled={i === rules.length - 1}
                      className="text-white/15 hover:text-white/40 p-1 transition-colors disabled:opacity-20"
                      title="Вниз"
                    >
                      <ChevronRight size={14} className="rotate-90" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PRINCIPLES SUB-TAB ═══ */}
      {subTab === "principles" && (
        <div>
          {/* Add principle */}
          <div className="flex items-end gap-3 mb-6">
            <div className="flex-1">
              <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                Новый принцип
              </label>
              <input
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                placeholder="Текст принципа..."
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                style={{ fontSize: "0.82rem" }}
                onKeyDown={(e) => e.key === "Enter" && handleAddPrinciple()}
              />
            </div>
            <button
              onClick={handleAddPrinciple}
              className="px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all flex items-center gap-2"
              style={{ fontSize: "0.72rem" }}
            >
              <Plus size={14} />
              Добавить
            </button>
          </div>

          {/* Principles list */}
          <div className="space-y-2">
            {principles.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-4 border border-white/5 bg-white/[0.01] group hover:border-white/10 transition-all duration-300"
              >
                <div className="w-2 h-2 rounded-full bg-white/10 shrink-0" />

                {editPrincipleId === p.id ? (
                  <>
                    <input
                      value={editPrincipleText}
                      onChange={(e) => setEditPrincipleText(e.target.value)}
                      className="flex-1 bg-[#0d0d15] border border-white/10 text-white/80 font-['Oswald'] tracking-wide px-3 py-1.5 outline-none"
                      style={{ fontSize: "0.82rem" }}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && saveEditPrinciple()}
                    />
                    <button onClick={saveEditPrinciple} className="text-[#9b2335]/60 hover:text-[#9b2335] transition-colors">
                      <Save size={14} />
                    </button>
                    <button onClick={() => setEditPrincipleId(null)} className="text-white/20 hover:text-white/40 transition-colors">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.82rem" }}>
                      {p.text}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => startEditPrinciple(p)} className="text-white/15 hover:text-[#f59e0b]/60 p-1 transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deletePrinciple(p.id)} className="text-white/15 hover:text-[#ff3366]/60 p-1 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <p className="font-['Oswald'] text-white/10 tracking-wide mt-6 text-center" style={{ fontSize: "0.65rem" }}>
            Всего принципов: {principles.length}
          </p>
        </div>
      )}

      {/* ═══ STAFF SUB-TAB ═══ */}
      {subTab === "staff" && (
        <div>
          <div className="flex justify-end mb-5">
            <button
              onClick={() => { setShowAddStaff(!showAddStaff); setEditStaffId(null); resetStaffForm(); }}
              className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
              style={{ fontSize: "0.72rem" }}
            >
              <Plus size={14} />
              Добавить стафф
            </button>
          </div>

          {/* Staff form */}
          <AnimatePresence>
            {isStaffFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                        Имя
                      </label>
                      <input
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        placeholder="Имя Schwarz"
                        className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                        style={{ fontSize: "0.85rem" }}
                      />
                    </div>
                    <div>
                      <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                        Должность
                      </label>
                      <input
                        value={staffForm.position}
                        onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                        placeholder="Модератор"
                        className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                        style={{ fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  {/* Permissions grid */}
                  <div className="mb-5">
                    <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-3" style={{ fontSize: "0.6rem" }}>
                      Права доступа
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {allPermissions.map((perm) => {
                        const active = staffForm.permissions.includes(perm);
                        return (
                          <button
                            key={perm}
                            onClick={() => togglePermission(perm)}
                            className={`px-3 py-2 border transition-all duration-300 text-left ${
                              active
                                ? "border-[#9b2335]/25 bg-[#9b2335]/8 text-[#9b2335]/70"
                                : "border-white/5 bg-white/[0.01] text-white/20 hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 border flex items-center justify-center transition-all ${
                                  active ? "border-[#9b2335]/40 bg-[#9b2335]/15" : "border-white/15"
                                }`}
                              >
                                {active && <CheckCircle2 size={8} className="text-[#9b2335]" />}
                              </div>
                              <span className="font-['Oswald'] tracking-wide truncate" style={{ fontSize: "0.65rem" }}>
                                {permissionLabels[perm]}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={editStaffId ? saveEditStaff : handleAddStaff}
                      className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all flex items-center gap-2"
                      style={{ fontSize: "0.72rem" }}
                    >
                      <Save size={14} />
                      {editStaffId ? "Сохранить" : "Добавить"}
                    </button>
                    <button
                      onClick={() => { setShowAddStaff(false); setEditStaffId(null); resetStaffForm(); }}
                      className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Staff list */}
          <div className="space-y-3">
            {staff.map((s) => (
              <div
                key={s.id}
                className={`border bg-white/[0.01] group hover:border-white/10 transition-all duration-300 p-5 ${
                  s.active ? "border-white/5" : "border-white/[0.03] opacity-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-[#9b2335]/15 bg-[#9b2335]/5">
                    <Shield size={16} className="text-[#9b2335]/50" strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-['Oswald'] text-white/70 tracking-wide" style={{ fontSize: "0.88rem" }}>
                        {s.name}
                      </span>
                      <span
                        className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider border border-[#f59e0b]/20 bg-[#f59e0b]/5 text-[#f59e0b]/60"
                        style={{ fontSize: "0.55rem" }}
                      >
                        {s.position}
                      </span>
                    </div>

                    {/* Permission tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 font-['Oswald'] tracking-wider border border-white/5 bg-white/[0.02] text-white/20"
                          style={{ fontSize: "0.52rem" }}
                        >
                          {permissionLabels[perm] || perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => toggleStaffActive(s.id)}
                      className={`p-1.5 transition-colors ${s.active ? "text-[#9b2335]/30 hover:text-[#9b2335]/60" : "text-white/10 hover:text-white/30"}`}
                      title={s.active ? "Деактивировать" : "Активировать"}
                    >
                      <Activity size={14} />
                    </button>
                    <button onClick={() => startEditStaff(s)} className="text-white/15 hover:text-[#f59e0b]/60 p-1.5 transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deleteStaff(s.id)} className="text-white/15 hover:text-[#ff3366]/60 p-1.5 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="font-['Oswald'] text-white/10 tracking-wide mt-6 text-center" style={{ fontSize: "0.65rem" }}>
            Всего стаффа: {staff.length} · Активных: {staff.filter((s) => s.active).length}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   AUDIT LOG TAB
   ═══════════════════════════════════════════════ */

function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const v = localStorage.getItem("schwarz_admin_auditLog");
      return v ? JSON.parse(v) : [];
    } catch { return []; }
  });
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories: { id: string; label: string; color: string }[] = [
    { id: "all", label: "Все", color: "#9b2335" },
    { id: "members", label: "Состав", color: "#3b82f6" },
    { id: "leaderships", label: "Лидерки", color: "#f59e0b" },
    { id: "announcements", label: "Объявления", color: "#a855f7" },
    { id: "rules", label: "Правила", color: "#ef4444" },
    { id: "settings", label: "Настройки", color: "#6b7280" },
    { id: "nav", label: "Навигация", color: "#06b6d4" },
    { id: "pages", label: "Страницы", color: "#ec4899" },
    { id: "applications", label: "Заявки", color: "#22c55e" },
  ];

  const filtered = filterCategory === "all" ? logs : logs.filter((l) => l.category === filterCategory);

  const clearLogs = () => {
    if (confirm("Очистить весь аудит-лог?")) {
      localStorage.removeItem("schwarz_admin_auditLog");
      setLogs([]);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getCatColor = (cat: string) => categories.find((c) => c.id === cat)?.color ?? "#888";

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.5rem" }}>
          Аудит-лог
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-['Oswald'] text-white/30 uppercase tracking-wider" style={{ fontSize: "0.65rem" }}>
            {filtered.length} записей
          </span>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="px-3 py-1.5 font-['Oswald'] text-[#ff3366]/60 uppercase tracking-wider border border-[#ff3366]/15 hover:border-[#ff3366]/30 hover:text-[#ff3366] transition-all"
              style={{ fontSize: "0.6rem" }}
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className="px-3 py-1.5 font-['Oswald'] uppercase tracking-wider transition-all"
            style={{
              fontSize: "0.6rem",
              color: filterCategory === cat.id ? cat.color : "rgba(255,255,255,0.3)",
              background: filterCategory === cat.id ? `${cat.color}15` : "rgba(255,255,255,0.02)",
              border: `1px solid ${filterCategory === cat.id ? `${cat.color}40` : "rgba(255,255,255,0.06)"}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Logs list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList size={40} className="text-white/10 mx-auto mb-4" />
          <p className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
            {logs.length === 0 ? "Пока нет записей" : "Нет записей для выбранной категории"}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-4 px-4 py-3 border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] transition-all group"
            >
              {/* Timestamp */}
              <span
                className="font-['Oswald'] text-white/20 tracking-wide shrink-0 mt-0.5"
                style={{ fontSize: "0.7rem", minWidth: "120px" }}
              >
                {formatDate(log.timestamp)}
              </span>

              {/* Category badge */}
              <span
                className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider shrink-0 mt-0.5"
                style={{
                  fontSize: "0.5rem",
                  color: getCatColor(log.category),
                  background: `${getCatColor(log.category)}10`,
                  border: `1px solid ${getCatColor(log.category)}20`,
                }}
              >
                {categories.find((c) => c.id === log.category)?.label ?? log.category}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-['Oswald'] text-white/60 tracking-wide" style={{ fontSize: "0.85rem" }}>
                  {log.action}
                </p>
                {log.details && (
                  <p className="font-['Oswald'] text-white/25 tracking-wide mt-0.5" style={{ fontSize: "0.7rem" }}>
                    {log.details}
                  </p>
                )}
              </div>

              {/* Staff name */}
              <span
                className="font-['Oswald'] text-[#9b2335]/30 uppercase tracking-wider shrink-0 mt-0.5"
                style={{ fontSize: "0.6rem" }}
              >
                {log.staffName}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════���══════════════════════════════════════
   SETTINGS TAB
   ═══════════════════════════════════════════════ */

function SettingsTab() {
  const [promoCode, setPromoCode] = useState(() => loadState("promoCode", "/promo nebes"));
  const [promoReward, setPromoReward] = useState(() => loadState("promoReward", "$50.000 + Majestic Premium"));
  const [discordLink, setDiscordLink] = useState(() => loadState("discordLink", "https://discord.gg/schwarzfamq"));
  const [twitchLink, setTwitchLink] = useState(() => loadState("twitchLink", "https://twitch.tv/nebesnyin"));
  const [saved, setSaved] = useState(false);

  // Webhook state
  const [whConfig, setWhConfig] = useState<WebhookConfig>(DEFAULT_WEBHOOK_CONFIG);
  const [whEvents, setWhEvents] = useState<WebhookEvents>(DEFAULT_WEBHOOK_EVENTS);
  const [testingWh, setTestingWh] = useState(false);
  const [testResult, setTestResult] = useState<null | boolean>(null);

  useEffect(() => {
    getWebhookConfig().then(setWhConfig).catch(() => {});
    getWebhookEvents().then(setWhEvents).catch(() => {});
  }, []);

  const handleSave = async () => {
    saveState("promoCode", promoCode);
    saveState("promoReward", promoReward);
    saveState("discordLink", discordLink);
    saveState("twitchLink", twitchLink);
    await saveWebhookConfig(whConfig);
    await saveWebhookEvents(whEvents);
    addAuditLog("Настройки обновлены", "settings", "Промокод, ссылки, вебхуки");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearAll = () => {
    if (confirm("Очистить все данные localStorage? Это сбросит состав, лидерки и объявления к начальным значениям.")) {
      addAuditLog("Полный сброс данных", "settings", "Все данные очищены");
      Object.keys(localStorage)
        .filter((k) => k.startsWith("schwarz_admin_"))
        .forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  return (
    <div>
      <h2 className="font-['Russo_One'] text-white mb-8" style={{ fontSize: "1.5rem" }}>
        Настройки
      </h2>

      <div className="space-y-6 max-w-xl">
        {/* Promo */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.75rem" }}>
            Промокод
          </h3>
          <div className="space-y-4">
            <div>
              <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                Команда
              </label>
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-mono tracking-wide px-3 py-2 outline-none transition-colors"
                style={{ fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                Награда
              </label>
              <input
                value={promoReward}
                onChange={(e) => setPromoReward(e.target.value)}
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.75rem" }}>
            Ссылки
          </h3>
          <div className="space-y-4">
            <div>
              <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                Discord
              </label>
              <input
                value={discordLink}
                onChange={(e) => setDiscordLink(e.target.value)}
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                style={{ fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                Twitch
              </label>
              <input
                value={twitchLink}
                onChange={(e) => setTwitchLink(e.target.value)}
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>

        {/* Discord Webhook */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <div className="flex items-center gap-3 mb-5">
            <Bell size={14} className="text-[#5865F2]/50" />
            <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
              Discord Вебх��к
            </h3>
            <button
              onClick={() => setWhConfig({ ...whConfig, enabled: !whConfig.enabled })}
              className="ml-auto flex items-center gap-2 transition-colors"
            >
              {whConfig.enabled ? (
                <ToggleRight size={22} className="text-[#9b2335]/60" />
              ) : (
                <ToggleLeft size={22} className="text-white/15" />
              )}
              <span
                className="font-['Oswald'] uppercase tracking-wider"
                style={{ fontSize: "0.55rem", color: whConfig.enabled ? "rgba(155,35,53,0.6)" : "rgba(255,255,255,0.15)" }}
              >
                {whConfig.enabled ? "Вкл" : "Выкл"}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                Webhook URL
              </label>
              <div className="flex gap-2">
                <input
                  value={whConfig.url}
                  onChange={(e) => setWhConfig({ ...whConfig, url: e.target.value })}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="flex-1 bg-[#0d0d15] border border-white/8 focus:border-[#5865F2]/30 text-white/60 font-mono tracking-wide px-3 py-2 outline-none transition-colors"
                  style={{ fontSize: "0.78rem" }}
                />
                <button
                  onClick={async () => {
                    if (!whConfig.url.trim()) return;
                    setTestingWh(true);
                    setTestResult(null);
                    const ok = await testWebhook(whConfig.url);
                    setTestResult(ok);
                    setTestingWh(false);
                    setTimeout(() => setTestResult(null), 4000);
                  }}
                  disabled={testingWh || !whConfig.url.trim()}
                  className="px-3 py-2 font-['Oswald'] uppercase tracking-wider text-[#5865F2]/60 border border-[#5865F2]/15 hover:border-[#5865F2]/30 hover:bg-[#5865F2]/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                  style={{ fontSize: "0.6rem" }}
                >
                  <Send size={11} />
                  {testingWh ? "..." : "Тест"}
                </button>
              </div>
              {testResult !== null && (
                <p
                  className="font-['Oswald'] tracking-wide mt-2"
                  style={{ fontSize: "0.7rem", color: testResult ? "#9b2335" : "#ff3366" }}
                >
                  {testResult ? "Тестовое сообщение отправлено!" : "Ошибка отправки. Проверь URL."}
                </p>
              )}
            </div>

            {/* Events toggles */}
            <div>
              <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-3" style={{ fontSize: "0.6rem" }}>
                Уведомления о событиях
              </label>
              <div className="space-y-2">
                {([
                  { key: "newApplication" as const, label: "Новая заявка", color: "#f59e0b" },
                  { key: "applicationVerdict" as const, label: "Решение по заявке", color: "#9b2335" },
                  { key: "memberAdded" as const, label: "Добавлен участник", color: "#9b2335" },
                  { key: "memberRemoved" as const, label: "Удалён участник", color: "#ff3366" },
                  { key: "newAnnouncement" as const, label: "Новое объявление", color: "#5865F2" },
                  { key: "leadershipChange" as const, label: "��зменения лидерок", color: "#f59e0b" },
                ]).map((evt) => (
                  <button
                    key={evt.key}
                    onClick={() => setWhEvents({ ...whEvents, [evt.key]: !whEvents[evt.key] })}
                    className="w-full flex items-center justify-between px-3 py-2 border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <span
                      className="font-['Oswald'] tracking-wide"
                      style={{
                        fontSize: "0.75rem",
                        color: whEvents[evt.key] ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
                      }}
                    >
                      {evt.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full transition-all"
                        style={{
                          background: whEvents[evt.key] ? evt.color : "rgba(255,255,255,0.08)",
                          boxShadow: whEvents[evt.key] ? `0 0 6px ${evt.color}40` : "none",
                        }}
                      />
                      {whEvents[evt.key] ? (
                        <ToggleRight size={16} style={{ color: evt.color, opacity: 0.6 }} />
                      ) : (
                        <ToggleLeft size={16} className="text-white/10" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all duration-300"
            style={{ fontSize: "0.75rem" }}
          >
            {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saved ? "Сохранено!" : "Сохранить"}
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-6 py-2.5 font-['Oswald'] uppercase tracking-wider text-[#ff3366]/50 border border-[#ff3366]/15 hover:border-[#ff3366]/30 hover:bg-[#ff3366]/5 transition-all duration-300"
            style={{ fontSize: "0.75rem" }}
          >
            <Trash2 size={14} />
            Сбросить всё
          </button>
        </div>

        {/* Info */}
        <div className="border border-white/5 bg-white/[0.01] p-5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-[#f59e0b]/30 shrink-0 mt-0.5" />
          <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.72rem", lineHeight: 1.8 }}>
            Данные сохраняются на backend сервере и кэшируются через localStorage в браузере.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ACCOUNTS TAB — управление аккаунтами админов
   ═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   ACCOUNTS TAB — управление аккаунтами админов
   ═══════════════════════════════════════════════ */

const ALL_PERMISSIONS = [
  { id: "view_admin", label: "Доступ к панели" },
  { id: "manage_members", label: "Состав" },
  { id: "manage_leaderships", label: "Лидерки" },
  { id: "manage_announcements", label: "Объявления" },
  { id: "manage_rules", label: "Правила" },
  { id: "manage_settings", label: "Настройки/Страницы" },
  { id: "all", label: "Все права (root)" },
] as const;

function AccountsTab({ currentAccountId }: { currentAccountId: string }) {
  const [accounts, setAccounts] = useState<StaffAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [cUsername, setCUsername] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [showCPass, setShowCPass] = useState(true); // visible by default so admin can copy
  const [cDisplay, setCDisplay] = useState("");
  const [cPosition, setCPosition] = useState("");
  const [cPerms, setCPerms] = useState<string[]>(["view_admin"]);
  const [cError, setCError] = useState("");
  const [cSaving, setCsaving] = useState(false);

  // Edit form
  const [eDisplay, setEDisplay] = useState("");
  const [ePosition, setEPosition] = useState("");
  const [ePerms, setEPerms] = useState<string[]>([]);
  const [ePassword, setEPassword] = useState("");
  const [showEPass, setShowEPass] = useState(false);
  const [eSaving, setESaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const data = await listAdminAccounts();
    if (data) setAccounts(data);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const startEdit = (acc: StaffAccountResponse) => {
    setEditId(acc.id);
    setEDisplay(acc.displayName);
    setEPosition(acc.position);
    setEPerms([...acc.permissions]);
    setEPassword("");
  };

  const saveEdit = async () => {
    if (!editId) return;
    setESaving(true);
    const payload: Parameters<typeof updateAdminAccount>[1] = {
      displayName: eDisplay,
      position: ePosition,
      permissions: ePerms,
    };
    if (ePassword) payload.password = ePassword;
    const res = await updateAdminAccount(editId, payload);
    if (res?.ok) {
      setAccounts((prev) => prev.map((a) => (a.id === editId ? res.account : a)));
      setEditId(null);
    }
    setESaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить аккаунт?")) return;
    await deleteAdminAccount(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cUsername.trim() || !cPassword) { setCError("Логин и пароль обязательны"); return; }
    setCsaving(true);
    setCError("");
    const res = await createAdminAccount({
      username: cUsername.trim(),
      password: cPassword,
      displayName: cDisplay || cUsername.trim(),
      position: cPosition || "Администратор",
      permissions: cPerms,
    });
    if (res?.ok) {
      setAccounts((prev) => [...prev, res.account]);
      setShowCreate(false);
      setCUsername(""); setCPassword(""); setCDisplay(""); setCPosition(""); setCPerms(["view_admin"]);
    } else {
      setCError("Логин уже занят или ошибка сервера");
    }
    setCsaving(false);
  };

  const togglePerm = (perms: string[], p: string, set: (v: string[]) => void) => {
    set(perms.includes(p) ? perms.filter((x) => x !== p) : [...perms, p]);
  };

  const inputCls = "w-full bg-[#0a0a12] border border-white/8 focus:border-[#9b2335]/30 text-white/70 font-['Oswald'] tracking-wide px-3 py-2.5 outline-none transition-colors";
  const inputStyle = { fontSize: "0.82rem" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.5rem" }}>
          Аккаунты
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="text-white/20 hover:text-white/50 transition-colors"
            title="Обновить"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 font-['Oswald'] uppercase tracking-wider text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 transition-all"
            style={{ fontSize: "0.7rem" }}
          >
            <Plus size={14} />
            Добавить
          </button>
        </div>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 border border-[#9b2335]/20 bg-[#9b2335]/[0.03] p-6"
          >
            <p className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.7rem" }}>
              Новый аккаунт
            </p>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={cUsername} onChange={(e) => setCUsername(e.target.value)} placeholder="Логин*" className={inputCls} style={inputStyle} />
                <div className="relative">
                  <input
                    type={showCPass ? "text" : "password"}
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    placeholder="Пароль*"
                    className={inputCls + " pr-10"}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCPass(!showCPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    title={showCPass ? "Скрыть" : "Показать"}
                  >
                    {showCPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input value={cDisplay} onChange={(e) => setCDisplay(e.target.value)} placeholder="Отображаемое имя" className={inputCls} style={inputStyle} />
                <input value={cPosition} onChange={(e) => setCPosition(e.target.value)} placeholder="Должность" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-2" style={{ fontSize: "0.62rem" }}>Права доступа</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_PERMISSIONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePerm(cPerms, p.id, setCPerms)}
                      className={`font-['Oswald'] tracking-wide px-3 py-1.5 border text-xs transition-all ${
                        cPerms.includes(p.id)
                          ? "border-[#9b2335]/40 bg-[#9b2335]/10 text-[#9b2335]/80"
                          : "border-white/8 text-white/25 hover:border-white/15"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {cError && <p className="font-['Oswald'] text-[#ff3366]/60" style={{ fontSize: "0.7rem" }}>{cError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={cSaving} className="font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] px-6 py-2 transition-all disabled:opacity-40" style={{ fontSize: "0.7rem" }}>
                  {cSaving ? "Создание..." : "Создать"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="font-['Oswald'] uppercase tracking-wider text-white/30 hover:text-white/60 px-4 py-2 transition-colors" style={{ fontSize: "0.7rem" }}>
                  Отмена
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accounts list */}
      {loading ? (
        <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.8rem" }}>Загрузка...</p>
      ) : accounts.length === 0 ? (
        <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.8rem" }}>Аккаунты не найдены</p>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="border border-white/5 bg-white/[0.01]">
              {editId === acc.id ? (
                /* Edit form */
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={eDisplay} onChange={(e) => setEDisplay(e.target.value)} placeholder="Отображаемое имя" className={inputCls} style={inputStyle} />
                    <input value={ePosition} onChange={(e) => setEPosition(e.target.value)} placeholder="Должность" className={inputCls} style={inputStyle} />
                  </div>
                  <div className="relative">
                    <input
                      type={showEPass ? "text" : "password"}
                      value={ePassword}
                      onChange={(e) => setEPassword(e.target.value)}
                      placeholder="Новый пароль (оставьте пустым чтобы не менять)"
                      className={inputCls + " pr-10"}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEPass(!showEPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                      {showEPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {!acc.isRoot && (
                    <div>
                      <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-2" style={{ fontSize: "0.62rem" }}>Права доступа</p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_PERMISSIONS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePerm(ePerms, p.id, setEPerms)}
                            className={`font-['Oswald'] tracking-wide px-3 py-1.5 border text-xs transition-all ${
                              ePerms.includes(p.id)
                                ? "border-[#9b2335]/40 bg-[#9b2335]/10 text-[#9b2335]/80"
                                : "border-white/8 text-white/25 hover:border-white/15"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button onClick={saveEdit} disabled={eSaving} className="flex items-center gap-1.5 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] px-5 py-2 transition-all disabled:opacity-40" style={{ fontSize: "0.68rem" }}>
                      <Save size={13} /> {eSaving ? "Сохранение..." : "Сохранить"}
                    </button>
                    <button onClick={() => setEditId(null)} className="font-['Oswald'] uppercase tracking-wider text-white/30 hover:text-white/60 px-4 py-2 transition-colors" style={{ fontSize: "0.68rem" }}>
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                /* Account row */
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#9b2335]/10 border border-[#9b2335]/15 shrink-0">
                      {acc.isRoot ? <KeyRound size={14} className="text-[#9b2335]/60" /> : <User size={14} className="text-white/30" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-['Oswald'] text-white/80 tracking-wide" style={{ fontSize: "0.85rem" }}>
                          {acc.displayName}
                        </p>
                        <span className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
                          @{acc.username}
                        </span>
                        {acc.isRoot && (
                          <span className="font-['Oswald'] text-[#9b2335]/60 border border-[#9b2335]/20 px-1.5 py-0.5 tracking-wider" style={{ fontSize: "0.55rem" }}>
                            ROOT
                          </span>
                        )}
                        {acc.id === currentAccountId && (
                          <span className="font-['Oswald'] text-[#22c55e]/50 border border-[#22c55e]/15 px-1.5 py-0.5 tracking-wider" style={{ fontSize: "0.55rem" }}>
                            ВЫ
                          </span>
                        )}
                      </div>
                      <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
                        {acc.position} · {acc.permissions.includes("all") ? "Все права" : acc.permissions.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(acc)}
                      className="p-2 text-white/20 hover:text-white/60 transition-colors"
                      title="Редактировать"
                    >
                      <Edit3 size={15} />
                    </button>
                    {!acc.isRoot && acc.id !== currentAccountId && (
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="p-2 text-white/15 hover:text-[#ff3366]/60 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN ADMIN PAGE
   ═══════════════════════════════════════════════ */

export function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("schwarz_admin_auth") === "1");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // currentAccount stores the authenticated staff account (from API, persisted in sessionStorage)
  const [currentAccount, setCurrentAccount] = useState<StaffAccountResponse | null>(() => {
    try {
      const raw = sessionStorage.getItem("schwarz_admin_account");
      return raw ? (JSON.parse(raw) as StaffAccountResponse) : null;
    } catch {
      return null;
    }
  });

  // Derive currentStaff (StaffMember shape) from currentAccount for permission checks
  const currentStaff: StaffMember | null = currentAccount
    ? {
        id: currentAccount.id,
        name: currentAccount.displayName,
        position: currentAccount.position,
        permissions: currentAccount.permissions,
        active: currentAccount.active,
      }
    : null;

  const [members, setMembersState] = useState<Member[]>(() => loadState("members", defaultMembers));
  const [leaderships, setLeadershipsState] = useState<Leadership[]>(() => loadState("leaderships", defaultLeaderships));
  const [announcements, setAnnouncementsState] = useState<Announcement[]>(() => loadState("announcements", defaultAnnouncements));
  const [rules, setRulesState] = useState<Rule[]>(() => loadState("rules", defaultRules));
  const [principles, setPrinciplesState] = useState<Principle[]>(() => loadState("principles", defaultPrinciples));
  const [staffMembers, setStaffState] = useState<StaffMember[]>(() => loadState("staff", defaultStaff));

  const setMembers = (m: Member[]) => {
    setMembersState(m);
    saveState("members", m);
    void putAdminSnapshot({ members: m });
  };
  const setLeaderships = (l: Leadership[]) => {
    setLeadershipsState(l);
    saveState("leaderships", l);
    void putAdminSnapshot({ leaderships: l });
  };
  const setAnnouncements = (a: Announcement[]) => {
    setAnnouncementsState(a);
    saveState("announcements", a);
    void putAdminSnapshot({ announcements: a });
  };
  const setRules = (r: Rule[]) => {
    setRulesState(r);
    saveState("rules", r);
    void putAdminSnapshot({ rules: r });
  };
  const setPrinciples = (p: Principle[]) => {
    setPrinciplesState(p);
    saveState("principles", p);
    void putAdminSnapshot({ principles: p });
  };
  const setStaff = (s: StaffMember[]) => {
    setStaffState(s);
    saveState("staff", s);
  };

  // Sync all data from API on mount
  useEffect(() => {
    getAdminSnapshot().then((snap) => {
      if (!snap) return;
      if (Array.isArray(snap.members) && snap.members.length > 0) {
        const m = snap.members as Member[];
        setMembersState(m);
        saveState("members", m);
      }
      if (Array.isArray(snap.leaderships) && snap.leaderships.length > 0) {
        const l = snap.leaderships as Leadership[];
        setLeadershipsState(l);
        saveState("leaderships", l);
      }
      if (Array.isArray(snap.announcements) && snap.announcements.length > 0) {
        const a = snap.announcements as Announcement[];
        setAnnouncementsState(a);
        saveState("announcements", a);
      }
      if (Array.isArray(snap.rules) && snap.rules.length > 0) {
        const r = snap.rules as Rule[];
        setRulesState(r);
        saveState("rules", r);
      }
      if (Array.isArray(snap.principles) && snap.principles.length > 0) {
        const p = snap.principles as Principle[];
        setPrinciplesState(p);
        saveState("principles", p);
      }
    });
  }, []);

  // Pages & Navbar writable data
  const adminData = useAdminDataWritable();
  const { pendingCount: pendingApps } = useApplications();

  const handleLogout = () => {
    sessionStorage.removeItem("schwarz_admin_auth");
    sessionStorage.removeItem("schwarz_admin_account");
    setAuthed(false);
    setCurrentAccount(null);
  };

  const handleLogin = (account: StaffAccountResponse) => {
    sessionStorage.setItem("schwarz_admin_auth", "1");
    sessionStorage.setItem("schwarz_admin_account", JSON.stringify(account));
    setAuthed(true);
    setCurrentAccount(account);
  };

  const allowedTabs: Tab[] | undefined = currentStaff
    ? (Object.entries(tabPermissions)
        .filter(([, perm]) => {
          if (!perm) return true;
          return (
            currentStaff.permissions.includes(perm) ||
            currentStaff.permissions.includes("all")
          );
        })
        .map(([tab]) => tab as Tab))
    : undefined;

  const handleTabChange = (tab: Tab) => {
    if (allowedTabs && !allowedTabs.includes(tab)) return;
    setActiveTab(tab);
  };

  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!currentStaff) {
    // Session exists but account missing — clear and re-login
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        pendingApps={pendingApps}
        allowedTabs={allowedTabs}
      />

      {/* Toggle sidebar */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed top-4 z-50 text-white/20 hover:text-white/50 transition-colors"
        style={{ left: sidebarCollapsed ? 68 : 228 }}
      >
        <ChevronRight
          size={16}
          className={`transition-transform duration-300 ${sidebarCollapsed ? "" : "rotate-180"}`}
        />
      </button>

      {/* Main content */}
      <div
        className={`transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? "ml-[60px]" : "ml-[220px]"
        }`}
      >
        {/* Top bar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#0d0d15]/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="font-['Oswald'] text-white/50 uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>
              {sidebarItems.find((s) => s.id === activeTab)?.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#9b2335]" />
              <span className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.65rem" }}>
                {currentStaff?.name || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "dashboard" && (
                <DashboardTab members={members} leaderships={leaderships} announcements={announcements} pendingApps={pendingApps} />
              )}
              {activeTab === "members" && <MembersTab members={members} setMembers={setMembers} />}
              {activeTab === "leaderships" && <LeadershipsTab leaderships={leaderships} setLeaderships={setLeaderships} />}
              {activeTab === "announcements" && <AnnouncementsTab announcements={announcements} setAnnouncements={setAnnouncements} />}
              {activeTab === "applications" && <ApplicationsTab />}
              {activeTab === "rules" && (
                <RulesStaffTab
                  rules={rules}
                  setRules={setRules}
                  principles={principles}
                  setPrinciples={setPrinciples}
                  staff={staffMembers}
                  setStaff={setStaff}
                />
              )}
              {activeTab === "pages" && (
                <PagesEditor
                  customPages={adminData.customPages}
                  setCustomPages={adminData.setCustomPages}
                  pageOverrides={adminData.pageOverrides}
                  updatePageOverride={adminData.updatePageOverride}
                  removePageOverride={adminData.removePageOverride}
                />
              )}
              {activeTab === "navbar" && (
                <NavbarEditor
                  navItems={adminData.navItems}
                  setNavItems={adminData.setNavItems}
                />
              )}
              {activeTab === "polls" && <PollsTab staffName={currentStaff?.name ?? "Admin"} />}
              {activeTab === "auditlog" && <AuditLogTab />}
              {activeTab === "settings" && <SettingsTab />}
              {activeTab === "accounts" && <AccountsTab currentAccountId={currentAccount?.id ?? ""} />}
              {activeTab === "telegram_bot" && <TelegramBotTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
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
  Vote,
  Send,
  Award,
  UserCircle,
  Car,
  Building2,
  Target,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router";
import { useAdminDataWritable, useApplications, addAuditLog, type AuditLogEntry } from "../hooks/useAdminData";
import { NavbarEditor } from "../components/admin/NavbarEditor";
import { PagesEditor } from "../components/admin/PagesEditor";
import { ApplicationsTab } from "../components/admin/ApplicationsTab";
import { PollsTab } from "../components/admin/PollsTab";
import { NewsTab } from "../components/admin/NewsTab";
import { WebhooksTab } from "../components/admin/WebhooksTab";
import { MomentsTab } from "../components/admin/MomentsTab";
import { AccountsTab } from "../components/admin/AccountsTab";
import { VehiclesAdminTab } from "../components/admin/VehiclesAdminTab";
import { ContractsAdminTab } from "../components/admin/ContractsAdminTab";
import { UpgradesAdminTab } from "../components/admin/UpgradesAdminTab";
import { InfrastructureAdminTab } from "../components/admin/InfrastructureAdminTab";
import { TelegramBotTab } from "../components/admin/TelegramBotTab";
import { BirthdaysTab } from "../components/admin/BirthdaysTab";
import { SystemStatusTab } from "../components/admin/SystemStatusTab";
import { RoleTemplatesTab } from "../components/admin/RoleTemplatesTab";
import { FamilyGoalsTab } from "../components/admin/FamilyGoalsTab";
import { ReportsTab } from "../components/admin/ReportsTab";
import { NotificationsAdminTab } from "../components/admin/NotificationsAdminTab";
import { TreasuryTab } from "../components/admin/TreasuryTab";
import { StatsAdminTab } from "./StatsPage";
import {
  notifyMemberAdded,
  notifyMemberRemoved,
  notifyNewAnnouncement,
  notifyLeadershipChange,
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
  | "news"
  | "moments"
  | "webhooks"
  | "auditlog"
  | "accounts"
  | "vehicles"
  | "contracts_admin"
  | "upgrades_admin"
  | "infrastructure_admin"
  | "telegram_bot"
  | "birthdays"
  | "system_status"
  | "role_templates"
  | "goals"
  | "reports"
  | "notifications"
  | "treasury"
  | "stats_admin";

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
  news: "manage_announcements",
  moments: "manage_media",
  webhooks: "manage_settings",
  auditlog: "manage_settings",
  accounts: "manage_members",
  vehicles: "manage_settings",
  contracts_admin: "manage_members",
  upgrades_admin: "manage_settings",
  infrastructure_admin: "manage_settings",
  telegram_bot: "manage_settings",
  birthdays: "manage_members",
  system_status: "view_admin",
  role_templates: "manage_staff",
  goals: "manage_goals",
  reports: "manage_reports",
  notifications: "manage_announcements",
  treasury: "manage_settings",
  stats_admin: "view_admin",
};

interface Member {
  id: string;
  name: string;
  role: "owner" | "dep_owner" | "close" | "old" | "main" | "academy";
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

const ADMIN_PASSWORD = "schwarz2026";

const defaultMembers: Member[] = [
  { id: "1", name: "Madara Schwarz", role: "owner", joinDate: "2024-01-01", active: true, badges: ["streamer", "fib", "leader"] },
  { id: "2", name: "Akihiro Schwarz", role: "dep_owner", joinDate: "2024-02-15", active: true, badges: ["fib", "leader"] },
  { id: "3", name: "Roman Schwarz", role: "dep_owner", joinDate: "2024-03-10", active: true, badges: ["fib", "leader"] },
  { id: "4", name: "Kerro Schwarz", role: "close", joinDate: "2024-04-01", active: true },
  { id: "5", name: "Turbo Schwarz", role: "old", joinDate: "2024-04-15", active: true },
  { id: "6", name: "Ilia Schwarz", role: "old", joinDate: "2024-05-01", active: true },
  { id: "7", name: "Jay Schwarz", role: "main", joinDate: "2024-05-20", active: true },
  { id: "8", name: "Anti Schwarz", role: "main", joinDate: "2024-06-01", active: true },
  { id: "9", name: "Richie Schwarz", role: "main", joinDate: "2024-06-15", active: true },
  { id: "10", name: "Voldemar Schwarz", role: "main", joinDate: "2024-07-01", active: true },
  { id: "11", name: "Brooklyn Schwarz", role: "academy", joinDate: "2024-08-01", active: true },
  { id: "12", name: "Marka Schwarz", role: "academy", joinDate: "2024-08-15", active: true },
  { id: "13", name: "Krasty Schwarz", role: "academy", joinDate: "2024-09-01", active: true },
  { id: "14", name: "Patrick Schwarz", role: "academy", joinDate: "2024-09-15", active: true },
];

const defaultLeaderships: Leadership[] = [
  { id: "1", faction: "LSPD", server: "Harmony", leader: "Madara Schwarz", startDate: "2024-08-15", endDate: "2024-10-01", status: "completed", color: "#3b82f6" },
  { id: "2", faction: "FIB I", server: "Harmony", leader: "Roman Schwarz", startDate: "2024-12-18", endDate: "2025-01-18", status: "completed", color: "#1e40af" },
  { id: "3", faction: "LSSD", server: "Harmony", leader: "Akihiro Schwarz", startDate: "2025-03-01", endDate: "2025-05-15", status: "completed", color: "#92400e" },
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
  { id: "6", text: "Не о��ускаться до уровня животных, даже если животное напротив тебя" },
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
  "approve_moments",
  "manage_goals",
  "manage_reports",
  "manage_birthdays",
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
  approve_moments: "Одобрение моментов",
  manage_goals: "Цели семьи",
  manage_reports: "Жалобы",
  manage_birthdays: "Дни рождения",
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
  dep_owner: "Dep.Owner",
  close: "Close",
  old: "Old",
  main: "Main",
  academy: "Academy",
};

const roleColors: Record<Member["role"], string> = {
  owner: "#9b2335",
  dep_owner: "#7a1c2a",
  close: "#c43e54",
  old: "#b8860b",
  main: "#ff3366",
  academy: "#888899",
};

/* Badge definitions */
const AVAILABLE_BADGES: { id: string; label: string; color: string; category: string }[] = [
  // Работы
  { id: "fisherman", label: "Рыбак", color: "#3b82f6", category: "Р��боты" },
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
  close: Shield,
  old: Award,
  main: Star,
  academy: User,
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

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("schwarz_admin_auth", "1");
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#9b2335]/3 blur-[200px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
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

        {/* Login card */}
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
                Введите пароль администратора
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-6">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-4 py-3 pr-12 outline-none transition-colors duration-300"
                style={{ fontSize: "0.85rem" }}
                autoFocus
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
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="font-['Oswald'] text-[#ff3366]/60 tracking-wide mb-4"
                  style={{ fontSize: "0.75rem" }}
                >
                  Неверный пароль
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full font-['Oswald'] uppercase tracking-[0.2em] text-white bg-[#9b2335] hover:bg-[#b52a40] py-3 transition-all duration-300 hover:shadow-[0_0_30px_rgba(155,35,53,0.2)]"
              style={{ fontSize: "0.8rem" }}
            >
              Войти
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

const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard", label: "Дашборд", icon: LayoutDashboard },
  { id: "members", label: "Состав", icon: Users },
  { id: "leaderships", label: "Лидерки", icon: Crown },
  { id: "announcements", label: "Объявления", icon: Megaphone },
  { id: "applications", label: "Заявки", icon: UserPlus },
  { id: "news", label: "Schwarz News", icon: Bell },
  { id: "moments", label: "Моменты", icon: ImageIcon },
  { id: "notifications", label: "Уведомления", icon: Bell },
  { id: "rules", label: "Правила & Стафф", icon: FileText },
  { id: "pages", label: "Страницы", icon: Globe },
  { id: "navbar", label: "Навигация", icon: PanelTop },
  { id: "polls", label: "Голосования", icon: Vote },
  { id: "webhooks", label: "Вебхуки", icon: Send },
  { id: "auditlog", label: "Аудит-лог", icon: ClipboardList },
  { id: "settings", label: "Настройки", icon: Settings },
  { id: "accounts", label: "Аккаунты ЛК", icon: UserCircle },
  { id: "vehicles", label: "Транспорт", icon: Car },
  { id: "contracts_admin", label: "Контракты", icon: Award },
  { id: "upgrades_admin", label: "Улучшения", icon: TrendingUp },
  { id: "infrastructure_admin", label: "Инфраструктура", icon: Building2 },
  { id: "telegram_bot", label: "Telegram Bot", icon: Send },
  { id: "birthdays", label: "Дни рождения", icon: Calendar },
  { id: "system_status", label: "Статус системы", icon: Activity },
  { id: "role_templates", label: "Шаблоны ролей", icon: Shield },
  { id: "goals", label: "Цели семьи", icon: Target },
  { id: "reports", label: "Жалобы", icon: AlertTriangle, badge: (() => { try { const r = localStorage.getItem("schwarz_reports"); const rep = r ? JSON.parse(r) : []; return rep.filter((x: { status: string }) => x.status === "open").length || undefined; } catch { return undefined; } })() },
  { id: "treasury", label: "Казна", icon: DollarSign },
  { id: "stats_admin", label: "Статистика", icon: TrendingUp },
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
              {!blocked && !!item.badge && item.badge > 0 && item.id !== "applications" && (
                <span
                  className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#f59e0b] text-white font-['Oswald']"
                  style={{ fontSize: "0.55rem", padding: "0 4px" }}
                >
                  {item.badge}
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
              Вы��ти
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

  // Load extra stats from localStorage
  const contractsStats = useMemo(() => {
    try {
      const raw = localStorage.getItem("schwarz_contracts");
      if (!raw) return { open: 0, in_progress: 0, completed: 0, failed: 0 };
      const c = JSON.parse(raw) as { status: string }[];
      return {
        open: c.filter((x) => x.status === "open").length,
        in_progress: c.filter((x) => x.status === "in_progress").length,
        completed: c.filter((x) => x.status === "completed").length,
        failed: c.filter((x) => x.status === "failed").length,
      };
    } catch { return { open: 0, in_progress: 0, completed: 0, failed: 0 }; }
  }, []);

  const goalsStats = useMemo(() => {
    try {
      const raw = localStorage.getItem("schwarz_family_goals");
      if (!raw) return { active: 0, completed: 0, planned: 0 };
      const g = JSON.parse(raw) as { status: string }[];
      return {
        active: g.filter((x) => x.status === "active").length,
        completed: g.filter((x) => x.status === "completed").length,
        planned: g.filter((x) => x.status === "planned").length,
      };
    } catch { return { active: 0, completed: 0, planned: 0 }; }
  }, []);

  const reportsOpen = useMemo(() => {
    try {
      const raw = localStorage.getItem("schwarz_reports");
      if (!raw) return 0;
      return (JSON.parse(raw) as { status: string }[]).filter((r) => r.status === "open").length;
    } catch { return 0; }
  }, []);

  const stats = [
    { label: "Участников", value: activeMembers, icon: Users, color: "#9b2335" },
    { label: "Активных лидерок", value: activeLeaderships, icon: Crown, color: "#f59e0b" },
    { label: "Заявок ожидает", value: pendingApps, icon: UserPlus, color: "#ff3366" },
    { label: "Объявлений", value: announcements.length, icon: Megaphone, color: "#9146ff" },
    { label: "Контрактов завершено", value: contractsStats.completed, icon: CheckCircle2, color: "#22c55e" },
    { label: "Открытых жалоб", value: reportsOpen, icon: AlertTriangle, color: reportsOpen > 0 ? "#f59e0b" : "#6b7280" },
    { label: "Целей в работе", value: goalsStats.active, icon: Star, color: "#38bdf8" },
    { label: "Лидерок всего", value: completedLeaderships + activeLeaderships, icon: TrendingUp, color: "#c43e54" },
  ];

  /* Pie chart data: members by role */
  const pieData = (["owner", "dep_owner", "close", "old", "main", "academy"] as Member["role"][])
    .map((role) => ({
      name: roleLabels[role],
      value: members.filter((m) => m.role === role && m.active).length,
      color: roleColors[role],
    }))
    .filter((d) => d.value > 0);

  /* Bar chart: contracts */
  const contractBarData = [
    { name: "Открыт", value: contractsStats.open, color: "#38bdf8" },
    { name: "В работе", value: contractsStats.in_progress, color: "#f59e0b" },
    { name: "Завершён", value: contractsStats.completed, color: "#22c55e" },
    { name: "Провал", value: contractsStats.failed, color: "#ef4444" },
  ];

  return (
    <div>
      <h2 className="font-['Russo_One'] text-white mb-8" style={{ fontSize: "1.5rem" }}>
        Дашборд
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="border border-white/5 bg-white/[0.01] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon size={15} style={{ color: s.color, opacity: 0.45 }} strokeWidth={1.5} />
              <span
                className="font-['Russo_One']"
                style={{ fontSize: "1.5rem", color: s.color, filter: `drop-shadow(0 0 8px ${s.color}40)` }}
              >
                {s.value}
              </span>
            </div>
            <p className="font-['Oswald'] text-white/22 uppercase tracking-wider" style={{ fontSize: "0.58rem" }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie: Members by role */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.72rem" }}>
            Состав по рангам
          </h3>
          {activeMembers === 0 ? (
            <p className="font-['Oswald'] text-white/15 tracking-wide text-center py-8" style={{ fontSize: "0.78rem" }}>
              Нет участников
            </p>
          ) : (
            <div className="flex items-center gap-6">
              <div style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                      dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, fontFamily: "Oswald" }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}
                      itemStyle={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="font-['Oswald'] text-white/35 tracking-wide" style={{ fontSize: "0.68rem" }}>{d.name}</span>
                    </div>
                    <span className="font-['Russo_One']" style={{ fontSize: "0.85rem", color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar: Contracts */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.72rem" }}>
            Статистика контрактов
          </h3>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "Oswald" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9, fontFamily: "Oswald" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, fontFamily: "Oswald" }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}
                  itemStyle={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="value" radius={[1, 1, 0, 0]}>
                  {contractBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent announcements */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.72rem" }}>
            Последние объявления
          </h3>
          {announcements.length === 0 ? (
            <p className="font-['Oswald'] text-white/12 tracking-wide" style={{ fontSize: "0.75rem" }}>Нет объявлений</p>
          ) : (
            announcements.slice(0, 4).map((a) => (
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
            ))
          )}
        </div>

        {/* Leaderships */}
        <div className="border border-white/5 bg-white/[0.01] p-6">
          <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.72rem" }}>
            Лидерки
          </h3>
          {/* Summary pills */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {[
              { label: "Всего", value: leaderships.length, color: "#6b7280" },
              { label: "Активных", value: activeLeaderships, color: "#9b2335" },
              { label: "Завершено", value: completedLeaderships, color: "#22c55e" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.05]">
                <span className="font-['Russo_One']" style={{ fontSize: "1rem", color: s.color }}>{s.value}</span>
                <span className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>{s.label}</span>
              </div>
            ))}
          </div>
          {leaderships.filter((l) => l.status === "active").length === 0 ? (
            <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.75rem" }}>
              Нет активных лидерок
            </p>
          ) : (
            <div className="space-y-2">
              {leaderships
                .filter((l) => l.status === "active")
                .map((l) => (
                  <div key={l.id} className="flex items-center gap-3 p-3 border border-white/5 bg-white/[0.01]">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: l.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-['Oswald'] text-white/60 tracking-wide" style={{ fontSize: "0.82rem" }}>
                        {l.faction}
                      </span>
                      <span className="font-['Oswald'] text-white/20 tracking-wide ml-3" style={{ fontSize: "0.7rem" }}>
                        {l.server}
                      </span>
                    </div>
                    <span className="font-['Oswald'] text-white/30 tracking-wide shrink-0" style={{ fontSize: "0.72rem" }}>
                      {l.leader}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
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
  const [newRole, setNewRole] = useState<Member["role"]>("academy");
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<Member["role"]>("academy");
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
    setNewRole("academy");
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
        {(["all", "owner", "dep_owner", "close", "old", "main", "academy"] as const).map((r) => (
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
                    <option value="owner">Owner</option>
                    <option value="dep_owner">Dep.Owner</option>
                    <option value="close">Close</option>
                    <option value="old">Old</option>
                    <option value="main">Main</option>
                    <option value="academy">Academy</option>
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
                      <option value="owner">Owner</option>
                      <option value="dep_owner">Dep.Owner</option>
                      <option value="close">Close</option>
                      <option value="old">Old</option>
                      <option value="main">Main</option>
                      <option value="academy">Academy</option>
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
    { id: "news", label: "Новости", color: "#ec4899" },
    { id: "media", label: "Медиа", color: "#9b2335" },
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

  const handleSave = () => {
    saveState("promoCode", promoCode);
    saveState("promoReward", promoReward);
    saveState("discordLink", discordLink);
    saveState("twitchLink", twitchLink);
    addAuditLog("Настройки обновлены", "settings", "Промокод, ссылки");
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

        {/* Webhook info note */}
        <div className="border border-[#5865F2]/10 bg-[#5865F2]/[0.02] p-4 flex items-start gap-3">
          <Bell size={14} className="text-[#5865F2]/30 shrink-0 mt-0.5" />
          <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.7rem", lineHeight: 1.7 }}>
            Настройка Discord вебхуков перенесена в отдельный раздел{" "}
            <span className="text-[#5865F2]/40">«Вебхуки»</span>{" "}
            в боковом меню.
          </p>
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
            Все данные хранятся локально в браузере (localStorage). При очистке кеша или смене браузера данные будут утеряны. Для полноценной работы рекомендуется подключить базу данных.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STAFF SELECTOR
   ═══════════════════════════════════════════════ */

function StaffSelector({
  staff,
  onSelect,
  onBack,
}: {
  staff: StaffMember[];
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  const activeStaff = staff.filter((s) => s.active);
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#9b2335]/3 blur-[200px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-10">
          <h1 className="font-['Russo_One'] text-[#9b2335]" style={{ fontSize: "1.5rem", letterSpacing: "0.05em" }}>
            SCHWARZ FAMILY
          </h1>
          <p className="font-['Oswald'] text-white/20 uppercase tracking-[0.3em] mt-2" style={{ fontSize: "0.65rem" }}>
            Выберите свой профиль
          </p>
        </div>

        <div className="border border-white/8 bg-white/[0.02] p-6 space-y-2">
          {activeStaff.map((s) => {
            const permCount = s.permissions.length;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="w-full flex items-center gap-4 p-4 border border-white/5 bg-white/[0.01] hover:border-[#9b2335]/20 hover:bg-[#9b2335]/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#9b2335]/15 bg-[#9b2335]/5 shrink-0">
                  <User size={18} className="text-[#9b2335]/50" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Oswald'] text-white/70 tracking-wide group-hover:text-white/90 transition-colors" style={{ fontSize: "0.9rem" }}>
                    {s.name}
                  </p>
                  <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
                    {s.position} · {permCount} {permCount === 1 ? "право" : permCount < 5 ? "права" : "прав"}
                  </p>
                </div>
                <ChevronRight size={14} className="text-white/10 group-hover:text-[#9b2335]/40 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>

        <button
          onClick={onBack}
          className="w-full mt-4 font-['Oswald'] text-white/15 uppercase tracking-wider hover:text-white/30 transition-colors py-2"
          style={{ fontSize: "0.65rem" }}
        >
          ← Выйти из админки
        </button>
      </motion.div>
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
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(() => sessionStorage.getItem("schwarz_admin_staff_id"));

  const [members, setMembersState] = useState<Member[]>(() => loadState("members", defaultMembers));
  const [leaderships, setLeadershipsState] = useState<Leadership[]>(() => loadState("leaderships", defaultLeaderships));
  const [announcements, setAnnouncementsState] = useState<Announcement[]>(() => loadState("announcements", defaultAnnouncements));
  const [rules, setRulesState] = useState<Rule[]>(() => loadState("rules", defaultRules));
  const [principles, setPrinciplesState] = useState<Principle[]>(() => loadState("principles", defaultPrinciples));
  const [staffMembers, setStaffState] = useState<StaffMember[]>(() => loadState("staff", defaultStaff));

  const setMembers = (m: Member[]) => {
    setMembersState(m);
    saveState("members", m);
  };
  const setLeaderships = (l: Leadership[]) => {
    setLeadershipsState(l);
    saveState("leaderships", l);
  };
  const setAnnouncements = (a: Announcement[]) => {
    setAnnouncementsState(a);
    saveState("announcements", a);
  };
  const setRules = (r: Rule[]) => {
    setRulesState(r);
    saveState("rules", r);
  };
  const setPrinciples = (p: Principle[]) => {
    setPrinciplesState(p);
    saveState("principles", p);
  };
  const setStaff = (s: StaffMember[]) => {
    setStaffState(s);
    saveState("staff", s);
  };

  // Pages & Navbar writable data
  const adminData = useAdminDataWritable();
  const { pendingCount: pendingApps } = useApplications();

  const handleLogout = () => {
    sessionStorage.removeItem("schwarz_admin_auth");
    sessionStorage.removeItem("schwarz_admin_staff_id");
    setAuthed(false);
    setCurrentStaffId(null);
  };

  const currentStaff = staffMembers.find((s) => s.id === currentStaffId && s.active);
  const allowedTabs: Tab[] | undefined = currentStaff
    ? (Object.entries(tabPermissions)
        .filter(([, perm]) => !perm || currentStaff.permissions.includes(perm))
        .map(([tab]) => tab as Tab))
    : undefined;

  const handleSelectStaff = (id: string) => {
    sessionStorage.setItem("schwarz_admin_staff_id", id);
    setCurrentStaffId(id);
  };

  const handleTabChange = (tab: Tab) => {
    if (allowedTabs && !allowedTabs.includes(tab)) return;
    setActiveTab(tab);
  };

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  if (!currentStaffId || !currentStaff) {
    return <StaffSelector staff={staffMembers} onSelect={handleSelectStaff} onBack={handleLogout} />;
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
            {currentStaff && (
              <button
                onClick={() => { sessionStorage.removeItem("schwarz_admin_staff_id"); setCurrentStaffId(null); }}
                className="font-['Oswald'] text-white/20 tracking-wide hover:text-white/40 transition-colors"
                style={{ fontSize: "0.6rem" }}
                title="Сменить профиль"
              >
                [ сменить ]
              </button>
            )}
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
              {activeTab === "news" && <NewsTab staffName={currentStaff?.name ?? "Admin"} />}
              {activeTab === "moments" && <MomentsTab staffName={currentStaff?.name ?? "Admin"} />}
              {activeTab === "webhooks" && <WebhooksTab />}
              {activeTab === "auditlog" && <AuditLogTab />}
              {activeTab === "settings" && <SettingsTab />}
              {activeTab === "accounts" && <AccountsTab />}
              {activeTab === "vehicles" && <VehiclesAdminTab />}
              {activeTab === "contracts_admin" && <ContractsAdminTab />}
              {activeTab === "upgrades_admin" && <UpgradesAdminTab />}
              {activeTab === "infrastructure_admin" && <InfrastructureAdminTab />}
              {activeTab === "telegram_bot" && <TelegramBotTab />}
              {activeTab === "birthdays" && <BirthdaysTab />}
              {activeTab === "system_status" && <SystemStatusTab />}
              {activeTab === "role_templates" && <RoleTemplatesTab />}
              {activeTab === "goals" && <FamilyGoalsTab staffName={currentStaff?.name ?? "Admin"} />}
              {activeTab === "reports" && <ReportsTab staffName={currentStaff?.name ?? "Admin"} />}
              {activeTab === "notifications" && <NotificationsAdminTab staffName={currentStaff?.name ?? "Admin"} />}
              {activeTab === "treasury" && <TreasuryTab staffName={currentStaff?.name ?? "Admin"} />}
              {activeTab === "stats_admin" && <StatsAdminTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

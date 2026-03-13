import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot, Key, Save, Eye, EyeOff, ToggleLeft, ToggleRight,
  Plus, Trash2, Edit3, X, CheckCircle2, Copy,
  RefreshCw, Search, Shield, Command,
  Users, Activity, AlertTriangle, Link2, Unlink,
  Bell, BellOff, UserCheck, UserX,
} from "lucide-react";
import { type Account, type TgNotifKey, TG_NOTIF_LABELS, TG_NOTIF_COLORS } from "../../hooks/useAuth";

/* ════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════ */

type RoleKey = "owner" | "dep_owner" | "close" | "old" | "main" | "academy" | "all";

const ROLE_LABELS: Record<RoleKey, string> = {
  all:       "Все участники",
  owner:     "Owner",
  dep_owner: "Dep.Owner",
  close:     "Close",
  old:       "Old",
  main:      "Main",
  academy:   "Academy",
};

const ROLE_COLORS: Record<RoleKey, string> = {
  all:       "#9b2335",
  owner:     "#9b2335",
  dep_owner: "#7a1c2a",
  close:     "#c43e54",
  old:       "#b8860b",
  main:      "#ff3366",
  academy:   "#888899",
};

type CmdCategory = "finance" | "contracts" | "status" | "info" | "admin" | "custom";

const CAT_LABELS: Record<CmdCategory, string> = {
  finance:   "Финансы",
  contracts: "Контракты",
  status:    "Статус",
  info:      "Инфо",
  admin:     "Админ",
  custom:    "Custom",
};

const CAT_COLORS: Record<CmdCategory, string> = {
  finance:   "#22c55e",
  contracts: "#f59e0b",
  status:    "#38bdf8",
  info:      "#a78bfa",
  admin:     "#9b2335",
  custom:    "#ec4899",
};

interface BotCommand {
  id: string;
  command: string;       // /команда
  description: string;
  example: string;
  category: CmdCategory;
  enabled: boolean;
  allowedRoles: RoleKey[];  // кто может выполнять
}

interface TgAdmin {
  id: string;
  name: string;           // отображаемое имя
  telegramId: string;
  telegramUsername: string;
  permissions: TgPerm[];
  active: boolean;
  addedAt: string;
}

type TgPerm =
  | "cmd_manage"        // управлять командами
  | "members_view"      // видеть участников
  | "contracts_manage"  // управлять контрактами
  | "finance_manage"    // управлять финансами
  | "broadcast"         // массовые рассылки
  | "admin_full";       // полный доступ

const PERM_LABELS: Record<TgPerm, string> = {
  cmd_manage:       "Управление командами",
  members_view:     "Просмотр состава",
  contracts_manage: "Контракты",
  finance_manage:   "Финансы",
  broadcast:        "Рассылки",
  admin_full:       "Полный доступ",
};

const PERM_COLORS: Record<TgPerm, string> = {
  cmd_manage:       "#38bdf8",
  members_view:     "#a78bfa",
  contracts_manage: "#f59e0b",
  finance_manage:   "#22c55e",
  broadcast:        "#ec4899",
  admin_full:       "#9b2335",
};

interface BotConfig {
  token: string;
  botUsername: string;
  enabled: boolean;
  webhookUrl: string;
  secretToken: string;
}

/* ════════════════════════════════════════════════════
   DEFAULT DATA
   ════════════════════════════════════════════════════ */

const DEFAULT_COMMANDS: BotCommand[] = [
  { id: "c1",  command: "/старт",       description: "Привязать Telegram к аккаунту на сайте",  example: "/старт",                category: "admin",     enabled: true,  allowedRoles: ["all"] },
  { id: "c2",  command: "/помощь",      description: "Список всех доступных команд",             example: "/помощь",               category: "info",      enabled: true,  allowedRoles: ["all"] },
  { id: "c3",  command: "/профиль",     description: "Карточка участника с рангом и контрактами",example: "/профиль",              category: "info",      enabled: true,  allowedRoles: ["all"] },
  { id: "c4",  command: "/казна",       description: "Баланс и прогресс казны семьи",            example: "/казна",                category: "finance",   enabled: true,  allowedRoles: ["all"] },
  { id: "c5",  command: "/взнос",       description: "Добавить взнос в казну",                   example: "/взнос 50000 пояснение",category: "finance",   enabled: true,  allowedRoles: ["owner","dep_owner","close","old","main"] },
  { id: "c6",  command: "/контракт",    description: "Закрыть контракт по типу специализации",   example: "/контракт груз",        category: "contracts", enabled: true,  allowedRoles: ["all"] },
  { id: "c7",  command: "/контракты",   description: "Список открытых контрактов",               example: "/контракты",            category: "contracts", enabled: true,  allowedRoles: ["all"] },
  { id: "c8",  command: "/записаться",  description: "Записаться на контракт по ID",             example: "/записаться 42",        category: "contracts", enabled: true,  allowedRoles: ["all"] },
  { id: "c9",  command: "/онлайн",      description: "Установить статус «В игре»",               example: "/онлайн",               category: "status",    enabled: true,  allowedRoles: ["all"] },
  { id: "c10", command: "/офлайн",      description: "Установить статус «Офлайн»",               example: "/офлайн",               category: "status",    enabled: true,  allowedRoles: ["all"] },
  { id: "c11", command: "/занят",       description: "Поставить статус «Занят» на N минут",      example: "/занят 30",             category: "status",    enabled: true,  allowedRoles: ["all"] },
  { id: "c12", command: "/статус",      description: "Посмотреть статус участника",              example: "/статус roman",         category: "status",    enabled: true,  allowedRoles: ["all"] },
  { id: "c13", command: "/топ",         description: "Рейтинг по закрытым контрактам",           example: "/топ",                  category: "info",      enabled: true,  allowedRoles: ["all"] },
  { id: "c14", command: "/объявления",  description: "Последние объявления семьи",               example: "/объявления",           category: "info",      enabled: true,  allowedRoles: ["all"] },
  { id: "c15", command: "/аудит",       description: "Последние 10 финансовых операций",         example: "/аудит",                category: "admin",     enabled: false, allowedRoles: ["owner","dep_owner"] },
  { id: "c16", command: "/выдать",      description: "Выдать роль участнику (только Owner)",     example: "/выдать @roman close",  category: "admin",     enabled: false, allowedRoles: ["owner"] },
  { id: "c17", command: "/рассылка",    description: "Отправить сообщение всем участникам",      example: "/рассылка Встреча в 20:00", category: "admin", enabled: false, allowedRoles: ["owner","dep_owner"] },
];

const DEFAULT_ADMINS: TgAdmin[] = [
  { id: "a1", name: "Madara Schwarz",  telegramId: "",  telegramUsername: "madara_schwarz",  permissions: ["admin_full"],                         active: true,  addedAt: "2026-03-01" },
  { id: "a2", name: "Akihiro Schwarz", telegramId: "",  telegramUsername: "akihiro_schwarz", permissions: ["members_view","contracts_manage","finance_manage"], active: true, addedAt: "2026-03-01" },
];

const DEFAULT_CONFIG: BotConfig = { token: "", botUsername: "", enabled: false, webhookUrl: "", secretToken: "" };

/* ════════════════════════════════════════════════════
   STORAGE
   ════════════════════════════════════════════════════ */

const K = { config: "schwarz_tg_config", commands: "schwarz_tg_commands", admins: "schwarz_tg_admins" };

function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function save<T>(key: string, val: T) { localStorage.setItem(key, JSON.stringify(val)); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ════════════════════════════════════════════════════
   SHARED UI
   ════════════════════════════════════════════════════ */

const iCls = "w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/40 text-white/80 px-3 py-2.5 outline-none transition-colors placeholder:text-white/15";
const iSt  = { fontFamily: "'Oswald',sans-serif", fontSize: "0.82rem" };
const lSt  = { fontFamily: "'Oswald',sans-serif", fontSize: "0.55rem" };

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-white/20 uppercase tracking-widest mb-1.5" style={lSt}>{children}</p>;
}

function Btn({ onClick, children, className = "", type = "button" }: { onClick?: () => void; children: React.ReactNode; className?: string; type?: "button"|"submit" }) {
  return (
    <button type={type} onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 uppercase tracking-wider transition-all ${className}`}
      style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.6rem" }}>
      {children}
    </button>
  );
}

function RoleBadge({ role, small }: { role: RoleKey; small?: boolean }) {
  return (
    <span className={`px-1.5 py-0.5 border uppercase tracking-wider ${small ? "" : ""}`}
      style={{
        fontFamily: "'Oswald',sans-serif",
        fontSize: small ? "0.45rem" : "0.5rem",
        borderColor: `${ROLE_COLORS[role]}35`,
        background: `${ROLE_COLORS[role]}0d`,
        color: ROLE_COLORS[role],
      }}>
      {ROLE_LABELS[role]}
    </span>
  );
}

function PermBadge({ perm }: { perm: TgPerm }) {
  return (
    <span className="px-1.5 py-0.5 border uppercase tracking-wider"
      style={{
        fontFamily: "'Oswald',sans-serif", fontSize: "0.47rem",
        borderColor: `${PERM_COLORS[perm]}30`,
        background: `${PERM_COLORS[perm]}0d`,
        color: PERM_COLORS[perm],
      }}>
      {PERM_LABELS[perm]}
    </span>
  );
}

function CatBadge({ cat }: { cat: CmdCategory }) {
  return (
    <span className="px-1.5 py-0.5 border uppercase tracking-wider shrink-0"
      style={{
        fontFamily: "'Oswald',sans-serif", fontSize: "0.45rem",
        borderColor: `${CAT_COLORS[cat]}30`,
        background: `${CAT_COLORS[cat]}0d`,
        color: CAT_COLORS[cat],
      }}>
      {CAT_LABELS[cat]}
    </span>
  );
}

/* ════════════════════════════════════════════════════
   ROLE PICKER
   ════════════════════════════════════════════════════ */

function RolePicker({ value, onChange }: { value: RoleKey[]; onChange: (v: RoleKey[]) => void }) {
  const roles: RoleKey[] = ["all","owner","dep_owner","close","old","main","academy"];

  const toggle = (r: RoleKey) => {
    if (r === "all") { onChange(["all"]); return; }
    const without = value.filter(v => v !== "all");
    if (without.includes(r)) {
      const next = without.filter(v => v !== r);
      onChange(next.length ? next : ["all"]);
    } else {
      onChange([...without, r]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map(r => {
        const active = value.includes(r) || (r !== "all" && value.includes("all"));
        return (
          <button type="button" key={r} onClick={() => toggle(r)}
            className="px-2 py-1 border uppercase tracking-wider transition-all"
            style={{
              fontFamily: "'Oswald',sans-serif", fontSize: "0.5rem",
              borderColor: active ? `${ROLE_COLORS[r]}50` : "rgba(255,255,255,0.07)",
              background: active ? `${ROLE_COLORS[r]}15` : "transparent",
              color: active ? ROLE_COLORS[r] : "rgba(255,255,255,0.2)",
            }}>
            {ROLE_LABELS[r]}
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   PERM PICKER
   ════════════════════════════════════════════════════ */

function PermPicker({ value, onChange }: { value: TgPerm[]; onChange: (v: TgPerm[]) => void }) {
  const perms: TgPerm[] = ["cmd_manage","members_view","contracts_manage","finance_manage","broadcast","admin_full"];

  const toggle = (p: TgPerm) => {
    if (p === "admin_full") { onChange(value.includes("admin_full") ? [] : ["admin_full"]); return; }
    const without = value.filter(v => v !== "admin_full");
    onChange(without.includes(p) ? without.filter(v => v !== p) : [...without, p]);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {perms.map(p => {
        const active = value.includes(p) || (p !== "admin_full" && value.includes("admin_full"));
        return (
          <button type="button" key={p} onClick={() => toggle(p)}
            className="px-2 py-1 border uppercase tracking-wider transition-all"
            style={{
              fontFamily: "'Oswald',sans-serif", fontSize: "0.5rem",
              borderColor: active ? `${PERM_COLORS[p]}50` : "rgba(255,255,255,0.07)",
              background: active ? `${PERM_COLORS[p]}15` : "transparent",
              color: active ? PERM_COLORS[p] : "rgba(255,255,255,0.2)",
            }}>
            {PERM_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   COMMAND FORM MODAL
   ════════════════════════════════════════════════════ */

const EMPTY_CMD: Omit<BotCommand, "id"> = {
  command: "/", description: "", example: "", category: "custom", enabled: true, allowedRoles: ["all"],
};

function CommandModal({
  initial, onSave, onClose,
}: {
  initial?: BotCommand; onSave: (cmd: BotCommand) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<BotCommand, "id">>(initial ?? EMPTY_CMD);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: initial?.id ?? genId() });
    onClose();
  };

  const cats: CmdCategory[] = ["finance","contracts","status","info","admin","custom"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg border border-white/[0.08] bg-[#0e0e16] overflow-y-auto"
        style={{ maxHeight: "90vh" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Command size={15} className="text-[#9b2335]" strokeWidth={1.5} />
            <p className="text-white uppercase tracking-wider" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.8rem" }}>
              {initial ? "Редактировать команду" : "Новая команда"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Command + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Команда</Label>
              <input required value={form.command}
                onChange={e => setForm(f => ({ ...f, command: e.target.value }))}
                placeholder="/команда" className={iCls} style={iSt} />
            </div>
            <div>
              <Label>Категория</Label>
              <select value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as CmdCategory }))}
                className={iCls} style={iSt}>
                {cats.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Описание</Label>
            <input required value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Что делает эта команда..." className={iCls} style={iSt} />
          </div>

          {/* Example */}
          <div>
            <Label>Пример использования</Label>
            <input value={form.example}
              onChange={e => setForm(f => ({ ...f, example: e.target.value }))}
              placeholder="/команда аргумент" className={iCls} style={iSt} />
          </div>

          {/* Roles */}
          <div>
            <Label>Кто может использовать</Label>
            <RolePicker value={form.allowedRoles} onChange={v => setForm(f => ({ ...f, allowedRoles: v }))} />
          </div>

          {/* Enabled */}
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
              className={`transition-colors ${form.enabled ? "text-[#22c55e]" : "text-white/20"}`}>
              {form.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
            <span className={form.enabled ? "text-white/50" : "text-white/20"}
              style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.65rem" }}>
              {form.enabled ? "Команда включена" : "Команда отключена"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/[0.05]">
            <Btn type="submit" className="bg-[#9b2335] hover:bg-[#b52a40] text-white flex-1 justify-center">
              <Save size={13} /> Сохранить
            </Btn>
            <Btn onClick={onClose} className="border border-white/10 text-white/30 hover:text-white/60">
              Отмена
            </Btn>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   ADMIN FORM MODAL
   ════════════════════════════════════════════════════ */

const EMPTY_ADMIN: Omit<TgAdmin, "id" | "addedAt"> = {
  name: "", telegramId: "", telegramUsername: "", permissions: [], active: true,
};

function AdminModal({
  initial, onSave, onClose,
}: {
  initial?: TgAdmin; onSave: (a: TgAdmin) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<TgAdmin, "id" | "addedAt">>(initial ?? EMPTY_ADMIN);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: initial?.id ?? genId(), addedAt: initial?.addedAt ?? new Date().toISOString().slice(0,10) });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md border border-white/[0.08] bg-[#0e0e16] overflow-y-auto"
        style={{ maxHeight: "90vh" }}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Shield size={15} className="text-[#9b2335]" strokeWidth={1.5} />
            <p className="text-white uppercase tracking-wider" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.8rem" }}>
              {initial ? "Редактировать админа" : "Добавить TG-администратора"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label>Имя (отображаемое)</Label>
            <input required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Roman Schwarz" className={iCls} style={iSt} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Telegram ID</Label>
              <input value={form.telegramId}
                onChange={e => setForm(f => ({ ...f, telegramId: e.target.value }))}
                placeholder="123456789" className={iCls} style={iSt} />
            </div>
            <div>
              <Label>Username (без @)</Label>
              <input value={form.telegramUsername}
                onChange={e => setForm(f => ({ ...f, telegramUsername: e.target.value }))}
                placeholder="roman_schwarz" className={iCls} style={iSt} />
            </div>
          </div>

          <div>
            <Label>Разрешения</Label>
            <PermPicker value={form.permissions} onChange={v => setForm(f => ({ ...f, permissions: v }))} />
          </div>

          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className={`transition-colors ${form.active ? "text-[#22c55e]" : "text-white/20"}`}>
              {form.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
            <span className={form.active ? "text-white/50" : "text-white/20"}
              style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.65rem" }}>
              {form.active ? "Активен" : "Заблокирован"}
            </span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/[0.05]">
            <Btn type="submit" className="bg-[#9b2335] hover:bg-[#b52a40] text-white flex-1 justify-center">
              <Save size={13} /> Сохранить
            </Btn>
            <Btn onClick={onClose} className="border border-white/10 text-white/30 hover:text-white/60">
              Отмена
            </Btn>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   ACCOUNT / MEMBER HELPERS (admin-side, no hook)
   ════════════════════════════════════════════════════ */

function loadAccounts(): Account[] {
  try { const r = localStorage.getItem("schwarz_accounts"); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveAccountsDirect(accounts: Account[]) {
  localStorage.setItem("schwarz_accounts", JSON.stringify(accounts));
}
function loadMembersList(): { id: string; name: string; role: string }[] {
  try { const r = localStorage.getItem("schwarz_admin_members"); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

const ALL_NOTIFS: TgNotifKey[] = ["contracts", "announcements", "mentions", "treasury", "applications"];

/* ════════════════════════════════════════════════════
   TG LINK EDIT MODAL
   ════════════════════════════════════════════════════ */

function TgLinkModal({
  account, memberName, onSave, onClose,
}: {
  account: Account;
  memberName: string;
  onSave: (changes: Partial<Account>) => void;
  onClose: () => void;
}) {
  const [telegramId, setTelegramId] = useState(account.telegramId ?? "");
  const [telegramUsername, setTelegramUsername] = useState(account.telegramUsername ?? "");
  const [notifs, setNotifs] = useState<TgNotifKey[]>(account.tgNotifications ?? [...ALL_NOTIFS]);

  const toggleNotif = (k: TgNotifKey) =>
    setNotifs(n => n.includes(k) ? n.filter(x => x !== k) : [...n, k]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      telegramId: telegramId.trim() || undefined,
      telegramUsername: telegramUsername.trim() || undefined,
      tgLinkedAt: (telegramId.trim() && !account.tgLinkedAt)
        ? new Date().toISOString().slice(0, 10)
        : account.tgLinkedAt,
      tgNotifications: notifs,
    });
    onClose();
  };

  const handleUnlink = () => {
    onSave({ telegramId: undefined, telegramUsername: undefined, tgLinkedAt: undefined, tgNotifications: undefined });
    onClose();
  };

  const isLinked = !!(account.telegramId || telegramId.trim());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md border border-white/[0.09] bg-[#0d0d15] overflow-y-auto"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Link2 size={14} className="text-[#9b2335]" strokeWidth={1.5} />
            <div>
              <p className="text-white uppercase tracking-wider" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.78rem" }}>
                Привязка Telegram
              </p>
              <p className="text-white/25" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.55rem" }}>
                {memberName} · @{account.username}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors"><X size={15} /></button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* TG fields */}
          <div className="space-y-3">
            <div>
              <p className="text-white/20 uppercase tracking-widest mb-1.5" style={lSt}>Telegram ID</p>
              <input value={telegramId} onChange={e => setTelegramId(e.target.value)}
                placeholder="123456789" className={iCls} style={iSt} />
              <p className="text-white/12 mt-1" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.52rem" }}>
                Числовой ID — можно узнать через @userinfobot
              </p>
            </div>
            <div>
              <p className="text-white/20 uppercase tracking-widest mb-1.5" style={lSt}>Username (без @)</p>
              <div className="flex items-center">
                <span className="px-2.5 border border-r-0 border-white/[0.07] bg-white/[0.02] text-white/20 self-stretch flex items-center"
                  style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.78rem" }}>@</span>
                <input value={telegramUsername} onChange={e => setTelegramUsername(e.target.value)}
                  placeholder="roman_schwarz" className={`${iCls} flex-1`} style={iSt} />
              </div>
            </div>
            {account.tgLinkedAt && (
              <p className="text-white/15" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.55rem" }}>
                Привязан: {account.tgLinkedAt}
              </p>
            )}
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-white/20 uppercase tracking-widest" style={lSt}>Уведомления</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setNotifs([...ALL_NOTIFS])}
                  className="text-white/20 hover:text-white/55 transition-colors uppercase tracking-wider"
                  style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.48rem" }}>Все вкл</button>
                <span className="text-white/10">·</span>
                <button type="button" onClick={() => setNotifs([])}
                  className="text-white/20 hover:text-white/55 transition-colors uppercase tracking-wider"
                  style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.48rem" }}>Все выкл</button>
              </div>
            </div>
            <div className="space-y-1.5">
              {ALL_NOTIFS.map(k => {
                const on = notifs.includes(k);
                return (
                  <div key={k} onClick={() => toggleNotif(k)}
                    className="flex items-center justify-between px-3 py-2.5 border cursor-pointer transition-all select-none"
                    style={{
                      borderColor: on ? `${TG_NOTIF_COLORS[k]}35` : "rgba(255,255,255,0.05)",
                      background: on ? `${TG_NOTIF_COLORS[k]}08` : "rgba(255,255,255,0.01)",
                    }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full transition-all"
                        style={{ background: on ? TG_NOTIF_COLORS[k] : "rgba(255,255,255,0.12)" }} />
                      <span className="uppercase tracking-wider transition-colors"
                        style={{
                          fontFamily: "'Oswald',sans-serif", fontSize: "0.65rem",
                          color: on ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.22)",
                        }}>
                        {TG_NOTIF_LABELS[k]}
                      </span>
                    </div>
                    {on
                      ? <Bell size={12} style={{ color: TG_NOTIF_COLORS[k] }} />
                      : <BellOff size={12} className="text-white/12" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t border-white/[0.05]">
            <Btn type="submit" className="bg-[#9b2335] hover:bg-[#b52a40] text-white flex-1 justify-center">
              <Save size={13} /> Сохранить
            </Btn>
            {isLinked && (
              <Btn onClick={handleUnlink}
                className="border border-[#ff3366]/20 text-[#ff3366]/50 hover:bg-[#ff3366]/8 hover:text-[#ff3366]/80">
                <Unlink size={12} /> Отвязать
              </Btn>
            )}
            <Btn onClick={onClose} className="border border-white/10 text-white/30 hover:text-white/60">
              Отмена
            </Btn>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION: LINKS (who linked TG, who not, notifications)
   ════════════════════════════════════════════════════ */

type LinkFilter = "all" | "linked" | "unlinked";

const ROLE_COLORS_MAP: Record<string, string> = {
  owner: "#9b2335", dep_owner: "#7a1c2a", close: "#c43e54",
  old: "#b8860b", main: "#ff3366", academy: "#888899",
};
const ROLE_LABELS_MAP: Record<string, string> = {
  owner: "Owner", dep_owner: "Dep.Owner", close: "Close",
  old: "Old", main: "Main", academy: "Academy",
};

function LinksSection() {
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const members = loadMembersList();
  const [filter, setFilter] = useState<LinkFilter>("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Account | null>(null);

  const persistUpdate = (accountId: string, changes: Partial<Account>) => {
    const updated = accounts.map(a => a.id === accountId ? { ...a, ...changes } : a);
    saveAccountsDirect(updated);
    setAccounts(updated);
  };

  const getMemberName = (memberId: string) => members.find(m => m.id === memberId)?.name ?? "—";
  const getMemberRole = (memberId: string) => members.find(m => m.id === memberId)?.role ?? "";

  const linkedCount   = accounts.filter(a => !!(a.telegramId || a.telegramUsername)).length;
  const unlinkedCount = accounts.length - linkedCount;

  const visible = accounts.filter(a => {
    const isLinked = !!(a.telegramId || a.telegramUsername);
    const matchFilter =
      filter === "all"      ? true :
      filter === "linked"   ? isLinked :
                              !isLinked;
    const q = search.toLowerCase();
    const matchSearch = !q
      || a.username.toLowerCase().includes(q)
      || getMemberName(a.memberId).toLowerCase().includes(q)
      || (a.telegramUsername ?? "").toLowerCase().includes(q)
      || (a.telegramId ?? "").includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Всего аккаунтов", value: accounts.length, color: "rgba(255,255,255,0.5)" },
          { label: "Привязаны",       value: linkedCount,     color: "#22c55e" },
          { label: "Не привязаны",    value: unlinkedCount,   color: "#ff3366" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-white/[0.06] p-4 text-center bg-white/[0.01]">
            <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: "1.5rem", color, lineHeight: 1 }}>{value}</p>
            <p className="text-white/20 uppercase tracking-widest mt-1" style={lSt}>{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Имя, логин, @username, ID..." className={`${iCls} pl-8`} style={iSt} />
        </div>
        <div className="flex gap-1.5 shrink-0">
          {([
            { id: "all" as LinkFilter,      label: "Все",          icon: Users,     ac: "#9b2335" },
            { id: "linked" as LinkFilter,   label: "Привязаны",    icon: UserCheck, ac: "#22c55e" },
            { id: "unlinked" as LinkFilter, label: "Не привязаны", icon: UserX,     ac: "#ff3366" },
          ]).map(({ id, label, icon: Icon, ac }) => (
            <button key={id} onClick={() => setFilter(id)}
              className="flex items-center gap-1.5 px-3 py-2 border uppercase tracking-wider transition-all"
              style={{
                fontFamily: "'Oswald',sans-serif", fontSize: "0.52rem",
                borderColor: filter === id ? `${ac}55` : "rgba(255,255,255,0.07)",
                background:  filter === id ? `${ac}10` : "transparent",
                color:       filter === id ? ac : "rgba(255,255,255,0.25)",
              }}>
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/[0.06] overflow-x-auto">
        {/* Head */}
        <div className="min-w-[620px] grid px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.02]"
          style={{ gridTemplateColumns: "1.2fr 90px 160px 160px 60px" }}>
          {["Участник / логин", "Роль", "Telegram", "Уведомления", ""].map(h => (
            <span key={h} className="text-white/20 uppercase tracking-widest" style={lSt}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="min-w-[620px] divide-y divide-white/[0.03]">
          <AnimatePresence initial={false}>
            {visible.map(acc => {
              const memberName = getMemberName(acc.memberId);
              const memberRole = getMemberRole(acc.memberId);
              const isLinked = !!(acc.telegramId || acc.telegramUsername);
              const activeNotifs = acc.tgNotifications ?? (isLinked ? ALL_NOTIFS : []);

              return (
                <motion.div key={acc.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout
                  className="group grid px-4 py-3 items-center hover:bg-white/[0.015] transition-colors"
                  style={{ gridTemplateColumns: "1.2fr 90px 160px 160px 60px" }}>

                  {/* Участник */}
                  <div className="min-w-0 pr-3">
                    <p className="text-white/75 truncate" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.78rem" }}>
                      {memberName}
                    </p>
                    <p className="text-white/20 truncate" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.56rem" }}>
                      @{acc.username}
                    </p>
                  </div>

                  {/* Роль */}
                  <div>
                    {memberRole ? (
                      <span className="px-1.5 py-0.5 border uppercase tracking-wider"
                        style={{
                          fontFamily: "'Oswald',sans-serif", fontSize: "0.44rem",
                          borderColor: `${ROLE_COLORS_MAP[memberRole] ?? "#888"}30`,
                          background:  `${ROLE_COLORS_MAP[memberRole] ?? "#888"}0d`,
                          color: ROLE_COLORS_MAP[memberRole] ?? "#888",
                        }}>
                        {ROLE_LABELS_MAP[memberRole] ?? memberRole}
                      </span>
                    ) : <span className="text-white/12" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.55rem" }}>—</span>}
                  </div>

                  {/* TG */}
                  <div className="min-w-0 pr-2">
                    {isLinked ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-[#22c55e] shrink-0" />
                          <span className="text-[#22c55e]/70 truncate"
                            style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.62rem" }}>
                            {acc.telegramUsername ? `@${acc.telegramUsername}` : acc.telegramId}
                          </span>
                        </div>
                        {acc.telegramId && (
                          <p className="text-white/15 mt-0.5 pl-2.5" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.48rem" }}>
                            ID: {acc.telegramId}
                          </p>
                        )}
                        {acc.tgLinkedAt && (
                          <p className="text-white/12 pl-2.5" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.45rem" }}>
                            с {acc.tgLinkedAt}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-white/12 shrink-0" />
                        <span className="text-white/18" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.6rem" }}>Не привязан</span>
                      </div>
                    )}
                  </div>

                  {/* Notifications dots */}
                  <div>
                    {isLinked ? (
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {ALL_NOTIFS.map(k => {
                            const on = activeNotifs.includes(k);
                            return (
                              <div key={k} className="w-1.5 h-1.5 rounded-full transition-all"
                                title={`${TG_NOTIF_LABELS[k]}: ${on ? "включено" : "выключено"}`}
                                style={{ background: on ? TG_NOTIF_COLORS[k] : "rgba(255,255,255,0.08)" }} />
                            );
                          })}
                        </div>
                        <p className="text-white/20" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.47rem" }}>
                          {activeNotifs.length}/{ALL_NOTIFS.length} активных
                        </p>
                      </div>
                    ) : (
                      <span className="text-white/10" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.55rem" }}>—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setModal(acc)}
                      className="p-1.5 border border-white/[0.07] text-white/20 hover:text-white/70 hover:border-white/25 transition-all"
                      title="Редактировать привязку">
                      <Edit3 size={12} />
                    </button>
                    {isLinked && (
                      <button
                        onClick={() => persistUpdate(acc.id, {
                          telegramId: undefined, telegramUsername: undefined,
                          tgLinkedAt: undefined, tgNotifications: undefined,
                        })}
                        className="p-1.5 border border-[#ff3366]/12 text-[#ff3366]/25 hover:text-[#ff3366]/70 hover:border-[#ff3366]/35 transition-all"
                        title="Отвязать TG">
                        <Unlink size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {visible.length === 0 && (
            <div className="text-center py-10">
              <Link2 size={26} className="text-white/6 mx-auto mb-3" />
              <p className="text-white/15" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.7rem" }}>Нет результатов</p>
            </div>
          )}
        </div>
      </div>

      {/* Notif legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
        <span className="text-white/12 uppercase tracking-wider" style={lSt}>Уведомления:</span>
        {ALL_NOTIFS.map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: TG_NOTIF_COLORS[k] }} />
            <span className="text-white/25" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.5rem" }}>
              {TG_NOTIF_LABELS[k]}
            </span>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {modal && (
          <TgLinkModal
            account={modal}
            memberName={getMemberName(modal.memberId)}
            onSave={changes => persistUpdate(modal.id, changes)}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION: BOT CONFIG (minimal)
   ════════════════════════════════════════════════════ */

function ConfigSection() {
  const [cfg, setCfg] = useState<BotConfig>(() => load(K.config, DEFAULT_CONFIG));
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    save(K.config, cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const genSecret = () => setCfg(c => ({
    ...c, secretToken: Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("")
  }));

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between p-4 border border-white/[0.07]"
        style={{ background: cfg.enabled && cfg.token ? "rgba(34,197,94,0.03)" : "rgba(255,255,255,0.01)" }}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 flex items-center justify-center border ${cfg.enabled && cfg.token ? "border-[#22c55e]/25 bg-[#22c55e]/5" : "border-white/[0.07]"}`}>
            <Bot size={16} strokeWidth={1.5} className={cfg.enabled && cfg.token ? "text-[#22c55e]" : "text-white/20"} />
          </div>
          <div>
            <p className="text-white/60" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.8rem" }}>
              {cfg.botUsername ? `@${cfg.botUsername}` : "Бот не настроен"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1 h-1 rounded-full ${cfg.enabled && cfg.token ? "bg-[#22c55e]" : "bg-white/15"}`} />
              <span className={cfg.enabled && cfg.token ? "text-[#22c55e]/60" : "text-white/20"}
                style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {cfg.enabled && cfg.token ? "Активен" : "Не настроен"}
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => { const next = { ...cfg, enabled: !cfg.enabled }; setCfg(next); save(K.config, next); }}
          className={`transition-colors ${cfg.enabled ? "text-[#22c55e]" : "text-white/20 hover:text-white/40"}`}>
          {cfg.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-3">
        {/* Token */}
        <div>
          <Label>Bot Token</Label>
          <div className="relative">
            <input type={showToken ? "text" : "password"} value={cfg.token}
              onChange={e => setCfg(c => ({ ...c, token: e.target.value }))}
              placeholder="1234567890:AAExxxxxxx..." className={`${iCls} pr-9`} style={iSt} />
            <button type="button" onClick={() => setShowToken(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/50 transition-colors">
              {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        {/* Username + Webhook */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Username бота</Label>
            <div className="flex items-center">
              <span className="px-2 border border-r-0 border-white/[0.07] bg-white/[0.02] text-white/20 h-full flex items-center"
                style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.75rem" }}>@</span>
              <input value={cfg.botUsername}
                onChange={e => setCfg(c => ({ ...c, botUsername: e.target.value }))}
                placeholder="schwarz_bot" className={`${iCls} flex-1`} style={iSt} />
            </div>
          </div>
          <div>
            <Label>Webhook URL</Label>
            <div className="flex">
              <input value={cfg.webhookUrl}
                onChange={e => setCfg(c => ({ ...c, webhookUrl: e.target.value }))}
                placeholder="https://..." className={`${iCls} flex-1`} style={iSt} />
              {cfg.webhookUrl && (
                <button type="button" onClick={() => navigator.clipboard.writeText(cfg.webhookUrl)}
                  className="px-2.5 border border-l-0 border-white/[0.07] text-white/20 hover:text-white/50 transition-colors">
                  <Copy size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secret */}
        <div>
          <Label>Secret Token</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input type={showSecret ? "text" : "password"} value={cfg.secretToken}
                onChange={e => setCfg(c => ({ ...c, secretToken: e.target.value }))}
                placeholder="auto-generated" className={`${iCls} pr-9`} style={iSt} />
              <button type="button" onClick={() => setShowSecret(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/50 transition-colors">
                {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <button type="button" onClick={genSecret}
              className="shrink-0 flex items-center gap-1.5 px-3 border border-white/[0.07] text-white/25 hover:text-white/55 transition-colors"
              style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.58rem", textTransform: "uppercase" }}>
              <RefreshCw size={11} /> Сгенерировать
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Btn type="submit" className="bg-[#9b2335] hover:bg-[#b52a40] text-white">
            <Save size={13} /> Сохранить
          </Btn>
          <AnimatePresence>
            {saved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-[#22c55e]/70">
                <CheckCircle2 size={13} />
                <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.65rem" }}>Сохранено</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION: COMMANDS
   ════════════════════════════════════════════════════ */

function CommandsSection() {
  const [commands, setCommands] = useState<BotCommand[]>(() => load(K.commands, DEFAULT_COMMANDS));
  const [modal, setModal] = useState<{ open: boolean; cmd?: BotCommand }>({ open: false });
  const [filter, setFilter] = useState<CmdCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const persist = (next: BotCommand[]) => { setCommands(next); save(K.commands, next); };

  const handleSave = (cmd: BotCommand) => {
    persist(commands.some(c => c.id === cmd.id)
      ? commands.map(c => c.id === cmd.id ? cmd : c)
      : [...commands, cmd]);
  };

  const handleDelete = (id: string) => { persist(commands.filter(c => c.id !== id)); setDeleteId(null); };

  const handleToggle = (id: string) =>
    persist(commands.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));

  const cats: Array<CmdCategory | "all"> = ["all","finance","contracts","status","info","admin","custom"];

  const visible = commands.filter(c => {
    const matchCat = filter === "all" || c.category === filter;
    const matchSearch = !search || c.command.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const enabledCount = commands.filter(c => c.enabled).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по команде..." className={`${iCls} pl-8`} style={iSt} />
        </div>
        {/* Add */}
        <Btn onClick={() => setModal({ open: true })} className="bg-[#9b2335]/80 hover:bg-[#9b2335] text-white shrink-0">
          <Plus size={13} /> Добавить команду
        </Btn>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {cats.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="px-2.5 py-1 border uppercase tracking-wider transition-all"
            style={{
              fontFamily: "'Oswald',sans-serif", fontSize: "0.5rem",
              borderColor: filter === cat ? (cat === "all" ? "#9b233560" : `${CAT_COLORS[cat as CmdCategory]}60`) : "rgba(255,255,255,0.07)",
              background: filter === cat ? (cat === "all" ? "#9b233512" : `${CAT_COLORS[cat as CmdCategory]}12`) : "transparent",
              color: filter === cat ? (cat === "all" ? "#9b2335" : CAT_COLORS[cat as CmdCategory]) : "rgba(255,255,255,0.25)",
            }}>
            {cat === "all" ? `Все (${commands.length})` : `${CAT_LABELS[cat as CmdCategory]} (${commands.filter(c => c.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-white/20" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.58rem" }}>
        <Activity size={11} />
        <span>{enabledCount} из {commands.length} команд активны · показано {visible.length}</span>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {visible.map(cmd => (
            <motion.div key={cmd.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              layout
              className="group border transition-all"
              style={{
                borderColor: cmd.enabled ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                background: cmd.enabled ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.003)",
              }}>
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Toggle */}
                <button onClick={() => handleToggle(cmd.id)}
                  className={`shrink-0 transition-colors ${cmd.enabled ? "text-[#22c55e]" : "text-white/12 hover:text-white/30"}`}>
                  {cmd.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>

                {/* Command */}
                <code className="shrink-0 min-w-[110px]"
                  style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.78rem",
                    color: cmd.enabled ? "#f59e0b" : "rgba(255,255,255,0.2)" }}>
                  {cmd.command}
                </code>

                <CatBadge cat={cmd.category} />

                {/* Description */}
                <p className="flex-1 truncate"
                  style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.67rem",
                    color: cmd.enabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)" }}>
                  {cmd.description}
                </p>

                {/* Roles (compact) */}
                <div className="hidden md:flex items-center gap-1 shrink-0">
                  {cmd.allowedRoles.slice(0,2).map(r => <RoleBadge key={r} role={r} small />)}
                  {cmd.allowedRoles.length > 2 && (
                    <span className="text-white/20" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.45rem" }}>
                      +{cmd.allowedRoles.length - 2}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal({ open: true, cmd })}
                    className="p-1.5 text-white/20 hover:text-white/70 transition-colors">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => setDeleteId(cmd.id)}
                    className="p-1.5 text-white/20 hover:text-[#ff3366]/70 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Example on hover (if has) */}
              {cmd.example && (
                <div className="hidden group-hover:flex items-center gap-2 px-4 pb-2.5">
                  <span className="text-white/15 uppercase tracking-wider" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.45rem" }}>пример:</span>
                  <code className="text-[#22c55e]/40" style={{ fontFamily: "monospace", fontSize: "0.7rem" }}>{cmd.example}</code>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="text-center py-10">
            <Command size={28} className="text-white/6 mx-auto mb-3" />
            <p className="text-white/15" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.7rem" }}>Команды не найдены</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <CommandModal initial={modal.cmd} onSave={handleSave} onClose={() => setModal({ open: false })} />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xs border border-[#ff3366]/20 bg-[#0e0e16] p-6 text-center space-y-4">
              <AlertTriangle size={28} className="text-[#ff3366]/50 mx-auto" />
              <p className="text-white/60" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.8rem" }}>
                Удалить команду <code className="text-[#f59e0b]">{commands.find(c => c.id === deleteId)?.command}</code>?
              </p>
              <div className="flex gap-2 justify-center">
                <Btn onClick={() => handleDelete(deleteId)} className="bg-[#ff3366]/20 text-[#ff3366]/80 hover:bg-[#ff3366]/30 border border-[#ff3366]/20">
                  <Trash2 size={12} /> Удалить
                </Btn>
                <Btn onClick={() => setDeleteId(null)} className="border border-white/10 text-white/30 hover:text-white/60">
                  Отмена
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION: TG ADMINS
   ════════════════════════════════════════════════════ */

function AdminsSection() {
  const [admins, setAdmins] = useState<TgAdmin[]>(() => load(K.admins, DEFAULT_ADMINS));
  const [modal, setModal] = useState<{ open: boolean; admin?: TgAdmin }>({ open: false });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const persist = (next: TgAdmin[]) => { setAdmins(next); save(K.admins, next); };

  const handleSave = (a: TgAdmin) => {
    persist(admins.some(x => x.id === a.id)
      ? admins.map(x => x.id === a.id ? a : x)
      : [...admins, a]);
  };

  const handleDelete = (id: string) => { persist(admins.filter(a => a.id !== id)); setDeleteId(null); };

  const handleToggle = (id: string) =>
    persist(admins.map(a => a.id === id ? { ...a, active: !a.active } : a));

  const activeCount = admins.filter(a => a.active).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-white/20" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.58rem" }}>
          <Shield size={11} />
          <span>{activeCount} активных · {admins.length} всего</span>
        </div>
        <Btn onClick={() => setModal({ open: true })} className="bg-[#9b2335]/80 hover:bg-[#9b2335] text-white">
          <Plus size={13} /> Добавить админа
        </Btn>
      </div>

      {/* Admins list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {admins.map(admin => (
            <motion.div key={admin.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              layout
              className="group border transition-all"
              style={{
                borderColor: admin.active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                background: admin.active ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.003)",
              }}>
              <div className="flex items-start gap-3 p-4">
                {/* Avatar */}
                <div className={`shrink-0 w-9 h-9 flex items-center justify-center border ${admin.active ? "border-[#9b2335]/25 bg-[#9b2335]/5" : "border-white/5"}`}>
                  <Shield size={15} strokeWidth={1.5}
                    className={admin.active ? "text-[#9b2335]/60" : "text-white/15"} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={admin.active ? "text-white/80" : "text-white/25"}
                      style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.82rem" }}>
                      {admin.name}
                    </p>
                    {admin.telegramUsername && (
                      <span className="text-white/20" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.58rem" }}>
                        @{admin.telegramUsername}
                      </span>
                    )}
                    {admin.telegramId && (
                      <span className="text-white/15" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.52rem" }}>
                        ID: {admin.telegramId}
                      </span>
                    )}
                    <div className="flex items-center gap-1 ml-1">
                      <div className={`w-1 h-1 rounded-full ${admin.active ? "bg-[#22c55e]" : "bg-white/15"}`} />
                      <span className={admin.active ? "text-[#22c55e]/60" : "text-white/20"}
                        style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.45rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {admin.active ? "Активен" : "Заблокирован"}
                      </span>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions.length === 0
                      ? <span className="text-white/15" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.55rem" }}>Нет разрешений</span>
                      : admin.permissions.map(p => <PermBadge key={p} perm={p} />)
                    }
                  </div>

                  <p className="text-white/15" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.52rem" }}>
                    Добавлен: {admin.addedAt}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleToggle(admin.id)}
                    className={`p-1.5 transition-colors ${admin.active ? "text-[#22c55e]/50 hover:text-[#22c55e]" : "text-white/15 hover:text-white/50"}`}
                    title={admin.active ? "Заблокировать" : "Активировать"}>
                    {admin.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => setModal({ open: true, admin })}
                    className="p-1.5 text-white/20 hover:text-white/70 transition-colors">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => setDeleteId(admin.id)}
                    className="p-1.5 text-white/20 hover:text-[#ff3366]/70 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {admins.length === 0 && (
          <div className="text-center py-10">
            <Shield size={28} className="text-white/6 mx-auto mb-3" />
            <p className="text-white/15" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.7rem" }}>Нет TG-администраторов</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal.open && (
          <AdminModal initial={modal.admin} onSave={handleSave} onClose={() => setModal({ open: false })} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xs border border-[#ff3366]/20 bg-[#0e0e16] p-6 text-center space-y-4">
              <AlertTriangle size={28} className="text-[#ff3366]/50 mx-auto" />
              <p className="text-white/60" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.8rem" }}>
                Удалить <strong className="text-white/80">{admins.find(a => a.id === deleteId)?.name}</strong> из TG-администраторов?
              </p>
              <div className="flex gap-2 justify-center">
                <Btn onClick={() => handleDelete(deleteId)} className="bg-[#ff3366]/20 text-[#ff3366]/80 hover:bg-[#ff3366]/30 border border-[#ff3366]/20">
                  <Trash2 size={12} /> Удалить
                </Btn>
                <Btn onClick={() => setDeleteId(null)} className="border border-white/10 text-white/30 hover:text-white/60">
                  Отмена
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════ */

type Section = "config" | "commands" | "admins" | "links";

const SECTIONS: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "config",   label: "Подключение",      icon: Key,     desc: "Токен · Webhook · Статус" },
  { id: "commands", label: "Команды",           icon: Command, desc: "CRUD · права по ролям" },
  { id: "admins",   label: "TG Администраторы", icon: Shield,  desc: "Кто управляет ботом" },
  { id: "links",    label: "Привязки",          icon: Link2,   desc: "TG ↔ ЛК · уведомления" },
];

export function TelegramBotTab() {
  const [section, setSection] = useState<Section>("commands");
  const cfg: BotConfig = load(K.config, DEFAULT_CONFIG);
  const [botStatus, setBotStatus] = useState<"idle"|"checking"|"online"|"offline">("idle");
  const [botInfo, setBotInfo] = useState<{ username: string; name: string } | null>(null);

  const checkBotStatus = async () => {
    if (!cfg.token) { setBotStatus("offline"); return; }
    setBotStatus("checking");
    try {
      const res = await fetch(`https://api.telegram.org/bot${cfg.token}/getMe`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const d = await res.json();
        setBotInfo({ username: d.result?.username ?? "", name: d.result?.first_name ?? "" });
        setBotStatus("online");
      } else {
        setBotStatus("offline");
      }
    } catch {
      setBotStatus("offline");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-5 border-b border-white/[0.06]">
        <div className="w-10 h-10 bg-[#9b2335]/10 border border-[#9b2335]/20 flex items-center justify-center">
          <Bot size={19} className="text-[#9b2335]" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-white uppercase tracking-wider" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.88rem" }}>
            Telegram Bot
          </h2>
          <p className="text-white/20" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.58rem" }}>
            Управление командами и администраторами бота
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              botStatus === "online" ? "bg-[#22c55e] shadow-[0_0_6px_#22c55e]" :
              botStatus === "offline" ? "bg-[#ff3366]" :
              botStatus === "checking" ? "bg-[#f59e0b]" :
              cfg.enabled && cfg.token ? "bg-[#888899]" : "bg-white/12"
            }`} />
            <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em",
              color: botStatus === "online" ? "rgba(34,197,94,0.6)" : botStatus === "offline" ? "rgba(255,51,102,0.6)" : botStatus === "checking" ? "rgba(245,158,11,0.6)" : cfg.enabled && cfg.token ? "rgba(136,136,153,0.6)" : "rgba(255,255,255,0.2)" }}>
              {botStatus === "online" ? (botInfo ? `@${botInfo.username}` : "Online") :
               botStatus === "offline" ? "Недоступен" :
               botStatus === "checking" ? "Проверка..." :
               cfg.enabled && cfg.token ? "Не проверен" : "Не настроен"}
            </span>
          </div>
          {cfg.token && (
            <button onClick={checkBotStatus} disabled={botStatus === "checking"}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-white/[0.08] text-white/25 hover:text-white/50 hover:border-white/15 transition-all"
              style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.52rem" }}>
              <motion.div animate={botStatus === "checking" ? { rotate: 360 } : {}} transition={{ duration: 0.7, repeat: botStatus === "checking" ? Infinity : 0, ease: "linear" }}>
                <RefreshCw size={10} />
              </motion.div>
              Проверить
            </button>
          )}
        </div>
      </div>

      {/* Bot status banners */}
      <AnimatePresence>
        {botStatus === "online" && botInfo && (
          <motion.div key="ok" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 border border-[#22c55e]/15 bg-[#22c55e]/03">
            <CheckCircle2 size={14} className="text-[#22c55e]/60 shrink-0" />
            <div className="flex-1">
              <p className="text-[#22c55e]/70 uppercase tracking-wider" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.7rem" }}>
                Бот онлайн · {botInfo.name}
              </p>
              <p className="text-white/20" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.55rem" }}>
                @{botInfo.username} · Telegram API отвечает
              </p>
            </div>
          </motion.div>
        )}
        {botStatus === "offline" && (
          <motion.div key="err" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 border border-[#ff3366]/15 bg-[#ff3366]/03">
            <AlertTriangle size={14} className="text-[#ff3366]/60 shrink-0" />
            <div>
              <p className="text-[#ff3366]/70 uppercase tracking-wider" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.7rem" }}>
                Бот недоступен
              </p>
              <p className="text-white/20" style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.55rem" }}>
                {!cfg.token ? "Токен не настроен — перейди в раздел «Настройки»" : "Неверный токен или Telegram API недоступен"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section tabs */}
      <div className="flex gap-2">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="flex-1 flex flex-col items-start gap-1 p-3.5 border transition-all text-left"
            style={{
              borderColor: section === s.id ? "#9b233540" : "rgba(255,255,255,0.06)",
              background: section === s.id ? "#9b233508" : "rgba(255,255,255,0.005)",
            }}>
            <s.icon size={14} strokeWidth={1.5}
              style={{ color: section === s.id ? "#9b2335" : "rgba(255,255,255,0.2)" }} />
            <p className="uppercase tracking-wider"
              style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.65rem",
                color: section === s.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
              {s.label}
            </p>
            <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.15)" }}>
              {s.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}>
          {section === "config"   && <ConfigSection />}
          {section === "commands" && <CommandsSection />}
          {section === "admins"   && <AdminsSection />}
          {section === "links"    && <LinksSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

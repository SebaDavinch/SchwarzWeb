import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, Plus, Trash2, Send, Info, AlertTriangle, CheckCircle2,
  Megaphone, Users, X, Clock, ChevronDown, ChevronUp,
} from "lucide-react";

/* ────────────────────────────────────────────
   TYPES
──────────────────────────────────────────── */

export type NotifType = "info" | "warning" | "success" | "announcement";

export interface AdminNotification {
  id: string;
  title: string;
  text: string;
  type: NotifType;
  createdAt: string;
  createdBy: string;
  targetAll: boolean;
}

/* ────────────────────────────────────────────
   STORAGE
──────────────────────────────────────────── */

const NOTIF_KEY = "schwarz_cabinet_notifications";
const META_KEY = "schwarz_admin_notifications_meta";

function loadNotifications(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotifications(ns: AdminNotification[]) {
  localStorage.setItem(META_KEY, JSON.stringify(ns));
}

// Also syncs to the cabinet feed storage
function syncToCabinetFeed(ns: AdminNotification[]) {
  try {
    const feedItems = ns.map((n) => ({
      id: `admin_notif_${n.id}`,
      title: n.title,
      text: n.text,
      type: n.type,
      createdAt: n.createdAt,
    }));
    localStorage.setItem(NOTIF_KEY, JSON.stringify(feedItems));
  } catch { /* ignore */ }
}

function genId() {
  return "notif_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ────────────────────────────────────────────
   HOOK
──────────────────────────────────────────── */

function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => loadNotifications());

  const persist = useCallback((ns: AdminNotification[]) => {
    setNotifications(ns);
    saveNotifications(ns);
    syncToCabinetFeed(ns);
  }, []);

  const addNotification = (data: Omit<AdminNotification, "id" | "createdAt">) => {
    const n: AdminNotification = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    persist([n, ...notifications]);
    return n;
  };

  const deleteNotification = (id: string) => persist(notifications.filter((n) => n.id !== id));

  const clearAll = () => persist([]);

  return { notifications, addNotification, deleteNotification, clearAll };
}

/* ────────────────────────────────────────────
   UI CONSTANTS
──────────────────────────────────────────── */

const TYPE_META: Record<NotifType, { label: string; color: string; bg: string; Icon: typeof Info; desc: string }> = {
  info:         { label: "Информация",  color: "#3b82f6", bg: "#3b82f610", Icon: Info,         desc: "Обычное уведомление" },
  warning:      { label: "Внимание",    color: "#f59e0b", bg: "#f59e0b10", Icon: AlertTriangle, desc: "Требует внимания" },
  success:      { label: "Успех",       color: "#22c55e", bg: "#22c55e10", Icon: CheckCircle2,  desc: "Позитивное событие" },
  announcement: { label: "Объявление",  color: "#9b2335", bg: "#9b233510", Icon: Megaphone,     desc: "Важное объявление" },
};

const ic = "w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/40 text-white/80 px-3 py-2.5 outline-none transition-colors font-['Oswald'] tracking-wide";
const lc = "block font-['Oswald'] text-white/25 uppercase tracking-wider mb-1.5";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/* ────────────────────────────────────────────
   NOTIFICATION CARD
──────────────────────────────────────────── */

function NotifCard({ n, onDelete }: { n: AdminNotification; onDelete: () => void }) {
  const [exp, setExp] = useState(false);
  const meta = TYPE_META[n.type];
  const Icon = meta.Icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.05] overflow-hidden">
      {/* Top accent line */}
      <div className="h-0.5" style={{ background: `linear-gradient(to right, ${meta.color}, transparent)` }} />

      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Icon */}
        <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-sm"
          style={{ background: meta.bg, border: `1px solid ${meta.color}20` }}>
          <Icon size={14} strokeWidth={1.5} style={{ color: meta.color }} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-['Oswald'] text-white/70 tracking-wide" style={{ fontSize: "0.88rem" }}>{n.title}</span>
            <span className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
              style={{ fontSize: "0.46rem", color: meta.color, background: meta.bg, border: `1px solid ${meta.color}20` }}>
              {meta.label}
            </span>
            <span className="ml-auto font-['Oswald'] text-white/15 tracking-wide flex items-center gap-1"
              style={{ fontSize: "0.58rem" }}>
              <Clock size={9} /> {formatDate(n.createdAt)}
            </span>
          </div>
          <p className="font-['Oswald'] text-white/30 tracking-wide line-clamp-1" style={{ fontSize: "0.72rem" }}>
            {n.text}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-['Oswald'] text-white/15 tracking-wide flex items-center gap-1" style={{ fontSize: "0.58rem" }}>
              <Users size={9} /> Все участники
            </span>
            <span className="font-['Oswald'] text-white/12 tracking-wide" style={{ fontSize: "0.56rem" }}>
              by {n.createdBy}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setExp((v) => !v)}
            className="p-1.5 text-white/15 hover:text-white/40 transition-colors border border-white/[0.06]">
            {exp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button onClick={onDelete}
            className="p-1.5 text-white/15 hover:text-[#ff3366]/60 transition-colors border border-white/[0.06]">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded text */}
      <AnimatePresence>
        {exp && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/[0.04]">
            <div className="px-4 py-3">
              <p className="font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.78rem", lineHeight: 1.7 }}>
                {n.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   COMPOSE FORM
──────────────────────────────────────────── */

interface ComposeProps {
  onSend: (data: Omit<AdminNotification, "id" | "createdAt">) => void;
  onClose: () => void;
  staffName: string;
}

function ComposeModal({ onSend, onClose, staffName }: ComposeProps) {
  const [form, setForm] = useState<{
    title: string; text: string; type: NotifType;
  }>({ title: "", text: "", type: "announcement" });
  const [sent, setSent] = useState(false);

  const valid = form.title.trim() && form.text.trim();

  const handleSend = () => {
    if (!valid) return;
    onSend({ title: form.title.trim(), text: form.text.trim(), type: form.type, targetAll: true, createdBy: staffName });
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,15,0.92)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg border border-white/8 bg-[#0d0d15]"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>Новое уведомление</h3>
            <p className="font-['Oswald'] text-white/20 tracking-wide mt-0.5" style={{ fontSize: "0.65rem" }}>
              Будет отображено в ленте всех участников ЛК
            </p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors"><X size={18} /></button>
        </div>

        {sent ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle2 size={36} className="text-green-500/60 mx-auto mb-4" strokeWidth={1} />
            <p className="font-['Russo_One'] text-white" style={{ fontSize: "0.95rem" }}>Уведомление отправлено!</p>
            <p className="font-['Oswald'] text-white/30 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
              Участники увидят его в ленте ЛК
            </p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {/* Type picker */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Тип уведомления</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.entries(TYPE_META) as [NotifType, typeof TYPE_META[NotifType]][]).map(([type, meta]) => {
                  const Icon = meta.Icon;
                  const isActive = form.type === type;
                  return (
                    <button key={type} type="button" onClick={() => setForm((f) => ({ ...f, type }))}
                      className="flex items-center gap-2.5 px-3 py-2.5 border font-['Oswald'] uppercase tracking-wider text-left transition-all"
                      style={{ fontSize: "0.65rem", color: isActive ? meta.color : "rgba(255,255,255,0.25)", borderColor: isActive ? `${meta.color}30` : "rgba(255,255,255,0.06)", background: isActive ? meta.bg : "transparent" }}>
                      <Icon size={13} strokeWidth={1.5} style={{ color: isActive ? meta.color : "rgba(255,255,255,0.2)" }} />
                      <div>
                        <div>{meta.label}</div>
                        <div style={{ fontSize: "0.5rem", opacity: 0.6 }}>{meta.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Заголовок *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Краткое название события..." className={ic} style={{ fontSize: "0.85rem" }} />
            </div>

            {/* Text */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Текст * <span className="ml-1 normal-case opacity-50">(max 280 символов)</span></label>
              <textarea value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value.slice(0, 280) }))}
                placeholder="Подробное описание уведомления..." rows={3}
                className="w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/30 text-white/70 font-['Oswald'] tracking-wide px-3 py-2.5 outline-none resize-none"
                style={{ fontSize: "0.78rem" }} />
              <p className="font-['Oswald'] text-white/15 tracking-wide mt-1 text-right" style={{ fontSize: "0.55rem" }}>
                {form.text.length}/280
              </p>
            </div>

            {/* Target info */}
            <div className="flex items-center gap-3 px-3 py-2.5 border border-white/[0.06] bg-white/[0.01]">
              <Users size={13} className="text-white/20 shrink-0" />
              <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.7rem" }}>
                Уведомление получат все авторизованные участники Личного кабинета
              </p>
            </div>

            {/* Preview */}
            {form.title && (
              <div className="border border-white/[0.05] p-4">
                <p className={lc} style={{ fontSize: "0.58rem", marginBottom: "0.75rem" }}>Предпросмотр</p>
                <div className="flex items-start gap-3 bg-white/[0.02] p-3 border border-white/[0.04]">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-sm"
                    style={{ background: TYPE_META[form.type].bg, border: `1px solid ${TYPE_META[form.type].color}20` }}>
                    {(() => { const I = TYPE_META[form.type].Icon; return <I size={13} style={{ color: TYPE_META[form.type].color }} />; })()}
                  </div>
                  <div>
                    <p className="font-['Oswald'] text-white/70 tracking-wide" style={{ fontSize: "0.85rem" }}>{form.title}</p>
                    <p className="font-['Oswald'] text-white/30 tracking-wide mt-0.5" style={{ fontSize: "0.7rem" }}>{form.text || "..."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 border border-white/8 text-white/30 font-['Oswald'] uppercase tracking-wider hover:text-white/50 transition-colors" style={{ fontSize: "0.68rem" }}>
                Отмена
              </button>
              <button onClick={handleSend} disabled={!valid}
                className="flex-1 py-2.5 flex items-center justify-center gap-2 font-['Oswald'] uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontSize: "0.68rem", background: "rgba(155,35,53,0.12)", border: "1px solid rgba(155,35,53,0.3)", color: "#9b2335" }}>
                <Send size={13} />
                Отправить всем
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   MAIN TAB
──────────────────────────────────────────── */

interface Props { staffName?: string; }

export function NotificationsAdminTab({ staffName = "Admin" }: Props) {
  const { notifications, addNotification, deleteNotification, clearAll } = useAdminNotifications();
  const [composeOpen, setComposeOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotifType | "all">("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = notifications.filter((n) => typeFilter === "all" || n.type === typeFilter);

  const stats = (Object.keys(TYPE_META) as NotifType[]).reduce((acc, t) => {
    acc[t] = notifications.filter((n) => n.type === t).length;
    return acc;
  }, {} as Record<NotifType, number>);

  const handleSend = (data: Omit<AdminNotification, "id" | "createdAt">) => {
    addNotification(data);
    setComposeOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.4rem" }}>Уведомления</h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Рассылка сообщений в ленту всех участников Личного кабинета
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button onClick={() => setConfirmClear(true)}
              className="px-3 py-2 font-['Oswald'] uppercase tracking-wider border border-white/[0.07] text-white/20 hover:border-[#ff3366]/20 hover:text-[#ff3366]/50 transition-all"
              style={{ fontSize: "0.62rem" }}>
              Очистить все
            </button>
          )}
          <button onClick={() => setComposeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border transition-all"
            style={{ borderColor: "rgba(155,35,53,0.3)", background: "rgba(155,35,53,0.06)", color: "#9b2335" }}>
            <Plus size={14} />
            <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>Создать</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(Object.entries(TYPE_META) as [NotifType, typeof TYPE_META[NotifType]][]).map(([type, meta]) => {
          const Icon = meta.Icon;
          return (
            <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="border border-white/5 bg-white/[0.01] p-3 flex items-center gap-3">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center"
                style={{ background: meta.bg, border: `1px solid ${meta.color}20` }}>
                <Icon size={14} strokeWidth={1.5} style={{ color: meta.color }} />
              </div>
              <div>
                <div className="font-['Russo_One']" style={{ fontSize: "1.3rem", color: meta.color }}>{stats[type]}</div>
                <div className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.52rem" }}>{meta.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info block */}
      <div className="flex items-start gap-3 px-4 py-3 border border-[#3b82f6]/10 bg-[#3b82f6]/02 mb-5">
        <Bell size={13} className="text-[#3b82f6]/50 shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.7rem", lineHeight: 1.6 }}>
          Уведомления публикуются в ленте ЛК всех авторизованных участников. Удаление уведомления скрывает его из лент.
          Используй тип «Объявление» для важных сообщений, «Внимание» — для срочных.
        </p>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-0 border-b border-white/5 mb-4">
        {([
          { id: "all" as const, label: `Все (${notifications.length})` },
          ...((Object.entries(TYPE_META) as [NotifType, typeof TYPE_META[NotifType]][]).map(([type, meta]) => ({
            id: type,
            label: `${meta.label} (${stats[type]})`,
            color: meta.color,
          }))),
        ]).map((tab) => (
          <button key={tab.id} onClick={() => setTypeFilter(tab.id)}
            className={`px-3 py-2.5 border-b-2 font-['Oswald'] uppercase tracking-wider transition-all ${typeFilter === tab.id ? "border-[#9b2335]" : "border-transparent text-white/20 hover:text-white/40"}`}
            style={{ fontSize: "0.6rem", marginBottom: "-1px", color: typeFilter === tab.id ? (("color" in tab && tab.color) || "#9b2335") : undefined }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="border border-white/5 py-16 text-center">
          <Bell size={32} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.8rem" }}>
            Нет уведомлений
          </p>
          <button onClick={() => setComposeOpen(true)}
            className="mt-4 font-['Oswald'] text-[#9b2335]/40 hover:text-[#9b2335]/60 uppercase tracking-wider transition-colors"
            style={{ fontSize: "0.65rem" }}>
            + Создать первое
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((n) => (
              <NotifCard key={n.id} n={n} onDelete={() => deleteNotification(n.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Confirm clear modal */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(10,10,15,0.9)" }} onClick={() => setConfirmClear(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm border border-white/8 bg-[#0d0d15] p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}>
              <div>
                <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>Очистить все уведомления?</h3>
                <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
                  Все {notifications.length} уведомлений будут удалены из лент участников. Действие необратимо.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2.5 border border-white/8 text-white/30 font-['Oswald'] uppercase tracking-wider hover:text-white/50 transition-colors"
                  style={{ fontSize: "0.68rem" }}>
                  Отмена
                </button>
                <button onClick={() => { clearAll(); setConfirmClear(false); }}
                  className="flex-1 py-2.5 font-['Oswald'] uppercase tracking-wider transition-all"
                  style={{ fontSize: "0.68rem", background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.25)", color: "#ff3366" }}>
                  Удалить всё
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose modal */}
      <AnimatePresence>
        {composeOpen && (
          <ComposeModal onSend={handleSend} onClose={() => setComposeOpen(false)} staffName={staffName} />
        )}
      </AnimatePresence>
    </div>
  );
}

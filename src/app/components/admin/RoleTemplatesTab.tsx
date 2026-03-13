import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown, Shield, Star, Award, User, Plus, Edit3, Trash2,
  Save, X, CheckCircle2, Copy, ChevronDown, ChevronUp, Lock, Unlock,
} from "lucide-react";

/* ════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════ */

export type Permission =
  | "manage_members"
  | "manage_rules"
  | "manage_leaderships"
  | "manage_announcements"
  | "manage_settings"
  | "manage_media"
  | "manage_staff"
  | "view_admin"
  | "approve_moments"
  | "manage_goals"
  | "manage_reports"
  | "manage_birthdays";

export const ALL_PERMISSIONS: Permission[] = [
  "view_admin",
  "manage_members",
  "manage_leaderships",
  "manage_announcements",
  "manage_rules",
  "manage_settings",
  "manage_media",
  "manage_staff",
  "approve_moments",
  "manage_goals",
  "manage_reports",
  "manage_birthdays",
];

export const PERMISSION_META: Record<Permission, { label: string; desc: string; group: string; icon: typeof Shield }> = {
  view_admin:          { label: "Доступ к админке",       desc: "Может входить в /admin",                    group: "Базовые",      icon: Shield },
  manage_members:      { label: "Состав",                  desc: "Добавление / изменение / удаление участников", group: "Управление",   icon: User },
  manage_leaderships:  { label: "Лидерки",                 desc: "Управление списком лидерок",                group: "Управление",   icon: Crown },
  manage_announcements:{ label: "Объявления",              desc: "Создание и удаление объявлений",            group: "Управление",   icon: Award },
  manage_rules:        { label: "Правила",                 desc: "Редактирование правил и принципов",         group: "Управление",   icon: Shield },
  manage_settings:     { label: "Настройки",               desc: "Вебхуки, навигация, страницы",              group: "Система",      icon: Shield },
  manage_media:        { label: "Медиа",                   desc: "Моменты, новости",                          group: "Система",      icon: Star },
  manage_staff:        { label: "Стафф",                   desc: "Управление ролями стаффа",                  group: "Система",      icon: Crown },
  approve_moments:     { label: "Одобрение моментов",      desc: "Принимать / отклонять контент в Моментах",  group: "Контент",      icon: CheckCircle2 },
  manage_goals:        { label: "Цели семьи",              desc: "Добавление и редактирование целей",         group: "Контент",      icon: Star },
  manage_reports:      { label: "Жалобы",                  desc: "Просмотр и разрешение жалоб участников",   group: "Модерация",    icon: Shield },
  manage_birthdays:    { label: "Дни рождения",            desc: "Управление записями и настройками ДР",      group: "Модерация",    icon: Award },
};

export interface RoleTemplate {
  id: string;
  name: string;              // e.g. "Owner"
  emoji: string;
  color: string;
  permissions: Permission[];
  description?: string;
  isSystem: boolean;         // нельзя удалить системные
  createdAt: string;
}

/* ─── defaults ─── */
const DEFAULT_TEMPLATES: RoleTemplate[] = [
  {
    id: "rt_owner",
    name: "Owner",
    emoji: "👑",
    color: "#9b2335",
    permissions: [...ALL_PERMISSIONS],
    description: "Полный доступ ко всем функциям",
    isSystem: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rt_depowner",
    name: "Dep. Owner",
    emoji: "🛡",
    color: "#c43e54",
    permissions: ["view_admin","manage_members","manage_leaderships","manage_announcements","manage_reports","manage_goals"],
    description: "Заместитель — управление составом и лидерками",
    isSystem: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rt_close",
    name: "Close",
    emoji: "⭐",
    color: "#f59e0b",
    permissions: ["view_admin","manage_members","manage_announcements","approve_moments"],
    description: "Приближённые — объявления и модерация",
    isSystem: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rt_media",
    name: "Media Manager",
    emoji: "🎬",
    color: "#a78bfa",
    permissions: ["view_admin","manage_media","approve_moments","manage_goals"],
    description: "Управление медиа, моментами, целями",
    isSystem: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rt_mod",
    name: "Модератор",
    emoji: "🔨",
    color: "#38bdf8",
    permissions: ["view_admin","manage_reports","approve_moments"],
    description: "Модерация контента и жалоб",
    isSystem: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

/* ─── storage ─── */
const KEY = "schwarz_role_templates";

function loadTemplates(): RoleTemplate[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TEMPLATES;
  } catch { return DEFAULT_TEMPLATES; }
}

function saveTemplates(t: RoleTemplate[]) {
  localStorage.setItem(KEY, JSON.stringify(t));
}

export function useRoleTemplates() {
  const [templates, setTemplatesState] = useState<RoleTemplate[]>(() => loadTemplates());

  const persist = useCallback((t: RoleTemplate[]) => {
    setTemplatesState(t);
    saveTemplates(t);
  }, []);

  const addTemplate = (data: Omit<RoleTemplate, "id" | "createdAt" | "isSystem">) => {
    const t: RoleTemplate = { ...data, id: "rt_" + Date.now().toString(36), isSystem: false, createdAt: new Date().toISOString() };
    persist([...templates, t]);
    return t;
  };

  const updateTemplate = (id: string, changes: Partial<RoleTemplate>) => {
    persist(templates.map((t) => t.id === id ? { ...t, ...changes } : t));
  };

  const deleteTemplate = (id: string) => {
    persist(templates.filter((t) => t.id !== id || t.isSystem));
  };

  const duplicateTemplate = (id: string) => {
    const src = templates.find((t) => t.id === id);
    if (!src) return;
    const copy: RoleTemplate = { ...src, id: "rt_" + Date.now().toString(36), name: src.name + " (копия)", isSystem: false, createdAt: new Date().toISOString() };
    persist([...templates, copy]);
  };

  return { templates, addTemplate, updateTemplate, deleteTemplate, duplicateTemplate };
}

/* ─── exported loader for other components ─── */
export function loadRoleTemplates(): RoleTemplate[] {
  return loadTemplates();
}

/* ════════════════════════════════════════════════
   UI
   ════════════════════════════════════════════════ */

const ic = "w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/40 text-white/80 px-3 py-2.5 outline-none transition-colors font-['Oswald'] tracking-wide";
const lc = "block font-['Oswald'] text-white/25 uppercase tracking-wider mb-1.5";

/* Groups for permissions picker */
const PERM_GROUPS = ["Базовые", "Управление", "Система", "Контент", "Модерация"] as const;

function PermissionPicker({ value, onChange }: { value: Permission[]; onChange: (p: Permission[]) => void }) {
  const toggle = (p: Permission) => {
    onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  };

  return (
    <div className="space-y-4">
      {PERM_GROUPS.map((group) => {
        const perms = ALL_PERMISSIONS.filter((p) => PERMISSION_META[p].group === group);
        return (
          <div key={group}>
            <p className="font-['Oswald'] text-white/20 uppercase tracking-widest mb-2" style={{ fontSize: "0.55rem" }}>{group}</p>
            <div className="grid grid-cols-1 gap-1.5">
              {perms.map((perm) => {
                const meta = PERMISSION_META[perm];
                const active = value.includes(perm);
                const Icon = meta.icon;
                return (
                  <button key={perm} type="button" onClick={() => toggle(perm)}
                    className="flex items-center gap-3 px-3 py-2 border text-left transition-all duration-200"
                    style={{ borderColor: active ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.05)", background: active ? "rgba(155,35,53,0.06)" : "transparent" }}>
                    <Icon size={12} strokeWidth={1.5} style={{ color: active ? "#9b2335" : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.72rem", color: active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>{meta.label}</p>
                      <p className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.15)" }}>{meta.desc}</p>
                    </div>
                    {active && <CheckCircle2 size={13} className="text-[#9b2335]/60 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Role template card */
function TemplateCard({
  template, onEdit, onDelete, onDuplicate, onApplyToStaff,
}: {
  template: RoleTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onApplyToStaff: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.06] bg-white/[0.01] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-10 h-10 flex items-center justify-center text-xl shrink-0"
          style={{ background: `${template.color}10`, border: `1px solid ${template.color}25`, borderRadius: 2 }}>
          {template.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-['Russo_One'] text-white" style={{ fontSize: "0.95rem" }}>{template.name}</span>
            {template.isSystem && (
              <span className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
                style={{ fontSize: "0.45rem", color: "rgba(155,35,53,0.5)", background: "rgba(155,35,53,0.08)", border: "1px solid rgba(155,35,53,0.15)" }}>
                <Lock size={7} className="inline mr-0.5" />Системная
              </span>
            )}
            <span className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider rounded-full"
              style={{ fontSize: "0.48rem", color: template.color, background: `${template.color}12`, border: `1px solid ${template.color}25` }}>
              {template.permissions.length} прав
            </span>
          </div>
          {template.description && (
            <p className="font-['Oswald'] text-white/25 tracking-wide mt-0.5" style={{ fontSize: "0.65rem" }}>{template.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onApplyToStaff} title="Применить к стаффу"
            className="px-2.5 py-1.5 font-['Oswald'] uppercase tracking-wider border border-white/[0.07] text-white/25 hover:border-[#9b2335]/30 hover:text-[#9b2335]/60 transition-all"
            style={{ fontSize: "0.52rem" }}>
            Применить
          </button>
          <button onClick={onDuplicate} title="Дублировать"
            className="p-2 text-white/15 hover:text-white/40 transition-colors border border-white/[0.06] hover:border-white/[0.12]">
            <Copy size={12} />
          </button>
          <button onClick={onEdit} title="Редактировать"
            className="p-2 text-white/15 hover:text-[#f59e0b]/60 transition-colors border border-white/[0.06] hover:border-[#f59e0b]/20">
            <Edit3 size={12} />
          </button>
          {!template.isSystem && (
            <button onClick={onDelete} title="Удалить"
              className="p-2 text-white/15 hover:text-[#ff3366]/60 transition-colors border border-white/[0.06] hover:border-[#ff3366]/20">
              <Trash2 size={12} />
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)}
            className="p-2 text-white/15 hover:text-white/40 transition-colors border border-white/[0.06]">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expanded permissions */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/[0.05]">
            <div className="px-5 py-4">
              <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-3" style={{ fontSize: "0.58rem" }}>
                Список прав доступа ({template.permissions.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_PERMISSIONS.map((p) => {
                  const has = template.permissions.includes(p);
                  const meta = PERMISSION_META[p];
                  return (
                    <span key={p} className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider"
                      style={{ fontSize: "0.5rem", color: has ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)", background: has ? "rgba(155,35,53,0.08)" : "transparent", border: `1px solid ${has ? "rgba(155,35,53,0.2)" : "rgba(255,255,255,0.04)"}` }}>
                      {has ? "✓" : "—"} {meta.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* Apply-to-staff modal */
function ApplyModal({ template, onClose }: { template: RoleTemplate; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);

  const staff: { id: string; name: string; position: string; permissions: string[] }[] = (() => {
    try { const r = localStorage.getItem("schwarz_admin_staff"); return r ? JSON.parse(r) : []; }
    catch { return []; }
  })();

  const handleApply = () => {
    try {
      const raw = localStorage.getItem("schwarz_admin_staff");
      const allStaff: { id: string; permissions: string[] }[] = raw ? JSON.parse(raw) : [];
      const updated = allStaff.map((s) => selected.includes(s.id) ? { ...s, permissions: [...template.permissions] } : s);
      localStorage.setItem("schwarz_admin_staff", JSON.stringify(updated));
    } catch { /* ignore */ }
    setApplied(true);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,15,0.88)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md border border-white/8 bg-[#0d0d15] p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>Применить шаблон</h3>
            <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.68rem" }}>
              {template.emoji} {template.name} — {template.permissions.length} прав
            </p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors"><X size={18} /></button>
        </div>

        {applied ? (
          <div className="py-6 text-center">
            <CheckCircle2 size={32} className="text-green-500/60 mx-auto mb-3" />
            <p className="font-['Oswald'] text-white/50 tracking-wide" style={{ fontSize: "0.82rem" }}>Права обновлены!</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <p className={lc} style={{ fontSize: "0.6rem" }}>Выбери участников стаффа:</p>
              {staff.length === 0 ? (
                <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.75rem" }}>
                  Нет участников стаффа (добавь в «Правила и Стафф»)
                </p>
              ) : staff.map((s) => (
                <button key={s.id} onClick={() => setSelected((prev) => prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id])}
                  className="w-full flex items-center gap-3 px-4 py-3 border text-left transition-all"
                  style={{ borderColor: selected.includes(s.id) ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)", background: selected.includes(s.id) ? "rgba(155,35,53,0.05)" : "transparent" }}>
                  <div className="w-4 h-4 border flex items-center justify-center shrink-0"
                    style={{ borderColor: selected.includes(s.id) ? "#9b2335" : "rgba(255,255,255,0.15)", background: selected.includes(s.id) ? "rgba(155,35,53,0.15)" : "transparent" }}>
                    {selected.includes(s.id) && <CheckCircle2 size={10} className="text-[#9b2335]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Oswald'] text-white/60 tracking-wide truncate" style={{ fontSize: "0.8rem" }}>{s.name}</p>
                    <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.62rem" }}>{s.position}</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="font-['Oswald'] text-[#f59e0b]/40 tracking-wide" style={{ fontSize: "0.65rem" }}>
              ⚠️ Существующие права будут заменены правами шаблона «{template.name}»
            </p>

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 border border-white/8 text-white/30 font-['Oswald'] uppercase tracking-wider transition-colors hover:text-white/50" style={{ fontSize: "0.68rem" }}>
                Отмена
              </button>
              <button onClick={handleApply} disabled={selected.length === 0}
                className="flex-1 py-2.5 font-['Oswald'] uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontSize: "0.68rem", background: "rgba(155,35,53,0.12)", border: "1px solid rgba(155,35,53,0.3)", color: "#9b2335" }}>
                Применить ({selected.length})
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* Template form modal */
function TemplateModal({ initial, onSave, onClose }: { initial?: RoleTemplate; onSave: (t: RoleTemplate) => void; onClose: () => void }) {
  const COLORS = ["#9b2335","#c43e54","#f59e0b","#22c55e","#38bdf8","#a78bfa","#ec4899","#6b7280","#ff3366"];
  const EMOJIS = ["👑","🛡","⭐","🔨","🎬","📋","🔧","💼","🏆","🎭","👥","🔑"];

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    emoji: initial?.emoji ?? "⭐",
    color: initial?.color ?? "#9b2335",
    description: initial?.description ?? "",
    permissions: initial?.permissions ?? [] as Permission[],
  });

  const valid = form.name.trim() && form.permissions.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(10,10,15,0.9)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-2xl border border-white/8 bg-[#0d0d15] my-8"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1.05rem" }}>
            {initial ? "Редактировать шаблон" : "Новый шаблон роли"}
          </h3>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className={lc} style={{ fontSize: "0.6rem" }}>Название *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Owner, Dep.Owner, Media..." className={ic} style={{ fontSize: "0.85rem" }} />
          </div>

          {/* Emoji + Color */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Эмодзи</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map((e) => (
                  <button key={e} type="button" onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                    className="w-8 h-8 text-base flex items-center justify-center border transition-all"
                    style={{ borderColor: form.emoji === e ? "rgba(155,35,53,0.4)" : "rgba(255,255,255,0.06)", background: form.emoji === e ? "rgba(155,35,53,0.1)" : "transparent" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Цвет</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className="w-8 h-8 rounded-sm border-2 transition-all"
                    style={{ background: c, borderColor: form.color === c ? "white" : "transparent", opacity: form.color === c ? 1 : 0.5 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={lc} style={{ fontSize: "0.6rem" }}>Описание</label>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Краткое описание роли..." className={ic} style={{ fontSize: "0.8rem" }} />
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={lc} style={{ fontSize: "0.6rem", marginBottom: 0 }}>Права доступа * ({form.permissions.length}/{ALL_PERMISSIONS.length})</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm((f) => ({ ...f, permissions: [...ALL_PERMISSIONS] }))}
                  className="font-['Oswald'] text-white/20 hover:text-white/40 uppercase tracking-wider transition-colors" style={{ fontSize: "0.55rem" }}>
                  Все
                </button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, permissions: [] }))}
                  className="font-['Oswald'] text-white/20 hover:text-white/40 uppercase tracking-wider transition-colors" style={{ fontSize: "0.55rem" }}>
                  Сбросить
                </button>
              </div>
            </div>
            <PermissionPicker value={form.permissions} onChange={(p) => setForm((f) => ({ ...f, permissions: p }))} />
          </div>

          {/* Preview badge */}
          <div className="border border-white/5 p-4">
            <p className={lc} style={{ fontSize: "0.6rem" }}>Предпросмотр</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5"
              style={{ background: `${form.color}10`, border: `1px solid ${form.color}25` }}>
              <span className="text-base">{form.emoji}</span>
              <span className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.82rem", color: form.color }}>{form.name || "Название роли"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/8 text-white/30 font-['Oswald'] uppercase tracking-wider hover:text-white/50 transition-colors" style={{ fontSize: "0.68rem" }}>
            Отмена
          </button>
          <button
            onClick={() => valid && onSave({ ...form, id: initial?.id ?? "", isSystem: initial?.isSystem ?? false, createdAt: initial?.createdAt ?? new Date().toISOString() })}
            disabled={!valid}
            className="flex-1 py-2.5 flex items-center justify-center gap-2 font-['Oswald'] uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontSize: "0.68rem", background: valid ? "rgba(155,35,53,0.12)" : "transparent", border: `1px solid ${valid ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.05)"}`, color: valid ? "#9b2335" : "rgba(255,255,255,0.2)" }}>
            <Save size={13} />
            {initial ? "Сохранить" : "Создать шаблон"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   MAIN TAB
   ════════════════════════════════════════════════ */

export function RoleTemplatesTab() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useRoleTemplates();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleTemplate | null>(null);
  const [applyTarget, setApplyTarget] = useState<RoleTemplate | null>(null);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (t: RoleTemplate) => { setEditTarget(t); setModalOpen(true); };

  const handleSave = (data: RoleTemplate) => {
    if (editTarget) {
      updateTemplate(editTarget.id, data);
    } else {
      addTemplate(data);
    }
    setModalOpen(false);
  };

  const systemTemplates = templates.filter((t) => t.isSystem);
  const customTemplates = templates.filter((t) => !t.isSystem);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.4rem" }}>Шаблоны ролей</h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Пресеты прав доступа — применяй одним кликом к любому сотруднику
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 border transition-all"
          style={{ borderColor: "rgba(155,35,53,0.3)", background: "rgba(155,35,53,0.06)", color: "#9b2335" }}>
          <Plus size={14} />
          <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>Новый шаблон</span>
        </button>
      </div>

      {/* Quick reference */}
      <div className="border border-white/5 bg-white/[0.01] p-4 mb-6">
        <p className="font-['Oswald'] text-white/30 uppercase tracking-wider mb-3" style={{ fontSize: "0.62rem" }}>Быстрый обзор прав</p>
        <div className="flex flex-wrap gap-2">
          {PERM_GROUPS.map((group) => {
            const perms = ALL_PERMISSIONS.filter((p) => PERMISSION_META[p].group === group);
            return (
              <div key={group} className="border border-white/[0.05] px-3 py-2">
                <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-1.5" style={{ fontSize: "0.5rem" }}>{group}</p>
                <div className="space-y-0.5">
                  {perms.map((p) => (
                    <p key={p} className="font-['Oswald'] text-white/35 tracking-wide" style={{ fontSize: "0.62rem" }}>
                      · {PERMISSION_META[p].label}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System templates */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Lock size={12} className="text-[#9b2335]/40" />
          <span className="font-['Oswald'] text-white/30 uppercase tracking-wider" style={{ fontSize: "0.62rem" }}>Системные ({systemTemplates.length})</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="space-y-2">
          {systemTemplates.map((t) => (
            <TemplateCard key={t.id} template={t}
              onEdit={() => openEdit(t)} onDelete={() => {}} onDuplicate={() => duplicateTemplate(t.id)}
              onApplyToStaff={() => setApplyTarget(t)} />
          ))}
        </div>
      </div>

      {/* Custom templates */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Unlock size={12} className="text-white/20" />
          <span className="font-['Oswald'] text-white/30 uppercase tracking-wider" style={{ fontSize: "0.62rem" }}>Пользовательские ({customTemplates.length})</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        {customTemplates.length === 0 ? (
          <div className="border border-dashed border-white/[0.06] p-8 text-center">
            <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.78rem" }}>
              Нет пользовательских шаблонов
            </p>
            <button onClick={openAdd} className="mt-3 font-['Oswald'] text-[#9b2335]/40 hover:text-[#9b2335]/60 uppercase tracking-wider transition-colors" style={{ fontSize: "0.65rem" }}>
              + Создать первый
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {customTemplates.map((t) => (
              <TemplateCard key={t.id} template={t}
                onEdit={() => openEdit(t)} onDelete={() => deleteTemplate(t.id)} onDuplicate={() => duplicateTemplate(t.id)}
                onApplyToStaff={() => setApplyTarget(t)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <TemplateModal initial={editTarget ?? undefined} onSave={handleSave} onClose={() => setModalOpen(false)} />
        )}
        {applyTarget && (
          <ApplyModal template={applyTarget} onClose={() => setApplyTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Target, Plus, Edit3, Trash2, Save, X, Star, CheckCircle2,
  Pin, PinOff, Eye, EyeOff, BarChart3, Clock, ChevronRight,
  Flag, TrendingUp,
} from "lucide-react";
import {
  useFamilyGoals, GOAL_CATEGORIES, GOAL_STATUS_META, GOAL_PRIORITY_META,
  type FamilyGoal, type GoalCategory, type GoalStatus,
} from "../../hooks/useFamilyGoals";

/* ─── ui helpers ─── */
const ic = "w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/40 text-white/80 px-3 py-2.5 outline-none transition-colors font-['Oswald'] tracking-wide";
const lc = "block font-['Oswald'] text-white/25 uppercase tracking-wider mb-1.5";

/* ─── progress bar ─── */
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 bg-white/5 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full" style={{ background: color }} />
    </div>
  );
}

/* ─── Category badge ─── */
function CatBadge({ category }: { category: GoalCategory }) {
  const cat = GOAL_CATEGORIES.find((c) => c.id === category);
  if (!cat) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{ fontSize: "0.48rem", color: cat.color, background: `${cat.color}10`, border: `1px solid ${cat.color}20` }}>
      {cat.emoji} {cat.label}
    </span>
  );
}

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: GoalStatus }) {
  const meta = GOAL_STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{ fontSize: "0.48rem", color: meta.color, background: `${meta.color}10`, border: `1px solid ${meta.color}20` }}>
      {meta.icon} {meta.label}
    </span>
  );
}

/* ─── Form ─── */
interface GoalForm {
  title: string; description: string; category: GoalCategory;
  status: GoalStatus; priority: FamilyGoal["priority"]; progress: number;
  targetValue: string; currentValue: string; deadline: string;
  emoji: string; pinned: boolean; public: boolean;
}

const EMOJIS = ["🏆","💰","👥","🗺","🤝","🎭","🔧","📌","⚡","🎯","🏭","📋","💼","🔑","🌟"];

function GoalModal({ initial, onSave, onClose, staffName }: {
  initial?: FamilyGoal; onSave: (f: GoalForm) => void; onClose: () => void; staffName?: string;
}) {
  const [form, setForm] = useState<GoalForm>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "other",
    status: initial?.status ?? "active",
    priority: initial?.priority ?? "normal",
    progress: initial?.progress ?? 0,
    targetValue: initial?.targetValue ?? "",
    currentValue: initial?.currentValue ?? "",
    deadline: initial?.deadline ?? "",
    emoji: initial?.emoji ?? "🎯",
    pinned: initial?.pinned ?? false,
    public: initial?.public ?? true,
  });

  const set = <K extends keyof GoalForm>(k: K, v: GoalForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.title.trim();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(10,10,15,0.9)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-lg border border-white/8 bg-[#0d0d15] my-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>
            {initial ? "Редактировать цель" : "Новая цель семьи"}
          </h3>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Emoji picker */}
          <div>
            <label className={lc} style={{ fontSize: "0.6rem" }}>Эмодзи</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => set("emoji", e)}
                  className="w-8 h-8 text-base flex items-center justify-center border transition-all"
                  style={{ borderColor: form.emoji === e ? "rgba(155,35,53,0.4)" : "rgba(255,255,255,0.06)", background: form.emoji === e ? "rgba(155,35,53,0.1)" : "transparent" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={lc} style={{ fontSize: "0.6rem" }}>Название цели *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Что нужно достичь?" className={ic} style={{ fontSize: "0.85rem" }} />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Категория</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value as GoalCategory)}
                className={ic} style={{ fontSize: "0.8rem", colorScheme: "dark" }}>
                {GOAL_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Приоритет</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value as FamilyGoal["priority"])}
                className={ic} style={{ fontSize: "0.8rem", colorScheme: "dark" }}>
                {(["low","normal","high","critical"] as const).map((p) => (
                  <option key={p} value={p}>{GOAL_PRIORITY_META[p].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={lc} style={{ fontSize: "0.6rem" }}>Статус</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["active","planned","paused","completed"] as GoalStatus[]).map((s) => {
                const meta = GOAL_STATUS_META[s];
                return (
                  <button key={s} type="button" onClick={() => set("status", s)}
                    className="px-3 py-2 border font-['Oswald'] uppercase tracking-wider transition-all text-left"
                    style={{ fontSize: "0.6rem", color: form.status === s ? meta.color : "rgba(255,255,255,0.25)", borderColor: form.status === s ? `${meta.color}30` : "rgba(255,255,255,0.06)", background: form.status === s ? `${meta.color}08` : "transparent" }}>
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={lc} style={{ fontSize: "0.6rem", marginBottom: 0 }}>Прогресс</label>
              <span className="font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.72rem" }}>{form.progress}%</span>
            </div>
            <input type="range" min={0} max={100} value={form.progress} onChange={(e) => set("progress", Number(e.target.value))}
              className="w-full" style={{ accentColor: "#9b2335" }} />
            <ProgressBar value={form.progress} color="#9b2335" />
          </div>

          {/* Target / current value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Цель</label>
              <input value={form.targetValue} onChange={(e) => set("targetValue", e.target.value)}
                placeholder="200 контрактов" className={ic} style={{ fontSize: "0.8rem" }} />
            </div>
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Текущий результат</label>
              <input value={form.currentValue} onChange={(e) => set("currentValue", e.target.value)}
                placeholder="82 контракта" className={ic} style={{ fontSize: "0.8rem" }} />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className={lc} style={{ fontSize: "0.6rem" }}>Дедлайн (необязательно)</label>
            <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)}
              className={ic} style={{ fontSize: "0.8rem", colorScheme: "dark" }} />
          </div>

          {/* Description */}
          <div>
            <label className={lc} style={{ fontSize: "0.6rem" }}>Описание</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Подробности..." rows={2}
              className="w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/30 text-white/70 font-['Oswald'] tracking-wide px-3 py-2.5 outline-none resize-none"
              style={{ fontSize: "0.78rem" }} />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => set("pinned", !form.pinned)}
              className="flex items-center gap-2 transition-colors">
              {form.pinned ? <Pin size={14} className="text-[#f59e0b]" /> : <PinOff size={14} className="text-white/20" />}
              <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.6rem", color: form.pinned ? "#f59e0b" : "rgba(255,255,255,0.2)" }}>Закреп</span>
            </button>
            <button type="button" onClick={() => set("public", !form.public)}
              className="flex items-center gap-2 transition-colors">
              {form.public ? <Eye size={14} className="text-[#9b2335]/60" /> : <EyeOff size={14} className="text-white/20" />}
              <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.6rem", color: form.public ? "rgba(155,35,53,0.6)" : "rgba(255,255,255,0.2)" }}>
                {form.public ? "Публично" : "Только в ЛК"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/8 text-white/30 font-['Oswald'] uppercase tracking-wider hover:text-white/50 transition-colors" style={{ fontSize: "0.68rem" }}>
            Отмена
          </button>
          <button onClick={() => valid && onSave(form)} disabled={!valid}
            className="flex-1 py-2.5 flex items-center justify-center gap-2 font-['Oswald'] uppercase tracking-wider transition-all disabled:opacity-30"
            style={{ fontSize: "0.68rem", background: "rgba(155,35,53,0.12)", border: "1px solid rgba(155,35,53,0.3)", color: "#9b2335" }}>
            <Save size={13} />{initial ? "Сохранить" : "Добавить цель"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Goal row ─── */
function GoalRow({ goal, onEdit, onDelete, onComplete, onTogglePin }: {
  goal: FamilyGoal; onEdit: () => void; onDelete: () => void; onComplete: () => void; onTogglePin: () => void;
}) {
  const catMeta = GOAL_CATEGORIES.find((c) => c.id === goal.category);
  const prMeta = GOAL_PRIORITY_META[goal.priority];
  const isCompleted = goal.status === "completed";

  const daysLeft = goal.deadline
    ? Math.max(0, Math.round((new Date(goal.deadline).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      className={`border border-white/[0.05] ${isCompleted ? "opacity-50" : "hover:border-white/[0.09]"} transition-all duration-200 group`}>
      {/* Priority line */}
      <div className="h-0.5" style={{ background: `linear-gradient(to right, ${prMeta.color}, transparent)` }} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Emoji */}
          <div className="w-9 h-9 flex items-center justify-center text-lg shrink-0 border border-white/[0.06]"
            style={{ background: `${catMeta?.color ?? "#9b2335"}08` }}>
            {goal.emoji}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-['Oswald'] text-white/75 tracking-wide" style={{ fontSize: "0.88rem" }}>{goal.title}</span>
              {goal.pinned && <Pin size={11} className="text-[#f59e0b]/60 shrink-0" />}
              {!goal.public && <EyeOff size={11} className="text-white/20 shrink-0" />}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <StatusBadge status={goal.status} />
              <CatBadge category={goal.category} />
              <span className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
                style={{ fontSize: "0.48rem", color: prMeta.color, background: `${prMeta.color}10`, border: `1px solid ${prMeta.color}20` }}>
                {prMeta.label}
              </span>
              {daysLeft !== null && (
                <span className="flex items-center gap-0.5 font-['Oswald'] text-white/25 tracking-wide"
                  style={{ fontSize: "0.52rem" }}>
                  <Clock size={8} />{daysLeft === 0 ? "сегодня!" : `${daysLeft} дн.`}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar value={goal.progress} color={catMeta?.color ?? "#9b2335"} />
              </div>
              <span className="font-['Oswald'] text-white/30 tracking-wide shrink-0" style={{ fontSize: "0.65rem" }}>
                {goal.progress}%
              </span>
              {goal.currentValue && goal.targetValue && (
                <span className="font-['Oswald'] text-white/20 tracking-wide shrink-0" style={{ fontSize: "0.58rem" }}>
                  {goal.currentValue} / {goal.targetValue}
                </span>
              )}
            </div>

            {goal.description && (
              <p className="font-['Oswald'] text-white/20 tracking-wide mt-1.5" style={{ fontSize: "0.65rem" }}>
                {goal.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onTogglePin} title={goal.pinned ? "Открепить" : "Закрепить"}
              className="p-1.5 transition-colors" style={{ color: goal.pinned ? "#f59e0b" : "rgba(255,255,255,0.15)" }}>
              {goal.pinned ? <Pin size={13} /> : <PinOff size={13} />}
            </button>
            {!isCompleted && (
              <button onClick={onComplete} title="Отметить выполненной"
                className="p-1.5 text-white/15 hover:text-green-500/60 transition-colors">
                <CheckCircle2 size={13} />
              </button>
            )}
            <button onClick={onEdit} className="p-1.5 text-white/15 hover:text-[#f59e0b]/60 transition-colors">
              <Edit3 size={13} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-white/15 hover:text-[#ff3366]/60 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   MAIN TAB
   ════════════════════════════════════════════════ */

type FilterTab = "all" | "active" | "planned" | "paused" | "completed";

interface Props { staffName?: string; }

export function FamilyGoalsTab({ staffName = "Admin" }: Props) {
  const { goals, addGoal, updateGoal, deleteGoal, completeGoal, togglePinned } = useFamilyGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FamilyGoal | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [catFilter, setCatFilter] = useState<GoalCategory | "all">("all");

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (g: FamilyGoal) => { setEditTarget(g); setModalOpen(true); };

  const handleSave = (form: { title: string; description: string; category: GoalCategory; status: GoalStatus; priority: FamilyGoal["priority"]; progress: number; targetValue: string; currentValue: string; deadline: string; emoji: string; pinned: boolean; public: boolean }) => {
    const data = {
      ...form,
      description: form.description || undefined,
      targetValue: form.targetValue || undefined,
      currentValue: form.currentValue || undefined,
      deadline: form.deadline || undefined,
      createdBy: staffName,
    };
    if (editTarget) updateGoal(editTarget.id, data);
    else addGoal(data);
    setModalOpen(false);
  };

  const filtered = goals.filter((g) => {
    if (filterTab !== "all" && g.status !== filterTab) return false;
    if (catFilter !== "all" && g.category !== catFilter) return false;
    return true;
  }).sort((a, b) => {
    // pinned first, then by priority
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const pOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    return pOrder[a.priority] - pOrder[b.priority];
  });

  const stats = {
    active: goals.filter((g) => g.status === "active").length,
    planned: goals.filter((g) => g.status === "planned").length,
    paused: goals.filter((g) => g.status === "paused").length,
    completed: goals.filter((g) => g.status === "completed").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.4rem" }}>Цели семьи</h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Ближайшие задачи · Видны участникам в Личном кабинете
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 border transition-all"
          style={{ borderColor: "rgba(155,35,53,0.3)", background: "rgba(155,35,53,0.06)", color: "#9b2335" }}>
          <Plus size={14} />
          <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>Новая цель</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "В работе",    value: stats.active,    color: "#9b2335" },
          { label: "Планируется", value: stats.planned,   color: "#38bdf8" },
          { label: "На паузе",    value: stats.paused,    color: "#f59e0b" },
          { label: "Выполнено",   value: stats.completed, color: "#22c55e" },
        ].map((s) => (
          <div key={s.label} className="border border-white/5 bg-white/[0.01] p-3 flex items-center gap-3">
            <span className="font-['Russo_One']" style={{ fontSize: "1.5rem", color: s.color }}>{s.value}</span>
            <span className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-0 border-b border-white/5 mb-4">
        {([
          { id: "all", label: `Все (${goals.length})` },
          { id: "active", label: `В работе (${stats.active})` },
          { id: "planned", label: `Планы (${stats.planned})` },
          { id: "paused", label: `Пауза (${stats.paused})` },
          { id: "completed", label: `Готово (${stats.completed})` },
        ] as { id: FilterTab; label: string }[]).map((tab) => (
          <button key={tab.id} onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2.5 border-b-2 font-['Oswald'] uppercase tracking-wider transition-all duration-200 ${filterTab === tab.id ? "border-[#9b2335] text-[#9b2335]" : "border-transparent text-white/20 hover:text-white/40"}`}
            style={{ fontSize: "0.62rem", marginBottom: "-1px" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        <button onClick={() => setCatFilter("all")}
          className="px-2.5 py-1 font-['Oswald'] uppercase tracking-wider border transition-all"
          style={{ fontSize: "0.58rem", color: catFilter === "all" ? "#9b2335" : "rgba(255,255,255,0.2)", borderColor: catFilter === "all" ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)", background: catFilter === "all" ? "rgba(155,35,53,0.05)" : "transparent" }}>
          Все
        </button>
        {GOAL_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCatFilter(c.id)}
            className="px-2.5 py-1 font-['Oswald'] uppercase tracking-wider border transition-all"
            style={{ fontSize: "0.58rem", color: catFilter === c.id ? c.color : "rgba(255,255,255,0.2)", borderColor: catFilter === c.id ? `${c.color}30` : "rgba(255,255,255,0.06)", background: catFilter === c.id ? `${c.color}06` : "transparent" }}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="border border-white/5 py-16 text-center">
          <Target size={32} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.8rem" }}>Нет целей</p>
          <button onClick={openAdd} className="mt-4 font-['Oswald'] text-[#9b2335]/40 hover:text-[#9b2335]/60 uppercase tracking-wider transition-colors" style={{ fontSize: "0.65rem" }}>
            + Добавить первую
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((g) => (
            <GoalRow key={g.id} goal={g}
              onEdit={() => openEdit(g)}
              onDelete={() => deleteGoal(g.id)}
              onComplete={() => completeGoal(g.id)}
              onTogglePin={() => togglePinned(g.id)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <GoalModal initial={editTarget ?? undefined} onSave={handleSave} onClose={() => setModalOpen(false)} staffName={staffName} />
        )}
      </AnimatePresence>
    </div>
  );
}
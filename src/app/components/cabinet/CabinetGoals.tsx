import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Target, Pin, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useFamilyGoals, GOAL_CATEGORIES, GOAL_STATUS_META, GOAL_PRIORITY_META, type FamilyGoal } from "../../hooks/useFamilyGoals";

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 bg-white/5 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full" style={{ background: color }} />
    </div>
  );
}

function GoalCard({ goal }: { goal: FamilyGoal }) {
  const [expanded, setExpanded] = useState(false);
  const catMeta = GOAL_CATEGORIES.find((c) => c.id === goal.category);
  const statusMeta = GOAL_STATUS_META[goal.status];
  const priorityMeta = GOAL_PRIORITY_META[goal.priority];

  const daysLeft = goal.deadline
    ? Math.max(0, Math.round((new Date(goal.deadline).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`border transition-all duration-200 ${goal.status === "completed" ? "opacity-50" : "border-white/[0.06] hover:border-white/[0.1]"}`}
      style={{ borderColor: goal.pinned ? `${catMeta?.color ?? "#9b2335"}20` : undefined }}>
      {goal.priority !== "low" && (
        <div className="h-0.5" style={{ background: `linear-gradient(to right, ${priorityMeta.color}, transparent)` }} />
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 shrink-0 flex items-center justify-center text-lg border border-white/[0.06]"
            style={{ background: `${catMeta?.color ?? "#9b2335"}06` }}>
            {goal.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-['Oswald'] text-white/70 tracking-wide" style={{ fontSize: "0.88rem" }}>{goal.title}</span>
              {goal.pinned && <Pin size={10} className="text-[#f59e0b]/50 shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
                style={{ fontSize: "0.48rem", color: statusMeta.color, background: `${statusMeta.color}10`, border: `1px solid ${statusMeta.color}20` }}>
                {statusMeta.icon} {statusMeta.label}
              </span>
              {catMeta && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
                  style={{ fontSize: "0.48rem", color: catMeta.color, background: `${catMeta.color}10`, border: `1px solid ${catMeta.color}20` }}>
                  {catMeta.emoji} {catMeta.label}
                </span>
              )}
              {daysLeft !== null && goal.status !== "completed" && (
                <span className="flex items-center gap-0.5 font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.5rem" }}>
                  <Clock size={8} />{daysLeft === 0 ? "сегодня!" : `${daysLeft} дн.`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar value={goal.progress} color={catMeta?.color ?? "#9b2335"} />
              </div>
              <span className="font-['Oswald'] text-white/30 tracking-wide shrink-0" style={{ fontSize: "0.65rem" }}>{goal.progress}%</span>
              {goal.currentValue && goal.targetValue && (
                <span className="font-['Oswald'] text-white/15 tracking-wide shrink-0" style={{ fontSize: "0.58rem" }}>
                  {goal.currentValue} / {goal.targetValue}
                </span>
              )}
            </div>
          </div>
          {goal.description && (
            <button onClick={() => setExpanded((v) => !v)}
              className="p-1.5 text-white/15 hover:text-white/40 transition-colors border border-white/[0.05] shrink-0">
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {expanded && goal.description && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <p className="font-['Oswald'] text-white/30 tracking-wide mt-3 pt-3 border-t border-white/[0.04]"
                style={{ fontSize: "0.72rem", lineHeight: 1.7 }}>{goal.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function CabinetGoals() {
  const { goals, pinnedGoals, activeGoals } = useFamilyGoals();
  const [showAll, setShowAll] = useState(false);

  const displayGoals = showAll
    ? goals
    : goals.filter((g) => g.status !== "completed").slice(0, 8);

  const completedCount = goals.filter((g) => g.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center border border-[#9b2335]/20 bg-[#9b2335]/06">
          <Target size={15} className="text-[#9b2335]/60" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1.05rem" }}>Цели семьи</h3>
          <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
            {activeGoals.length} в работе · {pinnedGoals.length} закреплено · {completedCount} выполнено
          </p>
        </div>
      </div>

      {/* Pinned */}
      {pinnedGoals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin size={10} className="text-[#f59e0b]/40" />
            <span className="font-['Oswald'] text-white/20 uppercase tracking-widest" style={{ fontSize: "0.52rem" }}>Ближайшие</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="space-y-2">
            {pinnedGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Rest */}
      {displayGoals.filter((g) => !g.pinned).length > 0 && (
        <div>
          {pinnedGoals.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="font-['Oswald'] text-white/20 uppercase tracking-widest" style={{ fontSize: "0.52rem" }}>Все цели</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          )}
          <div className="space-y-2">
            {displayGoals.filter((g) => !g.pinned).map((g) => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="border border-white/[0.04] py-12 text-center">
          <Target size={28} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.78rem" }}>Нет активных целей</p>
        </div>
      )}

      {(completedCount > 0 || goals.length > 8) && (
        <button onClick={() => setShowAll((v) => !v)}
          className="w-full py-2.5 border border-white/[0.06] font-['Oswald'] text-white/25 hover:text-white/45 uppercase tracking-wider transition-all hover:border-white/[0.1]"
          style={{ fontSize: "0.65rem" }}>
          {showAll ? "Скрыть выполненные" : `Показать всё (${goals.length} целей)`}
        </button>
      )}
    </div>
  );
}

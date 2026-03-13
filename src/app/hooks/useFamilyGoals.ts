import { useState, useCallback, useEffect } from "react";
import { listGoals, putGoals } from "../api/endpoints";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export type GoalStatus = "active" | "completed" | "paused" | "planned";
export type GoalCategory =
  | "leadership" | "economy" | "recruitment" | "territory"
  | "social" | "event" | "internal" | "other";

export interface FamilyGoal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  priority: "low" | "normal" | "high" | "critical";
  progress: number;
  targetValue?: string;
  currentValue?: string;
  deadline?: string;
  emoji: string;
  pinned: boolean;
  public: boolean;
  createdAt: string;
  completedAt?: string;
  createdBy?: string;
}

export const GOAL_CATEGORIES: { id: GoalCategory; label: string; color: string; emoji: string }[] = [
  { id: "leadership",  label: "Лидерка",       color: "#9b2335", emoji: "🏆" },
  { id: "economy",     label: "Экономика",      color: "#22c55e", emoji: "💰" },
  { id: "recruitment", label: "Набор",          color: "#38bdf8", emoji: "👥" },
  { id: "territory",   label: "Территория",     color: "#f59e0b", emoji: "🗺" },
  { id: "social",      label: "Соцактивность",  color: "#a78bfa", emoji: "🤝" },
  { id: "event",       label: "Мероприятие",    color: "#ec4899", emoji: "🎭" },
  { id: "internal",    label: "Внутреннее",     color: "#6b7280", emoji: "🔧" },
  { id: "other",       label: "Другое",         color: "#64748b", emoji: "📌" },
];

export const GOAL_STATUS_META: Record<GoalStatus, { label: string; color: string; icon: string }> = {
  active:    { label: "В работе",    color: "#9b2335", icon: "⚡" },
  completed: { label: "Выполнено",   color: "#22c55e", icon: "✅" },
  paused:    { label: "Пауза",       color: "#f59e0b", icon: "⏸" },
  planned:   { label: "Планируется", color: "#38bdf8", icon: "📋" },
};

export const GOAL_PRIORITY_META: Record<FamilyGoal["priority"], { label: string; color: string }> = {
  low:      { label: "Низкий",    color: "#6b7280" },
  normal:   { label: "Обычный",   color: "#9b2335" },
  high:     { label: "Высокий",   color: "#f59e0b" },
  critical: { label: "Срочно",    color: "#ff3366" },
};

/* ─── default goals ─── */
const DEFAULT_GOALS: FamilyGoal[] = [
  {
    id: "g1",
    title: "Получить лидерку на Seattle",
    description: "Взять FIB или LSPD на сервере Seattle в 2026 году",
    category: "leadership",
    status: "active",
    priority: "critical",
    progress: 65,
    targetValue: "Одна лидерка",
    currentValue: "Идут переговоры",
    emoji: "🏆",
    pinned: true,
    public: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "Madara Schwarz",
  },
  {
    id: "g2",
    title: "Закрыть 200 контрактов за месяц",
    description: "Достичь общего показателя 200 закрытых контрактов всеми участниками",
    category: "economy",
    status: "active",
    priority: "high",
    progress: 40,
    targetValue: "200 контрактов",
    currentValue: "82 контракта",
    emoji: "💼",
    pinned: true,
    public: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    createdBy: "Akihiro Schwarz",
  },
  {
    id: "g3",
    title: "Открыть семейный склад",
    description: "Арендовать и обустроить склад под нужды семьи",
    category: "territory",
    status: "planned",
    priority: "normal",
    progress: 10,
    emoji: "🏭",
    pinned: false,
    public: true,
    createdAt: "2026-02-15T00:00:00.000Z",
    createdBy: "Roman Schwarz",
  },
  {
    id: "g4",
    title: "Набрать 5 новых участников",
    description: "Провести волну набора — принять 5 адекватных игроков",
    category: "recruitment",
    status: "active",
    priority: "normal",
    progress: 60,
    targetValue: "5 участников",
    currentValue: "3 принято",
    emoji: "👥",
    pinned: false,
    public: true,
    createdAt: "2026-02-20T00:00:00.000Z",
    createdBy: "Madara Schwarz",
  },
];

/* ─── storage ─── */
const KEY = "schwarz_family_goals";

function loadGoals(): FamilyGoal[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : DEFAULT_GOALS;
  } catch { return DEFAULT_GOALS; }
}

function saveGoals(goals: FamilyGoal[]) {
  localStorage.setItem(KEY, JSON.stringify(goals));
}

function genId() {
  return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ─── public loader ─── */
export function loadPublicGoals(): FamilyGoal[] {
  return loadGoals().filter((g) => g.public);
}

/* ═══════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════ */

export function useFamilyGoals() {
  const [goals, setGoalsState] = useState<FamilyGoal[]>(() => loadGoals());

  // Sync from API on mount
  useEffect(() => {
    listGoals<FamilyGoal>()
      .then((data) => { if (Array.isArray(data) && data.length > 0) { setGoalsState(data); saveGoals(data); } })
      .catch(() => {});
  }, []);

  const persist = useCallback((g: FamilyGoal[]) => {
    setGoalsState(g);
    saveGoals(g);
    putGoals(g).catch(() => {});
  }, []);

  const addGoal = (data: Omit<FamilyGoal, "id" | "createdAt">) => {
    const goal: FamilyGoal = { ...data, id: genId(), createdAt: new Date().toISOString() };
    persist([goal, ...goals]);
    return goal;
  };

  const updateGoal = (id: string, changes: Partial<FamilyGoal>) => {
    persist(goals.map((g) => g.id === id ? { ...g, ...changes } : g));
  };

  const deleteGoal = (id: string) => persist(goals.filter((g) => g.id !== id));

  const completeGoal = (id: string) => {
    persist(goals.map((g) => g.id === id ? { ...g, status: "completed", progress: 100, completedAt: new Date().toISOString() } : g));
  };

  const togglePinned = (id: string) => {
    persist(goals.map((g) => g.id === id ? { ...g, pinned: !g.pinned } : g));
  };

  const pinnedGoals = goals.filter((g) => g.pinned && g.status !== "completed");
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return {
    goals, pinnedGoals, activeGoals, completedGoals,
    addGoal, updateGoal, deleteGoal, completeGoal, togglePinned,
  };
}

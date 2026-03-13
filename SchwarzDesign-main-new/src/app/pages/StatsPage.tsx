import { useMemo } from "react";
import { motion } from "motion/react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import {
  Users, Crown, CheckCircle2, Target, TrendingUp, Award, Star,
  Calendar, Shield, Zap, Activity,
} from "lucide-react";
import { getTreasurySnapshot, formatMoney } from "../hooks/useTreasury";

/* ──────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */

interface Member {
  id: string; name: string; role: string; joinDate: string; active: boolean; badges?: string[];
}
interface Leadership {
  id: string; faction: string; server: string; leader: string;
  startDate: string; endDate: string; status: string; color: string;
}
interface Contract { id: string; status: string; type: string; closedBy?: string[]; completedAt?: string; }
interface Goal { id: string; title: string; status: string; progress: number; category: string; }

/* ──────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────── */

const ROLE_COLORS: Record<string, string> = {
  owner: "#9b2335", dep_owner: "#7a1c2a", close: "#c43e54",
  old: "#b8860b", main: "#ff3366", academy: "#888899",
};
const ROLE_LABELS: Record<string, string> = {
  owner: "Owner", dep_owner: "Dep.Owner", close: "Close",
  old: "Old", main: "Main", academy: "Academy",
};
const ROLES_ORDER = ["owner", "dep_owner", "close", "old", "main", "academy"];

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  fishing: "Рыбалка", delivery: "Доставка", security: "Охрана",
  mining: "Шахта", other: "Прочее",
};

/* ──────────────────────────────────────────────
   DATA LOADERS
────────────────────────────────────────────── */

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`schwarz_admin_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function loadGlobal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`schwarz_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

/* ──────────────────────────────────────────────
   CARD
────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: typeof Users;
  color: string; sub?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.06] bg-[#13131c] p-5 flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center shrink-0"
        style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
        <Icon size={16} strokeWidth={1.5} style={{ color }} />
      </div>
      <div>
        <div className="font-['Russo_One']" style={{ fontSize: "1.5rem", color, filter: `drop-shadow(0 0 8px ${color}40)` }}>
          {value}
        </div>
        <div className="font-['Oswald'] text-white/25 uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>{label}</div>
        {sub && <div className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.5rem" }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   SECTION HEADING
────────────────────────────────────────────── */

function Section({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-px h-6 bg-[#9b2335]/50" />
      <div>
        <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>{title}</h2>
        {sub && <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.62rem" }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────── */

export function StatsPage({ embedded = false }: { embedded?: boolean }) {
  const members     = useMemo<Member[]>(() => load("members", []), []);
  const leaderships = useMemo<Leadership[]>(() => load("leaderships", []), []);
  const contracts   = useMemo<Contract[]>(() => loadGlobal("contracts", []), []);
  const goals       = useMemo<Goal[]>(() => loadGlobal("family_goals", []), []);
  const treasury    = useMemo(() => getTreasurySnapshot(), []);

  /* Derived stats */
  const activeMembers     = members.filter((m) => m.active).length;
  const activeLeaderships = leaderships.filter((l) => l.status === "active").length;
  const completedLeaderships = leaderships.filter((l) => l.status === "completed").length;
  const completedContracts   = contracts.filter((c) => c.status === "completed").length;
  const activeGoals          = goals.filter((g) => g.status === "active").length;
  const avgGoalProgress      = goals.filter((g) => g.status === "active").length > 0
    ? Math.round(goals.filter((g) => g.status === "active").reduce((s, g) => s + g.progress, 0) / goals.filter((g) => g.status === "active").length)
    : 0;

  /* Pie: members by role */
  const memberPie = ROLES_ORDER
    .map((role) => ({ name: ROLE_LABELS[role] ?? role, value: members.filter((m) => m.active && m.role === role).length, color: ROLE_COLORS[role] ?? "#888" }))
    .filter((d) => d.value > 0);

  /* Bar: contracts by type */
  const contractByType = useMemo(() => {
    const map: Record<string, number> = {};
    contracts.filter((c) => c.status === "completed").forEach((c) => {
      map[c.type] = (map[c.type] ?? 0) + 1;
    });
    return Object.entries(map).map(([type, val]) => ({ name: CONTRACT_TYPE_LABELS[type] ?? type, value: val })).sort((a, b) => b.value - a.value);
  }, [contracts]);

  /* Line: leaderships timeline (by year) */
  const leadershipsByYear = useMemo(() => {
    const map: Record<string, number> = {};
    leaderships.forEach((l) => {
      if (l.startDate) {
        const yr = new Date(l.startDate).getFullYear().toString();
        map[yr] = (map[yr] ?? 0) + 1;
      }
    });
    return Object.entries(map).sort().map(([yr, cnt]) => ({ year: yr, count: cnt }));
  }, [leaderships]);

  /* Top members by closed contracts */
  const topMembers = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    contracts.filter((c) => c.status === "completed").forEach((c) => {
      (c.closedBy ?? []).forEach((mid) => {
        const m = members.find((x) => x.id === mid);
        if (!m) return;
        if (!map[mid]) map[mid] = { name: m.name, count: 0 };
        map[mid].count++;
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [contracts, members]);

  /* Badge stats */
  const badgeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => (m.badges ?? []).forEach((b) => { map[b] = (map[b] ?? 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [members]);

  /* Days since first member */
  const daysSinceStart = useMemo(() => {
    const dates = members.map((m) => new Date(m.joinDate)).filter((d) => !isNaN(d.getTime()));
    if (dates.length === 0) return 0;
    const oldest = Math.min(...dates.map((d) => d.getTime()));
    return Math.floor((Date.now() - oldest) / 86400000);
  }, [members]);

  const inner = (
    <div style={{ fontFamily: "'Oswald',sans-serif" }}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={13} className="text-[#9b2335]/50" strokeWidth={1.5} />
          <span className="font-['Oswald'] text-white/20 uppercase tracking-[0.3em]" style={{ fontSize: "0.6rem" }}>
            Schwarz Family · Majestic RP
          </span>
        </div>
        <h1 className="font-['Russo_One'] text-white" style={{ fontSize: "2.2rem", letterSpacing: "-0.01em" }}>
          Статистика <span style={{ color: "#9b2335" }}>семьи</span>
        </h1>
        <p className="font-['Oswald'] text-white/25 tracking-wide mt-2" style={{ fontSize: "0.78rem" }}>
          Актуальные данные на {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </motion.div>

      {/* ── Overview Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
        <StatCard label="Участников"        value={activeMembers}      icon={Users}        color="#9b2335" />
        <StatCard label="Лидерок всего"     value={leaderships.length} icon={Crown}        color="#f59e0b" sub={`${activeLeaderships} активных`} />
        <StatCard label="Контрактов закрыто"value={completedContracts} icon={CheckCircle2} color="#22c55e" />
        <StatCard label="Целей в работе"    value={activeGoals}        icon={Target}       color="#38bdf8" sub={avgGoalProgress > 0 ? `ср. прогресс ${avgGoalProgress}%` : undefined} />
        <StatCard label="Дней существования" value={daysSinceStart}    icon={Calendar}     color="#a78bfa" />
        <StatCard label="Баланс казны"      value={formatMoney(treasury.balance)} icon={TrendingUp} color={treasury.balance >= 0 ? "#22c55e" : "#ef4444"} />
        <StatCard label="Завершённых лидерок" value={completedLeaderships} icon={Award}    color="#c43e54" />
        <StatCard label="Среди состава"     value={`${memberPie.length} ранга`}  icon={Shield}   color="#888899" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

        {/* Members by role pie */}
        <div className="border border-white/[0.06] bg-[#13131c] p-6">
          <Section title="Состав по рангам" />
          {memberPie.length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-10" style={{ fontSize: "0.78rem" }}>Нет данных</p>
          ) : (
            <div className="flex items-center gap-6">
              <div style={{ width: 150, height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={memberPie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                      {memberPie.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
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
              <div className="flex-1 space-y-2.5">
                {memberPie.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.7rem" }}>{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 rounded-full" style={{ width: `${Math.max(8, (d.value / activeMembers) * 60)}px`, background: d.color, opacity: 0.5 }} />
                      <span className="font-['Russo_One']" style={{ fontSize: "0.9rem", color: d.color }}>{d.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contracts by type */}
        <div className="border border-white/[0.06] bg-[#13131c] p-6">
          <Section title="Контракты по типам" sub="Только завершённые" />
          {contractByType.length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-10" style={{ fontSize: "0.78rem" }}>Нет данных</p>
          ) : (
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contractByType} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "Oswald" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "Oswald" }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip
                    contentStyle={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, fontFamily: "Oswald" }}
                    itemStyle={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  />
                  <Bar dataKey="value" fill="#9b2335" fillOpacity={0.75} radius={[0, 2, 2, 0]} name="Контрактов" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

        {/* Leadership timeline */}
        <div className="border border-white/[0.06] bg-[#13131c] p-6">
          <Section title="Лидерки по годам" />
          {leadershipsByYear.length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-10" style={{ fontSize: "0.78rem" }}>Нет данных</p>
          ) : (
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadershipsByYear} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "Oswald" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9, fontFamily: "Oswald" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, fontFamily: "Oswald" }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}
                    itemStyle={{ fontSize: "0.7rem" }}
                    cursor={{ stroke: "rgba(155,35,53,0.2)" }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#9b2335" strokeWidth={2} dot={{ fill: "#9b2335", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#9b2335" }} name="Лидерок" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Leadership cards mini */}
          <div className="mt-4 space-y-1.5">
            {leaderships.filter((l) => l.status === "active").map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-2 border border-white/[0.04] bg-white/[0.01]">
                <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: l.color }} />
                <span className="font-['Oswald'] text-white/50 tracking-wide flex-1" style={{ fontSize: "0.78rem" }}>{l.faction}</span>
                <span className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>{l.server}</span>
                <span className="px-2 py-px font-['Oswald'] uppercase tracking-wider border border-[#22c55e]/20 text-[#22c55e]/60" style={{ fontSize: "0.46rem" }}>
                  Активна
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top members */}
        <div className="border border-white/[0.06] bg-[#13131c] p-6">
          <Section title="Топ по контрактам" sub="Закрытых контрактов" />
          {topMembers.length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-10" style={{ fontSize: "0.78rem" }}>Нет данных</p>
          ) : (
            <div className="space-y-2.5">
              {topMembers.map((m, i) => {
                const maxCount = topMembers[0]?.count ?? 1;
                const pct = Math.max(8, Math.round((m.count / maxCount) * 100));
                const rankColors = ["#f59e0b", "#9b9b9b", "#b87333"];
                return (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className="w-5 font-['Russo_One'] text-center shrink-0"
                      style={{ fontSize: "0.8rem", color: i < 3 ? rankColors[i] : "rgba(255,255,255,0.2)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-['Oswald'] text-white/50 tracking-wide truncate" style={{ fontSize: "0.78rem" }}>
                          {m.name}
                        </span>
                        <span className="font-['Russo_One'] shrink-0 ml-2" style={{ fontSize: "0.82rem", color: "#9b2335" }}>
                          {m.count}
                        </span>
                      </div>
                      <div className="h-0.5 bg-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                          className="h-full" style={{ background: i < 3 ? rankColors[i] : "#9b2335", opacity: i < 3 ? 0.8 : 0.4 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Goals progress + Treasury summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

        {/* Goals */}
        <div className="border border-white/[0.06] bg-[#13131c] p-6">
          <Section title="Активные цели семьи" />
          {goals.filter((g) => g.status === "active").length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-10" style={{ fontSize: "0.78rem" }}>Нет активных целей</p>
          ) : (
            <div className="space-y-4">
              {goals.filter((g) => g.status === "active").slice(0, 5).map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-['Oswald'] text-white/55 tracking-wide" style={{ fontSize: "0.82rem" }}>{g.title}</span>
                    <span className="font-['Russo_One']" style={{ fontSize: "0.78rem", color: "#9b2335" }}>{g.progress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-[#9b2335]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Treasury mini */}
        <div className="border border-white/[0.06] bg-[#13131c] p-6">
          <Section title="Казна семьи" sub="Последние транзакции" />
          <div className="flex items-center gap-3 mb-5">
            <div>
              <div className="font-['Russo_One']" style={{ fontSize: "1.6rem", color: treasury.balance >= 0 ? "#22c55e" : "#ef4444" }}>
                {formatMoney(Math.abs(treasury.balance))}
              </div>
              <div className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.52rem" }}>
                Текущий баланс
              </div>
            </div>
            <div className="ml-auto flex gap-4">
              <div className="text-right">
                <div className="font-['Russo_One'] text-[#22c55e]" style={{ fontSize: "0.9rem" }}>+{formatMoney(treasury.totalIncome)}</div>
                <div className="font-['Oswald'] text-white/15 uppercase tracking-wider" style={{ fontSize: "0.46rem" }}>Доходы</div>
              </div>
              <div className="text-right">
                <div className="font-['Russo_One'] text-[#ef4444]" style={{ fontSize: "0.9rem" }}>−{formatMoney(treasury.totalExpense)}</div>
                <div className="font-['Oswald'] text-white/15 uppercase tracking-wider" style={{ fontSize: "0.46rem" }}>Расходы</div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {treasury.transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center gap-2 px-3 py-2 border border-white/[0.04]">
                <Zap size={11} strokeWidth={1.5} style={{ color: tx.type === "income" ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
                <span className="flex-1 font-['Oswald'] text-white/40 tracking-wide truncate" style={{ fontSize: "0.72rem" }}>
                  {tx.description}
                </span>
                <span className="font-['Russo_One'] shrink-0" style={{ fontSize: "0.75rem", color: tx.type === "income" ? "#22c55e" : "#ef4444" }}>
                  {tx.type === "income" ? "+" : "−"}{formatMoney(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badge stats + Members roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Badge stats */}
        <div className="border border-white/[0.06] bg-[#13131c] p-6">
          <Section title="Популярные бейджи" />
          {badgeCounts.length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-8" style={{ fontSize: "0.75rem" }}>Нет бейджей</p>
          ) : (
            <div className="space-y-3">
              {badgeCounts.map(([badge, count], i) => (
                <div key={badge} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={11} className="text-[#f59e0b]/40" strokeWidth={1.5} />
                    <span className="font-['Oswald'] text-white/40 tracking-wide capitalize" style={{ fontSize: "0.72rem" }}>{badge}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5" style={{ width: `${Math.max(12, count * 12)}px`, background: "#9b2335", opacity: 0.5 - i * 0.08 }} />
                    <span className="font-['Russo_One'] text-[#9b2335]" style={{ fontSize: "0.8rem" }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active members list */}
        <div className="lg:col-span-2 border border-white/[0.06] bg-[#13131c] p-6">
          <Section title="Актуальный состав" sub={`${activeMembers} активных участников`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {members.filter((m) => m.active).map((m) => {
              const roleColor = ROLE_COLORS[m.role] ?? "#888";
              const roleLabel = ROLE_LABELS[m.role] ?? m.role;
              return (
                <div key={m.id} className="flex items-center gap-2.5 px-3 py-2.5 border border-white/[0.04] hover:border-white/[0.07] transition-colors">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: roleColor }} />
                  <span className="flex-1 font-['Oswald'] text-white/55 tracking-wide truncate" style={{ fontSize: "0.82rem" }}>
                    {m.name}
                  </span>
                  <span className="font-['Oswald'] uppercase tracking-wider shrink-0 px-1.5 py-px"
                    style={{ fontSize: "0.46rem", color: roleColor, background: `${roleColor}10`, border: `1px solid ${roleColor}20` }}>
                    {roleLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="mt-12 text-center">
        <p className="font-['Oswald'] text-white/10 tracking-wide" style={{ fontSize: "0.6rem" }}>
          Данные обновляются в реальном времени · Schwarz Family · Majestic RP
        </p>
      </motion.div>
    </div>
  );

  return embedded ? inner : (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-5">
        {inner}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   STATS ADMIN TAB — embedded in admin panel
────────────────────────────────────────────── */

export function StatsAdminTab() {
  return <StatsPage embedded />;
}
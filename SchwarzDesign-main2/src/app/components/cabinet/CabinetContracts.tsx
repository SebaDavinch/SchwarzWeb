import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardList, Clock, CheckCircle2, XCircle, Play,
  Users, Coins, Timer, ChevronDown, ChevronUp, UserPlus,
  BarChart3, TrendingUp, Star,
} from "lucide-react";
import type { Contract } from "../../hooks/useCabinetData";
import { ROLE_LABELS, ROLE_COLORS } from "../../hooks/useCabinetData";

interface Props {
  contracts: Contract[];
  memberId?: string;
  memberName?: string;
  onSignUp: (contractId: string, memberId: string, memberName: string) => boolean;
}

const CONTRACT_TYPE_ICONS: Record<string, string> = {
  fishing: "🎣", delivery: "🚚", security: "🛡️",
  heist: "💰", production: "⚗️", other: "📋",
};
const CONTRACT_TYPE_LABELS: Record<string, string> = {
  fishing: "Рыбалка", delivery: "Доставка", security: "Охрана",
  heist: "Ограбление", production: "Производство", other: "Прочее",
};
const STATUS_CONFIG = {
  open:        { label: "Открыт",     color: "#22c55e", Icon: Play },
  in_progress: { label: "В процессе", color: "#f59e0b", Icon: Timer },
  completed:   { label: "Завершён",   color: "#888899", Icon: CheckCircle2 },
  failed:      { label: "Провалён",   color: "#ff3366", Icon: XCircle },
};

/* ─── Timer ─── */
function ContractTimer({ startedAt, estimatedMinutes }: { startedAt?: string; estimatedMinutes?: number }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!startedAt || !estimatedMinutes) { setRemaining(""); return; }
    const tick = () => {
      const diff = new Date(startedAt).getTime() + estimatedMinutes * 60000 - Date.now();
      if (diff <= 0) { setRemaining("Завершится скоро"); return; }
      const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
      setRemaining(h > 0 ? `~${h}ч ${m}мин` : `~${m}мин`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [startedAt, estimatedMinutes]);
  if (!remaining) return null;
  return (
    <div className="flex items-center gap-1.5 text-[#f59e0b]/70">
      <Clock size={12} strokeWidth={1.5} />
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>Осталось: {remaining}</span>
    </div>
  );
}

/* ─── Contract Card ─── */
function ContractCard({ contract, memberId, memberName, onSignUp }: {
  contract: Contract; memberId?: string; memberName?: string;
  onSignUp: (id: string, mid: string, mname: string) => boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [feedback, setFeedback] = useState("");
  const sc = STATUS_CONFIG[contract.status];
  const { Icon: StatusIcon } = sc;
  const isParticipant = memberId ? contract.participants.some(p => p.memberId === memberId) : false;
  const isFull = contract.participants.length >= contract.slots;
  const canSignUp = contract.status === "open" && memberId && memberName && !isParticipant && !isFull;
  const minRoleColor = contract.minRole ? (ROLE_COLORS[contract.minRole] ?? "#888899") : null;
  const minRoleLabel = contract.minRole ? (ROLE_LABELS[contract.minRole] ?? contract.minRole) : null;

  const handleSignUp = () => {
    if (!memberId || !memberName) return;
    const ok = onSignUp(contract.id, memberId, memberName);
    if (ok) { setSignedUp(true); setFeedback("Вы записались!"); }
    else setFeedback("Не удалось записаться");
    setTimeout(() => setFeedback(""), 3000);
  };

  const formatDuration = () => {
    if (!contract.startedAt || !contract.completedAt) return null;
    const diff = new Date(contract.completedAt).getTime() - new Date(contract.startedAt).getTime();
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}ч ${m}мин` : `${m}мин`;
  };

  return (
    <motion.div layout className="border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all duration-300 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl shrink-0 mt-0.5">{CONTRACT_TYPE_ICONS[contract.type] ?? "📋"}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-white/80" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.95rem", letterSpacing: "0.02em" }}>
                  {contract.title}
                </p>
                <span className="text-white/25 uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
                  {CONTRACT_TYPE_LABELS[contract.type] ?? contract.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 shrink-0"
                style={{ background: `${sc.color}12`, border: `1px solid ${sc.color}30` }}>
                <StatusIcon size={10} strokeWidth={2} style={{ color: sc.color }} />
                <span className="uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.52rem", color: sc.color }}>
                  {sc.label}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-white/30">
                <Users size={12} strokeWidth={1.5} />
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>
                  {contract.participants.length}/{contract.slots}
                </span>
              </div>
              {contract.reward && (
                <div className="flex items-center gap-1.5 text-[#22c55e]/50">
                  <Coins size={12} strokeWidth={1.5} />
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>{contract.reward}</span>
                </div>
              )}
              {minRoleLabel && (
                <div className="flex items-center gap-1 px-1.5 py-0.5"
                  style={{ background: `${minRoleColor}10`, border: `1px solid ${minRoleColor}25` }}>
                  <span className="uppercase tracking-wider"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem", color: minRoleColor ?? "#888" }}>
                    {minRoleLabel}+
                  </span>
                </div>
              )}
              {contract.status === "in_progress" && (
                <ContractTimer startedAt={contract.startedAt} estimatedMinutes={contract.estimatedMinutes} />
              )}
              {contract.status === "completed" && formatDuration() && (
                <div className="flex items-center gap-1.5 text-white/25">
                  <Clock size={12} strokeWidth={1.5} />
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>Выполнено за {formatDuration()}</span>
                </div>
              )}
              {isParticipant && (
                <span className="text-[#9b2335] uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>
                  ✓ Вы записаны
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            {canSignUp && (
              <button onClick={handleSignUp} disabled={signedUp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
                <UserPlus size={11} /> Записаться
              </button>
            )}
            {feedback && (
              <span className="text-[#22c55e]/70" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}>{feedback}</span>
            )}
          </div>
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-white/20 hover:text-white/50 transition-colors"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
              <p className="text-white/40 leading-relaxed" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.78rem" }}>
                {contract.description}
              </p>
              {contract.participants.length > 0 && (
                <div>
                  <p className="text-white/25 uppercase tracking-widest mb-2" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>Участники</p>
                  <div className="flex flex-wrap gap-1.5">
                    {contract.participants.map(p => (
                      <span key={p.memberId} className="px-2 py-0.5 border border-white/8 bg-white/[0.02] text-white/40"
                        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}>{p.memberName}</span>
                    ))}
                  </div>
                </div>
              )}
              {contract.closedBy && contract.closedBy.length > 0 && (
                <div className="flex items-center gap-1.5 text-[#22c55e]/50">
                  <CheckCircle2 size={12} strokeWidth={1.5} />
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}>Закрыли: {contract.closedBy.length} чел.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Stats View ─── */
function ContractStats({ contracts, memberId }: { contracts: Contract[]; memberId?: string }) {
  const closedContracts = contracts.filter(c => c.status === "completed");
  const failed = contracts.filter(c => c.status === "failed").length;
  const done = closedContracts.length;
  const total = contracts.length;
  const winRate = (done + failed) > 0 ? Math.round((done / (done + failed)) * 100) : 0;

  /* Type breakdown */
  const typeMap: Record<string, { done: number; total: number }> = {};
  contracts.forEach(c => {
    if (!typeMap[c.type]) typeMap[c.type] = { done: 0, total: 0 };
    typeMap[c.type].total++;
    if (c.status === "completed") typeMap[c.type].done++;
  });
  const typeBreakdown = Object.entries(typeMap).sort((a, b) => b[1].total - a[1].total);
  const maxTypeTotal = Math.max(...typeBreakdown.map(([, v]) => v.total), 1);

  /* My stats */
  const myParticipated = contracts.filter(c => c.participants.some(p => p.memberId === memberId)).length;
  const myClosed = closedContracts.filter(c => (c.closedBy ?? []).includes(memberId ?? "")).length;

  return (
    <div className="space-y-6">

      {/* My personal card */}
      {memberId && (
        <div className="border border-[#9b2335]/20 bg-[#9b2335]/5 p-4">
          <p className="text-[#9b2335] uppercase tracking-widest mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}>
            <Star size={11} strokeWidth={2} /> Ваша статистика
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Участий в контрактах", val: myParticipated, color: "#9b2335" },
              { label: "Закрыто лично",        val: myClosed,       color: "#22c55e" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-white/[0.02] border border-white/5">
                <p style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.5rem", color: s.color }}>{s.val}</p>
                <p className="text-white/25 uppercase tracking-widest mt-0.5"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall summary */}
      <div>
        <p className="text-white/25 uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}>
          <BarChart3 size={11} strokeWidth={1.5} /> Общая сводка
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Всего контрактов", val: total,        color: "#9b2335" },
            { label: "Завершено",        val: done,          color: "#22c55e" },
            { label: "Провалено",        val: failed,        color: "#ff3366" },
            { label: "Успешность",       val: `${winRate}%`, color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="border border-white/5 bg-white/[0.01] p-3 text-center">
              <p style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.4rem", color: s.color }}>{s.val}</p>
              <p className="text-white/20 uppercase tracking-widest mt-0.5"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.48rem" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Win rate bar */}
        <div className="mt-3 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${winRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#9b2335,#22c55e)" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[#9b2335]/50 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.44rem" }}>провалено</span>
          <span className="text-[#22c55e]/50 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.44rem" }}>завершено</span>
        </div>
      </div>

      {/* Type breakdown */}
      {typeBreakdown.length > 0 && (
        <div>
          <p className="text-white/25 uppercase tracking-widest mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}>
            <TrendingUp size={11} strokeWidth={1.5} /> По типам
          </p>
          <div className="space-y-2.5">
            {typeBreakdown.map(([type, { done: d, total: t }]) => {
              const pct = Math.round((t / maxTypeTotal) * 100);
              const successPct = t > 0 ? Math.round((d / t) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "0.85rem" }}>{CONTRACT_TYPE_ICONS[type] ?? "📋"}</span>
                      <span className="text-white/45 uppercase tracking-wider"
                        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.62rem" }}>
                        {CONTRACT_TYPE_LABELS[type] ?? type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#22c55e]/60" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
                        {d}/{t}
                      </span>
                      <span className="text-white/20 w-8 text-right" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
                        {successPct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ background: "#9b2335" }}
                    >
                      {successPct > 0 && (
                        <div className="absolute inset-y-0 left-0 bg-[#22c55e]/40"
                          style={{ width: `${successPct}%` }} />
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="border border-white/5 p-12 text-center">
          <BarChart3 size={28} className="text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p className="text-white/20 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}>
            Пока нет данных
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Export ─── */
export function CabinetContracts({ contracts, memberId, memberName, onSignUp }: Props) {
  const [view, setView] = useState<"list" | "stats">("list");
  const [filter, setFilter] = useState<string>("all");

  const filters = [
    { id: "all",         label: "Все" },
    { id: "open",        label: "Открытые" },
    { id: "in_progress", label: "В процессе" },
    { id: "completed",   label: "Завершённые" },
    { id: "failed",      label: "Провалены" },
  ];

  const filtered = filter === "all" ? contracts : contracts.filter(c => c.status === filter);
  const openCount = contracts.filter(c => c.status === "open").length;
  const inProgressCount = contracts.filter(c => c.status === "in_progress").length;
  const completedCount = contracts.filter(c => c.status === "completed").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList size={20} className="text-[#9b2335]" strokeWidth={1.5} />
          <h2 className="text-white" style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.4rem" }}>Контракты</h2>
        </div>

        {/* View toggle */}
        <div className="flex border border-white/[0.07] overflow-hidden">
          {([
            { id: "list",  label: "Список",    Icon: ClipboardList },
            { id: "stats", label: "Статистика", Icon: BarChart3 },
          ] as const).map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-4 py-2 uppercase tracking-wider transition-all duration-200
                ${view === id
                  ? "bg-[#9b2335]/15 text-[#9b2335]"
                  : "text-white/25 hover:text-white/50 hover:bg-white/[0.03]"}
                border-r border-white/[0.06] last:border-r-0`}
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
              <Icon size={12} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div key="list" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Открытых",   value: openCount,       color: "#22c55e" },
                { label: "В процессе", value: inProgressCount, color: "#f59e0b" },
                { label: "Закрыто",    value: completedCount,  color: "#888899" },
              ].map(s => (
                <div key={s.label} className="border border-white/5 bg-white/[0.01] p-3 text-center">
                  <p style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.5rem", color: s.color }}>{s.value}</p>
                  <p className="text-white/25 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.52rem" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className="px-3 py-1.5 uppercase tracking-wider transition-all duration-300"
                  style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem",
                    background: filter === f.id ? "#9b233515" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${filter === f.id ? "#9b233540" : "rgba(255,255,255,0.06)"}`,
                    color: filter === f.id ? "#9b2335" : "rgba(255,255,255,0.35)",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="border border-white/5 bg-white/[0.01] p-12 text-center">
                <ClipboardList size={32} className="text-white/10 mx-auto mb-4" strokeWidth={1} />
                <p className="text-white/20 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>Нет контрактов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(c => (
                  <ContractCard key={c.id} contract={c} memberId={memberId} memberName={memberName} onSignUp={onSignUp} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="stats" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ContractStats contracts={contracts} memberId={memberId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

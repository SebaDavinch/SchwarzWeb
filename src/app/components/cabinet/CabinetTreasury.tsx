import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar, Lock,
} from "lucide-react";
import {
  getTreasurySnapshot, CATEGORY_LABELS, CATEGORY_COLORS, formatMoney,
  type TreasuryTransaction, type TransactionCategory,
} from "../../hooks/useTreasury";

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "2-digit" });
}

function buildMonthly(txs: TreasuryTransaction[]) {
  const map: Record<string, { month: string; income: number; expense: number }> = {};
  txs.forEach((tx) => {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" });
    if (!map[key]) map[key] = { month: label, income: 0, expense: 0 };
    if (tx.type === "income") map[key].income += tx.amount;
    else map[key].expense += tx.amount;
  });
  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-5);
}

/* ──────────────────────────────────────────────
   MAIN
────────────────────────────────────────────── */

export function CabinetTreasury() {
  const { transactions, balance, totalIncome, totalExpense } = useMemo(() => getTreasurySnapshot(), []);
  const [filterCat, setFilterCat] = useState<TransactionCategory | "all">("all");

  const monthlyData = useMemo(() => buildMonthly(transactions), [transactions]);

  const filtered = useMemo(() => {
    let list = [...transactions].slice(0, 50);
    if (filterCat !== "all") list = list.filter((t) => t.category === filterCat);
    return list;
  }, [transactions, filterCat]);

  /* Category breakdown (income) */
  const catBreakdown = useMemo(() => {
    const map: Partial<Record<TransactionCategory, number>> = {};
    transactions.filter((t) => t.type === "income").forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return Object.entries(map)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5) as [TransactionCategory, number][];
  }, [transactions]);

  const balanceColor = balance >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center border border-[#9b2335]/20 bg-[#9b2335]/06">
          <Wallet size={15} className="text-[#9b2335]/60" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1.05rem" }}>Казна семьи</h3>
          <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
            Финансовое состояние семьи · только для ознакомления
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 border border-[#f59e0b]/15 bg-[#f59e0b]/05">
          <Lock size={9} className="text-[#f59e0b]/40" />
          <span className="font-['Oswald'] text-[#f59e0b]/40 uppercase tracking-wider" style={{ fontSize: "0.48rem" }}>
            Только чтение
          </span>
        </div>
      </div>

      {/* Balance + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Баланс казны", value: balance,      icon: Wallet,       color: balanceColor, sign: balance < 0 ? "" : "" },
          { label: "Всего доходов", value: totalIncome,  icon: TrendingUp,   color: "#22c55e",    sign: "+" },
          { label: "Всего расходов",value: totalExpense, icon: TrendingDown, color: "#ef4444",    sign: "−" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="border border-white/[0.06] bg-[#13131c] p-4 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
              <s.icon size={15} strokeWidth={1.5} style={{ color: s.color }} />
            </div>
            <div>
              <div className="font-['Russo_One']" style={{ fontSize: "1.25rem", color: s.color }}>
                {s.sign}{formatMoney(Math.abs(s.value))}
              </div>
              <div className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.5rem" }}>
                {s.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5">

        {/* Monthly chart */}
        <div className="border border-white/[0.06] bg-[#13131c] p-5">
          <h4 className="font-['Oswald'] text-white/35 uppercase tracking-wider mb-4" style={{ fontSize: "0.62rem" }}>
            Движение средств (последние 5 месяцев)
          </h4>
          {monthlyData.length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-10" style={{ fontSize: "0.72rem" }}>Нет данных</p>
          ) : (
            <div style={{ height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8, fontFamily: "Oswald" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.12)", fontSize: 8, fontFamily: "Oswald" }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}к`} />
                  <Tooltip
                    contentStyle={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, fontFamily: "Oswald" }}
                    labelStyle={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}
                    itemStyle={{ fontSize: "0.65rem" }}
                    formatter={(v: number) => formatMoney(v)}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  />
                  <Bar dataKey="income"  fill="#22c55e" fillOpacity={0.65} radius={[1,1,0,0]} name="Доходы" />
                  <Bar dataKey="expense" fill="#ef4444" fillOpacity={0.65} radius={[1,1,0,0]} name="Расходы" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="border border-white/[0.06] bg-[#13131c] p-5">
          <h4 className="font-['Oswald'] text-white/35 uppercase tracking-wider mb-4" style={{ fontSize: "0.62rem" }}>
            Топ источников дохода
          </h4>
          {catBreakdown.length === 0 ? (
            <p className="font-['Oswald'] text-white/12 text-center py-10" style={{ fontSize: "0.72rem" }}>Нет данных</p>
          ) : (
            <div className="space-y-3">
              {catBreakdown.map(([cat, val]) => {
                const pct = totalIncome > 0 ? Math.round((val / totalIncome) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.55rem", color: CATEGORY_COLORS[cat] }}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="font-['Russo_One']" style={{ fontSize: "0.72rem", color: CATEGORY_COLORS[cat] }}>
                        {formatMoney(val)}
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full" style={{ background: CATEGORY_COLORS[cat] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        {/* Category filter */}
        <div className="flex items-center gap-0 border-b border-white/[0.05] mb-4 overflow-x-auto no-scrollbar">
          {([["all", "Все", "#9b2335"], ...Object.entries(CATEGORY_LABELS).map(([k, v]) => [k, v, CATEGORY_COLORS[k as TransactionCategory]])] as [string, string, string][])
            .map(([id, label, color]) => (
              <button key={id} onClick={() => setFilterCat(id as TransactionCategory | "all")}
                className="px-3 py-2 border-b-2 font-['Oswald'] uppercase tracking-wider transition-all whitespace-nowrap shrink-0"
                style={{
                  fontSize: "0.56rem",
                  borderBottomColor: filterCat === id ? color : "transparent",
                  color: filterCat === id ? color : "rgba(255,255,255,0.2)",
                  marginBottom: "-1px",
                }}>
                {label}
              </button>
            ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="border border-white/[0.04] py-12 text-center">
            <Wallet size={28} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
            <p className="font-['Oswald'] text-white/12 tracking-wide" style={{ fontSize: "0.75rem" }}>Нет транзакций</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <motion.div key={tx.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-3 py-2.5 border border-white/[0.04] hover:border-white/[0.07] transition-colors">
                  <div className="w-7 h-7 shrink-0 flex items-center justify-center rounded-sm"
                    style={{ background: isIncome ? "#22c55e0a" : "#ef44440a", border: `1px solid ${isIncome ? "#22c55e1a" : "#ef44441a"}` }}>
                    {isIncome
                      ? <ArrowUpRight size={12} style={{ color: "#22c55e" }} strokeWidth={1.5} />
                      : <ArrowDownRight size={12} style={{ color: "#ef4444" }} strokeWidth={1.5} />}
                  </div>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[tx.category] }} />
                  <div className="flex-1 min-w-0">
                    <span className="font-['Oswald'] text-white/55 tracking-wide truncate block" style={{ fontSize: "0.82rem" }}>
                      {tx.description}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-['Oswald'] text-white/15 tracking-wide flex items-center gap-1" style={{ fontSize: "0.56rem" }}>
                        <Calendar size={8} /> {fmtDate(tx.createdAt)}
                      </span>
                      <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.46rem", color: CATEGORY_COLORS[tx.category], opacity: 0.6 }}>
                        {CATEGORY_LABELS[tx.category]}
                      </span>
                    </div>
                  </div>
                  <span className="font-['Russo_One'] shrink-0" style={{ fontSize: "0.88rem", color: isIncome ? "#22c55e" : "#ef4444" }}>
                    {isIncome ? "+" : "−"}{formatMoney(tx.amount)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import {
  Wallet, Plus, Trash2, TrendingUp, TrendingDown,
  X, CheckCircle2, Search, Calendar, DollarSign, ArrowUpRight, ArrowDownRight,
  ChevronDown, Filter,
} from "lucide-react";
import {
  useTreasury, CATEGORY_LABELS, CATEGORY_COLORS, formatMoney,
  type TreasuryTransaction, type TransactionType, type TransactionCategory,
} from "../../hooks/useTreasury";

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */

const ic = "w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/40 text-white/80 px-3 py-2.5 outline-none transition-colors font-['Oswald'] tracking-wide";
const lc = "block font-['Oswald'] text-white/25 uppercase tracking-wider mb-1.5";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "2-digit" });
}

/* monthly chart data */
function buildMonthlyData(txs: TreasuryTransaction[]) {
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
    .slice(-6);
}

/* ──────────────────────────────────────────────
   ADD TRANSACTION MODAL
────────────────────────────────────────────── */

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TransactionCategory[];

interface AddModalProps {
  onAdd: (data: Omit<TreasuryTransaction, "id" | "createdAt">) => void;
  onClose: () => void;
  staffName: string;
}

function AddModal({ onAdd, onClose, staffName }: AddModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    type: "income" as TransactionType,
    amount: "",
    category: "contracts" as TransactionCategory,
    description: "",
    date: today,
  });
  const [done, setDone] = useState(false);

  const valid = form.amount && Number(form.amount) > 0 && form.description.trim();

  const handleSubmit = () => {
    if (!valid) return;
    onAdd({
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
      addedBy: staffName,
    });
    setDone(true);
    setTimeout(onClose, 1400);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(8,8,14,0.92)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg border border-white/8 bg-[#0d0d15]"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>Новая транзакция</h3>
            <p className="font-['Oswald'] text-white/20 tracking-wide mt-0.5" style={{ fontSize: "0.65rem" }}>
              Запись в казну семьи
            </p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors"><X size={18} /></button>
        </div>

        {done ? (
          <div className="px-6 py-14 text-center">
            <CheckCircle2 size={36} className="text-green-500/60 mx-auto mb-4" strokeWidth={1} />
            <p className="font-['Russo_One'] text-white" style={{ fontSize: "0.95rem" }}>Записано!</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* Type toggle */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Тип</label>
              <div className="grid grid-cols-2 gap-2">
                {(["income", "expense"] as const).map((t) => (
                  <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className="flex items-center justify-center gap-2 py-2.5 border font-['Oswald'] uppercase tracking-wider transition-all"
                    style={{
                      fontSize: "0.7rem",
                      color: form.type === t ? (t === "income" ? "#22c55e" : "#ff3366") : "rgba(255,255,255,0.25)",
                      borderColor: form.type === t ? (t === "income" ? "#22c55e40" : "#ff336640") : "rgba(255,255,255,0.07)",
                      background: form.type === t ? (t === "income" ? "#22c55e0e" : "#ff33660e") : "transparent",
                    }}>
                    {t === "income" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {t === "income" ? "Доход" : "Расход"}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Сумма ($)</label>
              <input type="number" min="1" value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="50000" className={ic} style={{ fontSize: "0.88rem" }} />
            </div>

            {/* Category */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Категория</label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => {
                  const active = form.category === cat;
                  return (
                    <button key={cat} onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className="px-3 py-2 border font-['Oswald'] uppercase tracking-wider text-left transition-all"
                      style={{
                        fontSize: "0.6rem",
                        color: active ? CATEGORY_COLORS[cat] : "rgba(255,255,255,0.25)",
                        borderColor: active ? `${CATEGORY_COLORS[cat]}35` : "rgba(255,255,255,0.06)",
                        background: active ? `${CATEGORY_COLORS[cat]}0e` : "transparent",
                      }}>
                      {CATEGORY_LABELS[cat]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Описание *</label>
              <input value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Краткое описание транзакции..." className={ic} style={{ fontSize: "0.85rem" }} />
            </div>

            {/* Date */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Дата</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={ic} style={{ fontSize: "0.85rem", colorScheme: "dark" }} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 border border-white/8 text-white/30 font-['Oswald'] uppercase tracking-wider hover:text-white/50 transition-colors"
                style={{ fontSize: "0.68rem" }}>
                Отмена
              </button>
              <button onClick={handleSubmit} disabled={!valid}
                className="flex-1 py-2.5 flex items-center justify-center gap-2 font-['Oswald'] uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontSize: "0.68rem", background: "rgba(155,35,53,0.12)", border: "1px solid rgba(155,35,53,0.3)", color: "#9b2335" }}>
                <Plus size={13} /> Записать
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   TRANSACTION ROW
────────────────────────────────────────────── */

function TxRow({ tx, onDelete }: { tx: TreasuryTransaction; onDelete: () => void }) {
  const isIncome = tx.type === "income";
  const catColor = CATEGORY_COLORS[tx.category];

  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-4 py-3 border border-white/[0.05] hover:border-white/[0.09] group transition-all">

      {/* Type icon */}
      <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-sm"
        style={{ background: isIncome ? "#22c55e10" : "#ef444410", border: `1px solid ${isIncome ? "#22c55e22" : "#ef444422"}` }}>
        {isIncome
          ? <ArrowUpRight size={14} style={{ color: "#22c55e" }} strokeWidth={1.5} />
          : <ArrowDownRight size={14} style={{ color: "#ef4444" }} strokeWidth={1.5} />}
      </div>

      {/* Category dot */}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: catColor }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-['Oswald'] text-white/65 tracking-wide truncate" style={{ fontSize: "0.85rem" }}>
            {tx.description}
          </span>
          <span className="px-1.5 py-px font-['Oswald'] uppercase tracking-wider shrink-0"
            style={{ fontSize: "0.46rem", color: catColor, background: `${catColor}10`, border: `1px solid ${catColor}20` }}>
            {CATEGORY_LABELS[tx.category]}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="font-['Oswald'] text-white/18 tracking-wide flex items-center gap-1" style={{ fontSize: "0.6rem" }}>
            <Calendar size={9} /> {fmtDate(tx.createdAt)}
          </span>
          <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.58rem" }}>
            {tx.addedBy}
          </span>
        </div>
      </div>

      {/* Amount */}
      <span className="font-['Russo_One'] shrink-0" style={{ fontSize: "0.95rem", color: isIncome ? "#22c55e" : "#ef4444" }}>
        {isIncome ? "+" : "−"}{formatMoney(tx.amount)}
      </span>

      {/* Delete */}
      <button onClick={onDelete}
        className="shrink-0 p-1.5 text-white/10 hover:text-[#ff3366]/60 transition-colors opacity-0 group-hover:opacity-100 border border-transparent hover:border-[#ff3366]/15">
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MAIN TAB
────────────────────────────────────────────── */

interface Props { staffName?: string; }

export function TreasuryTab({ staffName = "Admin" }: Props) {
  const { transactions, addTransaction, deleteTransaction, balance, totalIncome, totalExpense } = useTreasury();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCat, setFilterCat] = useState<TransactionCategory | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showCatFilter, setShowCatFilter] = useState(false);

  const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);

  /* Pie: by category (income only) */
  const catPieData = useMemo(() => {
    const map: Partial<Record<TransactionCategory, number>> = {};
    transactions
      .filter((t) => t.type === "income")
      .forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map).map(([cat, val]) => ({
      name: CATEGORY_LABELS[cat as TransactionCategory],
      value: val,
      color: CATEGORY_COLORS[cat as TransactionCategory],
    }));
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = transactions;
    if (filterType !== "all") list = list.filter((t) => t.type === filterType);
    if (filterCat !== "all") list = list.filter((t) => t.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.description.toLowerCase().includes(q) || t.addedBy.toLowerCase().includes(q));
    }
    return list;
  }, [transactions, filterType, filterCat, search]);

  const balanceColor = balance >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.4rem" }}>Казна семьи</h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Учёт доходов и расходов · только для руководства
          </p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border transition-all"
          style={{ borderColor: "rgba(155,35,53,0.3)", background: "rgba(155,35,53,0.06)", color: "#9b2335" }}>
          <Plus size={14} />
          <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>Добавить</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
        {[
          { label: "Баланс",  value: balance,       icon: Wallet,       color: balanceColor,  sign: balance >= 0 ? "" : "" },
          { label: "Доходы",  value: totalIncome,   icon: TrendingUp,   color: "#22c55e",     sign: "+" },
          { label: "Расходы", value: totalExpense,  icon: TrendingDown, color: "#ef4444",     sign: "−" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="border border-white/5 bg-white/[0.01] p-5 flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
              <s.icon size={16} strokeWidth={1.5} style={{ color: s.color }} />
            </div>
            <div>
              <div className="font-['Russo_One']" style={{ fontSize: "1.4rem", color: s.color }}>
                {s.sign}{formatMoney(Math.abs(s.value))}
              </div>
              <div className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-5 mb-7">
        {/* Monthly bar chart */}
        <div className="border border-white/5 bg-white/[0.01] p-5">
          <h3 className="font-['Oswald'] text-white/40 uppercase tracking-wider mb-4" style={{ fontSize: "0.68rem" }}>
            Движение средств по месяцам
          </h3>
          {monthlyData.length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-8" style={{ fontSize: "0.75rem" }}>Нет данных</p>
          ) : (
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "Oswald" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9, fontFamily: "Oswald" }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}к`} />
                  <Tooltip
                    contentStyle={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, fontFamily: "Oswald" }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}
                    itemStyle={{ fontSize: "0.7rem" }}
                    formatter={(v: number) => formatMoney(v)}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  />
                  <Bar dataKey="income"  fill="#22c55e" fillOpacity={0.7} radius={[1, 1, 0, 0]} name="Доходы" />
                  <Bar dataKey="expense" fill="#ef4444" fillOpacity={0.7} radius={[1, 1, 0, 0]} name="Расходы" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie: income by category */}
        <div className="border border-white/5 bg-white/[0.01] p-5">
          <h3 className="font-['Oswald'] text-white/40 uppercase tracking-wider mb-3" style={{ fontSize: "0.68rem" }}>
            Источники дохода
          </h3>
          {catPieData.length === 0 ? (
            <p className="font-['Oswald'] text-white/15 text-center py-8" style={{ fontSize: "0.72rem" }}>Нет доходов</p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div style={{ width: 110, height: 110 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={52} dataKey="value" stroke="none">
                      {catPieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, fontFamily: "Oswald" }}
                      itemStyle={{ fontSize: "0.65rem" }}
                      formatter={(v: number) => formatMoney(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-1">
                {catPieData.slice(0, 4).map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.56rem" }}>{d.name}</span>
                    </div>
                    <span className="font-['Russo_One']" style={{ fontSize: "0.7rem", color: d.color }}>{formatMoney(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="bg-[#0d0d15] border border-white/[0.07] focus:border-[#9b2335]/30 text-white/60 font-['Oswald'] tracking-wide pl-8 pr-3 py-2 outline-none transition-colors"
            style={{ fontSize: "0.75rem", width: 180 }} />
        </div>

        {/* Type filter */}
        {(["all", "income", "expense"] as const).map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className="px-3 py-2 border font-['Oswald'] uppercase tracking-wider transition-all"
            style={{
              fontSize: "0.6rem",
              color: filterType === t ? (t === "income" ? "#22c55e" : t === "expense" ? "#ef4444" : "#9b2335") : "rgba(255,255,255,0.25)",
              borderColor: filterType === t ? (t === "income" ? "#22c55e40" : t === "expense" ? "#ef444440" : "rgba(155,35,53,0.3)") : "rgba(255,255,255,0.06)",
              background: filterType === t ? (t === "income" ? "#22c55e0a" : t === "expense" ? "#ef44440a" : "rgba(155,35,53,0.06)") : "transparent",
            }}>
            {t === "all" ? "Все" : t === "income" ? "Доходы" : "Расходы"}
          </button>
        ))}

        {/* Category filter toggle */}
        <button onClick={() => setShowCatFilter((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 border border-white/[0.07] text-white/25 font-['Oswald'] uppercase tracking-wider hover:text-white/45 transition-all"
          style={{ fontSize: "0.6rem" }}>
          <Filter size={10} />
          {filterCat === "all" ? "Категория" : CATEGORY_LABELS[filterCat]}
          <ChevronDown size={10} className={`transition-transform ${showCatFilter ? "rotate-180" : ""}`} />
        </button>

        <span className="ml-auto font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.6rem" }}>
          {filtered.length} записей
        </span>
      </div>

      {/* Category filter dropdown */}
      <AnimatePresence>
        {showCatFilter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3">
            <div className="flex flex-wrap gap-1.5 py-2">
              <button onClick={() => { setFilterCat("all"); setShowCatFilter(false); }}
                className="px-3 py-1.5 border font-['Oswald'] uppercase tracking-wider transition-all"
                style={{ fontSize: "0.56rem", color: filterCat === "all" ? "#9b2335" : "rgba(255,255,255,0.25)", borderColor: filterCat === "all" ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)", background: filterCat === "all" ? "rgba(155,35,53,0.06)" : "transparent" }}>
                Все
              </button>
              {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map((cat) => (
                <button key={cat} onClick={() => { setFilterCat(cat); setShowCatFilter(false); }}
                  className="px-3 py-1.5 border font-['Oswald'] uppercase tracking-wider transition-all"
                  style={{ fontSize: "0.56rem", color: filterCat === cat ? CATEGORY_COLORS[cat] : "rgba(255,255,255,0.25)", borderColor: filterCat === cat ? `${CATEGORY_COLORS[cat]}35` : "rgba(255,255,255,0.06)", background: filterCat === cat ? `${CATEGORY_COLORS[cat]}0a` : "transparent" }}>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="border border-white/5 py-16 text-center">
          <DollarSign size={32} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.8rem" }}>
            {transactions.length === 0 ? "Нет записей" : "Ничего не найдено"}
          </p>
          {transactions.length === 0 && (
            <button onClick={() => setAddOpen(true)}
              className="mt-4 font-['Oswald'] text-[#9b2335]/40 hover:text-[#9b2335]/60 uppercase tracking-wider transition-colors"
              style={{ fontSize: "0.65rem" }}>
              + Добавить первую транзакцию
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {filtered.map((tx) => (
              <TxRow key={tx.id} tx={tx} onDelete={() => setConfirmDelete(tx.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (() => {
          const tx = transactions.find((t) => t.id === confirmDelete);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(8,8,14,0.9)" }} onClick={() => setConfirmDelete(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="w-full max-w-sm border border-white/8 bg-[#0d0d15] p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}>
                <div>
                  <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>Удалить запись?</h3>
                  {tx && (
                    <p className="font-['Oswald'] text-white/30 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
                      «{tx.description}» · {tx.type === "income" ? "+" : "−"}{formatMoney(tx.amount)}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-2.5 border border-white/8 text-white/30 font-['Oswald'] uppercase tracking-wider hover:text-white/50 transition-colors"
                    style={{ fontSize: "0.68rem" }}>
                    Отмена
                  </button>
                  <button onClick={() => { deleteTransaction(confirmDelete); setConfirmDelete(null); }}
                    className="flex-1 py-2.5 font-['Oswald'] uppercase tracking-wider transition-all"
                    style={{ fontSize: "0.68rem", background: "rgba(255,51,102,0.08)", border: "1px solid rgba(255,51,102,0.22)", color: "#ff3366" }}>
                    Удалить
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Add modal */}
      <AnimatePresence>
        {addOpen && <AddModal onAdd={addTransaction} onClose={() => setAddOpen(false)} staffName={staffName} />}
      </AnimatePresence>
    </div>
  );
}

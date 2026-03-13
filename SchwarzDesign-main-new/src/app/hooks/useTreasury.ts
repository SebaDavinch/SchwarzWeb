import { useState, useCallback } from "react";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "contracts"
  | "dues"
  | "leadership"
  | "bonuses"
  | "purchases"
  | "fines"
  | "other";

export interface TreasuryTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;         // "YYYY-MM-DD" display date
  createdAt: string;    // ISO
  addedBy: string;
}

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  contracts:  "Контракты",
  dues:       "Взносы участников",
  leadership: "Лидерка",
  bonuses:    "Бонусы",
  purchases:  "Покупки",
  fines:      "Штрафы",
  other:      "Прочее",
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  contracts:  "#22c55e",
  dues:       "#3b82f6",
  leadership: "#9b2335",
  bonuses:    "#f59e0b",
  purchases:  "#ef4444",
  fines:      "#ff3366",
  other:      "#6b7280",
};

/* ═══════════════════════════════════════════════
   DEFAULT DATA
   ═══════════════════════════════════════════════ */

function makeDefaultTransactions(): TreasuryTransaction[] {
  const now = Date.now();
  const d = (days: number) => new Date(now - days * 86400000);
  const iso = (days: number) => d(days).toISOString();
  const date = (days: number) => d(days).toISOString().split("T")[0];

  return [
    { id: "tx_d1", type: "income",  amount: 150000, category: "leadership", description: "Доход от лидерки FIB Seattle",           date: date(26), createdAt: iso(26), addedBy: "Madara Schwarz" },
    { id: "tx_d2", type: "income",  amount: 75000,  category: "contracts",  description: "Охрана точки — итог контракта",           date: date(21), createdAt: iso(21), addedBy: "Akihiro Schwarz" },
    { id: "tx_d3", type: "expense", amount: 50000,  category: "purchases",  description: "Закупка снаряжения для состава",          date: date(19), createdAt: iso(19), addedBy: "Roman Schwarz" },
    { id: "tx_d4", type: "income",  amount: 30000,  category: "dues",       description: "Ежемесячные взносы участников (март)",    date: date(12), createdAt: iso(12), addedBy: "Madara Schwarz" },
    { id: "tx_d5", type: "expense", amount: 20000,  category: "fines",      description: "Штраф за нарушение правил сервера",       date: date(8),  createdAt: iso(8),  addedBy: "Madara Schwarz" },
    { id: "tx_d6", type: "income",  amount: 45000,  category: "contracts",  description: "Ночная рыбалка — командный доход",        date: date(5),  createdAt: iso(5),  addedBy: "Roman Schwarz" },
    { id: "tx_d7", type: "income",  amount: 60000,  category: "bonuses",    description: "Бонус от администрации за активность",    date: date(3),  createdAt: iso(3),  addedBy: "Madara Schwarz" },
    { id: "tx_d8", type: "expense", amount: 15000,  category: "other",      description: "Организация внутреннего мероприятия",     date: date(1),  createdAt: iso(1),  addedBy: "Akihiro Schwarz" },
  ];
}

/* ═══════════════════════════════════════════════
   STORAGE
   ═══════════════════════════════════════════════ */

const TX_KEY = "schwarz_treasury_transactions";

function loadTx(): TreasuryTransaction[] {
  try {
    const raw = localStorage.getItem(TX_KEY);
    return raw ? JSON.parse(raw) : makeDefaultTransactions();
  } catch {
    return makeDefaultTransactions();
  }
}

function saveTx(txs: TreasuryTransaction[]) {
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
}

function calcBalance(txs: TreasuryTransaction[]) {
  return txs.reduce((acc, tx) => (tx.type === "income" ? acc + tx.amount : acc - tx.amount), 0);
}

function genId() {
  return "tx_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ═══════════════════════════════════════════════
   HOOK (writable — for admin)
   ═══════════════════════════════════════════════ */

export function useTreasury() {
  const [transactions, setTx] = useState<TreasuryTransaction[]>(() => loadTx());

  const persist = useCallback((txs: TreasuryTransaction[]) => {
    setTx(txs);
    saveTx(txs);
  }, []);

  const addTransaction = (data: Omit<TreasuryTransaction, "id" | "createdAt">) => {
    const tx: TreasuryTransaction = { ...data, id: genId(), createdAt: new Date().toISOString() };
    persist([tx, ...transactions]);
    return tx;
  };

  const deleteTransaction = (id: string) => persist(transactions.filter((t) => t.id !== id));

  const balance      = calcBalance(transactions);
  const totalIncome  = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return { transactions, addTransaction, deleteTransaction, balance, totalIncome, totalExpense };
}

/* ═══════════════════════════════════════════════
   READ-ONLY (for cabinet + public stats)
   ═══════════════════════════════════════════════ */

export function getTreasurySnapshot() {
  const txs = loadTx();
  return {
    transactions: txs,
    balance:      calcBalance(txs),
    totalIncome:  txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    totalExpense: txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
  };
}

/* ─── format helpers ─── */
export function formatMoney(n: number) {
  return "$" + n.toLocaleString("ru-RU").replace(/,/g, " ");
}

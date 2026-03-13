import { useState, useCallback } from "react";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export type ReportCategory =
  | "behavior"
  | "rules"
  | "conflict"
  | "scam"
  | "inactivity"
  | "other";

export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export interface Report {
  id: string;
  reporterAccountId: string;
  reporterName: string;
  targetMemberId?: string;
  targetName: string;
  category: ReportCategory;
  subject: string;
  description: string;
  evidence?: string;
  status: ReportStatus;
  adminComment?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  submittedAt: string;
  anonymous: boolean;
}

export const REPORT_CATEGORIES: { id: ReportCategory; label: string; color: string; icon: string }[] = [
  { id: "behavior",   label: "Поведение / грубость",  color: "#ff3366", icon: "😤" },
  { id: "rules",      label: "Нарушение правил",       color: "#f59e0b", icon: "📋" },
  { id: "conflict",   label: "Конфликт внутри семьи",  color: "#a78bfa", icon: "⚔️" },
  { id: "scam",       label: "Мошенничество / кидок",  color: "#ef4444", icon: "🚨" },
  { id: "inactivity", label: "Неактивность",           color: "#6b7280", icon: "😴" },
  { id: "other",      label: "Другое",                 color: "#38bdf8", icon: "💬" },
];

export const REPORT_STATUS_META: Record<ReportStatus, { label: string; color: string }> = {
  open:          { label: "Открыта",         color: "#f59e0b" },
  investigating: { label: "Рассматривается", color: "#38bdf8" },
  resolved:      { label: "Решена",          color: "#22c55e" },
  dismissed:     { label: "Отклонена",       color: "#6b7280" },
};

/* ─── storage ─── */
const KEY = "schwarz_reports";

function load(): Report[] {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

function save(reports: Report[]) {
  localStorage.setItem(KEY, JSON.stringify(reports));
}

function genId() {
  return "rep_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ─── submit (called without hook) ─── */
export function submitReport(data: Omit<Report, "id" | "submittedAt" | "status">): Report {
  const reports = load();
  const report: Report = {
    ...data,
    id: genId(),
    submittedAt: new Date().toISOString(),
    status: "open",
  };
  save([report, ...reports]);

  try {
    const raw = localStorage.getItem("schwarz_admin_discordWebhook");
    const cfg = raw ? JSON.parse(raw) : {};
    if (cfg.enabled && cfg.url) {
      const cat = REPORT_CATEGORIES.find((c) => c.id === data.category);
      fetch(cfg.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Schwarz Family",
          embeds: [{
            title: `${cat?.icon ?? "🚨"} Новая жалоба — ${cat?.label ?? data.category}`,
            description: `**${data.subject}**`,
            color: 0xff3366,
            fields: [
              { name: "На кого", value: data.targetName, inline: true },
              { name: "Жалобщик", value: data.anonymous ? "Аноним" : data.reporterName, inline: true },
            ],
            footer: { text: "Schwarz Family | Жалобы" },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {});
    }
  } catch { /* ignore */ }

  return report;
}

/* ─── load for current user (no hook) ─── */
export function loadMyReports(accountId: string): Report[] {
  return load().filter((r) => r.reporterAccountId === accountId);
}

/* ═══════════════════════════════════════════════
   HOOK (admin panel)
   ═══════════════════════════════════════════════ */

export function useReports() {
  const [reports, setReportsState] = useState<Report[]>(() => load());

  const persist = useCallback((r: Report[]) => {
    setReportsState(r);
    save(r);
  }, []);

  const updateReport = (id: string, changes: Partial<Report>) => {
    persist(reports.map((r) => r.id === id ? { ...r, ...changes } : r));
  };

  const resolveReport = (id: string, adminName: string, comment?: string) => {
    persist(reports.map((r) => r.id === id ? {
      ...r, status: "resolved" as ReportStatus, resolvedBy: adminName,
      resolvedAt: new Date().toISOString(), adminComment: comment,
    } : r));
  };

  const dismissReport = (id: string, adminName: string, comment?: string) => {
    persist(reports.map((r) => r.id === id ? {
      ...r, status: "dismissed" as ReportStatus, resolvedBy: adminName,
      resolvedAt: new Date().toISOString(), adminComment: comment,
    } : r));
  };

  const setInvestigating = (id: string) => {
    persist(reports.map((r) => r.id === id ? { ...r, status: "investigating" as ReportStatus } : r));
  };

  const deleteReport = (id: string) => persist(reports.filter((r) => r.id !== id));

  const openCount = reports.filter((r) => r.status === "open").length;

  return { reports, openCount, updateReport, resolveReport, dismissReport, setInvestigating, deleteReport };
}

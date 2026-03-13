import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle, CheckCircle2, Clock, XCircle,
  Search, Filter, ChevronDown, ChevronUp, MessageSquare,
  User, Eye, EyeOff, Shield, Trash2, RefreshCw,
} from "lucide-react";
import {
  useReports, REPORT_CATEGORIES, REPORT_STATUS_META,
  type Report, type ReportStatus, type ReportCategory,
} from "../../hooks/useReports";

/* ─── helpers ─── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const ic = "w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/40 text-white/80 px-3 py-2.5 outline-none transition-colors font-['Oswald'] tracking-wide";

/* ─── Category badge ─── */
function CatBadge({ category }: { category: ReportCategory }) {
  const cat = REPORT_CATEGORIES.find((c) => c.id === category);
  if (!cat) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{ fontSize: "0.48rem", color: cat.color, background: `${cat.color}10`, border: `1px solid ${cat.color}20` }}>
      {cat.icon} {cat.label}
    </span>
  );
}

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: ReportStatus }) {
  const meta = REPORT_STATUS_META[status];
  const icons = { open: Clock, investigating: RefreshCw, resolved: CheckCircle2, dismissed: XCircle };
  const Icon = icons[status];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{ fontSize: "0.48rem", color: meta.color, background: `${meta.color}10`, border: `1px solid ${meta.color}20` }}>
      <Icon size={9} /> {meta.label}
    </span>
  );
}

/* ─── Resolve modal ─── */
function ResolveModal({ report, mode, onConfirm, onClose }: {
  report: Report; mode: "resolve" | "dismiss"; onConfirm: (comment: string) => void; onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const isResolve = mode === "resolve";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,15,0.9)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md border border-white/8 bg-[#0d0d15] p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}>
        <div>
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>
            {isResolve ? "Закрыть жалобу" : "Отклонить жалобу"}
          </h3>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.68rem" }}>
            {report.subject}
          </p>
        </div>
        <div>
          <label className="block font-['Oswald'] text-white/25 uppercase tracking-wider mb-1.5" style={{ fontSize: "0.6rem" }}>
            Комментарий администратора (необязательно)
          </label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
            placeholder={isResolve ? "Что было предпринято..." : "Причина отклонения..."}
            className="w-full bg-[#0a0a10] border border-white/[0.07] focus:border-[#9b2335]/30 text-white/70 font-['Oswald'] tracking-wide px-3 py-2 outline-none resize-none"
            style={{ fontSize: "0.78rem" }} />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/8 text-white/30 font-['Oswald'] uppercase tracking-wider hover:text-white/50 transition-colors" style={{ fontSize: "0.68rem" }}>
            Отмена
          </button>
          <button onClick={() => onConfirm(comment)}
            className="flex-1 py-2.5 font-['Oswald'] uppercase tracking-wider transition-all"
            style={{ fontSize: "0.68rem", background: isResolve ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)", border: `1px solid ${isResolve ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.25)"}`, color: isResolve ? "#22c55e" : "#6b7280" }}>
            {isResolve ? "✓ Закрыть" : "— Отклонить"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Report card (expanded) ─── */
function ReportCard({ report, staffName, onResolve, onDismiss, onInvestigate, onDelete }: {
  report: Report; staffName: string;
  onResolve: () => void; onDismiss: () => void; onInvestigate: () => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAnon, setShowAnon] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      className={`border transition-all duration-200 ${report.status === "open" ? "border-[#f59e0b]/15 bg-[#f59e0b]/02" : report.status === "investigating" ? "border-[#38bdf8]/10 bg-[#38bdf8]/01" : "border-white/[0.04] opacity-60"}`}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Category icon */}
        <div className="w-9 h-9 shrink-0 flex items-center justify-center text-base border border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          {REPORT_CATEGORIES.find((c) => c.id === report.category)?.icon ?? "🚨"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-['Oswald'] text-white/70 tracking-wide" style={{ fontSize: "0.88rem" }}>{report.subject}</span>
            <StatusBadge status={report.status} />
            <CatBadge category={report.category} />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-['Oswald'] text-white/25 tracking-wide flex items-center gap-1" style={{ fontSize: "0.62rem" }}>
              <User size={10} /> На: <span className="text-white/45 ml-0.5">{report.targetName}</span>
            </span>
            <span className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.62rem" }}>
              От:{" "}
              {report.anonymous ? (
                <button onClick={() => setShowAnon((v) => !v)} className="ml-0.5 flex items-center gap-0.5 hover:text-white/40 transition-colors">
                  {showAnon ? <><Eye size={9} /> {report.reporterName}</> : <><EyeOff size={9} /> Аноним (показать)</>}
                </button>
              ) : (
                <span className="text-white/40 ml-0.5">{report.reporterName}</span>
              )}
            </span>
            <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.58rem" }}>
              {formatDate(report.submittedAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {report.status === "open" && (
            <button onClick={onInvestigate}
              className="px-2 py-1.5 font-['Oswald'] uppercase tracking-wider border border-[#38bdf8]/20 text-[#38bdf8]/50 hover:border-[#38bdf8]/35 hover:text-[#38bdf8]/70 transition-all"
              style={{ fontSize: "0.52rem" }}>
              В работу
            </button>
          )}
          {(report.status === "open" || report.status === "investigating") && (
            <>
              <button onClick={onResolve}
                className="px-2 py-1.5 font-['Oswald'] uppercase tracking-wider border border-[#22c55e]/20 text-[#22c55e]/50 hover:border-[#22c55e]/35 hover:text-[#22c55e]/70 transition-all"
                style={{ fontSize: "0.52rem" }}>
                Закрыть
              </button>
              <button onClick={onDismiss}
                className="px-2 py-1.5 font-['Oswald'] uppercase tracking-wider border border-white/8 text-white/20 hover:border-white/15 hover:text-white/40 transition-all"
                style={{ fontSize: "0.52rem" }}>
                Откл.
              </button>
            </>
          )}
          <button onClick={() => setExpanded((v) => !v)}
            className="p-2 text-white/15 hover:text-white/40 transition-colors border border-white/[0.06]">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button onClick={onDelete}
            className="p-2 text-white/15 hover:text-[#ff3366]/60 transition-colors border border-white/[0.06]">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] space-y-3">
              {/* Description */}
              <div>
                <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-1.5" style={{ fontSize: "0.55rem" }}>Описание</p>
                <p className="font-['Oswald'] text-white/50 tracking-wide" style={{ fontSize: "0.78rem", lineHeight: 1.7 }}>
                  {report.description}
                </p>
              </div>

              {/* Evidence */}
              {report.evidence && (
                <div>
                  <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-1.5" style={{ fontSize: "0.55rem" }}>Доказательства</p>
                  <p className="font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.72rem" }}>{report.evidence}</p>
                </div>
              )}

              {/* Admin comment */}
              {report.adminComment && (
                <div className="border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-1" style={{ fontSize: "0.55rem" }}>
                    <Shield size={9} className="inline mr-1" />Решение администрации
                  </p>
                  <p className="font-['Oswald'] text-white/50 tracking-wide" style={{ fontSize: "0.75rem" }}>{report.adminComment}</p>
                  {report.resolvedBy && (
                    <p className="font-['Oswald'] text-white/20 tracking-wide mt-1" style={{ fontSize: "0.58rem" }}>
                      {report.resolvedBy} · {report.resolvedAt ? formatDate(report.resolvedAt) : ""}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   MAIN TAB
   ════════════════════════════════════════════════ */

interface Props { staffName?: string; }

export function ReportsTab({ staffName = "Admin" }: Props) {
  const { reports, openCount, resolveReport, dismissReport, setInvestigating, deleteReport } = useReports();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [catFilter, setCatFilter] = useState<ReportCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [resolveTarget, setResolveTarget] = useState<{ report: Report; mode: "resolve" | "dismiss" } | null>(null);

  const filtered = reports.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (catFilter !== "all" && r.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.subject.toLowerCase().includes(q) && !r.targetName.toLowerCase().includes(q) && !r.reporterName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    open: reports.filter((r) => r.status === "open").length,
    investigating: reports.filter((r) => r.status === "investigating").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.4rem" }}>Жалобы</h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Внутренние репорты участников семьи
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Открыты",   value: stats.open,          color: "#f59e0b" },
          { label: "В работе",  value: stats.investigating,  color: "#38bdf8" },
          { label: "Решены",    value: stats.resolved,       color: "#22c55e" },
          { label: "Отклонены", value: stats.dismissed,      color: "#6b7280" },
        ].map((s) => (
          <div key={s.label} className="border border-white/5 bg-white/[0.01] p-3 flex items-center gap-3">
            <span className="font-['Russo_One']" style={{ fontSize: "1.5rem", color: s.color }}>{s.value}</span>
            <span className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Open alert */}
      {openCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 border border-[#f59e0b]/15 bg-[#f59e0b]/03 mb-5">
          <AlertTriangle size={14} className="text-[#f59e0b]/60 shrink-0" />
          <p className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.78rem", color: "rgba(245,158,11,0.7)" }}>
            {openCount} жалоб ждут рассмотрения
          </p>
          <button onClick={() => setStatusFilter("open")}
            className="ml-auto font-['Oswald'] uppercase tracking-wider px-3 py-1 border border-[#f59e0b]/20 text-[#f59e0b]/60 hover:border-[#f59e0b]/35 transition-colors"
            style={{ fontSize: "0.6rem", whiteSpace: "nowrap" }}>
            Показать
          </button>
        </motion.div>
      )}

      {/* Status tabs */}
      <div className="flex items-center gap-0 border-b border-white/5 mb-4">
        {([
          { id: "all", label: `Все (${reports.length})` },
          { id: "open", label: `Открытые (${stats.open})`, color: "#f59e0b" },
          { id: "investigating", label: `В работе (${stats.investigating})`, color: "#38bdf8" },
          { id: "resolved", label: `Решены (${stats.resolved})`, color: "#22c55e" },
          { id: "dismissed", label: `Отклонены (${stats.dismissed})`, color: "#6b7280" },
        ] as { id: ReportStatus | "all"; label: string; color?: string }[]).map((tab) => (
          <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-2.5 border-b-2 font-['Oswald'] uppercase tracking-wider transition-all duration-200 ${statusFilter === tab.id ? "border-[#9b2335]" : "border-transparent text-white/20 hover:text-white/40"}`}
            style={{ fontSize: "0.6rem", marginBottom: "-1px", color: statusFilter === tab.id ? (tab.color ?? "#9b2335") : undefined }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по теме, нику..." className={`${ic} pl-8`} style={{ fontSize: "0.78rem" }} />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 flex-wrap shrink-0">
          <Filter size={11} className="text-white/15" />
          <button onClick={() => setCatFilter("all")}
            className="px-2.5 py-1 font-['Oswald'] uppercase tracking-wider border transition-all"
            style={{ fontSize: "0.56rem", color: catFilter === "all" ? "#9b2335" : "rgba(255,255,255,0.2)", borderColor: catFilter === "all" ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)", background: catFilter === "all" ? "rgba(155,35,53,0.05)" : "transparent" }}>
            Все
          </button>
          {REPORT_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCatFilter(c.id)}
              className="px-2.5 py-1 font-['Oswald'] uppercase tracking-wider border transition-all"
              style={{ fontSize: "0.56rem", color: catFilter === c.id ? c.color : "rgba(255,255,255,0.2)", borderColor: catFilter === c.id ? `${c.color}30` : "rgba(255,255,255,0.06)", background: catFilter === c.id ? `${c.color}06` : "transparent" }}>
              {c.icon}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="border border-white/5 py-16 text-center">
          <MessageSquare size={32} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.8rem" }}>
            {statusFilter === "open" ? "Нет открытых жалоб" : "Нет жалоб"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} staffName={staffName}
              onResolve={() => setResolveTarget({ report: r, mode: "resolve" })}
              onDismiss={() => setResolveTarget({ report: r, mode: "dismiss" })}
              onInvestigate={() => setInvestigating(r.id)}
              onDelete={() => deleteReport(r.id)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {resolveTarget && (
          <ResolveModal
            report={resolveTarget.report}
            mode={resolveTarget.mode}
            onConfirm={(comment) => {
              if (resolveTarget.mode === "resolve") resolveReport(resolveTarget.report.id, staffName, comment);
              else dismissReport(resolveTarget.report.id, staffName, comment);
              setResolveTarget(null);
            }}
            onClose={() => setResolveTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
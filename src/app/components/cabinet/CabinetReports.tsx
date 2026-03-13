import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle, Plus, X, Send, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Eye, EyeOff, Shield,
} from "lucide-react";
import {
  submitReport, loadMyReports, REPORT_CATEGORIES, REPORT_STATUS_META,
  type Report, type ReportCategory,
} from "../../hooks/useReports";
import type { Account } from "../../hooks/useAuth";

const ic = "w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2.5 outline-none transition-colors placeholder-white/15";
const lc = "block font-['Oswald'] text-white/25 uppercase tracking-wider mb-1.5";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: Report["status"] }) {
  const meta = REPORT_STATUS_META[status];
  const icons = { open: "⏳", investigating: "🔍", resolved: "✅", dismissed: "—" };
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{ fontSize: "0.48rem", color: meta.color, background: `${meta.color}10`, border: `1px solid ${meta.color}20` }}>
      {icons[status]} {meta.label}
    </span>
  );
}

/* ─── Submit form ─── */
function SubmitForm({ account, onClose, onDone }: {
  account: Account; onClose: () => void; onDone: () => void;
}) {
  const [form, setForm] = useState({
    targetName: "",
    category: "behavior" as ReportCategory,
    subject: "",
    description: "",
    evidence: "",
    anonymous: false,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.targetName.trim() && form.subject.trim() && form.description.trim();

  // load members for target suggestions
  const members: { id: string; name: string }[] = (() => {
    try { const r = localStorage.getItem("schwarz_admin_members"); return r ? JSON.parse(r) : []; }
    catch { return []; }
  })();

  const handleSubmit = () => {
    if (!valid) return;
    setStatus("sending");
    try {
      const memberMatch = members.find((m) => m.name.toLowerCase() === form.targetName.toLowerCase().trim());
      submitReport({
        reporterAccountId: account.id,
        reporterName: account.username,
        targetMemberId: memberMatch?.id,
        targetName: form.targetName.trim(),
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
        evidence: form.evidence.trim() || undefined,
        anonymous: form.anonymous,
      });
      setStatus("done");
      setTimeout(() => { onDone(); onClose(); }, 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(10,10,15,0.9)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-lg border border-white/8 bg-[#0d0d15] my-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>Пожаловаться</h3>
            <p className="font-['Oswald'] text-white/25 tracking-wide mt-0.5" style={{ fontSize: "0.65rem" }}>
              Внутренний репорт — будет рассмотрен администрацией
            </p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors"><X size={18} /></button>
        </div>

        {status === "done" ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle2 size={36} className="text-green-500/60 mx-auto mb-4" strokeWidth={1} />
            <p className="font-['Russo_One'] text-white mb-2" style={{ fontSize: "0.95rem" }}>Жалоба отправлена!</p>
            <p className="font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.75rem" }}>
              Администраторы рассмотрят её в ближайшее время.
            </p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* Target */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>На кого жалоба *</label>
              <input value={form.targetName} onChange={(e) => set("targetName", e.target.value)}
                list="members-list" placeholder="Игровой ник участника"
                className={ic} style={{ fontSize: "0.85rem" }} />
              <datalist id="members-list">
                {members.map((m) => <option key={m.id} value={m.name} />)}
              </datalist>
            </div>

            {/* Category */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Причина жалобы</label>
              <div className="grid grid-cols-2 gap-1.5">
                {REPORT_CATEGORIES.map((c) => (
                  <button key={c.id} type="button" onClick={() => set("category", c.id)}
                    className="flex items-center gap-2 px-3 py-2 border font-['Oswald'] uppercase tracking-wider text-left transition-all"
                    style={{ fontSize: "0.58rem", color: form.category === c.id ? c.color : "rgba(255,255,255,0.25)", borderColor: form.category === c.id ? `${c.color}30` : "rgba(255,255,255,0.06)", background: form.category === c.id ? `${c.color}08` : "transparent" }}>
                    <span>{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Тема *</label>
              <input value={form.subject} onChange={(e) => set("subject", e.target.value)}
                placeholder="Кратко опиши суть проблемы" className={ic} style={{ fontSize: "0.82rem" }} />
            </div>

            {/* Description */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Описание ситуации *</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Расскажи подробно что произошло, когда и при каких обстоятельствах..." rows={4}
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/20 text-white/70 font-['Oswald'] tracking-wide px-3 py-2.5 outline-none resize-none"
                style={{ fontSize: "0.78rem", lineHeight: 1.7 }} />
            </div>

            {/* Evidence */}
            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Доказательства (необязательно)</label>
              <input value={form.evidence} onChange={(e) => set("evidence", e.target.value)}
                placeholder="Ссылка на скриншоты, видео или описание..." className={ic} style={{ fontSize: "0.78rem" }} />
            </div>

            {/* Anonymous toggle */}
            <button type="button" onClick={() => set("anonymous", !form.anonymous)}
              className={`flex items-center gap-3 w-full px-4 py-3 border transition-all ${form.anonymous ? "border-[#9b2335]/20 bg-[#9b2335]/04" : "border-white/[0.06]"}`}>
              <div className={`w-4 h-4 border flex items-center justify-center transition-all ${form.anonymous ? "border-[#9b2335] bg-[#9b2335]/15" : "border-white/15"}`}>
                {form.anonymous && <CheckCircle2 size={10} className="text-[#9b2335]" />}
              </div>
              <div className="text-left">
                <p className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.72rem", color: form.anonymous ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)" }}>
                  Анонимная жалоба
                </p>
                <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.6rem" }}>
                  {form.anonymous ? "Имя будет скрыто от публичного просмотра. Администраторы видят его." : "Твоё имя будет видно в жалобе."}
                </p>
              </div>
            </button>

            {/* Warn */}
            <div className="flex items-start gap-2 border border-[#f59e0b]/10 bg-[#f59e0b]/03 px-4 py-3">
              <AlertTriangle size={13} className="text-[#f59e0b]/40 mt-0.5 shrink-0" />
              <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem", lineHeight: 1.6 }}>
                Жалоба поступит администраторам и будет рассмотрена. Ложные обвинения могут повлечь последствия.
              </p>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!valid || status === "sending"}
              className="w-full py-3 flex items-center justify-center gap-2 font-['Oswald'] uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontSize: "0.72rem", background: "rgba(155,35,53,0.1)", border: "1px solid rgba(155,35,53,0.25)", color: "#9b2335" }}>
              {status === "sending" ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border border-[#9b2335]/30 border-t-[#9b2335] rounded-full" />
              ) : <Send size={14} />}
              {status === "sending" ? "Отправка..." : "Отправить жалобу"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════ */

interface Props { account: Account; }

export function CabinetReports({ account }: Props) {
  const [reports, setReports] = useState<Report[]>(() => loadMyReports(account.id));
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = () => setReports(loadMyReports(account.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1.1rem" }}>Мои жалобы</h3>
          <p className="font-['Oswald'] text-white/20 tracking-wide mt-0.5" style={{ fontSize: "0.65rem" }}>
            Внутренняя система — жалобы видны только администраторам
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 border transition-all"
          style={{ borderColor: "rgba(155,35,53,0.25)", background: "rgba(155,35,53,0.06)", color: "rgba(155,35,53,0.7)" }}>
          <Plus size={13} />
          <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.68rem" }}>Пожаловаться</span>
        </button>
      </div>

      {/* Info block */}
      <div className="border border-white/[0.05] p-4 flex items-start gap-3">
        <Shield size={14} className="text-white/20 shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="font-['Oswald'] text-white/35 tracking-wide" style={{ fontSize: "0.72rem" }}>
            Система жалоб — это внутренний инструмент семьи.
          </p>
          <p className="font-['Oswald'] text-white/20 tracking-wide mt-0.5" style={{ fontSize: "0.65rem", lineHeight: 1.7 }}>
            Если кто-то из участников ведёт себя неадекватно, нарушает правила или создаёт конфликты — ты можешь сообщить об этом администраторам через эту форму. Жалобы обрабатываются конфиденциально.
          </p>
        </div>
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <div className="border border-white/[0.04] py-12 text-center">
          <AlertTriangle size={28} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.78rem" }}>У тебя нет поданных жалоб</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 font-['Oswald'] text-[#9b2335]/40 hover:text-[#9b2335]/60 uppercase tracking-wider transition-colors"
            style={{ fontSize: "0.65rem" }}>
            + Подать жалобу
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => {
            const cat = REPORT_CATEGORIES.find((c) => c.id === r.category);
            const isExpanded = expandedId === r.id;
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="border border-white/[0.06] bg-white/[0.01]">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center text-base border border-white/[0.05]">
                    {cat?.icon ?? "🚨"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-['Oswald'] text-white/65 tracking-wide truncate" style={{ fontSize: "0.82rem" }}>{r.subject}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.6rem" }}>
                        На: <span className="text-white/40">{r.targetName}</span>
                      </span>
                      <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.58rem" }}>
                        {formatDate(r.submittedAt)}
                      </span>
                      {r.anonymous && (
                        <span className="flex items-center gap-1 font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.56rem" }}>
                          <EyeOff size={9} /> Аноним
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="p-2 text-white/15 hover:text-white/40 transition-colors border border-white/[0.05] shrink-0">
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] space-y-3">
                        <div>
                          <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-1" style={{ fontSize: "0.55rem" }}>Описание</p>
                          <p className="font-['Oswald'] text-white/45 tracking-wide" style={{ fontSize: "0.75rem", lineHeight: 1.7 }}>{r.description}</p>
                        </div>
                        {r.evidence && (
                          <div>
                            <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-1" style={{ fontSize: "0.55rem" }}>Доказательства</p>
                            <p className="font-['Oswald'] text-white/35 tracking-wide" style={{ fontSize: "0.72rem" }}>{r.evidence}</p>
                          </div>
                        )}
                        {r.adminComment && (
                          <div className="border border-white/[0.06] bg-white/[0.02] p-3">
                            <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ fontSize: "0.55rem" }}>
                              <Shield size={9} /> Решение администрации
                            </p>
                            <p className="font-['Oswald'] text-white/50 tracking-wide" style={{ fontSize: "0.75rem" }}>{r.adminComment}</p>
                            {r.resolvedBy && (
                              <p className="font-['Oswald'] text-white/20 tracking-wide mt-1" style={{ fontSize: "0.58rem" }}>
                                {r.resolvedBy} · {r.resolvedAt ? formatDate(r.resolvedAt) : ""}
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
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <SubmitForm account={account} onClose={() => setShowForm(false)} onDone={refresh} />
        )}
      </AnimatePresence>
    </div>
  );
}
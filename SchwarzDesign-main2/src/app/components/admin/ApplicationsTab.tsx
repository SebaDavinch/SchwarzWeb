import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  MessageCircle,
  Save,
  X,
  Filter,
  Gamepad2,
  Calendar,
  Hash,
  Download,
  Sun,
  Target,
  Users,
} from "lucide-react";
import { Application, useApplications } from "../../hooks/useAdminData";
import { notifyApplicationVerdict } from "../../hooks/useDiscordWebhook";

const statusConfig: Record<
  Application["status"],
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: { label: "Ожидает", color: "#f59e0b", icon: Clock },
  accepted: { label: "Принята", color: "#9b2335", icon: CheckCircle2 },
  rejected: { label: "Отклонена", color: "#ff3366", icon: XCircle },
};

const filters: { id: "all" | Application["status"]; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "pending", label: "Ожидают" },
  { id: "accepted", label: "Принятые" },
  { id: "rejected", label: "Отклонённые" },
];

/* ═══════════════════════════════════════════════
   DETAIL MODAL
   ═══════════════════════════════════════════════ */

function ApplicationDetail({
  app,
  onUpdate,
  onClose,
}: {
  app: Application;
  onUpdate: (id: string, updates: Partial<Application>) => void;
  onClose: () => void;
}) {
  const [comment, setComment] = useState(app.adminComment);
  const sc = statusConfig[app.status];

  const handleVerdict = (status: "accepted" | "rejected") => {
    onUpdate(app.id, {
      status,
      adminComment: comment,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "Admin",
    });
    notifyApplicationVerdict(app.nickname, status, "Admin");
  };

  const saveComment = () => {
    onUpdate(app.id, { adminComment: comment });
  };

  const infoRows = [
    { label: "Имя в игре", value: app.nickname, icon: User },
    { label: "Discord", value: app.discord, icon: MessageCircle },
    { label: "Возраст", value: app.age, icon: Hash },
    { label: "Праймтайм", value: app.primetime, icon: Sun },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-[#0d0d15] border border-white/8 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d15] border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: `${sc.color}10`,
                border: `1px solid ${sc.color}25`,
              }}
            >
              <User size={14} style={{ color: sc.color }} />
            </div>
            <div>
              <h3
                className="font-['Oswald'] text-white tracking-wide"
                style={{ fontSize: "1rem" }}
              >
                {app.nickname}
              </h3>
              <span
                className="font-['Oswald'] tracking-wider uppercase"
                style={{ fontSize: "0.55rem", color: sc.color }}
              >
                {sc.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/50 transition-colors p-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info grid */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {infoRows.map((row) => (
              <div key={row.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <row.icon size={10} className="text-white/15" />
                  <span
                    className="font-['Oswald'] text-white/20 uppercase tracking-wider"
                    style={{ fontSize: "0.55rem" }}
                  >
                    {row.label}
                  </span>
                </div>
                <span
                  className="font-['Oswald'] text-white/60 tracking-wide"
                  style={{ fontSize: "0.82rem" }}
                >
                  {row.value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Referral */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={10} className="text-white/15" />
            <span
              className="font-['Oswald'] text-white/20 uppercase tracking-wider"
              style={{ fontSize: "0.6rem" }}
            >
              Кто порекомендовал
            </span>
          </div>
          <p
            className="font-['Oswald'] text-white/45 tracking-wide"
            style={{ fontSize: "0.82rem", lineHeight: 1.8 }}
          >
            {app.referral || "Никто / самостоятельно"}
          </p>
        </div>

        {/* Expectations (new) */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={10} className="text-white/15" />
            <span
              className="font-['Oswald'] text-white/20 uppercase tracking-wider"
              style={{ fontSize: "0.6rem" }}
            >
              Что хочет от семьи
            </span>
          </div>
          <p
            className="font-['Oswald'] text-white/45 tracking-wide"
            style={{ fontSize: "0.82rem", lineHeight: 1.8 }}
          >
            {app.expectations || app.motivation || "Не указано"}
          </p>
        </div>

        {/* Legacy: experience (for old applications) */}
        {app.experience && (
          <div className="px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-1.5 mb-2">
              <Gamepad2 size={10} className="text-white/15" />
              <span
                className="font-['Oswald'] text-white/20 uppercase tracking-wider"
                style={{ fontSize: "0.6rem" }}
              >
                Опыт RP
              </span>
            </div>
            <p
              className="font-['Oswald'] text-white/45 tracking-wide"
              style={{ fontSize: "0.82rem", lineHeight: 1.8 }}
            >
              {app.experience}
            </p>
          </div>
        )}

        {/* Admin comment */}
        <div className="px-6 py-5 border-b border-white/5">
          <span
            className="font-['Oswald'] text-white/20 uppercase tracking-wider block mb-2"
            style={{ fontSize: "0.6rem" }}
          >
            Комментарий администрации
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Заметка по заявке..."
            className="w-full bg-[#0a0a12] border border-white/8 focus:border-[#9b2335]/20 text-white/60 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors resize-none"
            style={{ fontSize: "0.82rem", lineHeight: 1.7 }}
          />
          {comment !== app.adminComment && (
            <button
              onClick={saveComment}
              className="mt-2 px-4 py-1.5 font-['Oswald'] uppercase tracking-wider text-[#9b2335]/60 border border-[#9b2335]/15 hover:border-[#9b2335]/30 transition-all flex items-center gap-2"
              style={{ fontSize: "0.6rem" }}
            >
              <Save size={11} />
              Сохранить заметку
            </button>
          )}
        </div>

        {/* Reviewed info */}
        {app.reviewedAt && (
          <div className="px-6 py-3 border-b border-white/5 bg-white/[0.005]">
            <span
              className="font-['Oswald'] text-white/15 tracking-wide"
              style={{ fontSize: "0.65rem" }}
            >
              Рассмотрено:{" "}
              {new Date(app.reviewedAt).toLocaleDateString("ru-RU")} ·{" "}
              {app.reviewedBy}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-5 flex flex-wrap items-center gap-3">
          {app.status === "pending" ? (
            <>
              <button
                onClick={() => handleVerdict("accepted")}
                className="flex items-center gap-2 px-5 py-2.5 font-['Oswald'] uppercase tracking-wider text-[#0a0a0f] bg-[#9b2335] hover:bg-[#b52a40] transition-all"
                style={{ fontSize: "0.72rem" }}
              >
                <CheckCircle2 size={14} />
                Принять
              </button>
              <button
                onClick={() => handleVerdict("rejected")}
                className="flex items-center gap-2 px-5 py-2.5 font-['Oswald'] uppercase tracking-wider text-[#ff3366] border border-[#ff3366]/20 hover:border-[#ff3366]/40 hover:bg-[#ff3366]/5 transition-all"
                style={{ fontSize: "0.72rem" }}
              >
                <XCircle size={14} />
                Отклонить
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                onUpdate(app.id, {
                  status: "pending",
                  reviewedAt: null,
                  reviewedBy: null,
                })
              }
              className="flex items-center gap-2 px-5 py-2.5 font-['Oswald'] uppercase tracking-wider text-[#f59e0b] border border-[#f59e0b]/20 hover:border-[#f59e0b]/40 transition-all"
              style={{ fontSize: "0.72rem" }}
            >
              <Clock size={14} />
              Вернуть в ожидание
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN TAB
   ═══════════════════════════════════════════════ */

export function ApplicationsTab() {
  const { applications, updateApplication, deleteApplication, pendingCount } =
    useApplications();
  const [filter, setFilter] = useState<"all" | Application["status"]>("all");
  const [viewId, setViewId] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  const viewApp = applications.find((a) => a.id === viewId);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const exportCSV = () => {
    if (applications.length === 0) return;
    const headers = [
      "ID",
      "Имя в игре",
      "Discord",
      "Возраст",
      "Праймтайм",
      "Рекомендация",
      "Ожидания",
      "Статус",
      "Дата подачи",
      "Рассмотрено",
      "Комментарий",
    ];
    const rows = applications.map((a) => [
      a.id,
      a.nickname,
      a.discord,
      a.age,
      a.primetime || "",
      a.referral || "",
      `"${(a.expectations || a.motivation || "").replace(/"/g, '""')}"`,
      a.status,
      new Date(a.submittedAt).toLocaleDateString("ru-RU"),
      a.reviewedAt
        ? new Date(a.reviewedAt).toLocaleDateString("ru-RU")
        : "",
      `"${(a.adminComment || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schwarz_applications_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2
        className="font-['Russo_One']"
        style={{ fontSize: "1.3rem" }}
      >
        Заявки
      </h2>
      <p
        className="font-['Oswald'] text-white/20 tracking-wide mb-8"
        style={{ fontSize: "0.72rem" }}
      >
        Управление заявками на вступление в семью
      </p>

      {/* Export CSV */}
      {applications.length > 0 && (
        <div className="mb-6">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-[#9b2335]/20 hover:text-[#9b2335]/50 transition-all"
            style={{ fontSize: "0.6rem" }}
          >
            <Download size={12} />
            Экспорт CSV
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Всего заявок",
            value: counts.all,
            color: "#ffffff",
            icon: User,
          },
          {
            label: "Ожидают",
            value: counts.pending,
            color: "#f59e0b",
            icon: Clock,
          },
          {
            label: "Принятых",
            value: counts.accepted,
            color: "#9b2335",
            icon: CheckCircle2,
          },
          {
            label: "Отклонённых",
            value: counts.rejected,
            color: "#ff3366",
            icon: XCircle,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-white/5 bg-white/[0.01] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon
                size={14}
                style={{ color: s.color, opacity: 0.4 }}
                strokeWidth={1.5}
              />
              <span
                className="font-['Russo_One']"
                style={{
                  fontSize: "1.3rem",
                  color: s.color,
                  opacity: 0.7,
                  filter: `drop-shadow(0 0 8px ${s.color}22)`,
                }}
              >
                {s.value}
              </span>
            </div>
            <p
              className="font-['Oswald'] text-white/20 uppercase tracking-wider"
              style={{ fontSize: "0.58rem" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter size={12} className="text-white/15" />
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-300 ${
              filter === f.id
                ? "border-white/15 bg-white/[0.03] text-white/50"
                : "border-white/5 text-white/20 hover:border-white/10"
            }`}
            style={{ fontSize: "0.6rem" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.03] bg-white/[0.005]">
          <User size={28} className="text-white/8 mx-auto mb-4" />
          <p
            className="font-['Oswald'] text-white/15 tracking-wide"
            style={{ fontSize: "0.82rem" }}
          >
            {filter === "all"
              ? "Заявок пока нет"
              : "Нет заявок с таким статусом"}
          </p>
          <p
            className="font-['Oswald'] text-white/8 tracking-wide mt-1"
            style={{ fontSize: "0.7rem" }}
          >
            {filter === "all"
              ? "Заявки появятся здесь после отправки с публичной страницы"
              : "Попробуйте другой фильтр"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((app, i) => {
            const sc = statusConfig[app.status];
            const StatusIcon = sc.icon;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="flex items-center gap-4 p-4 border border-white/5 bg-white/[0.01] group hover:border-white/10 transition-all duration-300"
              >
                {/* Status indicator */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `${sc.color}08`,
                    border: `1px solid ${sc.color}18`,
                  }}
                >
                  <StatusIcon
                    size={14}
                    style={{ color: sc.color, opacity: 0.6 }}
                  />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="font-['Oswald'] text-white/60 tracking-wide"
                      style={{ fontSize: "0.88rem" }}
                    >
                      {app.nickname}
                    </span>
                    <span
                      className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider border"
                      style={{
                        fontSize: "0.48rem",
                        color: sc.color,
                        borderColor: `${sc.color}20`,
                        background: `${sc.color}05`,
                      }}
                    >
                      {sc.label}
                    </span>
                    {app.server && (
                      <span
                        className="font-['Oswald'] text-white/15 tracking-wide"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {app.server}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span
                      className="font-['Oswald'] text-white/15 tracking-wide"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {new Date(app.submittedAt).toLocaleDateString("ru-RU")}
                    </span>
                    {app.discord && (
                      <span className="flex items-center gap-1">
                        <MessageCircle size={9} className="text-white/10" />
                        <span
                          className="font-['Oswald'] text-white/15 tracking-wide"
                          style={{ fontSize: "0.62rem" }}
                        >
                          {app.discord}
                        </span>
                      </span>
                    )}
                    {app.primetime && (
                      <span className="flex items-center gap-1">
                        <Sun size={9} className="text-white/10" />
                        <span
                          className="font-['Oswald'] text-white/10 tracking-wide"
                          style={{ fontSize: "0.6rem" }}
                        >
                          {app.primetime}
                        </span>
                      </span>
                    )}
                    {app.adminComment && (
                      <MessageCircle
                        size={10}
                        className="text-white/15"
                        title="Есть комментарий"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {app.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          updateApplication(app.id, {
                            status: "accepted",
                            reviewedAt: new Date().toISOString(),
                            reviewedBy: "Admin",
                          });
                          notifyApplicationVerdict(
                            app.nickname,
                            "accepted",
                            "Admin"
                          );
                        }}
                        className="text-white/15 hover:text-[#9b2335]/60 p-1.5 transition-colors"
                        title="Принять"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          updateApplication(app.id, {
                            status: "rejected",
                            reviewedAt: new Date().toISOString(),
                            reviewedBy: "Admin",
                          });
                          notifyApplicationVerdict(
                            app.nickname,
                            "rejected",
                            "Admin"
                          );
                        }}
                        className="text-white/15 hover:text-[#ff3366]/60 p-1.5 transition-colors"
                        title="Отклонить"
                      >
                        <XCircle size={15} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setViewId(app.id)}
                    className="text-white/15 hover:text-white/50 p-1.5 transition-colors"
                    title="Подробнее"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Удалить заявку от ${app.nickname}?`)) {
                        deleteApplication(app.id);
                      }
                    }}
                    className="text-white/15 hover:text-[#ff3366]/60 p-1.5 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {viewApp && (
          <ApplicationDetail
            key={viewApp.id}
            app={viewApp}
            onUpdate={(id, upd) => {
              updateApplication(id, upd);
            }}
            onClose={() => setViewId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
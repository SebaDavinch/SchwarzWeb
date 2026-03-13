import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, Edit3, Save, X, Star, ChevronUp, ChevronDown,
  Eye, EyeOff, CheckCircle2, XCircle, Clock, Play, Image as ImageIcon,
  Youtube, Twitch, RefreshCw, Filter, AlertTriangle, User, Calendar,
  Shield, MessageSquare,
} from "lucide-react";
import { addAuditLog } from "../../hooks/useAdminData";
import {
  useMoments, detectMediaType, getYouTubeThumbnail, getTwitchClipSlug,
  MOMENT_CATEGORIES,
  type Moment, type MomentCategory, type MomentMediaType, type MomentStatus,
} from "../../hooks/useMoments";

/* ─── re-export for MomentsPage compatibility ─── */
export { loadMoments, saveMoments, MOMENT_CATEGORIES } from "../../hooks/useMoments";
export type { Moment, MomentCategory } from "../../hooks/useMoments";

/* ─── Media type meta ─── */
const MEDIA_TYPES: { id: MomentMediaType; label: string; icon: typeof ImageIcon; color: string }[] = [
  { id: "photo",   label: "Фото",         icon: ImageIcon, color: "#9b2335" },
  { id: "youtube", label: "YouTube",       icon: Youtube,   color: "#ff0000" },
  { id: "twitch",  label: "Twitch клип",  icon: Twitch,    color: "#9146ff" },
  { id: "video",   label: "Видео (URL)",  icon: Play,      color: "#f59e0b" },
];

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: MomentStatus }) {
  const cfg = {
    approved: { color: "#22c55e", label: "Одобрен", icon: CheckCircle2 },
    pending:  { color: "#f59e0b", label: "На модерации", icon: Clock },
    rejected: { color: "#ff3366", label: "Отклонён", icon: XCircle },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{ fontSize: "0.5rem", color: cfg.color, background: `${cfg.color}10`, border: `1px solid ${cfg.color}25` }}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

/* ─── Category badge ─── */
function CatBadge({ category }: { category: MomentCategory }) {
  const cat = MOMENT_CATEGORIES.find((c) => c.id === category);
  if (!cat) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{ fontSize: "0.5rem", color: cat.color, background: `${cat.color}12`, border: `1px solid ${cat.color}25` }}>
      {cat.emoji} {cat.label}
    </span>
  );
}

/* ─── MediaType badge ─── */
function MediaBadge({ type }: { type: MomentMediaType }) {
  const mt = MEDIA_TYPES.find((t) => t.id === type);
  if (!mt) return null;
  const Icon = mt.icon;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{ fontSize: "0.5rem", color: mt.color, background: `${mt.color}10`, border: `1px solid ${mt.color}20` }}>
      <Icon size={9} />
      {mt.label}
    </span>
  );
}

/* ─── Reject modal ─── */
function RejectModal({ onConfirm, onClose }: { onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,15,0.9)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-full max-w-sm border border-white/8 bg-[#0d0d15] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "0.95rem" }}>Отклонить момент</h3>
        <div>
          <label className="block font-['Oswald'] text-white/25 uppercase tracking-wider mb-2" style={{ fontSize: "0.6rem" }}>Причина отказа</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="Укажи причину..."
            className="w-full bg-[#0a0a10] border border-white/8 focus:border-[#ff3366]/25 text-white/70 font-['Oswald'] tracking-wide px-3 py-2 outline-none resize-none"
            style={{ fontSize: "0.8rem" }} />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-white/8 text-white/30 hover:text-white/50 font-['Oswald'] uppercase tracking-wider transition-colors" style={{ fontSize: "0.65rem" }}>
            Отмена
          </button>
          <button onClick={() => onConfirm(reason)} className="flex-1 py-2 font-['Oswald'] uppercase tracking-wider transition-all" style={{ fontSize: "0.65rem", background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.25)", color: "#ff3366" }}>
            Отклонить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Form ─── */
interface MomentForm {
  title: string;
  description: string;
  url: string;
  videoUrl: string;
  mediaType: MomentMediaType;
  category: MomentCategory;
  date: string;
  author: string;
  featured: boolean;
  visible: boolean;
}

const emptyForm: MomentForm = {
  title: "", description: "", url: "", videoUrl: "",
  mediaType: "photo", category: "other",
  date: new Date().toISOString().split("T")[0],
  author: "", featured: false, visible: true,
};

function resolveAutoThumb(form: MomentForm): string {
  if (form.mediaType === "youtube" && form.videoUrl) return getYouTubeThumbnail(form.videoUrl);
  return form.url;
}

/* ─── Form panel ─── */
function MomentFormPanel({
  form, setForm, editId, onSave, onCancel,
}: {
  form: MomentForm;
  setForm: (f: MomentForm) => void;
  editId: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const ic = "w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors";
  const lc = "block font-['Oswald'] text-white/25 uppercase tracking-wider mb-1.5";

  const handleVideoUrlChange = (url: string) => {
    const mtype = detectMediaType(url);
    const thumb = mtype === "youtube" ? getYouTubeThumbnail(url) : form.url;
    setForm({ ...form, videoUrl: url, mediaType: url ? mtype : "photo", url: thumb || form.url });
  };

  const thumbUrl = resolveAutoThumb(form);

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
      <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
        <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.72rem" }}>
          {editId ? "Редактировать момент" : "Новый момент"}
        </h3>

        {/* Media type selector */}
        <div className="mb-5">
          <label className={lc} style={{ fontSize: "0.58rem" }}>Тип контента</label>
          <div className="flex gap-2 flex-wrap">
            {MEDIA_TYPES.map((mt) => {
              const Icon = mt.icon;
              const active = form.mediaType === mt.id;
              return (
                <button key={mt.id} onClick={() => setForm({ ...form, mediaType: mt.id, videoUrl: mt.id === "photo" ? "" : form.videoUrl })}
                  className="flex items-center gap-2 px-3 py-2 border transition-all duration-200"
                  style={{ fontSize: "0.62rem", color: active ? mt.color : "rgba(255,255,255,0.25)", borderColor: active ? `${mt.color}35` : "rgba(255,255,255,0.06)", background: active ? `${mt.color}08` : "transparent" }}>
                  <Icon size={13} />
                  <span className="font-['Oswald'] uppercase tracking-wider">{mt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className={lc} style={{ fontSize: "0.58rem" }}>Заголовок *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Название момента..." className={ic} style={{ fontSize: "0.85rem" }} />
          </div>

          {/* Video URL (if not photo) */}
          {form.mediaType !== "photo" && (
            <div className="md:col-span-2">
              <label className={lc} style={{ fontSize: "0.58rem" }}>
                {form.mediaType === "youtube" ? "YouTube URL" : form.mediaType === "twitch" ? "Twitch clip URL" : "Video URL"}
              </label>
              <input value={form.videoUrl} onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder={
                  form.mediaType === "youtube" ? "https://youtube.com/watch?v=..." :
                  form.mediaType === "twitch" ? "https://twitch.tv/xxx/clip/..." :
                  "https://..."
                }
                className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9146ff]/25 text-white/70 font-mono px-3 py-2 outline-none"
                style={{ fontSize: "0.75rem" }} />
              {form.mediaType === "youtube" && form.videoUrl && (
                <p className="mt-1 font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.6rem" }}>
                  🖼 Превью YouTube загружается автоматически
                </p>
              )}
              {form.mediaType === "twitch" && form.videoUrl && (() => {
                const slug = getTwitchClipSlug(form.videoUrl);
                return slug ? (
                  <p className="mt-1 font-['Oswald'] text-[#9146ff]/40 tracking-wide" style={{ fontSize: "0.6rem" }}>✓ Клип: {slug}</p>
                ) : (
                  <p className="mt-1 font-['Oswald'] text-[#ff3366]/40 tracking-wide" style={{ fontSize: "0.6rem" }}>⚠ Не удалось распознать URL клипа</p>
                );
              })()}
            </div>
          )}

          {/* Image URL */}
          <div className="md:col-span-2">
            <label className={lc} style={{ fontSize: "0.58rem" }}>
              {form.mediaType === "photo" ? "URL изображения *" : "URL обложки (необязательно, для YouTube автоматически)"}
            </label>
            <div className="flex gap-2">
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://i.imgur.com/..."
                className="flex-1 bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/25 text-white/50 font-mono px-3 py-2 outline-none"
                style={{ fontSize: "0.75rem" }} />
              {thumbUrl && (
                <div className="w-12 h-9 overflow-hidden border border-white/8 shrink-0">
                  <img src={thumbUrl} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={lc} style={{ fontSize: "0.58rem" }}>Категория</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MomentCategory })}
              className={ic} style={{ fontSize: "0.82rem", colorScheme: "dark" }}>
              {MOMENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={lc} style={{ fontSize: "0.58rem" }}>Дата</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={ic} style={{ fontSize: "0.82rem", colorScheme: "dark" }} />
          </div>

          {/* Author */}
          <div className="md:col-span-2">
            <label className={lc} style={{ fontSize: "0.58rem" }}>Автор</label>
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Имя Schwarz" className={ic} style={{ fontSize: "0.82rem" }} />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-5">
            <button onClick={() => setForm({ ...form, featured: !form.featured })} className="flex items-center gap-2 transition-colors">
              <Star size={15} style={{ color: form.featured ? "#f59e0b" : "rgba(255,255,255,0.15)", fill: form.featured ? "#f59e0b" : "none" }} />
              <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.6rem", color: form.featured ? "#f59e0b" : "rgba(255,255,255,0.2)" }}>Избранное</span>
            </button>
            <button onClick={() => setForm({ ...form, visible: !form.visible })} className="flex items-center gap-2 transition-colors">
              {form.visible ? <Eye size={15} className="text-[#9b2335]/60" /> : <EyeOff size={15} className="text-white/15" />}
              <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.6rem", color: form.visible ? "rgba(155,35,53,0.6)" : "rgba(255,255,255,0.2)" }}>
                {form.visible ? "Видимый" : "Скрыт"}
              </span>
            </button>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className={lc} style={{ fontSize: "0.58rem" }}>Описание</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Краткое описание момента..." rows={2}
              className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/20 text-white/50 font-['Oswald'] tracking-wide px-3 py-2 outline-none resize-none"
              style={{ fontSize: "0.78rem" }} />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onSave}
            disabled={!form.title.trim() || (form.mediaType === "photo" && !form.url.trim())}
            className="flex items-center gap-2 px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontSize: "0.72rem" }}>
            <Save size={14} /> {editId ? "Сохранить" : "Добавить"}
          </button>
          <button onClick={onCancel}
            className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
            style={{ fontSize: "0.72rem" }}>
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Row ─── */
function MomentRow({
  moment, index, total, onEdit, onDelete, onApprove, onReject, onMove, onToggleFeatured, onToggleVisible,
  canEdit, canApprove, canDelete,
}: {
  moment: Moment; index: number; total: number;
  onEdit: () => void; onDelete: () => void;
  onApprove: () => void; onReject: () => void;
  onMove: (dir: -1 | 1) => void;
  onToggleFeatured: () => void; onToggleVisible: () => void;
  canEdit: boolean; canApprove: boolean; canDelete: boolean;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const thumbUrl = moment.mediaType === "youtube" && moment.videoUrl
    ? getYouTubeThumbnail(moment.videoUrl)
    : moment.url;

  return (
    <>
      <motion.div layout
        className={`flex items-center gap-3 p-3 border transition-all duration-300 group ${
          moment.visible ? "border-white/5 bg-white/[0.01]" : "border-white/[0.03] bg-white/[0.005] opacity-50"
        } ${moment.status === "pending" ? "border-l-2 border-l-[#f59e0b]/40" : ""}`}>
        {/* Thumbnail */}
        <div className="w-14 h-10 shrink-0 overflow-hidden border border-white/8 relative">
          {thumbUrl ? (
            <img src={thumbUrl} alt={moment.title} className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/3">
              <ImageIcon size={14} className="text-white/15" />
            </div>
          )}
          {moment.mediaType !== "photo" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              {moment.mediaType === "youtube" && <Youtube size={10} className="text-red-400/80" />}
              {moment.mediaType === "twitch" && <Twitch size={10} className="text-purple-400/80" />}
              {moment.mediaType === "video" && <Play size={10} className="text-white/60" />}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="font-['Oswald'] text-white/65 tracking-wide truncate" style={{ fontSize: "0.82rem" }}>
              {moment.title}
            </span>
            {moment.featured && <Star size={10} className="text-[#f59e0b] shrink-0" fill="#f59e0b" />}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={moment.status} />
            <CatBadge category={moment.category} />
            <MediaBadge type={moment.mediaType} />
            <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.58rem" }}>
              {moment.author} · {moment.date}
            </span>
            {moment.status === "rejected" && moment.rejectionReason && (
              <span className="font-['Oswald'] text-[#ff3366]/35 tracking-wide" style={{ fontSize: "0.55rem" }}>
                · «{moment.rejectionReason.slice(0, 40)}»
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
          {/* Move */}
          <button onClick={() => onMove(-1)} disabled={index === 0}
            className="p-1.5 text-white/15 hover:text-white/40 disabled:opacity-20 transition-colors" title="Вверх">
            <ChevronUp size={13} />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            className="p-1.5 text-white/15 hover:text-white/40 disabled:opacity-20 transition-colors" title="Вниз">
            <ChevronDown size={13} />
          </button>

          {/* Approve / Reject */}
          {canApprove && moment.status !== "approved" && (
            <button onClick={onApprove}
              className="p-1.5 text-white/15 hover:text-green-500/60 transition-colors" title="Одобрить">
              <CheckCircle2 size={13} />
            </button>
          )}
          {canApprove && moment.status !== "rejected" && (
            <button onClick={() => setRejectOpen(true)}
              className="p-1.5 text-white/15 hover:text-[#ff3366]/60 transition-colors" title="Отклонить">
              <XCircle size={13} />
            </button>
          )}

          {/* Featured */}
          {canEdit && (
            <button onClick={onToggleFeatured} className="p-1.5 transition-colors"
              title={moment.featured ? "Убрать избранное" : "В избранное"}
              style={{ color: moment.featured ? "#f59e0b" : "rgba(255,255,255,0.15)" }}>
              <Star size={13} fill={moment.featured ? "#f59e0b" : "none"} />
            </button>
          )}

          {/* Visible */}
          {canEdit && (
            <button onClick={onToggleVisible} className="p-1.5 transition-colors"
              title={moment.visible ? "Скрыть" : "Показать"}
              style={{ color: moment.visible ? "rgba(155,35,53,0.5)" : "rgba(255,255,255,0.15)" }}>
              {moment.visible ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
          )}

          {/* Edit */}
          {canEdit && (
            <button onClick={onEdit} className="p-1.5 text-white/15 hover:text-[#f59e0b]/60 transition-colors" title="Редактировать">
              <Edit3 size={13} />
            </button>
          )}

          {/* Delete */}
          {canDelete && (
            <button onClick={onDelete} className="p-1.5 text-white/15 hover:text-[#ff3366]/60 transition-colors" title="Удалить">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {rejectOpen && (
          <RejectModal
            onConfirm={(reason) => { setRejectOpen(false); onReject(); /* reason passed via wrapper */ }}
            onClose={() => setRejectOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

type SubFilter = "all" | "pending" | "approved" | "rejected";

interface Props {
  /** Admin name for audit / review records */
  staffName?: string;
  /** Permission flags */
  canEdit?: boolean;
  canApprove?: boolean;
  canDelete?: boolean;
}

export function MomentsTab({ staffName = "Admin", canEdit = true, canApprove = true, canDelete = true }: Props) {
  const {
    moments, pendingCount,
    addMoment, updateMoment, deleteMoment, approveMoment, rejectMoment,
    reorderMoment, toggleFeatured, toggleVisible,
  } = useMoments();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MomentForm>(emptyForm);
  const [catFilter, setCatFilter] = useState<MomentCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SubFilter>("all");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const filtered = moments.filter((m) => {
    if (catFilter !== "all" && m.category !== catFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    return true;
  });

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (m: Moment) => {
    setEditId(m.id);
    setForm({ title: m.title, description: m.description ?? "", url: m.url, videoUrl: m.videoUrl ?? "",
      mediaType: m.mediaType, category: m.category, date: m.date, author: m.author,
      featured: m.featured, visible: m.visible });
    setShowForm(true);
  };

  const handleSave = () => {
    const thumbUrl = form.mediaType === "youtube" && form.videoUrl ? getYouTubeThumbnail(form.videoUrl) : form.url;
    const data = { ...form, url: thumbUrl || form.url, description: form.description || undefined, videoUrl: form.videoUrl || undefined };

    if (editId) {
      updateMoment(editId, data);
      addAuditLog("Момент отредактирован", "media", form.title, staffName);
    } else {
      addMoment({ ...data, status: "approved", authorAccountId: undefined });
      addAuditLog("Добавлен момент", "media", form.title, staffName);
    }
    setShowForm(false); setEditId(null);
  };

  const handleDelete = (id: string) => {
    const m = moments.find((x) => x.id === id);
    deleteMoment(id);
    if (m) addAuditLog("Момент удалён", "media", m.title, staffName);
  };

  const handleApprove = (id: string) => {
    approveMoment(id, staffName);
    addAuditLog("Момент одобрен", "media", moments.find((m) => m.id === id)?.title ?? id, staffName);
  };

  const handleRejectConfirm = (id: string, reason: string) => {
    rejectMoment(id, staffName, reason);
    addAuditLog("Момент отклонён", "media", moments.find((m) => m.id === id)?.title ?? id, staffName);
    setRejectTarget(null);
  };

  const stats = {
    total: moments.length,
    approved: moments.filter((m) => m.status === "approved").length,
    pending: pendingCount,
    rejected: moments.filter((m) => m.status === "rejected").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.4rem" }}>Лучшие Моменты</h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Фото · YouTube · Twitch · Модерация контента
          </p>
        </div>
        {canEdit && (
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
            style={{ fontSize: "0.72rem" }}>
            <Plus size={14} /> Добавить момент
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Всего", value: stats.total, color: "#9b2335" },
          { label: "Одобрено", value: stats.approved, color: "#22c55e" },
          { label: "На модерации", value: stats.pending, color: "#f59e0b" },
          { label: "Отклонено", value: stats.rejected, color: "#ff3366" },
        ].map((s) => (
          <div key={s.label} className="border border-white/5 bg-white/[0.01] p-3 flex items-center gap-3">
            <span className="font-['Russo_One']" style={{ fontSize: "1.5rem", color: s.color }}>{s.value}</span>
            <span className="font-['Oswald'] text-white/25 uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && canApprove && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 border border-[#f59e0b]/20 bg-[#f59e0b]/04 mb-5">
          <AlertTriangle size={15} className="text-[#f59e0b]/60 shrink-0" />
          <p className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.78rem", color: "rgba(245,158,11,0.7)" }}>
            {pendingCount} момент{pendingCount > 1 ? "а" : ""} ожидает модерации
          </p>
          <button onClick={() => setStatusFilter("pending")}
            className="ml-auto font-['Oswald'] uppercase tracking-wider px-3 py-1 border border-[#f59e0b]/20 text-[#f59e0b]/60 hover:border-[#f59e0b]/40 transition-colors"
            style={{ fontSize: "0.6rem", whiteSpace: "nowrap" }}>
            Показать
          </button>
        </motion.div>
      )}

      {/* Status filter tabs */}
      <div className="flex items-center gap-0 border-b border-white/5 mb-4">
        {([
          { id: "all", label: `Все (${stats.total})` },
          { id: "pending", label: `Модерация (${stats.pending})`, color: "#f59e0b" },
          { id: "approved", label: `Одобрены (${stats.approved})`, color: "#22c55e" },
          { id: "rejected", label: `Отклонены (${stats.rejected})`, color: "#ff3366" },
        ] as { id: SubFilter; label: string; color?: string }[]).map((tab) => (
          <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2.5 border-b-2 font-['Oswald'] uppercase tracking-wider transition-all duration-200 ${statusFilter === tab.id ? "border-[#9b2335]" : "border-transparent text-white/20 hover:text-white/40"}`}
            style={{ fontSize: "0.62rem", marginBottom: "-1px", color: statusFilter === tab.id ? (tab.color ?? "#9b2335") : undefined }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        <Filter size={12} className="text-white/15 shrink-0" />
        <button onClick={() => setCatFilter("all")}
          className="px-2.5 py-1 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
          style={{ fontSize: "0.58rem", color: catFilter === "all" ? "#9b2335" : "rgba(255,255,255,0.2)", borderColor: catFilter === "all" ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)", background: catFilter === "all" ? "rgba(155,35,53,0.05)" : "transparent" }}>
          Все
        </button>
        {MOMENT_CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCatFilter(cat.id)}
            className="px-2.5 py-1 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
            style={{ fontSize: "0.58rem", color: catFilter === cat.id ? cat.color : "rgba(255,255,255,0.2)", borderColor: catFilter === cat.id ? `${cat.color}30` : "rgba(255,255,255,0.06)", background: catFilter === cat.id ? `${cat.color}06` : "transparent" }}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <MomentFormPanel form={form} setForm={setForm} editId={editId}
            onSave={handleSave} onCancel={() => { setShowForm(false); setEditId(null); }} />
        )}
      </AnimatePresence>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.03]">
          <ImageIcon size={36} className="text-white/8 mx-auto mb-4" />
          <p className="font-['Oswald'] text-white/15 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
            {statusFilter === "pending" ? "Нет моментов на модерации" : "Нет моментов"}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((m, i) => (
            <MomentRow key={m.id} moment={m} index={i} total={filtered.length}
              onEdit={() => openEdit(m)}
              onDelete={() => handleDelete(m.id)}
              onApprove={() => handleApprove(m.id)}
              onReject={() => setRejectTarget(m.id)}
              onMove={(dir) => reorderMoment(m.id, dir)}
              onToggleFeatured={() => toggleFeatured(m.id)}
              onToggleVisible={() => toggleVisible(m.id)}
              canEdit={canEdit} canApprove={canApprove} canDelete={canDelete}
            />
          ))}
        </div>
      )}

      <p className="font-['Oswald'] text-white/10 tracking-wide mt-6 text-right" style={{ fontSize: "0.62rem" }}>
        Всего: {moments.length} · Видимых: {moments.filter((m) => m.visible).length} · Избранных: {moments.filter((m) => m.featured).length}
      </p>

      {/* Reject confirm modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            onConfirm={(reason) => handleRejectConfirm(rejectTarget, reason)}
            onClose={() => setRejectTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

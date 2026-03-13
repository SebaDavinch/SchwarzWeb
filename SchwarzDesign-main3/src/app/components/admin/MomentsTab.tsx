import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Star,
  Image as ImageIcon,
  Video,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { notifyMomentAdded } from "../../hooks/useDiscordWebhook";
import { addAuditLog } from "../../hooks/useAdminData";

/* ─── Types ─── */
export interface Moment {
  id: string;
  title: string;
  description?: string;
  url: string;          // image URL (thumbnail for video)
  videoUrl?: string;    // YouTube / Twitch embed URL
  type: "photo" | "video";
  category: MomentCategory;
  date: string;
  author: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

export type MomentCategory =
  | "all"
  | "leadership"
  | "vzp"
  | "family"
  | "raids"
  | "streams"
  | "other";

export const MOMENT_CATEGORIES: { id: MomentCategory; label: string; color: string; emoji: string }[] = [
  { id: "leadership", label: "Лидерки", color: "#9b2335", emoji: "🏆" },
  { id: "vzp", label: "ВЗП", color: "#f59e0b", emoji: "🏙" },
  { id: "family", label: "Семья", color: "#ff3366", emoji: "👨‍👩‍👦" },
  { id: "raids", label: "Рейды", color: "#a855f7", emoji: "⚔️" },
  { id: "streams", label: "Стримы", color: "#9146ff", emoji: "📡" },
  { id: "other", label: "Другое", color: "#6b7280", emoji: "📸" },
];

/* ─── Default moments ─── */
const DEFAULT_MOMENTS: Moment[] = [
  {
    id: "m1",
    title: "Захват FIB — первая лидерка",
    description: "Исторический момент — семья Schwarz впервые берёт под контроль Federal Investigation Bureau на Majestic RP.",
    url: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    type: "photo",
    category: "leadership",
    date: "2024-12-18",
    author: "Roman Schwarz",
    featured: true,
    visible: true,
    order: 1,
  },
  {
    id: "m2",
    title: "LSPD — синяя эпоха",
    description: "Madara Schwarz возглавляет LSPD. Первая организация под крылом семьи.",
    url: "https://images.unsplash.com/photo-1710161974229-81e30ab21256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    type: "photo",
    category: "leadership",
    date: "2024-08-15",
    author: "Madara Schwarz",
    featured: true,
    visible: true,
    order: 2,
  },
  {
    id: "m3",
    title: "18 точек ВЗП",
    description: "Экономическая империя Schwarz Family — контроль над восемнадцатью точками ВЗП на Majestic RP.",
    url: "https://images.unsplash.com/photo-1710161970209-2b24ae44814a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    type: "photo",
    category: "vzp",
    date: "2025-06-01",
    author: "Akihiro Schwarz",
    featured: true,
    visible: true,
    order: 3,
  },
  {
    id: "m4",
    title: "Yakuza — ночь самурая",
    description: "Madara Schwarz в роли лидера Якудзы. Тёмный период — великий период.",
    url: "https://images.unsplash.com/photo-1604315841269-a1f298321670?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    type: "photo",
    category: "leadership",
    date: "2025-07-01",
    author: "Madara Schwarz",
    featured: false,
    visible: true,
    order: 4,
  },
  {
    id: "m5",
    title: "Семейный рейд",
    description: "Все в сборе — координация семьи на одном из крупных рейдов сезона.",
    url: "https://images.unsplash.com/photo-1670414555223-636a70b95ca0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    type: "photo",
    category: "raids",
    date: "2025-09-15",
    author: "Kerro Schwarz",
    featured: false,
    visible: true,
    order: 5,
  },
  {
    id: "m6",
    title: "Стрим на Twitch — 10k просмотров",
    description: "Nebesnyin устанавливает личный рекорд — 10 тысяч просмотров на одном стриме GTA RP.",
    url: "https://images.unsplash.com/photo-1632603093711-0d93a0bcc6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    type: "photo",
    category: "streams",
    date: "2025-11-20",
    author: "Madara Schwarz",
    featured: false,
    visible: true,
    order: 6,
  },
  {
    id: "m7",
    title: "FIB II — возвращение Akihiro",
    description: "Akihiro Schwarz берёт вторую лидерку FIB — новый рекорд семьи.",
    url: "https://images.unsplash.com/photo-1599825804319-3dbb64fbaabe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    type: "photo",
    category: "leadership",
    date: "2025-10-27",
    author: "Akihiro Schwarz",
    featured: true,
    visible: true,
    order: 7,
  },
  {
    id: "m8",
    title: "Встреча на Majestic Seattle",
    description: "Возвращение на Majestic в 2026 году. Новая глава — новые возможности.",
    url: "https://images.unsplash.com/photo-1763495195144-f8d4da2b850f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    type: "photo",
    category: "family",
    date: "2026-01-15",
    author: "Madara Schwarz",
    featured: false,
    visible: true,
    order: 8,
  },
];

/* ─── Storage ─── */
const STORAGE_KEY = "schwarz_admin_moments";

export function loadMoments(): Moment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_MOMENTS;
  } catch {
    return DEFAULT_MOMENTS;
  }
}

export function saveMoments(moments: Moment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(moments));
}

function generateId() {
  return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ─── Category badge ─── */
function CatBadge({ category }: { category: MomentCategory }) {
  const cat = MOMENT_CATEGORIES.find((c) => c.id === category);
  if (!cat) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{
        fontSize: "0.52rem",
        color: cat.color,
        background: `${cat.color}12`,
        border: `1px solid ${cat.color}25`,
      }}
    >
      {cat.emoji} {cat.label}
    </span>
  );
}

/* ─── Form ─── */
interface MomentForm {
  title: string;
  description: string;
  url: string;
  videoUrl: string;
  type: "photo" | "video";
  category: MomentCategory;
  date: string;
  author: string;
  featured: boolean;
  visible: boolean;
}

const emptyForm: MomentForm = {
  title: "",
  description: "",
  url: "",
  videoUrl: "",
  type: "photo",
  category: "other",
  date: new Date().toISOString().split("T")[0],
  author: "",
  featured: false,
  visible: true,
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export function MomentsTab() {
  const [moments, setMoments] = useState<Moment[]>(() => loadMoments());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MomentForm>(emptyForm);
  const [filter, setFilter] = useState<MomentCategory | "all">("all");

  const filtered = filter === "all" ? moments : moments.filter((m) => m.category === filter);

  const persist = (updated: Moment[]) => {
    setMoments(updated);
    saveMoments(updated);
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (m: Moment) => {
    setEditId(m.id);
    setForm({
      title: m.title,
      description: m.description || "",
      url: m.url,
      videoUrl: m.videoUrl || "",
      type: m.type,
      category: m.category,
      date: m.date,
      author: m.author,
      featured: m.featured,
      visible: m.visible,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.url.trim()) return;

    if (editId) {
      const updated = moments.map((m) =>
        m.id === editId
          ? {
              ...m,
              ...form,
              description: form.description || undefined,
              videoUrl: form.videoUrl || undefined,
            }
          : m
      );
      persist(updated);
      addAuditLog("Момент отредактирован", "media", form.title);
    } else {
      const newMoment: Moment = {
        id: generateId(),
        ...form,
        description: form.description || undefined,
        videoUrl: form.videoUrl || undefined,
        order: moments.length + 1,
      };
      const updated = [...moments, newMoment];
      persist(updated);
      addAuditLog("Добавлен момент", "media", form.title);
      notifyMomentAdded(
        form.title,
        MOMENT_CATEGORIES.find((c) => c.id === form.category)?.label || form.category
      );
    }

    setShowForm(false);
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    const m = moments.find((x) => x.id === id);
    persist(moments.filter((x) => x.id !== id));
    if (m) addAuditLog("Момент удалён", "media", m.title);
  };

  const toggleFeatured = (id: string) => {
    persist(moments.map((m) => (m.id === id ? { ...m, featured: !m.featured } : m)));
  };

  const toggleVisible = (id: string) => {
    persist(moments.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));
  };

  const moveItem = (id: string, dir: -1 | 1) => {
    const idx = moments.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= moments.length) return;
    const next = [...moments];
    [next[idx], next[target]] = [next[target], next[idx]];
    persist(next);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.5rem" }}>
            Лучшие Моменты
          </h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Управление фотоальбомом — {moments.length} моментов
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
          style={{ fontSize: "0.72rem" }}
        >
          <Plus size={14} />
          Добавить момент
        </button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className="px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-300"
          style={{
            fontSize: "0.6rem",
            color: filter === "all" ? "#9b2335" : "rgba(255,255,255,0.25)",
            borderColor: filter === "all" ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)",
            background: filter === "all" ? "rgba(155,35,53,0.06)" : "transparent",
          }}
        >
          Все ({moments.length})
        </button>
        {MOMENT_CATEGORIES.map((cat) => {
          const count = moments.filter((m) => m.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className="px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-300"
              style={{
                fontSize: "0.6rem",
                color: filter === cat.id ? cat.color : "rgba(255,255,255,0.25)",
                borderColor: filter === cat.id ? `${cat.color}30` : "rgba(255,255,255,0.06)",
                background: filter === cat.id ? `${cat.color}08` : "transparent",
              }}
            >
              {cat.emoji} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
              <h3 className="font-['Oswald'] text-white/50 uppercase tracking-wider mb-5" style={{ fontSize: "0.72rem" }}>
                {editId ? "Редактировать момент" : "Новый момент"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    Заголовок *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Название момента..."
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    URL изображения (обложка) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      placeholder="https://i.imgur.com/..."
                      className="flex-1 bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/50 font-mono px-3 py-2 outline-none transition-colors"
                      style={{ fontSize: "0.75rem" }}
                    />
                    {form.url && (
                      <div className="w-12 h-10 overflow-hidden border border-white/8">
                        <img src={form.url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Video URL */}
                <div className="md:col-span-2">
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    YouTube / Twitch URL (если видео)
                  </label>
                  <input
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value, type: e.target.value ? "video" : "photo" })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9146ff]/20 text-white/50 font-mono px-3 py-2 outline-none transition-colors"
                    style={{ fontSize: "0.75rem" }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    Категория
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as MomentCategory })}
                    className="w-full bg-[#0d0d15] border border-white/8 text-white/70 font-['Oswald'] tracking-wide px-3 py-2 outline-none"
                    style={{ fontSize: "0.82rem" }}
                  >
                    {MOMENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    Дата
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-[#0d0d15] border border-white/8 text-white/60 font-['Oswald'] tracking-wide px-3 py-2 outline-none"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    Автор
                  </label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Имя Schwarz"
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/20 text-white/70 font-['Oswald'] tracking-wide px-3 py-2 outline-none"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setForm({ ...form, featured: !form.featured })}
                    className="flex items-center gap-2 transition-colors"
                  >
                    <Star
                      size={16}
                      style={{
                        color: form.featured ? "#f59e0b" : "rgba(255,255,255,0.15)",
                        fill: form.featured ? "#f59e0b" : "none",
                      }}
                    />
                    <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.6rem", color: form.featured ? "#f59e0b" : "rgba(255,255,255,0.2)" }}>
                      Избранное
                    </span>
                  </button>
                  <button
                    onClick={() => setForm({ ...form, visible: !form.visible })}
                    className="flex items-center gap-2 transition-colors"
                  >
                    {form.visible ? (
                      <Eye size={16} className="text-[#9b2335]/60" />
                    ) : (
                      <EyeOff size={16} className="text-white/15" />
                    )}
                    <span
                      className="font-['Oswald'] uppercase tracking-wider"
                      style={{ fontSize: "0.6rem", color: form.visible ? "rgba(155,35,53,0.6)" : "rgba(255,255,255,0.2)" }}
                    >
                      Видимый
                    </span>
                  </button>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    Описание (необязательно)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Краткое описание момента..."
                    rows={2}
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/20 text-white/50 font-['Oswald'] tracking-wide px-3 py-2 outline-none resize-none"
                    style={{ fontSize: "0.78rem" }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim() || !form.url.trim()}
                  className="flex items-center gap-2 px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ fontSize: "0.72rem" }}
                >
                  <Save size={14} />
                  {editId ? "Сохранить" : "Добавить"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
                  style={{ fontSize: "0.72rem" }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moments list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.03]">
          <ImageIcon size={40} className="text-white/8 mx-auto mb-4" />
          <p className="font-['Oswald'] text-white/15 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
            Нет моментов
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              layout
              className={`flex items-center gap-4 p-4 border transition-all duration-300 group ${
                m.visible ? "border-white/5 bg-white/[0.01]" : "border-white/[0.03] bg-white/[0.005] opacity-50"
              }`}
            >
              {/* Thumbnail */}
              <div className="w-14 h-10 shrink-0 overflow-hidden border border-white/8 relative">
                <img
                  src={m.url}
                  alt={m.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/56x40/1a1a2e/9b2335?text=?"; }}
                />
                {m.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Video size={12} className="text-white/60" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-['Oswald'] text-white/60 tracking-wide truncate" style={{ fontSize: "0.85rem" }}>
                    {m.title}
                  </span>
                  {m.featured && (
                    <Star size={11} className="text-[#f59e0b] shrink-0" fill="#f59e0b" />
                  )}
                  <CatBadge category={m.category} />
                </div>
                <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
                  {m.author} · {m.date}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => moveItem(m.id, -1)}
                  disabled={i === 0}
                  className="p-1.5 text-white/15 hover:text-white/40 disabled:opacity-20 transition-colors"
                  title="Вверх"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveItem(m.id, 1)}
                  disabled={i === filtered.length - 1}
                  className="p-1.5 text-white/15 hover:text-white/40 disabled:opacity-20 transition-colors"
                  title="Вниз"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => toggleFeatured(m.id)}
                  className="p-1.5 transition-colors"
                  title={m.featured ? "Убрать из избранного" : "В избранное"}
                  style={{ color: m.featured ? "#f59e0b" : "rgba(255,255,255,0.15)" }}
                >
                  <Star size={14} fill={m.featured ? "#f59e0b" : "none"} />
                </button>
                <button
                  onClick={() => toggleVisible(m.id)}
                  className="p-1.5 transition-colors"
                  title={m.visible ? "Скрыть" : "Показать"}
                  style={{ color: m.visible ? "rgba(155,35,53,0.5)" : "rgba(255,255,255,0.15)" }}
                >
                  {m.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => openEdit(m)}
                  className="p-1.5 text-white/15 hover:text-[#f59e0b]/60 transition-colors"
                  title="Редактировать"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 text-white/15 hover:text-[#ff3366]/60 transition-colors"
                  title="Удалить"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="font-['Oswald'] text-white/10 tracking-wide mt-6 text-right" style={{ fontSize: "0.62rem" }}>
        Всего моментов: {moments.length} · Видимых: {moments.filter((m) => m.visible).length} · Избранных: {moments.filter((m) => m.featured).length}
      </p>
    </div>
  );
}

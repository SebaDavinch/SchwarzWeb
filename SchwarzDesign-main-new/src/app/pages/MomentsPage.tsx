import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  X, ChevronLeft, ChevronRight, Star, Calendar, User,
  Play, ZoomIn, ExternalLink, Youtube, Twitch, Upload,
  CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import {
  loadMoments, MOMENT_CATEGORIES, detectMediaType, getYouTubeThumbnail,
  getTwitchClipSlug, getEmbedUrl, notifyMomentSubmittedToAdmins,
  type Moment, type MomentCategory, type MomentMediaType,
} from "../hooks/useMoments";

/* ─── helpers ─── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function saveMomentsPublic(moments: Moment[]) {
  localStorage.setItem("schwarz_admin_moments", JSON.stringify(moments));
}

/* ─── Lightbox ─── */
function Lightbox({ moments, currentIndex, onClose, onPrev, onNext }: {
  moments: Moment[]; currentIndex: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const m = moments[currentIndex];
  if (!m) return null;
  const cat = MOMENT_CATEGORIES.find((c) => c.id === m.category);
  const embedUrl = m.videoUrl ? getEmbedUrl(m) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
      style={{ background: "rgba(5,5,10,0.97)", backdropFilter: "blur(20px)" }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.25 }}
        className="relative max-w-5xl w-full mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className="flex items-start justify-between mb-4 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {m.featured && <Star size={13} className="text-[#f59e0b]" fill="#f59e0b" />}
              {cat && (
                <span className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider"
                  style={{ fontSize: "0.55rem", color: cat.color, background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                  {cat.emoji} {cat.label}
                </span>
              )}
              {m.mediaType === "youtube" && (
                <span className="flex items-center gap-1 px-2 py-0.5 font-['Oswald'] uppercase tracking-wider"
                  style={{ fontSize: "0.52rem", color: "#ff4444", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)" }}>
                  <Youtube size={9} /> YouTube
                </span>
              )}
              {m.mediaType === "twitch" && (
                <span className="flex items-center gap-1 px-2 py-0.5 font-['Oswald'] uppercase tracking-wider"
                  style={{ fontSize: "0.52rem", color: "#9146ff", background: "rgba(145,70,255,0.1)", border: "1px solid rgba(145,70,255,0.2)" }}>
                  <Twitch size={9} /> Twitch
                </span>
              )}
              <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.6rem" }}>
                {currentIndex + 1} / {moments.length}
              </span>
            </div>
            <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.1rem", letterSpacing: "0.02em" }}>{m.title}</h2>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1.5 font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.65rem" }}>
                <User size={11} /> {m.author}
              </span>
              <span className="flex items-center gap-1.5 font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.65rem" }}>
                <Calendar size={11} /> {formatDate(m.date)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {m.videoUrl && (
              <a href={m.videoUrl} target="_blank" rel="noopener noreferrer"
                className="p-2 text-white/20 hover:text-white/50 border border-white/5 hover:border-white/15 transition-all" title="Открыть источник">
                <ExternalLink size={15} />
              </a>
            )}
            <button onClick={onClose}
              className="p-2 text-white/20 hover:text-[#ff3366]/60 border border-white/5 hover:border-[#ff3366]/20 transition-all">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="relative overflow-hidden" style={{ maxHeight: "65vh" }}>
          {embedUrl ? (
            <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
              <iframe src={embedUrl} className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen" allowFullScreen />
            </div>
          ) : (
            <img src={m.url} alt={m.title} className="w-full object-contain" style={{ maxHeight: "65vh" }} />
          )}
          {moments.length > 1 && (
            <>
              <button onClick={onPrev} disabled={currentIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/10 bg-black/60 hover:border-[#9b2335]/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                <ChevronLeft size={18} className="text-white/60" />
              </button>
              <button onClick={onNext} disabled={currentIndex === moments.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/10 bg-black/60 hover:border-[#9b2335]/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                <ChevronRight size={18} className="text-white/60" />
              </button>
            </>
          )}
        </div>

        {m.description && (
          <p className="font-['Oswald'] text-white/30 tracking-wide mt-4 px-1 text-center"
            style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>{m.description}</p>
        )}

        {/* Thumbnail strip */}
        {moments.length > 1 && (
          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 justify-center">
            {moments.map((item, idx) => (
              <button key={item.id} onClick={() => window.dispatchEvent(new CustomEvent("lightbox-navigate", { detail: idx }))}
                className="w-10 h-7 shrink-0 overflow-hidden border transition-all"
                style={{ borderColor: idx === currentIndex ? "#9b2335" : "rgba(255,255,255,0.06)", opacity: idx === currentIndex ? 1 : 0.4 }}>
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Moment Card ─── */
function MomentCard({ moment, onClick }: { moment: Moment; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const cat = MOMENT_CATEGORIES.find((c) => c.id === moment.category);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden cursor-pointer group"
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative overflow-hidden">
        <img src={moment.url} alt={moment.title} className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ display: "block" }} />

        {/* Media type badge */}
        {moment.mediaType !== "photo" && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/70 border border-white/10">
              {moment.mediaType === "youtube" && <Youtube size={10} className="text-red-400/80" />}
              {moment.mediaType === "twitch" && <Twitch size={10} className="text-purple-400/80" />}
              {moment.mediaType === "video" && <Play size={10} className="text-white/70" fill="rgba(255,255,255,0.7)" />}
              <span className="font-['Oswald'] text-white/50 uppercase tracking-wider" style={{ fontSize: "0.48rem" }}>
                {moment.mediaType === "youtube" ? "YouTube" : moment.mediaType === "twitch" ? "Twitch" : "Видео"}
              </span>
            </div>
          </div>
        )}

        {moment.featured && (
          <div className="absolute top-2 right-2">
            <Star size={14} className="text-[#f59e0b]" fill="#f59e0b" />
          </div>
        )}

        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col justify-end"
              style={{ background: "linear-gradient(to top, rgba(5,5,10,0.95) 0%, rgba(5,5,10,0.3) 50%, transparent 100%)" }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 border border-white/20 flex items-center justify-center bg-black/40">
                  {moment.mediaType !== "photo" ? <Play size={18} className="text-white/60" /> : <ZoomIn size={18} className="text-white/60" />}
                </div>
              </div>
              <div className="p-3">
                {cat && (
                  <span className="inline-block px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider mb-1.5"
                    style={{ fontSize: "0.48rem", color: cat.color, background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}>
                    {cat.emoji} {cat.label}
                  </span>
                )}
                <p className="font-['Oswald'] text-white/80 tracking-wide" style={{ fontSize: "0.78rem", lineHeight: 1.3 }}>{moment.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.58rem" }}>{moment.author}</span>
                  <span className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.58rem" }}>{formatDate(moment.date)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Submit Modal ─── */
function SubmitModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", url: "", videoUrl: "",
    mediaType: "photo" as MomentMediaType, category: "other" as MomentCategory,
    date: new Date().toISOString().split("T")[0], author: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleVideoChange = (url: string) => {
    const mtype = detectMediaType(url);
    const thumb = mtype === "youtube" ? getYouTubeThumbnail(url) : form.url;
    setForm((f) => ({ ...f, videoUrl: url, mediaType: url ? mtype : "photo", url: thumb || f.url }));
  };

  const handleSubmit = async () => {
    setStatus("sending");
    try {
      const all = loadMoments();
      const thumbUrl = form.mediaType === "youtube" && form.videoUrl ? getYouTubeThumbnail(form.videoUrl) : form.url;
      const newMoment: Moment = {
        id: "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: form.title, description: form.description || undefined,
        url: thumbUrl || form.url, videoUrl: form.videoUrl || undefined,
        mediaType: form.mediaType, category: form.category,
        date: form.date, author: form.author,
        featured: false, visible: true, order: all.length + 1,
        status: "pending", submittedAt: new Date().toISOString(),
      };
      saveMomentsPublic([...all, newMoment]);
      await notifyMomentSubmittedToAdmins(newMoment);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const ic = "w-full bg-[#0a0a10] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors";
  const lc = "block font-['Oswald'] text-white/30 uppercase tracking-wider mb-1.5";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(5,5,10,0.92)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg border border-white/8 bg-[#0d0d15] my-8"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.1rem" }}>Предложить момент</h2>
            <p className="font-['Oswald'] text-white/25 tracking-wide mt-0.5" style={{ fontSize: "0.68rem" }}>
              Будет проверен администраторами перед публикацией
            </p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors"><X size={18} /></button>
        </div>

        {status === "done" ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle2 size={40} className="text-green-500/60 mx-auto mb-4" strokeWidth={1} />
            <p className="font-['Russo_One'] text-white mb-2" style={{ fontSize: "1rem" }}>Отправлено!</p>
            <p className="font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.78rem" }}>
              Твой момент ждёт проверки. Администраторы получили уведомление.
            </p>
            <button onClick={onClose} className="mt-6 px-5 py-2 border border-white/8 text-white/30 hover:text-white/50 font-['Oswald'] uppercase tracking-wider transition-colors" style={{ fontSize: "0.68rem" }}>
              Закрыть
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* Media type */}
            <div className="flex gap-2 flex-wrap">
              {(["photo", "youtube", "twitch"] as MomentMediaType[]).map((mt) => {
                const icons = { photo: "🖼", youtube: "▶️", twitch: "📡" };
                const labels = { photo: "Фото", youtube: "YouTube", twitch: "Twitch" };
                return (
                  <button key={mt} onClick={() => set("mediaType", mt)}
                    className="px-3 py-1.5 border font-['Oswald'] uppercase tracking-wider transition-all"
                    style={{ fontSize: "0.6rem", color: form.mediaType === mt ? "#9b2335" : "rgba(255,255,255,0.25)", borderColor: form.mediaType === mt ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)", background: form.mediaType === mt ? "rgba(155,35,53,0.06)" : "transparent" }}>
                    {icons[mt]} {labels[mt]}
                  </button>
                );
              })}
            </div>

            {form.mediaType !== "photo" && (
              <div>
                <label className={lc} style={{ fontSize: "0.6rem" }}>{form.mediaType === "youtube" ? "YouTube URL" : "Twitch clip URL"} *</label>
                <input value={form.videoUrl} onChange={(e) => handleVideoChange(e.target.value)}
                  placeholder={form.mediaType === "youtube" ? "https://youtube.com/watch?v=..." : "https://twitch.tv/.../clip/..."}
                  className={ic} style={{ fontSize: "0.78rem" }} />
                {form.mediaType === "youtube" && form.videoUrl && getYouTubeThumbnail(form.videoUrl) && (
                  <div className="mt-2 h-20 overflow-hidden border border-white/8">
                    <img src={getYouTubeThumbnail(form.videoUrl)} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
              </div>
            )}

            {form.mediaType === "photo" && (
              <div>
                <label className={lc} style={{ fontSize: "0.6rem" }}>URL изображения *</label>
                <input value={form.url} onChange={(e) => set("url", e.target.value)}
                  placeholder="https://i.imgur.com/..." className={ic} style={{ fontSize: "0.78rem" }} />
              </div>
            )}

            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Название *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="Что произошло?" className={ic} style={{ fontSize: "0.82rem" }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc} style={{ fontSize: "0.6rem" }}>Категория</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value as MomentCategory)}
                  className={ic} style={{ fontSize: "0.8rem", colorScheme: "dark" }}>
                  {MOMENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lc} style={{ fontSize: "0.6rem" }}>Дата</label>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                  className={ic} style={{ fontSize: "0.8rem", colorScheme: "dark" }} />
              </div>
            </div>

            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Твой игровой ник</label>
              <input value={form.author} onChange={(e) => set("author", e.target.value)}
                placeholder="Имя Schwarz" className={ic} style={{ fontSize: "0.82rem" }} />
            </div>

            <div>
              <label className={lc} style={{ fontSize: "0.6rem" }}>Описание (необязательно)</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Расскажи об этом моменте..." rows={3}
                className="w-full bg-[#0a0a10] border border-white/8 focus:border-[#9b2335]/20 text-white/60 font-['Oswald'] tracking-wide px-3 py-2 outline-none resize-none"
                style={{ fontSize: "0.78rem" }} />
            </div>

            <div className="flex items-start gap-3 pt-1 pb-2 border-t border-white/5">
              <Clock size={13} className="text-[#f59e0b]/40 mt-0.5 shrink-0" />
              <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.68rem", lineHeight: 1.6 }}>
                Момент будет отправлен на проверку. Администраторы одобрят или отклонят его.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={status === "sending" || !form.title.trim() || (form.mediaType === "photo" && !form.url.trim()) || (form.mediaType !== "photo" && !form.videoUrl.trim())}
              className="w-full py-3 flex items-center justify-center gap-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontSize: "0.75rem" }}>
              {status === "sending" ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border border-white/30 border-t-white rounded-full" />
                  Отправка...
                </>
              ) : (
                <><Upload size={14} /> Предложить момент</>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [filter, setFilter] = useState<MomentCategory | "all">("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<"all" | "photo" | "video">("all");

  useEffect(() => {
    // Only show approved + visible moments
    setMoments(loadMoments().filter((m) => m.status === "approved" && m.visible));
  }, []);

  const filtered = moments.filter((m) => {
    if (showFeaturedOnly && !m.featured) return false;
    if (filter !== "all" && m.category !== filter) return false;
    if (mediaFilter === "photo" && m.mediaType !== "photo") return false;
    if (mediaFilter === "video" && m.mediaType === "photo") return false;
    return true;
  });

  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIdx(null);
    document.body.style.overflow = "";
  }, []);

  const prevItem = useCallback(() => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextItem = useCallback(() => setLightboxIdx((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i)), [filtered.length]);

  useEffect(() => {
    const handler = (e: Event) => setLightboxIdx((e as CustomEvent).detail);
    window.addEventListener("lightbox-navigate", handler);
    return () => window.removeEventListener("lightbox-navigate", handler);
  }, []);

  const featuredCount = moments.filter((m) => m.featured).length;
  const videoCount = moments.filter((m) => m.mediaType !== "photo").length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* HERO */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#9b2335]/4 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9b2335]/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <p className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.4em] mb-4" style={{ fontSize: "0.65rem" }}>
              Schwarz Family · Majestic RP
            </p>
            <h1 className="font-['Russo_One'] text-white mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.02em" }}>
              Лучшие <span style={{ color: "#9b2335" }}>Моменты</span>
            </h1>
            <p className="font-['Oswald'] text-white/25 tracking-wide max-w-xl mx-auto" style={{ fontSize: "0.9rem" }}>
              Галерея ключевых событий, лидерок и памятных мгновений семьи Schwarz
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
              {[
                { label: "Моментов", value: moments.length },
                { label: "Избранных", value: featuredCount },
                { label: "Видео", value: videoCount },
                { label: "Категорий", value: MOMENT_CATEGORIES.length },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-['Russo_One'] text-[#9b2335]" style={{ fontSize: "1.8rem" }}>{s.value}</p>
                  <p className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Submit button */}
            <motion.button onClick={() => setShowSubmit(true)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 border transition-all duration-300"
              style={{ borderColor: "rgba(155,35,53,0.25)", background: "rgba(155,35,53,0.06)", color: "rgba(155,35,53,0.8)" }}>
              <Upload size={13} strokeWidth={1.5} />
              <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>
                Предложить момент
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FILTERS */}
      <div className="sticky top-16 z-20 border-y border-white/5 bg-[#0a0a0f]/90" style={{ backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto">
          <button onClick={() => setFilter("all")}
            className="shrink-0 px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
            style={{ fontSize: "0.6rem", color: filter === "all" ? "#9b2335" : "rgba(255,255,255,0.25)", borderColor: filter === "all" ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)", background: filter === "all" ? "rgba(155,35,53,0.06)" : "transparent" }}>
            Все ({moments.length})
          </button>
          {MOMENT_CATEGORIES.map((cat) => {
            const count = moments.filter((m) => m.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button key={cat.id} onClick={() => setFilter(cat.id)}
                className="shrink-0 px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
                style={{ fontSize: "0.6rem", color: filter === cat.id ? cat.color : "rgba(255,255,255,0.25)", borderColor: filter === cat.id ? `${cat.color}30` : "rgba(255,255,255,0.06)", background: filter === cat.id ? `${cat.color}08` : "transparent" }}>
                {cat.emoji} {cat.label} ({count})
              </button>
            );
          })}
          <div className="h-5 w-px bg-white/5 mx-2 shrink-0" />
          <button onClick={() => setShowFeaturedOnly((v) => !v)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
            style={{ fontSize: "0.6rem", color: showFeaturedOnly ? "#f59e0b" : "rgba(255,255,255,0.25)", borderColor: showFeaturedOnly ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)", background: showFeaturedOnly ? "rgba(245,158,11,0.06)" : "transparent" }}>
            <Star size={11} fill={showFeaturedOnly ? "#f59e0b" : "none"} style={{ color: showFeaturedOnly ? "#f59e0b" : "rgba(255,255,255,0.25)" }} />
            Избранные
          </button>
          <button onClick={() => setMediaFilter(mediaFilter === "video" ? "all" : "video")}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
            style={{ fontSize: "0.6rem", color: mediaFilter === "video" ? "#9146ff" : "rgba(255,255,255,0.25)", borderColor: mediaFilter === "video" ? "rgba(145,70,255,0.3)" : "rgba(255,255,255,0.06)", background: mediaFilter === "video" ? "rgba(145,70,255,0.06)" : "transparent" }}>
            <Play size={11} />
            Видео
          </button>
        </div>
      </div>

      {/* GALLERY */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-24">
              <p className="font-['Oswald'] text-white/15 uppercase tracking-wider" style={{ fontSize: "0.85rem" }}>Нет моментов</p>
            </motion.div>
          ) : (
            <motion.div key={filter + showFeaturedOnly + mediaFilter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 600: 2, 900: 3, 1200: 4 }}>
                <Masonry gutter="8px">
                  {filtered.map((moment, idx) => (
                    <MomentCard key={moment.id} moment={moment} onClick={() => openLightbox(idx)} />
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/5 py-8 text-center">
        <p className="font-['Oswald'] text-white/10 uppercase tracking-[0.3em]" style={{ fontSize: "0.6rem" }}>
          Schwarz Family · Majestic RP · 2022 – 2026
        </p>
      </div>

      {/* Submit modal */}
      <AnimatePresence>
        {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} />}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox moments={filtered} currentIndex={lightboxIdx} onClose={closeLightbox} onPrev={prevItem} onNext={nextItem} />
        )}
      </AnimatePresence>
    </div>
  );
}

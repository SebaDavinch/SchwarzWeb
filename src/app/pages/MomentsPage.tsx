import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  User,
  Play,
  ZoomIn,
  ExternalLink,
} from "lucide-react";
import { usePublicMoments, MOMENT_CATEGORIES, type Moment, type MomentCategory } from "../hooks/useAdminData";

/* ─── Helpers ─── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ─── Lightbox ─── */
function Lightbox({
  moments,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  moments: Moment[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const m = moments[currentIndex];
  if (!m) return null;

  const youtubeId = m.videoUrl ? getYouTubeId(m.videoUrl) : null;
  const cat = MOMENT_CATEGORIES.find((c) => c.id === m.category);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
      style={{ background: "rgba(5,5,10,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Content */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative max-w-5xl w-full mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-start justify-between mb-4 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {m.featured && <Star size={13} className="text-[#f59e0b]" fill="#f59e0b" />}
              {cat && (
                <span
                  className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider"
                  style={{
                    fontSize: "0.55rem",
                    color: cat.color,
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}30`,
                  }}
                >
                  {cat.emoji} {cat.label}
                </span>
              )}
              <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.6rem" }}>
                {currentIndex + 1} / {moments.length}
              </span>
            </div>
            <h2
              className="font-['Russo_One'] text-white"
              style={{ fontSize: "1.1rem", letterSpacing: "0.02em" }}
            >
              {m.title}
            </h2>
            <div className="flex items-center gap-4 mt-1.5">
              <span className="flex items-center gap-1.5 font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.65rem" }}>
                <User size={11} />
                {m.author}
              </span>
              <span className="flex items-center gap-1.5 font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.65rem" }}>
                <Calendar size={11} />
                {formatDate(m.date)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {m.videoUrl && (
              <a
                href={m.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/20 hover:text-white/50 border border-white/5 hover:border-white/15 transition-all"
                title="Открыть видео"
              >
                <ExternalLink size={15} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/20 hover:text-[#ff3366]/60 border border-white/5 hover:border-[#ff3366]/20 transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="relative overflow-hidden" style={{ maxHeight: "65vh" }}>
          {youtubeId ? (
            <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          ) : (
            <img
              src={m.url}
              alt={m.title}
              className="w-full object-contain"
              style={{ maxHeight: "65vh" }}
            />
          )}

          {/* Prev / Next */}
          {moments.length > 1 && (
            <>
              <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/10 bg-black/60 hover:border-[#9b2335]/30 hover:bg-[#9b2335]/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} className="text-white/60" />
              </button>
              <button
                onClick={onNext}
                disabled={currentIndex === moments.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/10 bg-black/60 hover:border-[#9b2335]/30 hover:bg-[#9b2335]/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} className="text-white/60" />
              </button>
            </>
          )}
        </div>

        {/* Description */}
        {m.description && (
          <p
            className="font-['Oswald'] text-white/30 tracking-wide mt-4 px-1 text-center"
            style={{ fontSize: "0.82rem", lineHeight: 1.7 }}
          >
            {m.description}
          </p>
        )}

        {/* Thumbnail strip */}
        {moments.length > 1 && (
          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 justify-center">
            {moments.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  // find the item and navigate
                  const event = new CustomEvent("lightbox-navigate", { detail: idx });
                  window.dispatchEvent(event);
                }}
                className="w-10 h-7 shrink-0 overflow-hidden border transition-all"
                style={{
                  borderColor: idx === currentIndex ? "#9b2335" : "rgba(255,255,255,0.06)",
                  opacity: idx === currentIndex ? 1 : 0.4,
                }}
              >
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
function MomentCard({
  moment,
  onClick,
}: {
  moment: Moment;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cat = MOMENT_CATEGORIES.find((c) => c.id === moment.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden cursor-pointer group"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={moment.url}
          alt={moment.title}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ display: "block" }}
        />

        {/* Video badge */}
        {moment.type === "video" && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/70 border border-white/10">
              <Play size={10} className="text-white/70" fill="rgba(255,255,255,0.7)" />
              <span className="font-['Oswald'] text-white/50 uppercase tracking-wider" style={{ fontSize: "0.5rem" }}>
                Видео
              </span>
            </div>
          </div>
        )}

        {/* Featured star */}
        {moment.featured && (
          <div className="absolute top-2 right-2">
            <Star size={14} className="text-[#f59e0b]" fill="#f59e0b" />
          </div>
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col justify-end"
              style={{ background: "linear-gradient(to top, rgba(5,5,10,0.95) 0%, rgba(5,5,10,0.3) 50%, transparent 100%)" }}
            >
              {/* Zoom icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 border border-white/20 flex items-center justify-center bg-black/40">
                  <ZoomIn size={18} className="text-white/60" />
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                {cat && (
                  <span
                    className="inline-block px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider mb-1.5"
                    style={{
                      fontSize: "0.48rem",
                      color: cat.color,
                      background: `${cat.color}20`,
                      border: `1px solid ${cat.color}30`,
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </span>
                )}
                <p
                  className="font-['Oswald'] text-white/80 tracking-wide"
                  style={{ fontSize: "0.78rem", lineHeight: 1.3 }}
                >
                  {moment.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-['Oswald'] text-white/30 tracking-wide" style={{ fontSize: "0.58rem" }}>
                    {moment.author}
                  </span>
                  <span className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.58rem" }}>
                    {formatDate(moment.date)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export function MomentsPage() {
  const allMoments = usePublicMoments();
  const [filter, setFilter] = useState<MomentCategory | "all">("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // moments already filtered to visible-only by the hook
  const moments = allMoments;

  const filtered = moments.filter((m) => {
    if (showFeaturedOnly && !m.featured) return false;
    if (filter !== "all" && m.category !== filter) return false;
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

  const prevItem = useCallback(() => {
    setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const nextItem = useCallback(() => {
    setLightboxIdx((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i));
  }, [filtered.length]);

  // Listen for thumbnail navigation
  useEffect(() => {
    const handler = (e: Event) => {
      const idx = (e as CustomEvent).detail;
      setLightboxIdx(idx);
    };
    window.addEventListener("lightbox-navigate", handler);
    return () => window.removeEventListener("lightbox-navigate", handler);
  }, []);

  const featuredCount = moments.filter((m) => m.featured).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#9b2335]/4 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9b2335]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p
              className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.4em] mb-4"
              style={{ fontSize: "0.65rem" }}
            >
              Schwarz Family · Majestic RP
            </p>
            <h1
              className="font-['Russo_One'] text-white mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.02em" }}
            >
              Лучшие{" "}
              <span style={{ color: "#9b2335" }}>Моменты</span>
            </h1>
            <p className="font-['Oswald'] text-white/25 tracking-wide max-w-xl mx-auto" style={{ fontSize: "0.9rem" }}>
              Галерея ключевых событий, лидерок и памятных мгновений семьи Schwarz — с 2022 года по сей день.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              {[
                { label: "Моментов", value: moments.length },
                { label: "Избранных", value: featuredCount },
                { label: "Категорий", value: MOMENT_CATEGORIES.length },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-['Russo_One'] text-[#9b2335]" style={{ fontSize: "1.8rem" }}>{s.value}</p>
                  <p className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FILTERS ─── */}
      <div className="sticky top-16 z-20 border-y border-white/5 bg-[#0a0a0f]/90" style={{ backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto">
          {/* All */}
          <button
            onClick={() => setFilter("all")}
            className="shrink-0 px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
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
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className="shrink-0 px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
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

          <div className="h-5 w-px bg-white/5 mx-2 shrink-0" />

          {/* Featured toggle */}
          <button
            onClick={() => setShowFeaturedOnly((v) => !v)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all duration-200"
            style={{
              fontSize: "0.6rem",
              color: showFeaturedOnly ? "#f59e0b" : "rgba(255,255,255,0.25)",
              borderColor: showFeaturedOnly ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)",
              background: showFeaturedOnly ? "rgba(245,158,11,0.06)" : "transparent",
            }}
          >
            <Star size={11} fill={showFeaturedOnly ? "#f59e0b" : "none"} style={{ color: showFeaturedOnly ? "#f59e0b" : "rgba(255,255,255,0.25)" }} />
            Избранные
          </button>
        </div>
      </div>

      {/* ─── GALLERY ─── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <p className="font-['Oswald'] text-white/15 uppercase tracking-wider" style={{ fontSize: "0.85rem" }}>
                Нет моментов по выбранному фильтру
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={filter + showFeaturedOnly}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 600: 2, 900: 3, 1200: 4 }}
              >
                <Masonry gutter="8px">
                  {filtered.map((moment, idx) => (
                    <MomentCard
                      key={moment.id}
                      moment={moment}
                      onClick={() => openLightbox(idx)}
                    />
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom line ─── */}
      <div className="border-t border-white/5 py-8 text-center">
        <p className="font-['Oswald'] text-white/10 uppercase tracking-[0.3em]" style={{ fontSize: "0.6rem" }}>
          Schwarz Family · Majestic RP · 2022 – 2026
        </p>
      </div>

      {/* ─── LIGHTBOX ─── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            moments={filtered}
            currentIndex={lightboxIdx}
            onClose={closeLightbox}
            onPrev={prevItem}
            onNext={nextItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

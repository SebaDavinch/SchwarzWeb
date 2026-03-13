import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Clock, User, Tag, Radio, Newspaper } from "lucide-react";
import { usePublicNews } from "../hooks/useAdminData";

const categoryColors: Record<string, string> = {
  "Семейные дела": "#9b2335",
  "Крим. хроника": "#ff3366",
  "Репортаж": "#f59e0b",
  "Объявление": "#3b82f6",
  "Обновление": "#10b981",
  "Другое": "#888899",
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function NewsArticlePage() {
  const { id } = useParams<{ id: string }>();
  const articles = usePublicNews();
  const article = articles.find((a) => a.id === id);

  // Related (same category, not current)
  const related = article
    ? articles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3)
    : [];

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Newspaper size={48} className="text-white/10 mx-auto mb-5" />
          <p
            className="text-white/30 uppercase tracking-widest mb-8"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
          >
            Материал не найден
          </p>
          <Link
            to="/news"
            className="flex items-center gap-2 text-[#9b2335]/60 hover:text-[#9b2335] transition-colors uppercase tracking-wider mx-auto w-fit"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
          >
            <ArrowLeft size={14} />
            Назад к новостям
          </Link>
        </div>
      </div>
    );
  }

  const accentColor = categoryColors[article.category] || "#9b2335";

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-28 pb-24 px-6">
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[220px] rounded-full pointer-events-none opacity-30"
        style={{ background: accentColor }}
      />

      <div className="max-w-3xl mx-auto relative">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Link
            to="/news"
            className="flex items-center gap-2 text-white/25 hover:text-white/60 transition-colors uppercase tracking-wider w-fit"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
          >
            <ArrowLeft size={13} />
            Все новости
          </Link>
        </motion.div>

        {/* Cover image */}
        {article.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 overflow-hidden"
          >
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-64 object-cover opacity-60"
            />
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-10"
        >
          {/* Category + date row */}
          <div className="flex items-center gap-4 flex-wrap mb-5">
            <span
              className="flex items-center gap-1.5 px-3 py-1 uppercase tracking-wider border"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: "0.58rem",
                color: accentColor,
                borderColor: `${accentColor}40`,
                background: `${accentColor}10`,
              }}
            >
              <Tag size={10} />
              {article.category}
            </span>
            <span
              className="flex items-center gap-1.5 text-white/25"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
            >
              <Clock size={12} />
              {formatDate(article.publishedAt)}
            </span>
            <span
              className="flex items-center gap-1.5 text-white/20"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
            >
              <User size={12} />
              {article.author}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-white mb-5"
            style={{ fontFamily: "'Russo One', sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.2 }}
          >
            {article.title}
          </h1>

          {/* Excerpt */}
          <p
            className="text-white/50"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "1rem", lineHeight: 1.7 }}
          >
            {article.excerpt}
          </p>

          {/* Divider */}
          <div className="mt-8 h-px" style={{ background: `linear-gradient(to right, ${accentColor}50, transparent)` }} />
        </motion.div>

        {/* Article body */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          <style>{`
            .news-body { color: rgba(255,255,255,0.65); font-family: 'Oswald', sans-serif; font-size: 0.95rem; line-height: 1.85; }
            .news-body p { margin-bottom: 1.2rem; }
            .news-body h2 { font-family: 'Russo One', sans-serif; color: white; font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.8rem; }
            .news-body h3 { font-family: 'Russo One', sans-serif; color: rgba(255,255,255,0.8); font-size: 1.05rem; margin-top: 1.5rem; margin-bottom: 0.6rem; }
            .news-body strong { color: rgba(255,255,255,0.9); }
            .news-body em { color: rgba(255,255,255,0.55); font-style: italic; }
            .news-body a { color: ${accentColor}; text-decoration: underline; text-underline-offset: 3px; }
            .news-body a:hover { opacity: 0.75; }
            .news-body blockquote { border-left: 3px solid ${accentColor}; padding-left: 1rem; margin: 1.5rem 0; color: rgba(255,255,255,0.4); font-style: italic; }
            .news-body hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 2rem 0; }
            .news-body img { max-width: 100%; border: 1px solid rgba(255,255,255,0.06); margin: 1rem 0; }
            .news-body ul, .news-body ol { padding-left: 1.5rem; margin-bottom: 1rem; }
            .news-body li { margin-bottom: 0.4rem; }
            .news-body code { font-family: monospace; background: rgba(255,255,255,0.06); padding: 0.15rem 0.4rem; border-radius: 2px; font-size: 0.85em; }
          `}</style>

          <div
            className="news-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </motion.div>

        {/* Bottom divider */}
        <div className="mt-14 h-px bg-white/5" />

        {/* Author tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-3"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: `${accentColor}30`, background: `${accentColor}08` }}
          >
            <User size={14} style={{ color: accentColor, opacity: 0.6 }} />
          </div>
          <div>
            <p
              className="text-white/60"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.82rem" }}
            >
              {article.author}
            </p>
            <p
              className="text-white/20"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.62rem" }}
            >
              Schwarz News · {formatDate(article.publishedAt)}
            </p>
          </div>
        </motion.div>

        {/* Related articles */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-16"
          >
            <h3
              className="text-white/40 uppercase tracking-[0.25em] mb-6"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
            >
              По теме
            </h3>
            <div className="space-y-3">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/news/${rel.id}`}
                  className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 group"
                >
                  <Radio size={16} className="text-white/10 shrink-0 mt-0.5 group-hover:text-[#9b2335]/30 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-white/60 group-hover:text-white/80 transition-colors truncate"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
                    >
                      {rel.title}
                    </p>
                    <p
                      className="text-white/20 mt-0.5"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.62rem" }}
                    >
                      {formatDate(rel.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to all */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 text-center"
        >
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#9b2335]/20 text-[#9b2335]/60 hover:bg-[#9b2335]/5 hover:text-[#9b2335] hover:border-[#9b2335]/40 transition-all duration-300 uppercase tracking-wider"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.7rem" }}
          >
            <ArrowLeft size={14} />
            Все новости
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

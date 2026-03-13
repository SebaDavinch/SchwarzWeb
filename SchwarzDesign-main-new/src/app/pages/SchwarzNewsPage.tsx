import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Radio, Clock, User, ArrowRight, Newspaper, Search } from "lucide-react";
import { usePublicNews, NEWS_CATEGORIES, type NewsCategory } from "../hooks/useAdminData";

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

export function SchwarzNewsPage() {
  const articles = usePublicNews();
  const [activeCategory, setActiveCategory] = useState<NewsCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = articles
    .filter((a) => activeCategory === "all" || a.category === activeCategory)
    .filter(
      (a) =>
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-28 pb-24 px-6">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#9b2335]/4 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          {/* Live badge */}
          <div className="flex items-center gap-2 mb-5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#ff3366]"
            />
            <span
              className="uppercase tracking-[0.3em] text-[#ff3366]/70"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
            >
              В эфире
            </span>
          </div>

          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h1
                className="text-white mb-1"
                style={{ fontFamily: "'Metal Mania', cursive", fontSize: "clamp(2.2rem, 6vw, 3.5rem)" }}
              >
                SCHWARZ{" "}
                <span style={{ color: "#9b2335" }}>NEWS</span>
              </h1>
              <p
                className="text-white/30 uppercase tracking-[0.25em]"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
              >
                Внутрисемейные новости · Majestic RP
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск новостей..."
                className="bg-white/[0.03] border border-white/8 text-white/70 pl-9 pr-4 py-2.5 outline-none focus:border-[#9b2335]/30 transition-colors w-60"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.78rem" }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="mt-6 h-px bg-gradient-to-r from-[#9b2335]/40 via-[#9b2335]/10 to-transparent" />
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2 flex-wrap mb-12"
        >
          <button
            onClick={() => setActiveCategory("all")}
            className="px-4 py-1.5 uppercase tracking-wider transition-all duration-300 border"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "0.62rem",
              color: activeCategory === "all" ? "#9b2335" : "rgba(255,255,255,0.3)",
              borderColor: activeCategory === "all" ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.06)",
              background: activeCategory === "all" ? "rgba(155,35,53,0.05)" : "transparent",
            }}
          >
            Все
          </button>
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 uppercase tracking-wider transition-all duration-300 border"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: "0.62rem",
                color: activeCategory === cat ? categoryColors[cat] : "rgba(255,255,255,0.3)",
                borderColor: activeCategory === cat ? `${categoryColors[cat]}40` : "rgba(255,255,255,0.06)",
                background: activeCategory === cat ? `${categoryColors[cat]}08` : "transparent",
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <Newspaper size={48} className="text-white/10 mx-auto mb-5" />
            <p
              className="text-white/25 uppercase tracking-wider"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
            >
              Новостей не найдено
            </p>
          </motion.div>
        )}

        {/* Featured article */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mb-10"
          >
            <Link to={`/news/${featured.id}`} className="block group">
              <div className="relative border border-white/8 bg-white/[0.015] overflow-hidden hover:border-[#9b2335]/25 transition-all duration-500">

                {/* Cover image or gradient */}
                {featured.coverImage ? (
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
                  </div>
                ) : (
                  <div className="relative h-52 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9b2335]/10 via-transparent to-[#0a0a0f]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Radio size={64} className="text-[#9b2335]/8" strokeWidth={1} />
                    </div>
                    {/* Grid lines */}
                    <div className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: "repeating-linear-gradient(0deg, #9b2335 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #9b2335 0px, transparent 1px, transparent 40px)"
                      }}
                    />
                  </div>
                )}

                <div className="p-8">
                  {/* Meta row */}
                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className="px-3 py-1 uppercase tracking-wider border"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: "0.55rem",
                        color: categoryColors[featured.category] || "#9b2335",
                        borderColor: `${categoryColors[featured.category] || "#9b2335"}40`,
                        background: `${categoryColors[featured.category] || "#9b2335"}10`,
                      }}
                    >
                      {featured.category}
                    </span>
                    <span
                      className="px-2 py-0.5 bg-[#9b2335]/10 border border-[#9b2335]/20 uppercase tracking-widest"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem", color: "#9b2335" }}
                    >
                      Главное
                    </span>
                    <span
                      className="flex items-center gap-1.5 text-white/25"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.62rem" }}
                    >
                      <Clock size={11} />
                      {formatDate(featured.publishedAt)}
                    </span>
                  </div>

                  <h2
                    className="text-white mb-3 group-hover:text-[#9b2335]/90 transition-colors duration-300"
                    style={{ fontFamily: "'Russo One', sans-serif", fontSize: "clamp(1.3rem, 3vw, 1.8rem)" }}
                  >
                    {featured.title}
                  </h2>

                  <p
                    className="text-white/40 mb-6"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.9rem", lineHeight: 1.7 }}
                  >
                    {featured.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-1.5 text-white/20"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
                    >
                      <User size={12} />
                      {featured.author}
                    </span>
                    <span
                      className="flex items-center gap-2 text-[#9b2335]/60 group-hover:text-[#9b2335] transition-colors uppercase tracking-wider"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}
                    >
                      Читать далее
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Accent line */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5 group-hover:w-1 transition-all duration-300"
                  style={{ background: "#9b2335" }}
                />
              </div>
            </Link>
          </motion.div>
        )}

        {/* Rest of articles grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
              >
                <Link to={`/news/${article.id}`} className="block group h-full">
                  <div className="h-full border border-white/6 bg-white/[0.01] overflow-hidden hover:border-[#9b2335]/20 transition-all duration-500 flex flex-col relative">

                    {/* Cover or pattern */}
                    {article.coverImage ? (
                      <div className="h-40 overflow-hidden shrink-0">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-32 shrink-0 flex items-center justify-center relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${categoryColors[article.category] || "#9b2335"}08 0%, transparent 70%)` }}
                      >
                        <Radio size={32} style={{ color: categoryColors[article.category] || "#9b2335", opacity: 0.07 }} strokeWidth={1} />
                      </div>
                    )}

                    <div className="p-5 flex flex-col flex-1">
                      {/* Category + date */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="px-2.5 py-0.5 uppercase tracking-wider border"
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: "0.5rem",
                            color: categoryColors[article.category] || "#9b2335",
                            borderColor: `${categoryColors[article.category] || "#9b2335"}35`,
                            background: `${categoryColors[article.category] || "#9b2335"}08`,
                          }}
                        >
                          {article.category}
                        </span>
                        <span
                          className="text-white/20 flex items-center gap-1"
                          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}
                        >
                          <Clock size={10} />
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>

                      <h3
                        className="text-white/80 mb-2 group-hover:text-white transition-colors duration-300 flex-1"
                        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "1rem", lineHeight: 1.4 }}
                      >
                        {article.title}
                      </h3>

                      <p
                        className="text-white/30 mb-4"
                        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.75rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span
                          className="text-white/15 flex items-center gap-1"
                          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
                        >
                          <User size={10} />
                          {article.author}
                        </span>
                        <span
                          className="flex items-center gap-1.5 text-[#9b2335]/40 group-hover:text-[#9b2335]/70 transition-colors uppercase tracking-wider"
                          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}
                        >
                          Читать
                          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>

                    {/* Accent line */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-px group-hover:w-0.5 transition-all duration-300"
                      style={{ background: categoryColors[article.category] || "#9b2335", opacity: 0.5 }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer note */}
        {filtered.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-16 text-white/10 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
          >
            Schwarz News · Majestic RP · {filtered.length} материал{filtered.length === 1 ? "" : filtered.length < 5 ? "а" : "ов"}
          </motion.p>
        )}
      </div>
    </div>
  );
}

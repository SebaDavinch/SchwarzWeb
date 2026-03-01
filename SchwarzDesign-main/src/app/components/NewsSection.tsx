import { motion } from "motion/react";
import { Megaphone } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData";

const priorityColors: Record<string, string> = {
  low: "#888899",
  normal: "#9b2335",
  high: "#ff3366",
};

export function NewsSection() {
  const { announcements } = useAdminData();

  const recentNews = announcements.slice(0, 6);

  if (recentNews.length === 0) return null;

  return (
    <section className="relative py-24 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#9b2335]/3 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="font-['Oswald'] text-[#9b2335]/60 uppercase tracking-[0.3em]"
            style={{ fontSize: "0.75rem" }}
          >
            Новости
          </span>
          <h2
            className="font-['Russo_One'] text-white mt-4"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: 1.2 }}
          >
            Последние события
          </h2>
          <div className="w-12 h-[2px] bg-[#9b2335] mx-auto mt-6" />
        </motion.div>

        <div className="space-y-4">
          {recentNews.map((news, i) => {
            const color = priorityColors[news.priority];
            return (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                <div className="flex items-stretch">
                  <div className="w-1 shrink-0" style={{ background: color }} />
                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Megaphone size={13} style={{ color, opacity: 0.5 }} />
                      <span
                        className="font-['Oswald'] text-white/60 tracking-wide"
                        style={{ fontSize: "0.88rem" }}
                      >
                        {news.title}
                      </span>
                      <span
                        className="font-['Oswald'] text-white/15 tracking-wide"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {news.date}
                      </span>
                      {news.pinned && (
                        <span
                          className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider border"
                          style={{
                            fontSize: "0.5rem",
                            color: "#f59e0b",
                            borderColor: "rgba(245,158,11,0.2)",
                            background: "rgba(245,158,11,0.05)",
                          }}
                        >
                          Закреплено
                        </span>
                      )}
                    </div>
                    <p
                      className="font-['Oswald'] text-white/25 tracking-wide group-hover:text-white/40 transition-colors duration-500"
                      style={{ fontSize: "0.8rem", lineHeight: 1.8 }}
                    >
                      {news.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
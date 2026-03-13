import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData";

/* HMR-safe: hook count in useAdminData was updated */
const priorityColors: Record<string, string> = {
  low: "#888899",
  normal: "#9b2335",
  high: "#ff3366",
};

export function NewsTicker() {
  const { pinnedAnnouncements, announcements } = useAdminData();
  const [dismissed, setDismissed] = useState(false);
  const [current, setCurrent] = useState(0);

  // Show pinned first, then recent high-priority
  const newsItems = pinnedAnnouncements.length > 0
    ? pinnedAnnouncements
    : announcements.filter((a) => a.priority === "high").slice(0, 3);

  useEffect(() => {
    if (newsItems.length <= 1) return;
    const iv = setInterval(() => {
      setCurrent((c) => (c + 1) % newsItems.length);
    }, 6000);
    return () => clearInterval(iv);
  }, [newsItems.length]);

  if (dismissed || newsItems.length === 0) return null;

  const item = newsItems[current];
  const color = priorityColors[item?.priority] || "#9b2335";

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="fixed top-16 left-0 right-0 z-40 border-b"
      style={{ borderColor: `${color}15`, background: `linear-gradient(to right, ${color}08, ${color}03)` }}
    >
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-3">
        <Megaphone size={13} style={{ color, opacity: 0.5 }} className="shrink-0" />

        <div className="flex-1 min-w-0 overflow-hidden relative h-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center"
            >
              <span
                className="font-['Oswald'] tracking-wide truncate"
                style={{ fontSize: "0.72rem", color: `${color}cc` }}
              >
                {item.title}
              </span>
              <span className="font-['Oswald'] text-white/20 tracking-wide truncate ml-3 hidden sm:inline" style={{ fontSize: "0.68rem" }}>
                {item.text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {newsItems.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setCurrent((c) => (c - 1 + newsItems.length) % newsItems.length)}
              className="text-white/15 hover:text-white/30 transition-colors p-0.5"
            >
              <ChevronLeft size={12} />
            </button>
            <span className="font-['Oswald'] text-white/15" style={{ fontSize: "0.6rem" }}>
              {current + 1}/{newsItems.length}
            </span>
            <button
              onClick={() => setCurrent((c) => (c + 1) % newsItems.length)}
              className="text-white/15 hover:text-white/30 transition-colors p-0.5"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="text-white/15 hover:text-white/30 transition-colors p-1 shrink-0"
        >
          <X size={12} />
        </button>
      </div>
    </motion.div>
  );
}
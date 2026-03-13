import { motion } from "motion/react";
import { TrendingUp, Lock, Clock, CheckCircle2 } from "lucide-react";
import type { Upgrade } from "../../hooks/useCabinetData";

interface Props {
  upgrades: Upgrade[];
}

const STATUS_CONFIG = {
  unlocked: {
    label: "Открыто",
    color: "#22c55e",
    bg: "#22c55e12",
    border: "#22c55e30",
    Icon: CheckCircle2,
  },
  planned: {
    label: "Планируется",
    color: "#f59e0b",
    bg: "#f59e0b12",
    border: "#f59e0b30",
    Icon: Clock,
  },
  locked: {
    label: "Заблокировано",
    color: "#888899",
    bg: "#88889912",
    border: "#88889930",
    Icon: Lock,
  },
};

export function CabinetUpgrades({ upgrades }: Props) {
  const categories = [...new Set(upgrades.map((u) => u.category))];

  const stats = {
    total: upgrades.length,
    unlocked: upgrades.filter((u) => u.status === "unlocked").length,
    planned: upgrades.filter((u) => u.status === "planned").length,
    locked: upgrades.filter((u) => u.status === "locked").length,
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp size={20} className="text-[#9b2335]" strokeWidth={1.5} />
        <h2
          className="text-white"
          style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.4rem" }}
        >
          Улучшения семьи
        </h2>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Открыто", value: stats.unlocked, color: "#22c55e" },
          { label: "Планируется", value: stats.planned, color: "#f59e0b" },
          { label: "Заблокировано", value: stats.locked, color: "#888899" },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-white/5 bg-white/[0.01] p-4 text-center"
          >
            <p
              className="mb-1"
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: "1.6rem",
                color: s.color,
              }}
            >
              {s.value}
            </p>
            <p
              className="text-white/30 uppercase tracking-widest"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-white/30 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}
          >
            Общий прогресс
          </span>
          <span
            className="text-white/50"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
          >
            {Math.round((stats.unlocked / stats.total) * 100)}%
          </span>
        </div>
        <div className="h-1 bg-white/5 w-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-[#9b2335] to-[#22c55e]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const catUpgrades = upgrades
            .filter((u) => u.category === cat)
            .sort((a, b) => a.order - b.order);

          return (
            <div key={cat}>
              <h3
                className="text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-3"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
              >
                <span className="flex-1 h-px bg-white/5" />
                {cat}
                <span className="flex-1 h-px bg-white/5" />
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catUpgrades.map((upgrade, i) => {
                  const cfg = STATUS_CONFIG[upgrade.status];
                  const { Icon } = cfg;

                  return (
                    <motion.div
                      key={upgrade.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border p-4 relative overflow-hidden transition-all duration-300"
                      style={{
                        borderColor: cfg.border,
                        background: cfg.bg,
                        opacity: upgrade.status === "locked" ? 0.5 : 1,
                      }}
                    >
                      {/* Background icon */}
                      <div className="absolute -right-2 -bottom-2 text-5xl opacity-10 pointer-events-none select-none">
                        {upgrade.icon}
                      </div>

                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{upgrade.icon}</span>
                          <div
                            className="flex items-center gap-1 px-1.5 py-0.5"
                            style={{
                              background: `${cfg.color}15`,
                              border: `1px solid ${cfg.color}30`,
                            }}
                          >
                            <Icon
                              size={9}
                              strokeWidth={2}
                              style={{ color: cfg.color }}
                            />
                            <span
                              className="uppercase tracking-wider"
                              style={{
                                fontFamily: "'Oswald', sans-serif",
                                fontSize: "0.5rem",
                                color: cfg.color,
                              }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>

                        <p
                          className="text-white/80 mb-1"
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: "0.9rem",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {upgrade.title}
                        </p>
                        <p
                          className="text-white/30 leading-relaxed"
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontSize: "0.7rem",
                          }}
                        >
                          {upgrade.description}
                        </p>

                        {upgrade.cost && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            <span
                              className="text-[#f59e0b]/60 uppercase tracking-wider"
                              style={{
                                fontFamily: "'Oswald', sans-serif",
                                fontSize: "0.6rem",
                              }}
                            >
                              Стоимость: {upgrade.cost}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

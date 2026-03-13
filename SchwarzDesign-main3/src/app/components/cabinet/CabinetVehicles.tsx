import { useState } from "react";
import { motion } from "motion/react";
import { Car, Shield, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import type { Vehicle } from "../../hooks/useCabinetData";
import { ROLE_RANK, ROLE_LABELS, ROLE_COLORS } from "../../hooks/useCabinetData";

interface Props {
  vehicles: Vehicle[];
  userRole?: string;
}

const statusConfig = {
  available: { label: "Доступен", color: "#22c55e", Icon: CheckCircle2 },
  in_use: { label: "Используется", color: "#f59e0b", Icon: AlertCircle },
  repair: { label: "На ТО", color: "#ff3366", Icon: Wrench },
};

export function CabinetVehicles({ vehicles, userRole }: Props) {
  const [filter, setFilter] = useState<"all" | "mine" | string>("all");
  const userRoleRank = userRole ? (ROLE_RANK[userRole] ?? 0) : 0;

  const categories = ["all", "mine", ...new Set(vehicles.map((v) => v.category))];

  const filtered = vehicles.filter((v) => {
    if (filter === "mine") {
      return ROLE_RANK[v.minRole] !== undefined
        ? userRoleRank >= ROLE_RANK[v.minRole]
        : true;
    }
    if (filter !== "all") return v.category === filter;
    return true;
  });

  const canAccess = (vehicle: Vehicle) => {
    if (!userRole) return false;
    const minRank = ROLE_RANK[vehicle.minRole] ?? 0;
    return userRoleRank >= minRank;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Car size={20} className="text-[#9b2335]" strokeWidth={1.5} />
        <h2
          className="text-white"
          style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.4rem" }}
        >
          Транспорт семьи
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1.5 uppercase tracking-wider transition-all duration-300"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "0.6rem",
              background:
                filter === cat ? "#9b233515" : "rgba(255,255,255,0.02)",
              border: `1px solid ${filter === cat ? "#9b233540" : "rgba(255,255,255,0.06)"}`,
              color:
                filter === cat ? "#9b2335" : "rgba(255,255,255,0.35)",
            }}
          >
            {cat === "all"
              ? "Все"
              : cat === "mine"
              ? "Доступные мне"
              : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-white/5 bg-white/[0.01] p-12 text-center">
          <Car size={32} className="text-white/10 mx-auto mb-4" strokeWidth={1} />
          <p
            className="text-white/20 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
          >
            Нет транспорта
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v, i) => {
            const accessible = canAccess(v);
            const sc = statusConfig[v.status];
            const { Icon: StatusIcon } = sc;
            const minRoleColor = ROLE_COLORS[v.minRole] ?? "#888899";
            const minRoleLabel = ROLE_LABELS[v.minRole] ?? v.minRole;

            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-white/5 bg-white/[0.01] overflow-hidden group hover:border-white/10 transition-all duration-300"
                style={{ opacity: accessible ? 1 : 0.4 }}
              >
                {/* Image */}
                <div className="relative h-36 bg-[#0d0d15] overflow-hidden">
                  {v.imageUrl ? (
                    <img
                      src={v.imageUrl}
                      alt={v.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car size={48} className="text-white/5" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

                  {/* Status */}
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1"
                    style={{
                      background: `${sc.color}15`,
                      border: `1px solid ${sc.color}30`,
                    }}
                  >
                    <StatusIcon size={9} strokeWidth={2} style={{ color: sc.color }} />
                    <span
                      className="uppercase tracking-wider"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: "0.5rem",
                        color: sc.color,
                      }}
                    >
                      {sc.label}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#0a0a0f]/80 border border-white/8">
                    <span
                      className="text-white/40 uppercase tracking-wider"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem" }}
                    >
                      {v.category}
                    </span>
                  </div>

                  {/* Locked overlay */}
                  {!accessible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/60">
                      <Shield size={24} className="text-white/20" strokeWidth={1} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p
                      className="text-white/80"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: "0.95rem",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {v.name}
                    </p>
                    {v.licensePlate && (
                      <span
                        className="text-white/25 shrink-0"
                        style={{ fontFamily: "monospace", fontSize: "0.65rem" }}
                      >
                        {v.licensePlate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div
                      className="flex items-center gap-1.5 px-2 py-0.5"
                      style={{
                        background: `${minRoleColor}10`,
                        border: `1px solid ${minRoleColor}25`,
                      }}
                    >
                      <Shield size={9} strokeWidth={1.5} style={{ color: minRoleColor }} />
                      <span
                        className="uppercase tracking-wider"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "0.52rem",
                          color: minRoleColor,
                        }}
                      >
                        {minRoleLabel}+
                      </span>
                    </div>

                    {accessible ? (
                      <span
                        className="text-[#22c55e]/50 uppercase tracking-wider"
                        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.52rem" }}
                      >
                        Доступен
                      </span>
                    ) : (
                      <span
                        className="text-[#ff3366]/40 uppercase tracking-wider"
                        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.52rem" }}
                      >
                        Нет доступа
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { motion } from "motion/react";
import { Building2, Home, Package, Car, MapPin, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { InfrastructureItem } from "../../hooks/useCabinetData";

interface Props {
  infrastructure: InfrastructureItem[];
}

const typeIcons: Record<string, typeof Home> = {
  house: Home,
  office: Building2,
  warehouse: Package,
  garage: Car,
  other: Building2,
};

const typeLabels: Record<string, string> = {
  house: "Особняк",
  office: "Офис",
  warehouse: "Склад",
  garage: "Гараж",
  other: "Объект",
};

const statusConfig = {
  active: { label: "Активен", color: "#22c55e", Icon: CheckCircle2 },
  planned: { label: "Планируется", color: "#f59e0b", Icon: Clock },
  lost: { label: "Утрачен", color: "#ff3366", Icon: XCircle },
};

export function CabinetInfrastructure({ infrastructure }: Props) {
  const active = infrastructure.filter((i) => i.status === "active");
  const planned = infrastructure.filter((i) => i.status === "planned");

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Building2 size={20} className="text-[#9b2335]" strokeWidth={1.5} />
        <h2
          className="text-white"
          style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.4rem" }}
        >
          Инфраструктура
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Активно", value: active.length, color: "#22c55e" },
          { label: "Планируется", value: planned.length, color: "#f59e0b" },
          {
            label: "Утрачено",
            value: infrastructure.filter((i) => i.status === "lost").length,
            color: "#ff3366",
          },
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

      {/* Grid */}
      {infrastructure.length === 0 ? (
        <div className="border border-white/5 bg-white/[0.01] p-12 text-center">
          <Building2 size={32} className="text-white/10 mx-auto mb-4" strokeWidth={1} />
          <p
            className="text-white/20 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
          >
            Нет объектов
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {infrastructure.map((item, i) => {
            const TypeIcon = typeIcons[item.type] ?? Building2;
            const sc = statusConfig[item.status];
            const { Icon: StatusIcon } = sc;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="border border-white/5 bg-white/[0.01] overflow-hidden group hover:border-white/10 transition-all duration-300"
                style={{ opacity: item.status === "lost" ? 0.5 : 1 }}
              >
                {/* Image */}
                <div className="relative h-36 bg-[#0d0d15] overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TypeIcon
                        size={40}
                        className="text-white/5"
                        strokeWidth={1}
                      />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />

                  {/* Type badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0f]/80 border border-white/10">
                    <TypeIcon size={10} className="text-white/50" strokeWidth={1.5} />
                    <span
                      className="text-white/50 uppercase tracking-wider"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: "0.55rem",
                      }}
                    >
                      {typeLabels[item.type]}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1"
                    style={{
                      background: `${sc.color}15`,
                      border: `1px solid ${sc.color}30`,
                    }}
                  >
                    <StatusIcon
                      size={9}
                      strokeWidth={2}
                      style={{ color: sc.color }}
                    />
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
                </div>

                {/* Content */}
                <div className="p-4">
                  <p
                    className="text-white/80 mb-1"
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: "0.95rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-white/30 leading-relaxed mb-3"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
                  >
                    {item.description}
                  </p>

                  {item.address && (
                    <div className="flex items-center gap-1.5 text-white/20">
                      <MapPin size={11} strokeWidth={1.5} />
                      <span
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "0.65rem",
                        }}
                      >
                        {item.address}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

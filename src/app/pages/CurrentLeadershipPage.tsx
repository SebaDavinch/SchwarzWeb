import { motion } from "motion/react";
import {
  Coffee,
  Sun,
  Palmtree,
  Clock,
  Gamepad2,
  MessageCircle,
  Trophy,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Link } from "react-router";
import { GlitchText } from "../components/GlitchText";
import { useAdminData, type Leadership } from "../hooks/useAdminData";
import { EditablePageSection } from "../components/EditablePageSection";

const pausedHeroBg =
  "https://images.unsplash.com/photo-1770174078859-39c33402d078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldCUyMHJlbGF4aW5nJTIwdmFjYXRpb24lMjBwYWxtJTIwdHJlZXN8ZW58MXx8fHwxNzcyMzE0ODA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const cityHeroBg =
  "https://images.unsplash.com/photo-1768286868224-4f9375c29913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdXJiYW4lMjBza3lsaW5lJTIwbmlnaHQlMjBtb29keXxlbnwxfHx8fDE3NzIwMzY0MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const metroHeroBg =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1600";
const sheriffHeroBg =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1600";
const fibHeroBg =
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1600";
const emsHeroBg =
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1600";
const weazelHeroBg =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1600";

const activities = [
  {
    icon: Gamepad2,
    title: "Играем в другие игры",
    desc: "Пока нет активной лидерки, часть состава играет в другие проекты. Но RP не забываем.",
  },
  {
    icon: MessageCircle,
    title: "Дискорд активен",
    desc: "Общение, планирование, обсуждения - все в Discord. Заходи, не стесняйся.",
  },
  {
    icon: Clock,
    title: "Готовимся к следующей",
    desc: "Набираем людей, обучаем, планируем. Когда пойдем на следующую лидерку - будем готовы.",
  },
];

type LeadershipHeroPreset = {
  key: string;
  match: RegExp;
  background: string;
  alt: string;
  accentColor: string;
  watermark: string;
  imageClassName: string;
  overlayClassName: string;
  primaryGlowClassName: string;
  secondaryGlowClassName: string;
  chips: Array<{ label: string; tone: string }>;
  description: (leadership: Leadership) => string;
};

const leadershipHeroPresets: LeadershipHeroPreset[] = [
  {
    key: "lspd",
    match: /(^|\b)lspd\b|los santos police/i,
    background: metroHeroBg,
    alt: "LSPD city patrol",
    accentColor: "#3b82f6",
    watermark: "LSPD",
    imageClassName: "object-center opacity-30 scale-[1.05]",
    overlayClassName: "bg-[linear-gradient(120deg,rgba(14,116,144,0.32)_0%,transparent_38%,transparent_62%,rgba(220,38,38,0.24)_100%)]",
    primaryGlowClassName: "absolute top-[14%] left-[8%] w-[240px] h-[240px] rounded-full blur-[140px] bg-[#38bdf8]/20",
    secondaryGlowClassName: "absolute bottom-[8%] right-[10%] w-[260px] h-[260px] rounded-full blur-[140px] bg-[#ef4444]/16",
    chips: [
      { label: "Metro Patrol", tone: "#93c5fd" },
      { label: "Code Blue", tone: "#e2e8f0" },
      { label: "Hot Pursuit", tone: "#fca5a5" },
    ],
    description: (leadership) =>
      `Schwarz Family держит ${leadership.faction} на сервере ${leadership.server}. Городской патруль, ночные погони и жёсткий контроль улиц Los Santos.`,
  },
  {
    key: "lssd",
    match: /(^|\b)lssd\b|los santos sheriff/i,
    background: sheriffHeroBg,
    alt: "LSSD county roads",
    accentColor: "#f59e0b",
    watermark: "LSSD",
    imageClassName: "object-center opacity-28 scale-[1.06]",
    overlayClassName: "bg-[linear-gradient(120deg,rgba(245,158,11,0.26)_0%,transparent_36%,transparent_64%,rgba(120,53,15,0.24)_100%)]",
    primaryGlowClassName: "absolute top-[18%] left-[12%] w-[260px] h-[260px] rounded-full blur-[150px] bg-[#f59e0b]/18",
    secondaryGlowClassName: "absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full blur-[140px] bg-[#fb923c]/14",
    chips: [
      { label: "County Watch", tone: "#fdba74" },
      { label: "Highway Unit", tone: "#fde68a" },
      { label: "Desert Shift", tone: "#fef3c7" },
    ],
    description: (leadership) =>
      `Schwarz Family ведёт ${leadership.faction} на сервере ${leadership.server}. Трассы, округ Блейн, перехваты на хайвеях и плотная sheriff-атмосфера без передышки.`,
  },
  {
    key: "fib",
    match: /(^|\b)fib\b|federal investigation bureau/i,
    background: fibHeroBg,
    alt: "FIB night operations",
    accentColor: "#8b5cf6",
    watermark: "FIB",
    imageClassName: "object-center opacity-30 scale-[1.06]",
    overlayClassName: "bg-[linear-gradient(115deg,rgba(35,71,132,0.28)_0%,transparent_38%,transparent_62%,rgba(124,24,38,0.34)_100%)]",
    primaryGlowClassName: "absolute top-[16%] left-[10%] w-[260px] h-[260px] rounded-full blur-[150px] bg-[#3b82f6]/20",
    secondaryGlowClassName: "absolute bottom-[8%] right-[10%] w-[280px] h-[280px] rounded-full blur-[150px] bg-[#ef4444]/20",
    chips: [
      { label: "Night Ops", tone: "#93c5fd" },
      { label: "Pursuit Mode", tone: "#fca5a5" },
      { label: "Case Files", tone: "#e2e8f0" },
    ],
    description: (leadership) =>
      `Schwarz Family держит ${leadership.faction} на сервере ${leadership.server}. Ночные выезды, перехваты и плотный оперативный темп без пауз.`,
  },
  {
    key: "sang",
    match: /(^|\b)sang\b|national guard|army|san andreas national guard/i,
    background: cityHeroBg,
    alt: "SANG tactical command",
    accentColor: "#22c55e",
    watermark: "SANG",
    imageClassName: "object-center opacity-25 scale-[1.04]",
    overlayClassName: "bg-[linear-gradient(120deg,rgba(34,197,94,0.24)_0%,transparent_34%,transparent_66%,rgba(234,179,8,0.16)_100%)]",
    primaryGlowClassName: "absolute top-[15%] left-[10%] w-[250px] h-[250px] rounded-full blur-[150px] bg-[#22c55e]/18",
    secondaryGlowClassName: "absolute bottom-[10%] right-[10%] w-[260px] h-[260px] rounded-full blur-[140px] bg-[#eab308]/12",
    chips: [
      { label: "Command Post", tone: "#86efac" },
      { label: "Rapid Response", tone: "#d9f99d" },
      { label: "Field Briefing", tone: "#fef08a" },
    ],
    description: (leadership) =>
      `Schwarz Family ведёт ${leadership.faction} на сервере ${leadership.server}. Военный ритм, дисциплина, колонны и постоянная готовность к развёртыванию.`,
  },
  {
    key: "ems",
    match: /(^|\b)ems\b|emergency medical|hospital/i,
    background: emsHeroBg,
    alt: "EMS emergency response",
    accentColor: "#ef4444",
    watermark: "EMS",
    imageClassName: "object-center opacity-24 scale-[1.05]",
    overlayClassName: "bg-[linear-gradient(120deg,rgba(239,68,68,0.30)_0%,transparent_36%,transparent_64%,rgba(255,255,255,0.12)_100%)]",
    primaryGlowClassName: "absolute top-[16%] left-[10%] w-[250px] h-[250px] rounded-full blur-[150px] bg-[#ef4444]/18",
    secondaryGlowClassName: "absolute bottom-[10%] right-[10%] w-[240px] h-[240px] rounded-full blur-[140px] bg-[#fca5a5]/14",
    chips: [
      { label: "Emergency Call", tone: "#fca5a5" },
      { label: "Red Zone", tone: "#fee2e2" },
      { label: "Rapid Aid", tone: "#ffffff" },
    ],
    description: (leadership) =>
      `Schwarz Family держит ${leadership.faction} на сервере ${leadership.server}. Экстренные вызовы, спасение под давлением и быстрый медицинский темп 24/7.`,
  },
  {
    key: "weazel",
    match: /weazel|news/i,
    background: weazelHeroBg,
    alt: "Weazel News newsroom",
    accentColor: "#ff3366",
    watermark: "NEWS",
    imageClassName: "object-center opacity-22 scale-[1.04]",
    overlayClassName: "bg-[linear-gradient(120deg,rgba(255,51,102,0.26)_0%,transparent_40%,transparent_64%,rgba(255,255,255,0.10)_100%)]",
    primaryGlowClassName: "absolute top-[15%] left-[10%] w-[240px] h-[240px] rounded-full blur-[140px] bg-[#ff3366]/18",
    secondaryGlowClassName: "absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full blur-[140px] bg-[#f472b6]/14",
    chips: [
      { label: "Breaking News", tone: "#fda4af" },
      { label: "Live Feed", tone: "#ffffff" },
      { label: "Prime Time", tone: "#fecdd3" },
    ],
    description: (leadership) =>
      `Schwarz Family ведёт ${leadership.faction} на сервере ${leadership.server}. Репортажи, прямые эфиры, инфоповоды и круглосуточный медиашум вокруг семьи.`,
  },
];

const defaultLeadershipPreset: LeadershipHeroPreset = {
  key: "default",
  match: /.*/,
  background: cityHeroBg,
  alt: "Leadership night skyline",
  accentColor: "#9b2335",
  watermark: "LEAD",
  imageClassName: "object-center opacity-24 scale-[1.03]",
  overlayClassName: "bg-[linear-gradient(120deg,rgba(155,35,53,0.24)_0%,transparent_38%,transparent_66%,rgba(255,255,255,0.08)_100%)]",
  primaryGlowClassName: "absolute top-[15%] left-[10%] w-[240px] h-[240px] rounded-full blur-[150px] bg-[#9b2335]/18",
  secondaryGlowClassName: "absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full blur-[140px] bg-[#ffffff]/8",
  chips: [
    { label: "Leadership", tone: "#fbcfe8" },
    { label: "Prime Status", tone: "#fde68a" },
    { label: "Schwarz Family", tone: "#ffffff" },
  ],
  description: (leadership) =>
    `Schwarz Family держит лидерку ${leadership.faction} на сервере ${leadership.server}. Активная фаза, полный контроль и готовность держать темп до конца срока.`,
};

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getLeadershipHeroPreset(faction?: string | null) {
  if (!faction) return defaultLeadershipPreset;
  return leadershipHeroPresets.find((preset) => preset.match.test(faction)) ?? defaultLeadershipPreset;
}

export function CurrentLeadershipPage() {
  const { getPageOverride, activeLeadership } = useAdminData();
  const heroPreset = getLeadershipHeroPreset(activeLeadership?.faction);

  const heroTitle =
    getPageOverride("current-leadership", "hero_title") ??
    (activeLeadership ? activeLeadership.faction : "Сейчас - отдыхаем");
  const heroTitlePlain = heroTitle.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const heroDesc =
    getPageOverride("current-leadership", "hero_desc") ??
    (activeLeadership
      ? heroPreset.description(activeLeadership)
      : "Активной лидерки сейчас нет. Семья на паузе - отдыхаем, набираемся сил и готовимся к следующей главе.");
  const statusLabel =
    getPageOverride("current-leadership", "status_label") ??
    (activeLeadership ? "Активная лидерка" : "На паузе");
  const activitiesTitle =
    getPageOverride("current-leadership", "activities_title") ?? "Между лидерками";
  const activitiesDesc =
    getPageOverride("current-leadership", "activities_desc") ?? "Чем заняты";

  const accentColor = activeLeadership ? heroPreset.accentColor ?? activeLeadership.color : "#f59e0b";
  const heroBg = activeLeadership ? heroPreset.background : pausedHeroBg;

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={heroBg}
          alt={activeLeadership ? heroPreset.alt : "Vacation"}
          className={`absolute inset-0 w-full h-full object-cover ${activeLeadership ? heroPreset.imageClassName : "object-center opacity-15"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/40 to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-[#0a0a0f]/25 to-[#0a0a0f]/80" />
        {activeLeadership && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}1a 0%, transparent 30%, transparent 70%, ${accentColor}14 100%)`,
            }}
          />
        )}
        {activeLeadership && (
          <>
            <div className={`absolute inset-0 ${heroPreset.overlayClassName}`} />
            <div className={heroPreset.primaryGlowClassName} />
            <div className={heroPreset.secondaryGlowClassName} />
            <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none overflow-hidden">
              <span
                className="font-['Russo_One'] text-white/[0.05] tracking-[0.25em] select-none whitespace-nowrap"
                style={{ fontSize: "clamp(4rem, 14vw, 10rem)" }}
              >
                {heroPreset.watermark}
              </span>
            </div>
          </>
        )}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[200px] rounded-full"
          style={{ background: `${accentColor}08` }}
        />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-6 h-[1px]" style={{ background: `${accentColor}4d` }} />
            {activeLeadership ? (
              <Trophy size={16} style={{ color: `${accentColor}80` }} />
            ) : (
              <Sun size={16} style={{ color: `${accentColor}80` }} />
            )}
            <span
              className="font-['Oswald'] uppercase tracking-[0.4em]"
              style={{ fontSize: "0.725rem", color: `${accentColor}80` }}
            >
              Schwarz Family
            </span>
            {activeLeadership ? (
              <Trophy size={16} style={{ color: `${accentColor}80` }} />
            ) : (
              <Coffee size={16} style={{ color: `${accentColor}80` }} />
            )}
            <div className="w-6 h-[1px]" style={{ background: `${accentColor}4d` }} />
          </motion.div>

          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white"
            style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 1.1 }}
            text={heroTitlePlain}
          >
            <span dangerouslySetInnerHTML={{ __html: heroTitle }} />
          </GlitchText>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-5 text-white/30 font-['Oswald'] tracking-wide max-w-lg mx-auto"
            style={{ fontSize: "1.025rem", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: heroDesc }}
          />

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-8 inline-flex items-center gap-2 px-4 py-2"
            style={{
              border: `1px solid ${accentColor}33`,
              background: `${accentColor}0d`,
            }}
          >
            {activeLeadership ? (
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: accentColor }}
              />
            ) : (
              <Coffee size={13} style={{ color: `${accentColor}80` }} />
            )}
            <span
              className="font-['Oswald'] uppercase tracking-[0.2em]"
              style={{ fontSize: "0.7rem", color: `${accentColor}b3` }}
            >
              {statusLabel}
            </span>
          </motion.div>

          {activeLeadership && heroPreset.chips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.4 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-2"
            >
              {heroPreset.chips.map((item) => (
                <span
                  key={item.label}
                  className="px-3 py-1 border bg-white/[0.04] backdrop-blur-sm font-['Oswald'] uppercase tracking-[0.2em]"
                  style={{
                    fontSize: "0.62rem",
                    color: item.tone,
                    borderColor: `${item.tone}33`,
                  }}
                >
                  {item.label}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Active leadership details */}
      {activeLeadership && (
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border bg-white/[0.015] p-8"
              style={{ borderColor: `${accentColor}22` }}
            >
              <div
                className="text-xs font-['Oswald'] uppercase tracking-[0.3em] mb-6"
                style={{ color: `${accentColor}60` }}
              >
                Текущая лидерка
              </div>
              <h2
                className="font-['Russo_One'] text-white mb-8"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}
              >
                {activeLeadership.faction}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: MapPin, label: "Сервер", value: activeLeadership.server },
                  { icon: User, label: "Лидер", value: activeLeadership.leader },
                  { icon: Calendar, label: "Начало", value: formatDate(activeLeadership.startDate) },
                  { icon: Calendar, label: "Конец", value: activeLeadership.endDate ? formatDate(activeLeadership.endDate) : "В процессе" },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-4 border border-white/[0.04] bg-white/[0.01]"
                  >
                    <Icon size={14} className="text-white/20 mt-0.5 shrink-0" />
                    <div>
                      <div
                        className="font-['Oswald'] uppercase tracking-[0.2em] text-white/25 mb-1"
                        style={{ fontSize: "0.6rem" }}
                      >
                        {label}
                      </div>
                      <div
                        className="font-['Oswald'] text-white/80"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* What we're doing when there is no active leadership */}
      {!activeLeadership && (
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <span
                className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.7rem" }}
              >
                {activitiesDesc}
              </span>
              <h2
                className="font-['Russo_One'] text-white mt-4"
                style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)", lineHeight: 1.2 }}
              >
                {activitiesTitle}
              </h2>
              <div className="w-12 h-[2px] bg-[#9b2335]/40 mx-auto mt-6" />
            </motion.div>

            <div className="space-y-4">
              {activities.map((a, i) => (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group flex gap-5 border border-white/5 bg-white/[0.01] p-6 hover:border-[#9b2335]/15 transition-all duration-500"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: "rgba(155,35,53,0.05)",
                      border: "1px solid rgba(155,35,53,0.15)",
                    }}
                  >
                    <a.icon size={16} className="text-[#9b2335]/50" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      className="font-['Oswald'] text-white uppercase tracking-wider mb-1"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {a.title}
                    </h3>
                    <p
                      className="font-['Oswald'] text-white/30 tracking-wide group-hover:text-white/45 transition-colors duration-500"
                      style={{ fontSize: "0.82rem", lineHeight: 1.8 }}
                    >
                      {a.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* History link */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border border-white/5 bg-white/[0.02] p-8 text-center"
          >
            <p
              className="font-['Oswald'] text-white/40 tracking-wide mb-4"
              style={{ fontSize: "0.95rem", lineHeight: 1.8 }}
            >
              Хочешь узнать, чем мы занимались до этого?
              <br />
              15+ сроков лидерства в LSPD, FIB, LSSD и Yakuza.
            </p>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 font-['Oswald'] uppercase tracking-[0.2em] text-[#9b2335]/70 hover:text-[#9b2335] border border-[#9b2335]/20 hover:border-[#9b2335]/40 px-6 py-2.5 transition-all duration-300"
              style={{ fontSize: "0.75rem" }}
            >
              Посмотреть историю
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Bottom quote */}
      {!activeLeadership && (
        <section className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mb-8" />
            <Palmtree size={22} className="text-[#f59e0b]/20 mx-auto mb-6" />
            <p
              className="font-['Russo_One'] text-white/40"
              style={{ fontSize: "1.15rem", lineHeight: 1.6 }}
            >
              "Даже на отдыхе -
              <br />
              мы остаемся Schwarz"
            </p>
            <p
              className="font-['Oswald'] text-white/15 uppercase tracking-[0.3em] mt-5"
              style={{ fontSize: "0.7rem" }}
            >
              - Schwarz Family, 2026
            </p>
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mt-8" />
          </motion.div>
        </section>
      )}

      <EditablePageSection pageId="current-leadership" />
    </div>
  );
}

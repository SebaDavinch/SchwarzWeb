import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown,
  Shield,
  Star,
  User,
  ChevronDown,
  ChevronUp,
  Calendar,
  Award,
  X,
} from "lucide-react";
import {
  useAdminData,
  BADGE_MAP,
  type AdminMember,
} from "../hooks/useAdminData";

/* ─── Role config ─── */
const ROLE_CONFIG = {
  owner: {
    label: "Owner",
    color: "#9b2335",
    icon: Crown,
    glow: "rgba(155,35,53,0.15)",
    border: "rgba(155,35,53,0.25)",
  },
  close: {
    label: "Close",
    color: "#c43e54",
    icon: Shield,
    glow: "rgba(196,62,84,0.12)",
    border: "rgba(196,62,84,0.2)",
  },
  main: {
    label: "Main",
    color: "#ff3366",
    icon: Star,
    glow: "rgba(255,51,102,0.1)",
    border: "rgba(255,51,102,0.15)",
  },
  academy: {
    label: "Academy",
    color: "#8b9dc3",
    icon: User,
    glow: "rgba(139,157,195,0.06)",
    border: "rgba(139,157,195,0.12)",
  },
};

/* ─── Default data ─── */
const defaultMembers: AdminMember[] = [
  { id: "1", name: "Madara Schwarz", role: "owner", joinDate: "2024-01-15", active: true, badges: ["streamer"] },
  /* Dep.Owner */
  { id: "d1", name: "Roman Schwarz", role: "close", joinDate: "2024-02-01", active: true, badges: ["leader"] },
  { id: "d2", name: "Akihiro Schwarz", role: "close", joinDate: "2024-02-01", active: true, badges: ["leader"] },
  /* Close */
  { id: "c1", name: "Coma Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c2", name: "Aloha Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c3", name: "Nel Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c4", name: "Farever Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c5", name: "Lays Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c6", name: "Daniel Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c7", name: "George Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c8", name: "Emelian Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c9", name: "Alexander Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c10", name: "Garik Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c11", name: "Decay Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c12", name: "Mil Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "c13", name: "Sneppik Schwarz", role: "close", joinDate: "2024-03-01", active: true, badges: [] },
  /* Old */
  { id: "o1", name: "Turbo Schwarz", role: "main", joinDate: "2024-02-10", active: true, badges: [] },
  { id: "o2", name: "Oleg Karp", role: "main", joinDate: "2024-02-15", active: true, badges: [] },
  { id: "o3", name: "Anti Schwarz", role: "main", joinDate: "2024-02-20", active: true, badges: [] },
  { id: "o4", name: "Cor Schwarz", role: "main", joinDate: "2024-03-01", active: true, badges: [] },
  { id: "o5", name: "Ilia Schwarz", role: "main", joinDate: "2024-03-05", active: true, badges: [] },
  { id: "o6", name: "Yamato Schwarz", role: "main", joinDate: "2024-03-10", active: true, badges: [] },
  { id: "o7", name: "Jay Schwarz", role: "main", joinDate: "2024-03-15", active: true, badges: [] },
  { id: "o8", name: "Richie Schwarz", role: "main", joinDate: "2024-03-20", active: true, badges: [] },
  { id: "o9", name: "Voldemar Schwarz", role: "main", joinDate: "2024-04-01", active: true, badges: [] },
  { id: "o10", name: "Svetlana Schwarz", role: "main", joinDate: "2024-04-05", active: true, badges: [] },
  { id: "o11", name: "Kerro Schwarz", role: "main", joinDate: "2024-04-10", active: true, badges: [] },
  { id: "o12", name: "Andrey Schwarz", role: "main", joinDate: "2024-04-15", active: true, badges: [] },
  /* Main */
  { id: "m1", name: "Clinkz Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m2", name: "Lina Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m3", name: "Mason Porsche", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m4", name: "Raffaa Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m5", name: "Chizik Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m6", name: "Liya Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m7", name: "Kseniya Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m8", name: "Lin Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m9", name: "Anatoliy Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m10", name: "Romeo Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m11", name: "Krasty Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m12", name: "Angel Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m13", name: "Maksim Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m14", name: "Patrick Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m15", name: "Terry Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m16", name: "Makoto Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m17", name: "Nazarok Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m18", name: "Brooklyn Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m19", name: "Yan Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m20", name: "Don Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m21", name: "Haruma Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m22", name: "Arisu Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m23", name: "Crim Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m24", name: "Foz Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m25", name: "Evgen Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m26", name: "Kitsune Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m27", name: "Daenerys Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m28", name: "Vovan Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m29", name: "Yaga Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m30", name: "Donald Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m31", name: "Marka Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m32", name: "Mihail Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m33", name: "Ham Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m34", name: "Shved Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m35", name: "Asya Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m36", name: "Lolita Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m37", name: "Ada Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m38", name: "Angelina Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m39", name: "Sayori Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m40", name: "Bogdan Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m41", name: "Sona Schwarz", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "m42", name: "Brizz Fortissax", role: "main", joinDate: "2024-05-01", active: true, badges: [] },
  /* Academy */
  { id: "a1", name: "King Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a2", name: "Jax Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a3", name: "Almaz Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a4", name: "Svyat Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a5", name: "Sophie Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a6", name: "Darki Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a7", name: "Zarki Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a8", name: "Bohdan Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a9", name: "Goga Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a10", name: "Adrian Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a11", name: "Chupapi Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a12", name: "Sebastian Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a13", name: "Takumi Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a14", name: "Fry Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a15", name: "Orkadiy Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "a16", name: "Reverie Schwarz", role: "academy", joinDate: "2024-06-01", active: true, badges: [] },
];

/* IDs of Dep.Owner members (visual sub-group within Close) */
const DEP_OWNER_IDS = new Set(["d1", "d2"]);
/* IDs of Old members (visual sub-group within Main) */
const OLD_IDS = new Set(["o1", "o2", "o3", "o4", "o5", "o6", "o7", "o8", "o9", "o10", "o11", "o12"]);

/* ─── Achievements ─── */
interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  check: (m: AdminMember) => { unlocked: boolean; progress: number; max: number };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "newcomer",
    label: "Новобранец",
    description: "Вступить в семью",
    icon: "🎮",
    color: "#9b2335",
    check: () => ({ unlocked: true, progress: 1, max: 1 }),
  },
  {
    id: "month_1",
    label: "Первый месяц",
    description: "Провести 30 дней в семье",
    icon: "📅",
    color: "#3b82f6",
    check: (m) => {
      const days = Math.floor(
        (Date.now() - new Date(m.joinDate).getTime()) / 86400000
      );
      return { unlocked: days >= 30, progress: Math.min(days, 30), max: 30 };
    },
  },
  {
    id: "days_100",
    label: "100 дней",
    description: "Провести 100 дней в семье",
    icon: "💯",
    color: "#f59e0b",
    check: (m) => {
      const days = Math.floor(
        (Date.now() - new Date(m.joinDate).getTime()) / 86400000
      );
      return { unlocked: days >= 100, progress: Math.min(days, 100), max: 100 };
    },
  },
  {
    id: "days_365",
    label: "Годовщина",
    description: "Провести 365 дней в семье",
    icon: "🏆",
    color: "#ff3366",
    check: (m) => {
      const days = Math.floor(
        (Date.now() - new Date(m.joinDate).getTime()) / 86400000
      );
      return { unlocked: days >= 365, progress: Math.min(days, 365), max: 365 };
    },
  },
  {
    id: "badge_collector",
    label: "Коллекционер",
    description: "Получить 3 или более бейджа",
    icon: "🎖️",
    color: "#9146ff",
    check: (m) => {
      const count = m.badges?.length ?? 0;
      return { unlocked: count >= 3, progress: Math.min(count, 3), max: 3 };
    },
  },
  {
    id: "veteran_rank",
    label: "Ветеран",
    description: "Получить ранг Veteran или выше",
    icon: "⭐",
    color: "#ff3366",
    check: (m) => {
      const isVet = ["owner", "close", "main"].includes(m.role);
      return { unlocked: isVet, progress: isVet ? 1 : 0, max: 1 };
    },
  },
  {
    id: "leadership",
    label: "Лидерство",
    description: "Стать Deputy Owner или выше",
    icon: "👑",
    color: "#9b2335",
    check: (m) => {
      const isLead = ["owner", "close"].includes(m.role);
      return { unlocked: isLead, progress: isLead ? 1 : 0, max: 1 };
    },
  },
  {
    id: "streamer_badge",
    label: "Стример",
    description: "Получить бейдж Стримера",
    icon: "📺",
    color: "#9146ff",
    check: (m) => {
      const has = m.badges?.includes("streamer") ?? false;
      return { unlocked: has, progress: has ? 1 : 0, max: 1 };
    },
  },
];

/* ─── Badge chip ─── */
function BadgeChip({ badgeId }: { badgeId: string }) {
  const badge = BADGE_MAP[badgeId];
  if (!badge) return null;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{
        fontSize: "0.55rem",
        color: badge.color,
        background: `${badge.color}10`,
        border: `1px solid ${badge.color}25`,
      }}
    >
      {badge.label}
    </span>
  );
}

/* ─── Member profile modal ─── */
function MemberProfile({
  member,
  onClose,
}: {
  member: AdminMember;
  onClose: () => void;
}) {
  const cfg = ROLE_CONFIG[member.role];
  const daysSinceJoin = Math.floor(
    (Date.now() - new Date(member.joinDate).getTime()) / 86400000
  );

  const showAchievements = !["owner", "close"].includes(member.role);

  const achievements = ACHIEVEMENTS.map((a) => ({
    ...a,
    result: a.check(member),
  }));

  const unlockedCount = achievements.filter((a) => a.result.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative bg-[#0d0d14] border border-white/10 max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div
          className="h-[2px]"
          style={{
            background: `linear-gradient(to right, transparent, ${cfg.color}66, transparent)`,
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 pb-6 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: `${cfg.color}10`,
              border: `2px solid ${cfg.border}`,
              boxShadow: `0 0 30px ${cfg.glow}`,
            }}
          >
            <cfg.icon size={30} style={{ color: cfg.color }} strokeWidth={1.5} />
          </div>
          <p
            className="font-['Oswald'] uppercase tracking-[0.3em] mb-2"
            style={{ fontSize: "0.6rem", color: cfg.color, opacity: 0.6 }}
          >
            {cfg.label}
          </p>
          <h2
            className="font-['Russo_One'] text-white"
            style={{ fontSize: "1.5rem" }}
          >
            {member.name}
          </h2>

          {/* Badges */}
          {member.badges && member.badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {member.badges.map((b) => (
                <BadgeChip key={b} badgeId={b} />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="px-8 pb-6">
          <div className={`grid ${showAchievements ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
            <div className="text-center p-3 border border-white/5 bg-white/[0.01]">
              <Calendar size={14} className="text-white/20 mx-auto mb-1" />
              <p
                className="font-['Russo_One']"
                style={{ fontSize: "1.1rem", color: cfg.color }}
              >
                {daysSinceJoin}
              </p>
              <p
                className="font-['Oswald'] text-white/20 uppercase tracking-wider mt-0.5"
                style={{ fontSize: "0.5rem" }}
              >
                Дней в семье
              </p>
            </div>
            <div className="text-center p-3 border border-white/5 bg-white/[0.01]">
              <Award size={14} className="text-white/20 mx-auto mb-1" />
              <p
                className="font-['Russo_One']"
                style={{ fontSize: "1.1rem", color: cfg.color }}
              >
                {member.badges?.length ?? 0}
              </p>
              <p
                className="font-['Oswald'] text-white/20 uppercase tracking-wider mt-0.5"
                style={{ fontSize: "0.5rem" }}
              >
                Бейджей
              </p>
            </div>
            {showAchievements && (
            <div className="text-center p-3 border border-white/5 bg-white/[0.01]">
              <Star size={14} className="text-white/20 mx-auto mb-1" />
              <p
                className="font-['Russo_One']"
                style={{ fontSize: "1.1rem", color: cfg.color }}
              >
                {unlockedCount}/{achievements.length}
              </p>
              <p
                className="font-['Oswald'] text-white/20 uppercase tracking-wider mt-0.5"
                style={{ fontSize: "0.5rem" }}
              >
                Ачивок
              </p>
            </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        {showAchievements && (
        <div className="px-8 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Award size={14} className="text-white/20" />
            <span
              className="font-['Oswald'] text-white/25 uppercase tracking-[0.3em]"
              style={{ fontSize: "0.6rem" }}
            >
              Достижения
            </span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="space-y-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 border transition-all duration-300 ${
                  ach.result.unlocked
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-white/5 bg-white/[0.005] opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: "1.2rem" }}>{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className="font-['Oswald'] uppercase tracking-wider"
                        style={{
                          fontSize: "0.75rem",
                          color: ach.result.unlocked ? ach.color : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {ach.label}
                      </p>
                      <span
                        className="font-['Oswald'] tracking-wider"
                        style={{
                          fontSize: "0.6rem",
                          color: ach.result.unlocked ? ach.color : "rgba(255,255,255,0.15)",
                        }}
                      >
                        {ach.result.progress}/{ach.result.max}
                      </span>
                    </div>
                    <p
                      className="font-['Oswald'] text-white/20 mt-0.5"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {ach.description}
                    </p>
                    {/* Progress bar */}
                    <div className="h-[3px] bg-white/5 mt-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(ach.result.progress / ach.result.max) * 100}%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="h-full"
                        style={{
                          background: ach.result.unlocked
                            ? `linear-gradient(90deg, ${ach.color}, ${ach.color}88)`
                            : "rgba(255,255,255,0.1)",
                          boxShadow: ach.result.unlocked
                            ? `0 0 8px ${ach.color}44`
                            : "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════ CONNECTOR LINE ═══════ */
function Connector({ color = "#9b2335" }: { color?: string }) {
  return (
    <div className="flex justify-center py-2">
      <div
        className="w-[1px] h-10"
        style={{
          background: `linear-gradient(to bottom, ${color}30, transparent)`,
        }}
      />
    </div>
  );
}

/* ═══════ TIER LABEL ═══════ */
function TierLabel({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div
        className="h-[1px] flex-1"
        style={{
          background: `linear-gradient(to right, transparent, ${color}20)`,
        }}
      />
      <span
        className="font-['Oswald'] uppercase tracking-[0.4em]"
        style={{ fontSize: "0.55rem", color: `${color}60` }}
      >
        {label}
      </span>
      <div
        className="h-[1px] flex-1"
        style={{
          background: `linear-gradient(to left, transparent, ${color}20)`,
        }}
      />
    </div>
  );
}

/* ═══════ TREE NODE ═══════ */
function TreeNode({
  member,
  onClick,
  size = "md",
}: {
  member: AdminMember;
  onClick: () => void;
  size?: "lg" | "md" | "sm";
}) {
  const cfg = ROLE_CONFIG[member.role];
  const Icon = cfg.icon;

  const sizeClasses = {
    lg: "p-6 sm:p-8",
    md: "p-5 sm:p-6",
    sm: "p-4",
  };

  const iconSize = { lg: 28, md: 20, sm: 16 };
  const iconBoxSize = { lg: 64, md: 48, sm: 40 };
  const nameSize = {
    lg: "clamp(1.3rem, 3vw, 1.8rem)",
    md: "0.9rem",
    sm: "0.8rem",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full relative rounded-xl overflow-hidden group text-left transition-all duration-500 ${sizeClasses[size]}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${cfg.color}55 50%, transparent 100%)`,
        }}
      />

      {/* Inner hover shine */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${cfg.color}08 0%, transparent 50%, ${cfg.color}05 100%)`,
          border: `1px solid ${cfg.color}20`,
          borderRadius: "inherit",
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-[180px] h-[80px] rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: `${cfg.color}18` }}
      />

      <div className="relative flex flex-col items-center text-center">
        <div
          className="rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
          style={{
            width: iconBoxSize[size],
            height: iconBoxSize[size],
            background: `${cfg.color}10`,
            border: `1px solid ${cfg.color}25`,
            boxShadow: `0 0 24px ${cfg.color}08`,
          }}
        >
          <Icon
            size={iconSize[size]}
            style={{ color: cfg.color }}
            strokeWidth={1.5}
          />
        </div>
        <p
          className="font-['Oswald'] uppercase tracking-[0.2em] mb-1"
          style={{ fontSize: "0.5rem", color: cfg.color, opacity: 0.7 }}
        >
          {cfg.label}
        </p>
        <h3
          className="font-['Russo_One'] text-white/90 group-hover:text-white transition-colors"
          style={{ fontSize: nameSize[size], lineHeight: 1.2 }}
        >
          {member.name}
        </h3>
        {member.badges && member.badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {member.badges.slice(0, 3).map((b) => (
              <BadgeChip key={b} badgeId={b} />
            ))}
          </div>
        )}
        <p
          className="font-['Oswald'] text-white/20 mt-2 tracking-wider"
          style={{ fontSize: "0.55rem" }}
        >
          Нажми для подробностей
        </p>
      </div>

      {/* Corner accents */}
      <div
        className="absolute top-2 left-2 w-3 h-3 border-l border-t rounded-tl-sm transition-colors duration-300"
        style={{ borderColor: `${cfg.color}18` }}
      />
      <div
        className="absolute top-2 right-2 w-3 h-3 border-r border-t rounded-tr-sm transition-colors duration-300"
        style={{ borderColor: `${cfg.color}18` }}
      />
      <div
        className="absolute bottom-2 left-2 w-3 h-3 border-l border-b rounded-bl-sm transition-colors duration-300"
        style={{ borderColor: `${cfg.color}18` }}
      />
      <div
        className="absolute bottom-2 right-2 w-3 h-3 border-r border-b rounded-br-sm transition-colors duration-300"
        style={{ borderColor: `${cfg.color}18` }}
      />
    </motion.button>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export function FamilyTreeSection() {
  const { members: adminMembers } = useAdminData();
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [expandedTiers, setExpandedTiers] = useState({
    close: true,
    old: true,
    main: true,
    academy: true,
  });

  const allMembers =
    adminMembers.length > 0
      ? adminMembers.filter((m) => m.active)
      : defaultMembers;

  const owner = allMembers.find((m) => m.role === "owner");
  const depOwners = allMembers.filter((m) => m.role === "close" && DEP_OWNER_IDS.has(m.id));
  const closeMembers = allMembers.filter((m) => m.role === "close" && !DEP_OWNER_IDS.has(m.id));
  const oldMembers = allMembers.filter((m) => m.role === "main" && OLD_IDS.has(m.id));
  const mainMembers = allMembers.filter((m) => m.role === "main" && !OLD_IDS.has(m.id));
  const academyMembers = allMembers.filter((m) => m.role === "academy");

  const toggleTier = (tier: keyof typeof expandedTiers) =>
    setExpandedTiers((p) => ({ ...p, [tier]: !p[tier] }));

  return (
    <section className="py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center font-['Oswald'] text-white/20 tracking-wide mb-10"
          style={{ fontSize: "0.8rem" }}
        >
          Нажми на любого участника, чтобы увидеть профиль и достижения
        </motion.p>

        {/* OWNER */}
        {owner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <TreeNode
              member={owner}
              size="lg"
              onClick={() => setSelectedMember(owner)}
            />
          </motion.div>
        )}

        <Connector />

        {/* DEP OWNERS */}
        <TierLabel label="Dep. Owner" color="#9b2335" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {depOwners.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <TreeNode
                member={m}
                size="md"
                onClick={() => setSelectedMember(m)}
              />
            </motion.div>
          ))}
        </div>

        <Connector color="#7a1c2a" />

        {/* CLOSE */}
        <div className="flex items-center justify-between">
          <TierLabel label="Close" color="#7a1c2a" />
          <button
            onClick={() => toggleTier("close")}
            className="text-white/20 hover:text-white/40 transition-colors"
          >
            {expandedTiers.close ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <AnimatePresence>
          {expandedTiers.close && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {closeMembers.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TreeNode
                      member={m}
                      size="sm"
                      onClick={() => setSelectedMember(m)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Connector color="#f59e0b" />

        {/* OLD */}
        <div className="flex items-center justify-between">
          <TierLabel label="Экс лидер" color="#f59e0b" />
          <button
            onClick={() => toggleTier("old")}
            className="text-white/20 hover:text-white/40 transition-colors"
          >
            {expandedTiers.old ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <AnimatePresence>
          {expandedTiers.old && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {oldMembers.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TreeNode
                      member={m}
                      size="sm"
                      onClick={() => setSelectedMember(m)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Connector color="#ff3366" />

        {/* MAIN */}
        <div className="flex items-center justify-between">
          <TierLabel label="Main" color="#ff3366" />
          <button
            onClick={() => toggleTier("main")}
            className="text-white/20 hover:text-white/40 transition-colors"
          >
            {expandedTiers.main ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <AnimatePresence>
          {expandedTiers.main && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {mainMembers.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TreeNode
                      member={m}
                      size="sm"
                      onClick={() => setSelectedMember(m)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Connector color="rgba(255,255,255,0.2)" />

        {/* ACADEMY */}
        <div className="flex items-center justify-between">
          <TierLabel label="Academy" color="rgba(255,255,255,0.4)" />
          <button
            onClick={() => toggleTier("academy")}
            className="text-white/20 hover:text-white/40 transition-colors"
          >
            {expandedTiers.academy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <AnimatePresence>
          {expandedTiers.academy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {academyMembers.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TreeNode
                      member={m}
                      size="sm"
                      onClick={() => setSelectedMember(m)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mb-4" />
          <p
            className="font-['Oswald'] text-white/15 uppercase tracking-[0.3em]"
            style={{ fontSize: "0.6rem" }}
          >
            Всего активных участников:{" "}
            <span className="text-[#9b2335]/40">{allMembers.length}</span>
          </p>
        </motion.div>
      </div>

      {/* Profile modal */}
      <AnimatePresence>
        {selectedMember && (
          <MemberProfile
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/** Legacy page — now merged into /members */
export function FamilyTreePage() {
  return <FamilyTreeSection />;
}
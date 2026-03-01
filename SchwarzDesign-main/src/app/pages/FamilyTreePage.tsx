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
  dep_owner: {
    label: "Deputy Owner",
    color: "#7a1c2a",
    icon: Shield,
    glow: "rgba(122,28,42,0.12)",
    border: "rgba(122,28,42,0.2)",
  },
  veteran: {
    label: "Veteran",
    color: "#ff3366",
    icon: Star,
    glow: "rgba(255,51,102,0.1)",
    border: "rgba(255,51,102,0.15)",
  },
  member: {
    label: "Member",
    color: "rgba(255,255,255,0.5)",
    icon: User,
    glow: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)",
  },
};

/* ─── Default data ─── */
const defaultMembers: AdminMember[] = [
  { id: "1", name: "Madara Schwarz", role: "owner", joinDate: "2024-01-15", active: true, badges: ["streamer"] },
  { id: "2", name: "Akihiro Schwarz", role: "dep_owner", joinDate: "2024-02-01", active: true, badges: ["leader", "fib"] },
  { id: "3", name: "Roman Schwarz", role: "dep_owner", joinDate: "2024-02-01", active: true, badges: ["leader", "fib"] },
  { id: "4", name: "Kerro Schwarz", role: "veteran", joinDate: "2024-03-10", active: true, badges: [] },
  { id: "5", name: "Turbo Schwarz", role: "veteran", joinDate: "2024-03-15", active: true, badges: [] },
  { id: "6", name: "Ilia Schwarz", role: "veteran", joinDate: "2024-04-01", active: true, badges: [] },
  { id: "7", name: "Jay Schwarz", role: "veteran", joinDate: "2024-04-05", active: true, badges: [] },
  { id: "8", name: "Anti Schwarz", role: "veteran", joinDate: "2024-05-01", active: true, badges: [] },
  { id: "9", name: "Richie Schwarz", role: "veteran", joinDate: "2024-05-10", active: true, badges: [] },
  { id: "10", name: "Voldemar Schwarz", role: "veteran", joinDate: "2024-06-01", active: true, badges: [] },
  { id: "11", name: "Brooklyn Schwarz", role: "member", joinDate: "2024-07-01", active: true, badges: [] },
  { id: "12", name: "Marka Schwarz", role: "member", joinDate: "2024-07-15", active: true, badges: [] },
  { id: "13", name: "Krasty Schwarz", role: "member", joinDate: "2024-08-01", active: true, badges: [] },
  { id: "14", name: "Patrick Schwarz", role: "member", joinDate: "2024-08-10", active: true, badges: [] },
];

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
      const isVet = ["owner", "dep_owner", "veteran"].includes(m.role);
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
      const isLead = ["owner", "dep_owner"].includes(m.role);
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

  const showAchievements = !["owner", "dep_owner"].includes(member.role);

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
  const circleSize = { lg: "w-16 h-16", md: "w-12 h-12", sm: "w-10 h-10" };
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
      className={`w-full relative border bg-white/[0.01] overflow-hidden group text-left transition-all duration-500 hover:bg-white/[0.03] ${sizeClasses[size]}`}
      style={{ borderColor: cfg.border }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(to right, transparent, ${cfg.color}44, transparent)`,
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ backgroundColor: cfg.glow }}
      />

      <div className="relative flex flex-col items-center text-center">
        <div
          className={`${circleSize[size]} rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110`}
          style={{
            background: `${cfg.color}08`,
            border: `1px solid ${cfg.border}`,
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
          style={{ fontSize: "0.5rem", color: cfg.color, opacity: 0.5 }}
        >
          {cfg.label}
        </p>
        <h3
          className="font-['Russo_One'] text-white group-hover:text-white transition-colors"
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
          className="font-['Oswald'] text-white/15 mt-2 tracking-wider"
          style={{ fontSize: "0.55rem" }}
        >
          Нажми для подробностей
        </p>
      </div>

      {/* Corner accents */}
      <div
        className="absolute top-2 left-2 w-3 h-3 border-l border-t transition-colors duration-300"
        style={{ borderColor: `${cfg.color}15` }}
      />
      <div
        className="absolute top-2 right-2 w-3 h-3 border-r border-t transition-colors duration-300"
        style={{ borderColor: `${cfg.color}15` }}
      />
      <div
        className="absolute bottom-2 left-2 w-3 h-3 border-l border-b transition-colors duration-300"
        style={{ borderColor: `${cfg.color}15` }}
      />
      <div
        className="absolute bottom-2 right-2 w-3 h-3 border-r border-b transition-colors duration-300"
        style={{ borderColor: `${cfg.color}15` }}
      />
    </motion.button>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export function FamilyTreeSection() {
  const { members: adminMembers } = useAdminData();
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [expandedTiers, setExpandedTiers] = useState({
    veterans: true,
    members: true,
  });

  const allMembers =
    adminMembers.length > 0
      ? adminMembers.filter((m) => m.active)
      : defaultMembers;

  const owner = allMembers.find((m) => m.role === "owner");
  const depOwners = allMembers.filter((m) => m.role === "dep_owner");
  const veterans = allMembers.filter((m) => m.role === "veteran");
  const members = allMembers.filter((m) => m.role === "member");

  const toggleTier = (tier: "veterans" | "members") =>
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
        <TierLabel label="Deputy Owners" color="#7a1c2a" />
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

        <Connector color="#ff3366" />

        {/* VETERANS */}
        <div className="flex items-center justify-between">
          <TierLabel label="Veterans" color="#ff3366" />
          <button
            onClick={() => toggleTier("veterans")}
            className="text-white/20 hover:text-white/40 transition-colors"
          >
            {expandedTiers.veterans ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>
        <AnimatePresence>
          {expandedTiers.veterans && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {veterans.map((m, i) => (
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

        {/* MEMBERS */}
        <div className="flex items-center justify-between">
          <TierLabel label="Members" color="rgba(255,255,255,0.4)" />
          <button
            onClick={() => toggleTier("members")}
            className="text-white/20 hover:text-white/40 transition-colors"
          >
            {expandedTiers.members ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>
        <AnimatePresence>
          {expandedTiers.members && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((m, i) => (
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
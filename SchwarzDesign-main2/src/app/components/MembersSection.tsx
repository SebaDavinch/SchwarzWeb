import { motion } from "motion/react";
import { Crown, Shield, Star, User, Users } from "lucide-react";
import { useAdminData, BADGE_MAP, type AdminMember } from "../hooks/useAdminData";

/* ─── Fallback data (used when admin hasn't set members) ─── */
const defaultOwner = {
  name: "Madara Schwarz",
  role: "owner" as const,
  badges: ["streamer"] as string[],
};

const defaultDepOwners = [
  { name: "Roman Schwarz", role: "close" as const, badges: ["leader"] as string[] },
  { name: "Akihiro Schwarz", role: "close" as const, badges: ["leader"] as string[] },
];

const defaultClose = [
  "Coma Schwarz", "Aloha Schwarz", "Nel Schwarz", "Farever Schwarz",
  "Lays Schwarz", "Daniel Schwarz", "George Schwarz", "Emelian Schwarz",
  "Alexander Schwarz", "Garik Schwarz", "Decay Schwarz", "Mil Schwarz",
  "Sneppik Schwarz",
];

const defaultOld = [
  "Turbo Schwarz", "Oleg Karp", "Anti Schwarz", "Cor Schwarz",
  "Ilia Schwarz", "Yamato Schwarz", "Jay Schwarz", "Richie Schwarz",
  "Voldemar Schwarz", "Svetlana Schwarz", "Kerro Schwarz", "Andrey Schwarz",
];

const defaultMain = [
  "Clinkz Schwarz", "Lina Schwarz", "Mason Porsche", "Raffaa Schwarz",
  "Chizik Schwarz", "Liya Schwarz", "Kseniya Schwarz", "Lin Schwarz",
  "Anatoliy Schwarz", "Romeo Schwarz", "Krasty Schwarz", "Angel Schwarz",
  "Maksim Schwarz", "Patrick Schwarz", "Terry Schwarz", "Makoto Schwarz",
  "Nazarok Schwarz", "Brooklyn Schwarz", "Yan Schwarz", "Don Schwarz",
  "Haruma Schwarz", "Arisu Schwarz", "Crim Schwarz", "Foz Schwarz",
  "Evgen Schwarz", "Kitsune Schwarz", "Daenerys Schwarz", "Vovan Schwarz",
  "Yaga Schwarz", "Donald Schwarz", "Marka Schwarz", "Mihail Schwarz",
  "Ham Schwarz", "Shved Schwarz", "Asya Schwarz", "Lolita Schwarz",
  "Ada Schwarz", "Angelina Schwarz", "Sayori Schwarz", "Bogdan Schwarz",
  "Sona Schwarz", "Brizz Fortissax",
];

const defaultAcademy = [
  "King Schwarz", "Jax Schwarz", "Almaz Schwarz", "Svyat Schwarz",
  "Sophie Schwarz", "Darki Schwarz", "Zarki Schwarz", "Bohdan Schwarz",
  "Goga Schwarz", "Adrian Schwarz", "Chupapi Schwarz", "Sebastian Schwarz",
  "Takumi Schwarz", "Fry Schwarz", "Orkadiy Schwarz", "Reverie Schwarz",
];

/* ─── Badge chip component ─── */
function BadgeChip({ badgeId }: { badgeId: string }) {
  const badge = BADGE_MAP[badgeId];
  if (!badge) return null;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full font-['Oswald'] uppercase tracking-wider backdrop-blur-sm"
      style={{
        fontSize: "0.5rem",
        color: badge.color,
        background: `${badge.color}18`,
        border: `1px solid ${badge.color}30`,
        boxShadow: `0 0 8px ${badge.color}10`,
      }}
    >
      {badge.label}
    </span>
  );
}

/* ─── Render badges row ─── */
function BadgesRow({ badges }: { badges?: string[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {badges.map((b) => <BadgeChip key={b} badgeId={b} />)}
    </div>
  );
}

/* ─── Glass card wrapper ─── */
function GlassCard({
  children,
  accentColor,
  className = "",
  hoverGlow = true,
}: {
  children: React.ReactNode;
  accentColor: string;
  className?: string;
  hoverGlow?: boolean;
}) {
  return (
    <div
      className={`group relative rounded-xl overflow-hidden transition-all duration-500 ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid rgba(255,255,255,0.08)`,
      }}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}55 50%, transparent 100%)`,
        }}
      />
      {/* Inner shine */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 50%, ${accentColor}05 100%)`,
          border: `1px solid ${accentColor}20`,
          borderRadius: "inherit",
        }}
      />
      {/* Hover glow blob */}
      {hoverGlow && (
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] h-[100px] rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundColor: `${accentColor}15` }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ─── Section divider ─── */
function SectionLabel({
  label,
  color,
  icon: Icon,
  count,
}: {
  label: string;
  color: string;
  icon: typeof Crown;
  count: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16 mb-8 flex items-center gap-4"
    >
      <div
        className="h-[1px] flex-1"
        style={{ background: `linear-gradient(to right, transparent, ${color}25)` }}
      />
      <div className="flex items-center gap-2.5">
        <Icon size={14} style={{ color, opacity: 0.6 }} strokeWidth={1.5} />
        <span
          className="font-['Oswald'] uppercase tracking-[0.3em]"
          style={{ fontSize: "0.65rem", color, opacity: 0.6 }}
        >
          {label}
        </span>
        <span
          className="font-['Oswald'] rounded-full px-2 py-0.5"
          style={{
            fontSize: "0.55rem",
            color: `${color}`,
            opacity: 0.4,
            background: `${color}10`,
            border: `1px solid ${color}15`,
          }}
        >
          {count}
        </span>
      </div>
      <div
        className="h-[1px] flex-1"
        style={{ background: `linear-gradient(to left, transparent, ${color}25)` }}
      />
    </motion.div>
  );
}

/* ─── Member card (small) ─── */
function MemberCard({
  name,
  role,
  color,
  icon: Icon,
  badges,
  delay = 0,
}: {
  name: string;
  role: string;
  color: string;
  icon: typeof Crown;
  badges?: string[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
    >
      <GlassCard accentColor={color} className="p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${color}12`,
              border: `1px solid ${color}25`,
              boxShadow: `0 0 20px ${color}08`,
            }}
          >
            <Icon size={16} style={{ color }} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p
              className="font-['Oswald'] uppercase tracking-[0.2em] mb-0.5"
              style={{ color, fontSize: "0.55rem", opacity: 0.7 }}
            >
              {role}
            </p>
            <h3
              className="font-['Oswald'] text-white/90 uppercase tracking-wider truncate"
              style={{ fontSize: "0.9rem" }}
            >
              {name}
            </h3>
            <BadgesRow badges={badges} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function MembersSection() {
  const { members: adminMembers } = useAdminData();
  const hasAdminData = adminMembers.length > 0;

  const adminOwner = adminMembers.find((m) => m.role === "owner" && m.active);
  const adminClose = adminMembers.filter((m) => m.role === "close" && m.active);
  const adminMain = adminMembers.filter((m) => m.role === "main" && m.active);
  const adminAcademy = adminMembers.filter((m) => m.role === "academy" && m.active);

  const ownerData = hasAdminData && adminOwner
    ? { name: adminOwner.name, badges: adminOwner.badges }
    : { name: defaultOwner.name, badges: defaultOwner.badges };

  const depOwnersData = hasAdminData && adminClose.length > 0
    ? adminClose.slice(0, 2).map((m) => ({ name: m.name, badges: m.badges }))
    : defaultDepOwners.map((m) => ({ name: m.name, badges: m.badges }));

  const closeData = hasAdminData && adminClose.length > 2
    ? adminClose.slice(2).map((m) => ({ name: m.name, badges: m.badges }))
    : defaultClose.map((n) => ({ name: n, badges: [] as string[] }));

  const oldData = !hasAdminData
    ? defaultOld.map((n) => ({ name: n, badges: [] as string[] }))
    : [];

  const mainData = hasAdminData && adminMain.length > 0
    ? adminMain.map((m) => ({ name: m.name, badges: m.badges }))
    : defaultMain.map((n) => ({ name: n, badges: [] as string[] }));

  const academyData = hasAdminData && adminAcademy.length > 0
    ? adminAcademy.map((m) => ({ name: m.name, badges: m.badges }))
    : defaultAcademy.map((n) => ({ name: n, badges: [] as string[] }));

  const totalCount = 1 + depOwnersData.length + closeData.length + oldData.length + mainData.length + academyData.length;

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span
            className="font-['Oswald'] text-[#9b2335]/60 uppercase tracking-[0.3em]"
            style={{ fontSize: "0.75rem" }}
          >
            Наши люди
          </span>
          <h2
            className="font-['Russo_One'] text-white mt-4"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 1.2 }}
          >
            Состав семьи
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-12 h-[2px] bg-[#9b2335]" />
            <span
              className="font-['Oswald'] text-white/25 uppercase tracking-wider"
              style={{ fontSize: "0.7rem" }}
            >
              {totalCount} участников
            </span>
            <div className="w-12 h-[2px] bg-[#9b2335]" />
          </div>
        </motion.div>

        {/* ═══════ OWNER ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-10"
        >
          <GlassCard accentColor="#9b2335" className="p-8 sm:p-10">
            {/* Corner accents */}
            <div className="absolute top-3 left-3 w-5 h-5 border-l border-t border-[#9b2335]/20 rounded-tl-md" />
            <div className="absolute top-3 right-3 w-5 h-5 border-r border-t border-[#9b2335]/20 rounded-tr-md" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-[#9b2335]/20 rounded-bl-md" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-[#9b2335]/20 rounded-br-md" />

            {/* Big glow behind */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full blur-[100px] pointer-events-none"
              style={{ backgroundColor: "rgba(155,35,53,0.06)" }}
            />

            <div className="relative flex flex-col items-center text-center">
              <div
                className="w-18 h-18 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  width: 72,
                  height: 72,
                  background: "rgba(155,35,53,0.1)",
                  border: "1px solid rgba(155,35,53,0.25)",
                  boxShadow: "0 0 40px rgba(155,35,53,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <Crown
                  size={28}
                  className="text-[#9b2335]"
                  strokeWidth={1.5}
                  style={{ filter: "drop-shadow(0 0 10px rgba(155,35,53,0.4))" }}
                />
              </div>
              <p
                className="font-['Oswald'] text-[#9b2335]/70 uppercase tracking-[0.3em] mb-2"
                style={{ fontSize: "0.6rem" }}
              >
                {ownerData.badges.includes("streamer") ? "Streamer & Owner" : "Owner"}
              </p>
              <h3
                className="font-['Russo_One'] text-white"
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                  lineHeight: 1.2,
                  textShadow: "0 0 30px rgba(155,35,53,0.15)",
                }}
              >
                {ownerData.name}
              </h3>
              <p
                className="font-['Oswald'] text-white/35 tracking-wide mt-3"
                style={{ fontSize: "0.75rem" }}
              >
                Основатель Schwarz Family. Стример — twitch.tv/nebesnyin
              </p>
              <BadgesRow badges={ownerData.badges} />
            </div>
          </GlassCard>

          {/* Connector */}
          <div className="flex justify-center">
            <div className="w-[1px] h-10 bg-gradient-to-b from-[#9b2335]/25 to-transparent" />
          </div>
        </motion.div>

        {/* ═══════ DEP. OWNERS ═══════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {depOwnersData.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <GlassCard accentColor="#9b2335" className="p-6 sm:p-7">
                <div className="flex items-center gap-5">
                  <div
                    className="w-13 h-13 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      width: 52,
                      height: 52,
                      background: "rgba(155,35,53,0.1)",
                      border: "1px solid rgba(155,35,53,0.2)",
                      boxShadow: "0 0 20px rgba(155,35,53,0.05)",
                    }}
                  >
                    <Shield size={22} style={{ color: "#9b2335" }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p
                      className="font-['Oswald'] uppercase tracking-[0.2em] mb-1"
                      style={{ color: "#9b2335", fontSize: "0.6rem", opacity: 0.8 }}
                    >
                      Dep. Owner
                    </p>
                    <h3
                      className="font-['Oswald'] text-white uppercase tracking-wider"
                      style={{ fontSize: "1.05rem" }}
                    >
                      {member.name}
                    </h3>
                    <BadgesRow badges={member.badges} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* ═══════ CLOSE ═══════ */}
        <SectionLabel label="Close" color="#c43e54" icon={Shield} count={closeData.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {closeData.map((m, i) => (
            <MemberCard
              key={m.name}
              name={m.name}
              role="Close"
              color="#c43e54"
              icon={Shield}
              badges={m.badges}
              delay={i * 0.04}
            />
          ))}
        </div>

        {/* ═══════ OLD ═══════ */}
        {oldData.length > 0 && (
          <>
            <SectionLabel label="Old" color="#f59e0b" icon={Star} count={oldData.length} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {oldData.map((m, i) => (
                <MemberCard
                  key={m.name}
                  name={m.name}
                  role="Old"
                  color="#f59e0b"
                  icon={Star}
                  badges={m.badges}
                  delay={i * 0.04}
                />
              ))}
            </div>
          </>
        )}

        {/* ═══════ MAIN ═══════ */}
        <SectionLabel label="Main" color="#ff3366" icon={Users} count={mainData.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {mainData.map((m, i) => (
            <MemberCard
              key={m.name}
              name={m.name}
              role="Main"
              color="#ff3366"
              icon={Star}
              badges={m.badges}
              delay={i * 0.03}
            />
          ))}
        </div>

        {/* ═══════ ACADEMY ═══════ */}
        <SectionLabel label="Academy" color="#8b9dc3" icon={User} count={academyData.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {academyData.map((m, i) => (
            <MemberCard
              key={m.name}
              name={m.name}
              role="Academy"
              color="#8b9dc3"
              icon={User}
              badges={m.badges}
              delay={i * 0.04}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

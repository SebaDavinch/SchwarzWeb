import { motion } from "motion/react";
import { Crown, Shield, Star, User } from "lucide-react";
import { useAdminData, BADGE_MAP, type AdminMember } from "../hooks/useAdminData";

/* ─── Fallback data (used when admin hasn't set members) ─── */
const defaultOwner = {
  name: "Madara Schwarz",
  role: "owner" as const,
  badges: ["streamer"] as string[],
};

const defaultDepOwners = [
  { name: "Akihiro Schwarz", role: "dep_owner" as const, badges: ["leader", "fib"] as string[] },
  { name: "Roman Schwarz", role: "dep_owner" as const, badges: ["leader", "fib"] as string[] },
];

const defaultVeterans = [
  "Kerro Schwarz", "Turbo Schwarz", "Ilia Schwarz", "Jay Schwarz",
  "Anti Schwarz", "Richie Schwarz", "Voldemar Schwarz",
];

const defaultMainRoster = [
  "Brooklyn Schwarz", "Marka Schwarz", "Krasty Schwarz", "Patrick Schwarz",
];

/* ─── Badge chip component ─── */
function BadgeChip({ badgeId }: { badgeId: string }) {
  const badge = BADGE_MAP[badgeId];
  if (!badge) return null;
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
      style={{
        fontSize: "0.5rem",
        color: badge.color,
        background: `${badge.color}10`,
        border: `1px solid ${badge.color}25`,
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
    <div className="flex flex-wrap gap-1 mt-1.5">
      {badges.map((b) => <BadgeChip key={b} badgeId={b} />)}
    </div>
  );
}

export function MembersSection() {
  const { members: adminMembers } = useAdminData();
  const hasAdminData = adminMembers.length > 0;

  // Categorize admin members
  const adminOwner = adminMembers.find((m) => m.role === "owner" && m.active);
  const adminDepOwners = adminMembers.filter((m) => m.role === "dep_owner" && m.active);
  const adminVeterans = adminMembers.filter((m) => m.role === "veteran" && m.active);
  const adminRoster = adminMembers.filter((m) => m.role === "member" && m.active);

  // Use admin data or fallback
  const ownerData = hasAdminData && adminOwner
    ? { name: adminOwner.name, badges: adminOwner.badges }
    : { name: defaultOwner.name, badges: defaultOwner.badges };

  const depOwnersData = hasAdminData && adminDepOwners.length > 0
    ? adminDepOwners.map((m) => ({ name: m.name, badges: m.badges }))
    : defaultDepOwners.map((m) => ({ name: m.name, badges: m.badges }));

  const veteransData = hasAdminData && adminVeterans.length > 0
    ? adminVeterans.map((m) => ({ name: m.name, badges: m.badges }))
    : defaultVeterans.map((n) => ({ name: n, badges: [] as string[] }));

  const rosterData = hasAdminData && adminRoster.length > 0
    ? adminRoster.map((m) => ({ name: m.name, badges: m.badges }))
    : defaultMainRoster.map((n) => ({ name: n, badges: [] as string[] }));

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
          <div className="w-12 h-[2px] bg-[#9b2335] mx-auto mt-6" />
        </motion.div>

        {/* ═══════ OWNER ═���═════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-12"
        >
          <div className="relative border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-8 sm:p-10 group hover:border-[#9b2335]/30 transition-all duration-500 overflow-hidden">
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(to right, transparent, #9b233566, transparent)",
              }}
            />

            {/* Corner accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-[#9b2335]/15" />
            <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-[#9b2335]/15" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-[#9b2335]/15" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-[#9b2335]/15" />

            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] bg-[#9b2335] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700" />

            <div className="relative flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{
                  background: "#9b233510",
                  border: "1px solid #9b233530",
                  boxShadow: "0 0 30px rgba(155,35,53,0.05)",
                }}
              >
                <Crown
                  size={26}
                  className="text-[#9b2335]"
                  strokeWidth={1.5}
                  style={{ filter: "drop-shadow(0 0 8px rgba(155,35,53,0.3))" }}
                />
              </div>
              <p
                className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.3em] mb-2"
                style={{ fontSize: "0.6rem" }}
              >
                {ownerData.badges?.includes("streamer") ? "Streamer" : "Owner"}
              </p>
              <h3
                className="font-['Russo_One'] text-white"
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                  lineHeight: 1.2,
                  filter: "drop-shadow(0 0 15px rgba(155,35,53,0.1))",
                }}
              >
                {ownerData.name}
              </h3>
              <p
                className="font-['Oswald'] text-white/20 tracking-wide mt-3"
                style={{ fontSize: "0.75rem" }}
              >
                Основатель Schwarz Family. Стример — twitch.tv/nebesnyin
              </p>
              <BadgesRow badges={ownerData.badges} />
            </div>
          </div>

          {/* Connector line to dep owners */}
          <div className="flex justify-center">
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#9b2335]/20 to-transparent" />
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
              className="group relative border border-white/5 bg-white/[0.02] p-7 hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, #9b233533, transparent)",
                }}
              />

              <div className="flex items-center gap-5">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "#9b233510",
                    border: "1px solid #9b233530",
                  }}
                >
                  <Shield
                    size={20}
                    style={{ color: "#9b2335" }}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p
                    className="font-['Oswald'] uppercase tracking-[0.2em] mb-1"
                    style={{ color: "#9b2335", fontSize: "0.6rem" }}
                  >
                    Dep. Owner
                  </p>
                  <h3
                    className="font-['Oswald'] text-white uppercase tracking-wider"
                    style={{ fontSize: "1rem" }}
                  >
                    {member.name}
                  </h3>
                  <BadgesRow badges={member.badges} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══════ VETERANS ═══════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 mb-8 flex items-center gap-4"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#ff3366]/15" />
          <div className="flex items-center gap-3">
            <Star size={14} className="text-[#ff3366]/50" strokeWidth={1.5} />
            <span
              className="font-['Oswald'] text-[#ff3366]/40 uppercase tracking-[0.3em]"
              style={{ fontSize: "0.65rem" }}
            >
              Старички
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#ff3366]/15" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {veteransData.map((name, i) => (
            <motion.div
              key={name.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group relative border border-white/5 bg-white/[0.02] p-6 hover:border-[#ff3366]/10 transition-all duration-500 overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, #ff336620, transparent)",
                }}
              />

              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "#ff336610",
                    border: "1px solid #ff336620",
                  }}
                >
                  <Star
                    size={16}
                    style={{ color: "#ff3366" }}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p
                    className="font-['Oswald'] uppercase tracking-[0.2em] mb-0.5"
                    style={{ color: "#ff3366", fontSize: "0.55rem", opacity: 0.5 }}
                  >
                    Veteran
                  </p>
                  <h3
                    className="font-['Oswald'] text-white/80 uppercase tracking-wider"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {name.name}
                  </h3>
                  <BadgesRow badges={name.badges} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══════ MAIN ROSTER ═══════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 mb-8 flex items-center gap-4"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/8" />
          <div className="flex items-center gap-3">
            <User size={14} className="text-white/30" strokeWidth={1.5} />
            <span
              className="font-['Oswald'] text-white/25 uppercase tracking-[0.3em]"
              style={{ fontSize: "0.65rem" }}
            >
              Основной состав
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/8" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rosterData.map((name, i) => (
            <motion.div
              key={name.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group relative border border-white/5 bg-white/[0.01] p-5 hover:border-white/10 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <User
                    size={15}
                    className="text-white/30"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p
                    className="font-['Oswald'] uppercase tracking-[0.2em] mb-0.5 text-white/20"
                    style={{ fontSize: "0.5rem" }}
                  >
                    Member
                  </p>
                  <h3
                    className="font-['Oswald'] text-white/70 uppercase tracking-wider"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {name.name}
                  </h3>
                  <BadgesRow badges={name.badges} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
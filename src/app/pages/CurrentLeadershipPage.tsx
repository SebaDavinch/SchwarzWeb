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
import { useAdminData } from "../hooks/useAdminData";
import { EditablePageSection } from "../components/EditablePageSection";

const heroBg =
  "https://images.unsplash.com/photo-1770174078859-39c33402d078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldCUyMHJlbGF4aW5nJTIwdmFjYXRpb24lMjBwYWxtJTIwdHJlZXN8ZW58MXx8fHwxNzcyMzE0ODA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const activities = [
  {
    icon: Gamepad2,
    title: "РРіСЂР°РµРј РІ РґСЂСѓРіРёРµ РёРіСЂС‹",
    desc: "РџРѕРєР° РЅРµС‚ Р°РєС‚РёРІРЅРѕР№ Р»РёРґРµСЂРєРё, С‡Р°СЃС‚СЊ СЃРѕСЃС‚Р°РІР° РёРіСЂР°РµС‚ РІ РґСЂСѓРіРёРµ РїСЂРѕРµРєС‚С‹. РќРѕ RP РЅРµ Р·Р°Р±С‹РІР°РµРј.",
  },
  {
    icon: MessageCircle,
    title: "Р”РёСЃРєРѕСЂРґ Р°РєС‚РёРІРµРЅ",
    desc: "РћР±С‰РµРЅРёРµ, РїР»Р°РЅРёСЂРѕРІР°РЅРёРµ, РѕР±СЃСѓР¶РґРµРЅРёСЏ вЂ” РІСЃС‘ РІ Discord. Р—Р°С…РѕРґРё, РЅРµ СЃС‚РµСЃРЅСЏР№СЃСЏ.",
  },
  {
    icon: Clock,
    title: "Р“РѕС‚РѕРІРёРјСЃСЏ Рє СЃР»РµРґСѓСЋС‰РµР№",
    desc: "РќР°Р±РёСЂР°РµРј Р»СЋРґРµР№, РѕР±СѓС‡Р°РµРј, РїР»Р°РЅРёСЂСѓРµРј. РљРѕРіРґР° РїРѕР№РґС‘Рј РЅР° СЃР»РµРґСѓСЋС‰СѓСЋ Р»РёРґРµСЂРєСѓ вЂ” Р±СѓРґРµРј РіРѕС‚РѕРІС‹.",
  },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "вЂ”";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function CurrentLeadershipPage() {
  const { getPageOverride, activeLeadership } = useAdminData();

  /* в”Ђв”Ђ fallback text overrides в”Ђв”Ђ */
  const heroTitle = getPageOverride("current-leadership", "hero_title") ?? (activeLeadership ? activeLeadership.faction : "РЎРµР№С‡Р°СЃ вЂ” РѕС‚РґС‹С…Р°РµРј");
  const heroTitlePlain = heroTitle.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const heroDesc = getPageOverride("current-leadership", "hero_desc") ??
    (activeLeadership
      ? `Schwarz Family РґРµСЂР¶РёС‚ Р»РёРґРµСЂРєСѓ ${activeLeadership.faction} РЅР° СЃРµСЂРІРµСЂРµ ${activeLeadership.server}.`
      : "РђРєС‚РёРІРЅРѕР№ Р»РёРґРµСЂРєРё СЃРµР№С‡Р°СЃ РЅРµС‚. РЎРµРјСЊСЏ РЅР° РїР°СѓР·Рµ вЂ” РѕС‚РґС‹С…Р°РµРј, РЅР°Р±РёСЂР°РµРјСЃСЏ СЃРёР» Рё РіРѕС‚РѕРІРёРјСЃСЏ Рє СЃР»РµРґСѓСЋС‰РµР№ РіР»Р°РІРµ.");
  const statusLabel = getPageOverride("current-leadership", "status_label") ?? (activeLeadership ? "РђРєС‚РёРІРЅР°СЏ Р»РёРґРµСЂРєР°" : "РќР° РїР°СѓР·Рµ");
  const activitiesTitle = getPageOverride("current-leadership", "activities_title") ?? "РњРµР¶РґСѓ Р»РёРґРµСЂРєР°РјРё";
  const activitiesDesc = getPageOverride("current-leadership", "activities_desc") ?? "Р§РµРј Р·Р°РЅСЏС‚С‹";

  const accentColor = activeLeadership?.color ?? "#f59e0b";

  return (
    <div className="pt-16">
      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђ HERO в•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={heroBg}
          alt="Vacation"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/70 via-transparent to-[#0a0a0f]/70" />
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
        </div>
      </div>

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђ ACTIVE LEADERSHIP DETAILS в•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
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
                РўРµРєСѓС‰Р°СЏ Р»РёРґРµСЂРєР°
              </div>
              <h2
                className="font-['Russo_One'] text-white mb-8"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}
              >
                {activeLeadership.faction}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: MapPin, label: "РЎРµСЂРІРµСЂ", value: activeLeadership.server },
                  { icon: User, label: "Р›РёРґРµСЂ", value: activeLeadership.leader },
                  { icon: Calendar, label: "РќР°С‡Р°Р»Рѕ", value: formatDate(activeLeadership.startDate) },
                  { icon: Calendar, label: "РљРѕРЅРµС†", value: activeLeadership.endDate ? formatDate(activeLeadership.endDate) : "Р’ РїСЂРѕС†РµСЃСЃРµ" },
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

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђ WHAT WE'RE DOING (only when no active) в•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
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

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђ HISTORY LINK в•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
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
              РҐРѕС‡РµС€СЊ СѓР·РЅР°С‚СЊ, С‡РµРј РјС‹ Р·Р°РЅРёРјР°Р»РёСЃСЊ РґРѕ СЌС‚РѕРіРѕ?
              <br />
              15+ СЃСЂРѕРєРѕРІ Р»РёРґРµСЂСЃС‚РІР° РІ LSPD, FIB, LSSD Рё Yakuza.
            </p>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 font-['Oswald'] uppercase tracking-[0.2em] text-[#9b2335]/70 hover:text-[#9b2335] border border-[#9b2335]/20 hover:border-[#9b2335]/40 px-6 py-2.5 transition-all duration-300"
              style={{ fontSize: "0.75rem" }}
            >
              РџРѕСЃРјРѕС‚СЂРµС‚СЊ РёСЃС‚РѕСЂРёСЋ
            </Link>
          </motion.div>
        </div>
      </section>

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђ BOTTOM в•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
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
              В«Р”Р°Р¶Рµ РЅР° РѕС‚РґС‹С…Рµ вЂ”
              <br />
              РјС‹ РѕСЃС‚Р°С‘РјСЃСЏ SchwarzВ»
            </p>
            <p
              className="font-['Oswald'] text-white/15 uppercase tracking-[0.3em] mt-5"
              style={{ fontSize: "0.7rem" }}
            >
              вЂ” Schwarz Family, 2026
            </p>
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mt-8" />
          </motion.div>
        </section>
      )}

      <EditablePageSection pageId="current-leadership" />
    </div>
  );
}

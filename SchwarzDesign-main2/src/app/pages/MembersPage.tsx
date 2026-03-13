import { motion } from "motion/react";
import { FamilyTreeSection } from "./FamilyTreePage";
import { GlitchText } from "../components/GlitchText";

export function MembersPage() {
  return (
    <div className="pt-16">
      {/* ══════════════════════ HERO ══════════════════════ */}
      <div className="relative h-[30vh] min-h-[220px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#9b2335]/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[200px] bg-[#9b2335] opacity-[0.03]" />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-6 h-[1px] bg-[#9b2335]/20" />
            <span
              className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.4em]"
              style={{ fontSize: "0.6rem" }}
            >
              Schwarz Family
            </span>
            <div className="w-6 h-[1px] bg-[#9b2335]/20" />
          </motion.div>

          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
            text="Наши люди"
          >
            Наши <span className="text-[#9b2335]">люди</span>
          </GlitchText>
        </div>
      </div>

      {/* ══════════════════════ CONTENT ══════════════════════ */}
      <FamilyTreeSection />
    </div>
  );
}
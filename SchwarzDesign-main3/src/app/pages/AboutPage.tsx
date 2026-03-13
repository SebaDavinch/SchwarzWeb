import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAdminData } from "../hooks/useAdminData";
import { GlitchText } from "../components/GlitchText";

const bgImage =
  "https://images.unsplash.com/photo-1722017862026-9a6b5e7c97bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGdyYWZmaXRpJTIwd2FsbCUyMGRhcmt8ZW58MXx8fHwxNzcyMDM0Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const timeline = [
  { year: "2022", event: "Основание Schwarz Family на Majestic RP." },
  { year: "2023", event: "Переход на GTA5RP." },
  { year: "2023–2026", event: "LSPD — 3 срока, FIB — 1 срок, LSSD — 3 срока, Yakuza — 5 сроков, FIB — 3 срока, 18 точек ВЗП." },
  { year: "2026", event: "Переход на Majestic RP." },
];

export function AboutPage() {
  const { getPageOverride } = useAdminData();
  const storyP1 = getPageOverride("about", "story_p1") ??
    "Schwarz Family — RP-семья, основанная в 2022 году на Majestic RP. За четыре года мы набрали опыт в разных фракциях: суммарно 15+ сроков лидерства в LSPD, FIB, LSSD и Yakuza на нескольких серверах. Мы не претендуем на звание лучших — просто делаем своё дело.";
  const storyP2 = getPageOverride("about", "story_p2") ??
    "Мы стримим, делаем контент, помогаем новичкам разобраться в RP. Есть опыт управления фракциями и проведения ивентов. Подход — ООС: без лишней драмы, с уважением к чужому времени. Сейчас мы снова на Majestic RP и открыты для новых людей.";

  return (
    <div className="pt-16">
      {/* Hero banner */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={bgImage}
          alt="Urban graffiti"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="relative z-10 text-center px-4">
          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
            text="О нас"
          >
            О <span className="text-[#9b2335]">нас</span>
          </GlitchText>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-white/50 font-['Oswald'] mb-8"
              style={{ fontSize: "1.05rem", lineHeight: 2 }}
            >
              {storyP1}
            </p>
            <p
              className="text-white/50 font-['Oswald'] mb-8"
              style={{ fontSize: "1.05rem", lineHeight: 2 }}
            >
              {storyP2}
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16"
          >
            <h2
              className="font-['Russo_One'] text-white mb-10"
              style={{ fontSize: "1.5rem" }}
            >
              Хронология
            </h2>
            <div className="space-y-0 border-l border-white/10 pl-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  className="relative pb-8 last:pb-0"
                >
                  <div className="absolute -left-[33px] top-1 w-2 h-2 rounded-full bg-[#9b2335]/60" />
                  <span
                    className="font-['Oswald'] text-[#9b2335]/60 uppercase tracking-wider"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {item.year}
                  </span>
                  <p
                    className="text-white/60 font-['Oswald'] mt-1"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
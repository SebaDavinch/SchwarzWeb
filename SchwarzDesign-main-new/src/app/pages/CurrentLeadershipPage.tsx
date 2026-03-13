import { motion } from "motion/react";
import {
  Coffee,
  Sun,
  Palmtree,
  Clock,
  Gamepad2,
  MessageCircle,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Link } from "react-router";
import { GlitchText } from "../components/GlitchText";

const heroBg =
  "https://images.unsplash.com/photo-1770174078859-39c33402d078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldCUyMHJlbGF4aW5nJTIwdmFjYXRpb24lMjBwYWxtJTIwdHJlZXN8ZW58MXx8fHwxNzcyMzE0ODA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const activities = [
  {
    icon: Gamepad2,
    title: "Играем в другие игры",
    desc: "Пока нет активной лидерки, часть состава играет в другие проекты. Но RP не забываем.",
  },
  {
    icon: MessageCircle,
    title: "Дискорд активен",
    desc: "Общение, планирование, обсуждения — всё в Discord. Заходи, не стесняйся.",
  },
  {
    icon: Clock,
    title: "Готовимся к следующей",
    desc: "Набираем людей, обучаем, планирум. Когда пойдём на следующую лидерку — будем готовы.",
  },
];

export function CurrentLeadershipPage() {
  return (
    <div className="pt-16">
      {/* ═══════ HERO ═══════ */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={heroBg}
          alt="Vacation"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/70 via-transparent to-[#0a0a0f]/70" />

        {/* Warm glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f59e0b]/5 blur-[200px] rounded-full" />

        <div className="relative z-10 text-center px-4">
          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white"
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1.1,
            }}
            text="Сейчас — отдыхаем"
          >
            Сейчас —{" "}
            <span
              className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 0 25px rgba(245,158,11,0.3))",
              }}
            >
              отдыхаем
            </span>
          </GlitchText>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center items-center gap-3 mt-4"
          >
            <div className="w-6 h-[1px] bg-[#f59e0b]/30" />
            <span
              className="font-['Oswald'] text-[#f59e0b]/50 uppercase tracking-[0.4em]"
              style={{ fontSize: "0.725rem" }}
            >
              Schwarz Family
            </span>
            <div className="w-6 h-[1px] bg-[#f59e0b]/30" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex justify-center items-center gap-3 mt-3"
          >
            <div className="w-6 h-[1px] bg-[#f59e0b]/30" />
            <Sun size={16} className="text-[#f59e0b]/50" />
            <Coffee size={16} className="text-[#f59e0b]/50" />
            <div className="w-6 h-[1px] bg-[#f59e0b]/30" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-5 text-white/30 font-['Oswald'] tracking-wide max-w-lg mx-auto"
            style={{ fontSize: "1.025rem", lineHeight: 1.7 }}
          >
            Активной лидерки сейчас нет. Семья на паузе — отдыхаем, набираемся
            сил и готовимся к следующей главе.
          </motion.p>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 border border-[#f59e0b]/20 bg-[#f59e0b]/5"
          >
            <Coffee size={13} className="text-[#f59e0b]/50" />
            <span
              className="font-['Oswald'] text-[#f59e0b]/70 uppercase tracking-[0.2em]"
              style={{ fontSize: "0.7rem" }}
            >
              На паузе
            </span>
          </motion.div>
        </div>
      </div>

      {/* ═══════ WHAT WE'RE DOING ═══════ */}
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
              Чем заняты
            </span>
            <h2
              className="font-['Russo_One'] text-white mt-4"
              style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)", lineHeight: 1.2 }}
            >
              Между лидерками
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
                  <a.icon
                    size={16}
                    className="text-[#9b2335]/50"
                    strokeWidth={1.5}
                  />
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

      {/* ═══════ HISTORY LINK ═══════ */}
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

      {/* ═══════ BOTTOM ═══════ */}
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
            «Даже на отдыхе —
            <br />
            мы остаёмся Schwarz»
          </p>
          <p
            className="font-['Oswald'] text-white/15 uppercase tracking-[0.3em] mt-5"
            style={{ fontSize: "0.7rem" }}
          >
            — Schwarz Family, 2026
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mt-8" />
        </motion.div>
      </section>
    </div>
  );
}
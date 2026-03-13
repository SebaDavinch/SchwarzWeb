import { motion } from "motion/react";
import { Wrench, FileArchive } from "lucide-react";
import { GlitchText } from "../components/GlitchText";

export function ReduxPage() {
  return (
    <div className="pt-16 min-h-screen flex flex-col">
      {/* Hero area */}
      <div className="flex-1 flex items-center justify-center px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-xl mx-auto"
        >
          {/* Label */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-6 h-[1px] bg-[#9b2335]/30" />
            <FileArchive size={16} className="text-[#9b2335]/50" />
            <span
              className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.4em]"
              style={{ fontSize: "0.725rem" }}
            >
              Schwarz Redux
            </span>
            <FileArchive size={16} className="text-[#9b2335]/50" />
            <div className="w-6 h-[1px] bg-[#9b2335]/30" />
          </div>

          {/* Title */}
          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white"
            style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 1.1 }}
            text="Наш Redux"
          >
            Наш{" "}
            <span
              className="bg-gradient-to-r from-[#9b2335] to-[#7a1c2a] bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 25px rgba(155,35,53,0.3))" }}
            >
              Редукс
            </span>
          </GlitchText>

          {/* Animated icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 mb-8 flex justify-center"
          >
            <div
              className="relative w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(155,35,53,0.08)",
                border: "1px solid rgba(155,35,53,0.2)",
                boxShadow: "0 0 60px rgba(155,35,53,0.08)",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Wrench
                  size={40}
                  className="text-[#9b2335]"
                  strokeWidth={1.5}
                  style={{ filter: "drop-shadow(0 0 12px rgba(155,35,53,0.3))" }}
                />
              </motion.div>

              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ border: "1px solid rgba(155,35,53,0.15)" }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
            style={{
              background: "rgba(155,35,53,0.08)",
              border: "1px solid rgba(155,35,53,0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-[#f59e0b]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span
              className="font-['Oswald'] text-[#f59e0b]/80 uppercase tracking-[0.2em]"
              style={{ fontSize: "0.7rem" }}
            >
              В разработке
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="font-['Oswald'] text-white/30 tracking-wide max-w-md mx-auto"
            style={{ fontSize: "0.95rem", lineHeight: 1.8 }}
          >
            Мы работаем над новой версией Schwarz Redux.
            Следи за обновлениями в нашем Discord — скоро анонсируем дату релиза.
          </motion.p>

          {/* Discord link */}
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            href="https://discord.gg/schwarzfamq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mt-10 px-6 py-3 rounded-lg font-['Oswald'] uppercase tracking-wider text-white/70 hover:text-white transition-all duration-300 group"
            style={{
              fontSize: "0.8rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span>Наш Discord</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="opacity-50 group-hover:opacity-80 transition-opacity"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
          </motion.a>

          {/* Bottom decorative line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-16"
          >
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#9b2335]/20 to-transparent mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

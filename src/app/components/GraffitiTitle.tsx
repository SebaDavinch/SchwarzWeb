import { motion } from "motion/react";
import { GlitchText } from "./GlitchText";

export function GraffitiTitle() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Glow effects */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[200px] bg-[#9b2335]/10 blur-[100px] rounded-full" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[400px] h-[100px] bg-[#ff3366]/8 blur-[80px] rounded-full translate-y-8" />
      </div>

      {/* Graffiti text */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Shadow layer */}
        <span
          className="absolute top-1 left-1 font-['Russo_One'] text-black/40"
          style={{ fontSize: "clamp(3rem, 10vw, 8rem)" }}
          aria-hidden="true"
        >
          SCHWARZ
        </span>

        {/* Main text with gradient */}
        <GlitchText
          as="h1"
          className="font-['Russo_One'] bg-gradient-to-b from-[#9b2335] via-[#9b2335] to-[#7a1c2a] bg-clip-text text-transparent relative"
          style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            lineHeight: 1.1,
            filter: "drop-shadow(0 0 30px rgba(155, 35, 53, 0.3))",
          }}
          text="SCHWARZ"
        >
          SCHWARZ
        </GlitchText>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative mt-2"
      >
        <span
          className="font-['Russo_One'] text-[#ff3366] tracking-[0.3em] uppercase"
          style={{
            fontSize: "clamp(1rem, 3vw, 2rem)",
            filter: "drop-shadow(0 0 15px rgba(255, 51, 102, 0.4))",
          }}
        >
          FAMILY
        </span>
      </motion.div>

      {/* Decorative spray dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#9b2335]/20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div
            key={`pink-${i}`}
            className="absolute rounded-full bg-[#ff3366]/15"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${50 + Math.random() * 50}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </motion.div>

      {/* Drip effect */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        className="absolute bottom-[-20px] left-[20%] w-[3px] h-[30px] bg-gradient-to-b from-[#9b2335]/60 to-transparent origin-top rounded-full"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
        className="absolute bottom-[-30px] right-[30%] w-[2px] h-[40px] bg-gradient-to-b from-[#9b2335]/40 to-transparent origin-top rounded-full"
      />
    </div>
  );
}
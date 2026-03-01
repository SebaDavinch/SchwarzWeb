import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const QUOTES = [
  "«Власть не дают — её берут» — Madara Schwarz",
  "«Семья — это не кровь. Это верность» — Schwarz Family",
  "«В этом городе мы пишем правила» — Seattle, Majestic RP",
  "«Уважение зарабатывается, а не покупается»",
  "«Schwarz — это не просто имя. Это образ жизни»",
  "«Когда семья рядом — ты непобедим»",
  "«Мы не играем. Мы создаём историю»",
  "«Лояльность — единственная валюта, которая не обесценивается»",
];

const TIPS = [
  "Сервер: Seattle — Majestic RP",
  "Овнер: Madara Schwarz",
  "Стрим: twitch.tv/nebesnyin",
  "Designed by Sebastian Schwarz",
];

export function GTALoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(() =>
    Math.floor(Math.random() * QUOTES.length)
  );
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Rotate quotes
    const quoteTimer = setInterval(() => {
      setQuoteIdx((p) => (p + 1) % QUOTES.length);
    }, 2500);
    return () => clearInterval(quoteTimer);
  }, []);

  useEffect(() => {
    // Progress bar
    const start = Date.now();
    const duration = 3500; // 3.5 seconds
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      // Ease out curve
      const eased = 1 - Math.pow(1 - pct, 3);
      setProgress(eased * 100);
      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 800);
        }, 300);
      }
    };
    requestAnimationFrame(tick);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!fadeOut ? (
        <motion.div
          key="loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] bg-[#050508] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
            }}
          />

          {/* Ambient glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[200px] bg-[#9b2335] opacity-[0.04]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] rounded-full blur-[150px] bg-[#ff3366] opacity-[0.03]" />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center px-6">
            {/* Family name */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <h1
                className="font-['Russo_One'] text-center"
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 5rem)",
                  lineHeight: 1,
                  background: "linear-gradient(135deg, #9b2335, #7a1c2a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 40px rgba(155,35,53,0.3))",
                }}
              >
                SCHWARZ
              </h1>
              <p
                className="font-['Oswald'] text-white/20 text-center uppercase tracking-[0.6em] mt-2"
                style={{ fontSize: "0.7rem" }}
              >
                Family
              </p>
            </motion.div>

            {/* Decorative line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "200px", opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="h-[1px] mb-10"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(155,35,53,0.3), transparent)",
              }}
            />

            {/* Rotating quote */}
            <div className="h-16 flex items-center justify-center max-w-lg">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="font-['Oswald'] text-white/30 text-center tracking-wide"
                  style={{ fontSize: "0.85rem", lineHeight: 1.6 }}
                >
                  {QUOTES[quoteIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom section with progress bar */}
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-10">
            {/* Progress bar */}
            <div className="max-w-lg mx-auto mb-6">
              <div className="h-[3px] bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, #9b2335, #7a1c2a)",
                    boxShadow: "0 0 15px rgba(155,35,53,0.4)",
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <span
                  className="font-['Oswald'] text-white/15 uppercase tracking-widest"
                  style={{ fontSize: "0.55rem" }}
                >
                  Загрузка...
                </span>
                <span
                  className="font-['Russo_One'] text-[#9b2335]/40"
                  style={{ fontSize: "0.75rem" }}
                >
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Tip at the bottom */}
            <p
              className="text-center font-['Oswald'] text-white/10 uppercase tracking-[0.3em]"
              style={{ fontSize: "0.55rem" }}
            >
              {TIPS[tipIdx]}
            </p>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-6 left-6 w-8 h-8 border-l border-t border-[#9b2335]/10" />
          <div className="absolute top-6 right-6 w-8 h-8 border-r border-t border-[#9b2335]/10" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-l border-b border-[#9b2335]/10" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-r border-b border-[#9b2335]/10" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tv, ExternalLink, Radio, Eye } from "lucide-react";

const TWITCH_CHANNEL = "nebesnyin";
const TWITCH_URL = `https://www.twitch.tv/${TWITCH_CHANNEL}`;

/**
 * Simulated Twitch live check.
 * In production, replace with real Twitch Helix API call.
 * For demo purposes, we simulate "live" status to showcase the UI.
 */
function useTwitchLiveStatus() {
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamTitle, setStreamTitle] = useState("");
  const [gameName, setGameName] = useState("");

  useEffect(() => {
    // Simulate live status — show as live for demo
    // In real implementation: fetch from Twitch Helix API
    const checkLive = () => {
      // Demo: randomly go live/offline, biased towards showing live for showcase
      const hour = new Date().getHours();
      // "Stream schedule" — live in evening hours (simulated)
      const simulatedLive = hour >= 18 || hour <= 2 || Math.random() > 0.4;
      setIsLive(simulatedLive);
      if (simulatedLive) {
        setViewerCount(Math.floor(800 + Math.random() * 3200));
        setStreamTitle("SCHWARZ FAMILY — Война за территории | Seattle");
        setGameName("Grand Theft Auto V");
      }
    };

    checkLive();
    const interval = setInterval(checkLive, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  return { isLive, viewerCount, streamTitle, gameName };
}

/* ═══════ COMPACT — for Hero / Navbar ═══════ */
export function TwitchLiveBadge() {
  const { isLive, viewerCount } = useTwitchLiveStatus();

  if (!isLive) return null;

  return (
    <motion.a
      href={TWITCH_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#9146ff]/10 border border-[#9146ff]/25 hover:bg-[#9146ff]/20 hover:border-[#9146ff]/40 transition-all duration-300 group"
    >
      {/* Pulsing live dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span
        className="font-['Russo_One'] text-red-400 uppercase"
        style={{ fontSize: "0.65rem" }}
      >
        LIVE
      </span>
      <span className="w-[1px] h-3 bg-white/10" />
      <Tv size={12} className="text-[#9146ff]" />
      <span
        className="font-['Oswald'] text-[#9146ff]/80 uppercase tracking-wider"
        style={{ fontSize: "0.6rem" }}
      >
        {viewerCount.toLocaleString()} зрителей
      </span>
    </motion.a>
  );
}

/* ═══════ FULL CARD — for HomePage ═══════ */
export function TwitchLiveCard() {
  const { isLive, viewerCount, streamTitle, gameName } = useTwitchLiveStatus();

  return (
    <AnimatePresence>
      {isLive && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="py-8 px-6"
        >
          <div className="max-w-5xl mx-auto">
            <a
              href={TWITCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative border border-[#9146ff]/15 bg-[#9146ff]/[0.02] overflow-hidden group hover:border-[#9146ff]/30 transition-all duration-500"
            >
              {/* Top accent */}
              <div
                className="h-[2px]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, #9146ff66, transparent)",
                }}
              />

              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[150px] bg-[#9146ff] opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700" />

              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Live indicator */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#9146ff]/10 border border-[#9146ff]/25">
                        <Tv
                          size={22}
                          className="text-[#9146ff]"
                          style={{
                            filter:
                              "drop-shadow(0 0 8px rgba(145,70,255,0.4))",
                          }}
                        />
                      </div>
                      {/* Pulsing LIVE badge */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 0 0px rgba(239,68,68,0.5)",
                            "0 0 12px rgba(239,68,68,0.8)",
                            "0 0 0px rgba(239,68,68,0.5)",
                          ],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                        className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 rounded-sm"
                      >
                        <span
                          className="font-['Russo_One'] text-white uppercase"
                          style={{ fontSize: "0.5rem" }}
                        >
                          LIVE
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Stream info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Radio size={12} className="text-red-400" />
                      <span
                        className="font-['Oswald'] text-red-400/80 uppercase tracking-widest"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Сейчас в эфире
                      </span>
                    </div>
                    <h3
                      className="font-['Russo_One'] text-white group-hover:text-[#9146ff] transition-colors duration-300 truncate"
                      style={{ fontSize: "1.1rem" }}
                    >
                      {streamTitle}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className="font-['Oswald'] text-[#9146ff]/50 tracking-wide"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {gameName}
                      </span>
                      <span className="w-[1px] h-3 bg-white/10" />
                      <span className="flex items-center gap-1.5">
                        <Eye size={12} className="text-red-400/50" />
                        <span
                          className="font-['Oswald'] text-red-400/60 tracking-wide"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {viewerCount.toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-[#9146ff]/10 border border-[#9146ff]/20 group-hover:bg-[#9146ff]/20 group-hover:border-[#9146ff]/40 transition-all duration-300 shrink-0">
                    <Tv size={14} className="text-[#9146ff]" />
                    <span
                      className="font-['Oswald'] text-[#9146ff] uppercase tracking-widest"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Смотреть
                    </span>
                    <ExternalLink size={12} className="text-[#9146ff]/50" />
                  </div>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-[#9146ff]/10" />
              <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-[#9146ff]/10" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-[#9146ff]/10" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-[#9146ff]/10" />
            </a>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/* ═══════ MEDIA PAGE EMBED — shows always with status ═══════ */
export function TwitchLiveEmbed() {
  const { isLive, viewerCount, streamTitle, gameName } = useTwitchLiveStatus();

  return (
    <div className="relative">
      {/* Status header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {isLive ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span
                className="font-['Russo_One'] text-red-400 uppercase"
                style={{ fontSize: "0.75rem" }}
              >
                В ЭФИРЕ
              </span>
              <span className="w-[1px] h-4 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Eye size={13} className="text-white/30" />
                <span
                  className="font-['Oswald'] text-white/40 tracking-wide"
                  style={{ fontSize: "0.75rem" }}
                >
                  {viewerCount.toLocaleString()} зрителей
                </span>
              </span>
            </>
          ) : (
            <>
              <span className="w-3 h-3 rounded-full bg-white/10" />
              <span
                className="font-['Oswald'] text-white/20 uppercase tracking-widest"
                style={{ fontSize: "0.7rem" }}
              >
                Оффлайн
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stream info if live */}
      {isLive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-4 bg-[#9146ff]/[0.03] border border-[#9146ff]/10"
        >
          <p
            className="font-['Russo_One'] text-white/80 truncate"
            style={{ fontSize: "0.9rem" }}
          >
            {streamTitle}
          </p>
          <p
            className="font-['Oswald'] text-[#9146ff]/40 tracking-wide mt-1"
            style={{ fontSize: "0.7rem" }}
          >
            {gameName}
          </p>
        </motion.div>
      )}
    </div>
  );
}

import { motion } from "motion/react";
import { ChevronDown, Send } from "lucide-react";
import { Link } from "react-router";
import { GraffitiTitle } from "./GraffitiTitle";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAdminData } from "../hooks/useAdminData";
import { TwitchLiveBadge } from "./TwitchLiveStatus";

const bgImage =
  "https://images.unsplash.com/photo-1696592875920-d98bf80d285e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdXJiYW4lMjBjaXR5JTIwbmlnaHQlMjBuZW9ufGVufDF8fHx8MTc3MjAzNDc4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function HeroSection() {
  const { getPageOverride } = useAdminData();
  const subtitle = getPageOverride("home", "hero_subtitle") ?? "Majestic Roleplay";
  const tagline = getPageOverride("home", "hero_tagline") ?? "Опыт. Контент. Команда. Семья.";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={bgImage}
          alt="City night"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]/80" />
      </div>

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-['Oswald'] text-white/40 tracking-[0.5em] uppercase mb-8"
          style={{ fontSize: "0.75rem" }}
        >
          {subtitle}
        </motion.p>

        <GraffitiTitle />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12 text-white/50 max-w-md mx-auto font-['Oswald'] tracking-wide"
          style={{ fontSize: "1rem" }}
        >
          {tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#about"
            className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 text-white/80 font-['Oswald'] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
            style={{ fontSize: "0.8rem" }}
          >
            Узнать больше
            <ChevronDown size={16} />
          </a>
          <Link
            to="/join"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#ff3366] text-white font-['Oswald'] uppercase tracking-[0.2em] hover:bg-[#ff4477] transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,51,102,0.2)]"
            style={{ fontSize: "0.8rem" }}
          >
            <Send size={14} />
            Вступить в семью
          </Link>
        </motion.div>

        {/* Twitch Live Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <TwitchLiveBadge />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown size={20} className="text-white/20" />
      </motion.div>
    </section>
  );
}
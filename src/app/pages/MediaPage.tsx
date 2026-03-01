import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { TwitchLiveEmbed, TwitchLiveBadge } from "../components/TwitchLiveStatus";
import { GlitchText } from "../components/GlitchText";
import { EditablePageSection } from "../components/EditablePageSection";
import { motion } from "motion/react";
import {
  Tv,
  Crown,
  Radio,
  Users,
  MapPin,
  ExternalLink,
  Play,
  Monitor,
  Gamepad2,
} from "lucide-react";

const heroBg =
  "https://images.unsplash.com/photo-1760999896198-b7e780e42500?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzZXR1cCUyMG5lb24lMjBwdXJwbGUlMjBzdHJlYW1pbmd8ZW58MXx8fHwxNzcyMDM3OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const seattleBg =
  "https://images.unsplash.com/photo-1725291848922-871e937bfd8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwY2l0eSUyMHNlYXR0bGUlMjBza3lsaW5lJTIwbmlnaHR8ZW58MXx8fHwxNzcyMDM3OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const TWITCH_CHANNEL = "nebesnyin";
const TWITCH_URL = `https://www.twitch.tv/${TWITCH_CHANNEL}`;

const highlights = [
  {
    icon: Crown,
    label: "Овнер семьи",
    value: "Madara Schwarz",
    color: "#9b2335",
    desc: "Основатель и бессменный лидер Schwarz Family",
  },
  {
    icon: Tv,
    label: "Twitch",
    value: "nebesnyin",
    color: "#9146ff",
    desc: "Стримы GTA RP, рейды и жизнь семьи в прямом эфире",
  },
  {
    icon: MapPin,
    label: "Сервер",
    value: "Seattle",
    color: "#ff3366",
    desc: "Majestic RP — основной проект семьи",
  },
  {
    icon: Gamepad2,
    label: "Контент",
    value: "GTA V RP",
    color: "#f59e0b",
    desc: "Ролевая игра, криминал, война за территории",
  },
];

export function MediaPage() {
  return (
    <div className="pt-16">
      {/* ═══════ HERO ═══════ */}
      <div className="relative h-[55vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={heroBg}
          alt="Gaming setup"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/70 via-transparent to-[#0a0a0f]/70" />

        {/* Purple Twitch glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[200px] rounded-full opacity-[0.06] bg-[#9146ff]" />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-6 h-[1px] bg-[#9146ff]/30" />
            <Radio size={16} className="text-[#9146ff]/60" />
            <span
              className="font-['Oswald'] text-[#9146ff]/60 uppercase tracking-[0.4em]"
              style={{ fontSize: "0.65rem" }}
            >
              Media & Streaming
            </span>
            <Radio size={16} className="text-[#9146ff]/60" />
            <div className="w-6 h-[1px] bg-[#9146ff]/30" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <GlitchText
              as="span"
              className="font-['Russo_One'] text-white"
              style={{
                fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
                lineHeight: 1.1,
              }}
              text="Madara Schwarz"
            >
              Madara{" "}
              <span
                className="bg-gradient-to-r from-[#9146ff] to-[#ff3366] bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 25px rgba(145,70,255,0.3))" }}
              >
                Schwarz
              </span>
            </GlitchText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-4 text-white/30 font-['Oswald'] tracking-wide max-w-lg mx-auto"
            style={{ fontSize: "0.9rem", lineHeight: 1.7 }}
          >
            Овнер Schwarz Family. Стример. Лидер на сервере Seattle — Majestic
            RP.
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            href={TWITCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mt-8 px-6 py-3 border border-[#9146ff]/30 bg-[#9146ff]/10 hover:bg-[#9146ff]/20 hover:border-[#9146ff]/50 transition-all duration-300 group"
          >
            <Tv
              size={18}
              className="text-[#9146ff] group-hover:drop-shadow-[0_0_8px_rgba(145,70,255,0.5)]"
            />
            <span
              className="font-['Oswald'] text-[#9146ff] uppercase tracking-widest"
              style={{ fontSize: "0.8rem" }}
            >
              twitch.tv/{TWITCH_CHANNEL}
            </span>
            <ExternalLink size={14} className="text-[#9146ff]/50" />
          </motion.a>
        </div>
      </div>

      {/* ═══════ KEY INFO CARDS ═══════ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="relative border border-white/5 bg-white/[0.01] p-6 group hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: `linear-gradient(to right, transparent, ${item.color}33, transparent)`,
                  }}
                />
                <Icon
                  size={20}
                  style={{ color: item.color }}
                  className="mb-3"
                />
                <p
                  className="font-['Oswald'] text-white/25 uppercase tracking-widest mb-1"
                  style={{ fontSize: "0.55rem" }}
                >
                  {item.label}
                </p>
                <p
                  className="font-['Russo_One'] text-white"
                  style={{
                    fontSize: "1.1rem",
                    color: item.color,
                    filter: `drop-shadow(0 0 8px ${item.color}33)`,
                  }}
                >
                  {item.value}
                </p>
                <p
                  className="font-['Oswald'] text-white/30 tracking-wide mt-2"
                  style={{ fontSize: "0.75rem", lineHeight: 1.6 }}
                >
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ TWITCH EMBED ═══════ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Section header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#9146ff]/10 border border-[#9146ff]/25">
                <Monitor size={18} className="text-[#9146ff]" />
              </div>
              <div className="flex-1">
                <h2
                  className="font-['Russo_One'] text-white"
                  style={{ fontSize: "1.5rem" }}
                >
                  Прямой эфир
                </h2>
                <p
                  className="font-['Oswald'] text-[#9146ff]/40 uppercase tracking-widest mt-0.5"
                  style={{ fontSize: "0.6rem" }}
                >
                  Twitch Channel
                </p>
              </div>
              <TwitchLiveBadge />
            </div>

            {/* Live status embed */}
            <TwitchLiveEmbed />

            {/* Twitch preview card (no iframe — external link) */}
            <a
              href={TWITCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-[#9146ff]/10 overflow-hidden group hover:border-[#9146ff]/30 transition-all duration-500"
            >
              <div
                className="h-[2px]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(145,70,255,0.4), transparent)",
                }}
              />
              <div className="relative aspect-video bg-[#0d0d14] flex flex-col items-center justify-center overflow-hidden">
                {/* Animated bg glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] bg-[#9146ff] opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-700" />

                {/* Play button */}
                <div className="relative w-20 h-20 rounded-full border-2 border-[#9146ff]/20 group-hover:border-[#9146ff]/50 flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110">
                  <Play
                    size={30}
                    className="text-[#9146ff]/60 group-hover:text-[#9146ff] transition-colors duration-500 ml-1"
                  />
                </div>

                <span
                  className="font-['Russo_One'] text-white/80 group-hover:text-white transition-colors duration-300"
                  style={{ fontSize: "1.3rem" }}
                >
                  nebesnyin
                </span>
                <span
                  className="font-['Oswald'] text-[#9146ff]/40 uppercase tracking-[0.3em] mt-2"
                  style={{ fontSize: "0.6rem" }}
                >
                  Смотреть на Twitch
                </span>

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-[#9146ff]/10 group-hover:border-[#9146ff]/30 transition-colors duration-500" />
                <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-[#9146ff]/10 group-hover:border-[#9146ff]/30 transition-colors duration-500" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-[#9146ff]/10 group-hover:border-[#9146ff]/30 transition-colors duration-500" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-[#9146ff]/10 group-hover:border-[#9146ff]/30 transition-colors duration-500" />
              </div>
              <div className="bg-[#0d0d14] px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#9146ff] group-hover:animate-pulse" />
                  <span
                    className="font-['Oswald'] text-white/50 uppercase tracking-wider"
                    style={{ fontSize: "0.7rem" }}
                  >
                    nebesnyin — Schwarz Family
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 border border-[#9146ff]/20 bg-[#9146ff]/5 group-hover:bg-[#9146ff]/15 transition-all duration-300">
                  <Tv size={12} className="text-[#9146ff]" />
                  <span
                    className="font-['Oswald'] text-[#9146ff]/80 uppercase tracking-widest"
                    style={{ fontSize: "0.6rem" }}
                  >
                    Открыть на Twitch
                  </span>
                  <ExternalLink size={10} className="text-[#9146ff]/40" />
                </div>
              </div>
            </a>

            {/* Chat — external link card */}
            <a
              href={`${TWITCH_URL}/chat`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block border border-[#9146ff]/10 overflow-hidden group hover:border-[#9146ff]/25 transition-all duration-500"
            >
              <div
                className="h-[2px]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(145,70,255,0.2), transparent)",
                }}
              />
              <div className="bg-[#0d0d14] px-6 py-8 flex items-center gap-5">
                <div className="w-12 h-12 rounded-full border border-[#9146ff]/15 group-hover:border-[#9146ff]/30 flex items-center justify-center shrink-0 transition-all duration-500">
                  <Users size={18} className="text-[#9146ff]/40 group-hover:text-[#9146ff]/70 transition-colors duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-['Russo_One'] text-white/60 group-hover:text-white/80 transition-colors duration-300"
                    style={{ fontSize: "1rem" }}
                  >
                    Чат стрима
                  </p>
                  <p
                    className="font-['Oswald'] text-white/20 tracking-wide mt-1"
                    style={{ fontSize: "0.7rem", lineHeight: 1.5 }}
                  >
                    Общаться с комьюнити Schwarz Family прямо во время эфира
                  </p>
                </div>
                <ExternalLink size={16} className="text-[#9146ff]/20 group-hover:text-[#9146ff]/50 shrink-0 transition-colors duration-500" />
              </div>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SEATTLE SERVER ═══════ */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={seattleBg}
            alt="Seattle"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[200px] rounded-full opacity-[0.04] bg-[#9b2335]" />

        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-[1px] mb-16"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(155,35,53,0.2), transparent)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <MapPin size={18} className="text-[#9b2335]/60" />
              <span
                className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.65rem" }}
              >
                Текущий сервер
              </span>
            </div>

            <h3
              className="font-['Russo_One'] text-white mb-2"
              style={{
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                lineHeight: 1.1,
              }}
            >
              Majestic RP —{" "}
              <span
                className="bg-gradient-to-r from-[#9b2335] to-[#7a1c2a] bg-clip-text text-transparent"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(155,35,53,0.3))",
                }}
              >
                Seattle
              </span>
            </h3>

            <p
              className="font-['Oswald'] text-white/30 tracking-wide max-w-lg mx-auto mb-8"
              style={{ fontSize: "0.85rem", lineHeight: 1.7 }}
            >
              Schwarz Family базируется на сервере Seattle проекта Majestic RP.
              Madara Schwarz привёл семью сюда и продолжает строить империю —
              теперь в прямом эфире для тысяч зрителей.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                {
                  icon: Crown,
                  label: "Проект",
                  value: "Majestic RP",
                  color: "#9b2335",
                },
                {
                  icon: MapPin,
                  label: "Сервер",
                  value: "Seattle",
                  color: "#ff3366",
                },
                {
                  icon: Users,
                  label: "Семья",
                  value: "Schwarz",
                  color: "#9b2335",
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="py-5 border border-white/5 bg-white/[0.01]"
                  >
                    <Icon
                      size={16}
                      style={{ color: s.color }}
                      className="mx-auto mb-2"
                    />
                    <span
                      className="font-['Russo_One'] block"
                      style={{
                        fontSize: "1.2rem",
                        color: s.color,
                        filter: `drop-shadow(0 0 8px ${s.color}33)`,
                      }}
                    >
                      {s.value}
                    </span>
                    <p
                      className="font-['Oswald'] text-white/25 uppercase tracking-wider mt-1"
                      style={{ fontSize: "0.6rem" }}
                    >
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CTA BOTTOM ═══════ */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#9146ff]/20 to-transparent mx-auto mb-8" />
          <Tv size={24} className="text-[#9146ff]/20 mx-auto mb-6" />
          <p
            className="font-['Russo_One'] text-white/50"
            style={{ fontSize: "1.2rem", lineHeight: 1.6 }}
          >
            «Мы не просто играем.
            <br />
            Мы создаём историю в прямом эфире»
          </p>
          <p
            className="font-['Oswald'] text-white/15 uppercase tracking-[0.3em] mt-5"
            style={{ fontSize: "0.6rem" }}
          >
            — Madara Schwarz
          </p>
          <a
            href={TWITCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 border border-[#9146ff]/20 bg-[#9146ff]/5 hover:bg-[#9146ff]/15 hover:border-[#9146ff]/40 transition-all duration-300"
          >
            <Tv size={14} className="text-[#9146ff]" />
            <span
              className="font-['Oswald'] text-[#9146ff]/80 uppercase tracking-widest"
              style={{ fontSize: "0.7rem" }}
            >
              Подписаться на Twitch
            </span>
          </a>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#9146ff]/20 to-transparent mx-auto mt-8" />
        </motion.div>
      </section>

      <EditablePageSection pageId="media" />
    </div>
  );
}
import { motion } from "motion/react";
import {
  Download,
  Monitor,
  ChevronRight,
  ExternalLink,
  Gift,
  ShoppingCart,
  Rocket,
  Gamepad2,
  Terminal,
  Copy,
  Check,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { GlitchText } from "../components/GlitchText";

/* ─── Store Links ─────────────────────────────── */
const stores = [
  {
    name: "Steam",
    url: "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/",
    color: "#1b2838",
    accent: "#66c0f4",
  },
  {
    name: "Epic Games",
    url: "https://store.epicgames.com/ru/p/grand-theft-auto-v",
    color: "#1a1a1a",
    accent: "#0078f2",
  },
  {
    name: "Rockstar",
    url: "https://store.rockstargames.com/game/buy-grand-theft-auto-v",
    color: "#1a1a1a",
    accent: "#fcaf17",
  },
];

/* ─── Tips ────────────────────────────────────── */
const tips = [
  "Не ломай RP — отыгрывай своего персонажа, а не себя",
  "Не используй информацию из Discord/Twitch в игре (метагейминг)",
  "Уважай других игроков — даже в конфликтных РП-ситуациях",
  "Микрофон обязателен — текстовый RP допустим, но голос предпочтительнее",
  "Прокачка занимает время — не торопись, наслаждайся процессом",
];

export function HowToPlayPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("/promo nebes");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-16">
      {/* ═══════ HERO ═══════ */}
      <div className="relative h-[30vh] min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#9b2335]/5 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <span
            className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.3em]"
            style={{ fontSize: "0.7rem" }}
          >
            Гайд для нович��в
          </span>
          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white mt-3"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
            }}
            text="Как начать играть?"
          >
            Как начать <span className="text-[#9b2335]">играть?</span>
          </GlitchText>
        </motion.div>
      </div>

      {/* ═══════ MAIN STEPS ═══════ */}
      <section className="relative py-20 px-6">
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#9b2335]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-0 w-[250px] h-[250px] bg-[#ff3366]/5 blur-[120px] rounded-full" />

        <div className="max-w-3xl mx-auto relative">
          {/* ───── STEP 1: BUY GTA 5 ───── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            {/* Step header */}
            <div className="flex items-start gap-6 mb-8">
              <div className="shrink-0 relative">
                <div
                  className="w-[62px] h-[62px] rounded-full flex items-center justify-center border"
                  style={{
                    background: "rgba(155,35,53,0.04)",
                    borderColor: "rgba(155,35,53,0.15)",
                  }}
                >
                  <ShoppingCart
                    size={24}
                    className="text-[#9b2335]/60"
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className="absolute -top-2 -right-1 font-['Russo_One'] text-[#9b2335]/30"
                  style={{ fontSize: "0.7rem" }}
                >
                  01
                </span>
              </div>
              <div className="pt-1">
                <h2
                  className="font-['Russo_One'] text-white"
                  style={{ fontSize: "1.6rem", lineHeight: 1.2 }}
                >
                  Купи{" "}
                  <span className="text-[#9b2335]">Grand Theft Auto V</span>
                </h2>
                <p
                  className="font-['Oswald'] text-white/35 tracking-wide mt-3"
                  style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
                >
                  Для игры на Majestic RP необходима лицензионная копия GTA 5.
                  Пиратские версии не поддерживаются — лаунчер просто не
                  запустится. Купить игру можно в любом из этих магазинов:
                </p>
              </div>
            </div>

            {/* Store buttons */}
            <div className="ml-0 sm:ml-[86px] grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stores.map((store, i) => (
                <motion.a
                  key={store.name}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="group relative overflow-hidden border border-white/8 hover:border-white/15 transition-all duration-500 p-5 text-center"
                  style={{ background: store.color }}
                >
                  {/* Top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-80 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to right, transparent, ${store.accent}, transparent)`,
                    }}
                  />
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700"
                    style={{ background: store.accent }}
                  />

                  <div className="relative">
                    <p
                      className="font-['Oswald'] uppercase tracking-[0.15em] group-hover:text-white transition-colors duration-300"
                      style={{ fontSize: "0.9rem", color: store.accent }}
                    >
                      {store.name}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <span
                        className="font-['Oswald'] text-white/25 uppercase tracking-wider"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Купить
                      </span>
                      <ExternalLink
                        size={10}
                        className="text-white/25"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Note */}
            <div className="ml-0 sm:ml-[86px] mt-4">
              <p
                className="font-['Oswald'] text-white/20 tracking-wide italic"
                style={{ fontSize: "0.75rem", lineHeight: 1.7 }}
              >
                * Подойдёт любая версия: обычная, Premium Edition или Enhanced.
                Главное — лицензия.
              </p>
            </div>
          </motion.div>

          {/* Connector */}
          <div className="flex justify-center mb-16">
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#9b2335]/20 to-transparent" />
          </div>

          {/* ───── STEP 2: MAJESTIC LAUNCHER ───── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-start gap-6 mb-8">
              <div className="shrink-0 relative">
                <div
                  className="w-[62px] h-[62px] rounded-full flex items-center justify-center border"
                  style={{
                    background: "rgba(155,35,53,0.04)",
                    borderColor: "rgba(155,35,53,0.15)",
                  }}
                >
                  <Rocket
                    size={24}
                    className="text-[#9b2335]/60"
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className="absolute -top-2 -right-1 font-['Russo_One'] text-[#9b2335]/30"
                  style={{ fontSize: "0.7rem" }}
                >
                  02
                </span>
              </div>
              <div className="pt-1">
                <h2
                  className="font-['Russo_One'] text-white"
                  style={{ fontSize: "1.6rem", lineHeight: 1.2 }}
                >
                  Скачай{" "}
                  <span className="text-[#9b2335]">Majestic Launcher</span>
                </h2>
                <p
                  className="font-['Oswald'] text-white/35 tracking-wide mt-3"
                  style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
                >
                  Majestic RP использует собственный лаунчер для подключения к
                  серверам. Скачай его с официального сайта, станови и
                  авторизуйся. Лаунчер автоматически найдёт твою копию GTA 5 и
                  настроит всё для игры.
                </p>
              </div>
            </div>

            {/* Download card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="ml-0 sm:ml-[86px]"
            >
              <div className="relative overflow-hidden border border-[#9b2335]/10 bg-gradient-to-br from-[#9b2335]/[0.03] to-transparent p-8">
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9b2335]/40 to-transparent" />
                {/* Corner glow */}
                <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-[#9b2335]/5 blur-[80px] rounded-full" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Download
                        size={18}
                        className="text-[#9b2335]/60"
                        strokeWidth={1.5}
                      />
                      <span
                        className="font-['Oswald'] text-[#9b2335]/60 uppercase tracking-[0.2em]"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Официальный лаунчер
                      </span>
                    </div>
                    <h3
                      className="font-['Russo_One'] text-white mb-2"
                      style={{ fontSize: "1.3rem" }}
                    >
                      Majestic Launcher
                    </h3>
                    <p
                      className="font-['Oswald'] text-white/25 tracking-wide"
                      style={{ fontSize: "0.78rem", lineHeight: 1.7 }}
                    >
                      Windows 10/11 · Бесплатно · Автообновление
                    </p>
                  </div>

                  <a
                    href="https://majestic-rp.ru/launcher"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 font-['Oswald'] uppercase tracking-[0.15em] text-white bg-[#9b2335] hover:bg-[#b52a40] px-7 py-3.5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(155,35,53,0.3)]"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <Download size={16} strokeWidth={2} />
                    Скачать
                  </a>
                </div>

                <div className="relative mt-5 pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9b2335]/40" />
                      <span
                        className="font-['Oswald'] text-white/20 tracking-wide"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Без вирусов
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9b2335]/40" />
                      <span
                        className="font-['Oswald'] text-white/20 tracking-wide"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Быстрая установка
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9b2335]/40" />
                      <span
                        className="font-['Oswald'] text-white/20 tracking-wide"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Все серверы в одном месте
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Connector */}
          <div className="flex justify-center mb-16">
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#9b2335]/20 to-transparent" />
          </div>

          {/* ───── STEP 3: REGISTRATION ───── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-start gap-6 mb-4">
              <div className="shrink-0 relative">
                <div
                  className="w-[62px] h-[62px] rounded-full flex items-center justify-center border"
                  style={{
                    background: "rgba(0,150,80,0.04)",
                    borderColor: "rgba(0,150,80,0.15)",
                  }}
                >
                  <Gamepad2
                    size={24}
                    className="text-[#009955]/60"
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className="absolute -top-2 -right-1 font-['Russo_One'] text-[#009955]/30"
                  style={{ fontSize: "0.7rem" }}
                >
                  03
                </span>
              </div>
              <div className="pt-1">
                <h2
                  className="font-['Russo_One'] text-white"
                  style={{ fontSize: "1.6rem", lineHeight: 1.2 }}
                >
                  Зарегистрируйся и{" "}
                  <span className="text-[#009955]">играй</span>
                </h2>
                <p
                  className="font-['Oswald'] text-white/35 tracking-wide mt-3"
                  style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
                >
                  Создай аккаунт на сервере, придумай имя персонажа в формате
                  Имя_Фамилия и пройди тест на знание правил. Изучи правила на
                  форуме или в Discord — незнание не освобождает от бана.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Connector */}
          <div className="flex justify-center mb-16">
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#009955]/20 to-[#ff3366]/10" />
          </div>

          {/* ═══════ PROMO CODE SECTION ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mb-20"
          >
            {/* Background glows */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#ff3366]/8 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[#f59e0b]/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative overflow-hidden border border-[#ff3366]/15 bg-gradient-to-br from-[#ff3366]/[0.04] via-[#0a0a0f] to-[#f59e0b]/[0.03]">
              {/* Top accent bar */}
              <div className="h-[3px] bg-gradient-to-r from-[#ff3366] via-[#f59e0b] to-[#ff3366]" />

              {/* Corner decorations */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#f59e0b]/5 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#ff3366]/5 blur-[80px] rounded-full" />

              <div className="relative p-8 md:p-10">
                {/* Badge */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#f59e0b]/20 bg-[#f59e0b]/5"
                  >
                    <Gift size={14} className="text-[#f59e0b]" />
                    <span
                      className="font-['Oswald'] text-[#f59e0b] uppercase tracking-[0.3em]"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Бонус от Schwarz Family
                    </span>
                    <Sparkles size={14} className="text-[#f59e0b]" />
                  </motion.div>
                </div>

                {/* Title */}
                <h2
                  className="font-['Russo_One'] text-white text-center"
                  style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", lineHeight: 1.3 }}
                >
                  Семейный{" "}
                  <span
                    className="bg-gradient-to-r from-[#ff3366] to-[#f59e0b] bg-clip-text text-transparent"
                  >
                    промокод
                  </span>
                </h2>

                <p
                  className="font-['Oswald'] text-white/35 tracking-wide text-center mt-4 max-w-lg mx-auto"
                  style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
                >
                  Введи наш промокод в чат на любом сервере Majestic RP и
                  получи стартовый бонус:
                </p>

                {/* Promo command card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mt-8 max-w-md mx-auto"
                >
                  <div className="relative border border-white/10 bg-[#0d0d15] overflow-hidden">
                    {/* Terminal header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                      <Terminal size={12} className="text-white/20" />
                      <span
                        className="font-['Oswald'] text-white/20 uppercase tracking-wider"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Игровой чат
                      </span>
                    </div>

                    {/* Command line */}
                    <div className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-3">
                        <span className="text-[#9b2335]/40" style={{ fontSize: "1rem" }}>
                          &gt;
                        </span>
                        <code
                          className="font-mono tracking-wider"
                          style={{
                            fontSize: "1.3rem",
                            color: "#f59e0b",
                            textShadow: "0 0 20px rgba(245,158,11,0.3)",
                          }}
                        >
                          /promo nebes
                        </code>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 border border-white/8 hover:border-[#f59e0b]/30 bg-white/[0.02] hover:bg-[#f59e0b]/5 transition-all duration-300"
                        title="Скопировать"
                      >
                        {copied ? (
                          <>
                            <Check size={14} className="text-[#9b2335]" />
                            <span
                              className="font-['Oswald'] text-[#9b2335] uppercase tracking-wider"
                              style={{ fontSize: "0.6rem" }}
                            >
                              Скопировано
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="text-white/30" />
                            <span
                              className="font-['Oswald'] text-white/30 uppercase tracking-wider"
                              style={{ fontSize: "0.6rem" }}
                            >
                              Копировать
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Rewards */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-8 flex flex-col sm:flex-row items-stretch gap-4 max-w-lg mx-auto"
                >
                  {/* Money reward */}
                  <div className="flex-1 border border-[#9b2335]/10 bg-[#9b2335]/[0.03] p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star size={16} className="text-[#9b2335]/60" />
                      <span
                        className="font-['Russo_One'] text-[#9b2335]"
                        style={{
                          fontSize: "1.5rem",
                          textShadow: "0 0 20px rgba(155,35,53,0.25)",
                        }}
                      >
                        $50.000
                      </span>
                    </div>
                    <p
                      className="font-['Oswald'] text-white/30 uppercase tracking-wider"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Игровая валюта
                    </p>
                  </div>

                  {/* Plus sign */}
                  <div className="flex items-center justify-center">
                    <span
                      className="font-['Russo_One'] text-white/15"
                      style={{ fontSize: "1.2rem" }}
                    >
                      +
                    </span>
                  </div>

                  {/* Premium reward */}
                  <div className="flex-1 border border-[#f59e0b]/10 bg-[#f59e0b]/[0.03] p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown size={16} className="text-[#f59e0b]/60" />
                      <span
                        className="font-['Russo_One'] text-[#f59e0b]"
                        style={{
                          fontSize: "1.1rem",
                          textShadow: "0 0 20px rgba(245,158,11,0.25)",
                        }}
                      >
                        Premium
                      </span>
                    </div>
                    <p
                      className="font-['Oswald'] text-white/30 uppercase tracking-wider"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Majestic Premium
                    </p>
                  </div>
                </motion.div>

                {/* How to activate */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-8 text-center"
                >
                  <p
                    className="font-['Oswald'] text-white/20 tracking-wide italic"
                    style={{ fontSize: "0.78rem", lineHeight: 1.8 }}
                  >
                    Открой игровой чат клавишей{" "}
                    <kbd className="px-1.5 py-0.5 border border-white/10 bg-white/5 text-white/40 not-italic" style={{ fontSize: "0.7rem" }}>
                      T
                    </kbd>{" "}
                    → введи команду → получи бонусы мгновенно
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ═══════ TIPS ═══════ */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#9b2335]/10" />
              <span
                className="font-['Oswald'] text-[#9b2335]/30 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.6rem" }}
              >
                Советы новичкам
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#9b2335]/10" />
            </div>

            <div className="space-y-3">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="flex items-start gap-3 group"
                >
                  <ChevronRight
                    size={14}
                    className="text-[#9b2335]/30 mt-0.5 shrink-0 group-hover:text-[#9b2335]/60 transition-colors"
                    strokeWidth={1.5}
                  />
                  <p
                    className="font-['Oswald'] text-white/30 tracking-wide group-hover:text-white/50 transition-colors duration-300"
                    style={{ fontSize: "0.8rem", lineHeight: 1.7 }}
                  >
                    {tip}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ═══════ CTA ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20 text-center"
          >
            <a
              href="https://majestic-rp.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-['Oswald'] uppercase tracking-[0.2em] text-[#9b2335]/60 hover:text-[#9b2335] border border-[#9b2335]/15 hover:border-[#9b2335]/30 px-8 py-3 transition-all duration-500"
              style={{ fontSize: "0.75rem" }}
            >
              Перейти на Majestic RP
              <ExternalLink size={14} strokeWidth={1.5} />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
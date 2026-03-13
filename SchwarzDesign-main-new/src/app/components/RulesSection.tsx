import { motion } from "motion/react";
import {
  ShieldAlert,
  Handshake,
  DoorClosed,
  Lock,
  Gavel,
  Brain,
  HeartHandshake,
  Users,
  Swords,
  Crown,
} from "lucide-react";

const coreRules = [
  {
    num: "I",
    title: "Уважай своих",
    icon: ShieldAlert,
    accent: "#ff3366",
    text: "Не делай того, что может задеть твоего софамовца. У каждого свои границы — и у каждого они разные. Избегай конфликтов внутри. Семья — это безопасная территория, а не поле боя.",
  },
  {
    num: "II",
    title: "Решай, а не молчи",
    icon: Handshake,
    accent: "#ff5577",
    text: "Стал участником конфликта — выходи на контакт, разговаривай, прикладывай усилия, чтобы всё сошло на нет. Тот, кто молчит, усугубляет. Если компромисс не найден — фаму покидают оба.",
  },
  {
    num: "III",
    title: "Ушёл — не вернёшься",
    icon: DoorClosed,
    accent: "#ff7744",
    text: "Кто покинул фаму по собственной воле — обратной дороги нет. Эмоции не должны стоить двух кликов и покинутого дискорда. Исключения возможны — но причина должна быть железной.",
  },
  {
    num: "IV",
    title: "Что внутри — остаётся внутри",
    icon: Lock,
    accent: "#cc44ff",
    text: "Всё, что происходит в фаме — ссоры, обсуждения, мысли, фразы, разговоры — не выносится наружу. Ни при каких обстоятельствах. Нарушитель покидает фаму без права на возврат.",
  },
];

const principles = [
  { icon: Gavel, text: "Не нарушать жёстко правила сервера" },
  { icon: Brain, text: "Быть адекватным за пределами семьи" },
  {
    icon: Swords,
    text: "Рассудительно относиться к любым РП-ситуациям",
  },
  { icon: HeartHandshake, text: "Помогать и поддерживать друг друга" },
  { icon: Users, text: "Уважать каждого — без исключений" },
  {
    icon: Crown,
    text: "Не опускаться до уровня животных, даже если животное напротив тебя",
  },
];

export function RulesSection() {
  return (
    <section className="relative py-32 px-6">
      {/* Background accents */}
      <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-[#ff3366]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-0 w-[250px] h-[250px] bg-[#cc44ff]/5 blur-[120px] rounded-full" />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span
            className="font-['Oswald'] text-[#ff3366]/60 uppercase tracking-[0.3em]"
            style={{ fontSize: "0.75rem" }}
          >
            Кодекс Schwarz
          </span>
          <h2
            className="font-['Russo_One'] text-white mt-4"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              lineHeight: 1.2,
            }}
          >
            Правила семьи
          </h2>
          <div className="w-12 h-[2px] bg-[#ff3366] mx-auto mt-6" />
        </motion.div>

        {/* Epigraph */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-20 max-w-xl mx-auto"
        >
          <p
            className="font-['Oswald'] text-white/25 italic tracking-wide"
            style={{ fontSize: "0.8rem", lineHeight: 1.8 }}
          >
            «Нет жёстких обязательств — но есть правила и разумные рамки.
            Касается каждого. Лично.»
          </p>
        </motion.div>

        {/* ═══════ CORE RULES ═══════ */}
        <div className="space-y-6">
          {coreRules.map((rule, i) => (
            <motion.div
              key={rule.num}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: `linear-gradient(to right, transparent, ${rule.accent}40, transparent)`,
                }}
              />

              {/* Left accent stripe */}
              <div
                className="absolute top-0 left-0 w-[3px] h-full opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                style={{ background: rule.accent }}
              />

              {/* Glow on hover */}
              <div
                className="absolute top-0 left-0 w-[200px] h-full blur-[80px] opacity-0 group-hover:opacity-[0.04] transition-opacity duration-700"
                style={{ background: rule.accent }}
              />

              <div className="relative p-7 sm:p-8 flex gap-6">
                {/* Number + Icon */}
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <span
                    className="font-['Russo_One'] opacity-20 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ fontSize: "1.8rem", color: rule.accent }}
                  >
                    {rule.num}
                  </span>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `${rule.accent}08`,
                      border: `1px solid ${rule.accent}20`,
                    }}
                  >
                    <rule.icon
                      size={18}
                      style={{ color: rule.accent, opacity: 0.6 }}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <h3
                    className="font-['Oswald'] text-white uppercase tracking-wider mb-3"
                    style={{ fontSize: "1rem" }}
                  >
                    {rule.title}
                  </h3>
                  <p
                    className="text-white/35 font-['Oswald'] tracking-wide group-hover:text-white/50 transition-colors duration-500"
                    style={{ fontSize: "0.82rem", lineHeight: 1.9 }}
                  >
                    {rule.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══════ PRINCIPLES DIVIDER ═══════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24 mb-10 flex items-center gap-4"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/6" />
          <span
            className="font-['Oswald'] text-white/15 uppercase tracking-[0.3em]"
            style={{ fontSize: "0.6rem" }}
          >
            Не менее важно
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/6" />
        </motion.div>

        {/* ═══════ PRINCIPLES GRID ═══════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {principles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group flex items-center gap-4 border border-white/[0.03] bg-white/[0.01] p-5 hover:border-white/8 transition-all duration-500"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p.icon
                  size={14}
                  className="text-white/20 group-hover:text-white/40 transition-colors duration-500"
                  strokeWidth={1.5}
                />
              </div>
              <p
                className="font-['Oswald'] text-white/30 tracking-wide group-hover:text-white/50 transition-colors duration-500"
                style={{ fontSize: "0.8rem", lineHeight: 1.6 }}
              >
                {p.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ═══════ CLOSING QUOTE ═══════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 text-center"
        >
          <div className="w-8 h-[1px] bg-[#ff3366]/20 mx-auto mb-6" />
          <p
            className="font-['Oswald'] text-white/15 italic tracking-wider max-w-md mx-auto"
            style={{ fontSize: "0.75rem", lineHeight: 2 }}
          >
            Мы не требуем невозможного. Мы требуем человечности.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
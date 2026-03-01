import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  BadgeCheck,
  Swords,
  Play,
  ChevronRight,
  Crown,
  X,
  Fingerprint,
  MapPin,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EditablePageSection } from "../components/EditablePageSection";

import schwarz1 from "../../assets/4b444414a3638aab79b1f701e0b8f1f01e76ffb7.png";
import schwarz2 from "../../assets/8e0cd995b3711fe37c29b923f172ccbe6cfbb3ea.png";
import schwarz3 from "../../assets/47d1fbb8f07905e83b1b495c388cd68b53101669.png";
import akihiroFibAnnounce from "../../assets/350a43fecb21fa2eb84d2d2ff7bd9b08bca41b83.png";
import akihiroFarewellFull from "../../assets/bd27fb81a8aaea1748ebc543ecf56dfab30cbedf.png";

const heroBg =
  "https://images.unsplash.com/photo-1768286868224-4f9375c29913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdXJiYW4lMjBza3lsaW5lJTIwbmlnaHQlMjBtb29keXxlbnwxfHx8fDE3NzIwMzY0MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

/* ─── Data ────────────────────────────────────── */
interface Leadership {
  id: string;
  name: string;
  fullName: string;
  leader: string;
  period: string;
  server: string;
  color: string;
  rgb: string;
  icon: typeof Shield;
  bgImage: string;
  screenshot: string;
  screenshotAlt: string;
  video: string | null;
  shortDesc: string;
  fullDesc: string[];
  stats: { label: string; value: string }[];
  gallery?: string[];
  /** If true, skip the main screenshot and only show video */
  hideScreenshot?: boolean;
}

const leaderships: Leadership[] = [
  {
    id: "lspd",
    name: "LSPD",
    fullName: "Los Santos Police Department",
    leader: "Madara Schwarz",
    period: "25.08.2024 — 25.11.2024",
    server: "Harmony",
    color: "#3b82f6",
    rgb: "59,130,246",
    icon: Shield,
    bgImage:
      "https://images.unsplash.com/photo-1563741603582-adf5a8332a73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpY2UlMjBjYXIlMjBuaWготCUyMGJsdWUlMjBsaWготHMlMjBjaXR5fGVufDF8fHx8MTc3MjAzNjQwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    screenshot: schwarz3,
    screenshotAlt: "Schwarz Family — Лидерство LSPD",
    video: "3-l49kwB04k",
    shortDesc:
      "Madara Schwarz возглавил LSPD на Harmony. Три месяца работы в полиции.",
    fullDesc: [
      "Madara Schwarz получил пост лидера LSPD — полиции Л��с-Сантоса на сервере Harmony. Первый опыт семьи в управлении силовой фракцией на этом сервере.",
      "За три месяца была выстроена рабочая структура, проведены кадровые реформы и налажено взаимодействие с другими фракциями.",
      "Этот срок дал понимание, как работать с государственными фракциями — опыт, который пригодился в дальнейшем.",
    ],
    stats: [
      { label: "Лидер", value: "Madara" },
      { label: "Фракция", value: "LSPD" },
      { label: "Сервер", value: "Harmony" },
    ],
  },
  {
    id: "fib-1",
    name: "FIB",
    fullName: "Federal Investigation Bureau",
    leader: "Roman (Борщ) Schwarz",
    period: "18.12.2024 — 18.01.2025",
    server: "Harmony",
    color: "#f59e0b",
    rgb: "245,158,11",
    icon: Fingerprint,
    bgImage:
      "https://images.unsplash.com/photo-1702360174953-b9d72d5ddba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwc3VydmVpbGxhbmNlJTIwZGFyayUyMG9mZmljZSUyMHNjcmVlbnN8ZW58MXx8fHwxNzcyMDQ0Mzk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    screenshot: akihiroFibAnnounce,
    screenshotAlt: "Roman Schwarz — первый директор FIB из Schwarz",
    hideScreenshot: true,
    video: null,
    shortDesc:
      "Roman (Борщ) Schwarz стал первым директором FIB из Schwarz. Тот же человек, что позже вернётся в FIB как Akihiro.",
    fullDesc: [
      "Roman (Борщ) Schwarz возглавил Федеральное Бюро Расследований на Harmony. Это был первый опыт семьи в управлении федеральной структурой.",
      "За месяц на посту был выстроен фундамент для работы FIB, налажены процессы и фракция передана в стабильном состоянии. Срок был коротким, но результативным.",
      "Важно: Борщ и Akihiro — это один и тот же человек. Позже он вернулся в FIB уже под именем Akihiro и провёл там полноценный второй срок.",
    ],
    stats: [
      { label: "Лидер", value: "Борщ" },
      { label: "Фракция", value: "FIB" },
      { label: "Сервер", value: "Harmony" },
    ],
  },
  {
    id: "lssd",
    name: "LSSD",
    fullName: "Los Santos Sheriff Department",
    leader: "Akihiro Schwarz",
    period: "15.04.2025 — 18.07.2025",
    server: "Harmony",
    color: "#a78bfa",
    rgb: "167,139,250",
    icon: BadgeCheck,
    bgImage:
      "https://images.unsplash.com/photo-1766198971304-32d71f18745c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGVyaWZmJTIwcGF0cm9sJTIwcnVyYWwlMjBoaWdod2F5JTIwZGFyayUyMG1vb2R5fGVufDF8fHx8MTc3MjA0NDM5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    screenshot: schwarz1,
    screenshotAlt: "Akihiro Schwarz — шериф округа Лос-Сантос",
    video: "xY5wCvLubjU",
    hideScreenshot: true,
    shortDesc:
      "Akihiro (он же Борщ) занял пост шерифа. Три месяца работы в округе.",
    fullDesc: [
      "Akihiro Schwarz стал шерифом округа Лос-Сантос, контролируя Blaine County, Paleto Bay и прилегающие территории.",
      "За три месяца LSSD был приведён в порядок: выстроены патрульные маршруты, налажена координация с другими фракциями, проведена кадровая работа.",
      "К этому моменту Schwarz управляли несколькими силовыми фракциями параллельно — FIB, LSPD и LSSD.",
    ],
    stats: [
      { label: "Лидер", value: "Akihiro" },
      { label: "Фракция", value: "LSSD" },
      { label: "Сервер", value: "Harmony" },
    ],
  },
  {
    id: "yakuza",
    name: "Yakuza",
    fullName: "Yakuza Organization",
    leader: "Madara Schwarz",
    period: "21.07.2025 — 10.12.2025",
    server: "Harmony",
    color: "#ff3366",
    rgb: "255,51,102",
    icon: Swords,
    bgImage:
      "https://images.unsplash.com/photo-1771804359878-6105fb4f58cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHRlbXBsZSUyMHJlZCUyMG5lb24lMjBuaWготHxlbnwxfHx8fDE3NzIwMzY0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    screenshot: schwarz2,
    screenshotAlt: "Yakuza — 100% бизнеса под Schwarz",
    video: null,
    shortDesc:
      "Madara Schwarz возглавил Якудзу. Почти 5 месяцев в криминальной организации.",
    fullDesc: [
      "На Harmony Madara Schwarz возглавил Якудзу — криминальную организацию. Почти пять месяцев непрерывного управления.",
      "Под управлением Schwarz 100% бизнеса Якудзы работало через семью. Была выстроена внутренняя структура, налажены контакты.",
      "Опыт управления криминальной фракцией дополнил общую картину — к этому моменту Schwarz работали и в силовых, и в криминальных структурах.",
    ],
    stats: [
      { label: "Лидер", value: "Madara" },
      { label: "Фракция", value: "Yakuza" },
      { label: "Сервер", value: "Harmony" },
    ],
    gallery: [schwarz1],
  },
  {
    id: "fib-2",
    name: "FIB",
    fullName: "Federal Investigation Bureau",
    leader: "Akihiro Schwarz",
    period: "27.10.2025 — 12.01.2026",
    server: "Harmony",
    color: "#f59e0b",
    rgb: "245,158,11",
    icon: Fingerprint,
    bgImage:
      "https://images.unsplash.com/photo-1563741603582-adf5a8332a73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpY2UlMjBjYXIlMjBuaWготCUyMGJsdWUlMjBsaWготHMlMjBjaXR5fGVufDF8fHx8MTc3MjAzNjQwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    screenshot: akihiroFibAnnounce,
    screenshotAlt: "Akihiro Schwarz — прощание с FIB",
    video: null,
    shortDesc:
      "Akihiro Schwarz — второй раз в FIB. Продолжение работы на федеральном уровне.",
    fullDesc: [
      "Akihiro (он же Борщ из первого срока FIB) вернулся на пост директора. Два с половиной месяца стабильной работы.",
      "Налаженные процессы, развитие внутренних систем фракции. Второй срок в FIB от одного и того же человека.",
      "Передача поста прошла в штатном режиме. Прощальное обращение Akihiro стало заметным событием на сервере.",
    ],
    stats: [
      { label: "Лидер", value: "Akihiro" },
      { label: "Фракция", value: "FIB" },
      { label: "Сервер", value: "Harmony" },
    ],
    gallery: [akihiroFarewellFull],
  },
];

/* ─── Lightbox for screenshots ───────────────────── */
function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
      >
        <X size={28} />
      </button>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <ImageWithFallback
          src={src}
          alt={alt}
          className="w-full h-auto rounded-sm border border-white/10"
        />
        <p
          className="text-center text-white/40 font-['Oswald'] mt-4 tracking-wide"
          style={{ fontSize: "0.925rem" }}
        >
          {alt}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Leadership Section ─────────────────────────── */
function LeadershipSection({
  data,
  index,
  onOpenImage,
}: {
  data: Leadership;
  index: number;
  onOpenImage: (src: string, alt: string) => void;
}) {
  const Icon = data.icon;
  const isReversed = index % 2 !== 0;

  return (
    <section className="relative py-20 md:py-28 px-6 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[180px] rounded-full opacity-[0.04]"
        style={{
          background: data.color,
          left: isReversed ? "auto" : "-100px",
          right: isReversed ? "-100px" : "auto",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Section divider */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          whileInView={{ opacity: 1, width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="h-[1px] mb-20"
          style={{
            background: `linear-gradient(to right, transparent, rgba(${data.rgb},0.2), transparent)`,
          }}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-12"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `rgba(${data.rgb},0.1)`,
              border: `1px solid rgba(${data.rgb},0.25)`,
            }}
          >
            <Icon size={22} style={{ color: data.color }} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                className="font-['Russo_One'] text-white"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 1.2 }}
              >
                {data.name}
              </h2>
              <span
                className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider"
                style={{
                  fontSize: "0.675rem",
                  color: data.color,
                  background: `rgba(${data.rgb},0.1)`,
                  border: `1px solid rgba(${data.rgb},0.2)`,
                }}
              >
                {data.server}
              </span>
            </div>
            <p
              className="font-['Oswald'] tracking-wider uppercase mt-1"
              style={{ fontSize: "0.825rem", color: `rgba(${data.rgb},0.5)` }}
            >
              {data.fullName}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="font-['Oswald'] text-white/60 tracking-wide"
                style={{ fontSize: "0.925rem" }}
              >
                {data.leader}
              </span>
              <span className="text-white/15">|</span>
              <span
                className="font-['Oswald'] tracking-wide"
                style={{ fontSize: "0.875rem", color: `rgba(${data.rgb},0.6)` }}
              >
                {data.period}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main content grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 ${
            isReversed ? "lg:direction-rtl" : ""
          }`}
        >
          {/* Left — Screenshot + Video */}
          <motion.div
            initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={isReversed ? "lg:order-2" : "lg:order-1"}
          >
            {/* Screenshot */}
            {!data.hideScreenshot && (
              <div
                className="group relative overflow-hidden cursor-pointer border transition-all duration-500"
                style={{ borderColor: `rgba(${data.rgb},0.1)` }}
                onClick={() => onOpenImage(data.screenshot, data.screenshotAlt)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = `rgba(${data.rgb},0.3)`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = `rgba(${data.rgb},0.1)`)
                }
              >
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(to right, transparent, rgba(${data.rgb},0.5), transparent)`,
                  }}
                />
                <div className="relative aspect-video overflow-hidden bg-[#0a0a0f]">
                  <ImageWithFallback
                    src={data.screenshot}
                    alt={data.screenshotAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                    <span
                      className="font-['Oswald'] text-white/0 group-hover:text-white/70 uppercase tracking-widest transition-all duration-500"
                      style={{ fontSize: "0.775rem" }}
                    >
                      Открыть
                    </span>
                  </div>

                  {/* Bottom label */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span
                      className="font-['Oswald'] text-white/60 uppercase tracking-wider"
                      style={{ fontSize: "0.725rem" }}
                    >
                      {data.screenshotAlt}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Video */}
            {data.video && (
              <div
                className={`${data.hideScreenshot ? "" : "mt-4"} border overflow-hidden transition-all duration-500`}
                style={{ borderColor: `rgba(${data.rgb},0.1)` }}
              >
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(to right, transparent, rgba(${data.rgb},0.3), transparent)`,
                  }}
                />
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${data.video}?rel=0&modestbranding=1`}
                    title={`${data.name} — Schwarz Family`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: "none" }}
                  />
                </div>
                <div className="bg-[#0d0d14] px-4 py-3 flex items-center gap-2">
                  <Play size={12} style={{ color: data.color }} />
                  <span
                    className="font-['Oswald'] text-white/40 uppercase tracking-wider"
                    style={{ fontSize: "0.725rem" }}
                  >
                    Видео — {data.name} Schwarz Family
                  </span>
                </div>
              </div>
            )}

            {/* Gallery — extra screenshots */}
            {data.gallery && data.gallery.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                {data.gallery.map((img, gi) => (
                  <div
                    key={gi}
                    className="group/g relative overflow-hidden cursor-pointer border transition-all duration-500"
                    style={{ borderColor: `rgba(${data.rgb},0.1)` }}
                    onClick={() =>
                      onOpenImage(img, `${data.name} — Schwarz Family`)
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = `rgba(${data.rgb},0.25)`)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = `rgba(${data.rgb},0.1)`)
                    }
                  >
                    <div className="relative aspect-video overflow-hidden bg-[#0a0a0f]">
                      <ImageWithFallback
                        src={img}
                        alt={`${data.name} gallery`}
                        className="w-full h-full object-cover group-hover/g:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/g:bg-black/20 transition-all duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right — Description */}
          <motion.div
            initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className={isReversed ? "lg:order-1" : "lg:order-2"}
          >
            {/* Stats */}
            <div className="flex gap-6 mb-8">
              {data.stats.map((s) => (
                <div key={s.label}>
                  <span
                    className="font-['Russo_One']"
                    style={{
                      fontSize: "1.425rem",
                      color: data.color,
                      filter: `drop-shadow(0 0 8px rgba(${data.rgb},0.3))`,
                    }}
                  >
                    {s.value}
                  </span>
                  <p
                    className="font-['Oswald'] text-white/25 uppercase tracking-wider mt-1"
                    style={{ fontSize: "0.725rem" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Short desc highlight */}
            <div
              className="pl-4 mb-8 border-l-2"
              style={{ borderColor: `rgba(${data.rgb},0.4)` }}
            >
              <p
                className="font-['Oswald'] text-white/70 tracking-wide"
                style={{ fontSize: "1.125rem", lineHeight: 1.7 }}
              >
                {data.shortDesc}
              </p>
            </div>

            {/* Full description */}
            <div className="space-y-5">
              {data.fullDesc.map((paragraph, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="text-white/35 font-['Oswald']"
                  style={{ fontSize: "0.975rem", lineHeight: 1.9 }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Bottom accent */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 flex items-center gap-2"
            >
              <ChevronRight size={14} style={{ color: `rgba(${data.rgb},0.3)` }} />
              <div
                className="flex-1 h-[1px]"
                style={{
                  background: `linear-gradient(to right, rgba(${data.rgb},0.15), transparent)`,
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ──────────────────────────────────── */
export function HistoryPage() {
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  return (
    <div className="pt-16">
      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            src={lightbox.src}
            alt={lightbox.alt}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>

      {/* ═══════ HERO ═══════ */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={heroBg}
          alt="City"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/70 via-transparent to-[#0a0a0f]/70" />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-6 h-[1px] bg-[#9b2335]/30" />
            <Crown size={16} className="text-[#9b2335]/50" />
            <span
              className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.4em]"
              style={{ fontSize: "0.775rem" }}
            >
              Schwarz Family
            </span>
            <Crown size={16} className="text-[#9b2335]/50" />
            <div className="w-6 h-[1px] bg-[#9b2335]/30" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="font-['Russo_One'] text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          >
            Наши{" "}
            <span
              className="bg-gradient-to-r from-[#9b2335] to-[#7a1c2a] bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 25px rgba(155,35,53,0.3))" }}
            >
              лидерки
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-5 text-white/30 font-['Oswald'] tracking-wide max-w-lg mx-auto"
            style={{ fontSize: "1.025rem", lineHeight: 1.7 }}
          >
            LSPD, FIB, LSSD, Yakuza — пять лидерок на Harmony. Полный список фракций, которые возглавляли участники Schwarz Family.
          </motion.p>

          {/* Faction badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            {leaderships.map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 border transition-all duration-300 hover:scale-105"
                  style={{
                    borderColor: `rgba(${l.rgb},0.2)`,
                    background: `rgba(${l.rgb},0.05)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `rgba(${l.rgb},0.4)`;
                    e.currentTarget.style.background = `rgba(${l.rgb},0.1)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `rgba(${l.rgb},0.2)`;
                    e.currentTarget.style.background = `rgba(${l.rgb},0.05)`;
                  }}
                >
                  <Icon size={14} style={{ color: l.color }} />
                  <span
                    className="font-['Oswald'] uppercase tracking-wider"
                    style={{ fontSize: "0.775rem", color: l.color }}
                  >
                    {l.name}
                  </span>
                </a>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ══════ STATS OVERVIEW ═══════ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-6"
          >
            {[
              { value: "5", label: "Лидерки", color: "#9b2335" },
              { value: "LSPD", label: "Полиция LS", color: "#3b82f6" },
              { value: "FIB ×2", label: "Федералы", color: "#f59e0b" },
              { value: "LSSD", label: "Шериф LS", color: "#a78bfa" },
              { value: "YKZ", label: "Якудза", color: "#ff3366" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-center py-6 border border-white/5 bg-white/[0.01]"
              >
                <span
                  className="font-['Russo_One']"
                  style={{
                    fontSize: "1.725rem",
                    color: s.color,
                    filter: `drop-shadow(0 0 12px ${s.color}33)`,
                  }}
                >
                  {s.value}
                </span>
                <p
                  className="font-['Oswald'] text-white/25 uppercase tracking-wider mt-2"
                  style={{ fontSize: "0.725rem" }}
                >
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ LEADERSHIP SECTIONS ═══════ */}
      {leaderships.map((l, i) => (
        <div key={l.id} id={l.id}>
          <LeadershipSection
            data={l}
            index={i}
            onOpenImage={(src, alt) => setLightbox({ src, alt })}
          />
        </div>
      ))}

      {/* ══════ HARMONY ACHIEVEMENT ═══════ */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[200px] rounded-full opacity-[0.03]"
          style={{ background: "#9b2335" }}
        />
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
                style={{ fontSize: "0.775rem" }}
              >
                Достижение — Harmony
              </span>
            </div>

            <h3
              className="font-['Russo_One'] text-white mb-4"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                lineHeight: 1.1,
              }}
            >
              <span
                className="bg-gradient-to-r from-[#9b2335] to-[#7a1c2a] bg-clip-text text-transparent"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(155,35,53,0.3))",
                }}
              >
                18
              </span>{" "}
              точек ВЗП
            </h3>

            <p
              className="font-['Oswald'] text-white/30 tracking-wide max-w-md mx-auto mb-3"
              style={{ fontSize: "0.975rem", lineHeight: 1.7 }}
            >
              11 сентября 2025 года семья захватила 18 точек ВЗП на Harmony — рекорд сервера на тот момент.
            </p>

            <span
              className="font-['Oswald'] text-[#9b2335]/30 uppercase tracking-[0.2em]"
              style={{ fontSize: "0.725rem" }}
            >
              11.09.2025 — Harmony
            </span>
          </motion.div>
        </div>
      </section>

      {/* ═══════ BOTTOM QUOTE ═══════ */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mb-8" />
          <Crown size={20} className="text-[#9b2335]/20 mx-auto mb-6" />
          <p
            className="font-['Russo_One'] text-white/50"
            style={{ fontSize: "1.325rem", lineHeight: 1.6 }}
          >
            «Опыт — не в количестве сроков.
            <br />
            А в том, что ты из них вынес»
          </p>
          <p
            className="font-['Oswald'] text-white/15 uppercase tracking-[0.3em] mt-5"
            style={{ fontSize: "0.725rem" }}
          >
            — Schwarz Family
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mt-8" />
        </motion.div>
      </section>

      <EditablePageSection pageId="history" />
    </div>
  );
}
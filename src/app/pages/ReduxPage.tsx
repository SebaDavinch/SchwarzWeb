import { motion } from "motion/react";
import {
  Download,
  Monitor,
  Palette,
  Zap,
  Shield,
  ChevronRight,
  FileArchive,
  AlertTriangle,
  ExternalLink,
  Settings,
  Eye,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAdminData } from "../hooks/useAdminData";
import { GlitchText } from "../components/GlitchText";
import { EditablePageSection } from "../components/EditablePageSection";

const heroImg =
  "https://images.unsplash.com/photo-1629148769165-069e8a9e8a30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzZXR1cCUyMG5lb24lMjBkYXJrJTIwbW9uaXRvcnxlbnwxfHx8fDE3NzIwNDAwNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const reduxScreenshots = [
  {
    src: "https://images.unsplash.com/photo-1748737350052-09fba71ef129?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB1cmJhbiUyMG5pZ2h0JTIwcmFpbiUyMHJlZmxlY3Rpb25zfGVufDF8fHx8MTc3MjA0NDk3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Redux — Городские улицы ночью",
    caption: "Улучшенные отражения и ночное освещение",
  },
  {
    src: "https://images.unsplash.com/photo-1735729089199-1ffff74a8e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMGNpdHklMjBza3lsaW5lJTIwbmVvbiUyMGxpZ2h0cyUyMGRhcmt8ZW58MXx8fHwxNzcyMDQ0OTcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Redux — Скайлайн Лос-Сантоса",
    caption: "Панорама города с новыми текстурами неба",
  },
  {
    src: "https://images.unsplash.com/photo-1758404196311-70c62a445e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBzdHJlZXQlMjBuaWdodCUyMGdsb3clMjB1cmJhbnxlbnwxfHx8fDE3NzIwNDQ5NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Redux — Неоновый даунтаун",
    caption: "Переработанные неоновые вывески и эффекты свечения",
  },
  {
    src: "https://images.unsplash.com/photo-1756757826107-9048148a416c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBoaWdod2F5JTIwcGFsbSUyMHRyZWVzJTIwY2FsaWZvcm5pYSUyMGNpbmVtYXRpY3xlbnwxfHx8fDE3NzIwNDQ5NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Redux — Закат на хайвее",
    caption: "Кинематографичный закат с HDR-эффектами",
  },
];

const features = [
  {
    icon: Palette,
    title: "Визуальное обновление",
    desc: "Переработанные текстуры, улучшенное освещение и атмосферные эффекты. Лос-Сантос выглядит так, как должен был выглядеть с самого начала.",
    accent: "#9b2335",
  },
  {
    icon: Zap,
    title: "Оптимизация",
    desc: "Редукс оптимизирован для стабильного FPS даже на средних ПК. Никаких просадок и фризов — только плавный геймплей.",
    accent: "#9b2335",
  },
  {
    icon: Eye,
    title: "Кастомный HUD",
    desc: "Минималистичный и информативный интерфейс, разработанный специально для RP. Ничего лишнего — только то, что нужно.",
    accent: "#9b2335",
  },
  {
    icon: Shield,
    title: "Безопасность",
    desc: "Редукс не содержит читов, модификаций памяти или запрещённых файлов. Полностью совместим с античитом Majestic RP.",
    accent: "#9b2335",
  },
  {
    icon: Settings,
    title: "Настраиваемость",
    desc: "Гибкие настройки: выбирай, какие элементы редукса использовать. Включай и отключай компоненты по своему вкусу.",
    accent: "#9b2335",
  },
  {
    icon: Monitor,
    title: "Совместимость",
    desc: "Работает с RAGE:MP и всеми серверами Majestic RP. Протестирован на Harmony, Seattle и других серверах проекта.",
    accent: "#9b2335",
  },
];

const installSteps = [
  {
    num: "01",
    title: "Скачай архив",
    desc: "Скачай актуальную версию редукса по ссылке ниже. Архив содержит все необходимые файлы и инструкцию.",
  },
  {
    num: "02",
    title: "Создай бекап",
    desc: "Перед установкой сделай резервную копию папки «update» в директории GTA 5. Если что-то пойдёт не так — всегда можно откатить.",
  },
  {
    num: "03",
    title: "Распакуй файлы",
    desc: "Извлеки содержимое архива в корневую папку GTA 5 (туда, где лежит GTA5.exe). При запросе — замени существующие файлы.",
  },
  {
    num: "04",
    title: "Настрой конфиг",
    desc: "Открой файл redux_config.ini и настрой параметры под свои предпочтения: графика, HUD, эффекты. Всё подробно описано в комментариях.",
  },
  {
    num: "05",
    title: "Запусти игру",
    desc: "Запусти RAGE:MP как обычно. Редукс подхватится автоматически. Если возникнут проблемы — обратсь в наш Discord.",
  },
];

const warnings = [
  "Редукс не является читом и не даёт преимуществ в игре",
  "Используй только официальную версию из нашего Discord",
  "При обновлении GTA 5 может потребоваться переустановка",
  "Не совмещай с другими графическими модами без проверки",
];

export function ReduxPage() {
  const { getPageOverride } = useAdminData();
  const heroDesc = getPageOverride("redux", "hero_desc") ??
    "Кастомный графический пак от Schwarz Family. Улучшенная графика, оптимизация и уникальный стиль — бесплатно для всех.";

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src={heroImg}
          alt="Gaming setup"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/70 via-transparent to-[#0a0a0f]/70" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10 px-4"
        >
          <div className="inline-flex items-center gap-3 mb-5">
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

          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)", lineHeight: 1.1 }}
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

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-5 text-white/30 font-['Oswald'] tracking-wide max-w-lg mx-auto"
            style={{ fontSize: "1rem", lineHeight: 1.7 }}
          >
            {heroDesc}
          </motion.p>
        </motion.div>
      </div>

      {/* What is Redux */}
      <section className="relative py-20 px-6">
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-[#9b2335]/5 blur-[120px] rounded-full" />

        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span
              className="font-['Oswald'] text-[#9b2335]/40 uppercase tracking-[0.3em]"
              style={{ fontSize: "0.7rem" }}
            >
              Что такое Schwarz Redux?
            </span>
            <div className="w-12 h-[2px] bg-[#9b2335]/30 mx-auto mt-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-white/5 bg-white/[0.01] p-8 md:p-10 mb-16"
          >
            <div className="pl-4 border-l-2 border-[#9b2335]/30 mb-6">
              <p
                className="font-['Oswald'] text-white/60 tracking-wide"
                style={{ fontSize: "1.05rem", lineHeight: 1.8 }}
              >
                Schwarz Redux — это кастомный графический и визуальный пак,
                разработанный участниками Schwarz Family специально для игры на
                Majestic RP.
              </p>
            </div>
            <div className="space-y-4">
              <p
                className="font-['Oswald'] text-white/35 tracking-wide"
                style={{ fontSize: "0.925rem", lineHeight: 1.9 }}
              >
                Редукс включает в себя переработанные текстуры окружения,
                улучшенные эффекты освещения, кастомный HUD и множество
                визуальных улучшений, которые делают игру атмосфернее и
                красивее — без потери производительности.
              </p>
              <p
                className="font-['Oswald'] text-white/35 tracking-wide"
                style={{ fontSize: "0.925rem", lineHeight: 1.9 }}
              >
                Мы создали его для себя, но решили поделиться с комьюнити.
                Редукс полностью бесплатный, безопасный и совместимый с
                античитом серверов Majestic RP. Скачивай, устанавливай и
                наслаждайся.
              </p>
            </div>
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group border border-white/5 bg-white/[0.01] p-6 hover:border-white/10 transition-all duration-500"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[1px]"
                  style={{
                    background: `linear-gradient(to right, transparent, ${f.accent}20, transparent)`,
                  }}
                />
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: `${f.accent}08`,
                    border: `1px solid ${f.accent}20`,
                  }}
                >
                  <f.icon
                    size={18}
                    style={{ color: f.accent, opacity: 0.7 }}
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className="font-['Oswald'] text-white uppercase tracking-wider mb-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  {f.title}
                </h3>
                <p
                  className="font-['Oswald'] text-white/30 tracking-wide group-hover:text-white/45 transition-colors duration-500"
                  style={{ fontSize: "0.8rem", lineHeight: 1.8 }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Screenshots gallery */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#9b2335]/15" />
              <Eye size={14} className="text-[#9b2335]/40" />
              <span
                className="font-['Oswald'] text-[#9b2335]/40 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.65rem" }}
              >
                Скриншоты
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#9b2335]/15" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reduxScreenshots.map((shot, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative overflow-hidden border border-white/5 hover:border-[#9b2335]/15 transition-all duration-500"
                >
                  <div className="relative aspect-video overflow-hidden bg-[#0a0a0f]">
                    <ImageWithFallback
                      src={shot.src}
                      alt={shot.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p
                      className="font-['Oswald'] text-white/50 tracking-wide"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {shot.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Installation guide */}
      <section className="relative py-20 px-6">
        <div className="absolute bottom-1/4 right-0 w-[250px] h-[250px] bg-[#9b2335]/5 blur-[120px] rounded-full" />

        <div className="max-w-3xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#9b2335]/15" />
              <Download size={14} className="text-[#9b2335]/40" />
              <span
                className="font-['Oswald'] text-[#9b2335]/40 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.65rem" }}
              >
                Установка
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#9b2335]/15" />
            </div>
          </motion.div>

          <div className="space-y-0">
            {installSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative"
              >
                {/* Connector line */}
                {i < installSteps.length - 1 && (
                  <div
                    className="absolute left-[29px] top-[72px] w-[1px] h-[calc(100%-40px)]"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(155,35,53,0.2), transparent)",
                    }}
                  />
                )}

                <div className="flex gap-6 py-6">
                  <div className="shrink-0 relative">
                    <div
                      className="w-[58px] h-[58px] rounded-full flex items-center justify-center border transition-all duration-500"
                      style={{
                        background: "rgba(155,35,53,0.03)",
                        borderColor: "rgba(155,35,53,0.12)",
                      }}
                    >
                      <span
                        className="font-['Russo_One'] text-[#9b2335]/50"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {step.num}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <h3
                      className="font-['Oswald'] text-white uppercase tracking-wider mb-2"
                      style={{ fontSize: "1rem" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-white/35 font-['Oswald'] tracking-wide group-hover:text-white/50 transition-colors duration-500"
                      style={{ fontSize: "0.85rem", lineHeight: 1.9 }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Download button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="border border-[#9b2335]/10 bg-[#9b2335]/[0.02] p-8">
              <Download
                size={28}
                className="text-[#9b2335]/40 mx-auto mb-4"
                strokeWidth={1.5}
              />
              <p
                className="font-['Oswald'] text-white/40 tracking-wide mb-6"
                style={{ fontSize: "0.9rem", lineHeight: 1.7 }}
              >
                Скачать актуальную версию Schwarz Redux можно в нашем Discord.
                Там же — поддержка и обновления.
              </p>
              <a
                href="https://discord.gg/schwarzfamq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 font-['Oswald'] uppercase tracking-[0.2em] text-[#9b2335]/70 hover:text-[#9b2335] border border-[#9b2335]/20 hover:border-[#9b2335]/40 px-8 py-3 transition-all duration-500 hover:bg-[#9b2335]/5"
                style={{ fontSize: "0.75rem" }}
              >
                <Download size={14} strokeWidth={1.5} />
                Скачать в Discord
                <ExternalLink size={12} strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>

          {/* Warnings */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#f59e0b]/10" />
              <AlertTriangle
                size={12}
                className="text-[#f59e0b]/30"
                strokeWidth={1.5}
              />
              <span
                className="font-['Oswald'] text-[#f59e0b]/30 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.6rem" }}
              >
                Важно
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#f59e0b]/10" />
            </div>

            <div className="space-y-3">
              {warnings.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="flex items-start gap-3 group"
                >
                  <ChevronRight
                    size={14}
                    className="text-[#f59e0b]/25 mt-0.5 shrink-0 group-hover:text-[#f59e0b]/50 transition-colors"
                    strokeWidth={1.5}
                  />
                  <p
                    className="font-['Oswald'] text-white/25 tracking-wide group-hover:text-white/40 transition-colors duration-300"
                    style={{ fontSize: "0.8rem", lineHeight: 1.7 }}
                  >
                    {w}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 text-center"
          >
            <div className="w-8 h-[1px] bg-[#9b2335]/20 mx-auto mb-6" />
            <p
              className="font-['Oswald'] text-white/15 italic tracking-wider max-w-md mx-auto"
              style={{ fontSize: "0.75rem", lineHeight: 2 }}
            >
              Schwarz Redux — сделано семьёй, для комьюнити.
            </p>
          </motion.div>
        </div>
      </section>

      <EditablePageSection pageId="redux" />
    </div>
  );
}
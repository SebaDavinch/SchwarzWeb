import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Heart,
  AlertTriangle,
  ExternalLink,
  Send,
  Loader2,
  Gamepad2,
  User,
  Hash,
  Sun,
  Target,
} from "lucide-react";
import { submitApplication } from "../hooks/useAdminData";
import { notifyNewApplication } from "../hooks/useDiscordWebhook";
import { GlitchText } from "../components/GlitchText";
import { EditablePageSection } from "../components/EditablePageSection";

/* ═══════════════════════════════════════════════
   APPLICATION STATUS TRACKER
   ═══════════════════════════════════════════════ */

function StatusTracker() {
  const [trackId, setTrackId] = useState("");
  const [result, setResult] = useState<null | {
    status: string;
    color: string;
    label: string;
  }>(null);
  const [notFound, setNotFound] = useState(false);

  const statusMap: Record<string, { color: string; label: string }> = {
    pending: { color: "#f59e0b", label: "Ожидает рассмотрения" },
    accepted: { color: "#9b2335", label: "Принята! Добро пожаловать в семью" },
    rejected: { color: "#ff3366", label: "Отклонена" },
  };

  const handleTrack = async () => {
    if (!trackId.trim()) return;
    try {
      const apps: any[] = JSON.parse(
        localStorage.getItem("schwarz_admin_applications") || "[]"
      );

      const found = apps.find((a: any) => a.id === trackId.trim());
      if (found) {
        const sm = statusMap[found.status] || statusMap.pending;
        setResult({ status: found.status, ...sm });
        setNotFound(false);
      } else {
        setResult(null);
        setNotFound(true);
      }
    } catch {
      setResult(null);
      setNotFound(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border border-white/5 bg-white/[0.01] p-6 mt-6"
    >
      <h4
        className="font-['Oswald'] text-white/40 uppercase tracking-wider mb-4"
        style={{ fontSize: "0.7rem" }}
      >
        Проверить статус заявки
      </h4>
      <div className="flex gap-2">
        <input
          value={trackId}
          onChange={(e) => {
            setTrackId(e.target.value);
            setNotFound(false);
            setResult(null);
          }}
          placeholder="Введи ID заявки..."
          className="flex-1 bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/60 font-mono tracking-wide px-3 py-2 outline-none transition-colors"
          style={{ fontSize: "0.8rem" }}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
        />
        <button
          onClick={handleTrack}
          className="px-4 py-2 font-['Oswald'] uppercase tracking-wider text-[#9b2335]/70 border border-[#9b2335]/20 hover:border-[#9b2335]/40 hover:bg-[#9b2335]/5 transition-all"
          style={{ fontSize: "0.65rem" }}
        >
          Проверить
        </button>
      </div>
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 border"
            style={{
              borderColor: `${result.color}25`,
              background: `${result.color}05`,
            }}
          >
            <span
              className="font-['Oswald'] tracking-wide"
              style={{ fontSize: "0.82rem", color: result.color }}
            >
              {result.label}
            </span>
          </motion.div>
        )}
        {notFound && (
          <motion.div
            key="notfound"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 border border-white/5"
          >
            <span
              className="font-['Oswald'] text-white/25 tracking-wide"
              style={{ fontSize: "0.82rem" }}
            >
              Заявка не найдена. Проверь правильность ID.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   REQUIREMENTS
   ═══════════════════════════════════════════════ */

const requirements = [
  {
    icon: Clock,
    title: "Активность на сервере",
    desc: "Ты должен быть активным игроком на Majestic RP. Мы не берём тех, кто заходит раз в неделю. Семья — это каждый день.",
  },
  {
    icon: Users,
    title: "Знакомство с фамой",
    desc: "Мы должны тебя знать. Познакомься с участниками, проведи время вместе, покажи себя в деле. Случайных людей мы не берём.",
  },
  {
    icon: Shield,
    title: "Чистая репутация",
    desc: "Без серьёзных нарушений правил сервера, без токсичного поведения. Мы проверяем — и у нас хорошая память.",
  },
  {
    icon: Heart,
    title: "Адекватность и уважение",
    desc: "Умение общаться, решать конфликты словами, уважать чужие границы. Если это не про тебя — нам не по пути.",
  },
  {
    icon: MessageCircle,
    title: "Рекомендация от участника",
    desc: "Желательно, чтобы кто-то из семьи мог за тебя поручиться. Это не обязательно, но сильно упрощает процесс.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Познакомься с нами",
    desc: "Проводи время с участниками семьи на сервере. Участвуй в совместных активностях, покажи, что ты свой.",
  },
  {
    step: "02",
    title: "Заполни заявку",
    desc: "Заполни анкету ниже — расскажи о себе, когда играешь и что ищешь в семье.",
  },
  {
    step: "03",
    title: "Испытательный период",
    desc: "Если тебя одобрят — начнётся испытательный срок. Покажи, что ты надёжный, активный и адекватный.",
  },
  {
    step: "04",
    title: "Добро пожаловать",
    desc: "Прошёл испытание — становишься полноправным членом Schwarz Family. Теперь мы — твоя семья.",
  },
];

const redFlags = [
  "Токсичное поведение и оскорбления",
  "Нарушения правил сервера",
  "Слив внутренней информации",
  "Неактивность без предупреждения",
  "Конфликтность без попыток решить вопрос",
];

/* ═══════════════════════════════════════════════
   APPLICATION FORM
   ═══════════════════════════════════════════════ */

interface FormData {
  nickname: string;
  discord: string;
  age: string;
  server: string;
  primetime: string;
  referral: string;
  expectations: string;
}

const emptyForm: FormData = {
  nickname: "",
  discord: "",
  age: "",
  server: "Seattle",
  primetime: "",
  referral: "",
  expectations: "",
};

const primetimeOptions = [
  "Утро (08:00–12:00)",
  "День (12:00–17:00)",
  "Вечер (17:00–22:00)",
  "Ночь (22:00–03:00)",
  "Весь день",
  "Нестабильно / по-разному",
];

function ApplicationForm() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.nickname.trim()) errs.nickname = "Обязательное поле";
    if (!form.discord.trim()) errs.discord = "Нужен для связи";
    if (!form.age.trim()) errs.age = "Укажи возраст";
    if (!form.primetime.trim()) errs.primetime = "Выбери праймтайм";
    if (!form.expectations.trim())
      errs.expectations = "Расскажи, что ждёшь от семьи";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setTimeout(() => {
      const result = submitApplication(form);
      setAppId(result.id);
      notifyNewApplication(form.nickname, form.server, form.discord);
      setSubmitting(false);
      setSubmitted(true);
      setForm(emptyForm);
    }, 800);
  };

  const updateField = (key: keyof FormData, value: string) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) {
      setErrors({ ...errors, [key]: undefined });
    }
  };

  /* ─── Success screen ─── */
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <CheckCircle2
            size={40}
            className="text-[#9b2335]/40 mx-auto mb-5"
            strokeWidth={1.5}
          />
        </motion.div>
        <h3
          className="font-['Russo_One'] text-[#9b2335]/80 mb-3"
          style={{ fontSize: "1.5rem" }}
        >
          Заявка отправлена!
        </h3>
        {appId && (
          <div className="mb-4 inline-block border border-[#9b2335]/15 bg-[#9b2335]/[0.03] px-5 py-2.5">
            <span
              className="font-['Oswald'] text-white/25 uppercase tracking-wider block"
              style={{ fontSize: "0.55rem" }}
            >
              ID заявки (сохрани для отслеживания)
            </span>
            <span
              className="font-mono text-[#9b2335]/70 tracking-wider"
              style={{ fontSize: "0.9rem" }}
            >
              {appId}
            </span>
          </div>
        )}
        <p
          className="font-['Oswald'] text-white/30 tracking-wide max-w-sm mx-auto mb-6"
          style={{ fontSize: "0.82rem", lineHeight: 1.8 }}
        >
          Мы рассмотрим твою заявку и свяжемся с тобой через Discord. Обычно это
          занимает 1–3 дня.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setShowForm(false);
          }}
          className="font-['Oswald'] uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors"
          style={{ fontSize: "0.65rem" }}
        >
          Вернуться
        </button>
      </motion.div>
    );
  }

  /* ─── CTA Button ─── */
  if (!showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="border border-white/5 bg-white/[0.01] p-10">
          <CheckCircle2
            size={24}
            className="text-[#9b2335]/30 mx-auto mb-4"
            strokeWidth={1.5}
          />
          <p
            className="font-['Oswald'] text-white/40 tracking-wide max-w-md mx-auto"
            style={{ fontSize: "0.85rem", lineHeight: 1.8 }}
          >
            Если ты дочитал до конца и всё ещё хочешь к нам — значит, мы на
            одной волне.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 font-['Oswald'] uppercase tracking-[0.2em] text-white bg-[#9b2335] hover:bg-[#b52a40] px-8 py-3 transition-all duration-500 hover:shadow-[0_0_30px_rgba(155,35,53,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "0.72rem" }}
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Подать заявку
            </button>
            <a
              href="https://discord.gg/schwarzfamq"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-['Oswald'] uppercase tracking-[0.2em] text-[#ff3366]/50 hover:text-[#ff3366] border border-[#ff3366]/15 hover:border-[#ff3366]/30 px-6 py-2.5 transition-all duration-500"
              style={{ fontSize: "0.7rem" }}
            >
              Discord
              <ExternalLink size={12} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ─── The Form ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Form header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#9b2335]/10" />
        <Send size={12} className="text-[#9b2335]/30" />
        <span
          className="font-['Oswald'] text-[#9b2335]/30 uppercase tracking-[0.3em]"
          style={{ fontSize: "0.6rem" }}
        >
          Анкета на вступление
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#9b2335]/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Имя в игре + Возраст */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Имя в игре"
            required
            icon={User}
            value={form.nickname}
            onChange={(v) => updateField("nickname", v)}
            placeholder="Имя Фамилия (IC)"
            error={errors.nickname}
          />
          <FormField
            label="Возраст"
            required
            icon={Hash}
            value={form.age}
            onChange={(v) => updateField("age", v)}
            placeholder="18"
            error={errors.age}
          />
        </div>

        {/* Row 2: Discord + Сервер */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Discord"
            required
            icon={MessageCircle}
            value={form.discord}
            onChange={(v) => updateField("discord", v)}
            placeholder="username или username#0000"
            error={errors.discord}
          />
          <div>
            <label
              className="font-['Oswald'] text-white/25 uppercase tracking-wider flex items-center gap-2 mb-2"
              style={{ fontSize: "0.6rem" }}
            >
              <Gamepad2 size={10} className="text-white/15" />
              Сервер
            </label>
            <select
              value={form.server}
              onChange={(e) => updateField("server", e.target.value)}
              className="w-full bg-[#0a0a12] border border-white/8 focus:border-[#9b2335]/20 text-white/60 font-['Oswald'] tracking-wide px-4 py-3 outline-none transition-colors appearance-none cursor-pointer"
              style={{ fontSize: "0.85rem" }}
            >
              <option value="Seattle">Seattle</option>
              <option value="Harmony">Harmony</option>
              <option value="Liberty">Liberty</option>
              <option value="Другой">Другой</option>
            </select>
          </div>
        </div>

        {/* Row 3: Праймтайм */}
        <div>
          <label
            className="font-['Oswald'] text-white/25 uppercase tracking-wider flex items-center gap-2 mb-2"
            style={{ fontSize: "0.6rem" }}
          >
            <Sun size={10} className="text-white/15" />
            Ваш праймтайм
            <span className="text-[#ff3366]/40">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {primetimeOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField("primetime", opt)}
                className={`text-left px-4 py-3 border transition-all duration-300 ${
                  form.primetime === opt
                    ? "border-[#9b2335]/30 bg-[#9b2335]/[0.06] text-[#9b2335]/80"
                    : "border-white/5 bg-white/[0.01] text-white/35 hover:border-white/10 hover:text-white/50"
                }`}
              >
                <span
                  className="font-['Oswald'] tracking-wide block"
                  style={{ fontSize: "0.78rem" }}
                >
                  {opt}
                </span>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {errors.primetime && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="font-['Oswald'] text-[#ff3366]/50 tracking-wide mt-1.5"
                style={{ fontSize: "0.62rem" }}
              >
                {errors.primetime}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Кто порекомендовал */}
        <FormField
          label="Кто порекомендовал"
          icon={Users}
          value={form.referral}
          onChange={(v) => updateField("referral", v)}
          placeholder="Никнейм участника семьи (если есть)"
        />

        {/* Что хотите получить от семьи */}
        <FormTextarea
          label="Что хотите получить от семьи?"
          required
          icon={Target}
          value={form.expectations}
          onChange={(v) => updateField("expectations", v)}
          placeholder="Расскажи, что ищешь в семье: совместный отыгрыш, помощь, общение, участие в войнах, карьерный рост в фаме — всё, что важно для тебя."
          rows={4}
          error={errors.expectations}
        />

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 font-['Oswald'] uppercase tracking-[0.2em] text-white bg-[#9b2335] hover:bg-[#b52a40] px-8 py-3 transition-all duration-500 hover:shadow-[0_0_30px_rgba(155,35,53,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "0.72rem" }}
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {submitting ? "Отправка..." : "Отправить заявку"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="font-['Oswald'] uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors"
            style={{ fontSize: "0.65rem" }}
          >
            Отмена
          </button>
        </div>

        <p
          className="font-['Oswald'] text-white/10 tracking-wide"
          style={{ fontSize: "0.62rem" }}
        >
          Заявка будет рассмотрена руководством семьи. Решение обычно
          принимается в течение 1–3 дней.
        </p>
      </form>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   FORM COMPONENTS
   ═══════════════════════════════════════════════ */

function FormField({
  label,
  required,
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  required?: boolean;
  icon: typeof User;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <label
        className="font-['Oswald'] text-white/25 uppercase tracking-wider flex items-center gap-2 mb-2"
        style={{ fontSize: "0.6rem" }}
      >
        <Icon size={10} className="text-white/15" />
        {label}
        {required && <span className="text-[#ff3366]/40">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[#0a0a12] border focus:border-[#9b2335]/20 text-white/60 font-['Oswald'] tracking-wide px-4 py-3 outline-none transition-colors ${
          error ? "border-[#ff3366]/30" : "border-white/8"
        }`}
        style={{ fontSize: "0.85rem" }}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="font-['Oswald'] text-[#ff3366]/50 tracking-wide mt-1"
            style={{ fontSize: "0.62rem" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormTextarea({
  label,
  required,
  icon: Icon,
  value,
  onChange,
  placeholder,
  rows,
  error,
}: {
  label: string;
  required?: boolean;
  icon: typeof User;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows: number;
  error?: string;
}) {
  return (
    <div>
      <label
        className="font-['Oswald'] text-white/25 uppercase tracking-wider flex items-center gap-2 mb-2"
        style={{ fontSize: "0.6rem" }}
      >
        <Icon size={10} className="text-white/15" />
        {label}
        {required && <span className="text-[#ff3366]/40">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-[#0a0a12] border focus:border-[#9b2335]/20 text-white/60 font-['Oswald'] tracking-wide px-4 py-3 outline-none transition-colors resize-none ${
          error ? "border-[#ff3366]/30" : "border-white/8"
        }`}
        style={{ fontSize: "0.85rem", lineHeight: 1.7 }}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="font-['Oswald'] text-[#ff3366]/50 tracking-wide mt-1"
            style={{ fontSize: "0.62rem" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export function JoinFamilyPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative h-[30vh] min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff3366]/5 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <span
            className="font-['Oswald'] text-[#ff3366]/50 uppercase tracking-[0.3em]"
            style={{ fontSize: "0.7rem" }}
          >
            Вступление в ряды
          </span>
          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white mt-3"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
            }}
            text="Как попасть в семью?"
          >
            Как попасть в <span className="text-[#ff3366]">семью?</span>
          </GlitchText>
        </motion.div>
      </div>

      <section className="relative py-20 px-6">
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-[#ff3366]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[250px] h-[250px] bg-[#9b2335]/5 blur-[120px] rounded-full" />

        <div className="max-w-3xl mx-auto relative">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20 max-w-xl mx-auto"
          >
            <p
              className="font-['Oswald'] text-white/25 italic tracking-wide"
              style={{ fontSize: "0.8rem", lineHeight: 2 }}
            >
              &laquo;Schwarz Family — это не просто тег в игре. Это люди,
              которым ты доверяешь. Мы не набираем массу — мы ищем своих.&raquo;
            </p>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#ff3366]/15" />
              <span
                className="font-['Oswald'] text-[#ff3366]/40 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.6rem" }}
              >
                Что мы ценим
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#ff3366]/15" />
            </div>
          </motion.div>

          <div className="space-y-4">
            {requirements.map((req, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group flex gap-5 border border-white/5 bg-white/[0.01] p-6 hover:border-[#ff3366]/10 transition-all duration-500"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "#ff336608",
                    border: "1px solid #ff336618",
                  }}
                >
                  <req.icon
                    size={18}
                    className="text-[#ff3366]/50"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h3
                    className="font-['Oswald'] text-white uppercase tracking-wider mb-2"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {req.title}
                  </h3>
                  <p
                    className="font-['Oswald'] text-white/30 tracking-wide group-hover:text-white/45 transition-colors duration-500"
                    style={{ fontSize: "0.8rem", lineHeight: 1.8 }}
                  >
                    {req.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-24 mb-10"
          >
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#9b2335]/10" />
              <span
                className="font-['Oswald'] text-[#9b2335]/30 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.6rem" }}
              >
                Как это работает
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#9b2335]/10" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative border border-white/5 bg-white/[0.01] p-6 hover:border-[#9b2335]/10 transition-all duration-500"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #9b233515, transparent)",
                  }}
                />
                <span
                  className="font-['Russo_One'] text-[#9b2335]/15 group-hover:text-[#9b2335]/30 transition-colors duration-500"
                  style={{ fontSize: "1.5rem" }}
                >
                  {item.step}
                </span>
                <h3
                  className="font-['Oswald'] text-white uppercase tracking-wider mt-3 mb-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  {item.title}
                </h3>
                <p
                  className="font-['Oswald'] text-white/30 tracking-wide group-hover:text-white/45 transition-colors duration-500"
                  style={{ fontSize: "0.78rem", lineHeight: 1.8 }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Red flags */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-24 mb-10"
          >
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#ff3366]/10" />
              <AlertTriangle size={12} className="text-[#ff3366]/30" />
              <span
                className="font-['Oswald'] text-[#ff3366]/30 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.6rem" }}
              >
                Red Flags
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#ff3366]/10" />
            </div>
          </motion.div>

          <div className="space-y-2">
            {redFlags.map((flag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="flex items-center gap-3 border border-white/[0.03] bg-white/[0.005] px-5 py-3"
              >
                <XCircle
                  size={12}
                  className="text-[#ff3366]/30 shrink-0"
                  strokeWidth={1.5}
                />
                <span
                  className="font-['Oswald'] text-white/30 tracking-wide"
                  style={{ fontSize: "0.8rem" }}
                >
                  {flag}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Application form */}
          <div className="mt-24">
            <ApplicationForm />
          </div>

          {/* Status tracker */}
          <StatusTracker />
        </div>
      </section>

      <EditablePageSection pageId="join" />
    </div>
  );
}
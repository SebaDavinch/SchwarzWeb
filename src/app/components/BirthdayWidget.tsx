import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cake, ChevronRight, Calendar, Gift, Star, Clock, Sparkles, Send } from "lucide-react";
import {
  getAllBirthdays,
  getDaysUntilBirthday,
  isBirthdayToday,
  getAge,
  formatBirthdayRu,
  getZodiacSign,
  getZodiacEmoji,
  runBirthdayScheduler,
  sendBirthdayWebhook,
  type MergedBirthday,
} from "../hooks/useBirthdays";

/* ─── helpers ─── */
function sortByUpcoming(list: MergedBirthday[]): MergedBirthday[] {
  return [...list].sort(
    (a, b) => getDaysUntilBirthday(a.birthday) - getDaysUntilBirthday(b.birthday)
  );
}

function getMonthBirthdays(list: MergedBirthday[]): MergedBirthday[] {
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  return list.filter((p) => {
    const mm = parseInt(p.birthday.split("-")[1], 10);
    return mm === curMonth;
  });
}

const MONTH_NAMES_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

/* ─── sub-components ─── */

function AvatarCircle({
  name,
  avatarUrl,
  size = 48,
  isToday = false,
}: {
  name: string;
  avatarUrl?: string;
  size?: number;
  isToday?: boolean;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: isToday
          ? "linear-gradient(135deg, rgba(155,35,53,0.25), rgba(245,158,11,0.15))"
          : "rgba(255,255,255,0.04)",
        border: isToday ? "2px solid rgba(245,158,11,0.4)" : "2px solid rgba(255,255,255,0.07)",
        boxShadow: isToday ? "0 0 20px rgba(245,158,11,0.15)" : "none",
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span
          className="font-['Russo_One'] text-white/50"
          style={{ fontSize: size * 0.28 }}
        >
          {initials || "?"}
        </span>
      )}
      {isToday && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: "#f59e0b", fontSize: "0.5rem" }}
        >
          🎂
        </div>
      )}
    </div>
  );
}

/* Confetti particle (pure CSS-based through motion) */
function ConfettiParticle({ i }: { i: number }) {
  const colors = ["#9b2335", "#f59e0b", "#ff3366", "#a78bfa", "#22c55e"];
  const color = colors[i % colors.length];
  const left = (i * 7.3 + 5) % 95;
  const delay = (i * 0.13) % 1.2;
  const size = 4 + (i % 4);

  return (
    <motion.div
      className="absolute top-0 pointer-events-none rounded-sm"
      style={{ left: `${left}%`, width: size, height: size * 1.5, background: color, opacity: 0 }}
      animate={{
        y: [0, 120, 160],
        rotate: [0, 180 + i * 20, 360],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

/* Today birthday card */
function TodayCard({ person, onSendWish }: { person: MergedBirthday; onSendWish: (p: MergedBirthday) => void }) {
  const age = getAge(person.birthday);
  const nextAge = age !== null ? age + 1 : null;
  const sign = getZodiacSign(person.birthday);
  const signEmoji = getZodiacEmoji(sign);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden border p-5"
      style={{
        borderColor: "rgba(245,158,11,0.25)",
        background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(155,35,53,0.06))",
      }}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 14 }, (_, i) => <ConfettiParticle key={i} i={i} />)}
      </div>

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#f59e0b]/40 to-transparent" />

      <div className="relative flex items-start gap-4">
        <AvatarCircle
          name={person.name}
          avatarUrl={person.avatarDataUrl}
          size={60}
          isToday
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="font-['Russo_One'] text-white"
              style={{ fontSize: "1.05rem" }}
            >
              {person.name}
            </span>
            {nextAge && (
              <span
                className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider"
                style={{
                  fontSize: "0.6rem",
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  color: "#f59e0b",
                }}
              >
                {nextAge} лет
              </span>
            )}
            {sign && (
              <span
                className="font-['Oswald'] text-white/30 tracking-wide"
                style={{ fontSize: "0.7rem" }}
              >
                {signEmoji} {sign}
              </span>
            )}
          </div>

          <p
            className="font-['Oswald'] tracking-wide mb-3"
            style={{ fontSize: "0.78rem", color: "rgba(245,158,11,0.6)" }}
          >
            🎉 Сегодня — {formatBirthdayRu(person.birthday)}
            {person.source === "account" && (
              <span className="ml-2 text-white/20">· Аккаунт ЛК</span>
            )}
          </p>

          {person.note && (
            <p className="font-['Oswald'] text-white/30 tracking-wide mb-3" style={{ fontSize: "0.75rem" }}>
              {person.note}
            </p>
          )}

          <button
            onClick={() => onSendWish(person)}
            className="inline-flex items-center gap-2 px-3 py-1.5 border transition-all duration-300 hover:scale-[1.02]"
            style={{
              borderColor: "rgba(245,158,11,0.2)",
              background: "rgba(245,158,11,0.05)",
              color: "rgba(245,158,11,0.7)",
            }}
          >
            <Send size={11} strokeWidth={1.5} />
            <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.6rem" }}>
              Отправить в Discord
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* Upcoming birthday row */
function UpcomingRow({ person, index }: { person: MergedBirthday; index: number }) {
  const days = getDaysUntilBirthday(person.birthday);
  const age = getAge(person.birthday);
  const nextAge = age !== null ? age + 1 : null;
  const sign = getZodiacSign(person.birthday);
  const signEmoji = getZodiacEmoji(sign);

  const urgencyColor =
    days <= 3 ? "#ff3366" : days <= 7 ? "#f59e0b" : days <= 14 ? "#a78bfa" : "#888899";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.015] transition-colors duration-300 px-2 -mx-2"
    >
      {/* Days badge */}
      <div
        className="shrink-0 w-10 h-10 flex flex-col items-center justify-center rounded-sm"
        style={{
          background: `${urgencyColor}10`,
          border: `1px solid ${urgencyColor}25`,
        }}
      >
        <span className="font-['Russo_One']" style={{ fontSize: "0.85rem", color: urgencyColor }}>
          {days}
        </span>
        <span className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.42rem" }}>
          {days === 1 ? "день" : days < 5 ? "дня" : "дней"}
        </span>
      </div>

      <AvatarCircle name={person.name} avatarUrl={person.avatarDataUrl} size={36} />

      <div className="flex-1 min-w-0">
        <p
          className="font-['Oswald'] text-white/75 tracking-wide truncate group-hover:text-white/90 transition-colors duration-300"
          style={{ fontSize: "0.85rem" }}
        >
          {person.name}
        </p>
        <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.65rem" }}>
          {formatBirthdayRu(person.birthday)}
          {nextAge && <span className="ml-1.5">· {nextAge} лет</span>}
          {sign && <span className="ml-1.5">{signEmoji} {sign}</span>}
        </p>
      </div>

      {/* Source badge */}
      <div
        className="shrink-0 px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
        style={{
          fontSize: "0.48rem",
          color: person.source === "account" ? "#38bdf8" : "#9b2335",
          background: person.source === "account" ? "rgba(56,189,248,0.07)" : "rgba(155,35,53,0.07)",
          border: `1px solid ${person.source === "account" ? "rgba(56,189,248,0.15)" : "rgba(155,35,53,0.15)"}`,
        }}
      >
        {person.source === "account" ? "Аккаунт" : "Ручной"}
      </div>
    </motion.div>
  );
}

/* Month mini calendar cells */
function MonthView({ birthdays }: { birthdays: MergedBirthday[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = now.getDate();

  const bdMap: Record<number, MergedBirthday[]> = {};
  for (const p of birthdays) {
    const dd = parseInt(p.birthday.split("-")[2], 10);
    if (!bdMap[dd]) bdMap[dd] = [];
    bdMap[dd].push(p);
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <div
            key={d}
            className="text-center font-['Oswald'] text-white/15 uppercase tracking-wider py-1"
            style={{ fontSize: "0.52rem" }}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const isToday = day === today;
          const hasBd = !!bdMap[day];
          const bdList = bdMap[day] ?? [];
          return (
            <div
              key={day}
              className="relative aspect-square flex items-center justify-center rounded-sm cursor-default"
              style={{
                background: isToday
                  ? "rgba(155,35,53,0.12)"
                  : hasBd
                    ? "rgba(245,158,11,0.06)"
                    : "transparent",
                border: isToday
                  ? "1px solid rgba(155,35,53,0.3)"
                  : hasBd
                    ? "1px solid rgba(245,158,11,0.2)"
                    : "1px solid transparent",
              }}
              title={bdList.map((p) => p.name).join(", ")}
            >
              <span
                className="font-['Oswald']"
                style={{
                  fontSize: "0.6rem",
                  color: isToday ? "#9b2335" : hasBd ? "#f59e0b" : "rgba(255,255,255,0.2)",
                }}
              >
                {day}
              </span>
              {hasBd && (
                <div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: "#f59e0b" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN WIDGET
   ═══════════════════════════════════════════════ */

type FilterView = "upcoming" | "month" | "all";

export function BirthdayWidget() {
  const [all, setAll] = useState<MergedBirthday[]>([]);
  const [view, setView] = useState<FilterView>("upcoming");
  const [sendStatus, setSendStatus] = useState<Record<string, "sending" | "done" | "error">>({});
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load data
  useEffect(() => {
    const load = () => setAll(getAllBirthdays());
    load();
  }, []);

  // Scheduler
  useEffect(() => {
    runBirthdayScheduler();
    schedulerRef.current = setInterval(runBirthdayScheduler, 60_000);
    return () => {
      if (schedulerRef.current) clearInterval(schedulerRef.current);
    };
  }, []);

  const sorted = sortByUpcoming(all);
  const todayBirthdays = sorted.filter((p) => isBirthdayToday(p.birthday));
  const upcoming = sorted.filter((p) => !isBirthdayToday(p.birthday)).slice(0, 12);
  const monthBirthdays = getMonthBirthdays(all);

  const handleSendWish = async (person: MergedBirthday) => {
    setSendStatus((s) => ({ ...s, [person.id]: "sending" }));
    const ok = await sendBirthdayWebhook(person, true);
    setSendStatus((s) => ({ ...s, [person.id]: ok ? "done" : "error" }));
    setTimeout(() => setSendStatus((s) => { const n = { ...s }; delete n[person.id]; return n; }), 3000);
  };

  const displayList =
    view === "upcoming" ? upcoming :
    view === "month" ? sortByUpcoming(monthBirthdays).filter((p) => !isBirthdayToday(p.birthday)) :
    sortByUpcoming(all).filter((p) => !isBirthdayToday(p.birthday));

  const now = new Date();
  const monthName = MONTH_NAMES_RU[now.getMonth()];

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* separator line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent mb-16 -mt-2" />

        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8 gap-4 flex-wrap"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-[1px] bg-[#9b2335]/30" />
              <span
                className="font-['Oswald'] text-[#9b2335]/50 uppercase tracking-[0.3em]"
                style={{ fontSize: "0.65rem" }}
              >
                Schwarz Family
              </span>
            </div>
            <h2
              className="font-['Russo_One'] text-white flex items-center gap-3"
              style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)", lineHeight: 1.1 }}
            >
              <Cake size={22} className="text-[#9b2335]/60" strokeWidth={1.5} />
              Дни рождения
            </h2>
          </div>

          {/* Count badge */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 border"
              style={{ borderColor: "rgba(155,35,53,0.15)", background: "rgba(155,35,53,0.04)" }}
            >
              <Gift size={12} className="text-[#9b2335]/40" strokeWidth={1.5} />
              <span className="font-['Oswald'] text-white/40 uppercase tracking-wider" style={{ fontSize: "0.65rem" }}>
                {all.length} участников
              </span>
            </div>
            {todayBirthdays.length > 0 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-2 px-3 py-1.5 border"
                style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.07)" }}
              >
                <Sparkles size={12} className="text-[#f59e0b]/70" />
                <span className="font-['Oswald'] text-[#f59e0b]/70 uppercase tracking-wider" style={{ fontSize: "0.65rem" }}>
                  Сегодня {todayBirthdays.length} именинник{todayBirthdays.length > 1 ? "а" : ""}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Left column ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* TODAY section */}
            <AnimatePresence>
              {todayBirthdays.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Star size={13} className="text-[#f59e0b]/60" strokeWidth={1.5} />
                    <span
                      className="font-['Oswald'] text-[#f59e0b]/60 uppercase tracking-[0.3em]"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Сегодня
                    </span>
                    <div className="flex-1 h-[1px] bg-[#f59e0b]/10" />
                  </div>
                  {todayBirthdays.map((p) => (
                    <TodayCard
                      key={p.id}
                      person={p}
                      onSendWish={handleSendWish}
                    />
                  ))}
                  {/* Send status overlay */}
                  {todayBirthdays.some((p) => sendStatus[p.id]) && (
                    <AnimatePresence>
                      {todayBirthdays.map((p) =>
                        sendStatus[p.id] ? (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 px-3 py-2 border"
                            style={{
                              borderColor: sendStatus[p.id] === "done" ? "rgba(34,197,94,0.2)" : sendStatus[p.id] === "error" ? "rgba(255,51,102,0.2)" : "rgba(255,255,255,0.08)",
                              background: sendStatus[p.id] === "done" ? "rgba(34,197,94,0.04)" : sendStatus[p.id] === "error" ? "rgba(255,51,102,0.04)" : "rgba(255,255,255,0.02)",
                            }}
                          >
                            <span className="font-['Oswald'] tracking-wide" style={{
                              fontSize: "0.72rem",
                              color: sendStatus[p.id] === "done" ? "#22c55e" : sendStatus[p.id] === "error" ? "#ff3366" : "rgba(255,255,255,0.4)",
                            }}>
                              {sendStatus[p.id] === "sending" && "⏳ Отправка..."}
                              {sendStatus[p.id] === "done" && "✅ Поздравление отправлено в Discord!"}
                              {sendStatus[p.id] === "error" && "❌ Ошибка отправки — проверь вебхук"}
                            </span>
                          </motion.div>
                        ) : null
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 border-b border-white/5 pb-0">
              {([
                { id: "upcoming", label: "Ближайшие", icon: Clock },
                { id: "month", label: monthName, icon: Calendar },
                { id: "all", label: "Все", icon: Gift },
              ] as { id: FilterView; label: string; icon: typeof Clock }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all duration-200 ${
                    view === tab.id
                      ? "border-[#9b2335] text-[#9b2335]"
                      : "border-transparent text-white/30 hover:text-white/50"
                  }`}
                  style={{ marginBottom: "-1px" }}
                >
                  <tab.icon size={12} strokeWidth={1.5} />
                  <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.65rem" }}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* List */}
            <div
              className="border border-white/5 bg-white/[0.01] px-4 py-2"
              style={{ minHeight: 200 }}
            >
              {displayList.length === 0 ? (
                <div className="py-12 text-center">
                  <Cake size={28} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
                  <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.8rem" }}>
                    {view === "month"
                      ? `В ${monthName.toLowerCase()} больше нет дней рождений`
                      : "Дни рождения не добавлены"}
                  </p>
                  <p className="font-['Oswald'] text-white/8 tracking-wide mt-1" style={{ fontSize: "0.68rem" }}>
                    Участники могут указать дату в Личном кабинете
                  </p>
                </div>
              ) : (
                displayList.map((p, i) => <UpcomingRow key={p.id} person={p} index={i} />)
              )}
            </div>

            {/* Hint */}
            <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.65rem" }}>
              💡 Участники могут указать дату рождения в{" "}
              <a href="/cabinet" className="text-[#9b2335]/40 hover:text-[#9b2335]/60 transition-colors">
                Личном кабинете
              </a>
              , она автоматически появится здесь. Администратор также может добавить запись вручную.
            </p>
          </div>

          {/* ─── Right column ─── */}
          <div className="space-y-5">

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="border border-white/5 bg-white/[0.01] p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={13} className="text-[#9b2335]/40" strokeWidth={1.5} />
                <span
                  className="font-['Oswald'] text-white/40 uppercase tracking-wider"
                  style={{ fontSize: "0.68rem" }}
                >
                  {monthName} {now.getFullYear()}
                </span>
                <span
                  className="ml-auto font-['Oswald'] uppercase tracking-wider px-2 py-0.5"
                  style={{
                    fontSize: "0.52rem",
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    color: "rgba(245,158,11,0.6)",
                  }}
                >
                  {monthBirthdays.length} ДР
                </span>
              </div>
              <MonthView birthdays={monthBirthdays} />

              {/* Month birthday list */}
              {monthBirthdays.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  {sortByUpcoming(monthBirthdays).map((p) => {
                    const isToday = isBirthdayToday(p.birthday);
                    const days = getDaysUntilBirthday(p.birthday);
                    return (
                      <div key={p.id} className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: isToday ? "#f59e0b" : "rgba(155,35,53,0.4)" }}
                        />
                        <span
                          className="flex-1 font-['Oswald'] truncate"
                          style={{
                            fontSize: "0.7rem",
                            color: isToday ? "rgba(245,158,11,0.8)" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {p.name}
                        </span>
                        <span
                          className="shrink-0 font-['Oswald'] text-white/20"
                          style={{ fontSize: "0.62rem" }}
                        >
                          {isToday ? "🎂 сегодня" : `${formatBirthdayRu(p.birthday)} · ${days}д`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Next birthday countdown */}
            {upcoming.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="border border-white/5 bg-white/[0.01] p-5"
              >
                <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-3" style={{ fontSize: "0.62rem" }}>
                  Следующий
                </p>
                <div className="flex items-center gap-3">
                  <AvatarCircle name={upcoming[0].name} avatarUrl={upcoming[0].avatarDataUrl} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-['Oswald'] text-white/70 tracking-wide truncate" style={{ fontSize: "0.85rem" }}>
                      {upcoming[0].name}
                    </p>
                    <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.65rem" }}>
                      {formatBirthdayRu(upcoming[0].birthday)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-['Russo_One'] text-[#9b2335]" style={{ fontSize: "1.5rem" }}>
                      {getDaysUntilBirthday(upcoming[0].birthday)}
                    </span>
                    <p className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.5rem" }}>
                      {getDaysUntilBirthday(upcoming[0].birthday) === 1 ? "день" : "дней"}
                    </p>
                  </div>
                </div>
                {upcoming.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="font-['Oswald'] text-white/15 tracking-wide flex items-center gap-1" style={{ fontSize: "0.62rem" }}>
                      <ChevronRight size={10} />
                      Потом: {upcoming[1].name} — через {getDaysUntilBirthday(upcoming[1].birthday)} дн.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Empty state */}
            {all.length === 0 && (
              <div className="border border-white/5 bg-white/[0.01] p-8 text-center">
                <Cake size={32} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
                <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.78rem" }}>
                  Дни рождения ещё не добавлены
                </p>
                <p className="font-['Oswald'] text-white/10 tracking-wide mt-2" style={{ fontSize: "0.65rem" }}>
                  Укажи дату в личном кабинете
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
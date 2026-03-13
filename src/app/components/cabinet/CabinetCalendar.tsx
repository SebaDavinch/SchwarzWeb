import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, Cake, Target, ClipboardList, ChevronLeft, ChevronRight,
  Megaphone, Clock, Pin, Flag,
} from "lucide-react";
import {
  getAllBirthdays, isBirthdayToday,
  formatBirthdayRu, getZodiacEmoji, getZodiacSign,
} from "../../hooks/useBirthdays";
import { loadPublicGoals, GOAL_CATEGORIES } from "../../hooks/useFamilyGoals";

/* ────────────────────────────────────────────
   TYPES
──────────────────────────────────────────── */

type EventType = "birthday" | "goal" | "contract" | "announcement";

interface CalEvent {
  id: string;
  type: EventType;
  title: string;
  subtitle?: string;
  date: Date;
  color: string;
  emoji?: string;
  pinned?: boolean;
}

/* ────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────── */

function getDayName(d: Date) {
  return d.toLocaleDateString("ru-RU", { weekday: "short" });
}

function getMonthName(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  // Monday-based (0 = Mon, 6 = Sun)
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function relativeLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "сегодня";
  if (diff === 1) return "завтра";
  if (diff === -1) return "вчера";
  if (diff < 0) return `${Math.abs(diff)} дн. назад`;
  return `через ${diff} дн.`;
}

function formatFull(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });
}

const TYPE_META: Record<EventType, { label: string; color: string; Icon: typeof Calendar }> = {
  birthday:     { label: "День рождения", color: "#f59e0b", Icon: Cake },
  goal:         { label: "Дедлайн цели",  color: "#9b2335", Icon: Target },
  contract:     { label: "Контракт",      color: "#38bdf8", Icon: ClipboardList },
  announcement: { label: "Объявление",    color: "#a78bfa", Icon: Megaphone },
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/* ────────────────────────────────────────────
   BUILD EVENTS from localStorage
──────────────────────────────────────────── */

function buildEvents(): CalEvent[] {
  const events: CalEvent[] = [];
  const now = new Date();
  const year = now.getFullYear();

  /* Birthdays — map to this year (or next if already passed today) */
  const birthdays = getAllBirthdays();
  birthdays.forEach((p) => {
    const raw = new Date(p.birthday);
    let d = new Date(year, raw.getMonth(), raw.getDate());
    if (d < now && !isBirthdayToday(p.birthday)) {
      d = new Date(year + 1, raw.getMonth(), raw.getDate());
    }
    const sign = getZodiacSign(p.birthday);
    events.push({
      id: `bd_${p.id}`,
      type: "birthday",
      title: p.name,
      subtitle: `${getZodiacEmoji(sign)} ${formatBirthdayRu(p.birthday)}`,
      date: d,
      color: "#f59e0b",
      emoji: "🎂",
    });
  });

  /* Goal deadlines */
  const goals = loadPublicGoals().filter((g) => g.deadline && g.status !== "completed");
  goals.forEach((g) => {
    const cat = GOAL_CATEGORIES.find((c) => c.id === g.category);
    events.push({
      id: `gl_${g.id}`,
      type: "goal",
      title: g.title,
      subtitle: cat?.label,
      date: new Date(g.deadline!),
      color: cat?.color ?? "#9b2335",
      emoji: g.emoji,
      pinned: g.pinned,
    });
  });

  /* Open contracts */
  try {
    const raw = localStorage.getItem("schwarz_contracts");
    if (raw) {
      const contracts = JSON.parse(raw) as { id: string; title: string; status: string; createdAt: string; estimatedMinutes?: number }[];
      contracts
        .filter((c) => c.status === "open" || c.status === "in_progress")
        .slice(0, 5)
        .forEach((c) => {
          const base = new Date(c.createdAt);
          const eta = c.estimatedMinutes ?? 180;
          const end = new Date(base.getTime() + eta * 60000);
          if (end >= now) {
            events.push({
              id: `ct_${c.id}`,
              type: "contract",
              title: c.title,
              subtitle: c.status === "open" ? "Открыт" : "В процессе",
              date: end,
              color: "#38bdf8",
              emoji: "📋",
            });
          }
        });
    }
  } catch { /* ignore */ }

  /* Pinned announcements */
  try {
    const raw = localStorage.getItem("schwarz_admin_announcements");
    if (raw) {
      const anns = JSON.parse(raw) as { id: string; title: string; date: string; pinned?: boolean }[];
      anns.filter((a) => a.pinned).slice(0, 3).forEach((a) => {
        const d = new Date(a.date);
        if (!isNaN(d.getTime())) {
          events.push({
            id: `ann_${a.id}`,
            type: "announcement",
            title: a.title,
            date: d,
            color: "#a78bfa",
            emoji: "📢",
            pinned: true,
          });
        }
      });
    }
  } catch { /* ignore */ }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/* ────────────────────────────────────────────
   MINI CALENDAR GRID
──────────────────────────────────────────── */

function MiniCalendar({
  year, month, events, selected, onSelect,
}: {
  year: number; month: number; events: CalEvent[];
  selected: Date | null; onSelect: (d: Date) => void;
}) {
  const today = new Date();
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const eventDays = new Set(
    events
      .filter((e) => e.date.getFullYear() === year && e.date.getMonth() === month)
      .map((e) => e.date.getDate())
  );

  const todayIsThisMonth = today.getFullYear() === year && today.getMonth() === month;
  const selectedIsThisMonth = selected && selected.getFullYear() === year && selected.getMonth() === month;

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center font-['Oswald'] text-white/15 uppercase tracking-widest"
            style={{ fontSize: "0.5rem", padding: "4px 0" }}>
            {w}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e_${idx}`} />;
          const isToday = todayIsThisMonth && today.getDate() === day;
          const hasEvent = eventDays.has(day);
          const isSelected = selectedIsThisMonth && selected!.getDate() === day;
          const cellDate = new Date(year, month, day);
          const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button
              key={`d_${day}`}
              onClick={() => onSelect(cellDate)}
              className="relative flex flex-col items-center justify-center py-1.5 transition-all duration-150"
              style={{
                background: isSelected ? "rgba(155,35,53,0.12)" : isToday ? "rgba(155,35,53,0.06)" : "transparent",
                border: isToday ? "1px solid rgba(155,35,53,0.3)" : isSelected ? "1px solid rgba(155,35,53,0.25)" : "1px solid transparent",
              }}>
              <span className="font-['Oswald'] tracking-wide"
                style={{
                  fontSize: "0.7rem",
                  color: isToday ? "#9b2335" : isSelected ? "rgba(255,255,255,0.8)" : isPast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)",
                }}>
                {day}
              </span>
              {hasEvent && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: "#f59e0b" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   EVENT ROW
──────────────────────────────────────────── */

function EventRow({ event }: { event: CalEvent }) {
  const meta = TYPE_META[event.type];
  const Icon = meta.Icon;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(event.date);
  eventDay.setHours(0, 0, 0, 0);
  const isToday = eventDay.getTime() === today.getTime();
  const isPast = eventDay.getTime() < today.getTime();

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 px-3 py-2.5 border transition-all duration-150 ${
        isToday
          ? "border-[#f59e0b]/20 bg-[#f59e0b]/04"
          : isPast
          ? "border-white/[0.03] opacity-40"
          : "border-white/[0.05] hover:border-white/[0.09]"
      }`}
    >
      {/* Date marker */}
      <div className="shrink-0 w-10 text-center">
        <div className="font-['Russo_One']" style={{ fontSize: "1rem", color: event.color, opacity: isPast ? 0.5 : 1 }}>
          {event.date.getDate()}
        </div>
        <div className="font-['Oswald'] text-white/20 uppercase tracking-widest" style={{ fontSize: "0.42rem" }}>
          {getDayName(event.date)}
        </div>
      </div>

      {/* Left line */}
      <div className="w-px self-stretch shrink-0" style={{ background: `${event.color}30` }} />

      {/* Icon */}
      <div className="w-7 h-7 shrink-0 flex items-center justify-center rounded-sm"
        style={{ background: `${event.color}10`, border: `1px solid ${event.color}20` }}>
        {event.emoji
          ? <span style={{ fontSize: "0.9rem" }}>{event.emoji}</span>
          : <Icon size={13} strokeWidth={1.5} style={{ color: event.color }} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-['Oswald'] text-white/70 tracking-wide truncate" style={{ fontSize: "0.82rem" }}>
            {event.title}
          </span>
          {event.pinned && <Pin size={9} className="text-[#f59e0b]/50 shrink-0" />}
        </div>
        {event.subtitle && (
          <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.6rem" }}>{event.subtitle}</p>
        )}
      </div>

      {/* Right: relative label */}
      <div className="shrink-0 text-right">
        <span className="font-['Oswald'] uppercase tracking-wider"
          style={{ fontSize: "0.52rem", color: isToday ? "#f59e0b" : event.color, opacity: isToday ? 1 : 0.6 }}>
          {relativeLabel(event.date)}
        </span>
        <div className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.48rem" }}>
          {meta.label}
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   MAIN
──────────────────────────────────────────── */

export function CabinetCalendar() {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<EventType | "all">("all");

  const events = useMemo(() => buildEvents(), []);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  /* Events to display in list */
  const listEvents = useMemo(() => {
    let filtered = events;
    if (filterType !== "all") filtered = filtered.filter((e) => e.type === filterType);
    if (selected) {
      filtered = filtered.filter((e) => sameDay(e.date, selected));
    }
    return filtered;
  }, [events, filterType, selected]);

  /* Events in current month calendar */
  const monthEvents = useMemo(() =>
    events.filter((e) => e.date.getFullYear() === calYear && e.date.getMonth() === calMonth),
    [events, calYear, calMonth]
  );

  /* Upcoming (next 30 days, not filtered) */
  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const limit = new Date();
    limit.setDate(limit.getDate() + 30);
    return events.filter((e) => e.date >= now && e.date <= limit);
  }, [events]);

  const todayEvents = events.filter((e) => sameDay(e.date, today));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center border border-[#9b2335]/20 bg-[#9b2335]/06">
          <Calendar size={15} className="text-[#9b2335]/60" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1.05rem" }}>Календарь событий</h3>
          <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
            Дни рождения · Дедлайны целей · Контракты
          </p>
        </div>
      </div>

      {/* Today highlight */}
      {todayEvents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 px-4 py-3 border border-[#f59e0b]/20 bg-[#f59e0b]/04">
          <Flag size={14} className="text-[#f59e0b]/60 shrink-0 mt-0.5" />
          <div>
            <p className="font-['Oswald'] text-[#f59e0b]/70 uppercase tracking-wider" style={{ fontSize: "0.65rem" }}>
              Сегодня: {todayEvents.length} событий
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {todayEvents.map((e) => (
                <span key={e.id} className="font-['Oswald'] tracking-wide"
                  style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)" }}>
                  {e.emoji} {e.title}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        {/* ── LEFT: Mini Calendar ── */}
        <div className="space-y-4">
          <div className="border border-white/[0.06] bg-[#13131c] p-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 text-white/20 hover:text-white/50 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <ChevronLeft size={13} />
              </button>
              <span className="font-['Oswald'] text-white/50 uppercase tracking-widest" style={{ fontSize: "0.65rem" }}>
                {getMonthName(calYear, calMonth)}
              </span>
              <button onClick={nextMonth} className="p-1.5 text-white/20 hover:text-white/50 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <ChevronRight size={13} />
              </button>
            </div>

            <MiniCalendar
              year={calYear} month={calMonth}
              events={events} selected={selected}
              onSelect={(d) => setSelected(sameDay(d, selected ?? new Date(0)) ? null : d)}
            />

            {/* Month summary */}
            {monthEvents.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/[0.05] space-y-1">
                {Object.entries(
                  monthEvents.reduce<Record<EventType, number>>((acc, e) => {
                    acc[e.type] = (acc[e.type] ?? 0) + 1; return acc;
                  }, {} as Record<EventType, number>)
                ).map(([type, count]) => {
                  const meta = TYPE_META[type as EventType];
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="font-['Oswald'] tracking-wide"
                        style={{ fontSize: "0.6rem", color: meta.color, opacity: 0.6 }}>
                        {meta.label}
                      </span>
                      <span className="font-['Russo_One']" style={{ fontSize: "0.75rem", color: meta.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming in 30 days counter */}
          <div className="border border-white/[0.05] px-4 py-3 flex items-center gap-3">
            <Clock size={13} className="text-white/20 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.7rem" }}>
                {upcoming.length} событий в ближайшие 30 дней
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Event list ── */}
        <div>
          {/* Filter tabs */}
          <div className="flex items-center gap-0 border-b border-white/[0.05] mb-4">
            {([
              { id: "all" as const, label: `Все (${events.length})` },
              ...Object.entries(TYPE_META).map(([type, meta]) => ({
                id: type as EventType,
                label: `${meta.label} (${events.filter((e) => e.type === type).length})`,
              })),
            ]).map((tab) => (
              <button key={tab.id} onClick={() => setFilterType(tab.id)}
                className={`px-3 py-2 border-b-2 font-['Oswald'] uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterType === tab.id ? "border-[#9b2335] text-[#9b2335]" : "border-transparent text-white/20 hover:text-white/40"
                }`}
                style={{ fontSize: "0.58rem", marginBottom: "-1px" }}>
                {tab.label}
              </button>
            ))}
            {selected && (
              <button onClick={() => setSelected(null)}
                className="ml-auto px-3 py-2 font-['Oswald'] text-white/20 hover:text-white/45 uppercase tracking-wider transition-colors flex items-center gap-1"
                style={{ fontSize: "0.58rem" }}>
                ✕ {selected.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
              </button>
            )}
          </div>

          {/* List */}
          {listEvents.length === 0 ? (
            <div className="border border-white/[0.04] py-14 text-center">
              <Calendar size={28} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
              <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.78rem" }}>
                {selected ? "Нет событий на выбранный день" : "Нет событий"}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {listEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

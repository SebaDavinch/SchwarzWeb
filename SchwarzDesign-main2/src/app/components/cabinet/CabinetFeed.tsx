import { useMemo } from "react";
import { motion } from "motion/react";
import {
  Megaphone, Newspaper, AlertTriangle, Info, CheckCircle2,
  Pin, ChevronRight, User, Clock, Tag,
} from "lucide-react";
import { Link } from "react-router";
import type { CabinetNotification } from "../../hooks/useCabinetData";

interface Announcement {
  id: string; title: string; text: string;
  date: string; priority: "low" | "normal" | "high"; pinned?: boolean;
}
interface NewsItem {
  id: string; title: string; summary?: string;
  date: string; author?: string;
}
interface FeedItem {
  id: string;
  kind: "announcement" | "news" | "notification";
  title: string; text: string; date: string;
  priority?: string; pinned?: boolean;
  author?: string; newsId?: string;
}

interface Props {
  notifications: CabinetNotification[];
  memberName?: string;
  avatarUrl?: string;
}

const ANN_PRIORITY: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: "Инфо",     color: "#6b7280", bg: "#6b728015" },
  normal: { label: "Важно",    color: "#9b2335", bg: "#9b233515" },
  high:   { label: "Срочно!",  color: "#ff3366", bg: "#ff336618" },
};

const NOTIF_KIND: Record<string, { label: string; color: string; Icon: typeof Info }> = {
  info:         { label: "Уведомление", color: "#3b82f6", Icon: Info },
  warning:      { label: "Внимание",   color: "#f59e0b", Icon: AlertTriangle },
  success:      { label: "Успех",      color: "#22c55e", Icon: CheckCircle2 },
  announcement: { label: "Анонс",      color: "#9b2335", Icon: Megaphone },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 2)  return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `${h}ч назад`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}д назад`;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── System avatar (icon in a circle) ── */
function SysAvatar({ color, Icon }: { color: string; Icon: typeof Info }) {
  return (
    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
      <Icon size={16} strokeWidth={1.5} style={{ color }} />
    </div>
  );
}

/* ── User avatar ── */
function UserAvatar({ url, name }: { url?: string; name?: string }) {
  return (
    <div className="w-9 h-9 rounded-full shrink-0 border border-white/10 bg-[#1a1a25] overflow-hidden flex items-center justify-center">
      {url ? (
        <img src={url} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <User size={16} className="text-white/25" strokeWidth={1.5} />
      )}
    </div>
  );
}

export function CabinetFeed({ notifications, memberName, avatarUrl }: Props) {
  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    try {
      const raw = localStorage.getItem("schwarz_admin_announcements");
      if (raw) {
        (JSON.parse(raw) as Announcement[]).forEach(a =>
          items.push({ id: `ann_${a.id}`, kind: "announcement", title: a.title, text: a.text, date: a.date, priority: a.priority, pinned: a.pinned })
        );
      }
    } catch { /* */ }
    try {
      const raw = localStorage.getItem("schwarz_admin_news");
      if (raw) {
        (JSON.parse(raw) as NewsItem[]).slice(0, 6).forEach(n =>
          items.push({ id: `news_${n.id}`, kind: "news", title: n.title, text: n.summary || "", date: n.date, author: n.author, newsId: n.id })
        );
      }
    } catch { /* */ }
    notifications.forEach(n =>
      items.push({ id: `notif_${n.id}`, kind: "notification", title: n.title, text: n.text, date: n.createdAt, priority: n.type })
    );
    return items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [notifications]);

  const pinned  = feed.filter(f => f.pinned);
  const regular = feed.filter(f => !f.pinned);

  return (
    <div className="max-w-2xl">

      {/* ── EMPTY ── */}
      {feed.length === 0 && (
        <div className="border border-white/[0.06] bg-[#13131c] p-14 text-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Megaphone size={22} className="text-white/15" strokeWidth={1} />
          </div>
          <p className="text-white/20 uppercase tracking-widest mb-1" style={{ fontSize: "0.68rem" }}>
            Лента пуста
          </p>
          <p className="text-white/12" style={{ fontSize: "0.6rem" }}>
            Объявления и новости появятся здесь
          </p>
        </div>
      )}

      {/* ── PINNED ── */}
      {pinned.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Pin size={11} className="text-[#f59e0b]/60" />
            <span className="text-white/25 uppercase tracking-widest" style={{ fontSize: "0.5rem" }}>
              Закреплённые
            </span>
          </div>
          <div className="space-y-2">
            {pinned.map((item, i) => (
              <FeedCard key={item.id} item={item} index={i} isPinned />
            ))}
          </div>
        </div>
      )}

      {/* ── REGULAR ── */}
      {regular.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Clock size={11} className="text-white/20" />
              <span className="text-white/25 uppercase tracking-widest" style={{ fontSize: "0.5rem" }}>
                Последние события
              </span>
            </div>
          )}
          <div className="space-y-2">
            {regular.map((item, i) => (
              <FeedCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedCard({ item, index, isPinned }: { item: FeedItem; index: number; isPinned?: boolean }) {
  const isAnn  = item.kind === "announcement";
  const isNews = item.kind === "news";

  /* ── colors & meta ── */
  let accentColor = "#9b2335";
  let categoryLabel = "Объявление";
  let IconComp: typeof Info = Megaphone;

  if (isAnn) {
    const p = ANN_PRIORITY[item.priority ?? "normal"];
    accentColor = p.color;
    categoryLabel = p.label;
    IconComp = Megaphone;
  } else if (isNews) {
    accentColor = "#7c3aed";
    categoryLabel = "Новость";
    IconComp = Newspaper;
  } else {
    const k = NOTIF_KIND[item.priority ?? "info"];
    accentColor = k.color;
    categoryLabel = k.label;
    IconComp = k.Icon;
  }

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      className="group relative flex items-stretch bg-[#13131c] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#16161f] transition-all duration-200 overflow-hidden"
    >
      {/* Left accent line */}
      <div className="w-[3px] shrink-0" style={{ background: `${accentColor}` }} />

      {/* Content */}
      <div className="flex-1 flex items-start gap-3 p-4">
        {/* Avatar / icon */}
        <SysAvatar color={accentColor} Icon={IconComp} />

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {isPinned && (
              <span className="flex items-center gap-1 px-1.5 py-0.5"
                style={{ background: "#f59e0b12", border: "1px solid #f59e0b25", borderRadius: "2px" }}>
                <Pin size={8} style={{ color: "#f59e0b" }} />
                <span className="uppercase tracking-widest" style={{ fontSize: "0.45rem", color: "#f59e0b" }}>
                  Закреплено
                </span>
              </span>
            )}
            <span className="flex items-center gap-1 px-1.5 py-0.5"
              style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25`, borderRadius: "2px" }}>
              <Tag size={8} style={{ color: accentColor }} />
              <span className="uppercase tracking-widest" style={{ fontSize: "0.45rem", color: accentColor }}>
                {categoryLabel}
              </span>
            </span>
            <span className="text-white/20 ml-auto shrink-0" style={{ fontSize: "0.57rem" }}>
              {formatDate(item.date)}
            </span>
          </div>

          {/* Title */}
          <p className="text-white/85 leading-snug mb-1"
            style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.9rem", letterSpacing: "0.02em" }}>
            {item.title}
          </p>

          {/* Preview text */}
          {item.text && (
            <p className="text-white/35 leading-relaxed line-clamp-2"
              style={{ fontFamily: "'Oswald',sans-serif", fontSize: "0.72rem" }}>
              {item.text}
            </p>
          )}

          {/* Author + Read more */}
          {(item.author || isNews) && (
            <div className="flex items-center gap-3 mt-2">
              {item.author && (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                    <User size={9} className="text-white/25" strokeWidth={1.5} />
                  </div>
                  <span className="text-white/25" style={{ fontSize: "0.58rem" }}>{item.author}</span>
                </div>
              )}
              {isNews && item.newsId && (
                <span className="ml-auto flex items-center gap-1 text-white/20 hover:text-white/50 transition-colors"
                  style={{ fontSize: "0.58rem", letterSpacing: "0.08em" }}>
                  Читать далее
                  <ChevronRight size={11} />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isNews && item.newsId) {
    return <Link to={`/news/${item.newsId}`} className="block">{inner}</Link>;
  }
  return inner;
}
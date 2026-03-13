/* ═══════════════════════════════════════════════
   useMoments — shared hook + types for Moments
   ═══════════════════════════════════════════════ */
import { useState, useCallback, useEffect } from "react";
import { listMoments as listMomentsAPI, putMoments } from "../api/endpoints";

/* ─── Category ─── */
export type MomentCategory =
  | "leadership" | "vzp" | "family" | "raids" | "streams" | "other";

export const MOMENT_CATEGORIES: {
  id: MomentCategory; label: string; color: string; emoji: string;
}[] = [
  { id: "leadership", label: "Лидерки",  color: "#9b2335", emoji: "🏆" },
  { id: "vzp",        label: "ВЗП",      color: "#f59e0b", emoji: "🏙" },
  { id: "family",     label: "Семья",    color: "#ff3366", emoji: "👨‍👩‍👦" },
  { id: "raids",      label: "Рейды",    color: "#a855f7", emoji: "⚔️" },
  { id: "streams",    label: "Стримы",   color: "#9146ff", emoji: "📡" },
  { id: "other",      label: "Другое",   color: "#6b7280", emoji: "📸" },
];

/* ─── Media type ─── */
export type MomentMediaType = "photo" | "youtube" | "twitch" | "video";

/* ─── Moderation status ─── */
export type MomentStatus = "approved" | "pending" | "rejected";

/* ─── Main type ─── */
export interface Moment {
  id: string;
  title: string;
  description?: string;
  url: string;             // thumbnail / image URL
  videoUrl?: string;       // raw YouTube / Twitch URL
  mediaType: MomentMediaType;
  category: MomentCategory;
  date: string;            // ISO date string
  author: string;
  authorAccountId?: string; // linked ЛК account
  featured: boolean;
  visible: boolean;
  order: number;
  // moderation
  status: MomentStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

/* ─── Storage ─── */
const KEY = "schwarz_admin_moments";

const DEFAULT_MOMENTS: Moment[] = [
  { id:"m1", title:"Захват FIB — первая лидерка", description:"Исторический момент — семья Schwarz впервые берёт под контроль Federal Investigation Bureau на Majestic RP.", url:"https://images.unsplash.com/photo-1485230405346-71acb9518d9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", mediaType:"photo", category:"leadership", date:"2024-12-18", author:"Roman Schwarz", featured:true, visible:true, order:1, status:"approved", submittedAt:"2024-12-18T00:00:00.000Z" },
  { id:"m2", title:"LSPD — синяя эпоха", description:"Madara Schwarz возглавляет LSPD.", url:"https://images.unsplash.com/photo-1710161974229-81e30ab21256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", mediaType:"photo", category:"leadership", date:"2024-08-15", author:"Madara Schwarz", featured:true, visible:true, order:2, status:"approved", submittedAt:"2024-08-15T00:00:00.000Z" },
  { id:"m3", title:"18 точек ВЗП", description:"Экономическая империя Schwarz Family.", url:"https://images.unsplash.com/photo-1710161970209-2b24ae44814a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", mediaType:"photo", category:"vzp", date:"2025-06-01", author:"Akihiro Schwarz", featured:true, visible:true, order:3, status:"approved", submittedAt:"2025-06-01T00:00:00.000Z" },
  { id:"m4", title:"Yakuza — ночь самурая", description:"Madara Schwarz в роли лидера Якудзы.", url:"https://images.unsplash.com/photo-1604315841269-a1f298321670?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", mediaType:"photo", category:"leadership", date:"2025-07-01", author:"Madara Schwarz", featured:false, visible:true, order:4, status:"approved", submittedAt:"2025-07-01T00:00:00.000Z" },
  { id:"m5", title:"Семейный рейд", description:"Все в сборе — координация семьи.", url:"https://images.unsplash.com/photo-1670414555223-636a70b95ca0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", mediaType:"photo", category:"raids", date:"2025-09-15", author:"Kerro Schwarz", featured:false, visible:true, order:5, status:"approved", submittedAt:"2025-09-15T00:00:00.000Z" },
  { id:"m6", title:"Стрим — 10k просмотров", description:"Nebesnyin устанавливает личный рекорд.", url:"https://images.unsplash.com/photo-1632603093711-0d93a0bcc6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", mediaType:"photo", category:"streams", date:"2025-11-20", author:"Madara Schwarz", featured:false, visible:true, order:6, status:"approved", submittedAt:"2025-11-20T00:00:00.000Z" },
  { id:"m7", title:"FIB II — возвращение Akihiro", description:"Akihiro Schwarz берёт вторую лидерку FIB.", url:"https://images.unsplash.com/photo-1599825804319-3dbb64fbaabe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", mediaType:"photo", category:"leadership", date:"2025-10-27", author:"Akihiro Schwarz", featured:true, visible:true, order:7, status:"approved", submittedAt:"2025-10-27T00:00:00.000Z" },
  { id:"m8", title:"Встреча на Majestic Seattle", description:"Возвращение на Majestic в 2026 году.", url:"https://images.unsplash.com/photo-1763495195144-f8d4da2b850f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", mediaType:"photo", category:"family", date:"2026-01-15", author:"Madara Schwarz", featured:false, visible:true, order:8, status:"approved", submittedAt:"2026-01-15T00:00:00.000Z" },
];

export function loadMoments(): Moment[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_MOMENTS;
    const arr: Moment[] = JSON.parse(raw);
    // migrate old moments without status/mediaType
    return arr.map((m) => ({
      ...m,
      status: m.status ?? "approved",
      mediaType: m.mediaType ?? ((m as unknown as Record<string, string>).videoUrl ? "video" : "photo"),
      submittedAt: m.submittedAt ?? new Date().toISOString(),
    }));
  } catch {
    return DEFAULT_MOMENTS;
  }
}

export function saveMoments(moments: Moment[]) {
  localStorage.setItem(KEY, JSON.stringify(moments));
}

/* ─── URL helpers ─── */
export function detectMediaType(url: string): MomentMediaType {
  if (!url) return "photo";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("twitch.tv/clip") || url.includes("clips.twitch.tv")) return "twitch";
  return "photo";
}

export function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
}

export function getTwitchClipSlug(url: string): string | null {
  const m = url.match(/twitch\.tv\/\w+\/clip\/([A-Za-z0-9_-]+)|clips\.twitch\.tv\/([A-Za-z0-9_-]+)/);
  return m ? (m[1] || m[2]) : null;
}

export function getEmbedUrl(moment: Moment): string | null {
  if (!moment.videoUrl) return null;
  if (moment.mediaType === "youtube") {
    const id = getYouTubeId(moment.videoUrl);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
  }
  if (moment.mediaType === "twitch") {
    const slug = getTwitchClipSlug(moment.videoUrl);
    return slug ? `https://clips.twitch.tv/embed?clip=${slug}&parent=${window.location.hostname}&autoplay=false` : null;
  }
  return null;
}

/* ─── ID gen ─── */
function genId() {
  return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ═══════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════ */

export function useMoments() {
  const [moments, setMomentsState] = useState<Moment[]>(() => loadMoments());

  // Sync from API on mount
  useEffect(() => {
    listMomentsAPI<Moment>()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMomentsState(data);
          saveMoments(data);
        }
      })
      .catch(() => {});
  }, []);

  const persist = useCallback((updated: Moment[]) => {
    setMomentsState(updated);
    saveMoments(updated);
    putMoments(updated).catch(() => {});
  }, []);

  const addMoment = (data: Omit<Moment, "id" | "order" | "submittedAt">) => {
    const newMoment: Moment = {
      ...data,
      id: genId(),
      order: moments.length + 1,
      submittedAt: new Date().toISOString(),
    };
    persist([...moments, newMoment]);
    return newMoment;
  };

  const updateMoment = (id: string, changes: Partial<Moment>) => {
    persist(moments.map((m) => m.id === id ? { ...m, ...changes } : m));
  };

  const deleteMoment = (id: string) => {
    persist(moments.filter((m) => m.id !== id));
  };

  const approveMoment = (id: string, reviewerName: string) => {
    persist(moments.map((m) => m.id === id ? {
      ...m, status: "approved", reviewedAt: new Date().toISOString(), reviewedBy: reviewerName
    } : m));
  };

  const rejectMoment = (id: string, reviewerName: string, reason: string) => {
    persist(moments.map((m) => m.id === id ? {
      ...m, status: "rejected", reviewedAt: new Date().toISOString(), reviewedBy: reviewerName, rejectionReason: reason
    } : m));
  };

  const reorderMoment = (id: string, dir: -1 | 1) => {
    const arr = [...moments];
    const idx = arr.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    persist(arr);
  };

  const toggleFeatured = (id: string) => {
    persist(moments.map((m) => m.id === id ? { ...m, featured: !m.featured } : m));
  };

  const toggleVisible = (id: string) => {
    persist(moments.map((m) => m.id === id ? { ...m, visible: !m.visible } : m));
  };

  // Submit from cabinet (status = pending)
  const submitMoment = (data: Omit<Moment, "id" | "order" | "submittedAt" | "status">) => {
    return addMoment({ ...data, status: "pending" });
  };

  const pendingCount = moments.filter((m) => m.status === "pending").length;
  const publicMoments = moments.filter((m) => m.status === "approved" && m.visible);

  return {
    moments,
    pendingCount,
    publicMoments,
    persist,
    addMoment,
    updateMoment,
    deleteMoment,
    approveMoment,
    rejectMoment,
    reorderMoment,
    toggleFeatured,
    toggleVisible,
    submitMoment,
  };
}

/* ─── TG webhook notification helper (called from MomentsTab) ─── */
export async function notifyMomentSubmittedToAdmins(moment: Moment): Promise<void> {
  try {
    const raw = localStorage.getItem("schwarz_admin_discordWebhook");
    const cfg = raw ? JSON.parse(raw) : {};
    if (!cfg.enabled || !cfg.url) return;

    const cat = MOMENT_CATEGORIES.find((c) => c.id === moment.category);

    await fetch(cfg.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Schwarz Family",
        avatar_url: "https://i.imgur.com/AfFp7pu.png",
        embeds: [{
          title: "📸 Новый момент на модерации",
          description: `**${moment.title}**\n${moment.description ?? ""}`,
          color: 0x9b2335,
          fields: [
            { name: "Автор", value: moment.author || "—", inline: true },
            { name: "Категория", value: cat ? `${cat.emoji} ${cat.label}` : moment.category, inline: true },
            { name: "Тип", value: moment.mediaType.toUpperCase(), inline: true },
          ],
          footer: { text: "Schwarz Family | Моменты — требует одобрения" },
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch { /* ignore */ }
}

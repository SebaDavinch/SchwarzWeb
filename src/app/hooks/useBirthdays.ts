import { useState, useCallback, useEffect } from "react";
import {
  listBirthdayEntries,
  putBirthdayEntries,
  getBirthdayNotifConfigAPI,
  putBirthdayNotifConfigAPI,
} from "../api/endpoints";

/* ═══════════════════════════════════════════════
   STORAGE HELPERS
   ═══════════════════════════════════════════════ */

const PREFIX = "schwarz_admin_";

function save(key: string, data: unknown) {
  localStorage.setItem(PREFIX + key, JSON.stringify(data));
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

export interface BirthdayEntry {
  id: string;
  name: string;
  birthday: string;       // "YYYY-MM-DD"
  memberId?: string;
  accountId?: string;
  note?: string;
  source: "manual";
  createdAt: string;
}

export interface BirthdayNotifConfig {
  enabled: boolean;
  sendTime: string;       // "HH:MM" 24h
  message: string;        // supports {name} {age}
  useMainWebhook: boolean;
  webhookUrl: string;
}

export const DEFAULT_BIRTHDAY_MESSAGE =
  "🎂 Сегодня день рождения у **{name}**! Ему/ей исполняется **{age} лет**! Семья Schwarz поздравляет! 🎉🥳";

const DEFAULT_NOTIF_CONFIG: BirthdayNotifConfig = {
  enabled: true,
  sendTime: "10:00",
  message: DEFAULT_BIRTHDAY_MESSAGE,
  useMainWebhook: true,
  webhookUrl: "",
};

/* ═══════════════════════════════════════════════
   MERGED BIRTHDAY — union of manual + accounts
   ═══════════════════════════════════════════════ */

export interface MergedBirthday {
  id: string;
  name: string;
  birthday: string;           // "YYYY-MM-DD"
  source: "manual" | "account";
  accountId?: string;
  memberId?: string;
  note?: string;
  avatarDataUrl?: string;
}

/* ═══════════════════════════════════════════════
   STATIC HELPERS (no React state)
   ═══════════════════════════════════════════════ */

export function getBirthdayEntries(): BirthdayEntry[] {
  try {
    const raw = localStorage.getItem(PREFIX + "birthdays");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBirthdayEntries(entries: BirthdayEntry[]) {
  localStorage.setItem(PREFIX + "birthdays", JSON.stringify(entries));
}

export function getBirthdayNotifConfig(): BirthdayNotifConfig {
  try {
    const raw = localStorage.getItem(PREFIX + "birthdayNotifConfig");
    return raw ? { ...DEFAULT_NOTIF_CONFIG, ...JSON.parse(raw) } : DEFAULT_NOTIF_CONFIG;
  } catch {
    return DEFAULT_NOTIF_CONFIG;
  }
}

export function saveBirthdayNotifConfig(c: BirthdayNotifConfig) {
  localStorage.setItem(PREFIX + "birthdayNotifConfig", JSON.stringify(c));
}

/** Merge manual birthday entries with account birthday data */
export function getAllBirthdays(): MergedBirthday[] {
  const manual = getBirthdayEntries();

  const accountsRaw = localStorage.getItem("schwarz_accounts");
  type AccRaw = {
    id: string; username: string; realName?: string;
    birthday?: string; memberId?: string; avatarDataUrl?: string;
  };
  const accounts: AccRaw[] = accountsRaw ? JSON.parse(accountsRaw) : [];

  const accountBirthdays: MergedBirthday[] = accounts
    .filter((a) => !!a.birthday)
    .map((a) => ({
      id: `acc_${a.id}`,
      name: a.realName || a.username,
      birthday: a.birthday!,
      source: "account" as const,
      accountId: a.id,
      memberId: a.memberId,
      avatarDataUrl: a.avatarDataUrl,
    }));

  // Exclude manual entries that are already covered by an account entry
  const filteredManual = manual.filter(
    (m) => !m.accountId || !accountBirthdays.some((ab) => ab.accountId === m.accountId)
  );

  return [
    ...filteredManual.map((m) => ({ ...m, source: "manual" as const })),
    ...accountBirthdays,
  ];
}

/* ─── Date helpers ─── */

export function getDaysUntilBirthday(birthday: string): number {
  if (!birthday) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = birthday.split("-").map(Number);
  const mm = parts[1];
  const dd = parts[2];

  const thisYear = new Date(today.getFullYear(), mm - 1, dd);
  thisYear.setHours(0, 0, 0, 0);

  if (thisYear.getTime() < today.getTime()) {
    const nextYear = new Date(today.getFullYear() + 1, mm - 1, dd);
    nextYear.setHours(0, 0, 0, 0);
    return Math.round((nextYear.getTime() - today.getTime()) / 86400000);
  }
  return Math.round((thisYear.getTime() - today.getTime()) / 86400000);
}

export function isBirthdayToday(birthday: string): boolean {
  return getDaysUntilBirthday(birthday) === 0;
}

export function getAge(birthday: string): number | null {
  if (!birthday) return null;
  const today = new Date();
  const bd = new Date(birthday);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age >= 0 ? age : null;
}

export function formatBirthdayRu(birthday: string): string {
  if (!birthday) return "";
  const parts = birthday.split("-").map(Number);
  const mm = parts[1];
  const dd = parts[2];
  const months = [
    "", "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  return `${dd} ${months[mm] ?? ""}`;
}

export function getZodiacSign(birthday: string): string {
  if (!birthday) return "";
  const parts = birthday.split("-").map(Number);
  const mm = parts[1];
  const dd = parts[2];
  const signs: [number, number, string][] = [
    [1, 20, "Козерог"], [2, 19, "Водолей"], [3, 21, "Рыбы"],
    [4, 20, "Овен"], [5, 21, "Телец"], [6, 21, "Близнецы"],
    [7, 23, "Рак"], [8, 23, "Лев"], [9, 23, "Дева"],
    [10, 23, "Весы"], [11, 22, "Скорпион"], [12, 22, "Стрелец"],
    [12, 32, "Козерог"],
  ];
  for (const [m, d, sign] of signs) {
    if (mm < m) return sign;
    if (mm === m && dd < d) return sign;
  }
  return "Козерог";
}

export function getZodiacEmoji(sign: string): string {
  const map: Record<string, string> = {
    Козерог: "♑", Водолей: "♒", Рыбы: "♓", Овен: "♈", Телец: "♉",
    Близнецы: "♊", Рак: "♋", Лев: "♌", Дева: "♍", Весы: "♎",
    Скорпион: "♏", Стрелец: "♐",
  };
  return map[sign] ?? "";
}

/* ═══════════════════════════════════════════════
   NOTIFICATION TRACKING
   ═══════════════════════════════════════════════ */

const NOTIF_TRACK_KEY = "schwarz_birthday_notified";

function getNotifTracker(): Record<string, number> {
  try {
    const raw = localStorage.getItem(NOTIF_TRACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setNotifTracker(t: Record<string, number>) {
  localStorage.setItem(NOTIF_TRACK_KEY, JSON.stringify(t));
}

function wasNotifiedThisYear(id: string): boolean {
  const t = getNotifTracker();
  return t[id] === new Date().getFullYear();
}

function markNotified(id: string) {
  const t = getNotifTracker();
  t[id] = new Date().getFullYear();
  setNotifTracker(t);
}

/* ═══════════════════════════════════════════════
   WEBHOOK SENDER
   ═══════════════════════════════════════════════ */

const WEBHOOK_LOG_KEY = "schwarz_admin_webhookLog";

function appendToLog(event: string, title: string, success: boolean, details?: string) {
  try {
    const raw = localStorage.getItem(WEBHOOK_LOG_KEY);
    const log: unknown[] = raw ? JSON.parse(raw) : [];
    log.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      timestamp: new Date().toISOString(),
      event,
      title,
      success,
      details,
    });
    localStorage.setItem(WEBHOOK_LOG_KEY, JSON.stringify(log.slice(0, 50)));
  } catch { /* ignore */ }
}

export async function sendBirthdayWebhook(
  person: MergedBirthday,
  manual = false
): Promise<boolean> {
  const notifConfig = getBirthdayNotifConfig();
  if (!manual && !notifConfig.enabled) return false;

  // Determine URL
  let url = "";
  if (notifConfig.useMainWebhook || !notifConfig.webhookUrl.trim()) {
    try {
      const raw = localStorage.getItem("schwarz_admin_discordWebhook");
      const cfg = raw ? JSON.parse(raw) : {};
      url = cfg.url || "";
    } catch { /* ignore */ }
  } else {
    url = notifConfig.webhookUrl;
  }

  if (!url || (!url.includes("discord.com/api/webhooks/") && !url.includes("discordapp.com/api/webhooks/"))) {
    appendToLog("birthdayGreeting", `ДР: ${person.name}`, false, "Не настроен вебхук");
    return false;
  }

  const age = getAge(person.birthday);
  const ageStr = age !== null ? String(age + 1) : "?"; // next birthday age
  const message = notifConfig.message
    .replace("{name}", person.name)
    .replace("{age}", ageStr);

  const embed = {
    title: `🎂 День рождения!`,
    description: message,
    color: 0x9b2335,
    fields: [
      { name: "Именинник", value: person.name, inline: true },
      ...(age !== null ? [{ name: "Возраст", value: `${age + 1} лет`, inline: true }] : []),
      { name: "Дата", value: formatBirthdayRu(person.birthday), inline: true },
    ],
    footer: { text: "Schwarz Family | Дни рождения", icon_url: "https://i.imgur.com/AfFp7pu.png" },
    timestamp: new Date().toISOString(),
    thumbnail: { url: "https://i.imgur.com/AfFp7pu.png" },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Schwarz Family",
        avatar_url: "https://i.imgur.com/AfFp7pu.png",
        embeds: [embed],
      }),
    });
    const ok = res.ok || res.status === 204;
    appendToLog("birthdayGreeting", `ДР: ${person.name}`, ok);
    if (ok) markNotified(person.id);
    return ok;
  } catch (err) {
    appendToLog("birthdayGreeting", `ДР: ${person.name}`, false, String(err));
    return false;
  }
}

/* ═══════════════════════════════════════════════
   SCHEDULER — call periodically
   ═══════════════════════════════════════════════ */

export function runBirthdayScheduler(): void {
  const notifConfig = getBirthdayNotifConfig();
  if (!notifConfig.enabled) return;

  // Check if current time >= sendTime
  const now = new Date();
  const [hh, mm] = notifConfig.sendTime.split(":").map(Number);
  const sendMinutes = hh * 60 + mm;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes < sendMinutes) return;

  const all = getAllBirthdays();
  for (const person of all) {
    if (isBirthdayToday(person.birthday) && !wasNotifiedThisYear(person.id)) {
      sendBirthdayWebhook(person);
    }
  }
}

/* ═══════════════════════════════════════════════
   HOOK — for admin panel
   ═══════════════════════════════════════════════ */

export function useBirthdays() {
  const [entries, setEntriesState] = useState<BirthdayEntry[]>(() =>
    load("birthdays", [])
  );
  const [notifConfig, setNotifConfigState] = useState<BirthdayNotifConfig>(() =>
    load("birthdayNotifConfig", DEFAULT_NOTIF_CONFIG)
  );

  // Sync from API on mount
  useEffect(() => {
    listBirthdayEntries<BirthdayEntry>()
      .then((data) => { if (Array.isArray(data)) { setEntriesState(data); save("birthdays", data); } })
      .catch(() => {});
    getBirthdayNotifConfigAPI<BirthdayNotifConfig>()
      .then((data) => { if (data) { setNotifConfigState(data); save("birthdayNotifConfig", data); } })
      .catch(() => {});
  }, []);

  const setEntries = useCallback((e: BirthdayEntry[]) => {
    setEntriesState(e);
    save("birthdays", e);
    putBirthdayEntries(e).catch(() => {});
  }, []);

  const setNotifConfig = useCallback((c: BirthdayNotifConfig) => {
    setNotifConfigState(c);
    save("birthdayNotifConfig", c);
    putBirthdayNotifConfigAPI(c).catch(() => {});
  }, []);

  const addEntry = (data: Omit<BirthdayEntry, "id" | "createdAt" | "source">) => {
    const entry: BirthdayEntry = {
      ...data,
      id: `bd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      source: "manual",
      createdAt: new Date().toISOString(),
    };
    setEntries([...entries, entry]);
    return entry;
  };

  const updateEntry = (id: string, changes: Partial<BirthdayEntry>) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return {
    entries,
    notifConfig,
    setNotifConfig,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}

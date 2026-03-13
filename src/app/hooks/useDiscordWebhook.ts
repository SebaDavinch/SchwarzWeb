/* ═══════════════════════════════════════════════
   DISCORD WEBHOOK — уведомления в Discord
   ═══════════════════════════════════════════════ */

const LOG_KEY = "schwarz_admin_webhookLog";

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  username?: string;
  avatarUrl?: string;
}

export interface WebhookEvents {
  newApplication: boolean;
  applicationVerdict: boolean;
  memberAdded: boolean;
  memberRemoved: boolean;
  newAnnouncement: boolean;
  leadershipChange: boolean;
  newsPublished: boolean;
  momentAdded: boolean;
}

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  event: string;
  title: string;
  success: boolean;
  details?: string;
}

const defaultEvents: WebhookEvents = {
  newApplication: true,
  applicationVerdict: true,
  memberAdded: true,
  memberRemoved: true,
  newAnnouncement: true,
  leadershipChange: true,
  newsPublished: true,
  momentAdded: false,
};

export const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  url: "",
  enabled: false,
  username: "Schwarz Family",
  avatarUrl: "",
};

export const DEFAULT_WEBHOOK_EVENTS: WebhookEvents = { ...defaultEvents };

export async function getWebhookConfig(): Promise<WebhookConfig> {
  try {
    const r = await fetch("/api/webhooks/config");
    return r.ok ? await r.json() : DEFAULT_WEBHOOK_CONFIG;
  } catch {
    return DEFAULT_WEBHOOK_CONFIG;
  }
}

export async function saveWebhookConfig(config: WebhookConfig) {
  await fetch("/api/webhooks/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
}

export async function getWebhookEvents(): Promise<WebhookEvents> {
  try {
    const r = await fetch("/api/webhooks/events");
    return r.ok ? { ...defaultEvents, ...(await r.json()) } : defaultEvents;
  } catch {
    return defaultEvents;
  }
}

export async function saveWebhookEvents(events: WebhookEvents) {
  await fetch("/api/webhooks/events", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events),
  });
}

/* ═══════════════════════════════════════════════
   WEBHOOK LOG
   ═══════════════════════════════════════════════ */

export function getWebhookLog(): WebhookLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendWebhookLog(entry: Omit<WebhookLogEntry, "id" | "timestamp">) {
  const log = getWebhookLog();
  const newEntry: WebhookLogEntry = {
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...log].slice(0, 50); // keep last 50
  localStorage.setItem(LOG_KEY, JSON.stringify(updated));
}

export function clearWebhookLog() {
  localStorage.removeItem(LOG_KEY);
}

/* ═══════════════════════════════════════════════
   EMBED BUILDER & SENDER
   ═══════════════════════════════════════════════ */

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  author?: { name: string; icon_url?: string };
}

function hexToDecimal(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

async function sendWebhook(embed: DiscordEmbed, eventKey: string, eventLabel: string) {
  const config = await getWebhookConfig();
  if (!config.enabled || !config.url.trim()) return;

  if (
    !config.url.includes("discord.com/api/webhooks/") &&
    !config.url.includes("discordapp.com/api/webhooks/")
  ) {
    console.warn("[Schwarz Webhook] Invalid webhook URL");
    appendWebhookLog({ event: eventKey, title: eventLabel, success: false, details: "Неверный URL" });
    return;
  }

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: config.username || "Schwarz Family",
        avatar_url: config.avatarUrl || "https://i.imgur.com/AfFp7pu.png",
        embeds: [
          {
            ...embed,
            footer: {
              text: embed.footer?.text || "Schwarz Family | Majestic RP",
              icon_url: "https://i.imgur.com/AfFp7pu.png",
            },
            timestamp: embed.timestamp || new Date().toISOString(),
          },
        ],
      }),
    });
    const ok = res.ok || res.status === 204;
    appendWebhookLog({ event: eventKey, title: eventLabel, success: ok });
  } catch (err) {
    console.warn("[Schwarz Webhook] Failed to send:", err);
    appendWebhookLog({ event: eventKey, title: eventLabel, success: false, details: String(err) });
  }
}

/* ═══════════════════════════════════════════════
   PUBLIC API — вызывается из компонентов
   ═══════════════════════════════════════════════ */

export async function notifyNewApplication(nickname: string, discord: string) {
  const events = await getWebhookEvents();
  if (!events.newApplication) return;

  sendWebhook(
    {
      title: "📋 Новая заявка на вступление",
      description: `**${nickname}** подал(а) заявку в Schwarz Family.`,
      color: hexToDecimal("#f59e0b"),
      fields: [{ name: "Discord", value: discord || "Не указан", inline: true }],
      footer: { text: "Schwarz Family | Заявки" },
      author: { name: "Новая заявка" },
    },
    "newApplication",
    `Заявка: ${nickname}`
  );
}

export async function notifyApplicationVerdict(
  nickname: string,
  status: "accepted" | "rejected",
  reviewedBy: string
) {
  const events = await getWebhookEvents();
  if (!events.applicationVerdict) return;

  const isAccepted = status === "accepted";
  sendWebhook(
    {
      title: isAccepted ? "✅ Заявка принята" : "❌ Заявка отклонена",
      description: `Заявка от **${nickname}** была ${isAccepted ? "**принята**" : "**отклонена**"}.`,
      color: hexToDecimal(isAccepted ? "#9b2335" : "#ff3366"),
      fields: [{ name: "Рассмотрел", value: reviewedBy, inline: true }],
      footer: { text: "Schwarz Family | Заявки" },
    },
    "applicationVerdict",
    `Вердикт: ${nickname} — ${isAccepted ? "принят" : "отклонён"}`
  );
}

export async function notifyMemberAdded(name: string, role: string) {
  const events = await getWebhookEvents();
  if (!events.memberAdded) return;

  const roleLabels: Record<string, string> = {
    owner: "👑 Owner",
    close: "🛡 Close",
    main: "⭐ Main",
    academy: "📚 Academy",
  };

  sendWebhook(
    {
      title: "👤 Новый участник",
      description: `**${name}** добавлен(а) в состав Schwarz Family.`,
      color: hexToDecimal("#9b2335"),
      fields: [{ name: "Роль", value: roleLabels[role] || role, inline: true }],
      footer: { text: "Schwarz Family | Состав" },
    },
    "memberAdded",
    `Добавлен: ${name} (${role})`
  );
}

export async function notifyMemberRemoved(name: string) {
  const events = await getWebhookEvents();
  if (!events.memberRemoved) return;

  sendWebhook(
    {
      title: "🚪 Участник покинул семью",
      description: `**${name}** удалён(а) из состава Schwarz Family.`,
      color: hexToDecimal("#ff3366"),
      footer: { text: "Schwarz Family | Состав" },
    },
    "memberRemoved",
    `Удалён: ${name}`
  );
}

export async function notifyNewAnnouncement(title: string, priority: string) {
  const events = await getWebhookEvents();
  if (!events.newAnnouncement) return;

  const priorityLabels: Record<string, string> = {
    low: "🔵 Низкий",
    normal: "🟡 Обычный",
    high: "🔴 Высокий",
  };
  const colors: Record<string, string> = {
    low: "#3b82f6",
    normal: "#f59e0b",
    high: "#ff3366",
  };

  sendWebhook(
    {
      title: "📢 Новое объявление",
      description: `**${title}**`,
      color: hexToDecimal(colors[priority] || "#9b2335"),
      fields: [{ name: "Приоритет", value: priorityLabels[priority] || priority, inline: true }],
      footer: { text: "Schwarz Family | Объявления" },
    },
    "newAnnouncement",
    `Объявление: ${title}`
  );
}

export async function notifyLeadershipChange(
  action: "add" | "edit" | "delete",
  faction: string,
  leader: string
) {
  const events = await getWebhookEvents();
  if (!events.leadershipChange) return;

  const actionLabels = {
    add: "🏆 Добавлена лидерка",
    edit: "✏️ Изменена лидерка",
    delete: "🗑 Удалена лидерка",
  };

  sendWebhook(
    {
      title: actionLabels[action],
      description: `**${faction}** — ${leader}`,
      color: hexToDecimal(action === "delete" ? "#ff3366" : "#9b2335"),
      footer: { text: "Schwarz Family | Лидерки" },
    },
    "leadershipChange",
    `${actionLabels[action]}: ${faction} (${leader})`
  );
}

export async function notifyNewsPublished(title: string, category: string, author: string) {
  const events = await getWebhookEvents();
  if (!events.newsPublished) return;

  sendWebhook(
    {
      title: "📰 Новая статья опубликована",
      description: `**${title}**`,
      color: hexToDecimal("#9b2335"),
      fields: [
        { name: "Категория", value: category, inline: true },
        { name: "Автор", value: author, inline: true },
      ],
      footer: { text: "Schwarz Family | Schwarz News" },
    },
    "newsPublished",
    `Статья: ${title}`
  );
}

export async function notifyMomentAdded(title: string, category: string) {
  const events = await getWebhookEvents();
  if (!events.momentAdded) return;

  sendWebhook(
    {
      title: "📸 Добавлен новый момент",
      description: `**${title}** — в альбоме «Лучшие Моменты».`,
      color: hexToDecimal("#9b2335"),
      fields: [{ name: "Категория", value: category, inline: true }],
      footer: { text: "Schwarz Family | Моменты" },
    },
    "momentAdded",
    `Момент: ${title}`
  );
}

/** Test webhook by sending a test embed */
export async function testWebhook(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Schwarz Family",
        avatar_url: "https://i.imgur.com/AfFp7pu.png",
        embeds: [
          {
            title: "🔔 Тестовое уведомление",
            description:
              "Вебхук успешно подключён к **Schwarz Family Admin Panel**!\n\nВсе уведомления будут приходить сюда.",
            color: hexToDecimal("#9b2335"),
            fields: [
              { name: "Статус", value: "✅ Активен", inline: true },
              { name: "Панель", value: "Admin Panel", inline: true },
            ],
            footer: {
              text: "Schwarz Family | Majestic RP",
              icon_url: "https://i.imgur.com/AfFp7pu.png",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    const ok = res.ok || res.status === 204;
    if (ok) {
      appendWebhookLog({ event: "test", title: "Тестовое сообщение", success: true });
    }
    return ok;
  } catch {
    appendWebhookLog({ event: "test", title: "Тестовое сообщение", success: false, details: "Ошибка соединения" });
    return false;
  }
}

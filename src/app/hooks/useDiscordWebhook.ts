import { postDiscordWebhookEvent } from "../api/endpoints";

/* ═══════════════════════════════════════════════
   DISCORD WEBHOOK — уведомления в Discord
   ═══════════════════════════════════════════════ */

const STORAGE_KEY = "schwarz_admin_discordWebhook";
const EVENTS_KEY = "schwarz_admin_webhookEvents";

export interface WebhookConfig {
  url: string;
  enabled: boolean;
}

export interface WebhookEvents {
  newApplication: boolean;
  applicationVerdict: boolean;
  memberAdded: boolean;
  memberRemoved: boolean;
  newAnnouncement: boolean;
  leadershipChange: boolean;
}

const defaultEvents: WebhookEvents = {
  newApplication: true,
  applicationVerdict: true,
  memberAdded: true,
  memberRemoved: true,
  newAnnouncement: true,
  leadershipChange: true,
};

export function getWebhookConfig(): WebhookConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { url: "", enabled: false };
  } catch {
    return { url: "", enabled: false };
  }
}

export function saveWebhookConfig(config: WebhookConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getWebhookEvents(): WebhookEvents {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? { ...defaultEvents, ...JSON.parse(raw) } : defaultEvents;
  } catch {
    return defaultEvents;
  }
}

export function saveWebhookEvents(events: WebhookEvents) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
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
}

function hexToDecimal(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

async function sendWebhook(embed: DiscordEmbed) {
  const sentByApi = await postDiscordWebhookEvent({
    ...embed,
    footer: { text: embed.footer?.text || "Schwarz Family Admin Panel" },
    timestamp: embed.timestamp || new Date().toISOString(),
  });
  if (sentByApi) return;

  const config = getWebhookConfig();
  if (!config.enabled || !config.url.trim()) return;

  // Validate URL looks like a Discord webhook
  if (!config.url.includes("discord.com/api/webhooks/") && !config.url.includes("discordapp.com/api/webhooks/")) {
    console.warn("[Schwarz Webhook] Invalid webhook URL");
    return;
  }

  try {
    await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Schwarz Family",
        avatar_url: "https://i.imgur.com/AfFp7pu.png",
        embeds: [
          {
            ...embed,
            footer: { text: embed.footer?.text || "Schwarz Family Admin Panel" },
            timestamp: embed.timestamp || new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.warn("[Schwarz Webhook] Failed to send:", err);
  }
}

/* ═══════════════════════════════════════════════
   PUBLIC API — вызывается из компонентов
   ═══════════════════════════════════════════════ */

export function notifyNewApplication(nickname: string, server: string, discord: string) {
  const events = getWebhookEvents();
  if (!events.newApplication) return;

  sendWebhook({
    title: "Новая заявка на вступление",
    description: `**${nickname}** подал(а) заявку в семью.`,
    color: hexToDecimal("#f59e0b"),
    fields: [
      { name: "Сервер", value: server || "Не указан", inline: true },
      { name: "Discord", value: discord || "Не указан", inline: true },
    ],
  });
}

export function notifyApplicationVerdict(nickname: string, status: "accepted" | "rejected", reviewedBy: string) {
  const events = getWebhookEvents();
  if (!events.applicationVerdict) return;

  const isAccepted = status === "accepted";
  sendWebhook({
    title: isAccepted ? "Заявка принята" : "Заявка отклонена",
    description: `Заявка от **${nickname}** была ${isAccepted ? "принята" : "отклонена"}.`,
    color: hexToDecimal(isAccepted ? "#9b2335" : "#ff3366"),
    fields: [
      { name: "Рассмотрел", value: reviewedBy, inline: true },
    ],
  });
}

export function notifyMemberAdded(name: string, role: string) {
  const events = getWebhookEvents();
  if (!events.memberAdded) return;

  const roleLabels: Record<string, string> = {
    owner: "Owner",
    dep_owner: "Dep. Owner",
    veteran: "Ветеран",
    member: "Участник",
  };

  sendWebhook({
    title: "Новый участник",
    description: `**${name}** добавлен(а) в состав семьи.`,
    color: hexToDecimal("#9b2335"),
    fields: [
      { name: "Роль", value: roleLabels[role] || role, inline: true },
    ],
  });
}

export function notifyMemberRemoved(name: string) {
  const events = getWebhookEvents();
  if (!events.memberRemoved) return;

  sendWebhook({
    title: "Участник удалён",
    description: `**${name}** удалён(а) из состава семьи.`,
    color: hexToDecimal("#ff3366"),
  });
}

export function notifyNewAnnouncement(title: string, priority: string) {
  const events = getWebhookEvents();
  if (!events.newAnnouncement) return;

  const priorityLabels: Record<string, string> = {
    low: "Низкий",
    normal: "Обычный",
    high: "Высокий",
  };

  sendWebhook({
    title: "Новое объявление",
    description: `**${title}**`,
    color: hexToDecimal(priority === "high" ? "#ff3366" : "#9b2335"),
    fields: [
      { name: "Приоритет", value: priorityLabels[priority] || priority, inline: true },
    ],
  });
}

export function notifyLeadershipChange(action: "add" | "edit" | "delete", faction: string, leader: string) {
  const events = getWebhookEvents();
  if (!events.leadershipChange) return;

  const actionLabels = {
    add: "Добавлен�� лидерка",
    edit: "Изменена лидерка",
    delete: "Удалена лидерка",
  };

  sendWebhook({
    title: actionLabels[action],
    description: `**${faction}** — ${leader}`,
    color: hexToDecimal(action === "delete" ? "#ff3366" : "#9b2335"),
  });
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
            title: "Тестовое уведомление",
            description: "Вебхук успешно подключён к **Schwarz Family Admin Panel**!",
            color: hexToDecimal("#9b2335"),
            footer: { text: "Schwarz Family Admin Panel" },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}
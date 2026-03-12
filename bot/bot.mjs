#!/usr/bin/env node
// bot/bot.mjs — Schwarz Family Telegram Bot
import { Bot, InlineKeyboard } from "grammy";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ── Config ──────────────────────────────────────────── */
const TOKEN = process.env.TG_BOT_TOKEN;
const API_BASE = process.env.API_BASE_URL || "http://localhost:8790/api";
const SITE_URL = process.env.SITE_URL || "";
// Comma-separated numeric Telegram user IDs that receive admin notifications
const ADMIN_IDS = (process.env.TG_ADMIN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map(Number);

if (!TOKEN) {
  console.error("[bot] TG_BOT_TOKEN is not set. Exiting.");
  process.exit(1);
}

/* ── State ───────────────────────────────────────────── */
const STATE_FILE = path.join(__dirname, ".state.json");

function readState() {
  try {
    if (fs.existsSync(STATE_FILE))
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {}
  return {
    users: {},          // telegramId -> { memberId, memberName, notifyNews, notifyContracts }
    lastAppId: null,    // last notified application id
    lastAnnId: null,    // last notified announcement id
    lastContractId: null,
  };
}

function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), "utf8");
}

/* ── API helpers ─────────────────────────────────────── */
async function apiGet(endpoint) {
  try {
    const r = await fetch(`${API_BASE}${endpoint}`);
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
}

async function apiPatch(endpoint, body) {
  try {
    const r = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
}

/* ── Formatters ──────────────────────────────────────── */
const ROLE_LABELS = {
  owner: "👑 Owner",
  dep_owner: "⚜️ Dep. Owner",
  veteran: "🎖 Ветеран",
  member: "👤 Участник",
};

const BADGE_LABELS = {
  streamer: "🎥 Стример", leader: "🔺 Эк-лидер", developer: "💻 Разработчик",
  fib: "🟣 FIB", lspd: "🔵 LSPD", lssd: "🟡 LSSD", ems: "🔴 EMS",
  gov: "🟢 GOV", army: "⚫ Army", news: "🩷 News",
  fisherman: "🎣 Рыбак", miner: "⛏ Шахтёр", trucker: "🚛 Дальнобойщик",
  farmer: "🌾 Фермер", mechanic: "🔧 Механик", pilot: "✈️ Пилот",
};

function fmtBadges(badges) {
  if (!badges?.length) return "";
  return badges.map((b) => BADGE_LABELS[b] || b).join("  ");
}

function fmtApp(app) {
  return [
    `📋 <b>Новая заявка в семью</b>`,
    ``,
    `👤 <b>Никнейм:</b> ${app.nickname}`,
    `💬 <b>Discord:</b> ${app.discord}`,
    `🎂 <b>Возраст:</b> ${app.age}`,
    `🖥 <b>Сервер:</b> ${app.server}`,
    `⏰ <b>Прайм:</b> ${app.primetime}`,
    `👥 <b>Реферал:</b> ${app.referral || "—"}`,
    `💭 <b>Ожидания:</b> ${app.expectations || "—"}`,
    ``,
    `📅 ${new Date(app.submittedAt).toLocaleString("ru-RU")}`,
  ].join("\n");
}

function fmtMember(m) {
  const badges = fmtBadges(m.badges);
  return [
    `👤 <b>${m.name}</b>`,
    `🎭 ${ROLE_LABELS[m.role] || m.role}`,
    badges || null,
    `📅 В семье с: <code>${m.joinDate}</code>`,
    m.active ? "🟢 Активен" : "🔴 Неактивен",
  ]
    .filter(Boolean)
    .join("\n");
}

function fmtContract(c) {
  return [
    `📄 <b>${c.title}</b>`,
    c.description || null,
    c.reward ? `💰 <b>Награда:</b> ${c.reward}` : null,
    c.available ? "🟢 Доступен" : "🔴 Занят",
  ]
    .filter(Boolean)
    .join("\n");
}

function fmtAnn(a) {
  const priority = a.priority === "high" ? "🔴 " : a.priority === "normal" ? "🟡 " : "";
  return [
    `📢 ${priority}<b>${a.title || "Объявление"}</b>`,
    a.text || null,
    a.date ? `📅 ${a.date}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/* ── Keyboards ───────────────────────────────────────── */
function mainMenu(isAdmin = false) {
  const kb = new InlineKeyboard()
    .text("👤 Профиль", "cmd_profile")
    .text("📰 Новости", "cmd_news")
    .row()
    .text("📄 Контракты", "cmd_contracts")
    .text("🔔 Уведомления", "cmd_notify")
    .row();
  if (isAdmin) {
    kb.text("📋 Ожидающие заявки", "cmd_pending");
  }
  return kb;
}

/* ── Bot ─────────────────────────────────────────────── */
const bot = new Bot(TOKEN);

// /start
bot.command("start", async (ctx) => {
  const tgId = String(ctx.from.id);
  const state = readState();
  const user = state.users[tgId];
  const isAdmin = ADMIN_IDS.includes(ctx.from.id);

  const greeting = user?.memberName
    ? `С возвращением, <b>${user.memberName}</b>! 🖤`
    : `Добро пожаловать! 🖤\n\n<i>Привяжи аккаунт участника:</i>\n/link &lt;никнейм&gt;\n<i>Пример: /link Madara Schwarz</i>`;

  await ctx.reply(`🖤 <b>Schwarz Family</b>\n\n${greeting}`, {
    parse_mode: "HTML",
    reply_markup: mainMenu(isAdmin),
  });
});

// /link <nickname>
bot.command("link", async (ctx) => {
  const nickname = ctx.message?.text?.split(" ").slice(1).join(" ").trim();
  if (!nickname) return ctx.reply("Укажи никнейм:\n/link Madara Schwarz");

  const snapshot = await apiGet("/admin/snapshot");
  const members = snapshot?.members || [];
  const member = members.find(
    (m) => m.name.toLowerCase() === nickname.toLowerCase()
  );

  if (!member) {
    return ctx.reply(
      `❌ Участник <b>${nickname}</b> не найден в составе.\n\nПроверь написание никнейма.`,
      { parse_mode: "HTML" }
    );
  }

  const tgId = String(ctx.from.id);
  const state = readState();
  state.users[tgId] = {
    ...(state.users[tgId] || {}),
    memberId: member.id,
    memberName: member.name,
    notifyNews: state.users[tgId]?.notifyNews ?? true,
    notifyContracts: state.users[tgId]?.notifyContracts ?? false,
  };
  saveState(state);

  await ctx.reply(`✅ Профиль привязан: <b>${member.name}</b>`, {
    parse_mode: "HTML",
    reply_markup: mainMenu(ADMIN_IDS.includes(ctx.from.id)),
  });
});

// Profile
bot.callbackQuery("cmd_profile", async (ctx) => {
  await ctx.answerCallbackQuery();
  const tgId = String(ctx.from.id);
  const state = readState();
  const user = state.users[tgId];

  if (!user?.memberId) {
    return ctx.reply(
      "⚠️ Профиль не привязан.\nИспользуй: /link &lt;никнейм&gt;",
      { parse_mode: "HTML" }
    );
  }

  const snapshot = await apiGet("/admin/snapshot");
  const member = snapshot?.members?.find((m) => m.id === user.memberId);
  if (!member) {
    return ctx.reply(
      "❌ Участник не найден (возможно удалён из состава).\nПривяжи профиль заново через /link"
    );
  }

  await ctx.reply(fmtMember(member), { parse_mode: "HTML" });
});

// News
bot.callbackQuery("cmd_news", async (ctx) => {
  await ctx.answerCallbackQuery();
  const snapshot = await apiGet("/admin/snapshot");
  const anns = snapshot?.announcements;

  if (!anns?.length) return ctx.reply("📭 Объявлений пока нет.");

  await ctx.reply("📰 <b>Последние новости семьи:</b>", { parse_mode: "HTML" });
  for (const a of anns.slice(0, 3)) {
    await ctx.reply(fmtAnn(a), { parse_mode: "HTML" });
  }
});

// Contracts
bot.callbackQuery("cmd_contracts", async (ctx) => {
  await ctx.answerCallbackQuery();
  const contracts = await apiGet("/contracts");

  if (!contracts?.length) return ctx.reply("📭 Контрактов пока нет.");

  const available = contracts.filter((c) => c.available);
  if (!available.length) {
    return ctx.reply("🔴 Свободных контрактов нет.\nВсе контракты заняты.");
  }

  await ctx.reply(
    `📄 <b>Доступные контракты (${available.length}):</b>`,
    { parse_mode: "HTML" }
  );
  for (const c of available.slice(0, 5)) {
    await ctx.reply(fmtContract(c), { parse_mode: "HTML" });
  }
});

// Notifications settings
bot.callbackQuery("cmd_notify", async (ctx) => {
  await ctx.answerCallbackQuery();
  const tgId = String(ctx.from.id);
  const state = readState();
  const user = state.users[tgId] || {};

  const kb = new InlineKeyboard()
    .text(
      `${user.notifyNews !== false ? "🔔" : "🔕"} Новости семьи`,
      "toggle_news"
    )
    .row()
    .text(
      `${user.notifyContracts ? "🔔" : "🔕"} Новые контракты`,
      "toggle_contracts"
    );

  await ctx.reply(
    "⚙️ <b>Настройки уведомлений</b>\n\nНажми чтобы включить/выключить:",
    { parse_mode: "HTML", reply_markup: kb }
  );
});

bot.callbackQuery("toggle_news", async (ctx) => {
  await ctx.answerCallbackQuery();
  const tgId = String(ctx.from.id);
  const state = readState();
  if (!state.users[tgId]) state.users[tgId] = {};
  state.users[tgId].notifyNews = !(state.users[tgId].notifyNews !== false);
  saveState(state);
  const on = state.users[tgId].notifyNews;
  await ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard()
      .text(`${on ? "🔔" : "🔕"} Новости семьи`, "toggle_news")
      .row()
      .text(
        `${state.users[tgId].notifyContracts ? "🔔" : "🔕"} Новые контракты`,
        "toggle_contracts"
      ),
  });
  await ctx.answerCallbackQuery(on ? "🔔 Новости включены" : "🔕 Новости выключены");
});

bot.callbackQuery("toggle_contracts", async (ctx) => {
  await ctx.answerCallbackQuery();
  const tgId = String(ctx.from.id);
  const state = readState();
  if (!state.users[tgId]) state.users[tgId] = {};
  state.users[tgId].notifyContracts = !state.users[tgId].notifyContracts;
  saveState(state);
  const on = state.users[tgId].notifyContracts;
  await ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard()
      .text(
        `${state.users[tgId].notifyNews !== false ? "🔔" : "🔕"} Новости семьи`,
        "toggle_news"
      )
      .row()
      .text(`${on ? "🔔" : "🔕"} Новые контракты`, "toggle_contracts"),
  });
  await ctx.answerCallbackQuery(on ? "🔔 Контракты включены" : "🔕 Контракты выключены");
});

// Pending applications (admin only)
bot.callbackQuery("cmd_pending", async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply("⛔ Нет доступа.");
  }

  const apps = await apiGet("/applications");
  const pending = (apps || []).filter((a) => a.status === "pending");

  if (!pending.length) return ctx.reply("✅ Новых заявок нет.");

  await ctx.reply(`📋 <b>Ожидают рассмотрения: ${pending.length}</b>`, {
    parse_mode: "HTML",
  });

  for (const app of pending.slice(0, 5)) {
    await ctx.reply(fmtApp(app), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("✅ Принять", `accept_${app.id}`)
        .text("❌ Отклонить", `reject_${app.id}`),
    });
  }

  if (pending.length > 5) {
    await ctx.reply(`<i>...и ещё ${pending.length - 5} заявок. Открой сайт чтобы посмотреть все.</i>`, {
      parse_mode: "HTML",
    });
  }
});

// Accept application
bot.callbackQuery(/^accept_(.+)$/, async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.answerCallbackQuery("⛔ Нет доступа");
  }
  const id = ctx.match[1];
  await apiPatch(`/applications/${id}`, {
    status: "accepted",
    reviewedAt: new Date().toISOString(),
    reviewedBy: ctx.from.username
      ? `@${ctx.from.username}`
      : String(ctx.from.id),
  });
  await ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard().text("✅ Принято", "noop"),
  });
  await ctx.answerCallbackQuery("✅ Заявка принята");
});

// Reject application
bot.callbackQuery(/^reject_(.+)$/, async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.answerCallbackQuery("⛔ Нет доступа");
  }
  const id = ctx.match[1];
  await apiPatch(`/applications/${id}`, {
    status: "rejected",
    reviewedAt: new Date().toISOString(),
    reviewedBy: ctx.from.username
      ? `@${ctx.from.username}`
      : String(ctx.from.id),
  });
  await ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard().text("❌ Отклонено", "noop"),
  });
  await ctx.answerCallbackQuery("❌ Заявка отклонена");
});

bot.callbackQuery("noop", (ctx) => ctx.answerCallbackQuery());

/* ── Polling — push notifications ────────────────────── */
async function notifyAdmins(text, keyboard) {
  for (const id of ADMIN_IDS) {
    try {
      await bot.api.sendMessage(id, text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } catch (e) {
      console.error(`[bot] Failed to notify admin ${id}:`, e.message);
    }
  }
}

async function checkApplications() {
  const apps = await apiGet("/applications");
  if (!Array.isArray(apps) || apps.length === 0) return;

  const state = readState();
  const newest = apps[0];
  if (state.lastAppId === newest.id) return;

  const lastIdx = apps.findIndex((a) => a.id === state.lastAppId);
  const fresh =
    lastIdx === -1
      ? apps.filter((a) => a.status === "pending")
      : apps.slice(0, lastIdx).filter((a) => a.status === "pending");

  for (const app of fresh) {
    await notifyAdmins(
      fmtApp(app),
      new InlineKeyboard()
        .text("✅ Принять", `accept_${app.id}`)
        .text("❌ Отклонить", `reject_${app.id}`)
    );
  }

  state.lastAppId = newest.id;
  saveState(state);
}

async function checkAnnouncements() {
  const snapshot = await apiGet("/admin/snapshot");
  const anns = snapshot?.announcements;
  if (!Array.isArray(anns) || anns.length === 0) return;

  const state = readState();
  const newest = anns[0];
  if (state.lastAnnId === newest.id) return;

  const lastIdx = anns.findIndex((a) => a.id === state.lastAnnId);
  const fresh = lastIdx === -1 ? [newest] : anns.slice(0, lastIdx);

  for (const ann of fresh) {
    const text = `📢 <b>Новости семьи</b>\n\n${fmtAnn(ann)}`;
    // notify subscribed users
    for (const [tgId, user] of Object.entries(state.users)) {
      if (user.notifyNews !== false) {
        try {
          await bot.api.sendMessage(tgId, text, { parse_mode: "HTML" });
        } catch {}
      }
    }
    // always notify admins
    await notifyAdmins(text, undefined);
  }

  state.lastAnnId = newest.id;
  saveState(state);
}

async function checkContracts() {
  const contracts = await apiGet("/contracts");
  if (!Array.isArray(contracts) || contracts.length === 0) return;

  const state = readState();
  const newest = contracts[0];
  if (!newest || state.lastContractId === newest.id) return;

  const lastIdx = contracts.findIndex((c) => c.id === state.lastContractId);
  const fresh =
    lastIdx === -1 ? [newest] : contracts.slice(0, lastIdx);

  for (const c of fresh) {
    const text = `📄 <b>Новый контракт</b>\n\n${fmtContract(c)}`;
    for (const [tgId, user] of Object.entries(state.users)) {
      if (user.notifyContracts) {
        try {
          await bot.api.sendMessage(tgId, text, { parse_mode: "HTML" });
        } catch {}
      }
    }
  }

  state.lastContractId = newest.id;
  saveState(state);
}

async function poll() {
  try {
    await checkApplications();
    await checkAnnouncements();
    await checkContracts();
  } catch (e) {
    console.error("[bot] poll error:", e.message);
  }
}

/* ── Start ───────────────────────────────────────────── */
console.log("[bot] Starting Schwarz Family Bot...");
if (ADMIN_IDS.length) {
  console.log(`[bot] Admin IDs: ${ADMIN_IDS.join(", ")}`);
} else {
  console.warn("[bot] TG_ADMIN_IDS not set — admin notifications disabled");
}

bot.start({ onStart: () => console.log("[bot] Bot is running") });

// Initial poll + every 60s
poll();
setInterval(poll, 60_000);

import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");

const app = express();
// Support PORT (Glitch/Render/Railway) and API_PORT (local dev)
const PORT = Number(process.env.PORT || process.env.API_PORT || 8790);
const DATA_DIR = path.resolve(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

/* ── Password helpers ── */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = crypto.scryptSync(password, salt, 64);
  return `${salt}:${buf.toString("hex")}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(":");
    const buf = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(buf, Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

function safeAccount(account) {
  const { passwordHash: _, ...safe } = account;
  return safe;
}

const defaultDb = {
  adminSnapshot: {
    navItems: [],
    announcements: [],
    customPages: [],
    pageOverrides: [],
    members: [],
    leaderships: [],
    rules: [],
    principles: [],
    newsArticles: [],
    moments: [],
  },
  applications: [],
  contracts: [],
  polls: [],
  pollVoters: {},
  staffAccounts: [],
  adminStaff: [],
  cabinetAccounts: [],
  roleTemplates: [],
  adminNotifications: [],
  achievementDefs: [],
  userAchievements: [],
  birthdays: [],
  birthdayNotifConfig: null,
  goals: [],
  treasury: [],
  reports: [],
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDb, null, 2), "utf8");
  }
}

function readDb() {
  ensureDb();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return { ...defaultDb, ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultDb);
  }
}

function writeDb(nextDb) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(nextDb, null, 2), "utf8");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/admin/snapshot", (_req, res) => {
  const db = readDb();
  res.json(db.adminSnapshot);
});

app.put("/api/admin/snapshot", (req, res) => {
  const db = readDb();
  db.adminSnapshot = {
    ...db.adminSnapshot,
    ...(req.body || {}),
  };
  writeDb(db);
  res.json({ ok: true, adminSnapshot: db.adminSnapshot });
});

/* ─── Admin staff (login credentials, stored server-side) ─── */
app.get("/api/admin/staff", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.adminStaff) ? db.adminStaff : []);
});

app.put("/api/admin/staff", (req, res) => {
  const db = readDb();
  db.adminStaff = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.adminStaff.length });
});

app.get("/api/applications", (_req, res) => {
  const db = readDb();
  res.json(db.applications);
});

app.put("/api/applications", (req, res) => {
  const db = readDb();
  db.applications = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.applications.length });
});

app.post("/api/applications", (req, res) => {
  const db = readDb();
  const payload = req.body || {};
  db.applications = [payload, ...db.applications];
  writeDb(db);
  res.status(201).json({ ok: true });
});

app.patch("/api/applications/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.applications = db.applications.map((item) =>
    item.id === id ? { ...item, ...(req.body || {}) } : item,
  );
  writeDb(db);
  res.json({ ok: true });
});

app.delete("/api/applications/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.applications = db.applications.filter((item) => item.id !== id);
  writeDb(db);
  res.json({ ok: true });
});

app.get("/api/polls", (_req, res) => {
  const db = readDb();
  res.json(db.polls);
});

app.put("/api/polls", (req, res) => {
  const db = readDb();
  db.polls = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.polls.length });
});

app.post("/api/polls/vote", (req, res) => {
  const db = readDb();
  const { pollId, optionId, voterId } = req.body || {};

  if (!pollId || !optionId || !voterId) {
    return res.status(400).json({ ok: false, message: "pollId, optionId, voterId are required" });
  }

  const voted = new Set(db.pollVoters[pollId] || []);
  if (voted.has(voterId)) {
    return res.status(409).json({ ok: false, message: "already voted" });
  }

  voted.add(voterId);
  db.pollVoters[pollId] = Array.from(voted);
  db.polls = db.polls.map((poll) => {
    if (poll.id !== pollId) return poll;
    return {
      ...poll,
      options: (poll.options || []).map((option) =>
        option.id === optionId ? { ...option, votes: Number(option.votes || 0) + 1 } : option,
      ),
    };
  });

  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   CONTRACTS
───────────────────────────────────────── */

app.get("/api/contracts", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.contracts) ? db.contracts : []);
});

app.post("/api/contracts", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.contracts)) db.contracts = [];
  const contract = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: req.body?.title || "Контракт",
    description: req.body?.description || "",
    reward: req.body?.reward || "",
    available: req.body?.available !== false,
    createdAt: new Date().toISOString(),
  };
  db.contracts.unshift(contract);
  writeDb(db);
  res.status(201).json({ ok: true, contract });
});

app.patch("/api/contracts/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.contracts)) return res.status(404).json({ ok: false });
  db.contracts = db.contracts.map((c) =>
    c.id === req.params.id ? { ...c, ...(req.body || {}) } : c
  );
  writeDb(db);
  res.json({ ok: true });
});

app.delete("/api/contracts/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.contracts)) return res.status(404).json({ ok: false });
  db.contracts = db.contracts.filter((c) => c.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   NEWS ARTICLES
───────────────────────────────────────── */

app.get("/api/news", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.adminSnapshot?.newsArticles) ? db.adminSnapshot.newsArticles : []);
});

app.put("/api/news", (req, res) => {
  const db = readDb();
  if (!db.adminSnapshot) db.adminSnapshot = {};
  db.adminSnapshot.newsArticles = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.adminSnapshot.newsArticles.length });
});

app.post("/api/news", (req, res) => {
  const db = readDb();
  if (!db.adminSnapshot) db.adminSnapshot = {};
  if (!Array.isArray(db.adminSnapshot.newsArticles)) db.adminSnapshot.newsArticles = [];
  const article = {
    id: `news_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.adminSnapshot.newsArticles.unshift(article);
  writeDb(db);
  res.status(201).json({ ok: true, article });
});

app.patch("/api/news/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.adminSnapshot?.newsArticles)) return res.status(404).json({ ok: false });
  db.adminSnapshot.newsArticles = db.adminSnapshot.newsArticles.map((a) =>
    a.id === req.params.id ? { ...a, ...(req.body || {}) } : a
  );
  writeDb(db);
  res.json({ ok: true });
});

app.delete("/api/news/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.adminSnapshot?.newsArticles)) return res.status(404).json({ ok: false });
  db.adminSnapshot.newsArticles = db.adminSnapshot.newsArticles.filter((a) => a.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   MOMENTS
───────────────────────────────────────── */

app.get("/api/moments", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.adminSnapshot?.moments) ? db.adminSnapshot.moments : []);
});

app.put("/api/moments", (req, res) => {
  const db = readDb();
  if (!db.adminSnapshot) db.adminSnapshot = {};
  db.adminSnapshot.moments = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.adminSnapshot.moments.length });
});

app.post("/api/moments", (req, res) => {
  const db = readDb();
  if (!db.adminSnapshot) db.adminSnapshot = {};
  if (!Array.isArray(db.adminSnapshot.moments)) db.adminSnapshot.moments = [];
  const moment = {
    id: `moment_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.adminSnapshot.moments.unshift(moment);
  writeDb(db);
  res.status(201).json({ ok: true, moment });
});

app.patch("/api/moments/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.adminSnapshot?.moments)) return res.status(404).json({ ok: false });
  db.adminSnapshot.moments = db.adminSnapshot.moments.map((m) =>
    m.id === req.params.id ? { ...m, ...(req.body || {}) } : m
  );
  writeDb(db);
  res.json({ ok: true });
});

app.delete("/api/moments/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.adminSnapshot?.moments)) return res.status(404).json({ ok: false });
  db.adminSnapshot.moments = db.adminSnapshot.moments.filter((m) => m.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   AUTH — staff accounts
───────────────────────────────────────── */

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.json({ ok: false, message: "username and password required" });
  }
  const db = readDb();
  const accounts = Array.isArray(db.staffAccounts) ? db.staffAccounts : [];
  const account = accounts.find((a) => a.username === username && a.active !== false);
  if (!account) {
    console.log(`[auth] login failed: username "${username}" not found (total accounts: ${accounts.length})`);
    return res.json({ ok: false, message: "Неверный логин или пароль" });
  }
  if (!verifyPassword(password, account.passwordHash)) {
    console.log(`[auth] login failed: wrong password for "${username}"`);
    return res.json({ ok: false, message: "Неверный логин или пароль" });
  }
  console.log(`[auth] login success: "${username}"`);
  res.json({ ok: true, account: safeAccount(account) });
});

app.get("/api/auth/accounts", (_req, res) => {
  const db = readDb();
  const accounts = Array.isArray(db.staffAccounts) ? db.staffAccounts : [];
  res.json(accounts.map(safeAccount));
});

app.post("/api/auth/accounts", (req, res) => {
  const { username, password, displayName, position, permissions } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "username and password required" });
  }
  const db = readDb();
  if (!Array.isArray(db.staffAccounts)) db.staffAccounts = [];
  if (db.staffAccounts.some((a) => a.username === username)) {
    return res.status(409).json({ ok: false, message: "Логин уже занят" });
  }
  console.log(`[auth] creating account: "${username}"`);
  const newAccount = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    username,
    passwordHash: hashPassword(password),
    displayName: displayName || username,
    position: position || "Администратор",
    permissions: Array.isArray(permissions) ? permissions : ["view_admin"],
    isRoot: false,
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.staffAccounts.push(newAccount);
  writeDb(db);
  res.status(201).json({ ok: true, account: safeAccount(newAccount) });
});

app.patch("/api/auth/accounts/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  if (!Array.isArray(db.staffAccounts)) {
    return res.status(404).json({ ok: false });
  }
  const idx = db.staffAccounts.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, message: "Аккаунт не найден" });

  const account = { ...db.staffAccounts[idx] };
  const { password, displayName, position, permissions, active } = req.body || {};
  if (displayName !== undefined) account.displayName = displayName;
  if (position !== undefined) account.position = position;
  if (Array.isArray(permissions)) account.permissions = permissions;
  if (active !== undefined && !account.isRoot) account.active = Boolean(active);
  if (password) account.passwordHash = hashPassword(password);

  db.staffAccounts[idx] = account;
  writeDb(db);
  res.json({ ok: true, account: safeAccount(account) });
});

app.delete("/api/auth/accounts/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  if (!Array.isArray(db.staffAccounts)) return res.status(404).json({ ok: false });
  const account = db.staffAccounts.find((a) => a.id === id);
  if (!account) return res.status(404).json({ ok: false, message: "Аккаунт не найден" });
  if (account.isRoot) return res.status(403).json({ ok: false, message: "Нельзя удалить root" });
  db.staffAccounts = db.staffAccounts.filter((a) => a.id !== id);
  writeDb(db);
  res.json({ ok: true });
});

app.post("/api/webhooks/discord", async (req, res) => {
  const payload = req.body || {};

  const db = readDb();
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || "";

  if (!webhookUrl) {
    return res.status(202).json({ ok: true, forwarded: false, reason: "DISCORD_WEBHOOK_URL is not set", payload });
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Schwarz Family",
        avatar_url: "https://i.imgur.com/AfFp7pu.png",
        embeds: [
          {
            ...payload,
            footer: payload.footer || { text: "Schwarz Family API" },
            timestamp: payload.timestamp || new Date().toISOString(),
          },
        ],
      }),
    });

    db.lastWebhookAt = new Date().toISOString();
    writeDb(db);
    res.status(201).json({ ok: true, forwarded: true });
  } catch {
    res.status(502).json({ ok: false, forwarded: false });
  }
});

/* ── Twitch live status (public GQL — no API key needed) ── */
const TWITCH_CHANNEL = "nebesnyin";
let twitchCache = { ts: 0, data: null };
const TWITCH_TTL = 60_000; // 1 minute cache

app.get("/api/twitch/status", async (_req, res) => {
  if (Date.now() - twitchCache.ts < TWITCH_TTL && twitchCache.data) {
    return res.json(twitchCache.data);
  }
  try {
    const r = await fetch("https://gql.twitch.tv/gql", {
      method: "POST",
      headers: {
        "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        operationName: "StreamMetadata",
        variables: { channelLogin: TWITCH_CHANNEL },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: "a647c2a13599e5991e175155f798ca7f1ecddde73f7f341f39009c14dbf59aa8",
          },
        },
      }]),
    });
    const j = await r.json();
    const stream = j?.[0]?.data?.user?.stream;
    const data = stream
      ? { live: true, viewerCount: stream.viewersCount ?? 0, title: stream.title ?? "", gameName: stream.game?.name ?? "" }
      : { live: false, viewerCount: 0, title: "", gameName: "" };
    twitchCache = { ts: Date.now(), data };
    return res.json(data);
  } catch (err) {
    console.error("[twitch]", err.message);
    return res.json({ live: false, viewerCount: 0, title: "", gameName: "" });
  }
});

const DEFAULT_MEMBERS = [
  { id: "1", name: "Madara Schwarz", role: "owner", joinDate: "2024-01-01", active: true, badges: ["streamer", "fib", "leader"] },
  { id: "2", name: "Akihiro Schwarz", role: "dep_owner", joinDate: "2024-02-15", active: true, badges: ["fib", "leader"] },
  { id: "3", name: "Roman Schwarz", role: "dep_owner", joinDate: "2024-03-10", active: true, badges: ["fib", "leader"] },
  { id: "4", name: "Kerro Schwarz", role: "veteran", joinDate: "2024-04-01", active: true },
  { id: "5", name: "Turbo Schwarz", role: "veteran", joinDate: "2024-04-15", active: true },
  { id: "6", name: "Ilia Schwarz", role: "veteran", joinDate: "2024-05-01", active: true },
  { id: "7", name: "Jay Schwarz", role: "veteran", joinDate: "2024-05-20", active: true },
  { id: "8", name: "Anti Schwarz", role: "veteran", joinDate: "2024-06-01", active: true },
  { id: "9", name: "Richie Schwarz", role: "veteran", joinDate: "2024-06-15", active: true },
  { id: "10", name: "Voldemar Schwarz", role: "veteran", joinDate: "2024-07-01", active: true },
  { id: "11", name: "Brooklyn Schwarz", role: "member", joinDate: "2024-08-01", active: true },
  { id: "12", name: "Marka Schwarz", role: "member", joinDate: "2024-08-15", active: true },
  { id: "13", name: "Krasty Schwarz", role: "member", joinDate: "2024-09-01", active: true },
  { id: "14", name: "Patrick Schwarz", role: "member", joinDate: "2024-09-15", active: true },
];

const DEFAULT_NAV_ITEMS = [
  { id: "home", label: "Главная", path: "/", visible: true },
  { id: "about", label: "О нас", path: "/about", visible: true },
  { id: "history", label: "История", path: "/history", visible: true },
  { id: "current-leadership", label: "Текущая лидерка", path: "/current-leadership", visible: true },
  { id: "media", label: "Медиа", path: "/media", visible: true },
  { id: "members", label: "Состав", path: "/members", visible: true },
  { id: "redux", label: "Редукс", path: "/redux", visible: true },
  { id: "rules", label: "Правила", path: "/rules", visible: true },
  { id: "how-to-play", label: "Как играть?", path: "/how-to-play", visible: true },
  { id: "contacts", label: "Контакты", path: "/contacts", visible: true },
];

/* ─────────────────────────────────────────
   TELEGRAM BOT
───────────────────────────────────────── */

async function tgApi(token, method, params = {}) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return r.json();
}

async function tgSend(token, chatId, text) {
  return tgApi(token, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });
}

function getTgData(db) {
  if (!db.tgBot) db.tgBot = {};
  if (!db.tgBot.config) db.tgBot.config = { token: "", botUsername: "", enabled: false, webhookUrl: "", secretToken: "" };
  if (!Array.isArray(db.tgBot.commands)) db.tgBot.commands = [];
  if (!Array.isArray(db.tgBot.admins)) db.tgBot.admins = [];
  if (!Array.isArray(db.tgBot.links)) db.tgBot.links = [];
  if (!db.tgBot.memberStatus) db.tgBot.memberStatus = {};
  return db.tgBot;
}

app.get("/api/telegram/config", (_req, res) => {
  const db = readDb();
  res.json(getTgData(db).config);
});

app.put("/api/telegram/config", (req, res) => {
  const db = readDb();
  const tg = getTgData(db);
  tg.config = { ...tg.config, ...(req.body || {}) };
  writeDb(db);
  res.json({ ok: true });
});

app.get("/api/telegram/commands", (_req, res) => {
  const db = readDb();
  res.json(getTgData(db).commands);
});

app.put("/api/telegram/commands", (req, res) => {
  const db = readDb();
  getTgData(db).commands = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});

app.get("/api/telegram/admins", (_req, res) => {
  const db = readDb();
  res.json(getTgData(db).admins);
});

app.put("/api/telegram/admins", (req, res) => {
  const db = readDb();
  getTgData(db).admins = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});

app.get("/api/telegram/links", (_req, res) => {
  const db = readDb();
  res.json(getTgData(db).links);
});

app.put("/api/telegram/links", (req, res) => {
  const db = readDb();
  getTgData(db).links = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});

/* Check bot token */
app.get("/api/telegram/bot-info", async (_req, res) => {
  const db = readDb();
  const { token } = getTgData(db).config;
  if (!token) return res.json({ ok: false, message: "Токен не задан" });
  try {
    const result = await tgApi(token, "getMe");
    res.json(result);
  } catch {
    res.json({ ok: false, message: "Запрос к Telegram API не удался" });
  }
});

/* Register webhook with Telegram */
app.post("/api/telegram/register-webhook", async (req, res) => {
  const db = readDb();
  const tg = getTgData(db);
  if (!tg.config.token) return res.json({ ok: false, message: "Токен не задан" });
  const webhookUrl = (req.body?.url || tg.config.webhookUrl || "").trim();
  if (!webhookUrl) return res.json({ ok: false, message: "Webhook URL не задан" });
  try {
    const params = { url: webhookUrl };
    const secret = (req.body?.secretToken || tg.config.secretToken || "").trim();
    if (secret) params.secret_token = secret;
    const result = await tgApi(tg.config.token, "setWebhook", params);
    if (result.ok) {
      tg.config.webhookUrl = webhookUrl;
      writeDb(db);
      console.log(`[telegram] webhook registered: ${webhookUrl}`);
    }
    res.json(result);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

/* Send message (admin broadcast) */
app.post("/api/telegram/send", async (req, res) => {
  const db = readDb();
  const { token } = getTgData(db).config;
  if (!token) return res.status(400).json({ ok: false, message: "Токен не задан" });
  const { chatId, text, chatIds } = req.body || {};
  if (!text) return res.status(400).json({ ok: false, message: "text required" });
  try {
    if (Array.isArray(chatIds) && chatIds.length > 0) {
      const results = await Promise.allSettled(chatIds.map((id) => tgSend(token, id, text)));
      const sent = results.filter((r) => r.status === "fulfilled").length;
      res.json({ ok: true, sent, total: chatIds.length });
    } else if (chatId) {
      res.json(await tgSend(token, chatId, text));
    } else {
      res.status(400).json({ ok: false, message: "chatId или chatIds обязателен" });
    }
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

/* Telegram webhook — receives updates from Telegram */
app.post("/api/telegram/webhook", async (req, res) => {
  res.json({ ok: true }); // Always acknowledge immediately

  const db = readDb();
  const tg = getTgData(db);

  // Validate secret token if configured
  if (tg.config.secretToken) {
    const incoming = req.headers["x-telegram-bot-api-secret-token"];
    if (incoming !== tg.config.secretToken) {
      console.log("[telegram] webhook: invalid secret token, ignoring");
      return;
    }
  }

  if (!tg.config.token || !tg.config.enabled) return;

  const message = req.body?.message;
  if (!message?.text) return;

  const chatId = message.chat.id;
  const fromId = String(message.from?.id ?? "");
  const text = message.text.trim();
  const fromUsername = message.from?.username ?? "";

  if (!text.startsWith("/")) return;

  const [rawCmd, ...args] = text.split(/\s+/);
  const cmd = rawCmd.replace(/@\w+$/, "").toLowerCase();

  // Re-read db for fresh data
  const freshDb = readDb();
  const freshTg = getTgData(freshDb);
  const link = freshTg.links.find((l) => l.telegramId && String(l.telegramId) === fromId);
  const members = freshDb.adminSnapshot?.members ?? [];
  const member = link ? members.find((m) => m.id === link.memberId) : null;

  const ROLE_LABELS = {
    owner: "Owner", dep_owner: "Dep.Owner", close: "Close",
    old: "Old", main: "Main", academy: "Academy", veteran: "Ветеран", member: "Участник",
  };

  const send = (txt) => tgSend(freshTg.config.token, chatId, txt)
    .catch((e) => console.error("[telegram] send error:", e.message));

  try {
    if (cmd === "/start" || cmd === "/старт") {
      if (member) {
        await send(`👋 <b>С возвращением, ${member.name}!</b>\nРоль: <b>${ROLE_LABELS[member.role] ?? member.role}</b>\n\nИспользуйте /помощь для списка команд.`);
      } else {
        await send(`👋 <b>Добро пожаловать в Schwarz Family Bot!</b>\n\nДля привязки вашего Telegram к профилю обратитесь к администратору семьи.\n\nВаш Telegram ID: <code>${fromId}</code>${fromUsername ? `\nUsername: @${fromUsername}` : ""}`);
      }
    } else if (cmd === "/помощь" || cmd === "/help") {
      const list = freshTg.commands.filter((c) => c.enabled).map((c) => `${c.command} — ${c.description}`).join("\n");
      await send(`📋 <b>Доступные команды:</b>\n\n${list || "Нет активных команд"}`);
    } else if (cmd === "/профиль") {
      if (!member) { await send("❌ Ваш Telegram не привязан к профилю.\nОбратитесь к администратору."); return; }
      const contractsDone = (freshDb.contracts ?? []).filter((c) => !c.available && c.closedBy === link.memberId).length;
      await send(`👤 <b>${member.name}</b>\nРоль: <b>${ROLE_LABELS[member.role] ?? member.role}</b>\nВ семье с: ${member.joinDate}\nВыполнено контрактов: <b>${contractsDone}</b>${member.badges?.length ? `\nЗначки: ${member.badges.join(", ")}` : ""}`);
    } else if (cmd === "/казна") {
      const c = freshDb.contracts ?? [];
      await send(`💰 <b>Казна Schwarz Family</b>\n\nОткрытых контрактов: <b>${c.filter((x) => x.available).length}</b>\nЗакрытых: <b>${c.filter((x) => !x.available).length}</b>`);
    } else if (cmd === "/контракты") {
      const open = (freshDb.contracts ?? []).filter((c) => c.available);
      if (!open.length) { await send("📋 Нет открытых контрактов."); return; }
      const list = open.slice(0, 10).map((c) => `• <b>${c.title}</b>${c.reward ? ` — ${c.reward}` : ""}`).join("\n");
      await send(`📋 <b>Открытые контракты (${open.length}):</b>\n\n${list}`);
    } else if (cmd === "/топ") {
      const order = { owner: 0, dep_owner: 1, close: 2, old: 3, main: 4, academy: 5, veteran: 6, member: 7 };
      const top = [...members].filter((m) => m.active)
        .sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9)).slice(0, 10);
      const list = top.map((m, i) => `${i + 1}. ${m.name} — ${ROLE_LABELS[m.role] ?? m.role}`).join("\n");
      await send(`🏆 <b>Schwarz Family:</b>\n\n${list}`);
    } else if (cmd === "/объявления") {
      const ann = freshDb.adminSnapshot?.announcements ?? [];
      if (!ann.length) { await send("📢 Объявлений нет."); return; }
      const list = ann.slice(0, 3).map((a) => `📌 <b>${a.title ?? "Объявление"}</b>\n${(a.text ?? a.content ?? "").slice(0, 200)}`).join("\n\n");
      await send(`📢 <b>Последние объявления:</b>\n\n${list}`);
    } else if (cmd === "/статус") {
      const target = args.join(" ");
      const who = target ? members.find((m) => m.name.toLowerCase().includes(target.toLowerCase())) : member;
      if (!who) { await send("❌ Участник не найден."); return; }
      const s = freshTg.memberStatus[who.id] ?? { status: "offline" };
      const emoji = s.status === "online" ? "🟢" : s.status === "busy" ? "🟡" : "⚫";
      await send(`${emoji} <b>${who.name}</b>: ${s.status === "online" ? "Онлайн" : s.status === "busy" ? "Занят" : "Офлайн"}`);
    } else if (cmd === "/онлайн") {
      if (!member) { await send("❌ Ваш Telegram не привязан к профилю."); return; }
      freshTg.memberStatus[link.memberId] = { status: "online", since: new Date().toISOString() };
      writeDb(freshDb);
      await send(`🟢 <b>${member.name}</b> теперь онлайн!`);
    } else if (cmd === "/офлайн") {
      if (!member) { await send("❌ Ваш Telegram не привязан к профилю."); return; }
      freshTg.memberStatus[link.memberId] = { status: "offline", since: new Date().toISOString() };
      writeDb(freshDb);
      await send(`⚫ <b>${member.name}</b> теперь офлайн.`);
    } else if (cmd === "/занят") {
      if (!member) { await send("❌ Ваш Telegram не привязан к профилю."); return; }
      const mins = Math.max(1, Math.min(480, parseInt(args[0] ?? "30") || 30));
      freshTg.memberStatus[link.memberId] = {
        status: "busy", since: new Date().toISOString(),
        busyUntil: new Date(Date.now() + mins * 60_000).toISOString(),
      };
      writeDb(freshDb);
      await send(`🟡 <b>${member.name}</b> занят на ${mins} мин.`);
    } else {
      await send("❓ Неизвестная команда. /помощь — список доступных команд.");
    }
  } catch (err) {
    console.error("[telegram] command handler error:", err.message);
  }
});

/* ─────────────────────────────────────────
   VEHICLES
───────────────────────────────────────── */

app.get("/api/vehicles", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.vehicles) ? db.vehicles : []);
});
app.put("/api/vehicles", (req, res) => {
  const db = readDb();
  db.vehicles = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   UPGRADES
───────────────────────────────────────── */

app.get("/api/upgrades", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.upgrades) ? db.upgrades : []);
});
app.put("/api/upgrades", (req, res) => {
  const db = readDb();
  db.upgrades = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   INFRASTRUCTURE
───────────────────────────────────────── */

app.get("/api/infrastructure", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.infrastructure) ? db.infrastructure : []);
});
app.put("/api/infrastructure", (req, res) => {
  const db = readDb();
  db.infrastructure = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   CONTRACTS (bulk replace for useCabinetData hook)
───────────────────────────────────────── */

app.put("/api/contracts", (req, res) => {
  const db = readDb();
  db.contracts = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   DISCORD WEBHOOK SETTINGS
───────────────────────────────────────── */

app.get("/api/webhooks/config", (_req, res) => {
  const db = readDb();
  res.json(db.webhookConfig ?? { url: "", enabled: false, username: "Schwarz Family", avatarUrl: "" });
});
app.put("/api/webhooks/config", (req, res) => {
  const db = readDb();
  db.webhookConfig = req.body;
  writeDb(db);
  res.json({ ok: true });
});

app.get("/api/webhooks/events", (_req, res) => {
  const db = readDb();
  res.json(db.webhookEvents ?? {});
});
app.put("/api/webhooks/events", (req, res) => {
  const db = readDb();
  db.webhookEvents = req.body;
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   BIRTHDAYS
───────────────────────────────────────── */

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// notif-config MUST come before /:id to avoid Express matching "notif-config" as an id
app.get("/api/birthdays/notif-config", (_req, res) => {
  const db = readDb();
  res.json(db.birthdayNotifConfig ?? null);
});
app.put("/api/birthdays/notif-config", (req, res) => {
  const db = readDb();
  db.birthdayNotifConfig = req.body;
  writeDb(db);
  res.json({ ok: true });
});

app.get("/api/birthdays", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.birthdays) ? db.birthdays : []);
});
app.put("/api/birthdays", (req, res) => {
  const db = readDb();
  db.birthdays = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});
app.post("/api/birthdays", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.birthdays)) db.birthdays = [];
  const entry = { id: genId(), createdAt: new Date().toISOString(), ...req.body };
  db.birthdays.push(entry);
  writeDb(db);
  res.status(201).json({ ok: true, entry });
});
app.patch("/api/birthdays/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.birthdays)) return res.status(404).json({ ok: false });
  db.birthdays = db.birthdays.map((e) => e.id === req.params.id ? { ...e, ...(req.body || {}) } : e);
  writeDb(db);
  res.json({ ok: true });
});
app.delete("/api/birthdays/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.birthdays)) return res.status(404).json({ ok: false });
  db.birthdays = db.birthdays.filter((e) => e.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   FAMILY GOALS
───────────────────────────────────────── */

app.get("/api/goals", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.goals) ? db.goals : []);
});
app.put("/api/goals", (req, res) => {
  const db = readDb();
  db.goals = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});
app.post("/api/goals", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.goals)) db.goals = [];
  const goal = { id: genId(), createdAt: new Date().toISOString(), ...req.body };
  db.goals.unshift(goal);
  writeDb(db);
  res.status(201).json({ ok: true, goal });
});
app.patch("/api/goals/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.goals)) return res.status(404).json({ ok: false });
  db.goals = db.goals.map((g) => g.id === req.params.id ? { ...g, ...(req.body || {}) } : g);
  writeDb(db);
  res.json({ ok: true });
});
app.delete("/api/goals/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.goals)) return res.status(404).json({ ok: false });
  db.goals = db.goals.filter((g) => g.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   TREASURY
───────────────────────────────────────── */

app.get("/api/treasury", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.treasury) ? db.treasury : []);
});
app.put("/api/treasury", (req, res) => {
  const db = readDb();
  db.treasury = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});
app.post("/api/treasury", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.treasury)) db.treasury = [];
  const tx = { id: genId(), createdAt: new Date().toISOString(), ...req.body };
  db.treasury.unshift(tx);
  writeDb(db);
  res.status(201).json({ ok: true, tx });
});
app.delete("/api/treasury/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.treasury)) return res.status(404).json({ ok: false });
  db.treasury = db.treasury.filter((t) => t.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   REPORTS
───────────────────────────────────────── */

app.get("/api/reports", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.reports) ? db.reports : []);
});
app.put("/api/reports", (req, res) => {
  const db = readDb();
  db.reports = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true });
});
app.post("/api/reports", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.reports)) db.reports = [];
  const report = { id: genId(), submittedAt: new Date().toISOString(), status: "open", ...req.body };
  db.reports.unshift(report);
  writeDb(db);
  res.status(201).json({ ok: true, report });
});
app.patch("/api/reports/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.reports)) return res.status(404).json({ ok: false });
  db.reports = db.reports.map((r) => r.id === req.params.id ? { ...r, ...(req.body || {}) } : r);
  writeDb(db);
  res.json({ ok: true });
});
app.delete("/api/reports/:id", (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.reports)) return res.status(404).json({ ok: false });
  db.reports = db.reports.filter((r) => r.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

/* ─────────────────────────────────────────
   CABINET ACCOUNTS (ЛК member accounts)
───────────────────────────────────────── */

app.get("/api/cabinet/accounts", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.cabinetAccounts) ? db.cabinetAccounts : []);
});

app.put("/api/cabinet/accounts", (req, res) => {
  const db = readDb();
  db.cabinetAccounts = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.cabinetAccounts.length });
});

/* ─────────────────────────────────────────
   ROLE TEMPLATES
───────────────────────────────────────── */

app.get("/api/role-templates", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.roleTemplates) ? db.roleTemplates : []);
});

app.put("/api/role-templates", (req, res) => {
  const db = readDb();
  db.roleTemplates = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.roleTemplates.length });
});

/* ─────────────────────────────────────────
   ADMIN NOTIFICATIONS
───────────────────────────────────────── */

app.get("/api/notifications", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.adminNotifications) ? db.adminNotifications : []);
});

app.put("/api/notifications", (req, res) => {
  const db = readDb();
  db.adminNotifications = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.adminNotifications.length });
});

/* ─────────────────────────────────────────
   ACHIEVEMENT DEFS
───────────────────────────────────────── */

app.get("/api/achievement-defs", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.achievementDefs) ? db.achievementDefs : []);
});

app.put("/api/achievement-defs", (req, res) => {
  const db = readDb();
  db.achievementDefs = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.achievementDefs.length });
});

/* ─────────────────────────────────────────
   USER ACHIEVEMENTS
───────────────────────────────────────── */

app.get("/api/user-achievements", (_req, res) => {
  const db = readDb();
  res.json(Array.isArray(db.userAchievements) ? db.userAchievements : []);
});

app.put("/api/user-achievements", (req, res) => {
  const db = readDb();
  db.userAchievements = Array.isArray(req.body) ? req.body : [];
  writeDb(db);
  res.json({ ok: true, count: db.userAchievements.length });
});

// Serve built frontend (production)
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      } else if (filePath.endsWith(".html")) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      }
    },
  }));
  // SPA fallback — serve index.html for any non-API route
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.listen(PORT, () => {
  // Ensure root account exists on first run
  const db = readDb();
  if (!Array.isArray(db.staffAccounts)) db.staffAccounts = [];
  if (!db.staffAccounts.some((a) => a.isRoot)) {
    db.staffAccounts.push({
      id: "root",
      username: "root",
      passwordHash: hashPassword("root"),
      displayName: "Root",
      position: "Главный администратор",
      permissions: ["all"],
      isRoot: true,
      active: true,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);
    console.log("[api] Created default root account  login: root / root");
  }
  // Seed default nav items if empty
  if (!Array.isArray(db.adminSnapshot?.navItems) || db.adminSnapshot.navItems.length === 0) {
    if (!db.adminSnapshot) db.adminSnapshot = {};
    db.adminSnapshot.navItems = DEFAULT_NAV_ITEMS;
    writeDb(db);
    console.log("[api] Seeded default nav items");
  }
  // Seed default members if empty
  if (!Array.isArray(db.adminSnapshot?.members) || db.adminSnapshot.members.length === 0) {
    if (!db.adminSnapshot) db.adminSnapshot = {};
    db.adminSnapshot.members = DEFAULT_MEMBERS;
    writeDb(db);
    console.log("[api] Seeded default members (", DEFAULT_MEMBERS.length, ")");
  }
  console.log(`[api] listening on http://localhost:${PORT}`);
});

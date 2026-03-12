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
  },
  applications: [],
  contracts: [],
  polls: [],
  pollVoters: {},
  staffAccounts: [],
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
   AUTH — staff accounts
───────────────────────────────────────── */

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "username and password required" });
  }
  const db = readDb();
  const accounts = Array.isArray(db.staffAccounts) ? db.staffAccounts : [];
  const account = accounts.find((a) => a.username === username && a.active !== false);
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return res.status(401).json({ ok: false, message: "Неверный логин или пароль" });
  }
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

// Serve built frontend (production)
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
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

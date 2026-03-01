import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";

const app = express();
const PORT = Number(process.env.API_PORT || 8790);
const DATA_DIR = path.resolve(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const defaultDb = {
  adminSnapshot: {
    navItems: [],
    announcements: [],
    customPages: [],
    pageOverrides: [],
    members: [],
  },
  applications: [],
  polls: [],
  pollVoters: {},
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

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});

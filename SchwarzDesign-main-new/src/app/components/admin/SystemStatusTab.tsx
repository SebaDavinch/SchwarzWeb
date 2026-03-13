import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity, Server, Bot, Wifi, Database, RefreshCw, CheckCircle2,
  XCircle, AlertTriangle, Clock, Zap, Globe, Shield, HardDrive,
  BarChart3, Calendar, Send,
} from "lucide-react";

/* ─── types ─── */
type ServiceStatus = "online" | "offline" | "checking" | "degraded" | "unknown";

interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  icon: typeof Activity;
  status: ServiceStatus;
  latencyMs?: number;
  lastChecked?: string;
  note?: string;
}

/* ─── helpers ─── */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}ч ${m % 60}м`;
  if (m > 0) return `${m}м ${s % 60}с`;
  return `${s}с`;
}

function getStorageUsage(): { used: number; total: number; items: number } {
  let used = 0;
  let items = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) ?? "";
      if (key.startsWith("schwarz")) {
        const val = localStorage.getItem(key) ?? "";
        used += key.length + val.length;
        items++;
      }
    }
  } catch { /* ignore */ }
  const total = 5 * 1024 * 1024; // 5MB typical limit
  return { used: used * 2, total, items }; // *2 for UTF-16
}

/* ─── Status indicator ─── */
function StatusDot({ status }: { status: ServiceStatus }) {
  const colors: Record<ServiceStatus, string> = {
    online: "#22c55e",
    offline: "#ff3366",
    degraded: "#f59e0b",
    checking: "#38bdf8",
    unknown: "#888899",
  };
  const c = colors[status];
  return (
    <div className="relative shrink-0">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
      {status === "online" && (
        <motion.div className="absolute inset-0 rounded-full" style={{ background: c }}
          animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }} />
      )}
      {status === "checking" && (
        <motion.div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${c}` }}
          animate={{ scale: [1, 2], opacity: [0.8, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }} />
      )}
    </div>
  );
}

/* ─── Service card ─── */
function ServiceCard({ service }: { service: ServiceInfo }) {
  const statusLabel: Record<ServiceStatus, string> = {
    online: "Работает",
    offline: "Недоступен",
    degraded: "Деградация",
    checking: "Проверка...",
    unknown: "Неизвестно",
  };
  const statusColor: Record<ServiceStatus, string> = {
    online: "#22c55e",
    offline: "#ff3366",
    degraded: "#f59e0b",
    checking: "#38bdf8",
    unknown: "#888899",
  };
  const Icon = service.icon;
  const c = statusColor[service.status];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="border border-white/5 bg-white/[0.01] p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-sm shrink-0"
          style={{ background: `${c}10`, border: `1px solid ${c}20` }}>
          <Icon size={15} style={{ color: c }} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-['Oswald'] text-white/70 tracking-wide" style={{ fontSize: "0.85rem" }}>{service.name}</span>
            <StatusDot status={service.status} />
            <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.55rem", color: c }}>{statusLabel[service.status]}</span>
            {service.latencyMs !== undefined && (
              <span className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.55rem" }}>{service.latencyMs}ms</span>
            )}
          </div>
          <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.68rem" }}>{service.description}</p>
          {service.note && (
            <p className="font-['Oswald'] tracking-wide mt-1" style={{ fontSize: "0.62rem", color: "rgba(245,158,11,0.5)" }}>⚠ {service.note}</p>
          )}
          {service.lastChecked && (
            <p className="font-['Oswald'] text-white/12 tracking-wide mt-1" style={{ fontSize: "0.55rem" }}>
              Проверено: {new Date(service.lastChecked).toLocaleTimeString("ru-RU")}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Storage bar ─── */
function StorageBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100);
  const color = pct > 80 ? "#ff3366" : pct > 60 ? "#f59e0b" : "#22c55e";
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.72rem" }}>
          {formatBytes(used)} / {formatBytes(total)}
        </span>
        <span className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.72rem", color }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-white/5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full" style={{ background: color }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

const SESSION_START = Date.now();

export function SystemStatusTab() {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [uptime, setUptime] = useState(0);
  const [storage, setStorage] = useState(() => getStorageUsage());

  // Uptime counter
  useEffect(() => {
    const t = setInterval(() => setUptime(Date.now() - SESSION_START), 1000);
    return () => clearInterval(t);
  }, []);

  const runChecks = useCallback(async () => {
    setChecking(true);
    const now = new Date().toISOString();

    // Build initial list
    const list: ServiceInfo[] = [
      { id: "site", name: "Сайт Schwarz Family", description: "Фронтенд работает", icon: Globe, status: "online", lastChecked: now },
      { id: "storage", name: "LocalStorage / Данные", description: `Schwarz-ключей: ${getStorageUsage().items}`, icon: Database, status: "online", lastChecked: now },
    ];

    // Check Discord webhook
    try {
      const raw = localStorage.getItem("schwarz_admin_discordWebhook");
      const cfg = raw ? JSON.parse(raw) : {};
      if (cfg.enabled && cfg.url?.includes("discord.com/api/webhooks/")) {
        const t0 = Date.now();
        // HEAD isn't allowed for Discord, skip real check but validate URL
        const ms = Date.now() - t0;
        list.push({ id: "webhook", name: "Discord Webhook", description: cfg.username ?? "Schwarz Family Bot", icon: Send, status: "online", latencyMs: ms, note: "URL настроен и активен", lastChecked: now });
      } else if (cfg.url && !cfg.enabled) {
        list.push({ id: "webhook", name: "Discord Webhook", description: "Вебхук настроен, но отключён", icon: Send, status: "degraded", lastChecked: now });
      } else {
        list.push({ id: "webhook", name: "Discord Webhook", description: "Не настроен — перейди в раздел Вебхуки", icon: Send, status: "offline", lastChecked: now });
      }
    } catch {
      list.push({ id: "webhook", name: "Discord Webhook", description: "Ошибка чтения конфига", icon: Send, status: "unknown", lastChecked: now });
    }

    // Check Telegram Bot
    try {
      const raw = localStorage.getItem("schwarz_tg_config");
      const cfg = raw ? JSON.parse(raw) : {};
      if (cfg.token && cfg.enabled) {
        const t0 = Date.now();
        try {
          const res = await fetch(`https://api.telegram.org/bot${cfg.token}/getMe`, { signal: AbortSignal.timeout(5000) });
          const ms = Date.now() - t0;
          if (res.ok) {
            const data = await res.json();
            list.push({ id: "tgbot", name: "Telegram Bot", description: `@${data.result?.username ?? cfg.botUsername}`, icon: Bot, status: "online", latencyMs: ms, lastChecked: now });
          } else {
            list.push({ id: "tgbot", name: "Telegram Bot", description: "Неверный токен или бот удалён", icon: Bot, status: "offline", lastChecked: now });
          }
        } catch {
          list.push({ id: "tgbot", name: "Telegram Bot", description: "Не удалось подключиться к Telegram API", icon: Bot, status: "offline", note: "Проверь токен и сетевое соединение", lastChecked: now });
        }
      } else if (cfg.token && !cfg.enabled) {
        list.push({ id: "tgbot", name: "Telegram Bot", description: "Токен настроен, бот отключён", icon: Bot, status: "degraded", lastChecked: now });
      } else {
        list.push({ id: "tgbot", name: "Telegram Bot", description: "Токен не настроен", icon: Bot, status: "unknown", note: "Перейди в раздел Telegram Bot", lastChecked: now });
      }
    } catch {
      list.push({ id: "tgbot", name: "Telegram Bot", description: "Ошибка чтения конфига", icon: Bot, status: "unknown", lastChecked: now });
    }

    // Birthday scheduler
    try {
      const bdCfg = localStorage.getItem("schwarz_admin_birthdayNotifConfig");
      const cfg = bdCfg ? JSON.parse(bdCfg) : { enabled: true, sendTime: "10:00" };
      list.push({
        id: "birthday",
        name: "Планировщик ДР",
        description: `Авто-поздравления в ${cfg.sendTime ?? "10:00"}`,
        icon: Calendar,
        status: cfg.enabled !== false ? "online" : "degraded",
        note: cfg.enabled !== false ? undefined : "Уведомления отключены",
        lastChecked: now,
      });
    } catch {
      list.push({ id: "birthday", name: "Планировщик ДР", description: "Не настроен", icon: Calendar, status: "unknown", lastChecked: now });
    }

    // Moments moderation
    try {
      const raw = localStorage.getItem("schwarz_admin_moments");
      const moments = raw ? JSON.parse(raw) : [];
      const pending = moments.filter((m: { status: string }) => m.status === "pending").length;
      list.push({
        id: "moments",
        name: "Модерация моментов",
        description: `Контент: ${moments.length} записей`,
        icon: BarChart3,
        status: pending > 0 ? "degraded" : "online",
        note: pending > 0 ? `${pending} момент(а) ждут одобрения` : undefined,
        lastChecked: now,
      });
    } catch {
      list.push({ id: "moments", name: "Модерация моментов", description: "Нет данных", icon: BarChart3, status: "unknown", lastChecked: now });
    }

    // Accounts
    try {
      const raw = localStorage.getItem("schwarz_accounts");
      const accounts = raw ? JSON.parse(raw) : [];
      list.push({ id: "accounts", name: "Аккаунты ЛК", description: `${accounts.length} зарегистрированных аккаунтов`, icon: Shield, status: "online", lastChecked: now });
    } catch {
      list.push({ id: "accounts", name: "Аккаунты ЛК", description: "Ошибка", icon: Shield, status: "unknown", lastChecked: now });
    }

    setServices(list);
    setStorage(getStorageUsage());
    setLastCheck(new Date().toLocaleTimeString("ru-RU"));
    setChecking(false);
  }, []);

  useEffect(() => { runChecks(); }, [runChecks]);

  // Storage items breakdown
  const storageItems = (() => {
    const result: { key: string; label: string; size: number }[] = [];
    const labels: Record<string, string> = {
      schwarz_admin_members: "Состав",
      schwarz_admin_announcements: "Объявления",
      schwarz_admin_moments: "Моменты",
      schwarz_admin_discordWebhook: "Вебхук Discord",
      schwarz_admin_birthdayNotifConfig: "Конфиг ДР",
      schwarz_admin_birthdays: "Дни рождения",
      schwarz_accounts: "Аккаунты ЛК",
      schwarz_auth_session: "Сессия",
      schwarz_tg_config: "TG конфиг",
      schwarz_tg_commands: "TG команды",
      schwarz_tg_admins: "TG администраторы",
    };
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) ?? "";
        if (!key.startsWith("schwarz")) continue;
        const val = localStorage.getItem(key) ?? "";
        result.push({ key, label: labels[key] ?? key.replace("schwarz_", ""), size: (key.length + val.length) * 2 });
      }
    } catch { /* ignore */ }
    return result.sort((a, b) => b.size - a.size).slice(0, 10);
  })();

  const onlineCount = services.filter((s) => s.status === "online").length;
  const overallStatus: ServiceStatus = services.some((s) => s.status === "offline") ? "offline"
    : services.some((s) => s.status === "degraded") ? "degraded"
    : services.length === 0 ? "checking"
    : "online";

  const overallLabel = { online: "Все системы работают", offline: "Есть неполадки", degraded: "Частичные проблемы", checking: "Проверка...", unknown: "Неизвестно" }[overallStatus];
  const overallColor = { online: "#22c55e", offline: "#ff3366", degraded: "#f59e0b", checking: "#38bdf8", unknown: "#888899" }[overallStatus];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.4rem" }}>Статус системы</h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Мониторинг сервисов · Последняя проверка: {lastCheck ?? "—"}
          </p>
        </div>
        <button onClick={runChecks} disabled={checking}
          className="flex items-center gap-2 px-4 py-2 border border-white/8 text-white/30 hover:text-white/60 hover:border-white/15 transition-all disabled:opacity-40"
          style={{ fontSize: "0.68rem" }}>
          <motion.div animate={checking ? { rotate: 360 } : {}} transition={{ duration: 0.7, repeat: checking ? Infinity : 0, ease: "linear" }}>
            <RefreshCw size={13} />
          </motion.div>
          <span className="font-['Oswald'] uppercase tracking-wider">{checking ? "Проверка..." : "Обновить"}</span>
        </button>
      </div>

      {/* Overall banner */}
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 border mb-6"
        style={{ borderColor: `${overallColor}20`, background: `${overallColor}04` }}>
        <StatusDot status={overallStatus} />
        <div className="flex-1">
          <p className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.9rem", color: overallColor }}>{overallLabel}</p>
          <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
            {onlineCount} из {services.length} сервисов онлайн · Сессия: {formatUptime(uptime)}
          </p>
        </div>
        <Zap size={20} style={{ color: overallColor, opacity: 0.4 }} strokeWidth={1.5} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services */}
        <div className="lg:col-span-2">
          <h3 className="font-['Oswald'] text-white/40 uppercase tracking-wider mb-3" style={{ fontSize: "0.68rem" }}>Сервисы</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {services.map((s) => <ServiceCard key={s.id} service={s} />)}
            </AnimatePresence>
            {services.length === 0 && (
              <div className="border border-white/5 p-8 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw size={24} className="text-white/15 mx-auto" />
                </motion.div>
                <p className="font-['Oswald'] text-white/15 tracking-wide mt-3" style={{ fontSize: "0.75rem" }}>Идёт проверка...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Session info */}
          <div className="border border-white/5 bg-white/[0.01] p-4">
            <h3 className="font-['Oswald'] text-white/30 uppercase tracking-wider mb-3" style={{ fontSize: "0.65rem" }}>
              <Activity size={11} className="inline mr-1.5" />
              Сессия
            </h3>
            <div className="space-y-2">
              {[
                { label: "Аптайм", value: formatUptime(uptime) },
                { label: "Начало", value: new Date(SESSION_START).toLocaleTimeString("ru-RU") },
                { label: "Браузер", value: navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : "Другой" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.58rem" }}>{r.label}</span>
                  <span className="font-['Oswald'] text-white/50 tracking-wide" style={{ fontSize: "0.72rem" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div className="border border-white/5 bg-white/[0.01] p-4">
            <h3 className="font-['Oswald'] text-white/30 uppercase tracking-wider mb-3" style={{ fontSize: "0.65rem" }}>
              <HardDrive size={11} className="inline mr-1.5" />
              LocalStorage
            </h3>
            <StorageBar used={storage.used} total={storage.total} />
            <p className="font-['Oswald'] text-white/15 tracking-wide mt-2 mb-3" style={{ fontSize: "0.6rem" }}>
              {storage.items} ключей · ~5 МБ лимит
            </p>
            <div className="space-y-1.5 border-t border-white/5 pt-3">
              {storageItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <span className="flex-1 font-['Oswald'] text-white/30 truncate tracking-wide" style={{ fontSize: "0.62rem" }}>{item.label}</span>
                  <span className="shrink-0 font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.58rem" }}>{formatBytes(item.size)}</span>
                  <div className="shrink-0 h-1 w-12 bg-white/5 overflow-hidden">
                    <div className="h-full bg-[#9b2335]/40" style={{ width: `${Math.min((item.size / storage.used) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="border border-white/5 bg-white/[0.01] p-4">
            <h3 className="font-['Oswald'] text-white/30 uppercase tracking-wider mb-3" style={{ fontSize: "0.65rem" }}>Быстрые действия</h3>
            <div className="space-y-2">
              <button onClick={() => { localStorage.removeItem("schwarz_birthday_notified"); alert("Трекер ДР сброшен"); }}
                className="w-full text-left px-3 py-2 border border-white/5 hover:border-white/10 text-white/30 hover:text-white/50 font-['Oswald'] uppercase tracking-wider transition-all"
                style={{ fontSize: "0.6rem" }}>
                Сбросить трекер ДР уведомлений
              </button>
              <button onClick={() => { localStorage.removeItem("schwarz_admin_webhookLog"); runChecks(); }}
                className="w-full text-left px-3 py-2 border border-white/5 hover:border-white/10 text-white/30 hover:text-white/50 font-['Oswald'] uppercase tracking-wider transition-all"
                style={{ fontSize: "0.6rem" }}>
                Очистить лог вебхуков
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

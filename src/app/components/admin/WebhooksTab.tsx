import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Bell,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  ExternalLink,
  Info,
  Zap,
  User,
  Link,
} from "lucide-react";
import {
  getWebhookConfig,
  saveWebhookConfig,
  getWebhookEvents,
  saveWebhookEvents,
  getWebhookLog,
  clearWebhookLog,
  testWebhook,
  type WebhookConfig,
  type WebhookEvents,
  type WebhookLogEntry,
} from "../../hooks/useDiscordWebhook";

/* ─── Event config ─── */
const EVENT_CONFIG: {
  key: keyof WebhookEvents;
  label: string;
  desc: string;
  color: string;
  emoji: string;
}[] = [
  { key: "newApplication", label: "Новая заявка", desc: "Когда игрок отправляет заявку на вступление", color: "#f59e0b", emoji: "📋" },
  { key: "applicationVerdict", label: "Решение по заявке", desc: "Когда заявка принята или отклонена", color: "#9b2335", emoji: "⚖️" },
  { key: "memberAdded", label: "Добавлен участник", desc: "Когда новый игрок добавляется в состав", color: "#9b2335", emoji: "👤" },
  { key: "memberRemoved", label: "Удалён участник", desc: "Когда участник покидает семью", color: "#ff3366", emoji: "🚪" },
  { key: "newAnnouncement", label: "Новое объявление", desc: "Когда публикуется объявление в Admin Panel", color: "#5865F2", emoji: "📢" },
  { key: "leadershipChange", label: "Изменения лидерок", desc: "Добавление, редактирование или удаление лидерок", color: "#f59e0b", emoji: "🏆" },
  { key: "newsPublished", label: "Статья опубликована", desc: "Когда выходит новая статья в Schwarz News", color: "#9b2335", emoji: "📰" },
  { key: "momentAdded", label: "Новый момент", desc: "Когда добавляется фото/видео в «Лучшие Моменты»", color: "#a855f7", emoji: "📸" },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* ─── Embed Preview ─── */
function EmbedPreview({ config }: { config: WebhookConfig }) {
  return (
    <div className="rounded-sm overflow-hidden" style={{ background: "#36393f", border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#9b2335]/20 flex items-center justify-center text-xs">
          🔴
        </div>
        <div>
          <p className="text-white/80" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
            {config.username || "Schwarz Family"}
          </p>
          <p className="text-white/25" style={{ fontSize: "0.6rem" }}>Бот</p>
        </div>
      </div>

      {/* Embed */}
      <div className="px-3 py-3">
        <div
          className="rounded-sm pl-3 overflow-hidden"
          style={{ background: "#2f3136", borderLeft: "4px solid #9b2335" }}
        >
          <div className="py-3 pr-3">
            <p className="text-white/80 mb-1" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              📢 Новое объявление
            </p>
            <p className="text-white/50" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
              Пример уведомления от Schwarz Family Admin Panel.
            </p>
            <div className="flex gap-4 mt-2">
              <div>
                <p className="text-white/30" style={{ fontSize: "0.6rem" }}>Приоритет</p>
                <p className="text-white/60" style={{ fontSize: "0.7rem" }}>🔴 Высокий</p>
              </div>
            </div>
            <p className="text-white/20 mt-2" style={{ fontSize: "0.6rem" }}>
              Schwarz Family | Majestic RP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Log Entry ─── */
function LogRow({ entry }: { entry: WebhookLogEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group"
    >
      <div className="shrink-0 mt-0.5">
        {entry.success ? (
          <CheckCircle2 size={14} className="text-[#9b2335]/60" />
        ) : (
          <XCircle size={14} className="text-[#ff3366]/60" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-['Oswald'] text-white/50 tracking-wide truncate" style={{ fontSize: "0.78rem" }}>
          {entry.title}
        </p>
        {entry.details && (
          <p className="font-['Oswald'] text-white/20 tracking-wide mt-0.5 truncate" style={{ fontSize: "0.62rem" }}>
            {entry.details}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider"
          style={{
            fontSize: "0.5rem",
            color: entry.success ? "rgba(155,35,53,0.6)" : "rgba(255,51,102,0.6)",
            background: entry.success ? "rgba(155,35,53,0.08)" : "rgba(255,51,102,0.08)",
            border: `1px solid ${entry.success ? "rgba(155,35,53,0.2)" : "rgba(255,51,102,0.2)"}`,
          }}
        >
          {entry.success ? "OK" : "FAIL"}
        </span>
        <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.6rem" }}>
          {formatTime(entry.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export function WebhooksTab() {
  const [config, setConfig] = useState<WebhookConfig>(getWebhookConfig);
  const [events, setEvents] = useState<WebhookEvents>(getWebhookEvents);
  const [log, setLog] = useState<WebhookLogEntry[]>(getWebhookLog);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | boolean>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "events" | "log">("config");

  const refreshLog = useCallback(() => {
    setLog(getWebhookLog());
  }, []);

  // auto-refresh log
  useEffect(() => {
    const t = setInterval(refreshLog, 5000);
    return () => clearInterval(t);
  }, [refreshLog]);

  const handleSave = () => {
    saveWebhookConfig(config);
    saveWebhookEvents(events);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!config.url.trim()) return;
    setTesting(true);
    setTestResult(null);
    const ok = await testWebhook(config.url);
    setTestResult(ok);
    setTesting(false);
    refreshLog();
    setTimeout(() => setTestResult(null), 4000);
  };

  const handleClearLog = () => {
    clearWebhookLog();
    setLog([]);
  };

  const toggleEvent = (key: keyof WebhookEvents) => {
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const enabledCount = Object.values(events).filter(Boolean).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.5rem" }}>
            Discord Вебхуки
          </h2>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Автоматические уведомления в Discord-каналы
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 border"
            style={{
              borderColor: config.enabled ? "rgba(155,35,53,0.25)" : "rgba(255,255,255,0.08)",
              background: config.enabled ? "rgba(155,35,53,0.06)" : "rgba(255,255,255,0.02)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: config.enabled ? "#9b2335" : "rgba(255,255,255,0.15)",
                boxShadow: config.enabled ? "0 0 6px rgba(155,35,53,0.5)" : "none",
              }}
            />
            <span
              className="font-['Oswald'] uppercase tracking-wider"
              style={{ fontSize: "0.6rem", color: config.enabled ? "rgba(155,35,53,0.7)" : "rgba(255,255,255,0.2)" }}
            >
              {config.enabled ? "Активен" : "Отключён"}
            </span>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white transition-all duration-300"
            style={{
              fontSize: "0.72rem",
              background: saved ? "rgba(155,35,53,0.6)" : "#9b2335",
            }}
          >
            {saved ? <CheckCircle2 size={13} /> : <Send size={13} />}
            {saved ? "Сохранено" : "Сохранить"}
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/5">
        {([
          { id: "config" as const, label: "Настройка", icon: Link },
          { id: "events" as const, label: `События (${enabledCount}/${EVENT_CONFIG.length})`, icon: Zap },
          { id: "log" as const, label: `Журнал (${log.length})`, icon: Clock },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); if (t.id === "log") refreshLog(); }}
            className="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
            style={{
              fontSize: "0.7rem",
              color: activeTab === t.id ? "#9b2335" : "rgba(255,255,255,0.25)",
              borderBottom: activeTab === t.id ? "2px solid #9b2335" : "2px solid transparent",
            }}
          >
            <t.icon size={13} />
            <span className="font-['Oswald'] uppercase tracking-wider">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── CONFIG TAB ── */}
        {activeTab === "config" && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left: configuration */}
            <div className="space-y-5">
              {/* Enable/disable */}
              <div className="border border-white/5 bg-white/[0.01] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Oswald'] text-white/60 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
                      Вебхук включён
                    </p>
                    <p className="font-['Oswald'] text-white/20 tracking-wide mt-1" style={{ fontSize: "0.65rem" }}>
                      Глобальный переключатель всех уведомлений
                    </p>
                  </div>
                  <button
                    onClick={() => setConfig((c) => ({ ...c, enabled: !c.enabled }))}
                    className="flex items-center gap-2 transition-colors"
                  >
                    {config.enabled ? (
                      <ToggleRight size={26} className="text-[#9b2335]/70" />
                    ) : (
                      <ToggleLeft size={26} className="text-white/15" />
                    )}
                  </button>
                </div>
              </div>

              {/* Webhook URL */}
              <div className="border border-white/5 bg-white/[0.01] p-5 space-y-4">
                <p className="font-['Oswald'] text-white/50 uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>
                  Webhook URL
                </p>

                <div>
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    URL вебхука
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={config.url}
                      onChange={(e) => setConfig((c) => ({ ...c, url: e.target.value }))}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="flex-1 bg-[#0d0d15] border border-white/8 focus:border-[#5865F2]/30 text-white/50 font-mono px-3 py-2 outline-none transition-colors"
                      style={{ fontSize: "0.72rem" }}
                    />
                    <button
                      onClick={handleTest}
                      disabled={testing || !config.url.trim()}
                      className="px-3 py-2 font-['Oswald'] uppercase tracking-wider border transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                      style={{
                        fontSize: "0.6rem",
                        color: "#5865F2",
                        borderColor: "rgba(88,101,242,0.2)",
                        background: "rgba(88,101,242,0.04)",
                      }}
                    >
                      {testing ? (
                        <RefreshCw size={11} className="animate-spin" />
                      ) : (
                        <Send size={11} />
                      )}
                      {testing ? "..." : "Тест"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {testResult !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 flex items-center gap-2"
                      >
                        {testResult ? (
                          <>
                            <CheckCircle2 size={13} className="text-[#9b2335]/70" />
                            <span className="font-['Oswald'] text-[#9b2335]/70 tracking-wide" style={{ fontSize: "0.7rem" }}>
                              Тестовое сообщение отправлено!
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} className="text-[#ff3366]/70" />
                            <span className="font-['Oswald'] text-[#ff3366]/70 tracking-wide" style={{ fontSize: "0.7rem" }}>
                              Ошибка отправки. Проверь URL.
                            </span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <a
                    href="https://support.discord.com/hc/ru/articles/228383668"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 font-['Oswald'] text-white/15 hover:text-[#5865F2]/40 transition-colors tracking-wide"
                    style={{ fontSize: "0.62rem" }}
                  >
                    <ExternalLink size={10} />
                    Как создать webhook в Discord?
                  </a>
                </div>

                {/* Bot name */}
                <div>
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    Имя бота
                  </label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      value={config.username || ""}
                      onChange={(e) => setConfig((c) => ({ ...c, username: e.target.value }))}
                      placeholder="Schwarz Family"
                      className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/20 text-white/60 font-['Oswald'] tracking-wide pl-9 pr-3 py-2 outline-none transition-colors"
                      style={{ fontSize: "0.8rem" }}
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider block mb-2" style={{ fontSize: "0.58rem" }}>
                    Avatar URL (необязательно)
                  </label>
                  <input
                    value={config.avatarUrl || ""}
                    onChange={(e) => setConfig((c) => ({ ...c, avatarUrl: e.target.value }))}
                    placeholder="https://i.imgur.com/..."
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/20 text-white/40 font-mono px-3 py-2 outline-none transition-colors"
                    style={{ fontSize: "0.72rem" }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="border border-[#5865F2]/10 bg-[#5865F2]/[0.02] p-4 flex items-start gap-3">
                <Info size={14} className="text-[#5865F2]/40 shrink-0 mt-0.5" />
                <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.68rem", lineHeight: 1.7 }}>
                  Webhook отправляет уведомления напрямую из браузера в Discord. Убедитесь, что URL не раскрывается публично — он предоставляет право на публикацию в канал.
                </p>
              </div>
            </div>

            {/* Right: embed preview */}
            <div>
              <p className="font-['Oswald'] text-white/30 uppercase tracking-wider mb-3" style={{ fontSize: "0.65rem" }}>
                Предпросмотр сообщения
              </p>
              <EmbedPreview config={config} />

              <div className="mt-4 border border-white/5 bg-white/[0.01] p-4">
                <p className="font-['Oswald'] text-white/30 uppercase tracking-wider mb-3" style={{ fontSize: "0.62rem" }}>
                  Статистика
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Всего отправлено", value: log.length },
                    { label: "Успешно", value: log.filter((l) => l.success).length },
                    { label: "Ошибок", value: log.filter((l) => !l.success).length },
                    { label: "Событий включено", value: enabledCount },
                  ].map((s) => (
                    <div key={s.label} className="border border-white/[0.03] p-3">
                      <p className="font-['Russo_One'] text-[#9b2335]" style={{ fontSize: "1.2rem" }}>
                        {s.value}
                      </p>
                      <p className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === "events" && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.72rem" }}>
                Настройте, для каких событий отправлять уведомления в Discord
              </p>
              <button
                onClick={() => {
                  const allOn = Object.values(events).every(Boolean);
                  const updated = Object.fromEntries(
                    Object.keys(events).map((k) => [k, !allOn])
                  ) as unknown as WebhookEvents;
                  setEvents(updated);
                }}
                className="px-3 py-1.5 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
                style={{ fontSize: "0.6rem" }}
              >
                {Object.values(events).every(Boolean) ? "Отключить все" : "Включить все"}
              </button>
            </div>

            <div className="space-y-2">
              {EVENT_CONFIG.map((evt, i) => {
                const isOn = events[evt.key];
                return (
                  <motion.button
                    key={evt.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => toggleEvent(evt.key)}
                    className="w-full flex items-center gap-4 p-4 border transition-all duration-300 text-left group"
                    style={{
                      borderColor: isOn ? `${evt.color}20` : "rgba(255,255,255,0.04)",
                      background: isOn ? `${evt.color}04` : "rgba(255,255,255,0.005)",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>{evt.emoji}</span>

                    <div className="flex-1 min-w-0">
                      <p
                        className="font-['Oswald'] tracking-wide transition-colors"
                        style={{
                          fontSize: "0.82rem",
                          color: isOn ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.2)",
                        }}
                      >
                        {evt.label}
                      </p>
                      <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.62rem" }}>
                        {evt.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className="w-2 h-2 rounded-full transition-all"
                        style={{
                          background: isOn ? evt.color : "rgba(255,255,255,0.08)",
                          boxShadow: isOn ? `0 0 8px ${evt.color}50` : "none",
                        }}
                      />
                      {isOn ? (
                        <ToggleRight size={20} style={{ color: evt.color, opacity: 0.7 }} />
                      ) : (
                        <ToggleLeft size={20} className="text-white/10" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
                style={{ fontSize: "0.72rem" }}
              >
                {saved ? <CheckCircle2 size={14} /> : <Send size={14} />}
                {saved ? "Сохранено!" : "Сохранить"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── LOG TAB ── */}
        {activeTab === "log" && (
          <motion.div
            key="log"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Oswald'] text-white/25 tracking-wide" style={{ fontSize: "0.72rem" }}>
                Последние {log.length} отправок (авто-обновление каждые 5 сек.)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshLog}
                  className="p-2 text-white/20 hover:text-white/40 border border-white/5 hover:border-white/10 transition-all"
                  title="Обновить"
                >
                  <RefreshCw size={13} />
                </button>
                {log.length > 0 && (
                  <button
                    onClick={handleClearLog}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-['Oswald'] text-[#ff3366]/50 uppercase tracking-wider border border-[#ff3366]/15 hover:border-[#ff3366]/30 hover:text-[#ff3366]/70 transition-all"
                    style={{ fontSize: "0.6rem" }}
                  >
                    <Trash2 size={11} />
                    Очистить
                  </button>
                )}
              </div>
            </div>

            {log.length === 0 ? (
              <div className="text-center py-20 border border-white/[0.03]">
                <Bell size={36} className="text-white/8 mx-auto mb-4" />
                <p className="font-['Oswald'] text-white/15 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
                  Журнал пуст
                </p>
                <p className="font-['Oswald'] text-white/10 tracking-wide mt-2" style={{ fontSize: "0.65rem" }}>
                  Отправьте тестовое сообщение или настройте события
                </p>
              </div>
            ) : (
              <div className="border border-white/5 overflow-hidden">
                {/* Log header */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border-b border-white/5">
                  <span className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.55rem", minWidth: "14px" }}>
                    №
                  </span>
                  <span className="font-['Oswald'] text-white/20 uppercase tracking-wider flex-1" style={{ fontSize: "0.55rem" }}>
                    Событие
                  </span>
                  <span className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>
                    Статус / Время
                  </span>
                </div>
                {log.map((entry, i) => (
                  <LogRow key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cake, Plus, Edit3, Trash2, X, Save, Send, RefreshCw,
  CheckCircle2, XCircle, Clock, ToggleLeft, ToggleRight,
  Calendar, Bell, Eye, Info,
} from "lucide-react";
import {
  useBirthdays,
  getAllBirthdays,
  sendBirthdayWebhook,
  getDaysUntilBirthday,
  isBirthdayToday,
  getAge,
  formatBirthdayRu,
  getZodiacSign,
  getZodiacEmoji,
  DEFAULT_BIRTHDAY_MESSAGE,
  type BirthdayEntry,
  type MergedBirthday,
} from "../../hooks/useBirthdays";

/* ─── helpers ─── */
function getMembersFromStorage(): { id: string; name: string }[] {
  try {
    const raw = localStorage.getItem("schwarz_admin_members");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ─── Input style shared ─── */
const inputCls =
  "w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors duration-300 placeholder-white/15";

const labelCls = "block font-['Oswald'] text-white/30 uppercase tracking-wider mb-1.5";

/* ═══════════════════════════════════════════════
   ADD / EDIT MODAL
   ═══════════════════════════════════════════════ */

interface EntryForm {
  name: string;
  birthday: string;
  memberId: string;
  note: string;
}

function EntryModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: BirthdayEntry;
  onSave: (data: EntryForm) => void;
  onClose: () => void;
}) {
  const members = getMembersFromStorage();
  const [form, setForm] = useState<EntryForm>({
    name: initial?.name ?? "",
    birthday: initial?.birthday ?? "",
    memberId: initial?.memberId ?? "",
    note: initial?.note ?? "",
  });

  const set = (k: keyof EntryForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.birthday;

  const handleMember = (memberId: string) => {
    const m = members.find((x) => x.id === memberId);
    set("memberId", memberId);
    if (m && !form.name.trim()) set("name", m.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,15,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md border border-white/8 bg-[#0d0d15] p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1rem" }}>
            {initial ? "Редактировать" : "Добавить день рождения"}
          </h3>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Member link */}
        <div>
          <label className={labelCls} style={{ fontSize: "0.62rem" }}>
            Привязать к участнику (необязательно)
          </label>
          <select
            value={form.memberId}
            onChange={(e) => handleMember(e.target.value)}
            className={inputCls}
            style={{ fontSize: "0.8rem" }}
          >
            <option value="">— Без привязки —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className={labelCls} style={{ fontSize: "0.62rem" }}>Имя *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Имя участника"
            className={inputCls}
            style={{ fontSize: "0.82rem" }}
          />
        </div>

        {/* Birthday */}
        <div>
          <label className={labelCls} style={{ fontSize: "0.62rem" }}>Дата рождения *</label>
          <input
            type="date"
            value={form.birthday}
            onChange={(e) => set("birthday", e.target.value)}
            className={inputCls}
            style={{ fontSize: "0.82rem", colorScheme: "dark" }}
          />
          {form.birthday && (
            <p className="mt-1 font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.65rem" }}>
              {formatBirthdayRu(form.birthday)} · {getZodiacEmoji(getZodiacSign(form.birthday))} {getZodiacSign(form.birthday)}
              {getAge(form.birthday) !== null && ` · ${getAge(form.birthday)} лет`}
            </p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className={labelCls} style={{ fontSize: "0.62rem" }}>Заметка (необязательно)</label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="Любая пометка..."
            className={inputCls}
            style={{ fontSize: "0.8rem" }}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/8 text-white/30 hover:text-white/50 transition-colors font-['Oswald'] uppercase tracking-wider"
            style={{ fontSize: "0.68rem" }}
          >
            Отмена
          </button>
          <button
            onClick={() => valid && onSave(form)}
            disabled={!valid}
            className="flex-1 py-2.5 flex items-center justify-center gap-2 transition-all duration-300 font-['Oswald'] uppercase tracking-wider"
            style={{
              fontSize: "0.68rem",
              background: valid ? "rgba(155,35,53,0.12)" : "transparent",
              border: `1px solid ${valid ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.05)"}`,
              color: valid ? "#9b2335" : "rgba(255,255,255,0.15)",
              cursor: valid ? "pointer" : "not-allowed",
            }}
          >
            <Save size={13} />
            {initial ? "Сохранить" : "Добавить"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   ENTRIES TAB
   ═══════════════════════════════════════════════ */

function EntriesSection() {
  const { entries, addEntry, updateEntry, deleteEntry } = useBirthdays();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BirthdayEntry | null>(null);
  const [sendStatus, setSendStatus] = useState<Record<string, "sending" | "done" | "error">>({});
  const [filter, setFilter] = useState<"all" | "manual" | "account">("all");

  const allMerged = getAllBirthdays();
  const displayed = allMerged.filter(
    (p) => filter === "all" || p.source === filter
  ).sort((a, b) => getDaysUntilBirthday(a.birthday) - getDaysUntilBirthday(b.birthday));

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (entry: BirthdayEntry) => { setEditTarget(entry); setModalOpen(true); };

  const handleSave = (form: { name: string; birthday: string; memberId: string; note: string }) => {
    if (editTarget) {
      updateEntry(editTarget.id, {
        name: form.name,
        birthday: form.birthday,
        memberId: form.memberId || undefined,
        note: form.note || undefined,
      });
    } else {
      addEntry({
        name: form.name,
        birthday: form.birthday,
        memberId: form.memberId || undefined,
        note: form.note || undefined,
      });
    }
    setModalOpen(false);
  };

  const handleSend = async (person: MergedBirthday) => {
    setSendStatus((s) => ({ ...s, [person.id]: "sending" }));
    const ok = await sendBirthdayWebhook(person, true);
    setSendStatus((s) => ({ ...s, [person.id]: ok ? "done" : "error" }));
    setTimeout(() => setSendStatus((s) => { const n = { ...s }; delete n[person.id]; return n; }), 3000);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 border transition-all duration-300"
          style={{ borderColor: "rgba(155,35,53,0.3)", background: "rgba(155,35,53,0.06)", color: "#9b2335" }}
        >
          <Plus size={14} strokeWidth={1.5} />
          <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.68rem" }}>
            Добавить вручную
          </span>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {(["all", "manual", "account"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-['Oswald'] uppercase tracking-wider transition-all duration-200 ${
                filter === f
                  ? "border border-[#9b2335]/30 bg-[#9b2335]/08 text-[#9b2335]"
                  : "border border-white/5 text-white/20 hover:text-white/40"
              }`}
              style={{ fontSize: "0.6rem" }}
            >
              {f === "all" ? `Все (${allMerged.length})` : f === "manual" ? `Ручные (${entries.length})` : `Аккаунты (${allMerged.length - entries.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {displayed.length === 0 ? (
        <div className="py-16 text-center border border-white/5">
          <Cake size={32} className="text-white/8 mx-auto mb-3" strokeWidth={1} />
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.8rem" }}>
            {filter === "account"
              ? "Ни один участник не указал дату рождения в ЛК"
              : "Нет записей о днях рождения"}
          </p>
          {filter !== "account" && (
            <button onClick={openAdd} className="mt-4 font-['Oswald'] text-[#9b2335]/40 hover:text-[#9b2335]/60 uppercase tracking-wider transition-colors" style={{ fontSize: "0.65rem" }}>
              + Добавить первую запись
            </button>
          )}
        </div>
      ) : (
        <div className="border border-white/5">
          {/* Header row */}
          <div
            className="grid gap-4 px-4 py-2 border-b border-white/5"
            style={{ gridTemplateColumns: "1fr 1fr auto auto auto" }}
          >
            {["Имя", "Дата", "Возраст / знак", "Источник", "Действия"].map((h) => (
              <span key={h} className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.58rem" }}>
                {h}
              </span>
            ))}
          </div>

          {displayed.map((person, i) => {
            const isToday = isBirthdayToday(person.birthday);
            const days = getDaysUntilBirthday(person.birthday);
            const age = getAge(person.birthday);
            const nextAge = age !== null ? age + 1 : null;
            const sign = getZodiacSign(person.birthday);
            const signEmoji = getZodiacEmoji(sign);
            const manualEntry = entries.find((e) => e.id === person.id);
            const status = sendStatus[person.id];

            return (
              <motion.div
                key={person.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`grid gap-4 px-4 py-3 border-b border-white/[0.04] last:border-b-0 items-center ${
                  isToday ? "bg-[#f59e0b]/03" : "hover:bg-white/[0.01]"
                } transition-colors duration-200`}
                style={{ gridTemplateColumns: "1fr 1fr auto auto auto" }}
              >
                {/* Name */}
                <div className="flex items-center gap-2 min-w-0">
                  {isToday && (
                    <span className="text-sm shrink-0">🎂</span>
                  )}
                  <div className="min-w-0">
                    <p
                      className="font-['Oswald'] tracking-wide truncate"
                      style={{ fontSize: "0.82rem", color: isToday ? "#f59e0b" : "rgba(255,255,255,0.7)" }}
                    >
                      {person.name}
                    </p>
                    {person.note && (
                      <p className="font-['Oswald'] text-white/20 truncate" style={{ fontSize: "0.62rem" }}>
                        {person.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <p className="font-['Oswald'] text-white/60 tracking-wide" style={{ fontSize: "0.78rem" }}>
                    {formatBirthdayRu(person.birthday)}
                  </p>
                  <p className="font-['Oswald'] tracking-wide" style={{
                    fontSize: "0.62rem",
                    color: isToday ? "rgba(245,158,11,0.6)" : days <= 7 ? "rgba(255,51,102,0.5)" : "rgba(255,255,255,0.2)",
                  }}>
                    {isToday ? "🎉 Сегодня!" : `через ${days} дн.`}
                  </p>
                </div>

                {/* Age / sign */}
                <div className="text-center">
                  {nextAge && (
                    <p className="font-['Oswald'] text-white/50 tracking-wide" style={{ fontSize: "0.78rem" }}>
                      {nextAge} лет
                    </p>
                  )}
                  <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.62rem" }}>
                    {signEmoji} {sign}
                  </p>
                </div>

                {/* Source */}
                <div
                  className="px-2 py-0.5 font-['Oswald'] uppercase tracking-wider whitespace-nowrap"
                  style={{
                    fontSize: "0.52rem",
                    color: person.source === "account" ? "#38bdf8" : "#9b2335",
                    background: person.source === "account" ? "rgba(56,189,248,0.07)" : "rgba(155,35,53,0.07)",
                    border: `1px solid ${person.source === "account" ? "rgba(56,189,248,0.15)" : "rgba(155,35,53,0.15)"}`,
                  }}
                >
                  {person.source === "account" ? "ЛК" : "Ручной"}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 justify-end">
                  {/* Send greeting */}
                  <button
                    onClick={() => handleSend(person)}
                    disabled={!!status}
                    title="Отправить поздравление"
                    className="w-7 h-7 flex items-center justify-center border transition-all duration-200 hover:border-[#9b2335]/30 hover:bg-[#9b2335]/05"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {status === "sending" ? <RefreshCw size={12} className="text-white/30 animate-spin" /> :
                     status === "done" ? <CheckCircle2 size={12} className="text-green-500/60" /> :
                     status === "error" ? <XCircle size={12} className="text-red-500/60" /> :
                     <Send size={12} className="text-white/25" />}
                  </button>

                  {/* Edit (manual only) */}
                  {manualEntry && (
                    <button
                      onClick={() => openEdit(manualEntry)}
                      title="Редактировать"
                      className="w-7 h-7 flex items-center justify-center border border-white/6 text-white/25 hover:border-[#9b2335]/25 hover:text-[#9b2335]/60 transition-all duration-200"
                    >
                      <Edit3 size={12} />
                    </button>
                  )}

                  {/* Delete (manual only) */}
                  {manualEntry && (
                    <button
                      onClick={() => deleteEntry(manualEntry.id)}
                      title="Удалить"
                      className="w-7 h-7 flex items-center justify-center border border-white/6 text-white/25 hover:border-red-500/25 hover:text-red-500/60 transition-all duration-200"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  {/* Account: link to accounts tab hint */}
                  {person.source === "account" && (
                    <div
                      title="Дата берётся из профиля ЛК"
                      className="w-7 h-7 flex items-center justify-center border border-white/6 text-white/15 cursor-default"
                    >
                      <Info size={12} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Note */}
      <p className="mt-4 font-['Oswald'] text-white/12 tracking-wide" style={{ fontSize: "0.65rem" }}>
        💡 Записи из «Аккаунтов» — автоматически из Личного кабинета. Редактировать их можно во вкладке «Аккаунты ЛК». Ручные записи управляются здесь.
      </p>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <EntryModal
            initial={editTarget ?? undefined}
            onSave={handleSave}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NOTIFICATIONS SETTINGS SECTION
   ═══════════════════════════════════════════════ */

function NotificationsSection() {
  const { notifConfig, setNotifConfig } = useBirthdays();
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [saved, setSaved] = useState(false);
  const [embedImageUrl, setEmbedImageUrl] = useState(
    () => {
      try { const c = JSON.parse(localStorage.getItem("schwarz_admin_birthdayNotifConfig") ?? "{}"); return c.embedImageUrl ?? ""; }
      catch { return ""; }
    }
  );

  const set = <K extends keyof typeof notifConfig>(k: K, v: (typeof notifConfig)[K]) => {
    setNotifConfig({ ...notifConfig, [k]: v });
  };

  const handleTest = async () => {
    setTestStatus("sending");
    const testPerson: MergedBirthday = {
      id: "test_bd",
      name: "Madara Schwarz",
      birthday: new Date().toISOString().slice(0, 10),
      source: "manual",
      avatarDataUrl: embedImageUrl || undefined,
    };
    const ok = await sendBirthdayWebhook(testPerson, true);
    setTestStatus(ok ? "done" : "error");
    setTimeout(() => setTestStatus("idle"), 3000);
  };

  const handleSave = () => {
    // save embedImageUrl into config
    const cur = { ...notifConfig, embedImageUrl };
    setNotifConfig(cur as typeof notifConfig);
    localStorage.setItem("schwarz_admin_birthdayNotifConfig", JSON.stringify(cur));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Discord embed preview with rich formatting
  const previewText = notifConfig.message
    .replace("{name}", "**Madara Schwarz**")
    .replace("{age}", "**26**");

  const fields = [
    { name: "Именинник", value: "Madara Schwarz", inline: true },
    { name: "Возраст", value: "26 лет", inline: true },
    { name: "Дата", value: "15 марта", inline: true },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Enable toggle */}
      <div className="flex items-start justify-between gap-4 border border-white/5 p-5">
        <div>
          <p className="font-['Oswald'] text-white/70 uppercase tracking-wider" style={{ fontSize: "0.82rem" }}>
            Автоматические поздравления
          </p>
          <p className="font-['Oswald'] text-white/25 tracking-wide mt-1" style={{ fontSize: "0.72rem" }}>
            Бот отправит поздравление в Discord в заданное время в день рождения
          </p>
        </div>
        <button onClick={() => set("enabled", !notifConfig.enabled)} className="shrink-0 mt-1">
          {notifConfig.enabled
            ? <ToggleRight size={28} className="text-[#9b2335]" />
            : <ToggleLeft size={28} className="text-white/15" />}
        </button>
      </div>

      {/* Time picker */}
      <div>
        <label className={labelCls} style={{ fontSize: "0.62rem" }}>
          <Clock size={11} className="inline mr-1.5" />
          Время отправки
        </label>
        <input type="time" value={notifConfig.sendTime} onChange={(e) => set("sendTime", e.target.value)}
          className={inputCls} style={{ fontSize: "0.82rem", colorScheme: "dark", maxWidth: 180 }} />
        <p className="mt-1.5 font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.62rem" }}>
          ⚠️ Планировщик работает пока открыт сайт. Запускается каждую минуту.
        </p>
      </div>

      {/* Webhook source */}
      <div className="border border-white/5 p-5 space-y-4">
        <p className="font-['Oswald'] text-white/50 uppercase tracking-wider" style={{ fontSize: "0.72rem" }}>
          <Bell size={12} className="inline mr-1.5" />
          Источник вебхука
        </p>
        <div className="space-y-2">
          {[
            { val: true, label: "Использовать основной вебхук (настройки → Вебхуки)" },
            { val: false, label: "Отдельный вебхук для дней рождения" },
          ].map(({ val, label }) => (
            <label key={String(val)} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200"
                style={{ borderColor: notifConfig.useMainWebhook === val ? "#9b2335" : "rgba(255,255,255,0.15)", background: notifConfig.useMainWebhook === val ? "rgba(155,35,53,0.15)" : "transparent" }}
                onClick={() => set("useMainWebhook", val)}>
                {notifConfig.useMainWebhook === val && <div className="w-2 h-2 rounded-full bg-[#9b2335]" />}
              </div>
              <span className="font-['Oswald'] text-white/40 group-hover:text-white/60 tracking-wide transition-colors" style={{ fontSize: "0.78rem" }}>{label}</span>
            </label>
          ))}
        </div>
        {!notifConfig.useMainWebhook && (
          <div>
            <label className={labelCls} style={{ fontSize: "0.6rem" }}>URL вебхука Discord</label>
            <input type="url" value={notifConfig.webhookUrl} onChange={(e) => set("webhookUrl", e.target.value)}
              placeholder="https://discord.com/api/webhooks/..." className={inputCls} style={{ fontSize: "0.75rem" }} />
          </div>
        )}
      </div>

      {/* Message template */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls} style={{ fontSize: "0.62rem", marginBottom: 0 }}>Шаблон сообщения</label>
          <button onClick={() => set("message", DEFAULT_BIRTHDAY_MESSAGE)}
            className="font-['Oswald'] text-white/20 hover:text-white/40 tracking-wide transition-colors" style={{ fontSize: "0.6rem" }}>
            Сбросить
          </button>
        </div>
        <textarea value={notifConfig.message} onChange={(e) => set("message", e.target.value)} rows={4}
          className={inputCls} style={{ fontSize: "0.8rem", resize: "vertical", lineHeight: 1.7 }} />
        <div className="mt-2 flex flex-wrap gap-2">
          {[{ tag: "{name}", desc: "Имя участника" }, { tag: "{age}", desc: "Новый возраст" }].map(({ tag, desc }) => (
            <span key={tag} className="font-['Oswald'] tracking-wide px-2 py-0.5"
              style={{ fontSize: "0.58rem", background: "rgba(155,35,53,0.07)", border: "1px solid rgba(155,35,53,0.15)", color: "rgba(155,35,53,0.6)" }}>
              <code>{tag}</code> — {desc}
            </span>
          ))}
        </div>
      </div>

      {/* Embed image URL */}
      <div>
        <label className={labelCls} style={{ fontSize: "0.62rem" }}>
          🖼 URL изображения в Discord-карточке (thumbnail, необязательно)
        </label>
        <div className="flex gap-2">
          <input type="url" value={embedImageUrl} onChange={(e) => setEmbedImageUrl(e.target.value)}
            placeholder="https://i.imgur.com/..." className={`${inputCls} flex-1`} style={{ fontSize: "0.75rem" }} />
          {embedImageUrl && (
            <div className="w-10 h-10 border border-white/8 overflow-hidden shrink-0">
              <img src={embedImageUrl} alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>
        <p className="mt-1 font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.6rem" }}>
          Появится как thumbnail в Discord. Если не указано — используется логотип семьи.
        </p>
      </div>

      {/* Discord embed preview */}
      <div className="border border-white/5 p-4 space-y-3">
        <p className="font-['Oswald'] text-white/30 uppercase tracking-wider flex items-center gap-2" style={{ fontSize: "0.62rem" }}>
          <Eye size={11} />
          Превью Discord-карточки
        </p>
        <div className="rounded overflow-hidden" style={{ background: "#36393f" }}>
          {/* Bot header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#9b2335]/20 flex items-center justify-center text-xs shrink-0">
              {embedImageUrl ? <img src={embedImageUrl} className="w-full h-full object-cover" alt="" /> : "🔴"}
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Schwarz Family</p>
              <p style={{ fontSize: "0.55rem", fontFamily: "sans-serif", color: "rgba(255,255,255,0.2)" }}>Бот · сегодня в 10:00</p>
            </div>
          </div>
          {/* Embed */}
          <div className="px-3 py-3">
            <div className="flex gap-3" style={{ borderLeft: "4px solid #9b2335", paddingLeft: 12 }}>
              <div className="flex-1">
                <p style={{ fontSize: "0.82rem", fontFamily: "sans-serif", color: "white", fontWeight: 600, marginBottom: 4 }}>
                  🎂 День рождения!
                </p>
                <p style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-line" }}>
                  {previewText}
                </p>
                {/* Fields */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {fields.map((f) => (
                    <div key={f.name}>
                      <p style={{ fontSize: "0.6rem", fontFamily: "sans-serif", color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 1 }}>{f.name}</p>
                      <p style={{ fontSize: "0.65rem", fontFamily: "sans-serif", color: "rgba(255,255,255,0.7)" }}>{f.value}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.55rem", fontFamily: "sans-serif", color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
                  Schwarz Family | Дни рождения
                </p>
              </div>
              {/* Thumbnail */}
              {embedImageUrl && (
                <div className="w-16 h-16 rounded overflow-hidden shrink-0">
                  <img src={embedImageUrl} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={handleTest} disabled={testStatus === "sending"}
          className="flex items-center gap-2 px-4 py-2.5 border transition-all duration-300"
          style={{ borderColor: "rgba(155,35,53,0.25)", background: "rgba(155,35,53,0.06)", color: "rgba(155,35,53,0.7)" }}>
          {testStatus === "sending" ? <RefreshCw size={13} className="animate-spin" /> :
           testStatus === "done" ? <CheckCircle2 size={13} className="text-green-500/70" /> :
           testStatus === "error" ? <XCircle size={13} className="text-red-500/70" /> :
           <Send size={13} />}
          <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.68rem" }}>
            {testStatus === "sending" ? "Отправка..." : testStatus === "done" ? "Отправлено!" : testStatus === "error" ? "Ошибка вебхука" : "Тестовое уведомление"}
          </span>
        </button>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 border transition-all duration-300"
          style={{ borderColor: saved ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.08)", background: saved ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)", color: saved ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.3)" }}>
          {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
          <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.68rem" }}>
            {saved ? "Сохранено" : "Сохранить"}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN TAB COMPONENT
   ═══════════════════════════════════════════════ */

type SubTab = "entries" | "notifications";

export function BirthdaysTab() {
  const [subTab, setSubTab] = useState<SubTab>("entries");

  const allMerged = getAllBirthdays();
  const todayCount = allMerged.filter((p) => isBirthdayToday(p.birthday)).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.4rem" }}>
            Дни рождения
          </h2>
          {todayCount > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2.5 py-1 border"
              style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.07)" }}
            >
              <span style={{ fontSize: "0.7rem" }}>🎂</span>
              <span className="font-['Oswald'] text-[#f59e0b]/70 uppercase tracking-wider" style={{ fontSize: "0.62rem" }}>
                Сегодня {todayCount} ДР
              </span>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-['Russo_One'] text-[#9b2335]" style={{ fontSize: "1.4rem" }}>
              {allMerged.length}
            </p>
            <p className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.58rem" }}>
              Записей
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-0 border-b border-white/5 mb-6">
        {([
          { id: "entries", label: "Записи", icon: Calendar },
          { id: "notifications", label: "Уведомления", icon: Bell },
        ] as { id: SubTab; label: string; icon: typeof Calendar }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all duration-200 ${
              subTab === tab.id
                ? "border-[#9b2335] text-[#9b2335]"
                : "border-transparent text-white/25 hover:text-white/45"
            }`}
            style={{ marginBottom: "-1px" }}
          >
            <tab.icon size={13} strokeWidth={1.5} />
            <span className="font-['Oswald'] uppercase tracking-wider" style={{ fontSize: "0.68rem" }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {subTab === "entries" && <EntriesSection />}
          {subTab === "notifications" && <NotificationsSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
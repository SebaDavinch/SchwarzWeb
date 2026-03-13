import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Camera, Save, Eye, EyeOff, CheckCircle2, Shield,
  Calendar, PenLine, Cake, BadgeCheck, Briefcase,
} from "lucide-react";
import type { Account } from "../../hooks/useAuth";
import { ROLE_LABELS, ROLE_COLORS } from "../../hooks/useCabinetData";

interface Member {
  id: string;
  name: string;
  role: string;
  joinDate: string;
  active: boolean;
  badges?: string[];
}

interface Props {
  account: Account;
  updateAccount: (id: string, changes: Partial<Account>) => void;
}

function getMember(memberId: string): Member | null {
  try {
    const raw = localStorage.getItem("schwarz_admin_members");
    const arr: Member[] = raw ? JSON.parse(raw) : [];
    return arr.find((m) => m.id === memberId) ?? null;
  } catch {
    return null;
  }
}

/* ── helpers ── */
function getAge(birthday: string): number | null {
  if (!birthday) return null;
  const today = new Date();
  const bd = new Date(birthday);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

function getZodiac(birthday: string): string {
  if (!birthday) return "";
  const [, mm, dd] = birthday.split("-").map(Number);
  const signs: [number, number, string][] = [
    [1, 20, "Козерог"], [2, 19, "Водолей"], [3, 21, "Рыбы"], [4, 20, "Овен"],
    [5, 21, "Телец"], [6, 21, "Близнецы"], [7, 23, "Рак"], [8, 23, "Лев"],
    [9, 23, "Дева"], [10, 23, "Весы"], [11, 22, "Скорпион"], [12, 22, "Стрелец"],
    [12, 32, "Козерог"],
  ];
  for (const [m, d, sign] of signs) {
    if (mm === m && dd < d) return sign as string;
    if (mm === m && dd >= d) continue;
  }
  return "";
}

function getZodiacEmoji(sign: string): string {
  const map: Record<string, string> = {
    Козерог: "♑", Водолей: "♒", Рыбы: "♓", Овен: "♈", Телец: "♉",
    Близнецы: "♊", Рак: "♋", Лев: "♌", Дева: "♍", Весы: "♎",
    Скорпион: "♏", Стрелец: "♐",
  };
  return map[sign] ?? "";
}

/* ── Specializations ── */
export const SPECIALIZATIONS: { id: string; label: string; icon: string; desc: string; color: string }[] = [
  { id: "trucker",  label: "Дальнобойщик", icon: "🚛", desc: "Перевозки грузов на дальние расстояния",        color: "#f59e0b" },
  { id: "fisher",   label: "Рыбак",         icon: "🎣", desc: "Рыбные контракты и промысел",                   color: "#38bdf8" },
  { id: "miner",    label: "Шахтёр",        icon: "⛏️", desc: "Добыча ресурсов и работа на шахтах",           color: "#a78bfa" },
  { id: "delivery", label: "Доставщик",     icon: "📦", desc: "Товар со склада — доставка по точкам",         color: "#22c55e" },
];

/* ── Section header ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-white/30 uppercase tracking-[0.25em] mb-5 flex items-center gap-3"
      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
    >
      <span className="flex-1 h-px bg-white/5" />
      {children}
      <span className="flex-1 h-px bg-white/5" />
    </h3>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/20 uppercase tracking-wider min-w-[90px]"
        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.8rem", color: valueColor || "rgba(255,255,255,0.55)" }}>
        {value}
      </span>
    </div>
  );
}

export function CabinetProfile({ account, updateAccount }: Props) {
  const member = getMember(account.memberId);

  /* password */
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /* settings form */
  const [settingsForm, setSettingsForm] = useState({
    realName: account.realName ?? "",
    birthday: account.birthday ?? "",
    bio: account.bio ?? "",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const roleColor = member ? (ROLE_COLORS[member.role] ?? "#888899") : "#888899";
  const roleLabel = member ? (ROLE_LABELS[member.role] ?? member.role) : "—";

  const joinDate = member?.joinDate
    ? new Date(member.joinDate).toLocaleDateString("ru-RU", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";

  const age = account.birthday ? getAge(account.birthday) : null;
  const zodiac = account.birthday ? getZodiac(account.birthday) : "";
  const zodiacEmoji = getZodiacEmoji(zodiac);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateAccount(account.id, { avatarDataUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPwMsg({ ok: false, text: "Минимум 6 символов" });
      setTimeout(() => setPwMsg(null), 3000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "Пароли не совпадают" });
      setTimeout(() => setPwMsg(null), 3000);
      return;
    }
    updateAccount(account.id, { password: newPassword });
    setNewPassword(""); setConfirmPassword("");
    setPwMsg({ ok: true, text: "Пароль изменён!" });
    setTimeout(() => setPwMsg(null), 3000);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccount(account.id, {
      realName: settingsForm.realName.trim() || undefined,
      birthday: settingsForm.birthday || undefined,
      bio: settingsForm.bio.trim() || undefined,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const inputClass =
    "w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors";
  const inputStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" };
  const labelStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" };

  /* specializations */
  const specs: string[] = (account as any).specializations ?? [];
  const toggleSpec = (id: string) => {
    const next = specs.includes(id) ? specs.filter(s => s !== id) : [...specs, id];
    updateAccount(account.id, { specializations: next } as any);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ── IC Identity card ── */}
      <div>
        <SectionTitle>IC Личность</SectionTitle>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="border border-white/5 bg-white/[0.01] p-6"
        >
          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 border border-white/10 bg-[#0d0d15] overflow-hidden flex items-center justify-center">
                {account.avatarDataUrl ? (
                  <img src={account.avatarDataUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-white/10" strokeWidth={1} />
                )}
              </div>
              {/* Birthday candle overlay */}
              {account.birthday && (() => {
                const today = new Date();
                const bd = new Date(account.birthday);
                const isBday = today.getMonth() === bd.getMonth() && today.getDate() === bd.getDate();
                return isBday ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🎂</div>
                ) : null;
              })()}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#9b2335] hover:bg-[#b52a40] flex items-center justify-center transition-colors"
                title="Загрузить аватар"
              >
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white mb-1"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "1.15rem", letterSpacing: "0.03em" }}>
                {member?.name ?? "—"}
              </p>

              {/* Role */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-4"
                style={{ background: `${roleColor}12`, border: `1px solid ${roleColor}30` }}>
                <Shield size={10} strokeWidth={1.5} style={{ color: roleColor }} />
                <span className="uppercase tracking-widest"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem", color: roleColor }}>
                  {roleLabel}
                </span>
              </div>

              <div className="space-y-2">
                <InfoRow label="Логин" value={account.username} />
                <InfoRow label="В семье с" value={joinDate} />
                <InfoRow label="Статус"
                  value={member?.active !== false ? "Активен" : "Неактивен"}
                  valueColor={member?.active !== false ? "#22c55e" : "#ff3366"} />
                {account.realName && <InfoRow label="Имя игрока" value={account.realName} />}
                {age !== null && zodiac && (
                  <InfoRow
                    label="Возраст"
                    value={`${age} лет · ${zodiacEmoji} ${zodiac}`}
                  />
                )}
              </div>

              {account.bio && (
                <p className="mt-4 text-white/30 leading-relaxed border-t border-white/5 pt-3"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.75rem" }}>
                  {account.bio}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Specializations ── */}
      <div>
        <SectionTitle>Специализация в семье</SectionTitle>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          className="border border-white/5 bg-white/[0.01] p-6"
        >
          <p className="text-white/20 mb-5 leading-relaxed"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
            Выбери направления, в которых ты работаешь. Теги появятся в профильной карточке и помогут распределять контракты.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPECIALIZATIONS.map(sp => {
              const active = specs.includes(sp.id);
              return (
                <button
                  key={sp.id}
                  onClick={() => toggleSpec(sp.id)}
                  className="relative flex items-center gap-4 p-4 border text-left transition-all duration-200 group"
                  style={{
                    background: active ? `${sp.color}08` : "rgba(255,255,255,0.01)",
                    borderColor: active ? `${sp.color}40` : "rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: sp.color }} />
                  )}
                  <span className="text-2xl shrink-0">{sp.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="uppercase tracking-wider"
                      style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: "0.78rem",
                        color: active ? sp.color : "rgba(255,255,255,0.5)",
                      }}>
                      {sp.label}
                    </p>
                    <p className="text-white/20 mt-0.5"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
                      {sp.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {specs.length > 0 && (
            <p className="mt-4 text-white/20 flex items-center gap-2"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
              <CheckCircle2 size={12} className="text-[#22c55e]/50" />
              Выбрано: {specs.length} из {SPECIALIZATIONS.length}. Изменения сохраняются автоматически.
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Personal settings ── */}
      <div>
        <SectionTitle>Настройки профиля</SectionTitle>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="border border-white/5 bg-white/[0.01] p-6"
        >
          <form onSubmit={handleSettingsSave} className="space-y-5">
            {/* Real name */}
            <div>
              <label className="text-white/25 uppercase tracking-wider flex items-center gap-1.5 mb-2" style={labelStyle}>
                <BadgeCheck size={11} className="text-[#9b2335]/50" />
                Настоящее имя (RL)
              </label>
              <input
                value={settingsForm.realName}
                onChange={e => setSettingsForm(f => ({ ...f, realName: e.target.value }))}
                placeholder="Алексей / Alex"
                className={inputClass} style={inputStyle}
              />
              <p className="text-white/15 mt-1" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>
                Видно только лидерству. Имя по желанию — не обязательно настоящее.
              </p>
            </div>

            {/* Birthday */}
            <div>
              <label className="text-white/25 uppercase tracking-wider flex items-center gap-1.5 mb-2" style={labelStyle}>
                <Cake size={11} className="text-[#9b2335]/50" />
                Дата рождения
              </label>
              <input
                type="date"
                value={settingsForm.birthday}
                onChange={e => setSettingsForm(f => ({ ...f, birthday: e.target.value }))}
                className={inputClass} style={inputStyle}
                max={new Date().toISOString().split("T")[0]}
              />
              {settingsForm.birthday && (() => {
                const a = getAge(settingsForm.birthday);
                const z = getZodiac(settingsForm.birthday);
                const ze = getZodiacEmoji(z);
                return a !== null ? (
                  <p className="text-[#9b2335]/40 mt-1 flex items-center gap-2"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}>
                    <span>{a} лет</span>
                    {z && <><span>·</span><span>{ze} {z}</span></>}
                  </p>
                ) : null;
              })()}
              {/* Birthday visibility toggle */}
              <button
                type="button"
                onClick={() => updateAccount(account.id, { birthdayPublic: !account.birthdayPublic })}
                className="mt-2 flex items-center gap-2 transition-colors"
              >
                <div
                  className="w-4 h-4 border flex items-center justify-center transition-all"
                  style={{ borderColor: account.birthdayPublic ? "rgba(155,35,53,0.4)" : "rgba(255,255,255,0.12)", background: account.birthdayPublic ? "rgba(155,35,53,0.12)" : "transparent" }}
                >
                  {account.birthdayPublic && (
                    <div className="w-2 h-2 bg-[#9b2335]" />
                  )}
                </div>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem", color: account.birthdayPublic ? "rgba(155,35,53,0.6)" : "rgba(255,255,255,0.2)" }}>
                  {account.birthdayPublic ? "🌐 Видна публично (на сайте)" : "🔒 Внутренняя (только ЛК и администраторы)"}
                </span>
              </button>
            </div>

            {/* Bio */}
            <div>
              <label className="text-white/25 uppercase tracking-wider flex items-center gap-1.5 mb-2" style={labelStyle}>
                <PenLine size={11} className="text-[#9b2335]/50" />
                О себе (статус)
              </label>
              <textarea
                value={settingsForm.bio}
                onChange={e => setSettingsForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Пару слов о себе..."
                rows={2}
                maxLength={140}
                className={`${inputClass} resize-none`} style={inputStyle}
              />
              <p className="text-white/15 text-right mt-0.5"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.52rem" }}>
                {settingsForm.bio.length}/140
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>
                <Save size={13} />
                Сохранить
              </button>
              <AnimatePresence>
                {settingsSaved && (
                  <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[#22c55e]/70">
                    <CheckCircle2 size={14} />
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.7rem" }}>Сохранено!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>
      </div>

      {/* ── Password change ── */}
      <div>
        <SectionTitle>Смена пароля</SectionTitle>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="border border-white/5 bg-white/[0.01] p-6"
        >
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            {[
              { label: "Новый пароль", value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
              { label: "Подтверждение", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
            ].map(({ label, value, setter, show, toggle }) => (
              <div key={label}>
                <label className="text-white/25 uppercase tracking-wider block mb-2" style={labelStyle}>{label}</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={e => setter(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`} style={inputStyle}
                  />
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}

            <AnimatePresence>
              {pwMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`flex items-center gap-1.5 ${pwMsg.ok ? "text-[#22c55e]/70" : "text-[#ff3366]/70"}`}>
                  {pwMsg.ok ? <CheckCircle2 size={14} /> : null}
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>{pwMsg.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>
              <Save size={13} />Сохранить пароль
            </button>
          </form>
        </motion.div>
      </div>

      {/* ── Account meta ── */}
      <div className="border border-white/5 bg-white/[0.01] p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <InfoRow label="Аккаунт" value={account.username} />
          <InfoRow label="Создан" value={new Date(account.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          <span className="text-[#22c55e]/40 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>
            Активна
          </span>
        </div>
      </div>
    </div>
  );
}
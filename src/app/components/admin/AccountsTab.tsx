import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserCircle,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Copy,
  CheckCircle2,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth, generatePassword, generateUsername, type Account } from "../../hooks/useAuth";
import { ROLE_LABELS, ROLE_COLORS } from "../../hooks/useCabinetData";

interface Member {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

function getMembers(): Member[] {
  try {
    const raw = localStorage.getItem("schwarz_admin_members");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function AccountsTab() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAuth();
  const members = getMembers();

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const emptyForm = { memberId: "", username: "", password: "" };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowAdd(false);
  };

  const handleMemberSelect = (memberId: string) => {
    const m = members.find((m) => m.id === memberId);
    if (!m) return;
    setForm((f) => ({
      ...f,
      memberId,
      username: f.username || generateUsername(m.name),
    }));
  };

  const handleGeneratePassword = () => {
    setForm((f) => ({ ...f, password: generatePassword() }));
  };

  const handleAdd = () => {
    if (!form.memberId || !form.username || !form.password) return;
    addAccount({
      memberId: form.memberId,
      username: form.username,
      password: form.password,
    });
    resetForm();
  };

  const handleEdit = (acc: Account) => {
    setEditId(acc.id);
    setForm({
      memberId: acc.memberId,
      username: acc.username,
      password: acc.password,
    });
    setShowAdd(true);
  };

  const handleSaveEdit = () => {
    if (!editId) return;
    updateAccount(editId, {
      memberId: form.memberId,
      username: form.username,
      password: form.password,
    });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить аккаунт?")) {
      deleteAccount(id);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const linkedMemberIds = new Set(accounts.map((a) => a.memberId));

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2
          className="text-white"
          style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.5rem" }}
        >
          Аккаунты ЛК
        </h2>
        <button
          onClick={() => {
            setShowAdd(!showAdd);
            if (showAdd) resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
        >
          <Plus size={14} />
          Создать аккаунт
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Member select */}
                <div>
                  <label
                    className="text-white/30 uppercase tracking-wider block mb-2"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
                  >
                    Участник состава
                  </label>
                  <select
                    value={form.memberId}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
                  >
                    <option value="">— выберите участника —</option>
                    {members.map((m) => (
                      <option
                        key={m.id}
                        value={m.id}
                        disabled={linkedMemberIds.has(m.id) && m.id !== form.memberId}
                      >
                        {m.name} ({ROLE_LABELS[m.role] ?? m.role})
                        {linkedMemberIds.has(m.id) && m.id !== form.memberId
                          ? " — занят"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Username */}
                <div>
                  <label
                    className="text-white/30 uppercase tracking-wider block mb-2"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
                  >
                    Логин
                  </label>
                  <input
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="madara.schwarz"
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
                  />
                </div>

                {/* Password */}
                <div className="sm:col-span-2">
                  <label
                    className="text-white/30 uppercase tracking-wider block mb-2"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
                  >
                    Пароль
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      placeholder="Пароль"
                      className="flex-1 bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors font-mono"
                      style={{ fontSize: "0.85rem" }}
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="px-3 py-2.5 border border-white/8 hover:border-[#9b2335]/30 text-white/40 hover:text-[#9b2335]/70 transition-all flex items-center gap-1.5"
                      title="Сгенерировать пароль"
                    >
                      <RefreshCw size={13} />
                      <span
                        className="uppercase tracking-wider hidden sm:inline"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "0.6rem",
                        }}
                      >
                        Авто
                      </span>
                    </button>
                    {form.password && (
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(form.password, "form_password")
                        }
                        className="px-3 py-2.5 border border-white/8 hover:border-[#9b2335]/30 text-white/40 hover:text-[#9b2335]/70 transition-all"
                        title="Скопировать"
                      >
                        {copiedId === "form_password" ? (
                          <CheckCircle2 size={13} className="text-[#22c55e]" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={editId ? handleSaveEdit : handleAdd}
                  disabled={!form.memberId || !form.username || !form.password}
                  className="flex items-center gap-2 px-5 py-2 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all disabled:opacity-40"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
                >
                  <Save size={13} />
                  {editId ? "Сохранить" : "Создать"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-2 text-white/30 border border-white/8 hover:border-white/15 uppercase tracking-wider transition-all"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accounts list */}
      {accounts.length === 0 ? (
        <div className="border border-white/5 bg-white/[0.01] p-12 text-center">
          <UserCircle size={32} className="text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p
            className="text-white/20 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}
          >
            Нет аккаунтов
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => {
            const m = getMemberById(acc.memberId);
            const roleColor = m ? (ROLE_COLORS[m.role] ?? "#888899") : "#888899";
            const roleLabel = m ? (ROLE_LABELS[m.role] ?? m.role) : "—";

            return (
              <div
                key={acc.id}
                className="border border-white/5 bg-white/[0.01] p-4 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 shrink-0 border border-white/10 bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                    {acc.avatarDataUrl ? (
                      <img
                        src={acc.avatarDataUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle
                        size={20}
                        className="text-white/20"
                        strokeWidth={1}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p
                        className="text-white/70"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "0.92rem",
                        }}
                      >
                        {m?.name ?? "(удалён из состава)"}
                      </p>
                      {m && (
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5"
                          style={{
                            background: `${roleColor}12`,
                            border: `1px solid ${roleColor}25`,
                          }}
                        >
                          <span
                            className="uppercase tracking-widest"
                            style={{
                              fontFamily: "'Oswald', sans-serif",
                              fontSize: "0.5rem",
                              color: roleColor,
                            }}
                          >
                            {roleLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-white/30">
                        <LinkIcon size={11} strokeWidth={1.5} />
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                          }}
                        >
                          {acc.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-white/20 font-mono"
                          style={{ fontSize: "0.72rem" }}
                        >
                          {acc.password}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(acc.password, `pw_${acc.id}`)
                          }
                          className="text-white/15 hover:text-white/40 transition-colors"
                          title="Скопировать пароль"
                        >
                          {copiedId === `pw_${acc.id}` ? (
                            <CheckCircle2
                              size={12}
                              className="text-[#22c55e]"
                            />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>

                      <span
                        className="text-white/15"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "0.6rem",
                        }}
                      >
                        Создан:{" "}
                        {new Date(acc.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(acc)}
                      className="p-2 text-white/20 hover:text-[#f59e0b]/70 transition-colors"
                      title="Редактировать"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-2 text-white/20 hover:text-[#ff3366]/70 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p
        className="text-white/10 tracking-wide mt-6 text-center uppercase"
        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
      >
        Всего аккаунтов: {accounts.length} ·{" "}
        Привязано к составу:{" "}
        {accounts.filter((a) => members.some((m) => m.id === a.memberId)).length}
      </p>
    </div>
  );
}

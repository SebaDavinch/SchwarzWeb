import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardList, Plus, Trash2, Edit3, Save, CheckCircle2, XCircle, Play, Timer, Users,
} from "lucide-react";
import { useCabinetData, ROLE_LABELS, type Contract } from "../../hooks/useCabinetData";

interface Member { id: string; name: string; role: string; active: boolean; }
function getMembers(): Member[] {
  try { const r = localStorage.getItem("schwarz_admin_members"); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

const CONTRACT_TYPES = [
  { id: "fishing", label: "🎣 Рыбалка" },
  { id: "delivery", label: "🚚 Доставка" },
  { id: "security", label: "🛡️ Охрана" },
  { id: "heist", label: "💰 Ограбление" },
  { id: "production", label: "⚗️ Производство" },
  { id: "other", label: "📋 Прочее" },
];

const STATUS_OPTIONS: { id: Contract["status"]; label: string; color: string }[] = [
  { id: "open", label: "Открыт", color: "#22c55e" },
  { id: "in_progress", label: "В процессе", color: "#f59e0b" },
  { id: "completed", label: "Завершён", color: "#888899" },
  { id: "failed", label: "Провалён", color: "#ff3366" },
];

const ROLES = ["academy", "main", "old", "close", "dep_owner", "owner"];

const emptyForm = {
  title: "", description: "", type: "other",
  reward: "", slots: 4, minRole: "" as string,
  estimatedMinutes: 60, status: "open" as Contract["status"],
};

export function ContractsAdminTab() {
  const { contracts, addContract, updateContract, deleteContract, closeContract } = useCabinetData();
  const members = getMembers();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [closeModal, setCloseModal] = useState<string | null>(null);
  const [selectedClosers, setSelectedClosers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = {
      title: form.title.trim(), description: form.description.trim(),
      type: form.type, reward: form.reward.trim() || undefined,
      slots: form.slots, minRole: form.minRole || undefined,
      estimatedMinutes: form.estimatedMinutes || undefined,
      status: form.status,
    };
    if (editId) {
      updateContract(editId, data);
    } else {
      addContract(data);
    }
    resetForm();
  };

  const startEdit = (c: Contract) => {
    setEditId(c.id);
    setForm({
      title: c.title, description: c.description, type: c.type,
      reward: c.reward ?? "", slots: c.slots, minRole: c.minRole ?? "",
      estimatedMinutes: c.estimatedMinutes ?? 60, status: c.status,
    });
    setShowForm(true);
  };

  const handleStatusChange = (id: string, status: Contract["status"]) => {
    if (status === "completed") {
      setCloseModal(id);
      setSelectedClosers([]);
    } else {
      updateContract(id, {
        status,
        startedAt: status === "in_progress" ? new Date().toISOString() : undefined,
      });
    }
  };

  const handleCloseContract = () => {
    if (!closeModal) return;
    closeContract(closeModal, selectedClosers);
    setCloseModal(null);
    setSelectedClosers([]);
  };

  const toggleCloser = (id: string) => {
    setSelectedClosers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filtered = filterStatus === "all" ? contracts : contracts.filter(c => c.status === filterStatus);

  const fieldClass = "w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors";
  const fieldStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" };
  const labelStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-white" style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.5rem" }}>Контракты</h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
          <Plus size={14} /> Новый контракт
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ id: "all", label: "Все" }, ...STATUS_OPTIONS].map(s => (
          <button key={s.id} onClick={() => setFilterStatus(s.id)}
            className="px-3 py-1.5 uppercase tracking-wider transition-all"
            style={{
              fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem",
              background: filterStatus === s.id ? "#9b233515" : "rgba(255,255,255,0.02)",
              border: `1px solid ${filterStatus === s.id ? "#9b233540" : "rgba(255,255,255,0.06)"}`,
              color: filterStatus === s.id ? "#9b2335" : "rgba(255,255,255,0.35)",
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Название</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ночная рыбалка" className={fieldClass} style={fieldStyle} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Описание</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Подробности задачи..." rows={2}
                    className={`${fieldClass} resize-none`} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Тип</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className={fieldClass} style={fieldStyle}>
                    {CONTRACT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Награда</label>
                  <input value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))}
                    placeholder="$25,000" className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Слотов (участников)</label>
                  <input type="number" min={1} max={20} value={form.slots}
                    onChange={e => setForm(f => ({ ...f, slots: parseInt(e.target.value) || 1 }))}
                    className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Примерное время (мин)</label>
                  <input type="number" min={1} value={form.estimatedMinutes}
                    onChange={e => setForm(f => ({ ...f, estimatedMinutes: parseInt(e.target.value) || 60 }))}
                    className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Мин. ранг (необязательно)</label>
                  <select value={form.minRole} onChange={e => setForm(f => ({ ...f, minRole: e.target.value }))}
                    className={fieldClass} style={fieldStyle}>
                    <option value="">— любой —</option>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Статус</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Contract["status"] }))}
                    className={fieldClass} style={fieldStyle}>
                    {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={!form.title.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all disabled:opacity-40"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
                  <Save size={13} />{editId ? "Сохранить" : "Создать"}
                </button>
                <button onClick={resetForm} className="px-5 py-2 text-white/30 border border-white/8 hover:border-white/15 uppercase tracking-wider transition-all"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>Отмена</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contracts */}
      <div className="space-y-3">
        {filtered.map(c => {
          const sc = STATUS_OPTIONS.find(s => s.id === c.status);
          return (
            <div key={c.id} className="border border-white/5 bg-white/[0.01] p-4 hover:border-white/10 transition-all group">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white/70" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.92rem" }}>{c.title}</p>
                    <span className="px-1.5 py-0.5 uppercase tracking-wider"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem", color: sc?.color, background: `${sc?.color}12`, border: `1px solid ${sc?.color}30` }}>
                      {sc?.label}
                    </span>
                  </div>
                  <p className="text-white/25 mb-2" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>{c.description}</p>
                  <div className="flex flex-wrap gap-3 text-white/25" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.62rem" }}>
                    <div className="flex items-center gap-1"><Users size={11} />{c.participants.length}/{c.slots}</div>
                    {c.reward && <span className="text-[#22c55e]/50">{c.reward}</span>}
                    {c.estimatedMinutes && <span>~{c.estimatedMinutes} мин</span>}
                    {c.closedBy && c.closedBy.length > 0 && <span className="text-[#22c55e]/50">Закрыли: {c.closedBy.length} чел.</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {/* Status change buttons */}
                  {c.status === "open" && (
                    <button onClick={() => handleStatusChange(c.id, "in_progress")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[#f59e0b]/70 border border-[#f59e0b]/20 hover:border-[#f59e0b]/40 transition-all uppercase tracking-wider"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>
                      <Play size={10} />Начать
                    </button>
                  )}
                  {(c.status === "open" || c.status === "in_progress") && (
                    <button onClick={() => handleStatusChange(c.id, "completed")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[#22c55e]/70 border border-[#22c55e]/20 hover:border-[#22c55e]/40 transition-all uppercase tracking-wider"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>
                      <CheckCircle2 size={10} />Закрыть
                    </button>
                  )}
                  {c.status !== "failed" && c.status !== "completed" && (
                    <button onClick={() => updateContract(c.id, { status: "failed" })}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[#ff3366]/70 border border-[#ff3366]/20 hover:border-[#ff3366]/40 transition-all uppercase tracking-wider"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>
                      <XCircle size={10} />Провал
                    </button>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(c)} className="p-1.5 text-white/20 hover:text-[#f59e0b]/70 transition-colors"><Edit3 size={13} /></button>
                    <button onClick={() => confirm("Удалить?") && deleteContract(c.id)} className="p-1.5 text-white/20 hover:text-[#ff3366]/70 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-white/5 p-12 text-center">
          <ClipboardList size={32} className="text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p className="text-white/20 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>Нет контрактов</p>
        </div>
      )}

      {/* Close modal */}
      <AnimatePresence>
        {closeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#0d0d15] border border-white/8 p-6">
              <h3 className="text-white mb-2" style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.1rem" }}>Кто закрыл контракт?</h3>
              <p className="text-white/30 mb-5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>Выберите участников — они получат достижения</p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto mb-5">
                {members.filter(m => m.active).map(m => {
                  const checked = selectedClosers.includes(m.id);
                  return (
                    <button key={m.id} onClick={() => toggleCloser(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 border transition-all text-left ${checked ? "border-[#9b2335]/30 bg-[#9b2335]/8 text-[#9b2335]/80" : "border-white/5 text-white/40 hover:border-white/10"}`}>
                      <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${checked ? "border-[#9b2335]/50 bg-[#9b2335]/20" : "border-white/20"}`}>
                        {checked && <CheckCircle2 size={9} className="text-[#9b2335]" />}
                      </div>
                      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.82rem" }}>{m.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button onClick={handleCloseContract}
                  className="flex-1 py-2.5 bg-[#22c55e]/80 hover:bg-[#22c55e] text-[#0a0a0f] uppercase tracking-wider transition-all"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>
                  <CheckCircle2 size={13} className="inline mr-1.5" />Подтвердить
                </button>
                <button onClick={() => setCloseModal(null)}
                  className="px-4 py-2.5 border border-white/8 text-white/30 uppercase tracking-wider transition-all hover:border-white/20"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>Отмена</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

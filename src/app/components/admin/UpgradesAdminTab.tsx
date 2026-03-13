import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Plus, Trash2, Edit3, Save } from "lucide-react";
import { useCabinetData, type Upgrade } from "../../hooks/useCabinetData";

const STATUS_OPTIONS: { id: Upgrade["status"]; label: string; color: string }[] = [
  { id: "unlocked", label: "Открыто", color: "#22c55e" },
  { id: "planned", label: "Планируется", color: "#f59e0b" },
  { id: "locked", label: "Заблокировано", color: "#888899" },
];

const emptyForm = {
  title: "", description: "", icon: "⭐", category: "",
  status: "locked" as Upgrade["status"], cost: "", order: 0,
};

export function UpgradesAdminTab() {
  const { upgrades, addUpgrade, updateUpgrade, deleteUpgrade } = useCabinetData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState("all");

  const categories = [...new Set(upgrades.map(u => u.category))];
  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = {
      title: form.title.trim(), description: form.description.trim(),
      icon: form.icon.trim() || "⭐", category: form.category.trim() || "Прочее",
      status: form.status, cost: form.cost.trim() || undefined, order: form.order,
    };
    if (editId) { updateUpgrade(editId, data); }
    else { addUpgrade(data); }
    resetForm();
  };

  const startEdit = (u: Upgrade) => {
    setEditId(u.id);
    setForm({ title: u.title, description: u.description, icon: u.icon,
      category: u.category, status: u.status, cost: u.cost ?? "", order: u.order });
    setShowForm(true);
  };

  const cycleStatus = (u: Upgrade) => {
    const order: Upgrade["status"][] = ["locked", "planned", "unlocked"];
    const next = order[(order.indexOf(u.status) + 1) % order.length];
    updateUpgrade(u.id, { status: next });
  };

  const filtered = filterCat === "all" ? upgrades : upgrades.filter(u => u.category === filterCat);

  const fieldClass = "w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors";
  const fieldStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" };
  const labelStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-white" style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.5rem" }}>Улучшения</h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
          <Plus size={14} /> Добавить
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...categories].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className="px-3 py-1.5 uppercase tracking-wider transition-all"
            style={{
              fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem",
              background: filterCat === cat ? "#9b233515" : "rgba(255,255,255,0.02)",
              border: `1px solid ${filterCat === cat ? "#9b233540" : "rgba(255,255,255,0.06)"}`,
              color: filterCat === cat ? "#9b2335" : "rgba(255,255,255,0.35)",
            }}>
            {cat === "all" ? "Все" : cat}
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
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Название</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Discord-сервер" className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Иконка (эмодзи)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="💬" className={fieldClass} style={fieldStyle} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Описание</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Краткое описание улучшения" className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Категория</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="Коммуникации" list="cats"
                    className={fieldClass} style={fieldStyle} />
                  <datalist id="cats">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Статус</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Upgrade["status"] }))}
                    className={fieldClass} style={fieldStyle}>
                    {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Стоимость</label>
                  <input value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                    placeholder="$5,000,000" className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Порядок</label>
                  <input type="number" min={0} value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                    className={fieldClass} style={fieldStyle} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={!form.title.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all disabled:opacity-40"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
                  <Save size={13} />{editId ? "Сохранить" : "Добавить"}
                </button>
                <button onClick={resetForm} className="px-5 py-2 text-white/30 border border-white/8 hover:border-white/15 uppercase tracking-wider transition-all"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>Отмена</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.sort((a, b) => a.order - b.order).map(u => {
          const sc = STATUS_OPTIONS.find(s => s.id === u.status)!;
          return (
            <div key={u.id} className="border border-white/5 bg-white/[0.01] p-4 hover:border-white/10 transition-all group flex items-center gap-4">
              <span className="text-2xl shrink-0">{u.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white/70 truncate" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.9rem" }}>{u.title}</p>
                  <span className="text-white/20 uppercase tracking-wider shrink-0" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem" }}>{u.category}</span>
                </div>
                <p className="text-white/25 truncate" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>{u.description}</p>
                {u.cost && <p className="text-[#f59e0b]/40 mt-0.5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>{u.cost}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => cycleStatus(u)}
                  className="px-2.5 py-1 uppercase tracking-wider transition-all"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem", color: sc.color, background: `${sc.color}12`, border: `1px solid ${sc.color}30` }}
                  title="Нажмите чтобы изменить статус">
                  {sc.label}
                </button>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(u)} className="p-1.5 text-white/20 hover:text-[#f59e0b]/70 transition-colors"><Edit3 size={12} /></button>
                  <button onClick={() => confirm("Удалить?") && deleteUpgrade(u.id)} className="p-1.5 text-white/20 hover:text-[#ff3366]/70 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-white/5 p-12 text-center">
          <TrendingUp size={32} className="text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p className="text-white/20 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>Нет улучшений</p>
        </div>
      )}
    </div>
  );
}

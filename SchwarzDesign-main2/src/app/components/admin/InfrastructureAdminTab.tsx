import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Plus, Trash2, Edit3, Save } from "lucide-react";
import { useCabinetData, type InfrastructureItem } from "../../hooks/useCabinetData";

const TYPES: { id: InfrastructureItem["type"]; label: string }[] = [
  { id: "house", label: "Особняк" },
  { id: "office", label: "Офис" },
  { id: "warehouse", label: "Склад" },
  { id: "garage", label: "Гараж" },
  { id: "other", label: "Прочее" },
];

const STATUS_OPTIONS: { id: InfrastructureItem["status"]; label: string; color: string }[] = [
  { id: "active", label: "Активен", color: "#22c55e" },
  { id: "planned", label: "Планируется", color: "#f59e0b" },
  { id: "lost", label: "Утрачен", color: "#ff3366" },
];

const emptyForm = {
  title: "", type: "house" as InfrastructureItem["type"],
  description: "", address: "", imageUrl: "",
  status: "planned" as InfrastructureItem["status"],
};

export function InfrastructureAdminTab() {
  const { infrastructure, addInfrastructure, updateInfrastructure, deleteInfrastructure } = useCabinetData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = {
      title: form.title.trim(), type: form.type,
      description: form.description.trim(),
      address: form.address.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      status: form.status,
    };
    if (editId) { updateInfrastructure(editId, data); }
    else { addInfrastructure(data); }
    resetForm();
  };

  const startEdit = (item: InfrastructureItem) => {
    setEditId(item.id);
    setForm({
      title: item.title, type: item.type, description: item.description,
      address: item.address ?? "", imageUrl: item.imageUrl ?? "", status: item.status,
    });
    setShowForm(true);
  };

  const cycleStatus = (item: InfrastructureItem) => {
    const order: InfrastructureItem["status"][] = ["planned", "active", "lost"];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    updateInfrastructure(item.id, { status: next });
  };

  const fieldClass = "w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors";
  const fieldStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" };
  const labelStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-white" style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.5rem" }}>Инфраструктура</h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
          <Plus size={14} /> Добавить объект
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {STATUS_OPTIONS.map(s => (
          <div key={s.id} className="border border-white/5 bg-white/[0.01] p-3 text-center">
            <p style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.5rem", color: s.color }}>
              {infrastructure.filter(i => i.status === s.id).length}
            </p>
            <p className="text-white/25 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.52rem" }}>{s.label}</p>
          </div>
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
                    placeholder="Штаб-квартира" className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Тип</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as InfrastructureItem["type"] }))}
                    className={fieldClass} style={fieldStyle}>
                    {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Описание</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Описание объекта..." rows={2}
                    className={`${fieldClass} resize-none`} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Адрес</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Strawberry, Los Santos" className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Статус</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as InfrastructureItem["status"] }))}
                    className={fieldClass} style={fieldStyle}>
                    {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>URL фото (необязательно)</label>
                  <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://..." className={fieldClass} style={fieldStyle} />
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
      {infrastructure.length === 0 ? (
        <div className="border border-white/5 p-12 text-center">
          <Building2 size={32} className="text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p className="text-white/20 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>Нет объектов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {infrastructure.map(item => {
            const sc = STATUS_OPTIONS.find(s => s.id === item.status)!;
            const typeLabel = TYPES.find(t => t.id === item.type)?.label ?? item.type;
            return (
              <div key={item.id} className="border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all group overflow-hidden">
                {item.imageUrl && (
                  <div className="h-24 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                  </div>
                )}
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white/70" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.9rem" }}>{item.title}</p>
                      <span className="text-white/20 uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem" }}>{typeLabel}</span>
                    </div>
                    <p className="text-white/25 mb-2 truncate" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>{item.description}</p>
                    {item.address && <p className="text-white/15" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>{item.address}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button onClick={() => cycleStatus(item)}
                      className="px-2 py-1 uppercase tracking-wider transition-all"
                      style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem", color: sc.color, background: `${sc.color}12`, border: `1px solid ${sc.color}30` }}>
                      {sc.label}
                    </button>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="p-1.5 text-white/20 hover:text-[#f59e0b]/70 transition-colors"><Edit3 size={12} /></button>
                      <button onClick={() => confirm("Удалить?") && deleteInfrastructure(item.id)} className="p-1.5 text-white/20 hover:text-[#ff3366]/70 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

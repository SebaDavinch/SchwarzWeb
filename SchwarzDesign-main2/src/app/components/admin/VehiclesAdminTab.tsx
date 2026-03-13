import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Car, Plus, Trash2, Edit3, Save } from "lucide-react";
import { useCabinetData, ROLE_LABELS, ROLE_COLORS, type Vehicle } from "../../hooks/useCabinetData";

const ROLES = ["academy", "main", "old", "close", "dep_owner", "owner"];
const CATEGORIES = ["Спорткар", "Суперкар", "Внедорожник", "Седан", "Мышца", "Вэн", "Мотоцикл", "Вертолёт", "Самолёт", "Лодка", "Прочее"];
const STATUSES: { id: Vehicle["status"]; label: string }[] = [
  { id: "available", label: "Доступен" },
  { id: "in_use", label: "Используется" },
  { id: "repair", label: "На ТО" },
];

const statusColors = { available: "#22c55e", in_use: "#f59e0b", repair: "#ff3366" };

const emptyForm = {
  name: "", model: "", category: "Спорткар",
  imageUrl: "", minRole: "academy", status: "available" as Vehicle["status"],
  licensePlate: "",
};

export function VehiclesAdminTab() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useCabinetData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const data = {
      name: form.name.trim(),
      model: form.model.trim() || form.name.trim(),
      category: form.category,
      imageUrl: form.imageUrl.trim() || undefined,
      minRole: form.minRole,
      status: form.status,
      licensePlate: form.licensePlate.trim() || undefined,
    };
    if (editId) {
      updateVehicle(editId, data);
    } else {
      addVehicle(data);
    }
    resetForm();
  };

  const startEdit = (v: Vehicle) => {
    setEditId(v.id);
    setForm({
      name: v.name, model: v.model, category: v.category,
      imageUrl: v.imageUrl ?? "", minRole: v.minRole, status: v.status,
      licensePlate: v.licensePlate ?? "",
    });
    setShowForm(true);
  };

  const fieldClass = "w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors";
  const fieldStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" };
  const labelStyle = { fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-white" style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.5rem" }}>Транспорт</h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#9b2335] hover:bg-[#b52a40] text-white uppercase tracking-wider transition-all"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
          <Plus size={14} /> Добавить
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Название</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Pegassi Infernus" className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Модель (GTA)</label>
                  <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    placeholder="Infernus" className={fieldClass} style={fieldStyle} />
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Категория</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={fieldClass} style={fieldStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Мин. ранг</label>
                  <select value={form.minRole} onChange={e => setForm(f => ({ ...f, minRole: e.target.value }))}
                    className={fieldClass} style={fieldStyle}>
                    {ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Статус</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Vehicle["status"] }))}
                    className={fieldClass} style={fieldStyle}>
                    {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>Номерной знак</label>
                  <input value={form.licensePlate} onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value }))}
                    placeholder="AB 123 CD" className={fieldClass} style={fieldStyle} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-white/30 uppercase tracking-wider block mb-2" style={labelStyle}>URL фото (необязательно)</label>
                  <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://..." className={fieldClass} style={fieldStyle} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={!form.name.trim()}
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

      {vehicles.length === 0 ? (
        <div className="border border-white/5 p-12 text-center">
          <Car size={32} className="text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p className="text-white/20 uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>Нет транспорта</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vehicles.map(v => {
            const rc = ROLE_COLORS[v.minRole] ?? "#888899";
            const rl = ROLE_LABELS[v.minRole] ?? v.minRole;
            const sc = statusColors[v.status];
            return (
              <div key={v.id} className="border border-white/5 bg-white/[0.01] p-4 group hover:border-white/10 transition-all flex gap-4">
                {v.imageUrl && (
                  <div className="w-20 h-14 shrink-0 overflow-hidden">
                    <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover opacity-60" />
                  </div>
                )}
                {!v.imageUrl && (
                  <div className="w-20 h-14 shrink-0 bg-[#0d0d15] flex items-center justify-center">
                    <Car size={20} className="text-white/10" strokeWidth={1} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white/70" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.9rem" }}>{v.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/25 uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>{v.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem", color: rc }}>{rl}+</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem", color: sc }}>{STATUSES.find(s => s.id === v.status)?.label}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => startEdit(v)} className="p-1.5 text-white/20 hover:text-[#f59e0b]/70 transition-colors"><Edit3 size={13} /></button>
                      <button onClick={() => confirm("Удалить?") && deleteVehicle(v.id)} className="p-1.5 text-white/20 hover:text-[#ff3366]/70 transition-colors"><Trash2 size={13} /></button>
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

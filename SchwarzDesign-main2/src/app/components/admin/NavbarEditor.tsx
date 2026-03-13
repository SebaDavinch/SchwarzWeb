import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, Edit3, Save, X, Eye, EyeOff,
  ChevronUp, ChevronDown, GripVertical, ExternalLink,
} from "lucide-react";
import { NavItem, defaultNavItems } from "../../hooks/useAdminData";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function NavbarEditor({
  navItems,
  setNavItems,
}: {
  navItems: NavItem[];
  setNavItems: (items: NavItem[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", path: "" });

  const resetForm = () => setForm({ label: "", path: "" });

  const handleAdd = () => {
    if (!form.label.trim() || !form.path.trim()) return;
    const path = form.path.startsWith("/") ? form.path : `/${form.path}`;
    setNavItems([...navItems, { id: generateId(), label: form.label.trim(), path, visible: true, isCustom: true }]);
    resetForm();
    setShowAdd(false);
  };

  const startEdit = (item: NavItem) => {
    setEditId(item.id);
    setForm({ label: item.label, path: item.path });
  };

  const saveEdit = () => {
    if (!editId) return;
    const path = form.path.startsWith("/") ? form.path : `/${form.path}`;
    setNavItems(navItems.map((n) => (n.id === editId ? { ...n, label: form.label.trim() || n.label, path } : n)));
    setEditId(null);
    resetForm();
  };

  const deleteItem = (id: string) => setNavItems(navItems.filter((n) => n.id !== id));

  const toggleVisibility = (id: string) => {
    setNavItems(navItems.map((n) => (n.id === id ? { ...n, visible: !n.visible } : n)));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= navItems.length) return;
    const arr = [...navItems];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setNavItems(arr);
  };

  const resetToDefault = () => {
    if (confirm("Сбросить навигацию к начальной конфигурации?")) {
      setNavItems([...defaultNavItems]);
    }
  };

  const isFormOpen = showAdd || editId;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1.3rem" }}>
            Навигация
          </h3>
          <p className="font-['Oswald'] text-white/20 tracking-wide mt-1" style={{ fontSize: "0.7rem" }}>
            Управление пунктами меню · Перетаскивайте для сортировки
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetToDefault}
            className="px-3 py-2 font-['Oswald'] uppercase tracking-wider text-white/20 border border-white/8 hover:border-white/15 transition-all"
            style={{ fontSize: "0.65rem" }}
          >
            Сброс
          </button>
          <button
            onClick={() => { setShowAdd(!showAdd); setEditId(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
            style={{ fontSize: "0.72rem" }}
          >
            <Plus size={14} />
            Добавить
          </button>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    Название
                  </label>
                  <input
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Новая страница"
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    Путь (URL)
                  </label>
                  <input
                    value={form.path}
                    onChange={(e) => setForm({ ...form, path: e.target.value })}
                    placeholder="/new-page"
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-mono tracking-wide px-3 py-2 outline-none transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editId ? saveEdit : handleAdd}
                  className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all flex items-center gap-2"
                  style={{ fontSize: "0.72rem" }}
                >
                  <Save size={14} />
                  {editId ? "Сохранить" : "Добавить"}
                </button>
                <button
                  onClick={() => { setShowAdd(false); setEditId(null); resetForm(); }}
                  className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
                  style={{ fontSize: "0.72rem" }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-1">
        {navItems.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 border transition-all duration-300 group ${
              item.visible
                ? "border-white/5 bg-white/[0.01]"
                : "border-white/[0.02] bg-white/[0.003] opacity-40"
            }`}
          >
            <GripVertical size={14} className="text-white/10 shrink-0" />

            <div className="flex-1 min-w-0 flex items-center gap-3">
              <span className="font-['Oswald'] text-white/60 tracking-wide truncate" style={{ fontSize: "0.82rem" }}>
                {item.label}
              </span>
              <span className="font-mono text-white/15 tracking-wide truncate hidden sm:inline" style={{ fontSize: "0.65rem" }}>
                {item.path}
              </span>
              {item.isCustom && (
                <span
                  className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider border border-[#f59e0b]/15 bg-[#f59e0b]/5 text-[#f59e0b]/40 shrink-0"
                  style={{ fontSize: "0.48rem" }}
                >
                  Custom
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => moveItem(idx, -1)}
                disabled={idx === 0}
                className="text-white/15 hover:text-white/40 p-1 transition-colors disabled:opacity-20"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveItem(idx, 1)}
                disabled={idx === navItems.length - 1}
                className="text-white/15 hover:text-white/40 p-1 transition-colors disabled:opacity-20"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => toggleVisibility(item.id)}
                className="text-white/15 hover:text-white/40 p-1 transition-colors"
                title={item.visible ? "Скрыть" : "Показать"}
              >
                {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => startEdit(item)} className="text-white/15 hover:text-[#f59e0b]/60 p-1 transition-colors">
                <Edit3 size={14} />
              </button>
              {item.isCustom && (
                <button onClick={() => deleteItem(item.id)} className="text-white/15 hover:text-[#ff3366]/60 p-1 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="font-['Oswald'] text-white/10 tracking-wide mt-4 text-center" style={{ fontSize: "0.65rem" }}>
        Видимых: {navItems.filter((n) => n.visible).length} из {navItems.length}
      </p>
    </div>
  );
}
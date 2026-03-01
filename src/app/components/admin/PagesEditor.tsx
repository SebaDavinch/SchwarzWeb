import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, Edit3, Save, X, Eye, EyeOff,
  FileText, Code, Monitor, Undo2, CheckCircle2,
} from "lucide-react";
import { CustomPage } from "../../hooks/useAdminData";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ═══════════════════════════════════════════════
   BUILT-IN PAGES — editable sections
   ═══════════════════════════════════════════════ */

interface BuiltInPage {
  id: string;
  name: string;
  path: string;
  sections: { key: string; label: string; hint: string }[];
}

const builtInPages: BuiltInPage[] = [
  {
    id: "home",
    name: "Главная",
    path: "/",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для главной страницы" },
    ],
  },
  {
    id: "about",
    name: "О нас",
    path: "/about",
    sections: [
      { key: "story_p1", label: "История — абзац 1", hint: "Основной первый абзац страницы 'О нас'" },
      { key: "story_p2", label: "История — абзац 2", hint: "Основной второй абзац страницы 'О нас'" },
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы 'О нас'" },
    ],
  },
  {
    id: "history",
    name: "История",
    path: "/history",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы истории" },
    ],
  },
  {
    id: "current-leadership",
    name: "Текущая лидерка",
    path: "/current-leadership",
    sections: [
      { key: "hero_title", label: "Hero заголовок", hint: "Главный заголовок страницы" },
      { key: "hero_desc", label: "Hero описание", hint: "Подзаголовок/описание в hero-блоке" },
      { key: "status_label", label: "Статус", hint: "Текст бейджа статуса (например: На паузе)" },
      { key: "activities_title", label: "Заголовок секции", hint: "Заголовок блока активностей" },
      { key: "activities_desc", label: "Описание секции", hint: "Описание перед карточками активностей" },
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы текущей лидерки" },
    ],
  },
  {
    id: "media",
    name: "Медиа",
    path: "/media",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы медиа" },
    ],
  },
  {
    id: "members",
    name: "Состав",
    path: "/members",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы состава" },
    ],
  },
  {
    id: "redux",
    name: "Редукс",
    path: "/redux",
    sections: [
      { key: "hero_desc", label: "Hero описание", hint: "Главное описание Redux в hero-секции" },
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы Redux" },
    ],
  },
  {
    id: "rules",
    name: "Правила",
    path: "/rules",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы правил" },
    ],
  },
  {
    id: "how-to-play",
    name: "Как играть",
    path: "/how-to-play",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы 'Как играть'" },
    ],
  },
  {
    id: "join",
    name: "В семью",
    path: "/join",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы вступления" },
    ],
  },
  {
    id: "polls",
    name: "Голосования",
    path: "/polls",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы голосований" },
    ],
  },
  {
    id: "contacts",
    name: "Контакты",
    path: "/contacts",
    sections: [
      { key: "extra_content", label: "Доп. блок страницы", hint: "HTML блок для страницы контактов" },
    ],
  },
];

/* ═══════════════════════════════════════════════
   HTML EDITOR with preview
   ═══════════════════════════════════════════════ */

function HtmlEditor({
  value,
  onSave,
  onCancel,
  hint,
}: {
  value: string;
  onSave: (v: string) => void;
  onCancel: () => void;
  hint: string;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [blocks, setBlocks] = useState<string[]>([]);

  useEffect(() => {
    const normalized = (value || "").trim();
    if (!normalized) {
      setBlocks([""]);
      return;
    }
    const parsed = normalized
      .split(/\n\s*<!--\s*block\s*-->\s*\n/g)
      .map((item) => item.trim())
      .filter(Boolean);
    setBlocks(parsed.length ? parsed : [normalized]);
  }, [value]);

  const updateBlock = (index: number, next: string) => {
    setBlocks((prev) => prev.map((item, i) => (i === index ? next : item)));
  };

  const addBlock = () => {
    setBlocks((prev) => [...prev, ""]);
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    setBlocks((prev) => {
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const joinedValue = blocks.map((item) => item.trim()).filter(Boolean).join("\n<!-- block -->\n");

  return (
    <div className="border border-white/8 bg-[#0a0a12]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.01]">
        <button
          onClick={() => setShowPreview(false)}
          className={`flex items-center gap-1.5 px-2 py-1 font-['Oswald'] uppercase tracking-wider transition-all ${
            !showPreview ? "text-[#9b2335]/60 bg-[#9b2335]/5" : "text-white/20 hover:text-white/40"
          }`}
          style={{ fontSize: "0.58rem" }}
        >
          <Code size={12} />
          HTML
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`flex items-center gap-1.5 px-2 py-1 font-['Oswald'] uppercase tracking-wider transition-all ${
            showPreview ? "text-[#9b2335]/60 bg-[#9b2335]/5" : "text-white/20 hover:text-white/40"
          }`}
          style={{ fontSize: "0.58rem" }}
        >
          <Monitor size={12} />
          Превью
        </button>
        <div className="flex-1" />
        <span className="font-['Oswald'] text-white/10 tracking-wide hidden sm:inline" style={{ fontSize: "0.6rem" }}>
          {hint}
        </span>
      </div>

      {/* Content */}
      {showPreview ? (
        <div className="p-4 space-y-3 min-h-[120px]">
          {blocks.filter((item) => item.trim()).length === 0 ? (
            <p className="font-['Oswald'] text-white/20 tracking-wide" style={{ fontSize: "0.75rem" }}>
              Нет блоков для превью
            </p>
          ) : (
            blocks.filter((item) => item.trim()).map((block, index) => (
              <div key={`preview-${index}`} className="border border-white/5 bg-white/[0.01] p-3">
                <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mb-2" style={{ fontSize: "0.58rem" }}>
                  Блок {index + 1}
                </p>
                <div
                  className="font-['Oswald'] text-white/50 tracking-wide prose-invert"
                  style={{ fontSize: "0.85rem", lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: block }}
                />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {blocks.map((block, index) => (
            <div key={`editor-${index}`} className="border border-white/6 bg-white/[0.01]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <span className="font-['Oswald'] text-white/25 uppercase tracking-wider" style={{ fontSize: "0.58rem" }}>
                  Блок {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveBlock(index, -1)}
                    className="px-2 py-1 text-white/25 hover:text-white/45 transition-colors"
                    title="Вверх"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 1)}
                    className="px-2 py-1 text-white/25 hover:text-white/45 transition-colors"
                    title="Вниз"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="px-2 py-1 text-white/25 hover:text-[#ff3366]/70 transition-colors"
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <textarea
                value={block}
                onChange={(e) => updateBlock(index, e.target.value)}
                className="w-full bg-transparent text-white/70 font-mono px-4 py-3 outline-none resize-none min-h-[110px]"
                style={{ fontSize: "0.78rem", lineHeight: 1.6 }}
                placeholder="<p>HTML блока...</p>"
                spellCheck={false}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addBlock}
            className="w-full px-3 py-2 border border-dashed border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 transition-all font-['Oswald'] uppercase tracking-wider"
            style={{ fontSize: "0.62rem" }}
          >
            + Добавить блок
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-white/5">
        <button
          onClick={() => onSave(joinedValue)}
          className="px-4 py-1.5 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all flex items-center gap-1.5"
          style={{ fontSize: "0.65rem" }}
        >
          <Save size={12} />
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 font-['Oswald'] uppercase tracking-wider text-white/20 border border-white/8 hover:border-white/15 transition-all"
          style={{ fontSize: "0.65rem" }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CUSTOM PAGE CREATOR
   ═══════════════════════════════════════════════ */

function CustomPageEditor({
  customPages,
  setCustomPages,
}: {
  customPages: CustomPage[];
  setCustomPages: (p: CustomPage[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    headerGradient: "#9b2335",
    accentColor: "#9b2335",
  });

  const resetForm = () =>
    setForm({ title: "", slug: "", content: "", headerGradient: "#9b2335", accentColor: "#9b2335" });

  const handleAdd = () => {
    if (!form.title.trim() || !form.slug.trim()) return;
    const slug = form.slug.startsWith("/") ? form.slug.slice(1) : form.slug;
    setCustomPages([
      ...customPages,
      {
        id: generateId(),
        title: form.title.trim(),
        slug,
        content: form.content,
        headerGradient: form.headerGradient,
        accentColor: form.accentColor,
        visible: true,
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    resetForm();
    setShowAdd(false);
  };

  const startEdit = (p: CustomPage) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      content: p.content,
      headerGradient: p.headerGradient,
      accentColor: p.accentColor,
    });
  };

  const saveEdit = () => {
    if (!editId) return;
    const slug = form.slug.startsWith("/") ? form.slug.slice(1) : form.slug;
    setCustomPages(
      customPages.map((p) =>
        p.id === editId ? { ...p, title: form.title.trim() || p.title, slug, content: form.content, headerGradient: form.headerGradient, accentColor: form.accentColor } : p
      )
    );
    setEditId(null);
    resetForm();
  };

  const deletePage = (id: string) => setCustomPages(customPages.filter((p) => p.id !== id));
  const toggleVisible = (id: string) =>
    setCustomPages(customPages.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));

  const isFormOpen = showAdd || editId;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1.3rem" }}>
            Кастомные страницы
          </h3>
          <p className="font-['Oswald'] text-white/20 tracking-wide mt-1" style={{ fontSize: "0.7rem" }}>
            Создание новых страниц с произвольным контентом
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditId(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
          style={{ fontSize: "0.72rem" }}
        >
          <Plus size={14} />
          Новая страница
        </button>
      </div>

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
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Моя страница"
                    className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-['Oswald'] tracking-wide px-3 py-2 outline-none transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                    URL slug
                  </label>
                  <div className="flex items-center gap-0">
                    <span className="font-mono text-white/20 bg-[#0d0d15] border border-r-0 border-white/8 px-2 py-2" style={{ fontSize: "0.8rem" }}>/page/</span>
                    <input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase() })}
                      placeholder="my-page"
                      className="flex-1 bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 font-mono tracking-wide px-3 py-2 outline-none transition-colors"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>
                    Градиент
                  </label>
                  <input
                    type="color"
                    value={form.headerGradient}
                    onChange={(e) => setForm({ ...form, headerGradient: e.target.value })}
                    className="w-7 h-7 border border-white/10 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-['Oswald'] text-white/25 uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>
                    Акцент
                  </label>
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="w-7 h-7 border border-white/10 bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              {/* Content editor */}
              <div className="mb-4">
                <label className="font-['Oswald'] text-white/30 uppercase tracking-wider block mb-2" style={{ fontSize: "0.6rem" }}>
                  Контент страницы (HTML)
                </label>
                <HtmlEditor
                  value={form.content}
                  onSave={(next) => setForm({ ...form, content: next })}
                  onCancel={() => undefined}
                  hint="Разбей контент страницы на блоки: каждый блок можно двигать и удалять"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={editId ? saveEdit : handleAdd}
                  className="px-5 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all flex items-center gap-2"
                  style={{ fontSize: "0.72rem" }}
                >
                  <Save size={14} />
                  {editId ? "Сохранить" : "Создать"}
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

      {/* Custom pages list */}
      {customPages.length === 0 ? (
        <div className="text-center py-10 border border-white/[0.03] bg-white/[0.005]">
          <FileText size={24} className="text-white/8 mx-auto mb-3" />
          <p className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.78rem" }}>
            Нет кастомных страниц
          </p>
          <p className="font-['Oswald'] text-white/8 tracking-wide mt-1" style={{ fontSize: "0.68rem" }}>
            Создайте первую страницу нажав кнопку «Новая страница»
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {customPages.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 p-4 border transition-all duration-300 group ${
                p.visible ? "border-white/5 bg-white/[0.01]" : "border-white/[0.02] opacity-40"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: p.accentColor }}
              />
              <div className="flex-1 min-w-0">
                <span className="font-['Oswald'] text-white/60 tracking-wide" style={{ fontSize: "0.85rem" }}>
                  {p.title}
                </span>
                <span className="font-mono text-white/15 tracking-wide ml-3" style={{ fontSize: "0.65rem" }}>
                  /page/{p.slug}
                </span>
              </div>
              <span className="font-['Oswald'] text-white/10 tracking-wide hidden sm:inline" style={{ fontSize: "0.62rem" }}>
                {p.createdAt}
              </span>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => toggleVisible(p.id)} className="text-white/15 hover:text-white/40 p-1 transition-colors">
                  {p.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => startEdit(p)} className="text-white/15 hover:text-[#f59e0b]/60 p-1 transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deletePage(p.id)} className="text-white/15 hover:text-[#ff3366]/60 p-1 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BUILT-IN PAGE OVERRIDES EDITOR
   ═══════════════════════════════════════════════ */

function BuiltInPagesEditor({
  pageOverrides,
  updatePageOverride,
  removePageOverride,
}: {
  pageOverrides: { pageId: string; sections: Record<string, string> }[];
  updatePageOverride: (pageId: string, section: string, content: string) => void;
  removePageOverride: (pageId: string, section: string) => void;
}) {
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<{ pageId: string; section: string } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saved, setSaved] = useState(false);

  const getOverrideValue = (pageId: string, section: string): string | null => {
    const ov = pageOverrides.find((p) => p.pageId === pageId);
    return ov?.sections?.[section] ?? null;
  };

  const startEdit = (pageId: string, sectionKey: string) => {
    const current = getOverrideValue(pageId, sectionKey) || "";
    setEditContent(current);
    setEditingSection({ pageId, section: sectionKey });
  };

  const handleSave = () => {
    if (!editingSection) return;
    const normalized = editContent.trim();
    if (normalized) {
      updatePageOverride(editingSection.pageId, editingSection.section, normalized);
    } else {
      removePageOverride(editingSection.pageId, editingSection.section);
    }
    setEditingSection(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRevert = (pageId: string, section: string) => {
    removePageOverride(pageId, section);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-['Russo_One'] text-white" style={{ fontSize: "1.3rem" }}>
          Редактирование страниц
        </h3>
        <p className="font-['Oswald'] text-white/20 tracking-wide mt-1" style={{ fontSize: "0.7rem" }}>
          Переопределение контента встроенных страниц через HTML
        </p>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4 px-4 py-2 border border-[#9b2335]/15 bg-[#9b2335]/5"
        >
          <CheckCircle2 size={14} className="text-[#9b2335]/50" />
          <span className="font-['Oswald'] text-[#9b2335]/60 tracking-wide" style={{ fontSize: "0.72rem" }}>
            Изменения сохранены
          </span>
        </motion.div>
      )}

      <div className="space-y-2">
        {builtInPages.map((page) => {
          const isExpanded = expandedPage === page.id;
          const hasOverrides = pageOverrides.some(
            (o) => o.pageId === page.id && Object.keys(o.sections).length > 0
          );

          return (
            <div key={page.id} className="border border-white/5 bg-white/[0.01]">
              <button
                onClick={() => setExpandedPage(isExpanded ? null : page.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.01] transition-all"
              >
                <FileText size={16} className="text-white/15 shrink-0" />
                <div className="flex-1">
                  <span className="font-['Oswald'] text-white/60 tracking-wide" style={{ fontSize: "0.85rem" }}>
                    {page.name}
                  </span>
                  <span className="font-mono text-white/15 ml-3" style={{ fontSize: "0.65rem" }}>
                    {page.path}
                  </span>
                </div>
                {hasOverrides && (
                  <span
                    className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider bg-[#9b2335]/5 text-[#9b2335]/40 border border-[#9b2335]/10"
                    style={{ fontSize: "0.45rem" }}
                  >
                    Override
                  </span>
                )}
                <span className="font-['Oswald'] text-white/15 tracking-wide" style={{ fontSize: "0.6rem" }}>
                  {page.sections.length} секц.
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3">
                      {page.sections.map((section) => {
                        const override = getOverrideValue(page.id, section.key);
                        const isEditing =
                          editingSection?.pageId === page.id && editingSection?.section === section.key;

                        return (
                          <div key={section.key} className="border border-white/[0.04] bg-white/[0.005] p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-['Oswald'] text-white/40 tracking-wide" style={{ fontSize: "0.78rem" }}>
                                {section.label}
                              </span>
                              {override !== null && (
                                <>
                                  <span
                                    className="px-1.5 py-0.5 font-['Oswald'] uppercase tracking-wider bg-[#9b2335]/5 text-[#9b2335]/40 border border-[#9b2335]/10"
                                    style={{ fontSize: "0.45rem" }}
                                  >
                                    Override
                                  </span>
                                  <button
                                    onClick={() => handleRevert(page.id, section.key)}
                                    className="flex items-center gap-1 text-white/15 hover:text-[#ff3366]/50 transition-colors"
                                    title="Вернуть оригинал"
                                  >
                                    <Undo2 size={12} />
                                    <span className="font-['Oswald'] tracking-wide" style={{ fontSize: "0.55rem" }}>
                                      Сброс
                                    </span>
                                  </button>
                                </>
                              )}
                            </div>

                            {isEditing ? (
                              <HtmlEditor
                                value={editContent}
                                onSave={(nextValue) => {
                                  setEditContent(nextValue);
                                  if (!editingSection) return;
                                  if (nextValue.trim()) {
                                    updatePageOverride(editingSection.pageId, editingSection.section, nextValue.trim());
                                  } else {
                                    removePageOverride(editingSection.pageId, editingSection.section);
                                  }
                                  setEditingSection(null);
                                  setSaved(true);
                                  setTimeout(() => setSaved(false), 2000);
                                }}
                                onCancel={() => setEditingSection(null)}
                                hint={section.hint}
                              />
                            ) : (
                              <button
                                onClick={() => startEdit(page.id, section.key)}
                                className="w-full text-left px-3 py-2 border border-dashed border-white/8 hover:border-white/15 transition-all group"
                              >
                                {override ? (
                                  <span
                                    className="font-mono text-white/25 tracking-wide block truncate"
                                    style={{ fontSize: "0.72rem" }}
                                  >
                                    {override.substring(0, 100)}{override.length > 100 ? "..." : ""}
                                  </span>
                                ) : (
                                  <span className="font-['Oswald'] text-white/10 tracking-wide group-hover:text-white/20 transition-colors flex items-center gap-2" style={{ fontSize: "0.72rem" }}>
                                    <Edit3 size={12} />
                                    {section.hint}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════���══════════════════════════════════
   MAIN PAGES EDITOR (combines both)
   ═══════════════════════════════════════════════ */

export function PagesEditor({
  customPages,
  setCustomPages,
  pageOverrides,
  updatePageOverride,
  removePageOverride,
}: {
  customPages: CustomPage[];
  setCustomPages: (p: CustomPage[]) => void;
  pageOverrides: { pageId: string; sections: Record<string, string> }[];
  updatePageOverride: (pageId: string, section: string, content: string) => void;
  removePageOverride: (pageId: string, section: string) => void;
}) {
  const [subTab, setSubTab] = useState<"builtin" | "custom">("builtin");

  return (
    <div>
      <h2 className="font-['Russo_One'] text-white mb-6" style={{ fontSize: "1.5rem" }}>
        Страницы
      </h2>

      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setSubTab("builtin")}
          className={`px-4 py-2 font-['Oswald'] uppercase tracking-wider border transition-all duration-300 ${
            subTab === "builtin"
              ? "text-[#9b2335] border-[#9b2335]/30 bg-[#9b2335]/5"
              : "text-white/25 border-white/5 hover:border-white/10"
          }`}
          style={{ fontSize: "0.65rem" }}
        >
          Встроенные страницы
        </button>
        <button
          onClick={() => setSubTab("custom")}
          className={`px-4 py-2 font-['Oswald'] uppercase tracking-wider border transition-all duration-300 ${
            subTab === "custom"
              ? "text-[#9b2335] border-[#9b2335]/30 bg-[#9b2335]/5"
              : "text-white/25 border-white/5 hover:border-white/10"
          }`}
          style={{ fontSize: "0.65rem" }}
        >
          Кастомные страницы
        </button>
      </div>

      {subTab === "builtin" && (
        <BuiltInPagesEditor
          pageOverrides={pageOverrides}
          updatePageOverride={updatePageOverride}
          removePageOverride={removePageOverride}
        />
      )}
      {subTab === "custom" && (
        <CustomPageEditor customPages={customPages} setCustomPages={setCustomPages} />
      )}
    </div>
  );
}
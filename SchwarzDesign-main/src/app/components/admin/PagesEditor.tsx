import { useState } from "react";
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
      { key: "hero_title", label: "Hero заголовок", hint: "HTML заголовка на главном баннере" },
      { key: "hero_subtitle", label: "Hero подзаголовок", hint: "Текст под заголовком" },
      { key: "about_text", label: "Блок 'О нс'", hint: "Текст секции 'О нас' на главной" },
    ],
  },
  {
    id: "history",
    name: "История",
    path: "/history",
    sections: [
      { key: "header", label: "Заголовок страницы", hint: "HTML заголовка" },
      { key: "intro", label: "Вступительный текст", hint: "Текст введения" },
    ],
  },
  {
    id: "current-leadership",
    name: "Текущая лидерка",
    path: "/current-leadership",
    sections: [
      { key: "leader_name", label: "Имя лидера", hint: "Имя назначенного лидера (или TBD)" },
      { key: "description", label: "Описание операции", hint: "HTML описания текущей операции" },
      { key: "timeline", label: "Таймлайн", hint: "HTML блок таймлайна" },
    ],
  },
  {
    id: "members",
    name: "Состав",
    path: "/members",
    sections: [
      { key: "header", label: "Заголовок", hint: "HTML заголовка страницы" },
    ],
  },
  {
    id: "redux",
    name: "Редукс",
    path: "/redux",
    sections: [
      { key: "version", label: "Версия", hint: "Текущая версия Redux пака" },
      { key: "changelog", label: "Changelog", hint: "HTML списка изменений" },
      { key: "download_url", label: "Ссылка скачивания", hint: "URL для скачивания" },
    ],
  },
  {
    id: "media",
    name: "Медиа",
    path: "/media",
    sections: [
      { key: "extra_content", label: "Дополнительный контент", hint: "HTML для дополнительного блока" },
    ],
  },
  {
    id: "rules",
    name: "Правила",
    path: "/rules",
    sections: [
      { key: "epigraph", label: "Эпиграф", hint: "Цитата перед правилами" },
      { key: "closing", label: "Закрытие", hint: "Финальная цитата" },
    ],
  },
  {
    id: "join",
    name: "В семью",
    path: "/join",
    sections: [
      { key: "requirements", label: "Требования", hint: "HTML списка требований" },
      { key: "form_note", label: "Примечание к анкете", hint: "Текст-примечание" },
    ],
  },
  {
    id: "how-to-play",
    name: "Как играть?",
    path: "/how-to-play",
    sections: [
      { key: "extra_info", label: "Доп. информация", hint: "HTML дополнительного блока" },
    ],
  },
  {
    id: "contacts",
    name: "Контакты",
    path: "/contacts",
    sections: [
      { key: "extra_links", label: "Доп. ссылки", hint: "HTML дополнительных ссылок" },
    ],
  },
];

/* ═══════════════════════════════════════════════
   HTML EDITOR with preview
   ═══════════════════════════════════════════════ */

function HtmlEditor({
  value,
  onChange,
  onSave,
  onCancel,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  hint: string;
}) {
  const [showPreview, setShowPreview] = useState(false);

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
        <div
          className="p-4 min-h-[120px] font-['Oswald'] text-white/50 tracking-wide prose-invert"
          style={{ fontSize: "0.85rem", lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-white/70 font-mono px-4 py-3 outline-none resize-none min-h-[120px]"
          style={{ fontSize: "0.78rem", lineHeight: 1.6 }}
          placeholder="<p>Введите HTML контент...</p>"
          spellCheck={false}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-white/5">
        <button
          onClick={onSave}
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
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={10}
                  placeholder='<h2>Заголовок</h2>\n<p>Текст страницы...</p>'
                  className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/70 font-mono px-4 py-3 outline-none transition-colors resize-none"
                  style={{ fontSize: "0.78rem", lineHeight: 1.6 }}
                  spellCheck={false}
                />
              </div>

              {/* Preview */}
              {form.content && (
                <div className="mb-4 border border-white/5 bg-white/[0.01] p-4">
                  <span className="font-['Oswald'] text-white/15 uppercase tracking-wider block mb-3" style={{ fontSize: "0.55rem" }}>
                    Превью
                  </span>
                  <div
                    className="font-['Oswald'] text-white/40 tracking-wide"
                    style={{ fontSize: "0.85rem", lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: form.content }}
                  />
                </div>
              )}

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
    if (editContent.trim()) {
      updatePageOverride(editingSection.pageId, editingSection.section, editContent);
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
                                onChange={setEditContent}
                                onSave={handleSave}
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
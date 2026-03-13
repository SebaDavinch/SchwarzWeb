import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Globe,
  FileText,
  Clock,
  User,
  Bold,
  Italic,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Minus,
  AlignLeft,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { useNews, NEWS_CATEGORIES, type NewsArticle, type NewsCategory, addAuditLog } from "../../hooks/useAdminData";

/* ───────────────────────────────────────────
   HELPERS
─────────────────────────────────────────── */

const categoryColors: Record<string, string> = {
  "Семейные дела": "#9b2335",
  "Крим. хроника": "#ff3366",
  "Репортаж": "#f59e0b",
  "Объявление": "#3b82f6",
  "Обновление": "#10b981",
  "Другое": "#888899",
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/* ───────────────────────────────────────────
   HTML EDITOR TOOLBAR
─────────────────────────────────────────── */

interface ToolbarButton {
  icon: typeof Bold;
  label: string;
  action: (textarea: HTMLTextAreaElement, setValue: (v: string) => void) => void;
}

function wrapSelection(ta: HTMLTextAreaElement, setValue: (v: string) => void, before: string, after: string) {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = ta.value.substring(start, end);
  const newVal = ta.value.substring(0, start) + before + (selected || "текст") + after + ta.value.substring(end);
  setValue(newVal);
  // Restore focus + select inserted text
  setTimeout(() => {
    ta.focus();
    ta.setSelectionRange(start + before.length, start + before.length + (selected || "текст").length);
  }, 0);
}

function insertAtCursor(ta: HTMLTextAreaElement, setValue: (v: string) => void, text: string) {
  const start = ta.selectionStart;
  const newVal = ta.value.substring(0, start) + text + ta.value.substring(ta.selectionEnd);
  setValue(newVal);
  setTimeout(() => {
    ta.focus();
    ta.setSelectionRange(start + text.length, start + text.length);
  }, 0);
}

const toolbarButtons: ToolbarButton[] = [
  {
    icon: Bold,
    label: "Жирный",
    action: (ta, sv) => wrapSelection(ta, sv, "<strong>", "</strong>"),
  },
  {
    icon: Italic,
    label: "Курсив",
    action: (ta, sv) => wrapSelection(ta, sv, "<em>", "</em>"),
  },
  {
    icon: Heading2,
    label: "Заголовок H2",
    action: (ta, sv) => wrapSelection(ta, sv, "\n<h2>", "</h2>\n"),
  },
  {
    icon: AlignLeft,
    label: "Параграф",
    action: (ta, sv) => wrapSelection(ta, sv, "\n<p>", "</p>\n"),
  },
  {
    icon: Quote,
    label: "Цитата",
    action: (ta, sv) => wrapSelection(ta, sv, "\n<blockquote>", "</blockquote>\n"),
  },
  {
    icon: LinkIcon,
    label: "Ссылка",
    action: (ta, sv) => {
      const url = prompt("URL ссылки:", "https://");
      if (!url) return;
      wrapSelection(ta, sv, `<a href="${url}">`, "</a>");
    },
  },
  {
    icon: ImageIcon,
    label: "Изображение",
    action: (ta, sv) => {
      const url = prompt("URL изображения:", "https://");
      if (!url) return;
      const alt = prompt("Описание (alt):", "") ?? "";
      insertAtCursor(ta, sv, `\n<img src="${url}" alt="${alt}" />\n`);
    },
  },
  {
    icon: Minus,
    label: "Разделитель",
    action: (ta, sv) => insertAtCursor(ta, sv, "\n<hr />\n"),
  },
];

/* ───────────────────────────────────────────
   FORM STATE
─────────────────────────────────────────── */

const EMPTY_FORM = {
  title: "",
  category: "Семейные дела" as NewsCategory,
  excerpt: "",
  coverImage: "",
  content: "",
  author: "",
  publishedAt: new Date().toISOString().split("T")[0],
  published: false,
};

type FormState = typeof EMPTY_FORM;

/* ───────────────────────────────────────────
   ARTICLE CARD (list item)
─────────────────────────────────────────── */

function ArticleCard({
  article,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  article: NewsArticle;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const color = categoryColors[article.category] || "#9b2335";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="border border-white/5 bg-white/[0.01] group hover:border-white/10 transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-stretch">
        {/* Left accent */}
        <div className="w-0.5 shrink-0" style={{ background: color, opacity: article.published ? 1 : 0.25 }} />

        <div className="flex-1 p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              {/* Meta */}
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span
                  className="px-2.5 py-0.5 uppercase tracking-wider border"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "0.5rem",
                    color,
                    borderColor: `${color}35`,
                    background: `${color}08`,
                  }}
                >
                  {article.category}
                </span>
                <span
                  className="flex items-center gap-1 text-white/20"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
                >
                  <Clock size={10} />
                  {formatDate(article.publishedAt)}
                </span>
                <span
                  className="flex items-center gap-1 text-white/15"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}
                >
                  <User size={10} />
                  {article.author || "—"}
                </span>
                {/* Publish status */}
                <span
                  className="px-2 py-0.5 uppercase tracking-wider border"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "0.48rem",
                    color: article.published ? "#10b981" : "#888899",
                    borderColor: article.published ? "#10b98130" : "#88889930",
                    background: article.published ? "#10b98108" : "#88889908",
                  }}
                >
                  {article.published ? "Опубликован" : "Черновик"}
                </span>
              </div>

              <p
                className="text-white/70 mb-1 truncate"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.95rem" }}
              >
                {article.title || "(без заголовка)"}
              </p>
              <p
                className="text-white/25 truncate"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem", lineHeight: 1.5 }}
              >
                {article.excerpt || "Нет аннотации"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={onTogglePublish}
                className="p-1.5 transition-colors"
                style={{ color: article.published ? "#10b981" : "rgba(255,255,255,0.2)" }}
                title={article.published ? "Снять с публикации" : "Опубликовать"}
              >
                <Globe size={14} />
              </button>
              <button
                onClick={onEdit}
                className="text-white/15 hover:text-[#f59e0b]/60 p-1.5 transition-colors"
                title="Редактировать"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={onDelete}
                className="text-white/15 hover:text-[#ff3366]/60 p-1.5 transition-colors"
                title="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   ARTICLE EDITOR
─────────────────────────────────────────── */

function ArticleEditor({
  initial,
  onSave,
  onCancel,
  isNew,
}: {
  initial: FormState;
  onSave: (form: FormState) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setContent = useCallback((v: string) => setForm((f) => ({ ...f, content: v })), []);

  const handleToolbar = (action: ToolbarButton["action"]) => {
    if (!textareaRef.current) return;
    action(textareaRef.current, setContent);
  };

  return (
    <div className="border border-[#9b2335]/15 bg-[#9b2335]/[0.02] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="text-[#9b2335]/80 uppercase tracking-wider"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
        >
          {isNew ? "Новый материал" : "Редактирование"}
        </span>
        <button
          onClick={onCancel}
          className="text-white/20 hover:text-white/50 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Row 1: Title */}
      <div>
        <label className="block mb-1.5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Заголовок *
        </label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Заголовок материала..."
          className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/80 px-3 py-2.5 outline-none transition-colors"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.9rem" }}
        />
      </div>

      {/* Row 2: Category / Author / Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1.5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Категория
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as NewsCategory })}
            className="w-full bg-[#0d0d15] border border-white/8 text-white/70 px-3 py-2.5 outline-none"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.82rem" }}
          >
            {NEWS_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1.5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Автор
          </label>
          <input
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="Имя автора"
            className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/70 px-3 py-2.5 outline-none transition-colors"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.82rem" }}
          />
        </div>
        <div>
          <label className="block mb-1.5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Дата публикации
          </label>
          <input
            type="date"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/70 px-3 py-2.5 outline-none transition-colors"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.82rem", colorScheme: "dark" }}
          />
        </div>
      </div>

      {/* Cover image URL */}
      <div>
        <label className="block mb-1.5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Обложка (URL изображения, необязательно)
        </label>
        <input
          value={form.coverImage}
          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
          placeholder="https://i.imgur.com/..."
          className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/50 px-3 py-2.5 outline-none transition-colors"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.78rem" }}
        />
        {form.coverImage && (
          <img
            src={form.coverImage}
            alt="preview"
            className="mt-2 h-24 w-auto object-cover opacity-50 border border-white/8"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="block mb-1.5" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Аннотация (отображается в карточке)
        </label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          placeholder="Краткое описание материала, 1-2 предложения..."
          rows={2}
          className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/60 px-3 py-2.5 outline-none resize-none transition-colors"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.82rem" }}
        />
        <p className="text-right mt-1" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem", color: form.excerpt.length > 200 ? "#ff3366" : "rgba(255,255,255,0.15)" }}>
          {form.excerpt.length} / 250 симв.
        </p>
      </div>

      {/* HTML Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Контент (HTML)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "0.58rem",
              color: showPreview ? "#9b2335" : "rgba(255,255,255,0.25)",
            }}
          >
            {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPreview ? "Скрыть превью" : "Показать превью"}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 flex-wrap p-2 bg-[#0d0d15] border border-white/8 border-b-0">
          {toolbarButtons.map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleToolbar(btn.action)}
              title={btn.label}
              className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-[#9b2335]/70 hover:bg-[#9b2335]/5 transition-all"
            >
              <btn.icon size={13} strokeWidth={1.5} />
            </button>
          ))}
          <div className="w-px h-5 bg-white/8 mx-1" />
          <span className="text-white/10" style={{ fontFamily: "monospace", fontSize: "0.55rem" }}>HTML</span>
        </div>

        {/* Editor + Preview split */}
        <div className={`flex gap-0 ${showPreview ? "grid grid-cols-2" : ""}`}>
          <textarea
            ref={textareaRef}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder={"<p>Начните писать текст новости...</p>\n\n<h2>Заголовок раздела</h2>\n\n<p>Продолжение текста...</p>"}
            rows={14}
            className="w-full bg-[#080810] border border-white/8 focus:border-[#9b2335]/20 text-white/50 px-4 py-3 outline-none resize-y transition-colors font-mono"
            style={{ fontSize: "0.75rem", lineHeight: 1.6 }}
          />

          {showPreview && (
            <div
              className="border border-white/8 border-l-0 bg-[#0a0a0f] px-5 py-4 overflow-y-auto"
              style={{ maxHeight: "350px" }}
            >
              <p className="uppercase tracking-widest text-white/15 mb-3" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem" }}>
                Превью
              </p>
              <style>{`
                .preview-body { color: rgba(255,255,255,0.65); font-family: 'Oswald', sans-serif; font-size: 0.85rem; line-height: 1.8; }
                .preview-body p { margin-bottom: 0.9rem; }
                .preview-body h2 { font-family: 'Russo One', sans-serif; color: white; font-size: 1.05rem; margin: 1.2rem 0 0.5rem; }
                .preview-body h3 { font-family: 'Russo One', sans-serif; color: rgba(255,255,255,0.8); font-size: 0.9rem; margin: 1rem 0 0.4rem; }
                .preview-body strong { color: rgba(255,255,255,0.9); }
                .preview-body em { font-style: italic; color: rgba(255,255,255,0.5); }
                .preview-body blockquote { border-left: 2px solid #9b2335; padding-left: 0.8rem; color: rgba(255,255,255,0.4); font-style: italic; margin: 1rem 0; }
                .preview-body hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 1.2rem 0; }
                .preview-body img { max-width: 100%; border: 1px solid rgba(255,255,255,0.06); margin: 0.5rem 0; }
                .preview-body a { color: #9b2335; text-decoration: underline; }
              `}</style>
              <div
                className="preview-body"
                dangerouslySetInnerHTML={{ __html: form.content || "<p style='color:rgba(255,255,255,0.15)'>Нет содержимого</p>" }}
              />
            </div>
          )}
        </div>
        <p className="mt-1.5 text-white/15" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.55rem" }}>
          Поддерживается HTML: &lt;p&gt; &lt;h2&gt; &lt;h3&gt; &lt;strong&gt; &lt;em&gt; &lt;a&gt; &lt;img&gt; &lt;blockquote&gt; &lt;hr&gt; &lt;br&gt;
        </p>
      </div>

      {/* Publish toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setForm({ ...form, published: !form.published })}
          className="flex items-center gap-2.5 px-4 py-2 border transition-all duration-300"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: "0.7rem",
            color: form.published ? "#10b981" : "rgba(255,255,255,0.3)",
            borderColor: form.published ? "#10b98130" : "rgba(255,255,255,0.08)",
            background: form.published ? "#10b98108" : "transparent",
          }}
        >
          {form.published ? <Globe size={13} /> : <FileText size={13} />}
          {form.published ? "Опубликован" : "Черновик"}
        </button>
        <span className="text-white/15" style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
          {form.published ? "Материал виден посетителям сайта" : "Материал скрыт от посетителей"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          disabled={!form.title.trim()}
          className="flex items-center gap-2 px-5 py-2.5 uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
        >
          <Save size={14} />
          {isNew ? "Создать" : "Сохранить"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 uppercase tracking-wider text-white/30 border border-white/8 hover:border-white/15 transition-all"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}
        >
          <X size={14} />
          Отмена
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   MAIN NEWS TAB
─────────────────────────────────────────── */

export function NewsTab({ staffName }: { staffName?: string }) {
  const { articles, addArticle, updateArticle, deleteArticle } = useNews();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [savedId, setSavedId] = useState<string | null>(null);

  const filtered = articles.filter((a) => {
    if (filterStatus === "published") return a.published;
    if (filterStatus === "draft") return !a.published;
    return true;
  });

  const handleCreate = (form: FormState) => {
    const article = addArticle(form);
    addAuditLog("Создана новость", "news", form.title, staffName ?? "Admin");
    setShowCreate(false);
    setSavedId(article.id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const handleUpdate = (id: string, form: FormState) => {
    updateArticle(id, form);
    addAuditLog("Обновлена новость", "news", form.title, staffName ?? "Admin");
    setEditingId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Удалить материал «${title}»?`)) return;
    deleteArticle(id);
    addAuditLog("Удалена новость", "news", title, staffName ?? "Admin");
  };

  const handleTogglePublish = (article: NewsArticle) => {
    updateArticle(article.id, { published: !article.published });
    addAuditLog(
      article.published ? "Снят с публикации" : "Опубликован",
      "news",
      article.title,
      staffName ?? "Admin"
    );
  };

  const getInitialForm = (article: NewsArticle): FormState => ({
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    coverImage: article.coverImage ?? "",
    content: article.content,
    author: article.author,
    publishedAt: article.publishedAt,
    published: article.published,
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-['Russo_One'] text-white" style={{ fontSize: "1.5rem" }}>
            Schwarz News
          </h2>
          <p className="font-['Oswald'] text-white/20 uppercase tracking-wider mt-0.5" style={{ fontSize: "0.62rem" }}>
            Управление новостями и материалами
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/news"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white/30 border border-white/8 hover:text-white/60 hover:border-white/15 transition-all"
            style={{ fontSize: "0.65rem" }}
          >
            <Radio size={13} />
            Открыть страницу
          </a>
          {!showCreate && !editingId && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 font-['Oswald'] uppercase tracking-wider text-white bg-[#9b2335] hover:bg-[#b52a40] transition-all"
              style={{ fontSize: "0.72rem" }}
            >
              <Plus size={14} />
              Новый материал
            </button>
          )}
        </div>
      </div>

      {/* Save confirmation */}
      <AnimatePresence>
        {savedId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-4 py-3 mb-6 border border-[#10b981]/20 bg-[#10b981]/05"
          >
            <CheckCircle2 size={14} className="text-[#10b981]/60" />
            <span className="font-['Oswald'] text-[#10b981]/60 uppercase tracking-wider" style={{ fontSize: "0.68rem" }}>
              Материал сохранён
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <ArticleEditor
              initial={{ ...EMPTY_FORM, publishedAt: new Date().toISOString().split("T")[0] }}
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
              isNew={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {([
          { id: "all" as const, label: "Все" },
          { id: "published" as const, label: "Опубликованы" },
          { id: "draft" as const, label: "Черновики" },
        ]).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className="px-3 py-1.5 font-['Oswald'] uppercase tracking-wider border transition-all"
            style={{
              fontSize: "0.62rem",
              color: filterStatus === f.id ? "#9b2335" : "rgba(255,255,255,0.25)",
              borderColor: filterStatus === f.id ? "rgba(155,35,53,0.3)" : "rgba(255,255,255,0.05)",
              background: filterStatus === f.id ? "rgba(155,35,53,0.05)" : "transparent",
            }}
          >
            {f.label}
            <span className="ml-1.5 opacity-60">
              {f.id === "all" ? articles.length : f.id === "published" ? articles.filter((a) => a.published).length : articles.filter((a) => !a.published).length}
            </span>
          </button>
        ))}
      </div>

      {/* Articles list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Radio size={40} className="text-white/8 mx-auto mb-4" strokeWidth={1} />
          <p className="font-['Oswald'] text-white/20 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
            {articles.length === 0 ? "Нет материалов" : "Нет материалов в этом фильтре"}
          </p>
          {articles.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-5 flex items-center gap-2 mx-auto px-4 py-2 font-['Oswald'] uppercase tracking-wider text-[#9b2335]/60 border border-[#9b2335]/20 hover:bg-[#9b2335]/5 transition-all"
              style={{ fontSize: "0.65rem" }}
            >
              <Plus size={13} />
              Создать первый материал
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((article) => (
              editingId === article.id ? (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-4"
                >
                  <ArticleEditor
                    initial={getInitialForm(article)}
                    onSave={(form) => handleUpdate(article.id, form)}
                    onCancel={() => setEditingId(null)}
                    isNew={false}
                  />
                </motion.div>
              ) : (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onEdit={() => { setShowCreate(false); setEditingId(article.id); }}
                  onDelete={() => handleDelete(article.id, article.title)}
                  onTogglePublish={() => handleTogglePublish(article)}
                />
              )
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats footer */}
      {articles.length > 0 && (
        <p className="font-['Oswald'] text-white/10 tracking-wide mt-8 text-center" style={{ fontSize: "0.62rem" }}>
          Всего материалов: {articles.length} · Опубликовано: {articles.filter((a) => a.published).length} · Черновиков: {articles.filter((a) => !a.published).length}
        </p>
      )}
    </div>
  );
}

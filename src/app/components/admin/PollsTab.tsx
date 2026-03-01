import { useState } from "react";
import {
  Plus,
  Trash2,
  Vote,
  ToggleLeft,
  ToggleRight,
  Lock,
  Users,
  BarChart3,
  X,
} from "lucide-react";
import { usePolls, addAuditLog, type Poll } from "../../hooks/useAdminData";

export function PollsTab({ staffName }: { staffName: string }) {
  const { polls, addPoll, togglePoll, deletePoll } = usePolls();
  const [showCreate, setShowCreate] = useState(false);

  /* ─── Create form state ─── */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<"all" | "members">("all");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== idx));
  };
  const updateOption = (idx: number, val: string) =>
    setOptions(options.map((o, i) => (i === idx ? val : o)));

  const handleCreate = () => {
    const cleaned = options.filter((o) => o.trim());
    if (!title.trim() || cleaned.length < 2) return;

    addPoll({
      title: title.trim(),
      description: description.trim(),
      options: cleaned.map((label, i) => ({
        id: `opt_${Date.now()}_${i}`,
        label,
        votes: 0,
      })),
      active: true,
      access,
    });

    addAuditLog("Создано голосование", "settings", `«${title.trim()}» — ${cleaned.length} вариантов, доступ: ${access}`, staffName);

    // Reset
    setTitle("");
    setDescription("");
    setAccess("all");
    setOptions(["", ""]);
    setShowCreate(false);
  };

  const handleToggle = (poll: Poll) => {
    togglePoll(poll.id);
    addAuditLog(
      poll.active ? "Голосование закрыто" : "Голосование открыто",
      "settings",
      `«${poll.title}»`,
      staffName
    );
  };

  const handleDelete = (poll: Poll) => {
    if (!confirm(`Удалить голосование «${poll.title}»?`)) return;
    deletePoll(poll.id);
    addAuditLog("Голосование удалено", "settings", `«${poll.title}»`, staffName);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Vote size={18} className="text-[#9146ff]" />
          <h2
            className="font-['Russo_One'] text-white"
            style={{ fontSize: "1.2rem" }}
          >
            Голосования
          </h2>
          <span
            className="font-['Oswald'] text-white/20 tracking-wider ml-2"
            style={{ fontSize: "0.7rem" }}
          >
            {polls.length} всего
          </span>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-[#9146ff]/10 border border-[#9146ff]/25 text-[#9146ff] hover:bg-[#9146ff]/20 transition-all font-['Oswald'] uppercase tracking-widest"
          style={{ fontSize: "0.7rem" }}
        >
          {showCreate ? <X size={14} /> : <Plus size={14} />}
          {showCreate ? "Отмена" : "Создать"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-8 p-6 border border-[#9146ff]/15 bg-[#9146ff]/[0.02]">
          <div className="space-y-4">
            <div>
              <label
                className="font-['Oswald'] text-white/30 uppercase tracking-widest block mb-1.5"
                style={{ fontSize: "0.6rem" }}
              >
                Название
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Вопрос голосования"
                className="w-full bg-[#0a0a0f] border border-white/10 px-4 py-2.5 text-white font-['Oswald'] tracking-wide outline-none focus:border-[#9146ff]/30 transition-colors"
                style={{ fontSize: "0.85rem" }}
              />
            </div>

            <div>
              <label
                className="font-['Oswald'] text-white/30 uppercase tracking-widest block mb-1.5"
                style={{ fontSize: "0.6rem" }}
              >
                Описание (необязательно)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Контекст или пояснение"
                className="w-full bg-[#0a0a0f] border border-white/10 px-4 py-2.5 text-white font-['Oswald'] tracking-wide outline-none focus:border-[#9146ff]/30 transition-colors"
                style={{ fontSize: "0.85rem" }}
              />
            </div>

            {/* Access */}
            <div>
              <label
                className="font-['Oswald'] text-white/30 uppercase tracking-widest block mb-2"
                style={{ fontSize: "0.6rem" }}
              >
                Доступ
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setAccess("all")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 border transition-all font-['Oswald'] uppercase tracking-widest ${
                    access === "all"
                      ? "border-[#9b2335]/30 bg-[#9b2335]/10 text-[#9b2335]"
                      : "border-white/8 text-white/30 hover:border-white/15"
                  }`}
                  style={{ fontSize: "0.65rem" }}
                >
                  <Users size={14} />
                  Все
                </button>
                <button
                  onClick={() => setAccess("members")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 border transition-all font-['Oswald'] uppercase tracking-widest ${
                    access === "members"
                      ? "border-[#9b2335]/30 bg-[#9b2335]/10 text-[#9b2335]"
                      : "border-white/8 text-white/30 hover:border-white/15"
                  }`}
                  style={{ fontSize: "0.65rem" }}
                >
                  <Lock size={14} />
                  Только семья
                </button>
              </div>
            </div>

            {/* Options */}
            <div>
              <label
                className="font-['Oswald'] text-white/30 uppercase tracking-widest block mb-2"
                style={{ fontSize: "0.6rem" }}
              >
                Варианты ответа
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Вариант ${i + 1}`}
                      className="flex-1 bg-[#0a0a0f] border border-white/10 px-4 py-2 text-white font-['Oswald'] tracking-wide outline-none focus:border-[#9146ff]/30 transition-colors"
                      style={{ fontSize: "0.8rem" }}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(i)}
                        className="px-3 border border-white/5 text-white/20 hover:text-[#ff3366] hover:border-[#ff3366]/20 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addOption}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 text-white/20 hover:text-white/40 transition-colors font-['Oswald'] uppercase tracking-widest"
                style={{ fontSize: "0.6rem" }}
              >
                <Plus size={12} />
                Добавить вариант
              </button>
            </div>

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={!title.trim() || options.filter((o) => o.trim()).length < 2}
              className="w-full py-3 bg-[#9146ff]/15 border border-[#9146ff]/30 text-[#9146ff] hover:bg-[#9146ff]/25 transition-all font-['Oswald'] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontSize: "0.75rem" }}
            >
              Создать голосование
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {polls.length === 0 ? (
        <div className="text-center py-16">
          <Vote size={32} className="text-white/10 mx-auto mb-3" />
          <p
            className="font-['Oswald'] text-white/15 tracking-wide"
            style={{ fontSize: "0.8rem" }}
          >
            Нет созданных голосований
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum, o) => sum + o.votes,
              0
            );
            return (
              <div
                key={poll.id}
                className={`p-5 border transition-all ${
                  poll.active
                    ? "border-[#9146ff]/15 bg-[#9146ff]/[0.02]"
                    : "border-white/5 bg-white/[0.01] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="font-['Russo_One'] text-white truncate"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {poll.title}
                      </h3>
                      {poll.access === "members" && (
                        <Lock size={12} className="text-[#ff3366]/50 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span
                        className="font-['Oswald'] text-white/20 tracking-wider"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {poll.options.length} вариантов
                      </span>
                      <span className="w-[1px] h-3 bg-white/8" />
                      <span className="flex items-center gap-1">
                        <BarChart3 size={11} className="text-white/15" />
                        <span
                          className="font-['Oswald'] text-white/20 tracking-wider"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {totalVotes} голосов
                        </span>
                      </span>
                      <span className="w-[1px] h-3 bg-white/8" />
                      <span
                        className={`font-['Oswald'] uppercase tracking-widest ${
                          poll.active ? "text-[#9b2335]/50" : "text-white/15"
                        }`}
                        style={{ fontSize: "0.55rem" }}
                      >
                        {poll.active ? "Активно" : "Закрыто"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(poll)}
                      className="p-2 border border-white/5 hover:border-white/15 text-white/30 hover:text-white/60 transition-all"
                      title={poll.active ? "Закрыть" : "Открыть"}
                    >
                      {poll.active ? (
                        <ToggleRight size={16} className="text-[#9b2335]" />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(poll)}
                      className="p-2 border border-white/5 hover:border-[#ff3366]/20 text-white/20 hover:text-[#ff3366] transition-all"
                      title="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Quick results preview */}
                {totalVotes > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                    {poll.options.map((o) => {
                      const pct =
                        totalVotes > 0 ? (o.votes / totalVotes) * 100 : 0;
                      return (
                        <div key={o.id} className="flex items-center gap-3">
                          <span
                            className="font-['Oswald'] text-white/30 w-24 truncate"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {o.label}
                          </span>
                          <div className="flex-1 h-[3px] bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-[#9146ff]/60"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span
                            className="font-['Oswald'] text-white/20 w-12 text-right"
                            style={{ fontSize: "0.6rem" }}
                          >
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
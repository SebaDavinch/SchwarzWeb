import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Vote,
  CheckCircle2,
  Lock,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  type Poll,
  type PollOption,
  voteOnPoll,
  hasVoted,
} from "../hooks/useAdminData";
import { getPocketBaseState, isPocketBaseEnabled } from "../api/pocketbase";
import { GlitchText } from "../components/GlitchText";
import { EditablePageSection } from "../components/EditablePageSection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

const CHART_COLORS = [
  "#9b2335",
  "#ff3366",
  "#9146ff",
  "#f59e0b",
  "#3b82f6",
  "#06b6d4",
  "#ec4899",
  "#10b981",
];

function loadPolls(): Poll[] {
  try {
    const v = localStorage.getItem("schwarz_admin_polls");
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

async function loadPollsFromSources(): Promise<Poll[]> {
  if (isPocketBaseEnabled()) {
    const pbPolls = await getPocketBaseState<Poll[]>("polls");
    if (pbPolls) {
      localStorage.setItem("schwarz_admin_polls", JSON.stringify(pbPolls));
      return pbPolls;
    }
  }
  return loadPolls();
}

/* ─── Voter ID — using fingerprint stored in localStorage ─── */
function getVoterId(): string {
  const key = "schwarz_voter_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `voter_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

/* ─── Single Poll Card ─── */
function PollCard({ poll: initialPoll }: { poll: Poll }) {
  const [poll, setPoll] = useState(initialPoll);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [voteError, setVoteError] = useState("");

  const voterId = getVoterId();
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1);

  useEffect(() => {
    setVoted(hasVoted(poll.id, voterId));
  }, [poll.id, voterId]);

  const handleVote = async () => {
    if (!selectedOption) return;

    // For members-only polls, validate name
    if (poll.access === "members") {
      if (!memberName.trim()) {
        setShowNameInput(true);
        return;
      }
      if (!memberName.toLowerCase().includes("schwarz")) {
        setVoteError("Имя должно содержать «Schwarz» — только для участников семьи");
        return;
      }
    }

    const success = voteOnPoll(poll.id, selectedOption, voterId);
    if (success) {
      setVoted(true);
      // Refresh poll data
      const fresh = (await loadPollsFromSources()).find((p) => p.id === poll.id);
      if (fresh) setPoll(fresh);
    } else {
      setVoteError("Вы уже голосовали в этом опросе");
    }
  };

  const chartData = poll.options.map((o, i) => ({
    name: o.label.length > 12 ? o.label.slice(0, 12) + "..." : o.label,
    fullName: o.label,
    votes: o.votes,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const showResults = voted || !poll.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-white/8 bg-white/[0.01] overflow-hidden"
    >
      {/* Top accent */}
      <div
        className="h-[2px]"
        style={{
          background: poll.active
            ? "linear-gradient(to right, transparent, #9b233544, transparent)"
            : "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {poll.active ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#9b2335]/10 border border-[#9b2335]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9b2335] animate-pulse" />
                  <span
                    className="font-['Oswald'] text-[#9b2335] uppercase tracking-widest"
                    style={{ fontSize: "0.55rem" }}
                  >
                    Активно
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10">
                  <Clock size={10} className="text-white/30" />
                  <span
                    className="font-['Oswald'] text-white/30 uppercase tracking-widest"
                    style={{ fontSize: "0.55rem" }}
                  >
                    Завершено
                  </span>
                </span>
              )}
              {poll.access === "members" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ff3366]/10 border border-[#ff3366]/20">
                  <Lock size={10} className="text-[#ff3366]" />
                  <span
                    className="font-['Oswald'] text-[#ff3366] uppercase tracking-widest"
                    style={{ fontSize: "0.55rem" }}
                  >
                    Только семья
                  </span>
                </span>
              )}
            </div>
            <h3
              className="font-['Russo_One'] text-white"
              style={{ fontSize: "1.2rem" }}
            >
              {poll.title}
            </h3>
            {poll.description && (
              <p
                className="font-['Oswald'] text-white/30 mt-2 tracking-wide"
                style={{ fontSize: "0.8rem", lineHeight: 1.5 }}
              >
                {poll.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-white/20 shrink-0">
            <Users size={14} />
            <span
              className="font-['Oswald'] tracking-wider"
              style={{ fontSize: "0.7rem" }}
            >
              {totalVotes}
            </span>
          </div>
        </div>

        {/* Voting options or Results */}
        {showResults ? (
          <div className="space-y-4">
            {/* Chart */}
            {totalVotes > 0 && (
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{
                        fill: "rgba(255,255,255,0.4)",
                        fontSize: 11,
                        fontFamily: "Oswald",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        background: "#0d0d14",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 0,
                        fontFamily: "Oswald",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "white" }}
                      formatter={(value: number) => [
                        `${value} голос${value === 1 ? "" : value < 5 ? "а" : "ов"}`,
                        "",
                      ]}
                      labelFormatter={(label: string) => {
                        const item = chartData.find((d) => d.name === label);
                        return item?.fullName || label;
                      }}
                    />
                    <Bar dataKey="votes" radius={[0, 2, 2, 0]} barSize={20}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          fillOpacity={0.7}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Text results */}
            {poll.options.map((o, i) => {
              const pct = totalVotes > 0 ? (o.votes / totalVotes) * 100 : 0;
              const color = CHART_COLORS[i % CHART_COLORS.length];
              return (
                <div key={o.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="font-['Oswald'] text-white/60 tracking-wide"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {o.label}
                    </span>
                    <span
                      className="font-['Oswald'] tracking-wider"
                      style={{ fontSize: "0.7rem", color }}
                    >
                      {o.votes} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-[4px] bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        boxShadow: `0 0 8px ${color}33`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {voted && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <CheckCircle2 size={14} className="text-[#9b2335]" />
                <span
                  className="font-['Oswald'] text-[#9b2335]/60 tracking-wide"
                  style={{ fontSize: "0.7rem" }}
                >
                  Ваш голос учтён
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {poll.options.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSelectedOption(o.id);
                  setVoteError("");
                }}
                className={`w-full text-left p-4 border transition-all duration-300 ${
                  selectedOption === o.id
                    ? "border-[#9b2335]/30 bg-[#9b2335]/[0.05]"
                    : "border-white/5 bg-white/[0.01] hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedOption === o.id
                        ? "border-[#9b2335]"
                        : "border-white/15"
                    }`}
                  >
                    {selectedOption === o.id && (
                      <div className="w-2 h-2 rounded-full bg-[#9b2335]" />
                    )}
                  </div>
                  <span
                    className="font-['Oswald'] text-white/70 tracking-wide"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {o.label}
                  </span>
                </div>
              </button>
            ))}

            {/* Members-only: name input */}
            <AnimatePresence>
              {showNameInput && poll.access === "members" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 border border-[#ff3366]/15 bg-[#ff3366]/[0.03] mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={12} className="text-[#ff3366]" />
                      <span
                        className="font-['Oswald'] text-[#ff3366]/60 uppercase tracking-widest"
                        style={{ fontSize: "0.55rem" }}
                      >
                        Подтверждение участника
                      </span>
                    </div>
                    <input
                      type="text"
                      value={memberName}
                      onChange={(e) => {
                        setMemberName(e.target.value);
                        setVoteError("");
                      }}
                      placeholder="Введите ваш ник (например: Madara Schwarz)"
                      className="w-full bg-[#0a0a0f] border border-white/10 px-4 py-2.5 text-white font-['Oswald'] tracking-wide outline-none focus:border-[#ff3366]/30 transition-colors"
                      style={{ fontSize: "0.8rem" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {voteError && (
              <div className="flex items-center gap-2 p-3 bg-[#ff3366]/10 border border-[#ff3366]/20">
                <AlertTriangle size={14} className="text-[#ff3366]" />
                <span
                  className="font-['Oswald'] text-[#ff3366]/80 tracking-wide"
                  style={{ fontSize: "0.7rem" }}
                >
                  {voteError}
                </span>
              </div>
            )}

            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className={`w-full mt-3 py-3 flex items-center justify-center gap-2 font-['Oswald'] uppercase tracking-widest transition-all duration-300 ${
                selectedOption
                  ? "bg-[#9b2335]/10 border border-[#9b2335]/30 text-[#9b2335] hover:bg-[#9b2335]/20"
                  : "bg-white/[0.02] border border-white/5 text-white/20 cursor-not-allowed"
              }`}
              style={{ fontSize: "0.75rem" }}
            >
              <Vote size={14} />
              Проголосовать
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    void loadPollsFromSources().then(setPolls);
    const interval = setInterval(() => {
      void loadPollsFromSources().then(setPolls);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activePolls = polls.filter((p) => p.active);
  const closedPolls = polls.filter((p) => !p.active);

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative h-[30vh] min-h-[220px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#9146ff]/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[180px] bg-[#9146ff] opacity-[0.03]" />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-6 h-[1px] bg-[#9146ff]/20" />
            <BarChart3 size={16} className="text-[#9146ff]/50" />
            <span
              className="font-['Oswald'] text-[#9146ff]/50 uppercase tracking-[0.4em]"
              style={{ fontSize: "0.6rem" }}
            >
              Voting System
            </span>
            <BarChart3 size={16} className="text-[#9146ff]/50" />
            <div className="w-6 h-[1px] bg-[#9146ff]/20" />
          </motion.div>

          <GlitchText
            as="h1"
            className="font-['Russo_One'] text-white"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
            }}
            text="Голосования"
          >
            Голо
            <span
              className="text-[#9146ff]"
              style={{ filter: "drop-shadow(0 0 15px rgba(145,70,255,0.2))" }}
            >
              сования
            </span>
          </GlitchText>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 font-['Oswald'] text-white/25 tracking-wide"
            style={{ fontSize: "0.8rem" }}
          >
            Голосуй за решения семьи. Твой голос имеет значение.
          </motion.p>
        </div>
      </div>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {polls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Vote size={40} className="text-white/10 mx-auto mb-4" />
              <p
                className="font-['Oswald'] text-white/20 tracking-wide"
                style={{ fontSize: "0.9rem" }}
              >
                Пока нет активных голосований
              </p>
              <p
                className="font-['Oswald'] text-white/10 tracking-wide mt-2"
                style={{ fontSize: "0.7rem" }}
              >
                Голосования создаются в админ-панели
              </p>
            </motion.div>
          ) : (
            <>
              {/* Active polls */}
              {activePolls.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-[#9b2335] animate-pulse" />
                    <span
                      className="font-['Oswald'] text-white/30 uppercase tracking-[0.3em]"
                      style={{ fontSize: "0.6rem" }}
                    >
                      Активные
                    </span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="space-y-6">
                    {activePolls.map((p) => (
                      <PollCard key={p.id} poll={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Closed polls */}
              {closedPolls.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Clock size={12} className="text-white/15" />
                    <span
                      className="font-['Oswald'] text-white/20 uppercase tracking-[0.3em]"
                      style={{ fontSize: "0.6rem" }}
                    >
                      Завершённые
                    </span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="space-y-6">
                    {closedPolls.map((p) => (
                      <PollCard key={p.id} poll={p} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <EditablePageSection pageId="polls" />
    </div>
  );
}
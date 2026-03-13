import { motion } from "motion/react";
import { Award, Lock } from "lucide-react";
import type { AchievementDef, UserAchievement } from "../../hooks/useCabinetData";

interface Props {
  achievementDefs: AchievementDef[];
  userAchievements: UserAchievement[];
  memberId?: string;
  contractCount: number;
}

export function CabinetAchievements({
  achievementDefs,
  userAchievements,
  memberId,
  contractCount,
}: Props) {
  const memberUnlocked = memberId
    ? userAchievements.filter((ua) => ua.memberId === memberId)
    : [];

  const isUnlocked = (achId: string) =>
    memberUnlocked.some((ua) => ua.achievementId === achId);

  const getUnlockDate = (achId: string) => {
    const ua = memberUnlocked.find((ua) => ua.achievementId === achId);
    if (!ua) return null;
    return new Date(ua.unlockedAt).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getProgress = (def: AchievementDef) => {
    if (def.condition !== "contracts_closed" || !def.conditionValue) return null;
    const pct = Math.min(
      100,
      Math.round((contractCount / def.conditionValue) * 100)
    );
    return { current: contractCount, needed: def.conditionValue, pct };
  };

  const unlockedCount = achievementDefs.filter((a) => isUnlocked(a.id)).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Award size={20} className="text-[#9b2335]" strokeWidth={1.5} />
        <h2
          className="text-white"
          style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.4rem" }}
        >
          Достижения
        </h2>
        <span
          className="text-[#9b2335]/60"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.8rem" }}
        >
          {unlockedCount}/{achievementDefs.length}
        </span>
      </div>

      {/* Progress bar overall */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span
            className="text-white/25 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem" }}
          >
            Общий прогресс
          </span>
          <span
            className="text-white/40"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.7rem" }}
          >
            {Math.round((unlockedCount / achievementDefs.length) * 100)}%
          </span>
        </div>
        <div className="h-1 bg-white/5 w-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(unlockedCount / achievementDefs.length) * 100}%`,
            }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-[#9b2335] to-[#f59e0b]"
          />
        </div>
      </div>

      {/* Contract rank */}
      <div className="border border-white/5 bg-white/[0.01] p-4 mb-6 flex items-center gap-4">
        <div
          className="text-3xl"
          title={
            contractCount >= 25
              ? "Легенда"
              : contractCount >= 10
              ? "Ветеран"
              : contractCount >= 5
              ? "Профи"
              : contractCount >= 1
              ? "Боец"
              : "Новобранец"
          }
        >
          {contractCount >= 25
            ? "👑"
            : contractCount >= 10
            ? "🔱"
            : contractCount >= 5
            ? "⚡"
            : contractCount >= 1
            ? "🎯"
            : "🪣"}
        </div>
        <div>
          <p
            className="text-white/60"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
          >
            Ранг:{" "}
            <span className="text-[#9b2335]">
              {contractCount >= 25
                ? "Легенда"
                : contractCount >= 10
                ? "Ветеран"
                : contractCount >= 5
                ? "Профи"
                : contractCount >= 1
                ? "Боец"
                : "Новобранец"}
            </span>
          </p>
          <p
            className="text-white/25"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}
          >
            Закрыто контрактов: {contractCount}
          </p>
        </div>
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievementDefs.map((ach, i) => {
          const unlocked = isUnlocked(ach.id);
          const unlockDate = getUnlockDate(ach.id);
          const progress = getProgress(ach);

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border p-4 relative overflow-hidden transition-all duration-300"
              style={{
                borderColor: unlocked ? `${ach.color}30` : "rgba(255,255,255,0.05)",
                background: unlocked ? `${ach.color}08` : "rgba(255,255,255,0.005)",
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              {/* Glow if unlocked */}
              {unlocked && (
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                  style={{ background: `${ach.color}15` }}
                />
              )}

              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{ach.icon}</span>
                  {unlocked ? (
                    <div
                      className="px-1.5 py-0.5"
                      style={{
                        background: `${ach.color}15`,
                        border: `1px solid ${ach.color}30`,
                      }}
                    >
                      <span
                        className="uppercase tracking-wider"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "0.5rem",
                          color: ach.color,
                        }}
                      >
                        Получено
                      </span>
                    </div>
                  ) : (
                    <Lock size={14} className="text-white/15" strokeWidth={1.5} />
                  )}
                </div>

                <p
                  className="mb-1"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "0.9rem",
                    letterSpacing: "0.02em",
                    color: unlocked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {ach.title}
                </p>
                <p
                  className="text-white/25"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.7rem" }}
                >
                  {ach.description}
                </p>

                {/* Progress bar for contract achievements */}
                {progress && !unlocked && (
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span
                        className="text-white/20"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "0.58rem",
                        }}
                      >
                        {progress.current} / {progress.needed}
                      </span>
                      <span
                        className="text-white/20"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: "0.58rem",
                        }}
                      >
                        {progress.pct}%
                      </span>
                    </div>
                    <div className="h-0.5 bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="h-full"
                        style={{ background: ach.color }}
                      />
                    </div>
                  </div>
                )}

                {unlockDate && (
                  <p
                    className="mt-2"
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: "0.6rem",
                      color: `${ach.color}50`,
                    }}
                  >
                    Получено: {unlockDate}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

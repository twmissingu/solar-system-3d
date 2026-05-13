import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope } from 'lucide-react';
import { getControversiesForBody, Controversy } from '../data/controversies';
import { useStore } from '../store/useStore';

interface ScienceFrontiersProps {
  bodyId: string;
}

// Simple localStorage-based vote counts (global demo data)
function getStoredVote(controversyId: string): string | null {
  try {
    return localStorage.getItem(`vote-${controversyId}`);
  } catch {
    return null;
  }
}

function setStoredVote(controversyId: string, optionId: string) {
  try {
    localStorage.setItem(`vote-${controversyId}`, optionId);
  } catch {
    // ignore
  }
}

function getVoteCounts(controversyId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(`votes-count-${controversyId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function incrementVoteCount(controversyId: string, optionId: string) {
  try {
    const counts = getVoteCounts(controversyId);
    counts[optionId] = (counts[optionId] || 0) + 1;
    localStorage.setItem(`votes-count-${controversyId}`, JSON.stringify(counts));
  } catch {
    // ignore
  }
}

function getTotalVotes(controversyId: string): number {
  const counts = getVoteCounts(controversyId);
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

function getOptionPercent(controversyId: string, optionId: string): number {
  const total = getTotalVotes(controversyId);
  if (total === 0) return 0;
  const counts = getVoteCounts(controversyId);
  return Math.round(((counts[optionId] || 0) / total) * 100);
}

function ControversyCard({
  controversy,
  userVote,
  onVote,
}: {
  controversy: Controversy;
  userVote: string | null;
  onVote: (optionId: string) => void;
}) {
  const hasVoted = !!userVote;
  const total = getTotalVotes(controversy.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-lg border border-sci-cyan/15 bg-space-700/30 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-sci-cyan/10">
        <h3 className="text-sm font-bold text-sci-white/90">{controversy.question}</h3>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs text-sci-white/60 leading-relaxed mb-3">
          {controversy.description}
        </p>

        <div className="space-y-2">
          {controversy.options.map((opt) => {
            const isSelected = userVote === opt.id;
            const percent = getOptionPercent(controversy.id, opt.id);

            return (
              <div key={opt.id}>
                <button
                  onClick={() => !hasVoted && onVote(opt.id)}
                  disabled={hasVoted}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all border ${
                    isSelected
                      ? 'bg-sci-cyan/20 text-sci-cyan border-sci-cyan/40'
                      : hasVoted
                      ? 'bg-space-700/40 text-sci-white/40 border-transparent cursor-default'
                      : 'bg-space-700/40 text-sci-white/70 border-sci-cyan/10 hover:bg-sci-cyan/10 hover:border-sci-cyan/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.label}</span>
                    {hasVoted && (
                      <span className="text-[10px] font-mono text-sci-white/40 ml-2 shrink-0">
                        {percent}%
                      </span>
                    )}
                  </div>
                </button>

                {hasVoted && (
                  <div className="mt-1 h-1.5 bg-space-700/60 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-sci-cyan/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {hasVoted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-sci-cyan/10"
            >
              <p className="text-xs text-sci-cyan mb-1">
                你的选择：{controversy.options.find((o) => o.id === userVote)?.label}
              </p>
              <p className="text-[10px] text-sci-white/40">
                已有 {total} 人参与投票
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-2.5 bg-sci-gold/5 border-t border-sci-gold/10">
        <div className="flex items-start gap-2">
          <span className="text-sci-gold shrink-0 text-xs">💡</span>
          <p className="text-[11px] text-sci-white/60 leading-relaxed">{controversy.funFact}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ScienceFrontiers({ bodyId }: ScienceFrontiersProps) {
  const controversies = useMemo(() => getControversiesForBody(bodyId), [bodyId]);
  const { setUserVote, userVotes, unlockAchievement } = useStore();
  const [localVotes, setLocalVotes] = useState<Record<string, string>>({});

  // Hydrate from localStorage on mount
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const c of controversies) {
      const stored = getStoredVote(c.id);
      if (stored) map[c.id] = stored;
    }
    setLocalVotes(map);
  }, [bodyId]);

  const handleVote = useCallback(
    (controversyId: string, optionId: string) => {
      if (localVotes[controversyId]) return;
      setStoredVote(controversyId, optionId);
      incrementVoteCount(controversyId, optionId);
      setLocalVotes((prev) => ({ ...prev, [controversyId]: optionId }));
      setUserVote(controversyId, optionId);
      unlockAchievement('scientist_vote');
    },
    [localVotes, setUserVote, unlockAchievement]
  );

  if (controversies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-sci-white/40 italic">暂无该天体的科学前沿内容。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 模型精度教育卡片 */}
      <div className="rounded-lg border border-sci-cyan/15 bg-sci-cyan/5 p-3">
        <div className="flex items-start gap-2">
          <Microscope size={16} className="text-sci-cyan shrink-0" />
          <div>
            <p className="text-xs text-sci-cyan/80 font-medium mb-1">关于本应用的科学模型</p>
            <p className="text-[11px] text-sci-white/60 leading-relaxed">
              你看到的行星轨道是基于<span className="text-sci-white/80 font-medium">二体开普勒近似</span>计算的简化模型。
              真实的天体运动比这复杂得多——行星之间会相互引力拉扯（摄动），太阳也不是一个质点，
              广义相对论还会带来微小的轨道修正。
            </p>
            <p className="text-[11px] text-sci-white/60 leading-relaxed mt-1">
              例如，<span className="text-sci-white/80 font-medium">水星近日点每世纪会额外进动约43角秒</span>——
              这个牛顿力学无法解释的小偏差，正是爱因斯坦广义相对论的经典验证。
              爱因斯坦用时空弯曲的概念精确地预言了这个数值。
            </p>
            <p className="text-[11px] text-sci-cyan/60 leading-relaxed mt-1">
              💡 科学模型从不追求“完美”，而是追求“在当前条件下最有用”。
              简化模型让我们理解基本原理，复杂模型让我们逼近真实。
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-sci-gold/20 bg-sci-gold/5 p-3 flex items-start gap-2">
        <span className="text-sci-gold shrink-0 text-sm">⚡</span>
        <div>
          <p className="text-xs text-sci-gold/80 font-medium">这是科学家正在争论的问题</p>
          <p className="text-[11px] text-sci-white/50 mt-0.5 leading-relaxed">
            科学前沿没有标准答案。投出你的一票，看看大家怎么想！
          </p>
        </div>
      </div>

      {controversies.map((c) => (
        <ControversyCard
          key={c.id}
          controversy={c}
          userVote={localVotes[c.id] || userVotes[c.id] || null}
          onVote={(opt) => handleVote(c.id, opt)}
        />
      ))}
    </div>
  );
}

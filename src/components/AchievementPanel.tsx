import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { achievements, getRarityColor, getRarityLabel } from '../data/achievements';

function getConditionHint(condition: { type: string; bodyId?: string; bodyIds?: string[]; count?: number; level?: string; days?: number }): string {
  switch (condition.type) {
    case 'explore':
      return `探索天体：${condition.bodyId === '*' ? '任意天体' : condition.bodyId}`
    case 'explore_all':
      return `探索全部 ${condition.bodyIds?.length || 0} 颗指定天体`
    case 'explore_any':
      return `探索任一指定天体`
    case 'mission_complete':
      return `完成 ${condition.count} 个任务`
    case 'knowledge_unlock':
      return `解锁 ${condition.count} 个${condition.level}级知识`
    case 'time_travel':
      return `累计穿越 ${condition.days} 天`
    case 'eclipse_witness':
      return '见证一次月食'
    case 'manual':
      return '自然探索即可解锁'
    default:
      return '继续探索即可解锁'
  }
}

interface AchievementPanelProps {
  onClose: () => void;
}

export default function AchievementPanel({ onClose }: AchievementPanelProps) {
  const { unlockedAchievements } = useStore();

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(5, 11, 20, 0.92)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              成就系统
            </h2>
            <p className="text-xs text-sci-white/50 mt-1">
              已解锁 {unlockedCount} / {totalCount} 个成就
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
            aria-label="关闭成就面板"
            title="关闭"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4 shrink-0">
          <div className="h-2 bg-space-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#4ECDC4' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Achievement grid */}
        <div className="overflow-y-auto min-h-0 pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2">
            {achievements.map((achievement, index) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const rarityColor = getRarityColor(achievement.rarity);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                  className={`sci-panel sci-corner p-3 sm:p-4 flex flex-col gap-2 ${
                    isUnlocked ? '' : 'opacity-60'
                  }`}
                  title={!isUnlocked ? getConditionHint(achievement.condition) : undefined}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-2xl sm:text-3xl ${isUnlocked ? '' : 'grayscale'}`}
                    >
                      {achievement.icon}
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        color: rarityColor,
                        backgroundColor: `${rarityColor}15`,
                        border: `1px solid ${rarityColor}30`,
                      }}
                    >
                      {getRarityLabel(achievement.rarity)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isUnlocked ? 'text-sci-white sci-text-glow' : 'text-sci-white/40'
                      }`}
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {isUnlocked ? achievement.name : '???'}
                    </h3>
                    <p className="text-xs text-sci-white/50 mt-1 leading-relaxed line-clamp-2">
                      {isUnlocked ? (
                        achievement.description
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="shrink-0"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          尚未解锁
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { evaluateAchievements } from '../utils/achievements'
import { KnowledgeItemV2, KnowledgeLevel } from '../data/knowledgeV2'

interface KnowledgeExplorerProps {
  knowledge: KnowledgeItemV2
}

const levelConfig: Record<
  KnowledgeLevel,
  { label: string; color: string; barColor: string }
> = {
  bronze: { label: '青铜', color: '#CD7F32', barColor: '#CD7F32' },
  silver: { label: '白银', color: '#C0C0C0', barColor: '#C0C0C0' },
  gold: { label: '黄金', color: '#FFD700', barColor: '#FFD700' },
}

const levels: KnowledgeLevel[] = ['bronze', 'silver', 'gold']

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function KnowledgeExplorer({ knowledge }: KnowledgeExplorerProps) {
  const { unlockedAchievements, incrementKnowledgeCount } = useStore()
  const [activeLevel, setActiveLevel] = useState<KnowledgeLevel>('bronze')
  const [followUpVisible, setFollowUpVisible] = useState(false)
  const [followUpIndex, setFollowUpIndex] = useState(0)

  const isLevelUnlocked = useCallback(
    (level: KnowledgeLevel) => {
      const req = knowledge.levels[level].unlockRequirement
      if (req === null) return true
      return unlockedAchievements.includes(req)
    },
    [knowledge, unlockedAchievements]
  )

  // Track first visit for each level
  useEffect(() => {
    if (!isLevelUnlocked(activeLevel)) return
    try {
      const visitedKey = `visited-${knowledge.id}-${activeLevel}`
      if (!localStorage.getItem(visitedKey)) {
        localStorage.setItem(visitedKey, 'true')
        incrementKnowledgeCount(activeLevel)
        evaluateAchievements()
      }
    } catch {
      // localStorage 不可用（如隐私模式），尝试用 sessionStorage 去重
      try {
        const visitedKey = `visited-${knowledge.id}-${activeLevel}`
        if (!sessionStorage.getItem(visitedKey)) {
          sessionStorage.setItem(visitedKey, 'true')
          incrementKnowledgeCount(activeLevel)
          evaluateAchievements()
        }
      } catch {
        // 存储完全不可用，仅首次渲染时计数
        incrementKnowledgeCount(activeLevel)
        evaluateAchievements()
      }
    }
  }, [activeLevel, knowledge.id, isLevelUnlocked, incrementKnowledgeCount])

  // Reset follow-up when knowledge changes
  useEffect(() => {
    setFollowUpVisible(false)
    setFollowUpIndex(0)
    setActiveLevel('bronze')
  }, [knowledge.id])

  const handleTabClick = (level: KnowledgeLevel) => {
    if (!isLevelUnlocked(level)) return
    if (level !== activeLevel) {
      setActiveLevel(level)
    }
  }

  const handleRevealFollowUp = () => {
    setFollowUpVisible(true)
  }

  const handleNextFollowUp = () => {
    if (followUpIndex < knowledge.followUpChain.length - 1) {
      setFollowUpIndex((prev) => prev + 1)
    }
  }

  const currentLevelData = knowledge.levels[activeLevel]
  const config = levelConfig[activeLevel]
  const visibleFollowUps = knowledge.followUpChain.slice(0, followUpIndex + 1)
  const canShowMoreFollowUp =
    followUpVisible && followUpIndex < knowledge.followUpChain.length - 1

  return (
    <div>
      {/* Level Tabs */}
      <div className="flex gap-2 mb-4">
        {levels.map((level) => {
          const unlocked = isLevelUnlocked(level)
          const isActive = activeLevel === level
          const lvlCfg = levelConfig[level]
          return (
            <button
              key={level}
              onClick={() => handleTabClick(level)}
              disabled={!unlocked}
              title={!unlocked ? '需要解锁相应成就才能查看' : lvlCfg.label}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 border ${
                isActive
                  ? 'bg-space-700/60 border-opacity-60'
                  : unlocked
                  ? 'bg-space-700/20 border-sci-white/10 text-sci-white/50 hover:bg-space-700/40 hover:text-sci-white/70'
                  : 'bg-space-700/10 border-sci-white/5 text-sci-white/20 cursor-not-allowed'
              }`}
              style={
                isActive
                  ? {
                      borderColor: lvlCfg.color,
                      color: lvlCfg.color,
                      boxShadow: `inset 0 0 12px ${lvlCfg.color}15`,
                    }
                  : {}
              }
            >
              {!unlocked && <LockIcon className="opacity-50" />}
              <span>{lvlCfg.label}</span>
            </button>
          )
        })}
      </div>

      {/* Level Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLevel}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.35, type: 'spring', damping: 22, stiffness: 200 }}
        >
          <div className="mb-4">
            <h3
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: config.color }}
            >
              <span
                className="w-1 h-5 rounded-full shrink-0"
                style={{ backgroundColor: config.barColor }}
              />
              <span className="leading-tight">{currentLevelData.title}</span>
            </h3>
            <p className="text-sm text-sci-white/80 leading-relaxed mb-4">
              {currentLevelData.content}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Follow-up Chain */}
      <div className="mb-4">
        {!followUpVisible ? (
          <button
            onClick={handleRevealFollowUp}
            className="w-full py-2.5 rounded-lg text-xs sm:text-sm text-sci-cyan/80 border border-sci-cyan/20 bg-sci-cyan/5 hover:bg-sci-cyan/10 hover:text-sci-cyan transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>点击展开追问链，深入探索</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="border border-sci-cyan/15 rounded-lg bg-space-700/20 overflow-hidden">
            <div className="px-3 py-2 border-b border-sci-cyan/10 bg-sci-cyan/5">
              <p className="text-xs text-sci-cyan/70 font-medium">追问链</p>
            </div>
            <div className="p-3 sm:p-4 flex flex-col gap-3">
              <AnimatePresence>
                {visibleFollowUps.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, delay: idx === followUpIndex ? 0.1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-sci-cyan font-medium leading-relaxed">
                        Q: {item.question}
                      </p>
                      <p className="text-sm text-sci-white/80 leading-relaxed pl-4 border-l-2 border-sci-white/10">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {canShowMoreFollowUp && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleNextFollowUp}
                  className="self-start sci-button text-xs py-1.5 px-3"
                >
                  继续追问 →
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fun Fact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-sci-cyan/5 border border-sci-cyan/20 rounded-lg p-4"
      >
        <div className="flex items-start gap-2">
          <span className="text-sci-gold text-lg shrink-0">💡</span>
          <div>
            <p className="text-xs text-sci-cyan font-medium mb-1">趣味知识</p>
            <p className="text-sm text-sci-white/70 leading-relaxed">
              {currentLevelData.funFact}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

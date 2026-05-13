import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import {
  explorationMilestones,
  ExplorationMilestone,
  ExplorationEra,
  eraConfig,
  getMilestoneById,
} from '../data/explorationHistory'
import { celestialBodies, dwarfPlanets } from '../data/celestialData'
import { scientists } from '../data/scientists'

const eras: ExplorationEra[] = ['ancient', 'telescope', 'space-race', 'deep-space', 'future']

function buildBodyNameMap(): Map<string, string> {
  const map = new Map<string, string>()
  const addBody = (body: (typeof celestialBodies)[0]) => {
    map.set(body.id, body.nameZh)
    body.satellites?.forEach(addBody)
  }
  celestialBodies.forEach(addBody)
  dwarfPlanets.forEach(addBody)
  return map
}

const bodyNameMap = buildBodyNameMap()

function buildScientistNameMap(): Map<string, string> {
  const map = new Map<string, string>()
  scientists.forEach((s) => map.set(s.id, s.name))
  return map
}

const scientistNameMap = buildScientistNameMap()

const eraColors: Record<ExplorationEra, string> = {
  ancient: '#CD7F32',
  telescope: '#C0C0C0',
  'space-race': '#4ECDC4',
  'deep-space': '#6C63FF',
  future: '#FFD700',
}

export default function ExplorationHistoryPanel() {
  const {
    showExplorationHistory,
    setShowExplorationHistory,
    selectedBody,
    setSelectedBody,
    setCameraTarget,
    setCameraLookAt,
    setShowScientistGallery,
    setShowSpacecraftPanel,
    setSelectedSpacecraft,
  } = useStore()

  const [activeEra, setActiveEra] = useState<ExplorationEra>('ancient')
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)

  const milestonesByEra = useMemo(() => {
    const map: Record<ExplorationEra, ExplorationMilestone[]> = {
      ancient: [],
      telescope: [],
      'space-race': [],
      'deep-space': [],
      future: [],
    }
    explorationMilestones.forEach((m) => map[m.era].push(m))
    return map
  }, [])

  const selectedMilestone = selectedMilestoneId
    ? getMilestoneById(selectedMilestoneId)
    : null

  const handleClose = useCallback(() => {
    setShowExplorationHistory(false)
    setSelectedMilestoneId(null)
  }, [setShowExplorationHistory])

  useEffect(() => {
    if (!showExplorationHistory) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showExplorationHistory, handleClose])

  const handleViewInScene = (milestone: ExplorationMilestone) => {
    if (!milestone.relatedBodies || milestone.relatedBodies.length === 0) return
    const targetId = milestone.cameraTarget?.bodyId || milestone.relatedBodies[0]
    const dist = milestone.cameraTarget?.distance || 15
    const allBodies = [...celestialBodies, ...dwarfPlanets]
    let targetBody: (typeof allBodies)[0] | undefined

    const findBody = (bodies: typeof allBodies): (typeof allBodies)[0] | undefined => {
      for (const b of bodies) {
        if (b.id === targetId) return b
        if (b.satellites) {
          const found = findBody(b.satellites)
          if (found) return found
        }
      }
      return undefined
    }
    targetBody = findBody(allBodies)

    if (targetBody) {
      setSelectedBody(targetBody)
      setCameraTarget([dist, dist * 0.3, dist])
      setCameraLookAt([0, 0, 0])
    }
    setShowExplorationHistory(false)
    setSelectedMilestoneId(null)
  }

  const handleGoToScientist = (scientistId: string) => {
    setShowExplorationHistory(false)
    setSelectedMilestoneId(null)
    setShowScientistGallery(true)
    const { setExplorationHistorySelectedMilestone } = useStore.getState()
    setExplorationHistorySelectedMilestone(scientistId)
  }

  const handleGoToSpacecraft = (spacecraftId: string) => {
    setShowExplorationHistory(false)
    setSelectedMilestoneId(null)
    setShowSpacecraftPanel(true)
    setSelectedSpacecraft(spacecraftId)
  }

  if (!showExplorationHistory) return null

  const currentMilestones = milestonesByEra[activeEra]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(5, 11, 20, 0.92)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              🚀 人类探索太阳系历程
            </h2>
            <p className="text-xs text-sci-white/50 mt-1">
              从肉眼观星到深空探测，回顾人类认识太阳系的每一个关键脚印
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors shrink-0"
            aria-label="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Era Tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 shrink-0 overflow-x-auto pb-1 scrollbar-hide">
          {eras.map((era) => {
            const config = eraConfig[era]
            const isActive = activeEra === era
            return (
              <button
                key={era}
                onClick={() => {
                  setActiveEra(era)
                  setSelectedMilestoneId(null)
                }}
                className={`flex flex-col items-start px-3 sm:px-4 py-2 rounded-lg text-left transition-all duration-300 shrink-0 border ${
                  isActive
                    ? 'bg-space-700/60'
                    : 'bg-space-700/20 border-sci-white/10 text-sci-white/50 hover:bg-space-700/40 hover:text-sci-white/70'
                }`}
                style={
                  isActive
                    ? {
                        borderColor: `${eraColors[era]}60`,
                        boxShadow: `inset 0 0 12px ${eraColors[era]}15`,
                      }
                    : {}
                }
              >
                <span
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: isActive ? eraColors[era] : undefined }}
                >
                  {config.label}
                </span>
                <span className="text-[10px] text-sci-white/40 mt-0.5">{config.years}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="sci-panel sci-corner p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">
          <AnimatePresence mode="wait">
            {selectedMilestone ? (
              /* Detail View */
              <motion.div
                key={selectedMilestone.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setSelectedMilestoneId(null)}
                  className="text-xs text-sci-cyan hover:text-sci-cyan/80 mb-4 flex items-center gap-1"
                >
                  ← 返回时间线
                </button>

                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl sm:text-4xl shrink-0">{selectedMilestone.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold text-sci-white">
                        {selectedMilestone.title}
                      </h3>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          color: eraColors[selectedMilestone.era],
                          backgroundColor: `${eraColors[selectedMilestone.era]}20`,
                          borderColor: `${eraColors[selectedMilestone.era]}40`,
                          borderWidth: 1,
                        }}
                      >
                        {eraConfig[selectedMilestone.era].label}
                      </span>
                    </div>
                    <p className="text-xs text-sci-cyan/60 mt-0.5 font-mono">
                      {selectedMilestone.titleEn}
                    </p>
                    <p className="text-xs text-sci-white/40 mt-1">
                      {selectedMilestone.year <= 0
                        ? `约 ${Math.abs(selectedMilestone.year)} 年`
                        : `${selectedMilestone.year} 年`}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-sci-white/80 leading-relaxed mb-3">
                    {selectedMilestone.description}
                  </p>
                  <div className="bg-sci-cyan/5 border border-sci-cyan/15 rounded-lg p-3 sm:p-4">
                    <p className="text-xs text-sci-cyan font-medium mb-1">科学意义</p>
                    <p className="text-sm text-sci-white/90 leading-relaxed">
                      {selectedMilestone.significance}
                    </p>
                  </div>
                </div>

                {/* Fun Fact */}
                {selectedMilestone.funFact && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-sci-gold/5 border border-sci-gold/15 rounded-lg p-3 mb-4"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sci-gold shrink-0 text-sm">✨</span>
                      <p className="text-xs text-sci-white/70 leading-relaxed">
                        {selectedMilestone.funFact}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Controversy Note */}
                {selectedMilestone.controversyNote && (
                  <div className="bg-sci-blue/5 border border-sci-blue/15 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-sci-blue shrink-0 text-sm">⚠️</span>
                      <p className="text-xs text-sci-white/60 leading-relaxed">
                        {selectedMilestone.controversyNote}
                      </p>
                    </div>
                  </div>
                )}

                {/* Related Entities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMilestone.relatedScientists?.map((sId) => (
                    <button
                      key={sId}
                      onClick={() => handleGoToScientist(sId)}
                      className="text-[10px] sm:text-xs px-2 py-1 rounded bg-sci-cyan/10 text-sci-cyan border border-sci-cyan/20 hover:bg-sci-cyan/20 transition-colors"
                    >
                      🔬 {scientistNameMap.get(sId) || sId}
                    </button>
                  ))}
                  {selectedMilestone.relatedSpacecraft?.map((scId) => (
                    <button
                      key={scId}
                      onClick={() => handleGoToSpacecraft(scId)}
                      className="text-[10px] sm:text-xs px-2 py-1 rounded bg-sci-blue/10 text-sci-blue border border-sci-blue/20 hover:bg-sci-blue/20 transition-colors"
                    >
                      🛰️ {scId === 'voyager1' ? '旅行者1号' : scId === 'voyager2' ? '旅行者2号' : scId === 'juno' ? '朱诺号' : scId === 'newhorizons' ? '新视野号' : scId}
                    </button>
                  ))}
                  {selectedMilestone.relatedBodies
                    ?.filter((bId) => bId !== 'interstellar')
                    .map((bId) => (
                      <button
                        key={bId}
                        onClick={() => handleViewInScene(selectedMilestone)}
                        className="text-[10px] sm:text-xs px-2 py-1 rounded bg-sci-green/10 text-green-400 border border-green-400/20 hover:bg-sci-green/20 transition-colors"
                      >
                        🌍 {bodyNameMap.get(bId) || bId}
                      </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-sci-white/10">
                  {(selectedMilestone.relatedBodies?.length ?? 0) > 0 && (
                    <button
                      onClick={() => handleViewInScene(selectedMilestone)}
                      className="sci-button-primary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      🎯 在 3D 场景中查看
                    </button>
                  )}
                  {selectedMilestone.searchKeyword && (
                    <p className="text-[10px] text-sci-white/30 self-center ml-auto">
                      想了解更多？搜索：{selectedMilestone.searchKeyword}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Timeline View */
              <motion.div
                key={activeEra}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Era Description */}
                <p className="text-xs sm:text-sm text-sci-white/50 mb-4 italic">
                  {eraConfig[activeEra].description}
                </p>

                {currentMilestones.length === 0 ? (
                  <p className="text-sm text-sci-white/40 text-center py-8">暂无该时代的里程碑事件</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {currentMilestones.map((milestone, idx) => (
                      <motion.button
                        key={milestone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => setSelectedMilestoneId(milestone.id)}
                        className="sci-panel p-3 sm:p-4 text-left hover:border-sci-cyan/30 transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Year Badge */}
                          <div className="shrink-0 text-center w-14 sm:w-16">
                            <span
                              className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded"
                              style={{
                                color: eraColors[milestone.era],
                                backgroundColor: `${eraColors[milestone.era]}15`,
                              }}
                            >
                              {milestone.year <= 0
                                ? `${Math.abs(milestone.year)} BC`
                                : milestone.year}
                            </span>
                          </div>

                          {/* Icon */}
                          <span className="text-xl sm:text-2xl shrink-0 mt-0.5">
                            {milestone.icon}
                          </span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-sci-white group-hover:text-sci-cyan transition-colors">
                              {milestone.title}
                            </h4>
                            <p className="text-[10px] text-sci-white/30 mt-0.5 font-mono">
                              {milestone.titleEn}
                            </p>
                            <p className="text-xs sm:text-sm text-sci-white/60 mt-1.5 leading-relaxed line-clamp-2">
                              {milestone.significance}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {milestone.relatedBodies && milestone.relatedBodies.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sci-cyan/10 text-sci-cyan/70">
                                  {milestone.relatedBodies
                                    .filter((b) => b !== 'interstellar')
                                    .map((b) => bodyNameMap.get(b) || b)
                                    .slice(0, 3)
                                    .join('、')}
                                  {(milestone.relatedBodies.filter((b) => b !== 'interstellar').length > 3) ? '...' : ''}
                                </span>
                              )}
                              {milestone.relatedScientists && milestone.relatedScientists.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sci-gold/10 text-sci-gold/70">
                                  {milestone.relatedScientists.map((s) => scientistNameMap.get(s) || s).join('、')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="shrink-0 text-sci-white/20 group-hover:text-sci-cyan/50 mt-1 transition-colors"
                          >
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-sci-white/30">
            共 {explorationMilestones.length} 个里程碑事件
          </p>
          {selectedMilestone && selectedMilestone.highlightAchievement && (
            <p className="text-[10px] text-sci-gold">
              🏅 关联成就：{selectedMilestone.highlightAchievement}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

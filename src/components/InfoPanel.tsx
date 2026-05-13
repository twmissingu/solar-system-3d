import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Microscope, Layers, Telescope, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getKnowledgeForBody } from '../data/knowledgeV2'
import KnowledgeExplorer from './KnowledgeExplorer'
import InstrumentsPanel from './InstrumentsPanel'
import InterdisciplinaryPanel from './InterdisciplinaryPanel'
import ObservationGuide from './ObservationGuide'
import ScienceFrontiers from './ScienceFrontiers'
import PlanetPreview from './PlanetPreview'
import { getRealVisualRadius, dwarfPlanets, celestialBodies } from '../data/celestialData'

const EARTH_RADIUS_KM = 6371
const EARTH_ROTATION_HOURS = 24
const EARTH_ORBIT_PERIOD = 365.25

const tabs = [
  { id: 'knowledge' as const, label: '知识探索', Icon: BookOpen },
  { id: 'instruments' as const, label: '科学仪器', Icon: Microscope },
  { id: 'interdisciplinary' as const, label: '跨学科', Icon: Layers },
  { id: 'observation' as const, label: '今晚观测', Icon: Telescope },
  { id: 'frontiers' as const, label: '科学前沿', Icon: Sparkles },
]

function getComparisonPercent(value: number, baseline: number): number {
  if (baseline === 0) return 0
  const pct = (value / baseline) * 100
  return Math.min(pct, 100)
}

function getBarColor(percent: number): string {
  if (percent <= 20) return '#4ECDC4'
  if (percent <= 50) return '#5B7CFF'
  if (percent <= 100) return '#FDB813'
  return '#E27B58'
}

export default function InfoPanel() {
  const { selectedBody, showKnowledge, setShowKnowledge, scaleMode } = useStore()
  const [infoTab, setInfoTab] = useState<(typeof tabs)[0]['id']>('knowledge')

  useEffect(() => {
    setInfoTab('knowledge')
  }, [selectedBody?.id])

  const knowledgeV2 = useMemo(() => {
    if (!selectedBody) return null
    return getKnowledgeForBody(selectedBody.id) || null
  }, [selectedBody])

  if (!selectedBody) return null

  const isSun = selectedBody.id === 'sun'

  // 数据对比计算
  const diameterPct = isSun ? 100 : getComparisonPercent(selectedBody.radiusKm * 2, EARTH_RADIUS_KM * 2)
  const rotationPct = isSun ? getComparisonPercent(selectedBody.rotationPeriod, EARTH_ROTATION_HOURS * 25) : getComparisonPercent(selectedBody.rotationPeriod, EARTH_ROTATION_HOURS * 5)
  const orbitPct = isSun ? 0 : getComparisonPercent(selectedBody.orbit.period, EARTH_ORBIT_PERIOD * 2)

  const dataItems = isSun
    ? [
        { label: '直径', value: `${(selectedBody.radiusKm * 2).toLocaleString()} km`, percent: 100 },
        { label: '自转周期', value: `${selectedBody.rotationPeriod.toFixed(1)} 小时`, percent: rotationPct },
        { label: '表面温度', value: '约 5778 K', percent: 100 },
        { label: '核心温度', value: '约 1500 万 K', percent: 100 },
      ]
    : [
        { label: '直径', value: `${(selectedBody.radiusKm * 2).toLocaleString()} km`, percent: diameterPct, suffix: `≈地球的${(selectedBody.radiusKm / EARTH_RADIUS_KM).toFixed(1)}倍` },
        { label: '自转周期', value: `${selectedBody.rotationPeriod.toFixed(1)} 小时`, percent: rotationPct },
        { label: '公转周期', value: `${selectedBody.orbit.period.toLocaleString()} 天`, percent: orbitPct, suffix: `≈${(selectedBody.orbit.period / EARTH_ORBIT_PERIOD).toFixed(1)}年` },
        { label: '轨道半长轴', value: `${selectedBody.orbit.a} AU`, percent: getComparisonPercent(selectedBody.orbit.a, 30) },
      ]

  return (
    <AnimatePresence>
      {showKnowledge && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] z-30 flex flex-col"
        >
          <div className="sci-panel sci-corner flex flex-col h-full overflow-hidden m-0 sm:m-4 rounded-none sm:rounded-lg border-r-0 sm:border-r">
            {/* 头部 - 含行星预览 */}
            <div className="p-4 sm:p-5 border-b border-sci-cyan/10 shrink-0">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <PlanetPreview bodyId={selectedBody.id} size={64} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h2
                      className="text-lg sm:text-xl font-bold text-sci-white sci-text-glow truncate"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {selectedBody.nameZh}
                      {dwarfPlanets.some((d) => d.id === selectedBody.id) && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sci-white/10 text-sci-white/50 ml-2">
                          矮行星
                        </span>
                      )}
                    </h2>
                    <button
                      onClick={() => setShowKnowledge(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors interactive-hover shrink-0 ml-2"
                      aria-label="关闭信息面板"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 1l12 12M13 1L1 13" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-sci-cyan/60 font-mono tracking-wider mb-2">
                    {selectedBody.name.toUpperCase()}
                  </p>
                  <p className="text-xs text-sci-white/60 leading-relaxed line-clamp-2">
                    {selectedBody.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 数据指标 - 可视化对比条 */}
            <div className="px-4 sm:px-5 py-3 border-b border-sci-cyan/10 shrink-0 space-y-2.5">
              {dataItems.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-sci-white/40 uppercase tracking-wider">{item.label}</span>
                    <span className="text-[10px] sm:text-xs text-sci-white/80 font-mono">
                      {item.value}
                      {item.suffix && <span className="text-sci-white/40 ml-1">{item.suffix}</span>}
                    </span>
                  </div>
                  <div className="data-bar-bg">
                    <div
                      className="data-bar-fill"
                      style={{
                        width: `${Math.min(item.percent, 100)}%`,
                        backgroundColor: getBarColor(item.percent),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 尺度对比 */}
            {scaleMode === 'exaggerated' && !isSun && (
              <div className="px-4 sm:px-5 py-2 border-b border-sci-cyan/10 bg-sci-cyan/5">
                <p className="text-[10px] text-sci-cyan/70">
                  当前显示直径已放大 {(() => {
                    const realRadius = getRealVisualRadius(selectedBody.radiusKm)
                    return realRadius > 0 ? (selectedBody.visualRadius / realRadius).toFixed(1) : '—'
                  })()} 倍，真实比例下此天体极小
                </p>
              </div>
            )}

            {/* 左侧图标Tab栏 */}
            <div className="flex border-b border-sci-cyan/10 shrink-0">
              <div className="flex flex-row sm:flex-col gap-0.5 p-2 border-r border-sci-cyan/10 bg-space-800/30">
                {tabs.map((tab) => {
                  const Icon = tab.Icon
                  const isActive = infoTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInfoTab(tab.id)}
                      className={`flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap interactive-hover ${
                        isActive
                          ? 'bg-sci-cyan/15 text-sci-cyan'
                          : 'text-sci-white/40 hover:text-sci-white/70 hover:bg-sci-cyan/5'
                      }`}
                      title={tab.label}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={infoTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {infoTab === 'knowledge' && (
                      knowledgeV2 ? (
                        <KnowledgeExplorer knowledge={knowledgeV2} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-sci-white/40 italic mb-2">暂无该天体的详细科普内容。</p>
                          <p className="text-xs text-sci-white/30">完成任务可以解锁更多知识！</p>
                        </div>
                      )
                    )}
                    {infoTab === 'instruments' && <InstrumentsPanel bodyId={selectedBody.id} />}
                    {infoTab === 'interdisciplinary' && <InterdisciplinaryPanel bodyId={selectedBody.id} />}
                    {infoTab === 'observation' && <ObservationGuide bodyId={selectedBody.id} />}
                    {infoTab === 'frontiers' && <ScienceFrontiers bodyId={selectedBody.id} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="p-3 sm:p-4 border-t border-sci-cyan/10 flex gap-2 shrink-0">
              <button
                onClick={() => setShowKnowledge(false)}
                className="sci-button flex-1 text-center text-xs sm:text-sm py-2"
              >
                收起面板
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

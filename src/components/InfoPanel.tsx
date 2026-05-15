import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Microscope, Layers, Telescope, Sparkles, X, Circle, RotateCw, Orbit, Ruler, Thermometer, Flame } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getKnowledgeForBody } from '../data/knowledgeV2'
import KnowledgeExplorer from './KnowledgeExplorer'
import InstrumentsPanel from './InstrumentsPanel'
import InterdisciplinaryPanel from './InterdisciplinaryPanel'
import ObservationGuide from './ObservationGuide'
import ScienceFrontiers from './ScienceFrontiers'
import PlanetPreview from './PlanetPreview'
import { dwarfPlanets, EARTH_RADIUS_KM } from '../data/celestialData'

const EARTH_ROTATION_HOURS = 23.93
const EARTH_ORBIT_PERIOD = 365.25

/**
 * 对数对比条宽度：地球 (1x) 在 50%，每数量级差 25%
 * 0.01x → 0%   |   0.1x → 25%   |   1x → 50%   |   10x → 75%   |   100x → 100%
 */
function getBarRatio(ratio: number): number {
  if (ratio <= 0) return 0
  return Math.min(100, Math.max(0, ((Math.log10(ratio) + 2) / 4) * 100))
}

function getBarColor(ratio: number): string {
  const pct = getBarRatio(ratio)
  if (pct <= 25) return '#4ECDC4'
  if (pct <= 50) return '#5B7CFF'
  if (pct <= 75) return '#FDB813'
  return '#E27B58'
}

const tabs = [
  { id: 'knowledge' as const, label: '知识探索', Icon: BookOpen },
  { id: 'instruments' as const, label: '科学仪器', Icon: Microscope },
  { id: 'interdisciplinary' as const, label: '跨学科', Icon: Layers },
  { id: 'observation' as const, label: '今晚观测', Icon: Telescope },
  { id: 'frontiers' as const, label: '科学前沿', Icon: Sparkles },
]

export default function InfoPanel() {
  const { selectedBody, showKnowledge, setShowKnowledge, planetScale } = useStore()
  const [infoTab, setInfoTab] = useState<(typeof tabs)[0]['id']>('knowledge')
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInfoTab('knowledge')
    setDescriptionExpanded(false)
  }, [selectedBody?.id])

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [infoTab])

  const knowledgeV2 = useMemo(() => {
    if (!selectedBody) return null
    return getKnowledgeForBody(selectedBody.id) || null
  }, [selectedBody])

  if (!selectedBody) return null

  const isSun = selectedBody.id === 'sun'

  // 数据对比计算（以地球为基准，使用对数缩放条）
  const dataItems = isSun
    ? [
        { label: '直径', Icon: Circle, value: `${(selectedBody.radiusKm * 2).toLocaleString()} km`, ratio: selectedBody.radiusKm / EARTH_RADIUS_KM, earthSuffix: `${(selectedBody.radiusKm / EARTH_RADIUS_KM).toFixed(1)} 倍` },
        { label: '自转周期', Icon: RotateCw, value: `${selectedBody.rotationPeriod.toFixed(1)} 小时`, ratio: selectedBody.rotationPeriod / EARTH_ROTATION_HOURS, earthSuffix: `${(selectedBody.rotationPeriod / EARTH_ROTATION_HOURS).toFixed(1)} 倍` },
        { label: '表面温度', Icon: Thermometer, value: '约 5778 K', ratio: null, earthSuffix: '' },
        { label: '核心温度', Icon: Flame, value: '约 1500 万 K', ratio: null, earthSuffix: '' },
      ]
    : [
        { label: '直径', Icon: Circle, value: `${(selectedBody.radiusKm * 2).toLocaleString()} km`, ratio: selectedBody.radiusKm / EARTH_RADIUS_KM, earthSuffix: `${(selectedBody.radiusKm / EARTH_RADIUS_KM).toFixed(1)} 倍` },
        { label: '自转周期', Icon: RotateCw, value: `${selectedBody.rotationPeriod.toFixed(1)} 小时`, ratio: selectedBody.rotationPeriod / EARTH_ROTATION_HOURS, earthSuffix: `${(selectedBody.rotationPeriod / EARTH_ROTATION_HOURS).toFixed(1)} 倍` },
        { label: '公转周期', Icon: Orbit, value: `${selectedBody.orbit.period.toLocaleString()} 天`, ratio: selectedBody.orbit.period / EARTH_ORBIT_PERIOD, earthSuffix: `${(selectedBody.orbit.period / EARTH_ORBIT_PERIOD).toFixed(1)} 年` },
        { label: '轨道半长轴', Icon: Ruler, value: `${selectedBody.orbit.a} AU`, ratio: selectedBody.orbit.a / 1, earthSuffix: `${selectedBody.orbit.a.toFixed(1)} 倍` },
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
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-sci-cyan/60 font-mono tracking-wider mb-2">
                    {selectedBody.name.toUpperCase()}
                  </p>
                  <p className={`text-xs text-sci-white/60 leading-relaxed ${descriptionExpanded ? '' : 'line-clamp-2'}`}>
                    {selectedBody.description}
                  </p>
                  <button
                    onClick={() => setDescriptionExpanded((v) => !v)}
                    className="text-[10px] text-sci-cyan/60 hover:text-sci-cyan transition-colors mt-0.5"
                  >
                    {descriptionExpanded ? '收起 ↑' : '展开全文 →'}
                  </button>
                </div>
              </div>
            </div>

            {/* 数据指标 - 2×2 网格对比卡片 */}
            <div className="grid grid-cols-2 gap-2 px-4 sm:px-5 py-3 border-b border-sci-cyan/10 shrink-0">
              {dataItems.map((item) => {
                const barPct = item.ratio !== null ? getBarRatio(item.ratio) : 0
                return (
                  <div
                    key={item.label}
                    className="bg-space-800/40 border border-sci-cyan/10 rounded-lg p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <item.Icon size={12} className="text-sci-cyan/60 shrink-0" />
                      <span className="text-[10px] text-sci-white/40 uppercase tracking-wider">{item.label}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[11px] sm:text-xs text-sci-white/90 font-mono font-medium truncate">
                        {item.value}
                      </span>
                      {item.ratio !== null && (
                        <span className="text-[10px] text-sci-cyan font-mono shrink-0">◉ {item.earthSuffix}</span>
                      )}
                    </div>
                    {item.ratio !== null && (
                      <div className="data-bar-bg">
                        <div
                          className="data-bar-fill"
                          style={{
                            width: `${barPct}%`,
                            backgroundColor: getBarColor(item.ratio),
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 天体放大比例说明 */}
            {selectedBody && (
              <div className="px-4 sm:px-5 py-2 border-b border-sci-cyan/10 bg-sci-cyan/5">
                <p className="text-[10px] text-sci-cyan/70">
                  太阳系所有天体按真实直径比例显示。
                  当前天体放大 <span className="text-sci-cyan font-mono">{planetScale}x</span>（太阳固定为真实大小），仅影响视觉大小，不影响轨道位置。
                </p>
              </div>
            )}

            {/* 左侧图标Tab栏 */}
            <div className="flex flex-1 min-h-0 border-b border-sci-cyan/10">
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
              <div ref={contentRef} className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0">
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
              <p className="sm:hidden text-[10px] text-sci-white/30 self-center">
                点击右上角 X 关闭面板
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

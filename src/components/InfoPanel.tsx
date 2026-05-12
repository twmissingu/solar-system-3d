import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { knowledgeData } from '../data/knowledge'
import { getRealVisualRadius, EARTH_RADIUS_KM, dwarfPlanets } from '../data/celestialData'

export default function InfoPanel() {
  const { selectedBody, showKnowledge, setShowKnowledge, scaleMode } = useStore()

  const knowledge = useMemo(() => {
    if (!selectedBody) return null
    return knowledgeData.find((k) => k.targetBody === selectedBody.id) || null
  }, [selectedBody])

  return (
    <AnimatePresence>
      {showKnowledge && selectedBody && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-30 flex flex-col"
        >
          <div className="sci-panel sci-corner flex flex-col h-full overflow-hidden m-0 sm:m-4 rounded-none sm:rounded-lg border-r-0 sm:border-r">
            {/* 头部 */}
            <div className="p-4 sm:p-5 border-b border-sci-cyan/10 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2
                  className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  {selectedBody.nameZh}
                  {dwarfPlanets.some((d) => d.id === selectedBody.id) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sci-white/10 text-sci-white/50 ml-2">
                      矮行星
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-sci-cyan/60 font-mono tracking-wider hidden sm:inline">
                    {selectedBody.name.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setShowKnowledge(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
                    aria-label="关闭信息面板"
                    title="关闭"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-sci-white/60 leading-relaxed">
                {selectedBody.description}
              </p>
            </div>

            {/* 数据指标 */}
            <div className="px-4 sm:px-5 py-3 grid grid-cols-2 gap-2 sm:gap-3 border-b border-sci-cyan/10 shrink-0">
              <DataItem label="直径" value={`${(selectedBody.radiusKm * 2).toLocaleString()} km`} />
              <DataItem label="自转周期" value={`${selectedBody.rotationPeriod.toFixed(1)} 小时`} />
              <DataItem
                label="公转周期"
                value={selectedBody.orbit.period > 0 ? `${selectedBody.orbit.period.toLocaleString()} 天` : '—'}
              />
              <DataItem label="自转轴倾角" value={`${selectedBody.axialTilt.toFixed(1)}°`} />
              {selectedBody.id === 'sun' ? (
                <>
                  <DataItem label="表面温度" value="约 5778 K（光球层）" />
                  <DataItem label="核心温度" value="约 1500 万 K" />
                </>
              ) : (
                <>
                  <DataItem label="轨道半长轴" value={`${selectedBody.orbit.a} AU`} />
                  <DataItem label="轨道偏心率" value={`${selectedBody.orbit.e.toFixed(4)}`} />
                </>
              )}
            </div>
            {/* 尺度对比 */}
            {scaleMode === 'exaggerated' && selectedBody.id !== 'sun' && (
              <div className="px-4 sm:px-5 py-2 border-b border-sci-cyan/10 bg-sci-cyan/5">
                <p className="text-[10px] text-sci-cyan/70">
                  当前显示直径已放大 {(selectedBody.visualRadius / getRealVisualRadius(selectedBody.radiusKm)).toFixed(1)} 倍，真实比例下此天体极小
                </p>
              </div>
            )}

            {/* 科普知识 */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0">
              {knowledge ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-sci-cyan mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-sci-cyan rounded-full shrink-0" />
                      <span className="leading-tight">{knowledge.title}</span>
                    </h3>
                    <p className="text-sm text-sci-white/80 leading-relaxed mb-4">
                      {knowledge.content}
                    </p>
                  </div>

                  <div className="bg-sci-cyan/5 border border-sci-cyan/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-sci-gold text-lg shrink-0">💡</span>
                      <div>
                        <p className="text-xs text-sci-cyan font-medium mb-1">趣味知识</p>
                        <p className="text-sm text-sci-white/70 leading-relaxed">
                          {knowledge.funFact}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-sci-white/40 italic">暂无该天体的详细科普内容。</p>
              )}
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

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-space-700/40 rounded-md px-2.5 sm:px-3 py-2" title={`${label}: ${value}`}>
      <p className="text-[10px] text-sci-white/40 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs sm:text-sm text-sci-white/90 font-mono truncate">{value}</p>
    </div>
  )
}

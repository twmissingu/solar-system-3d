import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { celestialBodies, dwarfPlanets, AU, CelestialBody } from '../data/celestialData'

interface InstrumentsPanelProps {
  bodyId: string
}

// ==================== Spectrometer Data ====================
const spectrometerData: Record<string, { name: string; percent: number; color: string }[]> = {
  sun: [
    { name: 'H（氢）', percent: 73, color: '#4ECDC4' },
    { name: 'He（氦）', percent: 25, color: '#5B7CFF' },
    { name: 'O（氧）', percent: 0.8, color: '#FDB813' },
    { name: 'C（碳）', percent: 0.3, color: '#AED6F1' },
  ],
  jupiter: [
    { name: 'H（氢）', percent: 89, color: '#4ECDC4' },
    { name: 'He（氦）', percent: 10, color: '#5B7CFF' },
    { name: 'CH₄（甲烷）', percent: 0.3, color: '#FDB813' },
    { name: 'NH₃（氨）', percent: 0.026, color: '#AED6F1' },
  ],
  saturn: [
    { name: 'H（氢）', percent: 96, color: '#4ECDC4' },
    { name: 'He（氦）', percent: 3, color: '#5B7CFF' },
    { name: 'CH₄（甲烷）', percent: 0.4, color: '#FDB813' },
  ],
  earth: [
    { name: 'N₂（氮气）', percent: 78, color: '#4ECDC4' },
    { name: 'O₂（氧气）', percent: 21, color: '#5B7CFF' },
    { name: 'Ar（氩）', percent: 0.9, color: '#FDB813' },
    { name: 'CO₂（二氧化碳）', percent: 0.04, color: '#AED6F1' },
  ],
  venus: [
    { name: 'CO₂（二氧化碳）', percent: 96.5, color: '#4ECDC4' },
    { name: 'N₂（氮气）', percent: 3.5, color: '#5B7CFF' },
    { name: 'SO₂（二氧化硫）', percent: 0.015, color: '#FDB813' },
  ],
  mars: [
    { name: 'CO₂（二氧化碳）', percent: 95, color: '#4ECDC4' },
    { name: 'N₂（氮气）', percent: 2.8, color: '#5B7CFF' },
    { name: 'Ar（氩）', percent: 1.9, color: '#FDB813' },
    { name: 'O₂（氧气）', percent: 0.13, color: '#AED6F1' },
  ],
  mercury: [
    { name: 'O（氧）', percent: 42, color: '#4ECDC4' },
    { name: 'Na（钠）', percent: 29, color: '#5B7CFF' },
    { name: 'H（氢）', percent: 22, color: '#FDB813' },
    { name: 'He（氦）', percent: 6, color: '#AED6F1' },
  ],
  uranus: [
    { name: 'H（氢）', percent: 80, color: '#4ECDC4' },
    { name: 'He（氦）', percent: 19, color: '#5B7CFF' },
    { name: 'CH₄（甲烷）', percent: 1.5, color: '#FDB813' },
  ],
  neptune: [
    { name: 'H（氢）', percent: 80, color: '#4ECDC4' },
    { name: 'He（氦）', percent: 19, color: '#5B7CFF' },
    { name: 'CH₄（甲烷）', percent: 1.5, color: '#FDB813' },
  ],
}

// ==================== Background stars for gravity lens ====================
const LENS_STARS = Array.from({ length: 30 }, (_, i) => ({
  x: 160 + ((i * 137.5) % 160),
  y: ((i * 73.3) % 200),
}))

// ==================== Helpers ====================
function findBodyById(id: string): CelestialBody | undefined {
  for (const body of celestialBodies) {
    if (body.id === id) return body
    if (body.satellites) {
      for (const sat of body.satellites) {
        if (sat.id === id) return sat
      }
    }
  }
  for (const dp of dwarfPlanets) {
    if (dp.id === id) return dp
  }
  return undefined
}

function getDistanceAU(body: CelestialBody): number {
  if (body.id === 'sun') return 1.0
  if (body.id === 'earth') return 0
  return Math.abs(body.orbit.a)
}

// ==================== Sub-components ====================

function Spectrometer({ bodyId }: { bodyId: string }) {
  const elements = spectrometerData[bodyId]
  const maxPercent = useMemo(() => {
    if (!elements) return 100
    return Math.max(...elements.map((e) => e.percent))
  }, [elements])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-sci-cyan flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h20" />
          <path d="M2 12l5-5" />
          <path d="M2 12l5 5" />
          <path d="M22 12l-5-5" />
          <path d="M22 12l-5 5" />
        </svg>
        大气成分光谱分析
      </h3>

      {elements ? (
        <div className="space-y-3">
          {elements.map((el) => {
            const widthPct = Math.max((el.percent / maxPercent) * 100, 6)
            return (
              <div key={el.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-sci-white/80">{el.name}</span>
                  <span className="text-sci-white/60 font-mono">{el.percent}%</span>
                </div>
                <div className="h-2.5 bg-space-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ backgroundColor: el.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-xs text-sci-white/40">暂无该天体的光谱数据。</p>
          <p className="text-[10px] text-sci-white/30 mt-1">光谱仪主要适用于恒星和行星大气分析。</p>
        </div>
      )}

      <div className="bg-sci-cyan/5 border border-sci-cyan/15 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-sci-gold text-base shrink-0">💡</span>
          <p className="text-xs text-sci-white/60 leading-relaxed">
            科学家通过分析星光穿过大气层时的吸收线，来知道行星大气里有什么元素。不同元素会吸收特定颜色的光，就像指纹一样。
          </p>
        </div>
      </div>
    </div>
  )
}

function RadarRangefinder({ bodyId }: { bodyId: string }) {
  const [radarPhase, setRadarPhase] = useState<'idle' | 'out' | 'back' | 'done'>('idle')

  const body = useMemo(() => findBodyById(bodyId), [bodyId])
  const distanceAU = useMemo(() => (body ? getDistanceAU(body) : 0), [body])
  const roundTripMinutes = useMemo(() => distanceAU * 8.317 * 2, [distanceAU])
  const distanceWanKm = useMemo(() => (distanceAU * AU) / 10000, [distanceAU])

  const handleFire = useCallback(() => {
    if (radarPhase !== 'idle') return
    setRadarPhase('out')
    setTimeout(() => {
      setRadarPhase('back')
      setTimeout(() => {
        setRadarPhase('done')
      }, 1200)
    }, 1200)
  }, [radarPhase])

  if (!body) return null

  const isEarth = bodyId === 'earth'

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-sci-cyan flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        雷达测距仪
      </h3>

      <div className="text-center py-1">
        <p className="text-sm text-sci-white/70">
          目标: <span className="text-sci-cyan font-bold">{body.nameZh}</span>
        </p>
      </div>

      {/* Radar track visualization */}
      <div className="relative h-20 bg-space-700/30 rounded-lg flex items-center justify-between px-5 overflow-hidden">
        {/* Earth */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="w-5 h-5 rounded-full bg-sci-blue shadow-[0_0_8px_rgba(91,124,255,0.5)]" />
          <span className="text-[10px] text-sci-white/50">地球</span>
        </div>

        {/* Track line */}
        <div className="flex-1 mx-4 h-px bg-sci-cyan/20 relative">
          {radarPhase !== 'idle' && radarPhase !== 'done' && (
            <motion.div
              key={radarPhase}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-sci-cyan"
              style={{ boxShadow: '0 0 12px rgba(78, 205, 196, 0.9), 0 0 24px rgba(78, 205, 196, 0.4)' }}
              initial={{ left: radarPhase === 'out' ? '0%' : '100%' }}
              animate={{ left: radarPhase === 'out' ? '100%' : '0%' }}
              transition={{ duration: 1.2, ease: 'linear' }}
            />
          )}
          {radarPhase === 'done' && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-0 w-3 h-3 rounded-full bg-sci-cyan"
              style={{ boxShadow: '0 0 12px rgba(78, 205, 196, 0.9)' }}
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>

        {/* Target */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div
            className="w-5 h-5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)]"
            style={{ backgroundColor: body.color }}
          />
          <span className="text-[10px] text-sci-white/50">{body.nameZh}</span>
        </div>
      </div>

      <button
        onClick={handleFire}
        disabled={radarPhase !== 'idle'}
        className={`sci-button-primary w-full text-center py-2.5 text-sm ${
          radarPhase !== 'idle' ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {radarPhase === 'idle' ? '发射雷达信号' : radarPhase === 'out' ? '信号飞行中...' : radarPhase === 'back' ? '信号返回中...' : '测量完成'}
      </button>

      {/* Results */}
      <AnimatePresence>
        {radarPhase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="space-y-2 text-center bg-space-700/30 rounded-lg p-3"
          >
            {isEarth ? (
              <p className="text-sm text-sci-white/80">🌍 地球是我们的家园，雷达信号瞬间到达！</p>
            ) : (
              <>
                <p className="text-sm text-sci-white/80">
                  信号往返时间:{' '}
                  <span className="text-sci-cyan font-mono font-bold">
                    {roundTripMinutes < 0.1 ? (roundTripMinutes * 60).toFixed(2) : roundTripMinutes.toFixed(2)}
                  </span>{' '}
                  {roundTripMinutes < 0.1 ? '秒' : '分钟'}
                </p>
                <p className="text-xs text-sci-white/50">
                  距离: {distanceAU.toFixed(4)} AU / {distanceWanKm.toFixed(1)} 万公里
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-sci-cyan/5 border border-sci-cyan/15 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-sci-gold text-base shrink-0">💡</span>
          <p className="text-xs text-sci-white/60 leading-relaxed">
            雷达信号以光速飞行。科学家测量信号从地球发出、到达行星、再反射回来的时间，就能精确计算距离。
          </p>
        </div>
      </div>
    </div>
  )
}

function GravityLensSimulator() {
  const [starOffset, setStarOffset] = useState(0)

  const sunCx = 70
  const sunCy = 100
  const sunR = 28
  const starX = 260
  const starY = sunCy + starOffset * 18

  const showBending = Math.abs(starOffset) < 2.5
  const showVirtual = Math.abs(starOffset) < 1.8 && Math.abs(starOffset) > 0.1
  const virtualY = sunCy + (starOffset > 0 ? starOffset * 18 + 22 : starOffset * 18 - 22)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-sci-cyan flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        引力透镜模拟器
      </h3>

      {/* SVG Diagram */}
      <div className="relative bg-space-700/30 rounded-lg overflow-hidden" style={{ height: 200 }}>
        <svg viewBox="0 0 320 200" className="w-full h-full">
          {/* Background stars */}
          {LENS_STARS.map((star, i) => (
            <circle key={i} cx={star.x} cy={star.y} r={0.8} fill="#E8F4FD" opacity={0.25} />
          ))}

          {/* Observer indicator (left side) */}
          <text x={10} y={100} textAnchor="middle" fill="#E8F4FD" fontSize="9" opacity={0.5} transform="rotate(-90, 10, 100)">
            观测者
          </text>
          <circle cx={10} cy={100} r={2} fill="#4ECDC4" opacity={0.4} />

          {/* Sun */}
          <circle cx={sunCx} cy={sunCy} r={sunR} fill="#FDB813" opacity={0.85} />
          <circle cx={sunCx} cy={sunCy} r={sunR + 4} fill="none" stroke="#FDB813" strokeWidth="0.5" opacity={0.3} />
          <text x={sunCx} y={sunCy + sunR + 16} textAnchor="middle" fill="#E8F4FD" fontSize="10" opacity={0.7}>
            太阳
          </text>

          {/* Dashed line: path without gravity (blocked by sun) */}
          {Math.abs(starOffset) < 0.5 && (
            <line
              x1={starX}
              y1={starY}
              x2={-10}
              y2={starY}
              stroke="#E8F4FD"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              opacity={0.2}
            />
          )}

          {/* Bent light rays */}
          {showBending && (
            <>
              {/* Upper ray */}
              <path
                d={`M ${starX},${starY} Q ${sunCx + 45},${sunCy - 42} -10,${sunCy + starOffset * 8}`}
                fill="none"
                stroke="#4ECDC4"
                strokeWidth="1.2"
                opacity={0.65}
              />
              {/* Lower ray */}
              <path
                d={`M ${starX},${starY} Q ${sunCx + 45},${sunCy + 42} -10,${sunCy + starOffset * 8}`}
                fill="none"
                stroke="#4ECDC4"
                strokeWidth="1.2"
                opacity={0.65}
              />
            </>
          )}

          {/* Straight rays when far from sun */}
          {!showBending && (
            <>
              <line x1={starX} y1={starY} x2={-10} y2={sunCy + starOffset * 8} stroke="#4ECDC4" strokeWidth="1" opacity={0.4} />
            </>
          )}

          {/* Real star */}
          <circle cx={starX} cy={starY} r={4} fill="#E8F4FD" />
          <circle cx={starX} cy={starY} r={6} fill="none" stroke="#E8F4FD" strokeWidth="0.5" opacity={0.4} />
          <text x={starX} y={starY - 12} textAnchor="middle" fill="#E8F4FD" fontSize="9" opacity={0.7}>
            恒星
          </text>

          {/* Virtual image */}
          {showVirtual && (
            <g>
              <circle cx={starX} cy={virtualY} r={3.5} fill="#4ECDC4" opacity={0.5} />
              <circle cx={starX} cy={virtualY} r={5} fill="none" stroke="#4ECDC4" strokeWidth="0.5" opacity={0.3} strokeDasharray="2 2" />
              <text x={starX} y={virtualY + (virtualY > sunCy ? 14 : -10)} textAnchor="middle" fill="#4ECDC4" fontSize="9" opacity={0.7}>
                虚像
              </text>
              {/* Dotted line connecting real and virtual */}
              <line x1={starX} y1={starY} x2={starX} y2={virtualY} stroke="#4ECDC4" strokeWidth="0.5" strokeDasharray="2 2" opacity={0.3} />
            </g>
          )}
        </svg>
      </div>

      {/* Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-sci-white/60">背景恒星位置</label>
          <span className="text-xs text-sci-cyan font-mono">{starOffset.toFixed(1)} 太阳半径</span>
        </div>
        <input
          type="range"
          min={-3}
          max={3}
          step={0.1}
          value={starOffset}
          onChange={(e) => setStarOffset(parseFloat(e.target.value))}
          className="sci-slider"
        />
        <div className="flex justify-between text-[10px] text-sci-white/30 mt-1">
          <span>-3</span>
          <span>0</span>
          <span>+3</span>
        </div>
      </div>

      <div className="bg-sci-cyan/5 border border-sci-cyan/15 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-sci-gold text-base shrink-0">💡</span>
          <p className="text-xs text-sci-white/60 leading-relaxed">
            爱因斯坦在1915年预言：大质量天体可以弯曲光线。1919年日全食时，爱丁顿观测到太阳旁边的恒星位置偏移，证实了广义相对论。
          </p>
        </div>
      </div>
    </div>
  )
}

// ==================== Main Component ====================

export default function InstrumentsPanel({ bodyId }: InstrumentsPanelProps) {
  const [activeTab, setActiveTab] = useState<'spectrometer' | 'radar' | 'lens'>('spectrometer')

  const tabs = [
    { key: 'spectrometer' as const, label: '光谱仪' },
    { key: 'radar' as const, label: '雷达测距' },
    { key: 'lens' as const, label: '引力透镜' },
  ]

  return (
    <div className="space-y-4">
      {/* Instrument Tabs */}
      <div className="flex gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300 border ${
                isActive
                  ? 'bg-sci-cyan/20 text-sci-cyan border-sci-cyan/30'
                  : 'text-sci-white/50 hover:text-sci-white/70 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'spectrometer' && <Spectrometer bodyId={bodyId} />}
          {activeTab === 'radar' && <RadarRangefinder bodyId={bodyId} />}
          {activeTab === 'lens' && <GravityLensSimulator />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

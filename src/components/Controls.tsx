import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  Eye,
  EyeOff,
  CircleDot,
  Pause,
  Play,
  Gauge,
  Compass,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { presetViews, celestialBodies } from '../data/celestialData'
import { getHeliocentricPosition } from '../utils/orbit'
import { formatSimulationDate } from '../utils/date'
import { lightTravelMinutes, lifetimeOrbits } from '../utils/physics'
import { playUISound } from '../utils/audio'

const speeds = [
  { value: 'pause' as const, label: '暂停', icon: Pause },
  { value: '1x' as const, label: '1x', icon: Play },
  { value: '10x' as const, label: '10x', icon: Gauge },
  { value: '100x' as const, label: '100x', icon: Gauge },
  { value: '1000x' as const, label: '1000x', icon: Gauge },
]

const timeModeTabs = [
  { mode: 'simulation' as const, label: '模拟速度' },
  { mode: 'light-speed' as const, label: '光速旅行' },
  { mode: 'lifetime' as const, label: '一生视角' },
]

export default function Controls() {
  const timeSpeed = useStore((s) => s.timeSpeed)
  const setTimeSpeed = useStore((s) => s.setTimeSpeed)
  const timeMode = useStore((s) => s.timeMode)
  const setTimeMode = useStore((s) => s.setTimeMode)
  const showOrbits = useStore((s) => s.showOrbits)
  const setShowOrbits = useStore((s) => s.setShowOrbits)
  const showLabels = useStore((s) => s.showLabels)
  const setShowLabels = useStore((s) => s.setShowLabels)
  const resetView = useStore((s) => s.resetView)
  const setCameraFocus = useStore((s) => s.setCameraFocus)
  const setSelectedBody = useStore((s) => s.setSelectedBody)
  const currentDay = useStore((s) => s.currentDay)
  const planetScale = useStore((s) => s.planetScale)
  const setPlanetScale = useStore((s) => s.setPlanetScale)

  const handlePresetView = (view: (typeof presetViews)[0]) => {
    let basePos: [number, number, number] = [0, 0, 0]
    let lookAt: [number, number, number] = view.lookAt

    if (view.id === 'overview') {
      setPlanetScale(8)
    } else if (view.id === 'jupiter-moons') {
      setPlanetScale(3)
      const jupiter = celestialBodies.find((b) => b.id === 'jupiter')
      if (jupiter) {
        basePos = getHeliocentricPosition(jupiter.orbit, currentDay)
        lookAt = basePos
      }
    } else if (view.id === 'saturn-rings') {
      setPlanetScale(3)
      const saturn = celestialBodies.find((b) => b.id === 'saturn')
      if (saturn) {
        basePos = getHeliocentricPosition(saturn.orbit, currentDay)
        lookAt = basePos
      }
    } else if (view.id === 'earth-moon') {
      setPlanetScale(3)
      const earth = celestialBodies.find((b) => b.id === 'earth')
      if (earth) {
        basePos = getHeliocentricPosition(earth.orbit, currentDay)
        lookAt = basePos
      }
    }

    const target: [number, number, number] = [
      basePos[0] + view.cameraPosition[0],
      basePos[1] + view.cameraPosition[1],
      basePos[2] + view.cameraPosition[2],
    ]
    setCameraFocus(target, lookAt)
    setSelectedBody(null)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[25] flex flex-col items-center pb-3 sm:pb-4 pointer-events-none">
      {/* Dock */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="pointer-events-auto dock-container"
      >
        {/* Row 1: Time controls */}
        <div className="flex flex-col gap-2">
          {/* Tab switcher */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-sci-white/40 mr-1 flex items-center gap-1 shrink-0 font-mono">
              TIME
            </span>
            {timeModeTabs.map((t) => (
              <button
                key={t.mode}
                onClick={() => {
                  playUISound('click')
                  setTimeMode(t.mode)
                  if (t.mode !== 'simulation') {
                    setTimeSpeed('1000x')
                  }
                }}
                onMouseEnter={() => playUISound('hover')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all interactive-hover ${
                  timeMode === t.mode
                    ? 'bg-sci-cyan/80 text-space-900'
                    : 'text-sci-white/50 hover:text-sci-white hover:bg-sci-cyan/10'
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="text-[10px] text-sci-cyan/50 font-mono ml-auto hidden sm:inline">
              {formatSimulationDate(currentDay)}
            </span>
          </div>

          {/* Fixed-height content area with mode transition */}
          <div className="h-16 overflow-hidden">
            <AnimatePresence mode="wait">
              {timeMode === 'simulation' && (
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="h-full flex items-center gap-1.5"
                >
                  {speeds.map((s) => {
                    const Icon = s.icon
                    return (
                      <button
                        key={s.value}
                        onClick={() => setTimeSpeed(s.value)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all interactive-hover ${
                          timeSpeed === s.value
                            ? 'bg-sci-cyan/80 text-space-900'
                            : 'text-sci-white/50 hover:text-sci-white hover:bg-sci-cyan/10'
                        }`}
                      >
                        <Icon size={12} />
                        {s.label}
                      </button>
                    )
                  })}
                </motion.div>
              )}

              {timeMode === 'light-speed' && (
                <motion.div
                  key="light-speed"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-0.5"
                >
                  <p className="text-[9px] text-sci-white/50 leading-tight">
                    光从太阳传播到各行星所需的时间：
                  </p>
                  <div className="grid grid-cols-4 gap-1 w-fit">
                    {celestialBodies
                      .filter((b) => b.id !== 'sun')
                      .map((body) => {
                        const minutes = lightTravelMinutes(body.orbit.a)
                        return (
                          <span
                            key={body.id}
                            className="planet-pill"
                          >
                            <span
                              className="planet-dot"
                              style={{ backgroundColor: body.color }}
                            />
                            <span className="font-medium">{body.nameZh}</span>
                            <span className="text-sci-cyan/80 font-mono">
                              {minutes < 1
                                ? `${(minutes * 60).toFixed(0)}s`
                                : `${minutes.toFixed(1)}min`}
                            </span>
                          </span>
                        )
                      })}
                  </div>
                </motion.div>
              )}

              {timeMode === 'lifetime' && (
                <motion.div
                  key="lifetime"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-0.5"
                >
                  <p className="text-[9px] text-sci-white/50 leading-tight">
                    80年寿命内各行星绕太阳公转的圈数：
                  </p>
                  <div className="grid grid-cols-4 gap-1 w-fit">
                    {celestialBodies
                      .filter((b) => b.id !== 'sun')
                      .map((body) => {
                        const orbits = lifetimeOrbits(body.orbit.period)
                        const isInteger = Number.isInteger(orbits)
                        return (
                          <span
                            key={body.id}
                            className="planet-pill"
                          >
                            <span
                              className="planet-dot"
                              style={{ backgroundColor: body.color }}
                            />
                            <span className="font-medium">{body.nameZh}</span>
                            <span className="text-sci-cyan/80 font-mono">
                              {isInteger ? orbits : orbits.toFixed(orbits < 1 ? 2 : 1)}圈
                            </span>
                          </span>
                        )
                      })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-sci-cyan/10" />

        {/* Row 2: Planet scale + Display toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Planet scale */}
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <span className="text-[10px] text-sci-white/40 shrink-0">天体放大</span>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={planetScale}
              onChange={(e) => { playUISound('click'); setPlanetScale(parseFloat(e.target.value)) }}
              className="sci-slider flex-1"
            />
            <span className="text-[10px] text-sci-cyan font-mono w-8 text-right shrink-0">
              {planetScale}x
            </span>
          </div>

          <div className="h-4 w-px bg-sci-cyan/10" />

          {/* Display toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { playUISound('click'); setShowLabels(!showLabels) }}
              onMouseEnter={() => playUISound('hover')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all interactive-hover ${
                showLabels
                  ? 'text-sci-cyan bg-sci-cyan/15'
                  : 'text-sci-white/50 hover:text-sci-white hover:bg-sci-cyan/10'
              }`}
            >
              {showLabels ? <Eye size={12} /> : <EyeOff size={12} />}
              标签
            </button>
            <button
              onClick={() => { playUISound('click'); setShowOrbits(!showOrbits) }}
              onMouseEnter={() => playUISound('hover')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all interactive-hover ${
                showOrbits
                  ? 'text-sci-cyan bg-sci-cyan/15'
                  : 'text-sci-white/50 hover:text-sci-white hover:bg-sci-cyan/10'
              }`}
            >
              <CircleDot size={12} />
              轨道
            </button>
            <button
              onClick={() => { playUISound('click'); resetView() }}
              onMouseEnter={() => playUISound('hover')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all interactive-hover text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10"
            >
              <RotateCcw size={12} />
              恢复默认
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-sci-cyan/10" />

        {/* Row 3: View presets */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-sci-white/40 mr-0.5 font-mono">VIEW</span>
          {presetViews.map((view) => (
            <button
              key={view.id}
              onClick={() => { playUISound('click'); handlePresetView(view) }}
              onMouseEnter={() => playUISound('hover')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all interactive-hover text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10"
            >
              <Compass size={12} />
              <span className="hidden sm:inline">{view.nameZh}</span>
              <span className="sm:hidden">{view.nameZh.replace('与卫星群', '').replace('太阳系', '').replace('特写', '') || view.nameZh}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

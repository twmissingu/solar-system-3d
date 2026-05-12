import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { presetViews, lunarEclipseDemo, celestialBodies } from '../data/celestialData'
import { evaluateAchievements } from '../utils/achievements'
import { getHeliocentricPosition } from '../utils/orbit'
import { formatSimulationDate } from '../utils/date'
import { lightTravelMinutes, formatLightTime, lifetimeOrbits } from '../utils/physics'
import { playUISound } from '../utils/audio'

const speeds = [
  { value: 'pause' as const, label: '⏸ 暂停' },
  { value: '1x' as const, label: '1x' },
  { value: '10x' as const, label: '10x' },
  { value: '100x' as const, label: '100x' },
  { value: '1000x' as const, label: '1000x' },
]

const timeModeTabs = [
  { mode: 'simulation' as const, label: '模拟速度' },
  { mode: 'light-speed' as const, label: '光速旅行' },
  { mode: 'lifetime' as const, label: '一生视角' },
]

export default function Controls() {
  const {
    timeSpeed,
    setTimeSpeed,
    timeMode,
    setTimeMode,
    showOrbits,
    setShowOrbits,
    showLabels,
    setShowLabels,
    resetView,
    setCameraTarget,
    setCameraLookAt,
    setCurrentDay,
    selectedBody,
    setSelectedBody,
    currentDay,
    showKnowledge,
    scaleMode,
    setScaleMode,
    setShowMissionPanel,
    setShowAchievementPanel,
    setShowSpacecraftPanel,
    setJourneyMode,
    setCurrentJourneyIndex,
    addMissionObservedEvent,
    activeMissionId,
    setShowPredictionGame,
    setShowSandbox,
    setShowHohmannDesigner,
    setShowEclipseLab,
    setShowBlackHole,
    setShowNarrative,
    setShowSharePanel,
  } = useStore()

  const lifetimeData = useMemo(() => {
    return celestialBodies
      .filter((b) => b.id !== 'sun')
      .map((body) => ({
        ...body,
        orbits: lifetimeOrbits(body.orbit.period),
      }))
  }, [])

  const handlePresetView = (view: typeof presetViews[0]) => {
    let basePos: [number, number, number] = [0, 0, 0]

    if (view.id === 'from-earth') {
      basePos = getHeliocentricPosition(
        { a: 1.0, e: 0.0167, i: 0, L: 100.466, longPeri: 102.947, longNode: 348.739, period: 365.25 },
        currentDay
      )
    } else if (view.id === 'saturn-rings') {
      basePos = getHeliocentricPosition(
        { a: 9.5826, e: 0.0565, i: 2.485, L: 50.077, longPeri: 92.431, longNode: 113.665, period: 10759.22 },
        currentDay
      )
    }

    const target: [number, number, number] = [
      basePos[0] + view.cameraPosition[0],
      basePos[1] + view.cameraPosition[1],
      basePos[2] + view.cameraPosition[2],
    ]
    setCameraTarget(target)
    setCameraLookAt(view.lookAt)
    setSelectedBody(null)
  }

  const handleLunarEclipse = () => {
    setCurrentDay(lunarEclipseDemo.julianDay - 2451545.0)
    setCameraTarget([18, 4, 12])
    setCameraLookAt([0, 0, 0])

    // Mission progress
    if (activeMissionId) {
      addMissionObservedEvent('moon')
    }

    // Achievement
    evaluateAchievements()
  }

  return (
    <>
      {/* 顶部标题栏 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-20"
      >
        <div className="sci-panel px-3 py-2 sm:px-5 sm:py-3">
          <h1
            className="text-base sm:text-xl font-bold text-sci-white sci-text-glow tracking-wider"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            SOLAR SYSTEM
          </h1>
          <p className="text-[10px] sm:text-xs text-sci-cyan/60 mt-0.5 hidden sm:block">
            太阳系3D探索 · 科学教育
          </p>
        </div>
      </motion.div>

      {/* 选中天体提示 - 避开标题栏和右侧面板 */}
      {selectedBody && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-3 sm:top-4 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20"
          style={showKnowledge ? { right: '1rem', left: 'auto', transform: 'none' } : undefined}
        >
          <div className="sci-panel px-3 py-1.5 sm:px-4 sm:py-2 text-center">
            <p className="text-xs sm:text-sm text-sci-cyan">
              已选中 <span className="font-bold">{selectedBody.nameZh}</span>
              <span className="hidden sm:inline"> — 右侧信息面板已打开</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* 底部控制栏 - 响应式：移动端垂直堆叠 */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-2 sm:gap-4"
      >
        {/* 左侧控制组 */}
        <div className="flex flex-col gap-2 order-2 sm:order-1">
          {/* 时间控制 */}
          <div className="sci-panel p-2 sm:p-3 flex flex-col gap-2">
            {/* Tab switcher */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] sm:text-xs text-sci-white/50 mr-1 shrink-0">时间</span>
              {timeModeTabs.map((t) => (
                <button
                  key={t.mode}
                  onClick={() => {
                    playUISound('click');
                    setTimeMode(t.mode)
                    if (t.mode !== 'simulation') {
                      setTimeSpeed('1000x')
                    }
                  }}
                  onMouseEnter={() => playUISound('hover')}
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition-all ${
                    timeMode === t.mode
                      ? 'bg-sci-cyan/80 text-space-900'
                      : 'text-sci-white/60 hover:text-sci-white hover:bg-sci-cyan/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <span className="text-[10px] text-sci-cyan/50 font-mono ml-auto shrink-0 hidden sm:inline">
                {formatSimulationDate(currentDay)}
              </span>
            </div>

            {/* Tab: 模拟速度 */}
            {timeMode === 'simulation' && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {speeds.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setTimeSpeed(s.value)}
                    className={`px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-all ${
                      timeSpeed === s.value
                        ? 'bg-sci-cyan/80 text-space-900'
                        : 'text-sci-white/60 hover:text-sci-white hover:bg-sci-cyan/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Tab: 光速旅行 */}
            {timeMode === 'light-speed' && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] sm:text-xs text-sci-white/60">
                  以光速前进时，每秒钟你可以穿越这些距离：
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {celestialBodies
                    .filter((b) => b.id !== 'sun')
                    .map((body) => {
                      const minutes = lightTravelMinutes(body.orbit.a)
                      return (
                        <div
                          key={body.id}
                          className="flex flex-col items-center rounded bg-sci-cyan/5 border border-sci-cyan/10 px-1.5 py-1"
                        >
                          <span className="text-[10px] text-sci-white/80 font-medium">{body.nameZh}</span>
                          <span className="text-[10px] text-sci-cyan/80 font-mono">
                            {minutes < 1
                              ? `${(minutes * 60).toFixed(0)}秒`
                              : `${minutes.toFixed(1)}分钟`}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Tab: 一生视角 */}
            {timeMode === 'lifetime' && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] sm:text-xs text-sci-white/60">
                  如果你活到80岁，你能看到这些变化：
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {lifetimeData.map((body) => {
                    const orbits = body.orbits
                    const isInteger = Number.isInteger(orbits)
                    return (
                      <div
                        key={body.id}
                        className="flex flex-col items-center rounded bg-sci-cyan/5 border border-sci-cyan/10 px-1.5 py-1"
                      >
                        <span className="text-[10px] text-sci-white/80 font-medium">{body.nameZh}</span>
                        <span className="text-[10px] text-sci-cyan/80 font-mono">
                          公转 {isInteger ? orbits : orbits.toFixed(orbits < 1 ? 2 : 1)} 圈
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[10px] sm:text-xs text-sci-cyan/50 italic">
                  你一生中，海王星还转不完一圈！
                </p>
              </div>
            )}
          </div>

          {/* 显示控制 */}
          <div className="sci-panel p-2 sm:p-3 flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-sci-white/50 mr-1 shrink-0">显示</span>
            <ToggleButton active={showOrbits} onClick={() => { playUISound('click'); setShowOrbits(!showOrbits); }} label="轨道" />
            <ToggleButton active={showLabels} onClick={() => { playUISound('click'); setShowLabels(!showLabels); }} label="标签" />
            <button
              onClick={() => { playUISound('click'); setScaleMode(scaleMode === 'exaggerated' ? 'realistic' : 'exaggerated'); }}
              onMouseEnter={() => playUISound('hover')}
              className={`px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-all ${
                scaleMode === 'realistic'
                  ? 'bg-sci-blue/20 text-sci-blue border border-sci-blue/40'
                  : 'text-sci-white/40 border border-transparent hover:text-sci-white/60'
              }`}
              title={scaleMode === 'exaggerated' ? '切换到真实比例（行星会非常小）' : '切换到放大比例'}
            >
              {scaleMode === 'exaggerated' ? '🔍 放大比例' : '🔎 真实比例'}
            </button>
          </div>
        </div>

        {/* 右侧操作组 */}
        <div className="flex flex-col gap-2 items-stretch sm:items-end order-1 sm:order-2">
          {/* 预设视角 */}
          <div className="sci-panel p-2 sm:p-3 flex flex-wrap gap-1.5 sm:gap-2 max-w-full sm:max-w-md">
            <span className="text-[10px] sm:text-xs text-sci-white/50 mr-1 w-full text-left sm:text-right shrink-0">
              预设视角
            </span>
            {presetViews.map((view) => (
              <button
                key={view.id}
                onClick={() => handlePresetView(view)}
                className="sci-button text-[10px] sm:text-xs py-1 px-2 sm:py-1.5 sm:px-3 flex-1 sm:flex-none text-center"
                title={view.description}
              >
                {view.nameZh}
              </button>
            ))}
          </div>

          {/* 特殊演示 */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                playUISound('click');
                setJourneyMode('running');
                setCurrentJourneyIndex(0);
              }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center justify-center gap-1 py-1.5 px-2 sm:py-2 sm:px-3"
            >
              ✨ <span className="hidden sm:inline">光速旅程</span>
              <span className="sm:hidden">旅程</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowPredictionGame(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center justify-center gap-1 py-1.5 px-2 sm:py-2 sm:px-3"
            >
              🔮 <span className="hidden sm:inline">预测挑战</span>
              <span className="sm:hidden">预测</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowSandbox(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center justify-center gap-1 py-1.5 px-2 sm:py-2 sm:px-3"
            >
              🧪 <span className="hidden sm:inline">沙盘实验</span>
              <span className="sm:hidden">沙盘</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowMissionPanel(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button-primary text-[10px] sm:text-xs flex items-center justify-center gap-1 py-1.5 px-2 sm:py-2 sm:px-3"
            >
              🚀 <span className="hidden sm:inline">探索任务</span>
              <span className="sm:hidden">任务</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowSpacecraftPanel(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center gap-1 py-1.5 px-2"
            >
              🛰️ <span className="hidden sm:inline">航天器</span><span className="sm:hidden">航天</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowHohmannDesigner(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center gap-1 py-1.5 px-2"
            >
              🛸 <span className="hidden sm:inline">轨道设计</span><span className="sm:hidden">轨道</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowAchievementPanel(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center justify-center gap-1 py-1.5 px-2 sm:py-2 sm:px-3"
            >
              🏅 <span className="hidden sm:inline">探索徽章</span>
              <span className="sm:hidden">徽章</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowEclipseLab(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button-primary text-[10px] sm:text-xs flex items-center gap-1 py-1.5 px-2"
            >
              🧪 <span className="hidden sm:inline">月食实验</span><span className="sm:hidden">月食</span>
            </button>
            <button
              onClick={() => setShowBlackHole(true)}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center gap-1 py-1.5 px-2"
            >
              🕳️ <span className="hidden sm:inline">黑洞探险</span><span className="sm:hidden">黑洞</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowNarrative(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center gap-1 py-1.5 px-2"
            >
              📖 <span className="hidden sm:inline">故事任务</span><span className="sm:hidden">故事</span>
            </button>
            <button
              onClick={() => { playUISound('click'); setShowSharePanel(true); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs flex items-center gap-1 py-1.5 px-2"
            >
              📸 <span className="hidden sm:inline">探索报告</span><span className="sm:hidden">报告</span>
            </button>
            <button
              onClick={() => { playUISound('click'); resetView(); }}
              onMouseEnter={() => playUISound('hover')}
              className="sci-button text-[10px] sm:text-xs py-1.5 px-2 sm:py-2 sm:px-3"
            >
              重置
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-all ${
        active
          ? 'bg-sci-cyan/20 text-sci-cyan border border-sci-cyan/40'
          : 'text-sci-white/40 border border-transparent hover:text-sci-white/60'
      }`}
    >
      {label}
    </button>
  )
}

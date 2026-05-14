import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  Eye,
  EyeOff,
  CircleDot,
  Rocket,
  Sparkles,
  MoreHorizontal,
  Orbit,
  FlaskConical,
  Satellite,
  Compass,
  BookOpen,
  Ruler,
  Microscope,
  Telescope,
  FileText,
  Award,
  Moon,
  Pause,
  Play,
  Gauge,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  History,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { presetViews, lunarEclipseDemo, celestialBodies, dwarfPlanets } from '../data/celestialData'
import { achievements } from '../data/achievements'
import { evaluateAchievements } from '../utils/achievements'
import { getHeliocentricPosition } from '../utils/orbit'
import { formatSimulationDate } from '../utils/date'
import { lightTravelMinutes, formatLightTime, lifetimeOrbits } from '../utils/physics'
import { playUISound } from '../utils/audio'

const speeds = [
  { value: 'pause' as const, label: '暂停', icon: Pause },
  { value: '1x' as const, label: '1x', icon: Play },
  { value: '10x' as const, label: '10x', icon: Gauge },
  { value: '100x' as const, label: '100x', icon: Gauge },
  { value: '1000x' as const, label: '1kx', icon: Gauge },
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
  const setCurrentDay = useStore((s) => s.setCurrentDay)
  const selectedBody = useStore((s) => s.selectedBody)
  const setSelectedBody = useStore((s) => s.setSelectedBody)
  const currentDay = useStore((s) => s.currentDay)
  const showKnowledge = useStore((s) => s.showKnowledge)
  const scaleMode = useStore((s) => s.scaleMode)
  const setScaleMode = useStore((s) => s.setScaleMode)
  const setShowMissionPanel = useStore((s) => s.setShowMissionPanel)
  const setShowAchievementPanel = useStore((s) => s.setShowAchievementPanel)
  const setSelectedSpacecraft = useStore((s) => s.setSelectedSpacecraft)
  const setShowSpacecraftPanel = useStore((s) => s.setShowSpacecraftPanel)
  const setJourneyMode = useStore((s) => s.setJourneyMode)
  const setCurrentJourneyIndex = useStore((s) => s.setCurrentJourneyIndex)
  const setShowPredictionGame = useStore((s) => s.setShowPredictionGame)
  const setShowSandbox = useStore((s) => s.setShowSandbox)
  const setShowHohmannDesigner = useStore((s) => s.setShowHohmannDesigner)
  const setShowEclipseLab = useStore((s) => s.setShowEclipseLab)
  const setShowBlackHole = useStore((s) => s.setShowBlackHole)
  const setShowNarrative = useStore((s) => s.setShowNarrative)
  const setShowSharePanel = useStore((s) => s.setShowSharePanel)
  const setShowScientistGallery = useStore((s) => s.setShowScientistGallery)
  const setShowScaleRuler = useStore((s) => s.setShowScaleRuler)
  const setShowStarMap = useStore((s) => s.setShowStarMap)
  const setShowExplorationHistory = useStore((s) => s.setShowExplorationHistory)

  const [toolboxOpen, setToolboxOpen] = useState(false)

  const lifetimeData = useMemo(() => {
    return [...celestialBodies, ...dwarfPlanets]
      .filter((b) => b.id !== 'sun')
      .map((body) => ({
        ...body,
        orbits: lifetimeOrbits(body.orbit.period),
      }))
  }, [])

  const handlePresetView = (view: (typeof presetViews)[0]) => {
    let basePos: [number, number, number] = [0, 0, 0]
    let lookAt: [number, number, number] = view.lookAt

    if (view.id === 'from-earth') {
      const earth = celestialBodies.find((b) => b.id === 'earth')
      if (earth) basePos = getHeliocentricPosition(earth.orbit, currentDay)
    } else if (view.id === 'saturn-rings') {
      const saturn = celestialBodies.find((b) => b.id === 'saturn')
      if (saturn) {
        basePos = getHeliocentricPosition(saturn.orbit, currentDay)
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

  const handleLunarEclipse = () => {
    setCurrentDay(lunarEclipseDemo.julianDay - 2451545.0)
    setCameraFocus([18, 4, 12], [0, 0, 0])
    setSelectedBody(null)

    const { activeMissionId, addMissionObservedEvent } = useStore.getState()
    if (activeMissionId) {
      addMissionObservedEvent('moon')
    }

    evaluateAchievements()
    const { unlockAchievement } = useStore.getState()
    unlockAchievement('eclipse_witness')
  }

  const generateExplorationReport = () => {
    const state = useStore.getState()
    const allBodies = [...celestialBodies, ...dwarfPlanets]
    const exploredNames = state.exploredBodies
      .map((id) => allBodies.find((b) => b.id === id)?.nameZh)
      .filter(Boolean)
      .join('、') || '暂无'

    const achievementNames = state.unlockedAchievements
      .map((id) => {
        const a = achievements.find((ach) => ach.id === id)
        return a ? `${a.icon} ${a.name}` : id
      })
      .join('、') || '暂无'

    const yearsAdvanced = (state.totalTimeAdvanced / 365.25).toFixed(1)

    const report = `# 我的宇宙探索报告

> 生成时间：${new Date().toLocaleString('zh-CN')}

---

## 探索数据

- **已探索天体**：${exploredNames}
- **已解锁成就**：${achievementNames}
- **完成任务数**：${state.completedMissions.length} 个
- **累计推进时间**：约 ${yearsAdvanced} 年

---

## 我的宇宙足迹

${state.exploredBodies.length > 0
  ? state.exploredBodies.map((id) => {
      const body = allBodies.find((b) => b.id === id)
      return body ? `- **${body.nameZh}**：${body.description.slice(0, 50)}...` : ''
    }).join('\n')
  : '开始探索，留下你的宇宙足迹吧！'}

---

## 科学态度宣言

> 我承诺，在这个应用里看到的一切都是科学家的**当前最佳理解**，而非永恒真理。
> 科学的价值不在于永远正确，而在于永远好奇。

---

*本报告由太阳系3D探索应用自动生成*
*数据来源：简化轨道模型，仅供科普教育参考*
`

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `宇宙探索报告_${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Dock 分组配置
  const dockGroups = [
    {
      key: 'display',
      items: [
        { id: 'reset', icon: RotateCcw, label: '重置视角', onClick: () => { playUISound('click'); resetView(); }, active: false },
        { id: 'labels', icon: showLabels ? Eye : EyeOff, label: showLabels ? '隐藏标签' : '显示标签', onClick: () => { playUISound('click'); setShowLabels(!showLabels); }, active: showLabels },
        { id: 'orbits', icon: CircleDot, label: '轨道显示', onClick: () => { playUISound('click'); setShowOrbits(!showOrbits); }, active: showOrbits },
      ],
    },
    {
      key: 'explore',
      items: [
        { id: 'missions', icon: Rocket, label: '探索任务', onClick: () => { playUISound('click'); setShowMissionPanel(true); }, active: false, primary: true },
        { id: 'exploration-history', icon: History, label: '探索历程', onClick: () => { playUISound('click'); setShowExplorationHistory(true); }, active: false },
        { id: 'scientists', icon: Microscope, label: '天文学家', onClick: () => { playUISound('click'); setShowScientistGallery(true); }, active: false },
      ],
    },
    {
      key: 'tools',
      items: [
        { id: 'journey', icon: Sparkles, label: '光速旅程', onClick: () => { playUISound('click'); setJourneyMode('running'); setCurrentJourneyIndex(0); }, active: false },
        { id: 'more', icon: toolboxOpen ? ChevronDown : MoreHorizontal, label: toolboxOpen ? '收起' : '更多工具', onClick: () => { playUISound('click'); setToolboxOpen(!toolboxOpen); }, active: toolboxOpen },
      ],
    },
  ]

  // 工具箱分组
  type ToolboxItem = { icon: typeof Rocket; label: string; onClick: () => void; primary?: boolean }
  type ToolboxSection = { title: string; items: ToolboxItem[] }

  const toolboxSections: ToolboxSection[] = [
    {
      title: '视角',
      items: presetViews.map((view) => ({
        icon: Compass,
        label: view.nameZh,
        onClick: () => { playUISound('click'); handlePresetView(view); setToolboxOpen(false); },
      })),
    },
    {
      title: '演示',
      items: [
        { icon: Moon, label: '月食实验', onClick: () => { playUISound('click'); handleLunarEclipse(); setToolboxOpen(false); }, primary: true },
        { icon: Orbit, label: '黑洞探险', onClick: () => { playUISound('click'); setShowBlackHole(true); setToolboxOpen(false); } },
      ],
    },
    {
      title: '工具',
      items: [
        { icon: Eye, label: '预测挑战', onClick: () => { playUISound('click'); setShowPredictionGame(true); setToolboxOpen(false); } },
        { icon: FlaskConical, label: '沙盘实验', onClick: () => { playUISound('click'); setShowSandbox(true); setToolboxOpen(false); } },
        { icon: Orbit, label: '轨道设计', onClick: () => { playUISound('click'); setShowHohmannDesigner(true); setToolboxOpen(false); } },
      ],
    },
    {
      title: '资料',
      items: [
        { icon: Satellite, label: '航天器', onClick: () => { playUISound('click'); setSelectedSpacecraft('voyager1'); setShowSpacecraftPanel(true); setToolboxOpen(false); } },
        { icon: Telescope, label: '四季星空', onClick: () => { playUISound('click'); setShowStarMap(true); setToolboxOpen(false); } },
        { icon: Ruler, label: '比例尺', onClick: () => { playUISound('click'); setShowScaleRuler(true); setToolboxOpen(false); } },
      ],
    },
    {
      title: '其他',
      items: [
        { icon: BookOpen, label: '故事任务', onClick: () => { playUISound('click'); setShowNarrative(true); setToolboxOpen(false); } },
        { icon: Award, label: '探索徽章', onClick: () => { playUISound('click'); setShowAchievementPanel(true); setToolboxOpen(false); } },
        { icon: FileText, label: '导出报告', onClick: () => { playUISound('click'); generateExplorationReport(); setToolboxOpen(false); } },
        { icon: Layers, label: scaleMode === 'exaggerated' ? '真实比例' : '放大比例', onClick: () => { playUISound('click'); setScaleMode(scaleMode === 'exaggerated' ? 'realistic' : 'exaggerated'); } },
      ],
    },
  ]

  return (
    <>
      {/* 顶部标题栏 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-20"
      >
        <div className="sci-panel px-3 py-2 sm:px-5 sm:py-3 interactive-hover">
          <h1
            className="text-base sm:text-xl font-bold text-sci-white sci-text-glow tracking-wider"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            SOLAR SYSTEM
          </h1>
          <p className="text-[10px] sm:text-xs text-sci-cyan/50 mt-0.5 hidden sm:block">
            太阳系3D探索 · 科学教育
          </p>
        </div>
      </motion.div>

      {/* 选中天体提示 */}
      {selectedBody && showKnowledge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-3 sm:top-4 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20"
          style={{ right: '1rem', left: 'auto', transform: 'none' }}
        >
          <div className="sci-panel px-3 py-1.5 sm:px-4 sm:py-2 text-center">
            <p className="text-xs sm:text-sm text-sci-cyan">
              已选中 <span className="font-bold">{selectedBody.nameZh}</span>
              <span className="hidden sm:inline"> — 右侧信息面板已打开</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* 底部区域 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-2 pointer-events-none">
        {/* 时间控制面板 */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pointer-events-auto w-full max-w-xl px-3"
        >
          <div className="sci-panel p-2 sm:p-3 flex flex-col gap-2">
            {/* Tab switcher */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] sm:text-xs text-sci-white/50 mr-1 shrink-0 flex items-center gap-1">
                <Gauge size={12} />
                时间
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
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition-all interactive-hover ${
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
                {speeds.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.value}
                      onClick={() => setTimeSpeed(s.value)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-all interactive-hover ${
                        timeSpeed === s.value
                          ? 'bg-sci-cyan/80 text-space-900'
                          : 'text-sci-white/60 hover:text-sci-white hover:bg-sci-cyan/10'
                      }`}
                    >
                      <Icon size={12} />
                      {s.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Tab: 光速旅行 */}
            {timeMode === 'light-speed' && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] sm:text-xs text-sci-white/60">
                  以光速前进时，每秒钟你可以穿越这些距离：
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-8 gap-1.5">
                  {celestialBodies
                    .filter((b) => b.id !== 'sun')
                    .map((body) => {
                      const minutes = lightTravelMinutes(body.orbit.a)
                      return (
                        <div
                          key={body.id}
                          className="flex flex-col items-center rounded bg-sci-cyan/5 border border-sci-cyan/10 px-1.5 py-1 stagger-item"
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
                <div className="grid grid-cols-2 sm:grid-cols-8 gap-1.5">
                  {lifetimeData.map((body) => {
                    const orbits = body.orbits
                    const isInteger = Number.isInteger(orbits)
                    return (
                      <div
                        key={body.id}
                        className="flex flex-col items-center rounded bg-sci-cyan/5 border border-sci-cyan/10 px-1.5 py-1 stagger-item"
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
        </motion.div>

        {/* Dock 栏 - 三分组 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="pointer-events-auto dock-container mb-3"
        >
          {dockGroups.map((group, gi) => (
            <div key={group.key} className="flex items-center gap-1">
              {gi > 0 && <div className="dock-divider" />}
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    onMouseEnter={() => playUISound('hover')}
                    className={`dock-item interactive-hover ${item.active ? 'active' : ''} ${item.primary ? 'text-sci-cyan' : ''}`}
                  >
                    <Icon size={18} strokeWidth={item.primary ? 2.5 : 1.5} />
                    <span className="dock-tooltip">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </motion.div>

        {/* 工具箱抽屉 - 桌面端弹出，移动端底部滑入 */}
        <AnimatePresence>
          {toolboxOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-20 pointer-events-auto"
                onClick={() => setToolboxOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-auto toolbox-drawer mb-2 sm:mb-2"
              >
              {toolboxSections.map((section) => (
                <div key={section.title} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-sci-white/30 uppercase tracking-wider mr-1">
                    {section.title}
                  </span>
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        onMouseEnter={() => playUISound('hover')}
                        className={item.primary ? 'toolbox-item-primary' : 'toolbox-item'}
                      >
                        <Icon size={14} />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

import {
  Rocket,
  History,
  Microscope,
  Moon,
  Orbit,
  Eye,
  FlaskConical,
  Satellite,
  Telescope,
  Ruler,
  Sparkles,
  BookOpen,
  Award,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { celestialBodies, dwarfPlanets, lunarEclipseDemo } from '../data/celestialData'
import { evaluateAchievements } from '../utils/achievements'
import { playUISound } from '../utils/audio'
import { achievements } from '../data/achievements'

type ToolboxItem = {
  icon: LucideIcon
  label: string
  onClick: () => void
  primary?: boolean
}

type ToolboxSection = {
  label: string
  items: ToolboxItem[]
}

function handleLunarEclipse() {
  const state = useStore.getState()

  state.setCurrentDay(lunarEclipseDemo.julianDay - 2451545.0)
  state.setCameraFocus([18, 4, 12], [0, 0, 0])
  state.setSelectedBody(null)

  if (state.activeMissionId) {
    state.addMissionObservedEvent('moon')
  }

  evaluateAchievements()
  state.unlockAchievement('eclipse_witness')
}

const sections: ToolboxSection[] = [
  {
    label: '演示',
    items: [
      {
        icon: Moon,
        label: '月食实验',
        onClick: () => { playUISound('click'); handleLunarEclipse() },
        primary: true,
      },
      {
        icon: Orbit,
        label: '黑洞探险',
        onClick: () => { playUISound('click'); useStore.getState().setShowBlackHole(true) },
      },
    ],
  },
  {
    label: '工具',
    items: [
      {
        icon: Eye,
        label: '预测挑战',
        onClick: () => { playUISound('click'); useStore.getState().setShowPredictionGame(true) },
      },
      {
        icon: FlaskConical,
        label: '沙盘实验',
        onClick: () => { playUISound('click'); useStore.getState().setShowSandbox(true) },
      },
      {
        icon: Orbit,
        label: '轨道设计',
        onClick: () => { playUISound('click'); useStore.getState().setShowHohmannDesigner(true) },
      },
    ],
  },
  {
    label: '探索',
    items: [
      {
        icon: Rocket,
        label: '探索任务',
        onClick: () => { playUISound('click'); useStore.getState().setShowMissionPanel(true) },
        primary: true,
      },
      {
        icon: History,
        label: '探索历程',
        onClick: () => { playUISound('click'); useStore.getState().setShowExplorationHistory(true) },
      },
      {
        icon: Microscope,
        label: '天文学家',
        onClick: () => { playUISound('click'); useStore.getState().setShowScientistGallery(true) },
      },
    ],
  },
  {
    label: '资料',
    items: [
      {
        icon: Satellite,
        label: '航天器',
        onClick: () => {
          playUISound('click')
          useStore.getState().setSelectedSpacecraft('voyager1')
          useStore.getState().setShowSpacecraftPanel(true)
        },
      },
      {
        icon: Telescope,
        label: '四季星空',
        onClick: () => { playUISound('click'); useStore.getState().setShowStarMap(true) },
      },
      {
        icon: Ruler,
        label: '比例尺',
        onClick: () => { playUISound('click'); useStore.getState().setShowScaleRuler(true) },
      },
    ],
  },
  {
    label: '其他',
    items: [
      {
        icon: Sparkles,
        label: '光速旅程',
        onClick: () => {
          playUISound('click')
          useStore.getState().setJourneyMode('running')
          useStore.getState().setCurrentJourneyIndex(0)
        },
      },
      {
        icon: BookOpen,
        label: '故事任务',
        onClick: () => { playUISound('click'); useStore.getState().setShowNarrative(true) },
      },
      {
        icon: Award,
        label: '探索徽章',
        onClick: () => { playUISound('click'); useStore.getState().setShowAchievementPanel(true) },
      },
      {
        icon: FileText,
        label: '导出报告',
        onClick: () => {
          playUISound('click')
          generateExplorationReport()
        },
      },
    ],
  },
]

function generateExplorationReport() {
  const state = useStore.getState()
  const allBodies = [...celestialBodies, ...dwarfPlanets]
  const exploredNames = state.exploredBodies
    .map((id) => allBodies.find((b) => b.id === id)?.nameZh)
    .filter(Boolean)
    .join('、') || '暂无'

  const achievementNames = state.unlockedAchievements
    .map((id) => {
      const a = achievements.find((ach: { id: string }) => ach.id === id)
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

export default function LeftToolbox() {
  return (
    <div className="left-toolbox">
      {sections.map((section) => (
        <div key={section.label} className="left-toolbox-section">
          <span className="left-toolbox-section-label">{section.label}</span>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  onMouseEnter={() => playUISound('hover')}
                  className={`left-toolbox-item ${item.primary ? 'primary' : ''}`}
                  title={item.label}
                >
                  <Icon size={18} strokeWidth={item.primary ? 2.5 : 1.5} />
                  <span className="left-toolbox-item-label">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

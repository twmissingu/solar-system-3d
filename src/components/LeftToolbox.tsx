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
import { lunarEclipseDemo } from '../data/celestialData'
import { getMissionById } from '../data/missions'
import { evaluateAchievements } from '../utils/achievements'
import { playUISound } from '../utils/audio'

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

  state.activeMissionIds.forEach((mid) => {
    const mission = getMissionById(mid)
    if (mission?.type === 'observe' && mission.target.bodyId === 'moon') {
      state.addMissionObservedEvent(mid, 'moon')
    }
  })

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
        onClick: () => { playUISound('click'); handleLunarEclipse(); useStore.getState().setShowEclipseLab(true) },
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
    ],
  },
]

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

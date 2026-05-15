import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import InfoPanel from './components/InfoPanel'
import Controls from './components/Controls'
import TopBar from './components/TopBar'
import LeftToolbox from './components/LeftToolbox'
import WelcomeOverlay from './components/WelcomeOverlay'
import LoadingScreen from './components/LoadingScreen'
import WelcomeFallback from './components/WelcomeFallback'

const BlackHoleWelcome = lazy(() => import('./components/BlackHoleWelcome'))
const MainCanvas = lazy(() => import('./components/MainCanvas'))
import MissionPanel from './components/MissionPanel'
import AchievementToast from './components/AchievementToast'
import AchievementPanel from './components/AchievementPanel'
import JourneyMode from './components/JourneyMode'
import JourneyHUD from './components/JourneyHUD'
import PredictionGame from './components/PredictionGame'
import SandboxPanel from './components/SandboxPanel'
import SpacecraftPanel from './components/SpacecraftPanel'
import HohmannDesigner from './components/HohmannDesigner'
import EclipseLab from './components/EclipseLab'
import HUDOverlay from './components/HUDOverlay'
import BlackHoleSimulator from './components/BlackHoleSimulator'
import NarrativePanel from './components/NarrativePanel'
import AudioController from './components/AudioController'

import ScientistGallery from './components/ScientistGallery'
import ScaleRuler from './components/ScaleRuler'
import StarMapPanel from './components/StarMapPanel'
import ExplorationHistoryPanel from './components/ExplorationHistoryPanel'
import { useStore } from './store/useStore'
import { evaluateAchievements } from './utils/achievements'

export default function App() {
  const appPhase = useStore((s) => s.appPhase)
  const setAppPhase = useStore((s) => s.setAppPhase)
  const isFirstVisit = useStore((s) => s.isFirstVisit)
  const markVisited = useStore((s) => s.markVisited)

  const [isLoading, setIsLoading] = useState(true)
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false)

  // 启动时从 localStorage 恢复知识计数并重新评估成就
  useEffect(() => {
    evaluateAchievements()
  }, [])

  // 加载完成
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    if (isFirstVisit) {
      setAppPhase('welcome')
    } else {
      setAppPhase('main')
    }
  }, [isFirstVisit, setAppPhase])

  // 从欢迎页进入主场景
  const handleEnterMain = useCallback(() => {
    setAppPhase('transition')
  }, [setAppPhase])

  // Transition 完成，进入主场景
  useEffect(() => {
    if (appPhase === 'transition') {
      const timer = setTimeout(() => {
        setAppPhase('main')
        if (isFirstVisit) {
          markVisited()
          setShowWelcomeOverlay(true)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [appPhase, isFirstVisit, markVisited, setAppPhase])

  const showMissionPanel = useStore((s) => s.showMissionPanel)
  const setShowMissionPanel = useStore((s) => s.setShowMissionPanel)
  const showAchievementPanel = useStore((s) => s.showAchievementPanel)
  const setShowAchievementPanel = useStore((s) => s.setShowAchievementPanel)
  const showPredictionGame = useStore((s) => s.showPredictionGame)
  const showSandbox = useStore((s) => s.showSandbox)
  const showSpacecraftPanel = useStore((s) => s.showSpacecraftPanel)
  const showHohmannDesigner = useStore((s) => s.showHohmannDesigner)
  const showEclipseLab = useStore((s) => s.showEclipseLab)
  const showBlackHole = useStore((s) => s.showBlackHole)
  const showNarrative = useStore((s) => s.showNarrative)

  const showJourneyHUD = useStore((s) => s.showJourneyHUD)
  const showScientistGallery = useStore((s) => s.showScientistGallery)
  const showScaleRuler = useStore((s) => s.showScaleRuler)
  const showStarMap = useStore((s) => s.showStarMap)
  const showExplorationHistory = useStore((s) => s.showExplorationHistory)

  return (
    <div className="relative w-full h-full">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Black Hole Welcome — 懒加载，fallback 为纯 CSS 版本 */}
      {appPhase === 'welcome' && (
        <Suspense fallback={<WelcomeFallback onEnter={handleEnterMain} />}>
          <BlackHoleWelcome onEnter={handleEnterMain} />
        </Suspense>
      )}

      {/* Transition Black Screen */}
      {appPhase === 'transition' && (
        <div className="fixed inset-0 z-[200] bg-black" />
      )}

      {/* Main Scene */}
      {(appPhase === 'main' || appPhase === 'transition') && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            appPhase === 'main' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* 3D Canvas — 懒加载，不与首屏 JS 捆绑 */}
          <Suspense fallback={<div className="absolute inset-0" style={{ background: '#050B14' }} />}>
            <MainCanvas />
          </Suspense>

          {/* UI Overlay */}
          {showWelcomeOverlay && (
            <WelcomeOverlay onClose={() => setShowWelcomeOverlay(false)} />
          )}
          <TopBar />
          <LeftToolbox />
          <InfoPanel />
          <Controls />
          <JourneyMode />
          {showJourneyHUD && <JourneyHUD />}
          {showMissionPanel && <MissionPanel onClose={() => setShowMissionPanel(false)} />}
          <AchievementToast />
          {showAchievementPanel && <AchievementPanel onClose={() => setShowAchievementPanel(false)} />}
          {showPredictionGame && <PredictionGame />}
          {showSandbox && <SandboxPanel />}
          {showSpacecraftPanel && <SpacecraftPanel />}
          {showHohmannDesigner && <HohmannDesigner />}
          {showEclipseLab && <EclipseLab />}
          {showBlackHole && <BlackHoleSimulator />}
          {showNarrative && <NarrativePanel />}

          {showScientistGallery && <ScientistGallery />}
          {showScaleRuler && <ScaleRuler />}
          {showStarMap && <StarMapPanel />}
          {showExplorationHistory && <ExplorationHistoryPanel />}
          <AudioController />
          <HUDOverlay />
        </div>
      )}
    </div>
  )
}

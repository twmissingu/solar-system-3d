import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import SolarSystem from './components/SolarSystem'
import InfoPanel from './components/InfoPanel'
import Controls from './components/Controls'
import WelcomeOverlay from './components/WelcomeOverlay'
import LoadingScreen from './components/LoadingScreen'
import MissionPanel from './components/MissionPanel'
import AchievementToast from './components/AchievementToast'
import AchievementPanel from './components/AchievementPanel'
import JourneyMode from './components/JourneyMode'
import JourneyHUD from './components/JourneyHUD'
import PredictionGame from './components/PredictionGame'
import SandboxPanel from './components/SandboxPanel'
import Spacecraft from './components/Spacecraft'
import SpacecraftPanel from './components/SpacecraftPanel'
import HohmannDesigner from './components/HohmannDesigner'
import EclipseLab from './components/EclipseLab'
import HUDOverlay from './components/HUDOverlay'
import BlackHoleSimulator from './components/BlackHoleSimulator'
import NarrativePanel from './components/NarrativePanel'
import AudioController from './components/AudioController'
import SharePanel from './components/SharePanel'
import { useStore } from './store/useStore'

export default function App() {
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
  const showSharePanel = useStore((s) => s.showSharePanel)
  const showJourneyHUD = useStore((s) => s.showJourneyHUD)
  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 40, 50], fov: 45, near: 0.1, far: 2000 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        style={{ background: '#050B14' }}
      >
        <color attach="background" args={['#050B14']} />
        <fog attach="fog" args={['#050B14', 50, 900]} />

        {/* 环境光 - 微弱的蓝灰色，模拟星际空间 */}
        <ambientLight intensity={0.08} color="#2A3F5F" />

        {/* 太阳光 - 方向光源替代点光源的 castShadow，避免 PointLight 6-pass CubeCamera 阴影性能灾难 */}
        <directionalLight
          position={[0, 0, 0]}
          intensity={2}
          color="#FFF8DC"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.5}
          shadow-camera-far={1000}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
        />
        <pointLight
          position={[0, 0, 0]}
          intensity={1000}
          color="#FFF8DC"
          distance={600}
          decay={1.2}
        />

        {/* 方向光补充 - 模拟远处星光 */}
        <directionalLight position={[50, 30, 20]} intensity={0.3} color="#AED6F1" />

        <Suspense fallback={null}>
          <Stars
            radius={500}
            depth={100}
            count={8000}
            factor={4}
            saturation={0.2}
            fade
            speed={0.5}
          />
          <SolarSystem />
          <Spacecraft />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={700}
          zoomSpeed={0.8}
          rotateSpeed={0.5}
          panSpeed={0.5}
        />
      </Canvas>

      {/* UI Overlay */}
      <LoadingScreen />
      <WelcomeOverlay />
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
      {showSharePanel && <SharePanel />}
      <AudioController />
      <HUDOverlay />
    </div>
  )
}

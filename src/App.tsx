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
import { useStore } from './store/useStore'

export default function App() {
  const { showMissionPanel, setShowMissionPanel, showAchievementPanel, setShowAchievementPanel } = useStore()
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

        {/* 太阳光 - 点光源，位于太阳位置 */}
        <pointLight
          position={[0, 0, 0]}
          intensity={1000}
          color="#FFF8DC"
          distance={600}
          decay={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={100}
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
      {showMissionPanel && <MissionPanel onClose={() => setShowMissionPanel(false)} />}
      <AchievementToast />
      {showAchievementPanel && <AchievementPanel onClose={() => setShowAchievementPanel(false)} />}
    </div>
  )
}

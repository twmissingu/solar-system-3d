import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import SolarSystem from './SolarSystem'
import Spacecraft from './Spacecraft'

export default function MainCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 300, 1000], fov: 50, near: 0.1, far: 4000 }}
      gl={{ antialias: true, alpha: false }}
      shadows
      style={{ background: '#050B14' }}
    >
      <color attach="background" args={['#050B14']} />
      <fog attach="fog" args={['#050B14', 50, 3500]} />

      <ambientLight intensity={0.08} color="#2A3F5F" />

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
        maxDistance={2500}
        zoomSpeed={0.8}
        rotateSpeed={0.5}
        panSpeed={0.5}
      />
    </Canvas>
  )
}

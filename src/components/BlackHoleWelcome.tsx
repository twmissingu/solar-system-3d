import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

// ============================================
// Shaders
// ============================================

const accretionVertexShader = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vNormal;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`

const accretionFragmentShader = /* glsl */ `
uniform float uTime;
varying vec3 vWorldPosition;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  float dist = length(vWorldPosition.xz);

  float innerR = 2.5;
  float outerR = 6.5;

  float innerEdge = smoothstep(innerR - 0.3, innerR, dist);
  float outerEdge = 1.0 - smoothstep(outerR - 0.5, outerR, dist);
  float radialMask = innerEdge * outerEdge;

  if (radialMask < 0.01) discard;

  float t = (dist - innerR) / (outerR - innerR);
  float angle = atan(vWorldPosition.z, vWorldPosition.x);

  float spiral1 = sin(angle * 6.0 + log(dist + 0.1) * 3.0 - uTime * 0.6) * 0.5 + 0.5;
  float spiral2 = sin(angle * 4.0 - log(dist + 0.1) * 2.0 + uTime * 0.4) * 0.5 + 0.5;
  float spiral = spiral1 * 0.6 + spiral2 * 0.4;

  float turb = noise(vec2(angle * 2.0, dist * 1.5 - uTime * 0.3)) * 0.3 + 0.7;
  float brightness = (1.0 - t * 0.6) * (0.25 + 0.75 * spiral) * turb;

  vec3 innerColor = vec3(1.0, 0.97, 0.88);
  vec3 outerColor = vec3(0.92, 0.38, 0.15);
  vec3 color = mix(innerColor, outerColor, t);

  float doppler = cos(angle - uTime * 0.25);
  vec3 blueSide = vec3(0.65, 0.82, 1.0);
  vec3 redSide = vec3(1.0, 0.35, 0.18);
  vec3 dopplerColor = mix(redSide, blueSide, doppler * 0.5 + 0.5);
  color = mix(color, dopplerColor, 0.25);

  float hotCore = (1.0 - smoothstep(innerR, innerR + 1.2, dist)) * 0.5;
  color += vec3(0.3, 0.25, 0.2) * hotCore;

  vec3 finalColor = color * brightness;

  float glow = exp(-abs(dist - outerR) * 2.0) * 0.4 + exp(-abs(dist - innerR) * 3.0) * 0.3;
  finalColor += vec3(0.35, 0.55, 0.75) * glow;

  float outerGlow = exp(-dist * 0.5) * 0.08;
  finalColor += vec3(0.2, 0.4, 0.6) * outerGlow;

  gl_FragColor = vec4(finalColor, radialMask * 0.92);
}
`

const horizonVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`

const horizonFragmentShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 4.0);
  vec3 glowColor = vec3(0.25, 0.45, 0.65) * fresnel * 1.2;
  float alpha = fresnel * 0.7;
  gl_FragColor = vec4(glowColor, alpha);
}
`

// ============================================
// 3D Components
// ============================================

function AccretionDisk() {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.08
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.2, 6.8, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={accretionVertexShader}
        fragmentShader={accretionFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function EventHorizon() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <shaderMaterial
          vertexShader={horizonVertexShader}
          fragmentShader={horizonFragmentShader}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function DustParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  const particleData = useMemo(() => {
    const count = 300
    const positions = new Float32Array(count * 3)
    const angles = new Float32Array(count)
    const radii = new Float32Array(count)
    const speeds = new Float32Array(count)
    const yOffsets = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      angles[i] = Math.random() * Math.PI * 2
      radii[i] = 8 + Math.random() * 35
      speeds[i] = 0.0002 + Math.random() * 0.0008
      yOffsets[i] = (Math.random() - 0.5) * 4

      positions[i * 3] = Math.cos(angles[i]) * radii[i]
      positions[i * 3 + 1] = yOffsets[i]
      positions[i * 3 + 2] = Math.sin(angles[i]) * radii[i]
    }

    return { positions, angles, radii, speeds, yOffsets, count }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const { angles, radii, speeds, yOffsets } = particleData
    const time = state.clock.elapsedTime

    for (let i = 0; i < particleData.count; i++) {
      angles[i] += speeds[i]
      const r = radii[i]
      const yDrift = Math.sin(time * 0.15 + i * 0.1) * 0.002
      yOffsets[i] += yDrift

      pos[i * 3] = Math.cos(angles[i]) * r
      pos[i * 3 + 1] = yOffsets[i]
      pos[i * 3 + 2] = Math.sin(angles[i]) * r
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#aaccee"
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function CameraRig({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  useFrame((state) => {
    const targetX = mouseX * 1.5
    const targetY = 3 + mouseY * 0.8
    state.camera.position.x += (targetX - state.camera.position.x) * 0.015
    state.camera.position.y += (targetY - state.camera.position.y) * 0.015
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

// ============================================
// Main Component
// ============================================

interface BlackHoleWelcomeProps {
  onEnter: () => void
}

export default function BlackHoleWelcome({ onEnter }: BlackHoleWelcomeProps) {
  const [hovered, setHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    })
  }, [])

  return (
    <div
      className="fixed inset-0 z-40"
      style={{ background: '#000000' }}
      onMouseMove={handleMouseMove}
    >
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 3, 18], fov: 50, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#000000']} />
        <CameraRig mouseX={mousePos.x} mouseY={mousePos.y} />
        <EventHorizon />
        <AccretionDisk />
        <DustParticles />
        <Stars
          radius={400}
          depth={100}
          count={15000}
          factor={5}
          saturation={0.1}
          fade
          speed={0.15}
        />
      </Canvas>

      {/* DOM Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          className="text-center mb-10 sm:mb-14"
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-sci-white sci-text-glow tracking-[0.12em] mb-3"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            太阳系 3D 探索
          </h1>
          <p className="text-xs sm:text-sm text-sci-cyan/50 tracking-[0.4em] uppercase font-light">
            Interstellar Exploration
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          <motion.button
            onClick={onEnter}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="pointer-events-auto sci-button-primary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-3.5 rounded-md relative overflow-hidden"
            style={{
              boxShadow: hovered
                ? '0 0 40px rgba(78, 205, 196, 0.35), 0 0 80px rgba(78, 205, 196, 0.1)'
                : '0 0 20px rgba(78, 205, 196, 0.1)',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              进入探索
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
              </svg>
            </span>
            <motion.div
              className="absolute inset-0 bg-sci-cyan/20"
              initial={{ x: '-100%' }}
              animate={{ x: hovered ? '0%' : '-100%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="text-[10px] sm:text-xs text-sci-white/25 mt-6 tracking-wider"
        >
          移动鼠标探索深空 · 点击按钮开始旅程
        </motion.p>
      </div>

      {/* 偏振光柱 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="welcome-light-beam" style={{ left: '15%', animationDelay: '0s' }} />
        <div className="welcome-light-beam" style={{ left: '38%', animationDelay: '2.5s' }} />
        <div className="welcome-light-beam" style={{ left: '62%', animationDelay: '5s' }} />
        <div className="welcome-light-beam" style={{ left: '85%', animationDelay: '1.2s' }} />
      </div>
    </div>
  )
}

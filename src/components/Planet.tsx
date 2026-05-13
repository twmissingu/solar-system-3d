import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { CelestialBody, getRealVisualRadius } from '../data/celestialData'
import { useStore } from '../store/useStore'
import { getHeliocentricPosition, getSatellitePosition } from '../utils/orbit'
import { evaluateAchievements } from '../utils/achievements'
import { playUISound, playAmbientDrone } from '../utils/audio'

function PulsingBeacon({ color, size }: { color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.getElapsedTime()
      const pulse = 0.5 + 0.5 * Math.sin(t * 3)
      materialRef.current.opacity = 0.3 + pulse * 0.7
    }
    if (meshRef.current) {
      const t = clock.getElapsedTime()
      meshRef.current.scale.setScalar(1 + 0.3 * Math.sin(t * 3))
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

interface PlanetProps {
  body: CelestialBody
  parentPosition?: [number, number, number]
  isSatellite?: boolean
}

export default function Planet({ body, parentPosition = [0, 0, 0], isSatellite = false }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const droneCleanupRef = useRef<(() => void) | undefined>(undefined)
  const isHoveredRef = useRef(false)
  const currentDay = useStore((s) => s.currentDay)
  const selectedBody = useStore((s) => s.selectedBody)
  const setSelectedBody = useStore((s) => s.setSelectedBody)
  const showLabels = useStore((s) => s.showLabels)
  const showOrbits = useStore((s) => s.showOrbits)
  const scaleMode = useStore((s) => s.scaleMode)
  const addExploredBody = useStore((s) => s.addExploredBody)
  const addMissionExploredBody = useStore((s) => s.addMissionExploredBody)
  const activeMissionId = useStore((s) => s.activeMissionId)

  const isSelected = selectedBody?.id === body.id

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      if (droneCleanupRef.current) {
        droneCleanupRef.current()
        droneCleanupRef.current = undefined
      }
    }
  }, [])

  // 根据尺度模式计算实际显示半径
  const effectiveRadius = useMemo(() => {
    if (scaleMode === 'realistic') {
      return getRealVisualRadius(body.radiusKm)
    }
    return body.visualRadius
  }, [scaleMode, body.radiusKm, body.visualRadius])

  // 计算轨道位置
  const position = useMemo(() => {
    if (body.id === 'sun') return [0, 0, 0] as [number, number, number]
    const pos = isSatellite
      ? getSatellitePosition(body.orbit, currentDay)
      : getHeliocentricPosition(body.orbit, currentDay)
    return [
      pos[0] + parentPosition[0],
      pos[1] + parentPosition[1],
      pos[2] + parentPosition[2],
    ] as [number, number, number]
  }, [body.id, body.orbit, currentDay, parentPosition[0], parentPosition[1], parentPosition[2], isSatellite])

  // 自转动画 / 潮汐锁定
  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (body.isTidallyLocked && isSatellite) {
      // 潮汐锁定：始终同一面朝母星
      // 母星在本地坐标系原点 [0,0,0]
      meshRef.current.lookAt(0, 0, 0)
      // 固定一个轴旋转，避免翻滚
      meshRef.current.rotateZ(Math.PI)
    } else if (body.rotationPeriod > 0) {
      // 正常自转（归一化到 [0, 2π) 避免角度无限累积）
      const rotationSpeed = (delta * 0.5) / (body.rotationPeriod / 24)
      meshRef.current.rotation.y = (meshRef.current.rotation.y + rotationSpeed) % (Math.PI * 2)
    }
  })

  // 生成轨道线（仅行星）
  const orbitPoints = useMemo(() => {
    if (isSatellite || body.id === 'sun') return null
    const points: [number, number, number][] = []
    const steps = 128
    for (let i = 0; i <= steps; i++) {
      const day = (body.orbit.period * i) / steps
      const pos = getHeliocentricPosition(body.orbit, day)
      points.push([pos[0], pos[1], pos[2]])
    }
    return points
  }, [body.id, body.orbit, isSatellite])

  // 材质颜色
  const baseColor = useMemo(() => new THREE.Color(body.color), [body.color])
  const blackColor = useMemo(() => new THREE.Color(0x000000), [])

  return (
    <group position={position}>
      {/* 轨道线 */}
      {showOrbits && orbitPoints && orbitPoints.length > 0 && (
        <Line
          points={orbitPoints}
          color={body.color}
          lineWidth={1}
          transparent
          opacity={0.2}
        />
      )}

      {/* 天体本体 - 应用自转轴倾角 */}
      <group rotation={[body.axialTilt * (Math.PI / 180), 0, 0]}>
        <mesh
          ref={meshRef}
          onPointerOver={() => {
            if (!isHoveredRef.current) {
              isHoveredRef.current = true
              playUISound('hover')
            }
          }}
          onPointerOut={() => {
            isHoveredRef.current = false
          }}
          onClick={(e) => {
            e.stopPropagation()
            playUISound('click')
            setSelectedBody(body)
            addExploredBody(body.id)
            if (activeMissionId) {
              addMissionExploredBody(body.id)
            }
            evaluateAchievements()
            // Start ambient drone for this planet
            if (droneCleanupRef.current) {
              droneCleanupRef.current()
            }
            droneCleanupRef.current = playAmbientDrone(body.id)
          }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[effectiveRadius, 32, 32]} />
          <meshStandardMaterial
            color={baseColor}
            roughness={0.7}
            metalness={0.1}
            emissive={body.id === 'sun' ? baseColor : blackColor}
            emissiveIntensity={body.id === 'sun' ? 0.8 : 0}
          />
        </mesh>

        {/* 赤道参考线（仅非太阳天体） */}
        {body.id !== 'sun' && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[effectiveRadius * 1.01, effectiveRadius * 1.02, 64]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* 太阳光晕 */}
      {body.id === 'sun' && (
        <>
          <mesh>
            <sphereGeometry args={[effectiveRadius * 1.3, 32, 32]} />
            <meshBasicMaterial
              color="#FDB813"
              transparent
              opacity={0.12}
              side={THREE.BackSide}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[effectiveRadius * 1.8, 32, 32]} />
            <meshBasicMaterial
              color="#FFD700"
              transparent
              opacity={0.04}
              side={THREE.BackSide}
            />
          </mesh>
        </>
      )}

      {/* 土星光环 - 极薄的环面 */}
      {body.hasRings && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry
            args={[
              effectiveRadius * (body.ringInnerRadius || 1.2),
              effectiveRadius * (body.ringOuterRadius || 2.3),
              128,
            ]}
          />
          <meshStandardMaterial
            color={body.ringColor || '#D4C5A3'}
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 真实比例模式下不可见天体的脉冲信标 */}
      {scaleMode === 'realistic' && effectiveRadius < 0.08 && body.id !== 'sun' && (
        <PulsingBeacon color={body.color} size={0.08} />
      )}

      {/* 选中高亮 */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[effectiveRadius * 1.15, 32, 32]} />
          <meshBasicMaterial color="#4ECDC4" transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>
      )}

      {/* 标签 */}
      {showLabels && (
        <Html distanceFactor={15} position={[0, effectiveRadius * 1.5, 0]} center>
          <div
            className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-sci-cyan/20 text-sci-cyan border border-sci-cyan/40'
                : 'bg-space-800/60 text-sci-white/70 border border-white/10'
            }`}
            style={{ fontFamily: 'Noto Sans SC, sans-serif', pointerEvents: 'none' }}
          >
            {body.nameZh}
          </div>
        </Html>
      )}

      {/* 递归渲染卫星 */}
      {body.satellites?.map((sat) => (
        <Planet key={sat.id} body={sat} parentPosition={position} isSatellite />
      ))}
    </group>
  )
}



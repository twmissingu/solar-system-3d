import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { CelestialBody, getVisualRadius, SIMULATION_BASE_RATE } from '../data/celestialData'
import { useStore } from '../store/useStore'
import type { TimeSpeed } from '../store/useStore'
import { getHeliocentricPosition, getSatellitePosition } from '../utils/orbit'
import { evaluateAchievements } from '../utils/achievements'
import { playUISound } from '../utils/audio'
import { getPlanetTexture } from '../utils/planetTextures'

function SelectionRings({ radius }: { radius: number }) {
  const ringRef = useRef<THREE.Mesh>(null)
  const sweepRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * 0.8
      ringRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.15
    }
    if (sweepRef.current) {
      const t = (clock.elapsedTime * 0.6) % 1
      sweepRef.current.position.y = Math.sin(t * Math.PI * 2) * radius * 0.6
      const sweepOpacity = Math.sin(t * Math.PI) * 0.4
      const mat = sweepRef.current.material as THREE.MeshBasicMaterial
      if (mat) mat.opacity = sweepOpacity
    }
  })

  return (
    <group>
      {/* 外环 - 缓慢旋转 */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.3, radius * 1.35, 64]} />
        <meshBasicMaterial
          color="#4ECDC4"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 内环 - 反向旋转 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.15, radius * 1.18, 64]} />
        <meshBasicMaterial
          color="#4ECDC4"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 扫描光束 */}
      <mesh ref={sweepRef} rotation={[0, 0, 0]}>
        <planeGeometry args={[radius * 3, radius * 0.15]} />
        <meshBasicMaterial
          color="#4ECDC4"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 球壳发光 */}
      <mesh>
        <sphereGeometry args={[radius * 1.12, 32, 32]} />
        <meshBasicMaterial color="#4ECDC4" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

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
  const isHoveredRef = useRef(false)
  const currentDay = useStore((s) => s.currentDay)
  const selectedBody = useStore((s) => s.selectedBody)
  const setSelectedBody = useStore((s) => s.setSelectedBody)
  const setCameraFocus = useStore((s) => s.setCameraFocus)
  const planetScale = useStore((s) => s.planetScale)
  const showLabels = useStore((s) => s.showLabels)
  const showOrbits = useStore((s) => s.showOrbits)
  const addExploredBody = useStore((s) => s.addExploredBody)
  const addMissionExploredBody = useStore((s) => s.addMissionExploredBody)
  const activeMissionId = useStore((s) => s.activeMissionId)
  const timeSpeed = useStore((s) => s.timeSpeed)

  const isSelected = selectedBody?.id === body.id



  // 根据统一公式计算显示半径
  const effectiveRadius = useMemo(() => {
    const base = getVisualRadius(body.radiusKm)
    // 太阳固定为真实比例，不随滑块缩放
    if (body.id === 'sun') return base
    return base * planetScale
  }, [body.radiusKm, body.id, planetScale])

  // 计算轨道位置
  const position = useMemo(() => {
    if (body.id === 'sun') return [0, 0, 0] as [number, number, number]
    const pos = isSatellite
      ? getSatellitePosition(body.orbit, currentDay)
      : getHeliocentricPosition(body.orbit, currentDay)
    // 卫星渲染在父级 group 内部（由递归 body.satellites?.map 产生），
    // 父 group 已通过 position prop 提供父天体的世界坐标偏移，
    // 因此卫星只需返回相对于父天体的轨道位置，无需再加 parentPosition。
    // 卫星轨道固定为 SATELLITE_SCALE=8500 计算值，planetScale 仅影响视觉大小
    if (isSatellite) return pos as [number, number, number]
    return [
      pos[0] + parentPosition[0],
      pos[1] + parentPosition[1],
      pos[2] + parentPosition[2],
    ] as [number, number, number]
  }, [body.id, body.orbit, currentDay, isSatellite])
  // parentPosition 未加入 deps：非卫星的 parentPosition 恒为 [0,0,0]；卫星在父 group 内渲染不依赖此值

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
      // 正常自转：用 timeSpeed 同步时间加速，金星逆向自转
      const speedMap: Record<Exclude<TimeSpeed, 'pause'>, number> = { '1x': 1, '10x': 10, '100x': 100, '1000x': 1000 }
      const speed = timeSpeed === 'pause' ? 0 : speedMap[timeSpeed] || 1
      const dayFraction = (delta * SIMULATION_BASE_RATE * speed) / (body.rotationPeriod / 24)
      const rotationRad = dayFraction * Math.PI * 2
      const direction = body.id === 'venus' ? -1 : 1
      meshRef.current.rotation.y = (meshRef.current.rotation.y + rotationRad * direction) % (Math.PI * 2)
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

  // 材质颜色与纹理
  const baseColor = useMemo(() => new THREE.Color(body.color), [body.color])
  const blackColor = useMemo(() => new THREE.Color(0x000000), [])
  const planetTexture = useMemo(() => getPlanetTexture(body.id), [body.id])

  return (
    <>
    {/* 轨道线（在 group 外部，使用全局坐标，不受 position 偏移影响） */}
    {showOrbits && orbitPoints && orbitPoints.length > 0 && (
      <Line
        points={orbitPoints}
        color={isSelected ? '#4ECDC4' : body.color}
        lineWidth={isSelected ? 2 : 1}
        transparent
        opacity={isSelected ? 0.5 : 0.2}
      />
    )}

    <group position={position}>
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
            // 计算世界坐标：卫星的 position 是相对母星的，需加上 parentPosition
            const wx = position[0] + (isSatellite ? parentPosition[0] : 0)
            const wy = position[1] + (isSatellite ? parentPosition[1] : 0)
            const wz = position[2] + (isSatellite ? parentPosition[2] : 0)
            // 相机聚焦到该天体：从斜上方以合理距离观察
            const dist = Math.max(effectiveRadius * 5, 3)
            if (body.id === 'sun') {
              setCameraFocus([dist, dist * 0.3, dist], [0, 0, 0])
            } else {
              setCameraFocus(
                [wx + dist, wy + dist * 0.3, wz + dist],
                [wx, wy, wz]
              )
            }
            addExploredBody(body.id)
            if (activeMissionId) {
              addMissionExploredBody(body.id)
            }
            evaluateAchievements()
          }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[effectiveRadius, 48, 48]} />
          {planetTexture ? (
            <meshStandardMaterial
              map={planetTexture}
              color={body.id === 'sun' ? baseColor : undefined}
              roughness={body.id === 'sun' ? 0.9 : 0.75}
              metalness={body.id === 'sun' ? 0 : 0.05}
              emissive={body.id === 'sun' ? baseColor : blackColor}
              emissiveIntensity={body.id === 'sun' ? 0.6 : 0}
              emissiveMap={body.id === 'sun' ? planetTexture : undefined}
            />
          ) : (
            <meshStandardMaterial
              color={baseColor}
              roughness={0.7}
              metalness={0.1}
              emissive={body.id === 'sun' ? baseColor : blackColor}
              emissiveIntensity={body.id === 'sun' ? 0.8 : 0}
            />
          )}
        </mesh>

        {/* 赤道参考线（仅非太阳天体） */}
        {body.id !== 'sun' && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[effectiveRadius * 1.01, effectiveRadius * 1.02, 64]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        )}
        {/* 土星光环 - 极薄的环面（继承轴向倾斜） */}
        {body.hasRings && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
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

      {/* 极小不可见天体的脉冲信标（无论哪种尺度模式） */}
      {effectiveRadius < 0.09 && body.id !== 'sun' && (
        <PulsingBeacon color={body.color} size={Math.max(effectiveRadius * 2, 0.09)} />
      )}

      {/* 选中高亮 + 扫描环 */}
      {isSelected && <SelectionRings radius={effectiveRadius} />}

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
    </>
  )
}



import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../store/useStore'
import { celestialBodies, dwarfPlanets, SIMULATION_BASE_RATE } from '../data/celestialData'
import { getHeliocentricPosition } from '../utils/orbit'
import Planet from './Planet'
import AsteroidBelt from './AsteroidBelt'
import * as THREE from 'three'
import type { TimeSpeed } from '../store/useStore'

const SPEED_MAP: Record<Exclude<TimeSpeed, 'pause'>, number> = {
  '1x': 1,
  '10x': 10,
  '100x': 100,
  '1000x': 1000,
}

const allBodies = [...celestialBodies, ...dwarfPlanets]

export default function SolarSystem() {
  const setCurrentDay = useStore((s) => s.setCurrentDay)
  const timeSpeed = useStore((s) => s.timeSpeed)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const cameraLookAt = useStore((s) => s.cameraLookAt)
  const setCameraLookAt = useStore((s) => s.setCameraLookAt)
  const setCameraAnimating = useStore((s) => s.setCameraAnimating)
  const addTimeAdvanced = useStore((s) => s.addTimeAdvanced)
  const selectedBody = useStore((s) => s.selectedBody)
  const { camera } = useThree()
  const controls = useThree((state) => state.controls) as { target: THREE.Vector3 } | null

  // 相机动画状态 ref（避免重渲染）
  const cameraAnimRef = useRef<{
    active: boolean
    startPos: THREE.Vector3
    endPos: THREE.Vector3
    elapsed: number
    duration: number
  } | null>(null)

  // lookAt 目标缓存，避免每帧创建 Vector3
  const lookAtTargetRef = useRef(new THREE.Vector3())

  // 跟踪目标缓存
  const trackingTargetRef = useRef(new THREE.Vector3())

  // lookAt 动画
  const lookAtAnimRef = useRef<{
    active: boolean
    startTarget: THREE.Vector3
    endTarget: THREE.Vector3
    elapsed: number
    duration: number
  } | null>(null)

  // 时间推进 + 相机动画 - 统一在 useFrame 中处理
  useFrame((_, delta) => {
    // 时间推进
    const clampedDelta = Math.min(delta, 0.1)

    if (timeSpeed !== 'pause') {
      const speed = SPEED_MAP[timeSpeed] || 1
      const dayDelta = clampedDelta * speed * SIMULATION_BASE_RATE
      setCurrentDay((prev) => prev + dayDelta)
      addTimeAdvanced(Math.abs(dayDelta))
    }

    // 相机动画
    if (cameraAnimRef.current?.active) {
      const anim = cameraAnimRef.current
      anim.elapsed += clampedDelta
      const t = Math.min(anim.elapsed / anim.duration, 1)
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      camera.position.lerpVectors(anim.startPos, anim.endPos, ease)

      if (t >= 1) {
        anim.active = false
        setCameraTarget(null)
        setCameraLookAt(null)
        setCameraAnimating(false)
      }
    }

    // lookAt 动画
    if (lookAtAnimRef.current?.active) {
      const anim = lookAtAnimRef.current
      anim.elapsed += clampedDelta
      const t = Math.min(anim.elapsed / anim.duration, 1)
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      lookAtTargetRef.current.lerpVectors(anim.startTarget, anim.endTarget, ease)
      camera.lookAt(lookAtTargetRef.current)

      // 同步 OrbitControls target 防止动画结束后回弹到 (0,0,0)
      if (controls) {
        controls.target.copy(lookAtTargetRef.current)
      }

      if (t >= 1) {
        anim.active = false
      }
    }

    // 星体跟踪：相机动画完成后，持续将 controls.target 更新到选中星体的轨道位置
    // 跳过太阳和卫星（卫星轨道需要母星位置，无法在顶层计算）
    if (
      selectedBody &&
      selectedBody.id !== 'sun' &&
      allBodies.some((b) => b.id === selectedBody.id) &&
      !cameraAnimRef.current?.active &&
      !lookAtAnimRef.current?.active
    ) {
      const day = useStore.getState().currentDay
      const [x, y, z] = getHeliocentricPosition(selectedBody.orbit, day)
      trackingTargetRef.current.set(x, y, z)
      if (controls) {
        controls.target.copy(trackingTargetRef.current)
      }
    }
  })

  // 启动相机动画，同时禁用 OrbitControls
  useEffect(() => {
    if (cameraTarget) {
      setCameraAnimating(true)
      cameraAnimRef.current = {
        active: true,
        startPos: camera.position.clone(),
        endPos: new THREE.Vector3(...cameraTarget),
        elapsed: 0,
        duration: 2,
      }
    }
    if (cameraLookAt) {
      lookAtAnimRef.current = {
        active: true,
        startTarget: lookAtTargetRef.current.clone(),
        endTarget: new THREE.Vector3(...cameraLookAt),
        elapsed: 0,
        duration: 2,
      }
    }
  }, [cameraTarget, cameraLookAt, camera, setCameraAnimating])

  return (
    <group>
      {celestialBodies.map((body) => (
        <Planet key={body.id} body={body} />
      ))}
      {dwarfPlanets.map((body) => (
        <Planet key={body.id} body={body} />
      ))}
      <AsteroidBelt />
    </group>
  )
}

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../store/useStore'
import { celestialBodies, dwarfPlanets } from '../data/celestialData'
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

export default function SolarSystem() {
  const setCurrentDay = useStore((s) => s.setCurrentDay)
  const timeSpeed = useStore((s) => s.timeSpeed)
  const cameraTarget = useStore((s) => s.cameraTarget)
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const cameraLookAt = useStore((s) => s.cameraLookAt)
  const setCameraLookAt = useStore((s) => s.setCameraLookAt)
  const addTimeAdvanced = useStore((s) => s.addTimeAdvanced)
  const { camera } = useThree()

  // 相机动画状态 ref（避免重渲染）
  const cameraAnimRef = useRef<{
    active: boolean
    startPos: THREE.Vector3
    endPos: THREE.Vector3
    elapsed: number
    duration: number
  } | null>(null)

  // 标记动画是否刚完成（用于在 useEffect 外触发清理）
  const [animFinished, setAnimFinished] = useState(false)

  // lookAt 目标缓存，避免每帧创建 Vector3
  const lookAtTargetRef = useRef(new THREE.Vector3())

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
      const dayDelta = clampedDelta * speed * 0.5
      setCurrentDay((prev) => prev + dayDelta)
      addTimeAdvanced(Math.abs(dayDelta))
    }

    // 相机动画
    if (cameraAnimRef.current?.active) {
      const anim = cameraAnimRef.current
      anim.elapsed += clampedDelta
      const t = Math.min(anim.elapsed / anim.duration, 1)
      // easeInOutCubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      camera.position.lerpVectors(anim.startPos, anim.endPos, ease)

      if (t >= 1) {
        anim.active = false
        setAnimFinished(true)
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

      if (t >= 1) {
        anim.active = false
      }
    }
  })

  // 动画完成后异步清理状态（避免在 useFrame 中直接 setState）
  useEffect(() => {
    if (animFinished) {
      setAnimFinished(false)
      setCameraTarget(null)
      setCameraLookAt(null)
    }
  }, [animFinished, setCameraTarget, setCameraLookAt])

  // 启动相机动画
  useEffect(() => {
    if (cameraTarget) {
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
        startTarget: new THREE.Vector3(0, 0, 0),
        endTarget: new THREE.Vector3(...cameraLookAt),
        elapsed: 0,
        duration: 2,
      }
    }
  }, [cameraTarget, cameraLookAt, camera])

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

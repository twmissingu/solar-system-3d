import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../store/useStore'
import { celestialBodies, dwarfPlanets } from '../data/celestialData'
import Planet from './Planet'
import AsteroidBelt from './AsteroidBelt'
import * as THREE from 'three'

export default function SolarSystem() {
  const { setCurrentDay, timeSpeed, cameraTarget, setCameraTarget, cameraLookAt, setCameraLookAt, addTimeAdvanced } = useStore()
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
  const animJustFinishedRef = useRef(false)

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
    if (timeSpeed !== 'pause') {
      const speedMap = {
        '1x': 1,
        '10x': 10,
        '100x': 100,
        '1000x': 1000,
      }
      const speed = speedMap[timeSpeed] || 1
      const clampedDelta = Math.min(delta, 0.1)
      const dayDelta = clampedDelta * speed * 0.5
      setCurrentDay((prev) => prev + dayDelta)
      addTimeAdvanced(Math.abs(dayDelta))
    }

    // 相机动画
    if (cameraAnimRef.current?.active) {
      const anim = cameraAnimRef.current
      anim.elapsed += delta
      const t = Math.min(anim.elapsed / anim.duration, 1)
      // easeInOutCubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      camera.position.lerpVectors(anim.startPos, anim.endPos, ease)

      if (t >= 1) {
        anim.active = false
        animJustFinishedRef.current = true
      }
    }

    // lookAt 动画
    if (lookAtAnimRef.current?.active) {
      const anim = lookAtAnimRef.current
      anim.elapsed += delta
      const t = Math.min(anim.elapsed / anim.duration, 1)
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const currentTarget = new THREE.Vector3().lerpVectors(anim.startTarget, anim.endTarget, ease)
      camera.lookAt(currentTarget)

      if (t >= 1) {
        anim.active = false
      }
    }
  })

  // 动画完成后异步清理状态（避免在 useFrame 中直接 setState）
  useEffect(() => {
    if (animJustFinishedRef.current) {
      animJustFinishedRef.current = false
      setCameraTarget(null)
      setCameraLookAt(null)
    }
  })

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
  }, [cameraTarget, cameraLookAt, camera, setCameraTarget])

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

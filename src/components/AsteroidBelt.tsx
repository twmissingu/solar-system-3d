import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ORBIT_SCALE } from '../utils/orbit'

/**
 * 小行星带 - 2.1~3.3 AU 范围内的粒子效果
 * 约1200个随机分布的粒子，缓慢自转以模拟公转，半透明
 */
export default function AsteroidBelt() {
  const groupRef = useRef<THREE.Group>(null)

  const particles = useMemo(() => {
    const count = 1200
    const positions: number[] = []
    const colors: number[] = []

    for (let i = 0; i < count; i++) {
      // 在 2.1~3.3 AU 范围内随机分布，内密外疏
      const a = 2.1 + Math.pow(Math.random(), 1.5) * 1.2
      const angle = Math.random() * Math.PI * 2
      const i_rad = (Math.random() * 20 - 10) * (Math.PI / 180) // 倾角 ±10°

      const r = a * ORBIT_SCALE
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle) * Math.cos(i_rad)
      const z = r * Math.sin(angle) * Math.sin(i_rad)

      positions.push(x, y, z)

      // 岩石颜色：灰褐色系，部分偏红，部分偏蓝灰（碳质）
      const type = Math.random()
      if (type < 0.6) {
        // S型（石质）：灰褐色
        const shade = 0.3 + Math.random() * 0.4
        const reddish = Math.random() * 0.15
        colors.push(shade + reddish, shade, shade * 0.8)
      } else if (type < 0.85) {
        // C型（碳质）：暗灰色带蓝
        const shade = 0.2 + Math.random() * 0.3
        colors.push(shade, shade * 1.1, shade * 1.2)
      } else {
        // M型（金属质）：偏红褐色
        const shade = 0.25 + Math.random() * 0.25
        colors.push(shade + 0.15, shade * 0.8, shade * 0.6)
      }
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    }
  }, [])

  // 缓慢自转模拟公转
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.025
    }
  })

  return (
    <group ref={groupRef}>
      {/* 主粒子层：岩石小行星 */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particles.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          transparent
          opacity={0.65}
          vertexColors
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* 光晕层：大而淡的半透明粒子，营造尘埃云效果 */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={3.0}
          transparent
          opacity={0.12}
          color="#C8B898"
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}

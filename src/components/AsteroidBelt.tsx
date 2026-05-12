import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * 小行星带 - 2.1~3.3 AU 范围内的粒子效果
 * 约200个随机分布的小点，半透明，无交互
 */
export default function AsteroidBelt() {
  const particles = useMemo(() => {
    const count = 200
    const positions: number[] = []
    const colors: number[] = []

    for (let i = 0; i < count; i++) {
      // 在 2.1~3.3 AU 范围内随机分布
      const a = 2.1 + Math.random() * 1.2 // 半长轴
      const angle = Math.random() * Math.PI * 2
      const i_rad = (Math.random() * 15 - 7.5) * (Math.PI / 180) // 倾角 ±7.5°

      // 距离缩放 15 倍（与行星一致）
      const r = a * 15
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle) * Math.sin(i_rad)
      const z = r * Math.sin(angle) * Math.cos(i_rad)

      positions.push(x, y, z)

      // 灰色岩石颜色
      const gray = 0.3 + Math.random() * 0.3
      colors.push(gray, gray, gray)
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    }
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        transparent
        opacity={0.4}
        vertexColors
        sizeAttenuation
      />
    </points>
  )
}

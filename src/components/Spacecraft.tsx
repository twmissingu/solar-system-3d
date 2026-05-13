import { useMemo, useCallback } from 'react'
import { Line } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { spacecraftData, type Spacecraft } from '../data/spacecraft'
import { useStore } from '../store/useStore'

function SpacecraftTrajectory({ spacecraft }: { spacecraft: Spacecraft }) {
  const { setSelectedSpacecraft, setShowSpacecraftPanel } = useStore()

  const points = useMemo(() => {
    const pts: [number, number, number][] = []

    for (const tp of spacecraft.trajectory) {
      const angleRad = (tp.angle * Math.PI) / 180
      const x = Math.cos(angleRad) * tp.distanceAU * 15
      const z = Math.sin(angleRad) * tp.distanceAU * 15
      const y = 0.5
      pts.push([x, y, z])
    }

    return pts
  }, [spacecraft])

  const handleMarkerClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      setSelectedSpacecraft(spacecraft.id)
      setShowSpacecraftPanel(true)
    },
    [spacecraft.id, setSelectedSpacecraft, setShowSpacecraftPanel]
  )

  return (
    <group>
      {/* 轨迹线 */}
      <Line
        points={points}
        color={spacecraft.color}
        lineWidth={1}
        transparent
        opacity={0.6}
      />

      {/* 轨迹点标记 */}
      {spacecraft.trajectory.map((tp, idx) => {
        const angleRad = (tp.angle * Math.PI) / 180
        const pos: [number, number, number] = [
          Math.cos(angleRad) * tp.distanceAU * 15,
          0.5,
          Math.sin(angleRad) * tp.distanceAU * 15,
        ]
        return (
          <mesh key={tp.date || idx} position={pos} onClick={handleMarkerClick}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial
              color={spacecraft.color}
              transparent
              opacity={0.9}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function Spacecraft() {
  const selectedSpacecraft = useStore((s) => s.selectedSpacecraft)
  const showSpacecraftPanel = useStore((s) => s.showSpacecraftPanel)

  if (!showSpacecraftPanel || !selectedSpacecraft) return null

  const sc = spacecraftData.find((s) => s.id === selectedSpacecraft)
  if (!sc) return null

  return (
    <group>
      <SpacecraftTrajectory spacecraft={sc} />
    </group>
  )
}

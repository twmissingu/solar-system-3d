import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { formatSimulationDate } from '../utils/date'
import CelestialSearch from './CelestialSearch'

const SPEED_OF_LIGHT_KM_S = 299792.458
const AU_KM = 149597870.7

function calculateOrbitPhase(currentDay: number, period: number): number {
  if (period <= 0) return 0
  return ((currentDay % period) / period) * 100
}

function calculateLightTravelTime(au: number): string {
  const seconds = (au * AU_KM) / SPEED_OF_LIGHT_KM_S
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = seconds / 60
  if (minutes < 60) return `${minutes.toFixed(1)}min`
  const hours = minutes / 60
  return `${hours.toFixed(1)}h`
}

export default function TopBar() {
  const selectedBody = useStore((s) => s.selectedBody)
  const currentDay = useStore((s) => s.currentDay)

  const orbitPhase = useMemo(() => {
    if (!selectedBody || selectedBody.id === 'sun' || selectedBody.orbit.period <= 0) return null
    return calculateOrbitPhase(currentDay, selectedBody.orbit.period)
  }, [selectedBody, currentDay])

  const lightTime = useMemo(() => {
    if (!selectedBody || selectedBody.id === 'sun') return null
    return calculateLightTravelTime(selectedBody.orbit.a)
  }, [selectedBody])

  const showSystemStatus = selectedBody !== null

  return (
    <div className="fixed top-0 left-0 right-0 z-[15] pointer-events-none">
      {/* Row 1: Title + Search + System Status */}
      <div className="flex items-center justify-between pl-4 sm:pl-6 pr-4 sm:pr-6 pt-3 pb-1 pointer-events-auto">
        <div className="flex items-center gap-3">
          <h1
            className="text-base sm:text-lg font-bold text-sci-white sci-text-glow tracking-wider"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            SOLAR SYSTEM
          </h1>
          <span className="text-[10px] text-sci-cyan/50 hidden sm:block">太阳系3D探索 · 科学教育</span>
          <CelestialSearch />
        </div>
        <div className="flex items-center gap-3">
          {showSystemStatus && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sci-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sci-success" />
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/70 tracking-wider">
                SYSTEM ONLINE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Telemetry data */}
      <div className="flex items-center gap-1 sm:gap-4 pl-4 sm:pl-6 pr-4 sm:pr-6 pb-2 pointer-events-none">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-sci-cyan/60 bg-space-800/30 px-2 py-0.5 rounded">
          <span className="text-sci-white/30">SIM</span>
          <span>{formatSimulationDate(currentDay)}</span>
        </div>
        {selectedBody && selectedBody.id !== 'sun' && (
          <>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-sci-cyan/60 bg-space-800/30 px-2 py-0.5 rounded">
              <span className="text-sci-white/30">TGT</span>
              <span>{selectedBody.nameZh}</span>
            </div>
            {orbitPhase !== null && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-sci-cyan/60 bg-space-800/30 px-2 py-0.5 rounded">
                <span className="text-sci-white/30">ORB</span>
                <span>{orbitPhase.toFixed(1)}%</span>
              </div>
            )}
            {lightTime && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-sci-cyan/60 bg-space-800/30 px-2 py-0.5 rounded">
                <span className="text-sci-white/30">LT</span>
                <span>{lightTime}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

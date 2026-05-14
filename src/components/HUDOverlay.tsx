import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatSimulationDate } from '../utils/date';
import { celestialBodies } from '../data/celestialData';

const SPEED_OF_LIGHT_KM_S = 299792.458;
const AU_KM = 149597870.7;

function calculateOrbitPhase(currentDay: number, period: number): number {
  if (period <= 0) return 0;
  return ((currentDay % period) / period) * 100;
}

function calculateLightTravelTime(au: number): string {
  const seconds = (au * AU_KM) / SPEED_OF_LIGHT_KM_S;
  if (seconds < 60) return `${seconds.toFixed(1)}秒`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)}分钟`;
  const hours = minutes / 60;
  return `${hours.toFixed(1)}小时`;
}

function getTargetDataLines(selectedBody: typeof celestialBodies[0], currentDay: number) {
  const phase = calculateOrbitPhase(currentDay, selectedBody.orbit.period);
  const lightTime = calculateLightTravelTime(selectedBody.orbit.a);
  return [
    `TGT: ${selectedBody.nameZh.toUpperCase()}`,
    `DIS: ${selectedBody.orbit.a} AU · ${lightTime}`,
    `ORB: ${phase.toFixed(1)}% · ${selectedBody.orbit.period.toFixed(0)}天`,
    `VEL: ${(29.78 / Math.sqrt(selectedBody.orbit.a)).toFixed(1)} km/s（轨道速度）`,
  ];
}

export default function HUDOverlay() {
  const { selectedBody, currentDay, cameraTarget, isCameraAnimating } = useStore();

  const coords = useMemo(() => {
    if (cameraTarget) {
      return {
        x: cameraTarget[0].toFixed(2),
        y: cameraTarget[1].toFixed(2),
        z: cameraTarget[2].toFixed(2),
      };
    }
    return null;
  }, [cameraTarget]);

  const dataLines = useMemo(
    () => (selectedBody && selectedBody.id !== 'sun' ? getTargetDataLines(selectedBody, currentDay) : null),
    [selectedBody, currentDay]
  );

  const orbitPhase = useMemo(() => {
    if (!selectedBody || selectedBody.id === 'sun' || selectedBody.orbit.period <= 0) return 0;
    return calculateOrbitPhase(currentDay, selectedBody.orbit.period);
  }, [selectedBody, currentDay]);

  const showSystemStatus = selectedBody !== null;
  const showCoordinates = isCameraAnimating && coords !== null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* Persistent: Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="crosshair-pulse w-[2px] h-[2px] rounded-full bg-sci-cyan" />
      </div>

      {/* Persistent: Bottom-right date */}
      <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 text-right">
        <span className="text-[10px] text-sci-white/30 font-mono uppercase tracking-wider block">
          模拟日期
        </span>
        <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/60">
          {formatSimulationDate(currentDay)}
        </span>
      </div>

      {/* Persistent: Top-left corner bracket */}
      <div className="absolute top-20 left-4 sm:top-24 sm:left-6 w-20 h-20 hud-corner opacity-40" />

      {/* Persistent: Bottom-right corner bracket */}
      <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 w-20 h-20 hud-corner opacity-40" />

      {/* SYSTEM ONLINE (only when in focus) */}
      {showSystemStatus && (
        <div className="absolute top-20 right-4 sm:top-24 sm:right-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sci-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sci-success" />
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/70 tracking-wider">
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      )}

      {/* Focused state: Data stream top-left + Orbit gauge top-right */}
      {dataLines && (
        <>
          <div className="absolute top-20 left-4 sm:top-24 sm:left-6">
            <div className="flex flex-col gap-1">
              {dataLines.map((line, i) => (
                <span
                  key={i}
                  className="data-stream-item text-[10px] sm:text-xs font-mono text-sci-cyan/50"
                  style={{ animationDelay: `${i * 0.75}s` }}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute top-20 right-4 sm:top-24 sm:right-6 flex flex-col items-end gap-3">
            {/* Orbit phase gauge */}
            {selectedBody && selectedBody.id !== 'sun' && selectedBody.orbit.period > 0 && (
              <div className="flex items-center gap-2">
                <div className="hud-gauge">
                  <div className="hud-gauge-ring" />
                  <div className="hud-gauge-fill" style={{ '--gauge-value': `${orbitPhase}%` } as React.CSSProperties} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-sci-cyan/70">{orbitPhase.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-sci-white/30 font-mono uppercase">轨道相位</span>
                  <span className="text-[10px] font-mono text-sci-cyan/60">
                    {selectedBody.orbit.period < 365
                      ? `${(currentDay % selectedBody.orbit.period).toFixed(0)}/${selectedBody.orbit.period.toFixed(0)}天`
                      : `${((currentDay % selectedBody.orbit.period) / 365.25).toFixed(1)}/${(selectedBody.orbit.period / 365.25).toFixed(1)}年`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Target box */}
          {selectedBody && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-6">
            <div className="sci-panel px-2 py-1">
              <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/80 tracking-wider">
                TARGET: {selectedBody.nameZh.toUpperCase()}
              </span>
            </div>
          </div>
          )}
        </>
      )}

      {/* Transition state: Coordinates (only during camera animation) */}
      {showCoordinates && (
        <div className="absolute bottom-24 left-4 sm:bottom-28 sm:left-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-sci-white/30 font-mono uppercase tracking-wider">
              相机坐标
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/60">
              X: {coords!.x}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/60">
              Y: {coords!.y}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/60">
              Z: {coords!.z}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

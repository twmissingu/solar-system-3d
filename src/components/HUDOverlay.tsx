import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatSimulationDate } from '../utils/date';

const DATA_LINES = [
  'TEL: 8924.11 · ORB: 0.0034',
  'VEL: 29.78 km/s · INC: 7.155°',
  'RAD: 1.00 AU · MAG: -26.74',
  'FLX: 1361 W/m² · PHS: 0.42',
];

export default function HUDOverlay() {
  const { selectedBody, currentDay, cameraTarget } = useStore();

  const coords = useMemo(() => {
    if (cameraTarget) {
      return {
        x: cameraTarget[0].toFixed(2),
        y: cameraTarget[1].toFixed(2),
        z: cameraTarget[2].toFixed(2),
      };
    }
    return {
      x: (Math.random() * 200 - 100).toFixed(2),
      y: (Math.random() * 100).toFixed(2),
      z: (Math.random() * 200 - 100).toFixed(2),
    };
  }, [cameraTarget]);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-[0.03]" />

      {/* Top-left: Data stream */}
      <div className="absolute top-20 left-4 sm:top-24 sm:left-6">
        <div className="flex flex-col gap-1">
          {DATA_LINES.map((line, i) => (
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

      {/* Top-right: System status */}
      <div className="absolute top-20 right-4 sm:top-24 sm:right-6 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/70 tracking-wider">
          SYSTEM ONLINE
        </span>
      </div>

      {/* Bottom-left: Coordinates */}
      <div className="absolute bottom-24 left-4 sm:bottom-28 sm:left-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-sci-white/30 font-mono uppercase tracking-wider">
            相机坐标
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/60">
            X: {coords.x}
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/60">
            Y: {coords.y}
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/60">
            Z: {coords.z}
          </span>
        </div>
      </div>

      {/* Bottom-right: Time display */}
      <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 text-right">
        <span className="text-[10px] text-sci-white/30 font-mono uppercase tracking-wider block">
          模拟日期
        </span>
        <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/60">
          {formatSimulationDate(currentDay)}
        </span>
      </div>

      {/* Center: Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="crosshair-pulse w-[2px] h-[2px] rounded-full bg-sci-cyan" />
      </div>

      {/* Target box when body selected */}
      {selectedBody && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-6">
          <div className="sci-panel px-2 py-1">
            <span className="text-[10px] sm:text-xs font-mono text-sci-cyan/80 tracking-wider">
              TARGET: {selectedBody.nameZh.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Corner brackets */}
      <div className="absolute top-20 left-4 sm:top-24 sm:left-6 w-20 h-20 hud-corner opacity-60" />
      <div className="absolute top-20 right-4 sm:top-24 sm:right-6 w-20 h-20 hud-corner opacity-60" />
      <div className="absolute bottom-24 left-4 sm:bottom-28 sm:left-6 w-20 h-20 hud-corner opacity-60" />
      <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 w-20 h-20 hud-corner opacity-60" />
    </div>
  );
}

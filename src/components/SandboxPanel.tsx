import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { keplerThirdLaw, estimatedSurfaceTemperature, solarIrradiance, habitableZone } from '../utils/physics';

const MIN_AU = 0.3;
const MAX_AU = 3.0;
const HABITABLE_INNER = 0.95;
const HABITABLE_OUTER = 1.37;

function getStatusMessage(au: number): { text: string; color: string; bg: string } {
  if (au < HABITABLE_INNER) {
    return {
      text: '⚠️ 太近了！水会沸腾蒸发，生命无法存活。',
      color: '#FF6B6B',
      bg: 'rgba(255, 107, 107, 0.1)',
    };
  }
  if (au <= HABITABLE_OUTER) {
    return {
      text: '✅ 完美！这是宜居带，液态水可以存在。',
      color: '#4ECDC4',
      bg: 'rgba(78, 205, 196, 0.1)',
    };
  }
  return {
    text: '❄️ 太远了！水会结冰，温度过低。',
    color: '#64B5F6',
    bg: 'rgba(100, 181, 246, 0.1)',
  };
}

export default function SandboxPanel() {
  const { showSandbox, setShowSandbox, sandboxOrbitAU, setSandboxOrbitAU } = useStore();

  const handleClose = useCallback(() => {
    setShowSandbox(false);
  }, [setShowSandbox]);

  const handleReset = useCallback(() => {
    setSandboxOrbitAU(1.0);
  }, [setSandboxOrbitAU]);

  useEffect(() => {
    if (!showSandbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSandbox, handleClose]);

  if (!showSandbox) return null;

  const period = keplerThirdLaw(sandboxOrbitAU);
  const tempK = estimatedSurfaceTemperature(sandboxOrbitAU);
  const tempC = tempK - 273.15;
  const irradiance = solarIrradiance(sandboxOrbitAU);
  const isHabitable = sandboxOrbitAU >= HABITABLE_INNER && sandboxOrbitAU <= HABITABLE_OUTER;
  const status = getStatusMessage(sandboxOrbitAU);

  // Diagram calculations (max AU displayed = 3.2)
  const maxDisplayAU = 3.2;
  const diagramSize = 280;
  const center = diagramSize / 2;
  const scale = (diagramSize / 2 - 24) / maxDisplayAU;

  const sunRadius = Math.max(6, 8 * scale * 0.1);
  const habitableInnerRadius = HABITABLE_INNER * scale;
  const habitableOuterRadius = HABITABLE_OUTER * scale;
  const orbitRadius = sandboxOrbitAU * scale;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(5, 11, 20, 0.85)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-4xl mx-4 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2
            className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            🧪 沙盘实验：如果地球更近/更远？
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
            aria-label="关闭沙盘实验"
            title="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="sci-panel sci-corner p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Diagram */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <div className="relative" style={{ width: diagramSize, height: diagramSize }}>
                {/* Habitable zone ring */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: habitableOuterRadius * 2,
                    height: habitableOuterRadius * 2,
                    left: center - habitableOuterRadius,
                    top: center - habitableOuterRadius,
                    background: 'rgba(78, 205, 196, 0.08)',
                    border: '1px solid rgba(78, 205, 196, 0.2)',
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    width: habitableInnerRadius * 2,
                    height: habitableInnerRadius * 2,
                    left: center - habitableInnerRadius,
                    top: center - habitableInnerRadius,
                    background: '#050B14',
                    border: '1px solid rgba(78, 205, 196, 0.2)',
                  }}
                />
                {/* Max orbit reference circle (3 AU) */}
                <div
                  className="absolute rounded-full border border-dashed border-sci-white/10"
                  style={{
                    width: maxDisplayAU * scale * 2,
                    height: maxDisplayAU * scale * 2,
                    left: center - maxDisplayAU * scale,
                    top: center - maxDisplayAU * scale,
                  }}
                />
                {/* Earth orbit */}
                <div
                  className="absolute rounded-full border border-dashed"
                  style={{
                    width: orbitRadius * 2,
                    height: orbitRadius * 2,
                    left: center - orbitRadius,
                    top: center - orbitRadius,
                    borderColor: isHabitable ? 'rgba(78, 205, 196, 0.5)' : 'rgba(255, 107, 107, 0.4)',
                  }}
                />
                {/* Sun */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: sunRadius * 2,
                    height: sunRadius * 2,
                    left: center - sunRadius,
                    top: center - sunRadius,
                    background: '#FDB813',
                    boxShadow: '0 0 16px rgba(253, 184, 19, 0.5)',
                  }}
                />
                {/* Earth */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    left: center + orbitRadius - 5,
                    top: center - 5,
                    background: '#4A90D9',
                    boxShadow: '0 0 8px rgba(74, 144, 217, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                />
                {/* Labels */}
                <span
                  className="absolute text-[10px] text-sci-white/40 font-mono"
                  style={{ left: center + 4, top: center - sunRadius - 14 }}
                >
                  太阳
                </span>
                <span
                  className="absolute text-[10px] text-sci-cyan/50 font-mono"
                  style={{ left: center + habitableInnerRadius + 4, top: center - 4 }}
                >
                  0.95 AU
                </span>
                <span
                  className="absolute text-[10px] text-sci-cyan/50 font-mono"
                  style={{ left: center + habitableOuterRadius + 4, top: center - 4 }}
                >
                  1.37 AU
                </span>
                <span
                  className="absolute text-[10px] text-sci-white/30 font-mono"
                  style={{ left: center + maxDisplayAU * scale + 4, top: center - 4 }}
                >
                  3 AU
                </span>
                <span
                  className="absolute text-[10px] font-mono"
                  style={{
                    left: center + orbitRadius + 12,
                    top: center - 14,
                    color: isHabitable ? '#4ECDC4' : '#FF6B6B',
                  }}
                >
                  地球 {sandboxOrbitAU.toFixed(2)} AU
                </span>
              </div>
              <p className="text-[10px] text-sci-white/30 mt-2 text-center">
                绿色环带为宜居带（0.95–1.37 AU）
              </p>
            </div>

            {/* Right: Controls */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Slider */}
              <div className="sci-panel p-3 sm:p-4">
                <label className="block text-sm font-bold text-sci-cyan mb-2">
                  地球轨道距离
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sci-white/50 font-mono w-10 text-right">
                    {MIN_AU}
                  </span>
                  <input
                    type="range"
                    min={MIN_AU}
                    max={MAX_AU}
                    step={0.01}
                    value={sandboxOrbitAU}
                    onChange={(e) => setSandboxOrbitAU(parseFloat(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-xs text-sci-white/50 font-mono w-10">
                    {MAX_AU}
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-bold text-sci-white font-mono">
                    {sandboxOrbitAU.toFixed(2)} AU
                  </span>
                </div>
              </div>

              {/* Readouts */}
              <div className="sci-panel p-3 sm:p-4 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-sci-white/60 uppercase tracking-wider mb-1">
                  实时数据
                </h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sci-white/70">轨道周期</span>
                  <span className="text-sci-white font-mono font-bold">{period.toFixed(2)} 年</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sci-white/70">估算表面温度</span>
                  <span className="text-sci-white font-mono font-bold">{tempC.toFixed(0)} °C</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sci-white/70">太阳辐射强度</span>
                  <span className="text-sci-white font-mono font-bold">{irradiance.toFixed(2)} x地球</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sci-white/70">是否在宜居带</span>
                  <span className="font-bold" style={{ color: isHabitable ? '#4ECDC4' : '#FF6B6B' }}>
                    {isHabitable ? '✓ 是' : '✗ 否'}
                  </span>
                </div>
              </div>

              {/* Education note */}
              <div
                className="rounded-lg border px-3 py-2.5 text-sm leading-relaxed"
                style={{
                  color: status.color,
                  borderColor: `${status.color}40`,
                  backgroundColor: status.bg,
                }}
              >
                {status.text}
              </div>
              <p className="text-xs text-sci-white/50 leading-relaxed">
                地球在 1 AU 处温度适宜（约 15°C）。如果太近，水会蒸发；太远，水会结冰。
              </p>

              {/* Buttons */}
              <div className="flex gap-2 mt-auto">
                <button onClick={handleReset} className="sci-button text-xs px-4 py-2 flex-1">
                  🔄 重置为 1.0 AU
                </button>
                <button onClick={handleClose} className="sci-button-primary text-xs px-4 py-2 flex-1">
                  关闭实验
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

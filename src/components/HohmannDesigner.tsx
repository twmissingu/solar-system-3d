import { useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { keplerThirdLaw } from '../utils/physics';

const TARGETS = [
  { id: 'mars', name: '火星', au: 1.524 },
  { id: 'jupiter', name: '木星', au: 5.204 },
  { id: 'saturn', name: '土星', au: 9.582 },
];

const EARTH_ORBIT_PX = 50;
const V_B = 250;

function getFunFact(au: number): string {
  if (au < 2) return '去火星大约需要 259 天！';
  if (au < 7) return '去木星大约需要 2.7 年';
  return '去土星大约需要 6.0 年';
}

function getTargetName(au: number): string {
  if (au < 2) return '火星';
  if (au < 7) return '木星';
  return '土星';
}

export default function HohmannDesigner() {
  const {
    showHohmannDesigner,
    setShowHohmannDesigner,
    hohmannTarget,
    setHohmannTarget,
  } = useStore();

  const handleClose = useCallback(() => {
    setShowHohmannDesigner(false);
  }, [setShowHohmannDesigner]);

  const handleReset = useCallback(() => {
    setHohmannTarget('mars');
  }, [setHohmannTarget]);

  useEffect(() => {
    if (!showHohmannDesigner) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHohmannDesigner, handleClose]);

  const targetAU = useMemo(() => {
    const t = TARGETS.find((x) => x.id === hohmannTarget);
    return t ? t.au : 1.524;
  }, [hohmannTarget]);

  const targetName = getTargetName(targetAU);

  // Diagram geometry
  const targetRadius = EARTH_ORBIT_PX * targetAU;
  const semiMajor = (EARTH_ORBIT_PX + targetRadius) / 2;
  const semiMinor = Math.sqrt(EARTH_ORBIT_PX * targetRadius);

  // Physics calculations
  const transferSemiMajorAU = (1 + targetAU) / 2;
  const transferPeriodYears = keplerThirdLaw(transferSemiMajorAU);
  const transferTimeYears = transferPeriodYears / 2;
  const transferTimeDays = transferTimeYears * 365.25;

  // Synodic period (launch window)
  const synodicPeriodDays = 360 / (1 - 1 / keplerThirdLaw(targetAU));

  // Simplified delta-v (km/s)
  const vEarth = 29.78;
  const aAU = transferSemiMajorAU;
  const vTransferPeri = vEarth * Math.sqrt(2 - 1 / aAU);
  const vTransferApo = vEarth * Math.sqrt(2 / targetAU - 1 / aAU);
  const vTarget = vEarth / Math.sqrt(targetAU);
  const deltaV1 = vTransferPeri - vEarth;
  const deltaV2 = vTarget - vTransferApo;
  const totalDeltaV = deltaV1 + deltaV2;

  // Arrow path along top half of ellipse
  // Parametric: x = semiMajor * cos(t), y = -semiMinor * sin(t) (negative for top half)
  // From t=0 (right, Earth) to t=π (left, target)
  const arrowPath = useMemo(() => {
    const steps = 32;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = (Math.PI * i) / steps;
      const x = semiMajor * Math.cos(t);
      const y = -semiMinor * Math.sin(t);
      d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return d;
  }, [semiMajor, semiMinor]);

  // Arrow head position (near the target end, at about t=π)
  const arrowTipT = Math.PI - 0.15;
  const arrowTipX = semiMajor * Math.cos(arrowTipT);
  const arrowTipY = -semiMinor * Math.sin(arrowTipT);
  const arrowPrevT = arrowTipT + 0.05;
  const arrowPrevX = semiMajor * Math.cos(arrowPrevT);
  const arrowPrevY = -semiMinor * Math.sin(arrowPrevT);
  const arrowAngle = (Math.atan2(arrowTipY - arrowPrevY, arrowTipX - arrowPrevX) * 180) / Math.PI;

  if (!showHohmannDesigner) return null;

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
        className="w-full max-w-5xl mx-3 sm:mx-4 max-h-[94vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
          <h2
            className="text-lg sm:text-2xl font-bold text-sci-white sci-text-glow"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            🚀 霍曼转移轨道设计器
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
            aria-label="关闭轨道设计器"
            title="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="sci-panel sci-corner p-3 sm:p-5 overflow-y-auto min-h-0 flex-1">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Left: SVG Diagram */}
            <div className="lg:w-[60%] flex flex-col items-center justify-center min-w-0">
              <div className="w-full max-w-[400px] aspect-square relative">
                <svg
                  viewBox={`-${V_B} -${V_B} ${V_B * 2} ${V_B * 2}`}
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#FF00FF" />
                    </marker>
                    <filter id="glow-green">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="glow-magenta">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="glow-yellow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Target orbit */}
                  <circle
                    cx="0"
                    cy="0"
                    r={targetRadius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

                  {/* Earth orbit */}
                  <circle
                    cx="0"
                    cy="0"
                    r={EARTH_ORBIT_PX}
                    fill="none"
                    stroke="#4ECDC4"
                    strokeWidth="1.5"
                    opacity="0.6"
                    filter="url(#glow-green)"
                  />

                  {/* Transfer orbit */}
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={semiMajor}
                    ry={semiMinor}
                    fill="none"
                    stroke="#FF00FF"
                    strokeWidth="2"
                    opacity="0.85"
                    filter="url(#glow-magenta)"
                  />

                  {/* Transfer path arrow */}
                  <path
                    d={arrowPath}
                    fill="none"
                    stroke="#FF00FF"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    opacity="0.7"
                    markerEnd="url(#arrowhead)"
                  />

                  {/* Arrow head correction: rotate marker to follow curve */}
                  <g transform={`translate(${arrowTipX}, ${arrowTipY}) rotate(${arrowAngle})`}>
                    <polygon points="0,-4 10,0 0,4" fill="#FF00FF" />
                  </g>

                  {/* Sun */}
                  <circle
                    cx="0"
                    cy="0"
                    r="15"
                    fill="#FDB813"
                    filter="url(#glow-yellow)"
                  />

                  {/* Earth dot */}
                  <circle
                    cx={EARTH_ORBIT_PX}
                    cy="0"
                    r="5"
                    fill="#4A90D9"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />

                  {/* Target dot */}
                  <circle
                    cx={-targetRadius}
                    cy="0"
                    r="5"
                    fill="#FF6B6B"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />

                  {/* Labels */}
                  <text x={EARTH_ORBIT_PX + 10} y="4" fill="#4ECDC4" fontSize="12" fontFamily="monospace">
                    地球
                  </text>
                  <text x={-targetRadius - 10} y="4" fill="#FF6B6B" fontSize="12" fontFamily="monospace" textAnchor="end">
                    {targetName}
                  </text>
                  <text x="0" y="-22" fill="#FDB813" fontSize="12" fontFamily="monospace" textAnchor="middle">
                    太阳
                  </text>
                  <text x="0" y={semiMinor + 18} fill="#FF00FF" fontSize="11" fontFamily="monospace" textAnchor="middle">
                    转移轨道
                  </text>
                </svg>
              </div>
              <p className="text-[10px] sm:text-xs text-sci-white/30 mt-2 text-center">
                霍曼转移轨道 — 飞船从地球出发，沿椭圆轨道到达目标行星
              </p>
            </div>

            {/* Right: Control Panel */}
            <div className="lg:w-[40%] flex flex-col gap-3 sm:gap-4 min-w-0">
              {/* Target selector */}
              <div className="sci-panel p-3 sm:p-4">
                <label className="block text-sm font-bold text-sci-cyan mb-2">
                  目标行星
                </label>
                <select
                  value={hohmannTarget}
                  onChange={(e) => setHohmannTarget(e.target.value)}
                  className="w-full bg-space-900/80 border border-sci-cyan/30 rounded-md px-3 py-2 text-sm text-sci-white focus:outline-none focus:border-sci-cyan/60"
                >
                  {TARGETS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.au} AU)
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time calculations */}
              <div className="sci-panel p-3 sm:p-4 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-sci-white/60 uppercase tracking-wider mb-1">
                  实时计算
                </h3>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-sci-white/70">轨道半长轴</span>
                  <span className="text-sci-white font-mono font-bold">
                    {transferSemiMajorAU.toFixed(3)} AU
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-sci-white/70">转移时间</span>
                  <span className="text-sci-cyan font-mono font-bold">
                    {transferTimeYears >= 1
                      ? `${transferTimeYears.toFixed(2)} 年`
                      : `${transferTimeDays.toFixed(0)} 天`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-sci-white/70">需要速度变化 (Δv)</span>
                  <span className="text-sci-white font-mono font-bold">
                    {totalDeltaV.toFixed(1)} km/s
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-sci-white/70">发射窗口周期</span>
                  <span className="text-sci-white font-mono font-bold">
                    {synodicPeriodDays.toFixed(0)} 天
                  </span>
                </div>
              </div>

              {/* Education box */}
              <div className="rounded-lg border border-sci-cyan/20 bg-sci-cyan/5 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed space-y-1.5">
                <p className="text-sci-cyan font-medium">
                  💡 霍曼转移是最省燃料的轨道转移方式
                </p>
                <p className="text-sci-white/70">
                  飞船先加速进入一个椭圆轨道，远日点正好到达目标行星轨道
                </p>
                <p className="text-sci-white/70">
                  到达后再次加速/减速，进入目标行星轨道
                </p>
              </div>

              {/* Fun fact */}
              <div
                className="rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium text-center"
                style={{
                  color: '#FF6B6B',
                  borderColor: 'rgba(255, 107, 107, 0.3)',
                  backgroundColor: 'rgba(255, 107, 107, 0.08)',
                }}
              >
                🎯 {getFunFact(targetAU)}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-auto">
                <button onClick={handleReset} className="sci-button text-xs px-3 py-2 flex-1">
                  🔄 重置
                </button>
                <button onClick={handleClose} className="sci-button-primary text-xs px-3 py-2 flex-1">
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Moon, X } from 'lucide-react';
import { useStore } from '../store/useStore';

function calculateEclipse(
  earthSunAU: number,
  moonInclinationDeg: number,
  moonSizeMultiplier: number
): 'none' | 'penumbral' | 'partial' | 'total' {
  // Shadow cone geometry
  const sunRadius = 40;
  const earthRadius = 25;
  const earthSunDist = 200 * earthSunAU; // SVG distance scaled

  // Umbra radius at moon distance (approx 60 units past Earth in SVG)
  const moonDist = 200; // Earth to Moon SVG distance
  const umbraRadius = earthRadius - (sunRadius - earthRadius) * (moonDist / earthSunDist);
  const penumbraRadius = earthRadius + (sunRadius + earthRadius) * (moonDist / earthSunDist);

  // Moon offset from shadow center due to inclination
  const moonOffset = Math.tan((moonInclinationDeg * Math.PI) / 180) * moonDist;
  const moonRadius = 12 * moonSizeMultiplier;

  // Determine eclipse type
  if (moonOffset > penumbraRadius + moonRadius) return 'none';
  if (moonOffset > umbraRadius + moonRadius) return 'penumbral';
  if (moonOffset > Math.abs(umbraRadius - moonRadius)) return 'partial';
  return 'total';
}

function getResultDisplay(type: 'none' | 'penumbral' | 'partial' | 'total') {
  switch (type) {
    case 'none':
      return {
        text: '无月食 — 月球不在阴影中',
        color: '#9CA3AF',
        bg: 'rgba(156, 163, 175, 0.1)',
        borderColor: 'rgba(156, 163, 175, 0.3)',
      };
    case 'penumbral':
      return {
        text: '半影月食 — 月球只进入半影区',
        color: '#FCD34D',
        bg: 'rgba(252, 211, 77, 0.1)',
        borderColor: 'rgba(252, 211, 77, 0.3)',
      };
    case 'partial':
      return {
        text: '月偏食 — 月球部分进入本影区',
        color: '#FB923C',
        bg: 'rgba(251, 146, 60, 0.1)',
        borderColor: 'rgba(251, 146, 60, 0.3)',
      };
    case 'total':
      return {
        text: '🌟 月全食！月球完全进入本影区',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      };
  }
}

export default function EclipseLab() {
  const { showEclipseLab, setShowEclipseLab } = useStore();
  const unlockAchievement = useStore((s) => s.unlockAchievement);

  const [earthSunAU, setEarthSunAU] = useState(1.0);
  const [moonInclinationDeg, setMoonInclinationDeg] = useState(5.145);
  const [moonSizeMultiplier, setMoonSizeMultiplier] = useState(1.0);

  const handleClose = useCallback(() => {
    setShowEclipseLab(false);
  }, [setShowEclipseLab]);

  const handleReset = useCallback(() => {
    setEarthSunAU(1.0);
    setMoonInclinationDeg(5.145);
    setMoonSizeMultiplier(1.0);
  }, []);

  useEffect(() => {
    if (!showEclipseLab) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEclipseLab, handleClose]);

  const eclipseType = useMemo(
    () => calculateEclipse(earthSunAU, moonInclinationDeg, moonSizeMultiplier),
    [earthSunAU, moonInclinationDeg, moonSizeMultiplier]
  );

  const resultDisplay = getResultDisplay(eclipseType);

  useEffect(() => {
    if (eclipseType === 'total') {
      unlockAchievement('eclipse_master')
    }
  }, [eclipseType, unlockAchievement])

  // SVG geometry calculations
  const sunCx = 100;
  const sunCy = 150;
  const sunRadius = 40;
  const earthCx = 300;
  const earthCy = 150;
  const earthRadius = 25;
  const moonCx = 500;
  const moonDist = 200; // Earth to Moon SVG distance

  const earthSunDist = 200 * earthSunAU;
  const umbraRadiusAtMoon = earthRadius - (sunRadius - earthRadius) * (moonDist / earthSunDist);
  const penumbraRadiusAtMoon = earthRadius + (sunRadius + earthRadius) * (moonDist / earthSunDist);

  const moonOffset = Math.tan((moonInclinationDeg * Math.PI) / 180) * moonDist;
  const moonCy = 150 + moonOffset;
  const moonRadius = 12 * moonSizeMultiplier;

  // Shadow cone extension point (past the moon)
  const shadowX = 580;
  const deltaToShadow = shadowX - earthCx; // 280

  // Umbra polygon points
  const umbraTopEarthY = earthCy - earthRadius; // 125
  const umbraBottomEarthY = earthCy + earthRadius; // 175
  const umbraTopShadowY = umbraTopEarthY + (sunRadius - earthRadius) * (deltaToShadow / earthSunDist);
  const umbraBottomShadowY = umbraBottomEarthY - (sunRadius - earthRadius) * (deltaToShadow / earthSunDist);

  // Penumbra polygon points
  const penumbraTopEarthY = earthCy - earthRadius; // 125
  const penumbraBottomEarthY = earthCy + earthRadius; // 175
  const penumbraTopShadowY = penumbraTopEarthY - (sunRadius + earthRadius) * (deltaToShadow / earthSunDist);
  const penumbraBottomShadowY = penumbraBottomEarthY + (sunRadius + earthRadius) * (deltaToShadow / earthSunDist);

  if (!showEclipseLab) return null;

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
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-5xl mx-3 sm:mx-4 max-h-[94vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
          <h2
            className="text-lg sm:text-2xl font-bold text-sci-white sci-text-glow"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <Moon size={18} /> 月食实验室
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
            aria-label="关闭月食实验室"
            title="关闭"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="sci-panel sci-corner p-3 sm:p-5 overflow-y-auto min-h-0 flex-1">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Left: SVG Diagram */}
            <div className="lg:w-[55%] flex flex-col items-center justify-center min-w-0">
              <svg
                viewBox="0 0 600 300"
                className="w-full h-auto max-h-[300px]"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <filter id="sun-glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="earth-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Light rays (subtle lines from Sun to Earth) */}
                <line x1={sunCx} y1={sunCy - sunRadius} x2={earthCx} y2={earthCy - earthRadius} stroke="rgba(253, 184, 19, 0.15)" strokeWidth="1" />
                <line x1={sunCx} y1={sunCy + sunRadius} x2={earthCx} y2={earthCy + earthRadius} stroke="rgba(253, 184, 19, 0.15)" strokeWidth="1" />
                <line x1={sunCx} y1={sunCy - sunRadius} x2={earthCx} y2={earthCy + earthRadius} stroke="rgba(253, 184, 19, 0.08)" strokeWidth="1" />
                <line x1={sunCx} y1={sunCy + sunRadius} x2={earthCx} y2={earthCy - earthRadius} stroke="rgba(253, 184, 19, 0.08)" strokeWidth="1" />

                {/* Penumbra cone */}
                <polygon
                  points={`${earthCx},${penumbraTopEarthY} ${shadowX},${penumbraTopShadowY} ${shadowX},${penumbraBottomShadowY} ${earthCx},${penumbraBottomEarthY}`}
                  fill="currentColor"
                  className="text-sci-danger"
                  fillOpacity="0.15"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />

                {/* Umbra cone */}
                <polygon
                  points={`${earthCx},${umbraTopEarthY} ${shadowX},${umbraTopShadowY} ${shadowX},${umbraBottomShadowY} ${earthCx},${umbraBottomEarthY}`}
                  fill="#8B0000"
                  fillOpacity="0.35"
                  stroke="#8B0000"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />

                {/* Shadow center line (dashed, subtle) */}
                <line x1={earthCx} y1={earthCy} x2={shadowX} y2={earthCy} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Umbra radius indicator at moon position */}
                <line
                  x1={moonCx}
                  y1={earthCy - umbraRadiusAtMoon}
                  x2={moonCx}
                  y2={earthCy + umbraRadiusAtMoon}
                  stroke="rgba(139, 0, 0, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Penumbra radius indicator at moon position */}
                <line
                  x1={moonCx}
                  y1={earthCy - penumbraRadiusAtMoon}
                  x2={moonCx}
                  y2={earthCy + penumbraRadiusAtMoon}
                  stroke="rgba(255, 107, 107, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Sun */}
                <circle
                  cx={sunCx}
                  cy={sunCy}
                  r={sunRadius}
                  fill="#FDB813"
                  filter="url(#sun-glow)"
                />
                <text x={sunCx} y={sunCy + sunRadius + 18} fill="#FDB813" fontSize="12" fontFamily="monospace" textAnchor="middle">
                  太阳
                </text>

                {/* Earth */}
                <circle
                  cx={earthCx}
                  cy={earthCy}
                  r={earthRadius}
                  fill="#4A90D9"
                  filter="url(#earth-glow)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
                <text x={earthCx} y={earthCy + earthRadius + 18} fill="#4A90D9" fontSize="12" fontFamily="monospace" textAnchor="middle">
                  地球
                </text>

                {/* Moon */}
                <circle
                  cx={moonCx}
                  cy={moonCy}
                  r={moonRadius}
                  fill="#A0A0A0"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                />
                {/* Moon label */}
                <text
                  x={moonCx}
                  y={moonCy + moonRadius + 18}
                  fill="#A0A0A0"
                  fontSize="12"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  月球
                </text>

                {/* Distance labels */}
                <text x={(sunCx + earthCx) / 2} y={sunCy - sunRadius - 8} fill="rgba(253, 184, 19, 0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  {earthSunAU.toFixed(3)} AU
                </text>
                <text x={(earthCx + moonCx) / 2} y={earthCy - earthRadius - 8} fill="rgba(160, 160, 160, 0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  ~384,400 km
                </text>

                {/* Legend */}
                <g transform="translate(20, 260)">
                  <rect x="0" y="-8" width="14" height="14" fill="#8B0000" fillOpacity="0.35" stroke="#8B0000" strokeWidth="0.5" />
                  <text x="20" y="2" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="monospace">本影 (Umbra)</text>
                  <rect x="110" y="-8" width="14" height="14" fill="currentColor" className="text-sci-danger" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.5" />
                  <text x="130" y="2" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="monospace">半影 (Penumbra)</text>
                </g>
              </svg>

              <p className="text-[10px] sm:text-xs text-sci-white/30 mt-2 text-center">
                调整右侧参数，观察月球在地球阴影中的位置变化
              </p>
            </div>

            {/* Right: Control Panel */}
            <div className="lg:w-[45%] flex flex-col gap-3 sm:gap-4 min-w-0">
              {/* Slider 1: Earth-Sun distance */}
              <div className="sci-panel p-3 sm:p-4">
                <label className="block text-sm font-bold text-sci-cyan mb-2">
                  地球-太阳距离
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sci-white/50 font-mono w-12 text-right">0.9</span>
                  <input
                    type="range"
                    min={0.9}
                    max={1.1}
                    step={0.001}
                    value={earthSunAU}
                    onChange={(e) => setEarthSunAU(parseFloat(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-xs text-sci-white/50 font-mono w-12">1.1</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-bold text-sci-white font-mono">{earthSunAU.toFixed(3)} AU</span>
                </div>
              </div>

              {/* Slider 2: Moon inclination */}
              <div className="sci-panel p-3 sm:p-4">
                <label className="block text-sm font-bold text-sci-cyan mb-2">
                  月球轨道倾角
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sci-white/50 font-mono w-12 text-right">0°</span>
                  <input
                    type="range"
                    min={0}
                    max={8}
                    step={0.1}
                    value={moonInclinationDeg}
                    onChange={(e) => setMoonInclinationDeg(parseFloat(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-xs text-sci-white/50 font-mono w-12">8°</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-bold text-sci-white font-mono">{moonInclinationDeg.toFixed(1)}°</span>
                </div>
                <p className="text-[10px] text-sci-white/30 mt-1">月球真实轨道倾角：5.145°</p>
              </div>

              {/* Slider 3: Moon size */}
              <div className="sci-panel p-3 sm:p-4">
                <label className="block text-sm font-bold text-sci-cyan mb-2">
                  月球大小
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sci-white/50 font-mono w-12 text-right">0.5x</span>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    value={moonSizeMultiplier}
                    onChange={(e) => setMoonSizeMultiplier(parseFloat(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-xs text-sci-white/50 font-mono w-12">2.0x</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-bold text-sci-white font-mono">{moonSizeMultiplier.toFixed(2)}x</span>
                </div>
              </div>

              {/* Real-time result */}
              <div
                className="rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base font-bold text-center transition-colors duration-300"
                style={{
                  color: resultDisplay.color,
                  borderColor: resultDisplay.borderColor,
                  backgroundColor: resultDisplay.bg,
                }}
              >
                {resultDisplay.text}
              </div>

              {/* Shadow geometry readout */}
              <div className="sci-panel p-3 sm:p-4 flex flex-col gap-1.5">
                <h3 className="text-xs font-bold text-sci-white/60 uppercase tracking-wider mb-1">
                  阴影数据
                </h3>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-sci-white/70">本影半径（月球处）</span>
                  <span className="text-sci-white font-mono font-bold">{umbraRadiusAtMoon.toFixed(1)} px</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-sci-white/70">半影半径（月球处）</span>
                  <span className="text-sci-white font-mono font-bold">{penumbraRadiusAtMoon.toFixed(1)} px</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-sci-white/70">月球中心偏移</span>
                  <span className="text-sci-white font-mono font-bold">{moonOffset.toFixed(1)} px</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-sci-white/70">月球半径</span>
                  <span className="text-sci-white font-mono font-bold">{moonRadius.toFixed(1)} px</span>
                </div>
              </div>

              {/* Education box */}
              <div className="rounded-lg border border-sci-cyan/20 bg-sci-cyan/5 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed space-y-1.5">
                <p className="text-sci-cyan font-medium">
                  💡 调节参数，发现什么条件下会发生月全食？
                </p>
                <p className="text-sci-white/70">
                  关键发现：月球轨道倾角必须小于约5°，且必须在满月时
                </p>
                <p className="text-sci-white/70">
                  地球-太阳距离越近，阴影锥越宽，越容易发生全食
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-auto">
                <button onClick={handleReset} className="sci-button text-xs px-3 py-2 flex-1">
                  🔄 重置参数
                </button>
                <button onClick={handleClose} className="sci-button-primary text-xs px-3 py-2 flex-1">
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

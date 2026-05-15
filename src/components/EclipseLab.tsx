import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Play, Pause, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const SVG_SUN_RADIUS = 40;
const SVG_EARTH_RADIUS = 25;
const SVG_MOON_DIST = 200; // Earth to Moon in SVG
const SVG_MOON_BASE_RADIUS = 12;
const SVG_EARTH_CX = 300;
const SVG_EARTH_CY = 150;
const SVG_SHADOW_X = 580;
const SVG_DELTA_TO_SHADOW = SVG_SHADOW_X - SVG_EARTH_CX; // 280

const PHASE_RANGE = 150;

type EclipseType = 'none' | 'penumbral' | 'partial' | 'total';

// ── Pure calculation helpers ──────────────────────────────────────────

function calcShadowGeometry(earthSunAU: number) {
  const earthSunDist = 200 * earthSunAU;
  const umbraR = SVG_EARTH_RADIUS - (SVG_SUN_RADIUS - SVG_EARTH_RADIUS) * (SVG_MOON_DIST / earthSunDist);
  const penumbraR = SVG_EARTH_RADIUS + (SVG_SUN_RADIUS + SVG_EARTH_RADIUS) * (SVG_MOON_DIST / earthSunDist);
  return { umbraRadiusAtMoon: umbraR, penumbraRadiusAtMoon: penumbraR, earthSunDist };
}

function calcMoonOffset(inclinationDeg: number): number {
  return Math.tan((inclinationDeg * Math.PI) / 180) * SVG_MOON_DIST;
}

function calcEclipseType(
  distFromCenter: number,
  penumbraR: number,
  umbraR: number,
  moonR: number
): EclipseType {
  if (distFromCenter > penumbraR + moonR) return 'none';
  if (distFromCenter > umbraR + moonR) return 'penumbral';
  if (distFromCenter > umbraR - moonR) return 'partial';
  return 'total';
}

function calcShadowCoverage(distFromCenter: number, penumbraR: number): number {
  // 0–100%: how deep the Moon is inside the shadow zone
  const raw = (1 - distFromCenter / (penumbraR + SVG_MOON_BASE_RADIUS)) * 100;
  return Math.max(0, Math.min(100, raw));
}

function getResultDisplay(type: EclipseType) {
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
        text: '🌑 月全食！月球完全进入本影区',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      };
  }
}

// ── SVG polygon helpers ──────────────────────────────────────────────

function polyPoints(
  topEarthY: number,
  bottomEarthY: number,
  topShadowY: number,
  bottomShadowY: number
): string {
  return `${SVG_EARTH_CX},${topEarthY} ${SVG_SHADOW_X},${topShadowY} ${SVG_SHADOW_X},${bottomShadowY} ${SVG_EARTH_CX},${bottomEarthY}`;
}

// ── Moon's View SVG sub-component ────────────────────────────────────

function MoonView({
  moonOffsetX,
  moonOffsetY,
  umbraRadiusAtMoon,
  penumbraRadiusAtMoon,
  moonRadius,
  eclipseType,
}: {
  moonOffsetX: number;
  moonOffsetY: number;
  umbraRadiusAtMoon: number;
  penumbraRadiusAtMoon: number;
  moonRadius: number;
  eclipseType: EclipseType;
}) {
  const viewSize = 200;
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const mvMoonR = 60; // fixed Moon radius in Moon's view

  // Normalise Moon offset to the Moon's view
  const maxOffset = umbraRadiusAtMoon + moonRadius || 1;
  const nx = moonOffsetX / maxOffset;
  const ny = moonOffsetY / maxOffset;
  const dist = Math.sqrt(nx * nx + ny * ny);
  const clamped = Math.min(dist, 1.2);
  const angle = Math.atan2(ny, nx);

  // Shadow circle slides from center (offset=0) to outside (offset=1.2)
  const slide = clamped * mvMoonR * 1.1;
  const shadowCx = cx + Math.cos(angle) * slide;
  const shadowCy = cy + Math.sin(angle) * slide;

  // Shadow radii: scale real geometry to Moon's view
  const ratio = umbraRadiusAtMoon / moonRadius || 1;
  const mvUmbraR = mvMoonR * Math.min(2.2, ratio);
  const mvPenumbraR = mvUmbraR * (penumbraRadiusAtMoon / (umbraRadiusAtMoon || 1));

  // Penumbra / umbra opacity
  const penumbraAlpha = eclipseType === 'none' ? 0 : 0.25;
  const umbraAlpha = eclipseType === 'none' ? 0 : eclipseType === 'penumbral' ? 0.15 : 0.65;

  return (
    <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full h-auto max-w-[180px] mx-auto">
      <defs>
        <clipPath id="moon-clip">
          <circle cx={cx} cy={cy} r={mvMoonR} />
        </clipPath>
        <radialGradient id="moon-grad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#D0D0D0" />
          <stop offset="100%" stopColor="#808080" />
        </radialGradient>
        <radialGradient id="blood-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CC3333" />
          <stop offset="60%" stopColor="#661111" />
          <stop offset="100%" stopColor="#330000" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width={viewSize} height={viewSize} fill="#050B14" rx={12} />

      {/* Moon base */}
      <circle
        cx={cx}
        cy={cy}
        r={mvMoonR}
        fill={eclipseType === 'total' ? 'url(#blood-moon)' : 'url(#moon-grad)'}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      />

      {/* Shadow overlays clipped to Moon */}
      <g clipPath="url(#moon-clip)">
        {/* Penumbra */}
        {penumbraAlpha > 0 && (
          <circle
            cx={shadowCx}
            cy={shadowCy}
            r={mvPenumbraR}
            fill="#8B2500"
            opacity={penumbraAlpha}
          />
        )}
        {/* Umbra */}
        {umbraAlpha > 0 && (
          <circle
            cx={shadowCx}
            cy={shadowCy}
            r={mvUmbraR}
            fill="#110000"
            opacity={umbraAlpha}
          />
        )}
      </g>

      {/* Moon edge */}
      <circle
        cx={cx}
        cy={cy}
        r={mvMoonR}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />

      {/* Label */}
      <text
        x={cx}
        y={cy + mvMoonR + 14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        fontSize="10"
        fontFamily="monospace"
      >
        月球表面
      </text>

      {/* Direction indicators */}
      {eclipseType !== 'total' && (
        <>
          <text x={8} y={cy} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" fontFamily="monospace" transform={`rotate(-90, 8, ${cy})`}>
            本影方向 →
          </text>
          <line
            x1={cx - mvMoonR + 4}
            y1={cy}
            x2={cx + mvMoonR - 4}
            y2={cy}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <line
            x1={cx}
            y1={cy - mvMoonR + 4}
            x2={cx}
            y2={cy + mvMoonR - 4}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        </>
      )}
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function EclipseLab() {
  const { showEclipseLab, setShowEclipseLab } = useStore();
  const unlockAchievement = useStore((s) => s.unlockAchievement);

  // ── Parameters ──
  const [earthSunAU, setEarthSunAU] = useState(1.0);
  const [moonInclinationDeg, setMoonInclinationDeg] = useState(5.145);
  const [moonSizeMultiplier, setMoonSizeMultiplier] = useState(1.0);
  const [moonPhaseOffset, setMoonPhaseOffset] = useState(0); // Moon orbital position

  // ── Animation ──
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number | null>(null);

  // ── Total eclipse overlay ──
  const [showTotalOverlay, setShowTotalOverlay] = useState(false);
  const prevEclipseRef = useRef<EclipseType>('none');

  // ── Derived geometry ──
  const { umbraRadiusAtMoon, penumbraRadiusAtMoon, earthSunDist } = useMemo(
    () => calcShadowGeometry(earthSunAU),
    [earthSunAU]
  );

  const moonOffsetY = useMemo(() => calcMoonOffset(moonInclinationDeg), [moonInclinationDeg]);
  const moonRadius = SVG_MOON_BASE_RADIUS * moonSizeMultiplier;

  // 2D distance from shadow center
  const distFromCenter = useMemo(
    () => Math.sqrt(moonPhaseOffset * moonPhaseOffset + moonOffsetY * moonOffsetY),
    [moonPhaseOffset, moonOffsetY]
  );

  const eclipseType = useMemo<EclipseType>(
    () => calcEclipseType(distFromCenter, penumbraRadiusAtMoon, umbraRadiusAtMoon, moonRadius),
    [distFromCenter, penumbraRadiusAtMoon, umbraRadiusAtMoon, moonRadius]
  );

  const resultDisplay = getResultDisplay(eclipseType);
  const coveragePercent = useMemo(
    () => calcShadowCoverage(distFromCenter, penumbraRadiusAtMoon),
    [distFromCenter, penumbraRadiusAtMoon]
  );

  // ── SVG geometry for diagram ──
  const sunCx = 100;
  const sunCy = 150;
  const moonCx = 500;
  const moonCy = SVG_EARTH_CY + moonOffsetY;

  const deltaToShadow = SVG_DELTA_TO_SHADOW;

  // Umbra polygon
  const uTopEY = SVG_EARTH_CY - SVG_EARTH_RADIUS;
  const uBottomEY = SVG_EARTH_CY + SVG_EARTH_RADIUS;
  const uTopSY = uTopEY + (SVG_SUN_RADIUS - SVG_EARTH_RADIUS) * (deltaToShadow / earthSunDist);
  const uBottomSY = uBottomEY - (SVG_SUN_RADIUS - SVG_EARTH_RADIUS) * (deltaToShadow / earthSunDist);

  // Penumbra polygon
  const pTopEY = SVG_EARTH_CY - SVG_EARTH_RADIUS;
  const pBottomEY = SVG_EARTH_CY + SVG_EARTH_RADIUS;
  const pTopSY = pTopEY - (SVG_SUN_RADIUS + SVG_EARTH_RADIUS) * (deltaToShadow / earthSunDist);
  const pBottomSY = pBottomEY + (SVG_SUN_RADIUS + SVG_EARTH_RADIUS) * (deltaToShadow / earthSunDist);

  // ── Callbacks ──
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setShowEclipseLab(false);
  }, [setShowEclipseLab]);

  const handleReset = useCallback(() => {
    setEarthSunAU(1.0);
    setMoonInclinationDeg(5.145);
    setMoonSizeMultiplier(1.0);
    setMoonPhaseOffset(0);
    setShowTotalOverlay(false);
  }, []);

  // ── Auto-animation ──
  useEffect(() => {
    if (!isAnimating) {
      if (animRef.current !== null) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
      return;
    }
    const speed = 1.2; // px per tick
    animRef.current = window.setInterval(() => {
      setMoonPhaseOffset((prev) => {
        const next = prev + speed;
        if (next > PHASE_RANGE) return -PHASE_RANGE;
        return next;
      });
    }, 30);
    return () => {
      if (animRef.current !== null) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
    };
  }, [isAnimating]);

  const toggleAnimation = useCallback(() => {
    setIsAnimating((p) => !p);
  }, []);

  // ── Total eclipse overlay detection ──
  useEffect(() => {
    if (!showEclipseLab) return;
    if (eclipseType === 'total' && prevEclipseRef.current !== 'total') {
      setShowTotalOverlay(true);
      unlockAchievement('eclipse_master');
    }
    if (eclipseType !== 'total') {
      setShowTotalOverlay(false);
    }
    prevEclipseRef.current = eclipseType;
  }, [eclipseType, showEclipseLab, unlockAchievement]);

  // ── Keyboard ──
  useEffect(() => {
    if (!showEclipseLab) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEclipseLab, handleClose]);

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
            className="text-lg sm:text-2xl font-bold text-sci-white sci-text-glow flex items-center gap-2"
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
            {/* ─── Left: Diagrams ─── */}
            <div className="lg:w-[55%] flex flex-col gap-3 min-w-0">
              {/* Top: Geometry diagram */}
              <svg
                viewBox="0 0 600 300"
                className="w-full h-auto max-h-[220px]"
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

                {/* Light rays */}
                <line x1={sunCx} y1={sunCy - SVG_SUN_RADIUS} x2={SVG_EARTH_CX} y2={SVG_EARTH_CY - SVG_EARTH_RADIUS} stroke="rgba(253, 184, 19, 0.15)" strokeWidth="1" />
                <line x1={sunCx} y1={sunCy + SVG_SUN_RADIUS} x2={SVG_EARTH_CX} y2={SVG_EARTH_CY + SVG_EARTH_RADIUS} stroke="rgba(253, 184, 19, 0.15)" strokeWidth="1" />
                <line x1={sunCx} y1={sunCy - SVG_SUN_RADIUS} x2={SVG_EARTH_CX} y2={SVG_EARTH_CY + SVG_EARTH_RADIUS} stroke="rgba(253, 184, 19, 0.08)" strokeWidth="1" />
                <line x1={sunCx} y1={sunCy + SVG_SUN_RADIUS} x2={SVG_EARTH_CX} y2={SVG_EARTH_CY - SVG_EARTH_RADIUS} stroke="rgba(253, 184, 19, 0.08)" strokeWidth="1" />

                {/* Penumbra cone */}
                <polygon
                  points={polyPoints(pTopEY, pBottomEY, pTopSY, pBottomSY)}
                  fill="currentColor"
                  className="text-sci-danger"
                  fillOpacity="0.12"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeOpacity="0.25"
                />

                {/* Umbra cone */}
                <polygon
                  points={polyPoints(uTopEY, uBottomEY, uTopSY, uBottomSY)}
                  fill="#8B0000"
                  fillOpacity="0.3"
                  stroke="#8B0000"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />

                {/* Shadow center line */}
                <line x1={SVG_EARTH_CX} y1={SVG_EARTH_CY} x2={SVG_SHADOW_X} y2={SVG_EARTH_CY} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Umbra radius indicator */}
                <line
                  x1={moonCx}
                  y1={SVG_EARTH_CY - umbraRadiusAtMoon}
                  x2={moonCx}
                  y2={SVG_EARTH_CY + umbraRadiusAtMoon}
                  stroke="rgba(139, 0, 0, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Penumbra radius indicator */}
                <line
                  x1={moonCx}
                  y1={SVG_EARTH_CY - penumbraRadiusAtMoon}
                  x2={moonCx}
                  y2={SVG_EARTH_CY + penumbraRadiusAtMoon}
                  stroke="rgba(255, 107, 107, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Sun */}
                <circle cx={sunCx} cy={sunCy} r={SVG_SUN_RADIUS} fill="#FDB813" filter="url(#sun-glow)" />
                <text x={sunCx} y={sunCy + SVG_SUN_RADIUS + 18} fill="#FDB813" fontSize="12" fontFamily="monospace" textAnchor="middle">
                  太阳
                </text>

                {/* Earth */}
                <circle cx={SVG_EARTH_CX} cy={SVG_EARTH_CY} r={SVG_EARTH_RADIUS} fill="#4A90D9" filter="url(#earth-glow)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <text x={SVG_EARTH_CX} y={SVG_EARTH_CY + SVG_EARTH_RADIUS + 18} fill="#4A90D9" fontSize="12" fontFamily="monospace" textAnchor="middle">
                  地球
                </text>

                {/* Moon orbit path arrow (showing phase direction) */}
                <text
                  x={moonCx + moonRadius + 14}
                  y={moonCy + 4}
                  fill="rgba(160, 160, 160, 0.25)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  ← 轨道运动
                </text>

                {/* Moon */}
                <circle
                  cx={moonCx}
                  cy={moonCy}
                  r={moonRadius}
                  fill={eclipseType === 'total' ? '#661111' : '#A0A0A0'}
                  stroke={eclipseType === 'total' ? 'rgba(200, 50, 50, 0.6)' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={eclipseType === 'total' ? 2 : 1}
                />
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
                <text x={(sunCx + SVG_EARTH_CX) / 2} y={sunCy - SVG_SUN_RADIUS - 8} fill="rgba(253, 184, 19, 0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  {earthSunAU.toFixed(3)} AU
                </text>
                <text x={(SVG_EARTH_CX + moonCx) / 2} y={SVG_EARTH_CY - SVG_EARTH_RADIUS - 8} fill="rgba(160, 160, 160, 0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle">
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

              {/* Bottom: Moon's view */}
              <div className="sci-panel p-2 sm:p-3 flex flex-col items-center">
                <h3 className="text-[10px] font-bold text-sci-white/50 uppercase tracking-wider mb-1">
                  从地球看月球
                </h3>
                <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
                  <div className="flex-shrink-0">
                    <MoonView
                      moonOffsetX={moonPhaseOffset}
                      moonOffsetY={moonOffsetY}
                      umbraRadiusAtMoon={umbraRadiusAtMoon}
                      penumbraRadiusAtMoon={penumbraRadiusAtMoon}
                      moonRadius={moonRadius}
                      eclipseType={eclipseType}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div
                      className="rounded border text-xs font-bold px-2.5 py-1.5 text-center transition-colors duration-300"
                      style={{
                        color: resultDisplay.color,
                        borderColor: resultDisplay.borderColor,
                        backgroundColor: resultDisplay.bg,
                      }}
                    >
                      {resultDisplay.text}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-sci-white/50">阴影覆盖率</span>
                      <div className="flex-1 h-1.5 rounded-full bg-sci-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-200"
                          style={{
                            width: `${coveragePercent}%`,
                            backgroundColor: resultDisplay.color,
                          }}
                        />
                      </div>
                      <span className="text-sci-white font-mono text-xs w-9 text-right">
                        {coveragePercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Right: Controls ─── */}
            <div className="lg:w-[45%] flex flex-col gap-2 sm:gap-3 min-w-0">
              {/* Slider 1: Earth-Sun distance */}
              <div className="sci-panel p-2 sm:p-3">
                <label className="block text-xs font-bold text-sci-cyan mb-1">
                  地球-太阳距离
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-sci-white/50 font-mono w-10 text-right">0.9</span>
                  <input
                    type="range"
                    min={0.9}
                    max={1.1}
                    step={0.001}
                    value={earthSunAU}
                    onChange={(e) => setEarthSunAU(parseFloat(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-[10px] text-sci-white/50 font-mono w-10">1.1</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-base font-bold text-sci-white font-mono">{earthSunAU.toFixed(3)} AU</span>
                </div>
              </div>

              {/* Slider 2: Moon inclination */}
              <div className="sci-panel p-2 sm:p-3">
                <label className="block text-xs font-bold text-sci-cyan mb-1">
                  月球轨道倾角
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-sci-white/50 font-mono w-10 text-right">0°</span>
                  <input
                    type="range"
                    min={0}
                    max={8}
                    step={0.1}
                    value={moonInclinationDeg}
                    onChange={(e) => setMoonInclinationDeg(parseFloat(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-[10px] text-sci-white/50 font-mono w-10">8°</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-base font-bold text-sci-white font-mono">{moonInclinationDeg.toFixed(1)}°</span>
                </div>
                <p className="text-[9px] text-sci-white/30 mt-0.5">月球真实轨道倾角：5.145°</p>
              </div>

              {/* Slider 3: Moon size */}
              <div className="sci-panel p-2 sm:p-3">
                <label className="block text-xs font-bold text-sci-cyan mb-1">
                  月球大小
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-sci-white/50 font-mono w-10 text-right">0.5x</span>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    value={moonSizeMultiplier}
                    onChange={(e) => setMoonSizeMultiplier(parseFloat(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-[10px] text-sci-white/50 font-mono w-10">2.0x</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-base font-bold text-sci-white font-mono">{moonSizeMultiplier.toFixed(2)}x</span>
                </div>
              </div>

              {/* Slider 4: Moon phase position (NEW) + Play button */}
              <div className="sci-panel p-2 sm:p-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-sci-cyan">
                    月球轨道位置
                  </label>
                  <button
                    onClick={toggleAnimation}
                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors ${
                      isAnimating
                        ? 'bg-sci-danger/20 text-sci-danger hover:bg-sci-danger/30'
                        : 'bg-sci-cyan/15 text-sci-cyan hover:bg-sci-cyan/25'
                    }`}
                    aria-label={isAnimating ? '暂停动画' : '播放动画'}
                    title={isAnimating ? '暂停自动演示' : '自动演示月球穿过地影'}
                  >
                    {isAnimating ? <Pause size={12} /> : <Play size={12} />}
                    <span>{isAnimating ? '暂停' : '演示'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-sci-white/50 font-mono w-8 text-right">外侧</span>
                  <input
                    type="range"
                    min={-PHASE_RANGE}
                    max={PHASE_RANGE}
                    step={1}
                    value={moonPhaseOffset}
                    onChange={(e) => {
                      setMoonPhaseOffset(parseInt(e.target.value));
                      setIsAnimating(false);
                    }}
                    className="sci-slider flex-1"
                    disabled={isAnimating}
                  />
                  <span className="text-[10px] text-sci-white/50 font-mono w-8">内侧</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-base font-bold text-sci-white font-mono">{moonPhaseOffset > 0 ? '偏外' : moonPhaseOffset < 0 ? '偏内' : '正中'} {Math.abs(moonPhaseOffset)}</span>
                </div>
                <p className="text-[9px] text-sci-white/30 mt-0.5">
                  模拟月球沿轨道穿过地影区（点击演示自动播放）
                </p>
              </div>

              {/* Shadow geometry readout */}
              <div className="sci-panel p-2 sm:p-3 flex flex-col gap-1">
                <h3 className="text-[10px] font-bold text-sci-white/60 uppercase tracking-wider">
                  阴影数据
                </h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                  <span className="text-sci-white/60">本影半径</span>
                  <span className="text-sci-white font-mono font-bold text-right">{umbraRadiusAtMoon.toFixed(1)}</span>
                  <span className="text-sci-white/60">半影半径</span>
                  <span className="text-sci-white font-mono font-bold text-right">{penumbraRadiusAtMoon.toFixed(1)}</span>
                  <span className="text-sci-white/60">2D偏移量</span>
                  <span className="text-sci-white font-mono font-bold text-right">{distFromCenter.toFixed(1)}</span>
                  <span className="text-sci-white/60">月球半径</span>
                  <span className="text-sci-white font-mono font-bold text-right">{moonRadius.toFixed(1)}</span>
                </div>
              </div>

              {/* Education box */}
              <div className="rounded-lg border border-sci-cyan/20 bg-sci-cyan/5 px-3 py-2 text-xs leading-relaxed space-y-1">
                <p className="text-sci-cyan font-medium">
                  💡 月球穿过地影的过程
                </p>
                <p className="text-sci-white/70">
                  月球沿轨道运动时，从"侧面"穿过地球的阴影区。调节<strong>轨道位置</strong>滑块或点击<strong>演示</strong>，可以看到阴影扫过月球表面的过程。
                </p>
                <p className="text-sci-white/70">
                  真实月全食时，月球呈现暗红色（血月）—— 这是地球大气层折射的阳光。
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-auto">
                <button onClick={handleReset} className="sci-button text-[11px] px-3 py-2 flex-1">
                  🔄 重置参数
                </button>
                <button onClick={handleClose} className="sci-button-primary text-[11px] px-3 py-2 flex-1">
                  关闭实验
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Total Eclipse Overlay ─── */}
      <AnimatePresence>
        {showTotalOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(80, 0, 0, 0.85)' }}
            onClick={() => setShowTotalOverlay(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="text-center max-w-md mx-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🌑</div>
              <h3
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: 'Orbitron, sans-serif', color: '#FF6B6B' }}
              >
                月全食！
              </h3>
              <p className="text-sm text-red-200/80 leading-relaxed mb-2">
                月球完全进入地球的本影区
              </p>
              <p className="text-sm text-red-200/60 leading-relaxed mb-6">
                此时阳光经过地球大气层折射，只有红光能到达月球表面 —— 这就是「血月」的由来。颜色越红，说明地球大气中尘埃越多。
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowTotalOverlay(false)}
                  className="sci-button-primary text-sm px-5 py-2.5"
                >
                  继续观察
                </button>
                <button
                  onClick={handleReset}
                  className="sci-button text-sm px-5 py-2.5"
                >
                  重新尝试
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const MIN_DISTANCE = 0.1;
const MAX_DISTANCE = 3.0;
const EVENT_HORIZON_BASE = 1.0;

function getStatus(distance: number, massMultiplier: number): { text: string; color: string } {
  // 阈值随质量增加而降低：质量越大，同等距离潮汐力越弱
  const dangerThreshold = EVENT_HORIZON_BASE / Math.sqrt(massMultiplier);
  const warningThreshold = 1.5 / Math.sqrt(massMultiplier);
  const cautionThreshold = 2.5 / Math.sqrt(massMultiplier);

  if (distance > cautionThreshold) {
    return { text: '✅ 安全区域', color: '#4ECDC4' };
  }
  if (distance > warningThreshold) {
    return { text: '⚠️ 警告：潮汐力开始增强', color: '#FDB813' };
  }
  if (distance > dangerThreshold) {
    return { text: '🔴 危险：你的身体会被拉伸！', color: '#FF6B6B' };
  }

  if (massMultiplier >= 1000) {
    return { text: '🌀 你穿越了事件视界——对于超大质量黑洞，潮汐力可能并不致命', color: '#FF6B6B' };
  }
  return { text: '💀 事件视界！飞船被潮汐力撕碎了！', color: '#FF3333' };
}

function getMassLabel(mass: number): string {
  if (mass >= 1000000) return `${(mass / 1000000).toFixed(1)}百万`;
  if (mass >= 1000) return `${(mass / 1000).toFixed(0)}千`;
  return `${mass}`;
}

export default function BlackHoleSimulator() {
  const { showBlackHole, setShowBlackHole, unlockAchievement } = useStore();
  const [distance, setDistance] = useState(3.0);
  const [massMultiplier, setMassMultiplier] = useState(1);
  const [hasSurvived, setHasSurvived] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [hasEnteredDanger, setHasEnteredDanger] = useState(false);

  const dangerThreshold = EVENT_HORIZON_BASE / Math.sqrt(massMultiplier);

  const handleClose = useCallback(() => {
    setShowBlackHole(false);
    setShowFailure(false);
    setDistance(3.0);
    setMassMultiplier(1);
    setHasSurvived(false);
    setHasEnteredDanger(false);
  }, [setShowBlackHole]);

  const handleReset = useCallback(() => {
    setDistance(3.0);
    setMassMultiplier(1);
    setShowFailure(false);
    setHasSurvived(false);
    setHasEnteredDanger(false);
  }, []);

  useEffect(() => {
    if (!showBlackHole) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBlackHole, handleClose]);

  useEffect(() => {
    if (distance <= dangerThreshold) {
      if (!showFailure) setShowFailure(true);
      if (!hasEnteredDanger) setHasEnteredDanger(true);
    } else {
      if (showFailure) setShowFailure(false);
      if (hasEnteredDanger && !hasSurvived) {
        setHasSurvived(true);
        unlockAchievement('black_hole_survivor');
      }
    }
  }, [distance, dangerThreshold, showFailure, hasEnteredDanger, hasSurvived, unlockAchievement]);

  const tidalForce = useMemo(() => {
    return massMultiplier / (distance * distance * distance);
  }, [distance, massMultiplier]);

  const timeDilation = useMemo(() => {
    return Math.sqrt(Math.max(0, 1 - 1 / distance)) * 100;
  }, [distance]);

  const status = useMemo(() => getStatus(distance, massMultiplier), [distance, massMultiplier]);

  const baseStars = useRef(
    Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      r: 40 + Math.random() * 140,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.3,
    }))
  ).current;

  const stars = useMemo(() => {
    return baseStars.map((s) => {
      const sx = 200 + Math.cos(s.angle) * s.r;
      const sy = 200 + Math.sin(s.angle) * s.r;
      const bend = distance < 1.5 ? (1.5 - distance) * 10 : 0;
      const bx = 200 + (sx - 200) * (1 - bend / s.r);
      const by = 200 + (sy - 200) * (1 - bend / s.r);
      return { x: bx, y: by, size: s.size, opacity: s.opacity };
    });
  }, [distance, baseStars]);

  if (!showBlackHole) return null;

  const shipX = 200 + (distance * 60);
  const shipScaleY = distance <= dangerThreshold ? 3.0 : 1.0;
  const shipRotation = distance <= dangerThreshold ? 15 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(5, 11, 20, 0.9)' }}
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
            🕳️ 黑洞探险
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
            aria-label="关闭黑洞探险"
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
            {/* Left: SVG Visualization */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <svg viewBox="0 0 400 400" className="w-full max-w-[400px] h-auto">
                <rect width="400" height="400" fill="#050B14" />
                {stars.map((star, i) => (
                  <circle key={i} cx={star.x} cy={star.y} r={star.size} fill="#E8F4FD" opacity={star.opacity} />
                ))}
                <circle cx="200" cy="200" r="100" fill="url(#lensGradient)" opacity={distance < 2.0 ? 0.3 : 0.1} />
                <ellipse cx="200" cy="200" rx="90" ry="45" fill="none" stroke="url(#diskGradient)" strokeWidth="8" opacity={0.6} />
                <ellipse cx="200" cy="200" rx="75" ry="38" fill="none" stroke="url(#diskGradient)" strokeWidth="4" opacity={0.8} />
                <circle cx="200" cy="200" r="48" fill="none" stroke="#FFF8DC" strokeWidth="1.5" opacity={0.7} />
                <circle cx="200" cy="200" r="40" fill="#000000" stroke="#1a1a1a" strokeWidth="1" />
                <g transform={`translate(${shipX}, 200) rotate(${shipRotation}) scale(1, ${shipScaleY})`}>
                  <polygon points="0,-8 12,0 0,8" fill="#4ECDC4" stroke="#2A3F5F" strokeWidth="1" />
                  <polygon points="-4,-4 0,-8 -4,-6" fill="#FF6B6B" opacity={0.8} />
                  <polygon points="-4,4 0,8 -4,6" fill="#FF6B6B" opacity={0.8} />
                </g>
                <line x1="200" y1="270" x2={shipX} y2="270" stroke="rgba(78, 205, 196, 0.3)" strokeWidth="1" strokeDasharray="4 2" />
                <text x={(200 + shipX) / 2} y="285" textAnchor="middle" fill="rgba(78, 205, 196, 0.6)" fontSize="10" fontFamily="monospace">
                  {distance.toFixed(2)}x 事件视界半径
                </text>
                <defs>
                  <radialGradient id="lensGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0" />
                    <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.2" />
                  </radialGradient>
                  <linearGradient id="diskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF4500" stopOpacity="0.9" />
                    <stop offset="30%" stopColor="#FF6B35" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#FDB813" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#FF6B35" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FF4500" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </svg>
              <p className="text-[10px] text-sci-white/30 mt-2 text-center">
                黑洞事件视界（Schwarzschild 半径）内，任何物质都无法逃脱
              </p>
            </div>

            {/* Right: Control Panel */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Mass Slider */}
              <div className="sci-panel p-3 sm:p-4">
                <label className="block text-sm font-bold text-sci-gold mb-2">
                  🌟 黑洞质量（太阳质量倍数）
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sci-white/50 font-mono w-10 text-right">1x</span>
                  <input
                    type="range"
                    min={1}
                    max={1000}
                    step={1}
                    value={massMultiplier}
                    onChange={(e) => setMassMultiplier(parseInt(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-xs text-sci-white/50 font-mono w-14">1000x</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-bold text-sci-gold font-mono">
                    {getMassLabel(massMultiplier)} 倍太阳质量
                  </span>
                </div>
                <p className="text-[10px] text-sci-white/40 mt-1 text-center">
                  {massMultiplier < 10
                    ? '恒星质量黑洞：事件视界处潮汐力极强'
                    : massMultiplier < 100
                    ? '中等质量黑洞：靠近事件视界时潮汐力显著'
                    : '超大质量黑洞：在事件视界处潮汐力可能较温和'}
                </p>
              </div>

              {/* Distance Slider */}
              <div className="sci-panel p-3 sm:p-4">
                <label className="block text-sm font-bold text-sci-cyan mb-2">
                  飞船距离
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sci-white/50 font-mono w-10 text-right">
                    {MAX_DISTANCE}
                  </span>
                  <input
                    type="range"
                    min={MIN_DISTANCE}
                    max={MAX_DISTANCE}
                    step={0.01}
                    value={distance}
                    onChange={(e) => setDistance(parseFloat(e.target.value))}
                    className="sci-slider flex-1"
                  />
                  <span className="text-xs text-sci-white/50 font-mono w-10">
                    {MIN_DISTANCE}
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-bold text-sci-white font-mono">
                    {distance.toFixed(2)}x 视界半径
                  </span>
                </div>
              </div>

              {/* Real-time readouts */}
              <div className="sci-panel p-3 sm:p-4 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-sci-white/60 uppercase tracking-wider mb-1">
                  实时数据
                </h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sci-white/70">潮汐力</span>
                  <span className="text-sci-white font-mono font-bold">
                    {tidalForce.toFixed(2)} G
                  </span>
                </div>
                <p className="text-[10px] text-sci-white/50">
                  你的脚感受到的引力是头的 {(tidalForce * 100).toFixed(0)} 倍
                </p>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-sci-white/70">时间膨胀</span>
                  <span className="text-sci-white font-mono font-bold">
                    {timeDilation.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] text-sci-white/50">
                  这里的时间比地球慢 {(100 - timeDilation).toFixed(1)}%
                </p>
              </div>

              {/* Status */}
              <div
                className="rounded-lg border px-3 py-2.5 text-sm leading-relaxed"
                style={{
                  color: status.color,
                  borderColor: `${status.color}40`,
                  backgroundColor: `${status.color}15`,
                }}
              >
                {status.text}
              </div>

              {/* Education note */}
              <p className="text-xs text-sci-white/50 leading-relaxed">
                黑洞的引力梯度在事件视界附近变得极端。<strong>恒星质量黑洞</strong>（约10倍太阳质量）在事件视界处潮汐力极强，会将人体拉伸成"意大利面条"。但<strong>超大质量黑洞</strong>（数百万倍太阳质量）在事件视界处潮汐力可能很温和——你甚至可能安然穿过，只是再也无法返回。
              </p>

              {/* Buttons */}
              <div className="flex gap-2 mt-auto">
                <button onClick={handleReset} className="sci-button text-xs px-4 py-2 flex-1">
                  🔄 重置距离
                </button>
                <button onClick={handleClose} className="sci-button-primary text-xs px-4 py-2 flex-1">
                  关闭实验
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Failure overlay */}
      <AnimatePresence>
        {showFailure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(80, 0, 0, 0.85)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="text-center max-w-md mx-4"
            >
              <div className="text-6xl mb-4">{massMultiplier >= 1000 ? '🌀' : '💀'}</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {massMultiplier >= 1000 ? '你穿越了事件视界' : '你的飞船被潮汐力撕碎了'}
              </h3>
              <p className="text-sm text-red-200/80 leading-relaxed mb-6">
                {massMultiplier >= 1000
                  ? '对于超大质量黑洞，事件视界处的潮汐力可能并不致命。但你依然无法逃脱——任何信息都无法从事件视界内传出。从外部观察者的角度看，你将永远“冻结”在视界边缘。'
                  : '科学家认为任何物质都无法逃脱黑洞的事件视界。恒星质量黑洞的引力梯度大到可以在分子层面撕裂物体。'}
              </p>
              <button
                onClick={handleReset}
                className="sci-button-primary text-sm px-6 py-3"
              >
                点击重试，调整安全距离
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

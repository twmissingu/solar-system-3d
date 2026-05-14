import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { celestialBodies, dwarfPlanets, CelestialBody } from '../data/celestialData';
import { getHeliocentricPosition } from '../utils/orbit';
import { formatSimulationDate } from '../utils/date';

const allBodies: CelestialBody[] = [...celestialBodies, ...dwarfPlanets];

function calculateBodyAngle(bodyId: string, day: number): number {
  const body = allBodies.find((b) => b.id === bodyId);
  if (!body) return 0;
  const pos = getHeliocentricPosition(body.orbit, day);
  let angle = Math.atan2(pos[1], pos[0]) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

function angleDifference(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

const DIAL_SIZE = 240;
const DIAL_RADIUS = DIAL_SIZE / 2;
const DOT_RADIUS = 14;

function getFeedback(error: number): { text: string; color: string } {
  if (error < 15) {
    return { text: `太准了！误差只有${error.toFixed(1)}°！`, color: '#FDB813' };
  }
  if (error <= 45) {
    return { text: `不错！误差${error.toFixed(1)}°，方向完全正确！`, color: '#4ECDC4' };
  }
  if (error <= 90) {
    return { text: `有点偏差（${error.toFixed(1)}°），但已经抓住了规律！`, color: '#E3BB76' };
  }
  return { text: `没关系！行星轨道比想象的复杂，再试一次？`, color: '#8899AA' };
}

export default function PredictionGame() {
  const {
    showPredictionGame,
    setShowPredictionGame,
    predictionBodyId,
    setPredictionBodyId,
    predictionDays,
    setPredictionDays,
    predictionUserAngle,
    setPredictionUserAngle,
    predictionResult,
    setPredictionResult,
    currentDay,
    unlockAchievement,
  } = useStore();

  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const valErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dialScale, setDialScale] = useState(1);

  // 清理验证错误定时器
  useEffect(() => {
    return () => {
      if (valErrorTimerRef.current) clearTimeout(valErrorTimerRef.current)
    }
  }, [])

  // 响应式拨盘缩放：根据实际渲染宽度调整圆点位置
  useLayoutEffect(() => {
    const el = dialRef.current;
    if (!el) return;
    const updateScale = () => {
      const w = el.offsetWidth;
      if (w > 0) setDialScale(w / DIAL_SIZE);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const selectableBodies = allBodies.filter((b) => b.id !== 'sun');

  const currentAngle = predictionBodyId ? calculateBodyAngle(predictionBodyId, currentDay) : 0;
  const futureDay = currentDay + predictionDays;

  const handleClose = useCallback(() => {
    setShowPredictionGame(false);
    setPredictionBodyId(null);
    setPredictionResult(null);
    setPredictionUserAngle(0);
    setPredictionDays(100);
  }, [setShowPredictionGame, setPredictionBodyId, setPredictionResult, setPredictionUserAngle, setPredictionDays]);

  const handleVerify = useCallback(() => {
    if (!predictionBodyId) {
      setValidationError('请先选择一颗行星')
      if (valErrorTimerRef.current) clearTimeout(valErrorTimerRef.current)
      valErrorTimerRef.current = setTimeout(() => setValidationError(null), 2000)
      return
    }
    const actualAngle = calculateBodyAngle(predictionBodyId, futureDay);
    const error = angleDifference(predictionUserAngle, actualAngle);
    setPredictionResult({ actualAngle, error });
    if (error < 15) {
      unlockAchievement('prophet');
    }
  }, [predictionBodyId, futureDay, predictionUserAngle, setPredictionResult, unlockAchievement]);

  const handleReset = useCallback(() => {
    setPredictionBodyId(null);
    setPredictionResult(null);
    setPredictionUserAngle(0);
    setPredictionDays(100);
  }, [setPredictionBodyId, setPredictionResult, setPredictionUserAngle, setPredictionDays]);

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number): number => {
      if (!dialRef.current) return 0;
      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = angle + 90;
      if (angle < 0) angle += 360;
      return angle;
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!dialRef.current || predictionResult) return;
      e.preventDefault()
      if ('setPointerCapture' in e.currentTarget) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      setIsDragging(true);
      const angle = getAngleFromEvent(e.clientX, e.clientY);
      setPredictionUserAngle(angle);
    },
    [getAngleFromEvent, setPredictionUserAngle, predictionResult]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || predictionResult) return;
      const angle = getAngleFromEvent(e.clientX, e.clientY);
      setPredictionUserAngle(angle);
    },
    [isDragging, getAngleFromEvent, setPredictionUserAngle, predictionResult]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    e.preventDefault();
    const target = e.target as Element;
    if ('releasePointerCapture' in target) {
      (target as Element & { releasePointerCapture: (id: number) => void }).releasePointerCapture(e.pointerId);
    }
  }, []);

  useEffect(() => {
    if (!showPredictionGame) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPredictionGame, handleClose]);

  const handleDialKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (predictionResult) return
    const step = e.shiftKey ? 1 : 5
    if (e.key === 'ArrowRight') {
      setPredictionUserAngle(((predictionUserAngle + step) % 360 + 360) % 360)
    } else if (e.key === 'ArrowLeft') {
      setPredictionUserAngle(((predictionUserAngle - step) % 360 + 360) % 360)
    } else if (e.key === 'ArrowUp') {
      setPredictionUserAngle(((predictionUserAngle + 1) % 360 + 360) % 360)
    } else if (e.key === 'ArrowDown') {
      setPredictionUserAngle(((predictionUserAngle - 1) % 360 + 360) % 360)
    }
  }, [predictionResult, predictionUserAngle, setPredictionUserAngle])

  if (!showPredictionGame) return null;

  const selectedBody = predictionBodyId ? allBodies.find((b) => b.id === predictionBodyId) || null : null;

  const R = DIAL_RADIUS * dialScale;
  const dotR = DOT_RADIUS * dialScale;

  const userDotX = R + (R - dotR - 4 * dialScale) * Math.sin((predictionUserAngle * Math.PI) / 180);
  const userDotY = R - (R - dotR - 4 * dialScale) * Math.cos((predictionUserAngle * Math.PI) / 180);

  const currentDotX = R + (R - dotR - 4 * dialScale) * Math.sin((currentAngle * Math.PI) / 180);
  const currentDotY = R - (R - dotR - 4 * dialScale) * Math.cos((currentAngle * Math.PI) / 180);

  const actualDotX = predictionResult
    ? R + (R - dotR - 4 * dialScale) * Math.sin((predictionResult.actualAngle * Math.PI) / 180)
    : 0;
  const actualDotY = predictionResult
    ? R - (R - dotR - 4 * dialScale) * Math.cos((predictionResult.actualAngle * Math.PI) / 180)
    : 0;

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
        className="max-w-lg w-full mx-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2
            className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <Eye size={18} /> 行星位置预测挑战
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
            aria-label="关闭预测面板"
            title="关闭"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="sci-panel sci-corner p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">
          <div className="flex flex-col gap-5">
            {/* Step 1: Choose planet */}
            <div>
              <h3 className="text-sm font-bold text-sci-cyan mb-2">步骤 1：选择一颗行星</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectableBodies.map((body) => (
                  <button
                    key={body.id}
                    onClick={() => setPredictionBodyId(body.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      predictionBodyId === body.id
                        ? 'bg-sci-cyan/20 text-sci-cyan border border-sci-cyan/40'
                        : 'text-sci-white/60 hover:text-sci-white hover:bg-sci-cyan/10 border border-transparent'
                    }`}
                  >
                    {body.nameZh}
                  </button>
                ))}
              </div>
            </div>

            {selectedBody && (
              <>
                {/* Step 2: Show current date and question */}
                <div>
                  <h3 className="text-sm font-bold text-sci-cyan mb-2">步骤 2：阅读题目</h3>
                  <p className="text-sm text-sci-white/80 leading-relaxed">
                    当前日期：<span className="text-sci-white font-mono">{formatSimulationDate(currentDay)}</span>。
                    如果快进{' '}
                    <span className="inline-flex items-center">
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={predictionDays}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPredictionDays(Number.isNaN(val) ? 100 : Math.max(1, Math.min(10000, val)));
                        }}
                        className="w-16 bg-space-700/50 border border-sci-cyan/20 rounded px-1.5 py-0.5 text-xs text-sci-white font-mono text-center mx-1 focus:outline-none focus:border-sci-cyan/50"
                        disabled={!!predictionResult}
                      />
                    </span>{' '}
                    天，<span className="font-bold text-sci-white">{selectedBody.nameZh}</span>会出现在哪里？
                  </p>
                </div>

                {/* Step 3: Angle selector */}
                <div>
                  <h3 className="text-sm font-bold text-sci-cyan mb-2">
                    步骤 3：拖动圆点选择预测角度
                    {predictionResult && (
                      <span className="ml-2 text-xs text-sci-white/50 font-normal">
                        （你的预测：{predictionUserAngle.toFixed(1)}°）
                      </span>
                    )}
                  </h3>
                  <div className="flex justify-center py-2">
                      <div
                        ref={dialRef}
                        tabIndex={0}
                        role="slider"
                        aria-valuenow={predictionUserAngle}
                        aria-valuemin={0}
                        aria-valuemax={360}
                        onKeyDown={handleDialKeyDown}
                        className="relative select-none touch-none w-full max-w-[240px] aspect-square mx-auto"
                        style={{ cursor: predictionResult ? 'default' : 'pointer' }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                      >
                      {/* Outer circle */}
                      <div
                        className="absolute inset-0 rounded-full border-2 border-sci-cyan/30"
                        style={{ background: 'rgba(78, 205, 196, 0.03)' }}
                      />

                      {/* Degree markings */}
                      {Array.from({ length: 12 }).map((_, i) => {
                        const deg = i * 30;
                        const rad = (deg * Math.PI) / 180;
                        const innerR = R - 18 * dialScale;
                        const outerR = R - 6 * dialScale;
                        const labelR = R - 28 * dialScale;
                        const x1 = R + innerR * Math.sin(rad);
                        const y1 = R - innerR * Math.cos(rad);
                        const x2 = R + outerR * Math.sin(rad);
                        const y2 = R - outerR * Math.cos(rad);
                        const lx = R + labelR * Math.sin(rad);
                        const ly = R - labelR * Math.cos(rad);
                        return (
                          <div key={i}>
                            <div
                              className="absolute bg-sci-cyan/40"
                              style={{
                                left: x1,
                                top: y1,
                                width: Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
                                height: 1,
                                transformOrigin: '0 0',
                                transform: `rotate(${deg}deg)`,
                              }}
                            />
                            <span
                              className="absolute text-[10px] text-sci-white/40 font-mono"
                              style={{
                                left: lx,
                                top: ly,
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              {deg}°
                            </span>
                          </div>
                        );
                      })}

                      {/* Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-sci-cyan/10" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-px bg-sci-cyan/10" />
                      </div>

                      {/* Center */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sci-cyan/60" />

                      {/* Current position marker (small triangle) */}
                      <div
                        className="absolute"
                        style={{
                          left: currentDotX,
                          top: currentDotY,
                          transform: 'translate(-50%, -50%)',
                        }}
                        title={`当前位置 ${currentAngle.toFixed(1)}°`}
                      >
                        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-sci-white/40" />
                      </div>

                      {/* User prediction dot */}
                      <motion.div
                        className="absolute rounded-full border-2 shadow-lg"
                        style={{
                          width: dotR * 2,
                          height: dotR * 2,
                          left: userDotX,
                          top: userDotY,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: predictionResult ? 'rgba(78, 205, 196, 0.3)' : 'rgba(78, 205, 196, 0.6)',
                          borderColor: '#4ECDC4',
                          boxShadow: '0 0 12px rgba(78, 205, 196, 0.4)',
                        }}
                        animate={{ scale: isDragging ? 1.2 : 1 }}
                      />

                      {/* Actual position dot (after verify) */}
                      {predictionResult && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute rounded-full border-2"
                          style={{
                            width: dotR * 2,
                            height: dotR * 2,
                            left: actualDotX,
                            top: actualDotY,
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(253, 184, 19, 0.3)',
                            borderColor: '#FDB813',
                            boxShadow: '0 0 12px rgba(253, 184, 19, 0.4)',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-4 text-[10px] text-sci-white/50">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sci-cyan/60 border border-sci-cyan inline-block" />
                      你的预测
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-sci-white/40 inline-block" />
                      当前位置
                    </span>
                    {predictionResult && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#FDB813]/60 border border-[#FDB813] inline-block" />
                        实际位置
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 4: Verify */}
                {validationError && (
                  <p className="text-xs text-sci-danger text-center mb-2">{validationError}</p>
                )}
                {!predictionResult ? (
                  <div className="flex justify-center">
                    <button onClick={handleVerify} className="sci-button-primary text-sm px-6 py-2">
                      🔍 验证预测
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 items-center"
                  >
                    <div
                      className="text-center text-sm font-bold px-4 py-3 rounded-lg border w-full"
                      style={{
                        color: getFeedback(predictionResult.error).color,
                        borderColor: `${getFeedback(predictionResult.error).color}40`,
                        backgroundColor: `${getFeedback(predictionResult.error).color}10`,
                      }}
                    >
                      {getFeedback(predictionResult.error).text}
                    </div>
                    <div className="text-xs text-sci-white/60 text-center">
                      实际角度：{predictionResult.actualAngle.toFixed(1)}° · 你的预测：{predictionUserAngle.toFixed(1)}° · 误差：
                      {predictionResult.error.toFixed(1)}°
                    </div>
                    <button onClick={handleReset} className="sci-button text-xs px-4 py-2">
                      🔄 再预测一次
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

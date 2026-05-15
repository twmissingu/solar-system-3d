import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { journeyStops } from '../data/journeyData';

function formatLightMinutes(minutes: number): string {
  if (minutes < 1) return `${(minutes * 60).toFixed(0)} 秒`;
  if (minutes < 60) return `${minutes.toFixed(1)} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h} 小时 ${m} 分钟`;
}

function formatAngularSize(au: number): string {
  if (au === 0) return '—';
  const deg = (0.0093 / au) * (180 / Math.PI);
  if (deg < 0.01) return `${(deg * 60).toFixed(1)}′`;
  return `${deg.toFixed(3)}°`;
}

export default function JourneyHUD() {
  const {
    journeyMode,
    currentJourneyIndex,
    setJourneyMode,
    setCurrentJourneyIndex,
    setShowJourneyHUD,
    showJourneyHUD,
  } = useStore();

  const stop = journeyStops[currentJourneyIndex];
  if (!stop) return null;

  // 累计光行时间 = 从太阳到当前位置
  const cumulativeMinutes = stop.lightMinutes;
  // 增量光行时间 = 从天体到当前位置（上一站到这一站）
  const incrementalMinutes =
    currentJourneyIndex === 0
      ? 0
      : stop.lightMinutes - journeyStops[currentJourneyIndex - 1].lightMinutes;

  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePause = () => setJourneyMode('paused');
  const handleContinue = () => setJourneyMode('running');

  const handleSkip = () => {
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    if (currentJourneyIndex < journeyStops.length - 1) {
      setJourneyMode('paused');
      setCurrentJourneyIndex(currentJourneyIndex + 1);
      skipTimerRef.current = setTimeout(() => setJourneyMode('running'), 0);
    } else {
      setJourneyMode('completed');
      setShowJourneyHUD(false);
    }
  };

  const handleExit = () => {
    if (skipTimerRef.current) {
      clearTimeout(skipTimerRef.current);
      skipTimerRef.current = null;
    }
    setJourneyMode('idle');
    setCurrentJourneyIndex(0);
    setShowJourneyHUD(false);
  };

  const isPaused = journeyMode === 'paused';

  return (
    <AnimatePresence>
      {showJourneyHUD && (
        <motion.div
          key="journey-hud"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-[35]"
        >
          {/* Consolidated top-right panel */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-[68px] right-3 pointer-events-auto w-full max-w-sm"
          >
            <div className="sci-panel sci-corner p-3 sm:p-4 space-y-3">
              {/* Row 1: Progress + stop name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-sci-cyan/70 font-mono tracking-wider shrink-0">
                    {currentJourneyIndex + 1}/{journeyStops.length}
                  </span>
                  <h2
                    className="text-base sm:text-lg font-bold text-sci-white sci-text-glow truncate"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    {stop.bodyNameZh}
                  </h2>
                </div>
                <span className="text-[10px] text-sci-white/30 font-mono shrink-0 ml-2">
                  {stop.distanceAU.toFixed(2)} AU
                </span>
              </div>

              {/* Row 2: Description */}
              <p className="text-xs sm:text-sm text-sci-white/70 leading-relaxed">
                {stop.description}
              </p>

              {/* Row 3: Metrics grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-sci-cyan/5 rounded-lg px-2.5 py-2">
                  <div className="text-[9px] text-sci-white/40 uppercase tracking-wider">
                    {currentJourneyIndex === 0 ? '出发' : '上站→此站'}
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-sci-white font-bold mt-0.5">
                    {currentJourneyIndex === 0 ? '—' : formatLightMinutes(incrementalMinutes)}
                  </div>
                </div>
                <div className="bg-sci-cyan/5 rounded-lg px-2.5 py-2">
                  <div className="text-[9px] text-sci-white/40 uppercase tracking-wider">距太阳累计</div>
                  <div className="text-xs sm:text-sm font-mono text-sci-white font-bold mt-0.5">
                    {formatLightMinutes(cumulativeMinutes)}
                  </div>
                </div>
                <div className="bg-sci-cyan/5 rounded-lg px-2.5 py-2">
                  <div className="text-[9px] text-sci-white/40 uppercase tracking-wider">太阳视角</div>
                  <div className="text-xs sm:text-sm font-mono text-sci-white font-bold mt-0.5">
                    {formatAngularSize(stop.distanceAU)}
                  </div>
                </div>
              </div>

              {/* Row 4: Scale fact */}
              {stop.scaleFact && (
                <p className="text-[10px] sm:text-xs text-sci-gold leading-relaxed">
                  <span className="text-sci-white/40">尺度感知：</span>
                  {stop.scaleFact}
                </p>
              )}

              {/* Row 5: Controls */}
              <div className="flex items-center gap-2 pt-1">
                {isPaused ? (
                  <button
                    onClick={handleContinue}
                    className="sci-button-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
                  >
                    <Play size={14} /> 继续
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="sci-button text-xs flex items-center gap-1.5 py-1.5 px-3"
                  >
                    <Pause size={14} /> 暂停
                  </button>
                )}
                <button
                  onClick={handleSkip}
                  className="sci-button text-xs flex items-center gap-1.5 py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentJourneyIndex >= journeyStops.length - 1}
                >
                  <SkipForward size={14} /> 跳过
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleExit}
                  className="sci-button text-xs flex items-center gap-1.5 py-1.5 px-3 text-sci-danger/70 hover:text-sci-danger"
                >
                  <X size={14} /> 退出
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

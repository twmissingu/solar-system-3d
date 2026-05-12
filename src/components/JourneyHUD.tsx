import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { journeyStops } from '../data/journeyData';
import { solarAngularDiameter, formatLightTime } from '../utils/physics';

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

  const cumulativeMinutes = journeyStops
    .slice(0, currentJourneyIndex + 1)
    .reduce((sum, s) => sum + s.lightMinutes, 0);

  const angularSize = solarAngularDiameter(stop.distanceAU);

  const handlePause = () => setJourneyMode('paused');
  const handleContinue = () => setJourneyMode('running');
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          {/* Top center info */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto"
          >
            <div className="sci-panel sci-corner px-4 py-3 sm:px-6 sm:py-4 text-center min-w-[240px] max-w-[90vw] sm:max-w-md">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-[10px] sm:text-xs text-sci-cyan/70 tracking-wider uppercase">
                  光速旅程 · {currentJourneyIndex + 1} / {journeyStops.length}
                </span>
              </div>
              <h2
                className="text-lg sm:text-xl font-bold text-sci-white sci-text-glow mb-1"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {stop.bodyNameZh}
              </h2>
              <p className="text-xs sm:text-sm text-sci-white/70 leading-relaxed">
                {stop.description}
              </p>
            </div>
          </motion.div>

          {/* Bottom left info panel */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute bottom-20 left-3 sm:bottom-24 sm:left-4 pointer-events-auto"
          >
            <div className="sci-panel sci-corner p-3 sm:p-4 w-56 sm:w-64 space-y-2">
              <h3 className="text-xs font-bold text-sci-cyan tracking-wider uppercase mb-2">
                光行数据
              </h3>
              <div className="flex justify-between text-xs">
                <span className="text-sci-white/50">距离</span>
                <span className="text-sci-white font-mono">{stop.distanceAU.toFixed(2)} AU</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sci-white/50">光行时间</span>
                <span className="text-sci-white font-mono">{formatLightTime(stop.lightMinutes)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sci-white/50">累计时间</span>
                <span className="text-sci-white font-mono">{formatLightTime(cumulativeMinutes)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sci-white/50">太阳视角</span>
                <span className="text-sci-white font-mono">
                  {angularSize < 0.01
                    ? `${(angularSize * 60).toFixed(2)}′`
                    : `${angularSize.toFixed(3)}°`}
                </span>
              </div>
              {stop.scaleFact && (
                <div className="pt-1 border-t border-sci-cyan/10">
                  <p className="text-[10px] sm:text-xs text-sci-gold mt-1">
                    <span className="text-sci-white/50">尺度感知：</span>
                    {stop.scaleFact}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bottom center controls */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto"
          >
            <div className="sci-panel p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
              {isPaused ? (
                <button
                  onClick={handleContinue}
                  className="sci-button-primary text-xs sm:text-sm flex items-center gap-1.5 py-1.5 px-3"
                >
                  <Play size={14} />
                  <span className="hidden sm:inline">继续</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="sci-button text-xs sm:text-sm flex items-center gap-1.5 py-1.5 px-3"
                >
                  <Pause size={14} />
                  <span className="hidden sm:inline">暂停</span>
                </button>
              )}
              <button
                onClick={handleSkip}
                className="sci-button text-xs sm:text-sm flex items-center gap-1.5 py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={currentJourneyIndex >= journeyStops.length - 1}
              >
                <SkipForward size={14} />
                <span className="hidden sm:inline">跳过</span>
              </button>
              <button
                onClick={handleExit}
                className="sci-button text-xs sm:text-sm flex items-center gap-1.5 py-1.5 px-3"
              >
                <X size={14} />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

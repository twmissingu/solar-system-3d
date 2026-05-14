import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { narrativeMissions } from '../data/narrativeMissions';
import { playUISound } from '../utils/audio';

const speakerColors: Record<string, string> = {
  '指挥中心': '#FDB813',
  'AI助手': '#4ECDC4',
  '任务': '#FF6B6B',
  '神秘信号': '#9B59B6',
};

const speakerInitials: Record<string, string> = {
  '指挥中心': '指',
  'AI助手': 'AI',
  '任务': '任',
  '神秘信号': '神',
};

export default function NarrativePanel() {
  const {
    showNarrative,
    setShowNarrative,
    activeNarrative,
    setActiveNarrative,
    narrativeStep,
    setNarrativeStep,
    setShowSandbox,
    setShowHohmannDesigner,
  } = useStore();

  const completedMissions = useStore((s) => s.completedMissions)
  const completeMissionInStore = useStore((s) => s.completeMission)

  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMission = selectedMissionId
    ? narrativeMissions.find((m) => m.id === selectedMissionId)
    : null;
  const currentStep = currentMission?.steps[narrativeStep];

  // Clear typing timer on unmount
  useEffect(() => {
    return () => {
      if (typeTimerRef.current) {
        clearInterval(typeTimerRef.current);
      }
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!currentStep) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    if (typeTimerRef.current) {
      clearInterval(typeTimerRef.current);
    }

    let index = 0;
    const text = currentStep.text;
    typeTimerRef.current = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
      } else {
        setIsTyping(false);
        if (typeTimerRef.current) {
          clearInterval(typeTimerRef.current);
          typeTimerRef.current = null;
        }
      }
    }, 30);

    return () => {
      if (typeTimerRef.current) {
        clearInterval(typeTimerRef.current);
        typeTimerRef.current = null;
      }
    };
  }, [currentStep]);

  // Escape key handler
  const handleNextStep = useCallback(() => {
    if (!currentMission) return;

    playUISound('click');

    // If typing is in progress, skip to end
    if (isTyping) {
      if (typeTimerRef.current) {
        clearInterval(typeTimerRef.current);
        typeTimerRef.current = null;
      }
      setDisplayedText(currentStep?.text || '');
      setIsTyping(false);
      return;
    }

    if (narrativeStep < currentMission.steps.length - 1) {
      setNarrativeStep(narrativeStep + 1);
    } else {
      // Mission complete
      completeMissionInStore(currentMission.id);
      setSelectedMissionId(null);
      setActiveNarrative(null);
      setNarrativeStep(0);
      playUISound('success');
    }
  }, [currentMission, currentStep, isTyping, narrativeStep, setNarrativeStep, setActiveNarrative]);

  const handleAction = useCallback(() => {
    if (!currentStep?.action) {
      handleNextStep();
      return;
    }

    playUISound('click');

    if (currentStep.targetBodyId) {
      // This will trigger in the 3D scene; close panel and let user interact
      setShowNarrative(false);
      // Try to find body and select it if possible (data not directly available here)
      // The user will click the planet manually per the narrative instructions
    }

    if (currentStep.action.includes('沙盘')) {
      setShowSandbox(true);
      setShowNarrative(false);
    }

    if (currentStep.action.includes('轨道设计器')) {
      setShowHohmannDesigner(true);
      setShowNarrative(false);
    }
  }, [currentStep, handleNextStep, setShowNarrative, setShowSandbox, setShowHohmannDesigner]);

  const handleStartMission = useCallback(
    (missionId: string) => {
      playUISound('click');
      setSelectedMissionId(missionId);
      setActiveNarrative(missionId);
      setNarrativeStep(0);
    },
    [setActiveNarrative, setNarrativeStep]
  );

  const handleClose = useCallback(() => {
    playUISound('click');
    setShowNarrative(false);
    setSelectedMissionId(null);
    setActiveNarrative(null);
    setNarrativeStep(0);
  }, [setShowNarrative, setSelectedMissionId, setActiveNarrative, setNarrativeStep]);

  // Escape 键关闭面板
  useEffect(() => {
    if (!showNarrative) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNarrative, handleClose]);

  if (!showNarrative) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
        style={{ backgroundColor: 'rgba(5, 11, 20, 0.85)' }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 10, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl mx-4"
        >
          {/* Main Panel */}
          <div className="sci-panel sci-corner p-4 sm:p-6 relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-white hover:bg-sci-white/10 transition-colors"
              aria-label="关闭"
            >
              <X size={16} />
            </button>

            {!selectedMissionId ? (
              /* Mission Selection */
              <div className="space-y-4">
                <h2
                  className="text-xl sm:text-2xl font-bold text-sci-cyan sci-text-glow tracking-wider"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  故事任务
                </h2>
                <p className="text-sm text-sci-white/60">选择一个故事任务开始你的冒险</p>

                <div className="space-y-3 mt-4">
                  {narrativeMissions.map((mission) => {
                    const isCompleted = completedMissions.includes(mission.id);
                    return (
                      <button
                        key={mission.id}
                        onClick={() => handleStartMission(mission.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isCompleted
                            ? 'border-sci-cyan/20 bg-sci-cyan/5 hover:bg-sci-cyan/10'
                            : 'border-sci-cyan/30 bg-sci-cyan/10 hover:bg-sci-cyan/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-bold text-sci-white">{mission.title}</h3>
                          {isCompleted && (
                            <span className="text-xs px-2 py-0.5 rounded bg-sci-cyan/20 text-sci-cyan">
                              已完成
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-sci-white/60">{mission.description}</p>
                        <div className="mt-2 text-xs text-sci-gold/80">
                          奖励：{mission.reward}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Narrative Dialog */
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3
                    className="text-lg sm:text-xl font-bold text-sci-cyan"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    {currentMission?.title}
                  </h3>
                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-sci-white/50">
                      {narrativeStep + 1} / {currentMission?.steps.length}
                    </span>
                    <div className="w-24 h-1.5 bg-space-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sci-cyan rounded-full transition-all"
                        style={{
                          width: `${(((narrativeStep + 1) / (currentMission?.steps.length || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Dialog Box */}
                <motion.div
                  key={currentStep?.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-space-900/60 border border-sci-cyan/20 rounded-lg p-4 sm:p-5 min-h-[120px]"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Speaker Avatar */}
                    <motion.div
                      animate={isTyping ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shrink-0"
                      style={{
                        backgroundColor: `${speakerColors[currentStep?.speaker || ''] || '#4ECDC4'}20`,
                        border: `2px solid ${speakerColors[currentStep?.speaker || ''] || '#4ECDC4'}`,
                        color: speakerColors[currentStep?.speaker || ''] || '#4ECDC4',
                      }}
                    >
                      {speakerInitials[currentStep?.speaker || ''] || '?'}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      {/* Speaker Name */}
                      <p
                        className="text-xs sm:text-sm font-bold mb-1 tracking-wider"
                        style={{
                          fontFamily: 'Orbitron, sans-serif',
                          color: speakerColors[currentStep?.speaker || ''] || '#4ECDC4',
                        }}
                      >
                        {currentStep?.speaker}
                      </p>

                      {/* Text */}
                      <p className="text-sm sm:text-base text-sci-white/90 leading-relaxed whitespace-pre-wrap">
                        {displayedText}
                        {isTyping && (
                          <span className="inline-block w-0.5 h-4 bg-sci-cyan ml-0.5 animate-pulse" />
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleAction}
                    className="sci-button-primary flex items-center gap-2 px-5 py-2 text-sm"
                  >
                    {currentStep?.action ? (
                      <>
                        {currentStep.action}
                        <span>→</span>
                      </>
                    ) : (
                      <>
                        继续
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getSpacecraftById } from '../data/spacecraft';

export default function SpacecraftPanel() {
  const { selectedSpacecraft, setSelectedSpacecraft, setShowSpacecraftPanel, explorationHistorySelectedMilestone, setExplorationHistorySelectedMilestone } = useStore();

  // Accept external navigation from ExplorationHistory
  useEffect(() => {
    if (explorationHistorySelectedMilestone && selectedSpacecraft === null) {
      setSelectedSpacecraft(explorationHistorySelectedMilestone);
      setExplorationHistorySelectedMilestone(null);
    }
  }, [explorationHistorySelectedMilestone, selectedSpacecraft, setSelectedSpacecraft, setExplorationHistorySelectedMilestone]);

  const spacecraft = useMemo(() => {
    if (!selectedSpacecraft) return null;
    return getSpacecraftById(selectedSpacecraft);
  }, [selectedSpacecraft]);

  if (!spacecraft) return null;

  const handleClose = () => {
    setShowSpacecraftPanel(false);
    setSelectedSpacecraft(null);
  };

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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="max-w-lg w-full mx-4 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2
            className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {spacecraft.nameZh}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
            aria-label="关闭航天器面板"
            title="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="sci-panel sci-corner p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">
          <div className="flex flex-col gap-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-medium px-2 py-1 rounded bg-sci-cyan/10 text-sci-cyan border border-sci-cyan/30">
                发射日期：{spacecraft.launchDate}
              </span>
              <span className="text-[10px] sm:text-xs font-medium px-2 py-1 rounded bg-sci-blue/10 text-sci-blue border border-sci-blue/30">
                {spacecraft.missionType}
              </span>
              <span
                className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded border ${
                  spacecraft.status === 'active'
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-sci-white/5 text-sci-white/50 border-sci-white/20'
                }`}
              >
                {spacecraft.status === 'active' ? '● 任务进行中' : '● 任务结束'}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-sci-white/70 leading-relaxed">
              {spacecraft.description}
            </p>

            {/* Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-sci-white/80 uppercase tracking-wider">
                任务时间线
              </h3>
              <div className="relative pl-4">
                {/* Vertical line */}
                <div
                  className="absolute left-[7px] top-1 bottom-1 w-px"
                  style={{ backgroundColor: `${spacecraft.color}40` }}
                />
                <div className="flex flex-col gap-3">
                  {spacecraft.trajectory.map((tp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="flex items-start gap-3 relative"
                    >
                      {/* Dot */}
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border-2"
                        style={{
                          backgroundColor: spacecraft.color,
                          borderColor: `${spacecraft.color}80`,
                          boxShadow: `0 0 6px ${spacecraft.color}60`,
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs text-sci-white/50 font-mono">
                          {tp.date}
                        </span>
                        <span className="text-xs sm:text-sm text-sci-white/90">
                          {tp.event}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Discoveries */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-sci-white/80 uppercase tracking-wider">
                重大发现
              </h3>
              <div className="flex flex-col gap-2">
                {spacecraft.keyDiscoveries.map((discovery, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.08 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-green-400 text-sm shrink-0 mt-0.5">✓</span>
                    <span className="text-xs sm:text-sm text-sci-white/70 leading-relaxed">
                      {discovery}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

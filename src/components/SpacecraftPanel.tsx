import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Satellite, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { spacecraftData, getSpacecraftById } from '../data/spacecraft';

export default function SpacecraftPanel() {
  const {
    selectedSpacecraft,
    setSelectedSpacecraft,
    setShowSpacecraftPanel,
    explorationHistorySelectedMilestone,
    setExplorationHistorySelectedMilestone,
  } = useStore();

  // External navigation from ExplorationHistory
  useEffect(() => {
    if (explorationHistorySelectedMilestone && selectedSpacecraft === null) {
      setSelectedSpacecraft(explorationHistorySelectedMilestone);
      setExplorationHistorySelectedMilestone(null);
    }
  }, [
    explorationHistorySelectedMilestone,
    selectedSpacecraft,
    setSelectedSpacecraft,
    setExplorationHistorySelectedMilestone,
  ]);

  const spacecraft = selectedSpacecraft ? getSpacecraftById(selectedSpacecraft) : null;

  const handleClose = useCallback(() => {
    setShowSpacecraftPanel(false);
    setSelectedSpacecraft(null);
  }, [setShowSpacecraftPanel, setSelectedSpacecraft]);

  const handleBack = useCallback(() => {
    setSelectedSpacecraft(null);
  }, [setSelectedSpacecraft]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(5, 11, 20, 0.92)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <Satellite size={18} /> 人类航天器
            </h2>
            <p className="text-xs text-sci-white/50 mt-1">
              从 Voyager 到天宫，回顾人类探索宇宙的航天里程碑
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors shrink-0"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="sci-panel sci-corner p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">
          <AnimatePresence mode="wait">
            {spacecraft ? (
              /* ────────────────── Detail View ────────────────── */
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={handleBack}
                  className="text-xs text-sci-cyan hover:text-sci-cyan/80 mb-4 flex items-center gap-1"
                >
                  ← 返回列表
                </button>

                <div className="flex flex-col gap-4">
                  {/* Title row */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
                      style={{ backgroundColor: `${spacecraft.color}20` }}
                    >
                      <Satellite size={20} style={{ color: spacecraft.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-sci-white">{spacecraft.nameZh}</h3>
                      <p className="text-xs text-sci-white/40">{spacecraft.name}</p>
                    </div>
                  </div>

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
                          ? 'bg-sci-success/10 text-sci-success border-sci-success/30'
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
                    <h4 className="text-xs sm:text-sm font-bold text-sci-white/80 uppercase tracking-wider">
                      任务时间线
                    </h4>
                    <div className="relative pl-4">
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
                    <h4 className="text-xs sm:text-sm font-bold text-sci-white/80 uppercase tracking-wider">
                      重大发现
                    </h4>
                    <div className="flex flex-col gap-2">
                      {spacecraft.keyDiscoveries.map((discovery, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.08 }}
                          className="flex items-start gap-2"
                        >
                          <span className="text-sci-success text-sm shrink-0 mt-0.5">✓</span>
                          <span className="text-xs sm:text-sm text-sci-white/70 leading-relaxed">
                            {discovery}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ────────────────── List View ────────────────── */
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {spacecraftData.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedSpacecraft(sc.id)}
                    className="sci-panel p-3 sm:p-4 text-left hover:border-sci-cyan/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${sc.color}20` }}
                      >
                        <Satellite size={16} style={{ color: sc.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-sci-white group-hover:text-sci-cyan transition-colors truncate">
                          {sc.nameZh}
                        </h4>
                        <p className="text-[10px] text-sci-white/40">{sc.name}</p>
                        <p className="text-xs text-sci-white/60 mt-1 leading-relaxed line-clamp-2">
                          {sc.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sci-cyan/10 text-sci-cyan/70">
                            {sc.launchDate}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              sc.status === 'active'
                                ? 'bg-sci-success/10 text-sci-success/70'
                                : 'bg-sci-white/5 text-sci-white/40'
                            }`}
                          >
                            {sc.status === 'active' ? '● 进行中' : '● 已完成'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-4 shrink-0">
          <p className="text-[10px] text-sci-white/30">
            共 {spacecraftData.length} 个航天器
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

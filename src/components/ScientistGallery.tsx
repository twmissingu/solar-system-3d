import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { scientists } from '../data/scientists';

export default function ScientistGallery() {
  const { showScientistGallery, setShowScientistGallery, explorationHistorySelectedMilestone, setExplorationHistorySelectedMilestone } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Accept external navigation from ExplorationHistory
  useEffect(() => {
    if (explorationHistorySelectedMilestone && showScientistGallery && selectedId === null) {
      setSelectedId(explorationHistorySelectedMilestone);
      setExplorationHistorySelectedMilestone(null);
    }
  }, [explorationHistorySelectedMilestone, showScientistGallery, setExplorationHistorySelectedMilestone, setSelectedId, selectedId]);

  const handleClose = useCallback(() => {
    setShowScientistGallery(false);
    setSelectedId(null);
  }, [setShowScientistGallery]);

  useEffect(() => {
    if (!showScientistGallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showScientistGallery, handleClose]);

  if (!showScientistGallery) return null;

  const selected = selectedId ? scientists.find((s) => s.id === selectedId) : null;

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
        className="w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <Microscope size={18} /> 天文学家画廊
            </h2>
            <p className="text-xs text-sci-white/50 mt-1">
              从古代中国到现代世界，这些天文学家拓展了人类对宇宙的认知边界
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors shrink-0"
            aria-label="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        <div className="sci-panel sci-corner p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-sci-cyan hover:text-sci-cyan/80 mb-4 flex items-center gap-1"
                >
                  ← 返回列表
                </button>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="shrink-0 text-center sm:text-left">
                    <div className="text-5xl mb-2">{selected.icon}</div>
                    <div className="text-sm text-sci-gold font-medium">{selected.nationality}</div>
                    <div className="text-xs text-sci-white/50">{selected.years}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-sci-white mb-1">{selected.name}</h3>
                    <p className="text-xs text-sci-white/40 mb-1">{selected.nameEn}</p>
                    <p className="text-sm text-sci-cyan font-medium mb-3">{selected.tagline}</p>
                    <p className="text-sm text-sci-white/80 leading-relaxed mb-4">
                      {selected.contribution}
                    </p>
                    <div className="bg-sci-gold/5 border border-sci-gold/15 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Sparkles size={16} className="text-sci-gold shrink-0" />
                        <p className="text-xs text-sci-white/70 leading-relaxed">{selected.funFact}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-sci-white/30 mt-3">
                      想了解更多？搜索关键词：{selected.searchKeyword}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {scientists.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className="sci-panel p-3 sm:p-4 text-left hover:border-sci-cyan/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-sci-white group-hover:text-sci-cyan transition-colors truncate">
                          {s.name}
                        </h4>
                        <p className="text-[10px] text-sci-white/40">{s.nameEn}</p>
                        <p className="text-xs text-sci-cyan/70 mt-1 truncate">{s.tagline}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sci-gold/10 text-sci-gold/70">
                            {s.nationality}
                          </span>
                          <span className="text-[10px] text-sci-white/30">{s.years}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

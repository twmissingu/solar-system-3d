import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getAchievementById, getRarityColor, getRarityLabel } from '../data/achievements';
import { playUISound } from '../utils/audio';

export default function AchievementToast() {
  const { achievementQueue, dequeueAchievement } = useStore();

  const currentId = achievementQueue.length > 0 ? achievementQueue[0] : null;
  const achievement = currentId ? getAchievementById(currentId) : null;

  useEffect(() => {
    if (!currentId) return;
    playUISound('success');
    const timer = setTimeout(() => {
      dequeueAchievement();
    }, 4000);
    return () => clearTimeout(timer);
  }, [currentId, dequeueAchievement]);

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {achievement && (
          <motion.div
            key={achievement.id}
            initial={{ x: 120, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 120, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="sci-panel sci-corner p-4 w-72 pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl shrink-0">{achievement.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      color: getRarityColor(achievement.rarity),
                      backgroundColor: `${getRarityColor(achievement.rarity)}15`,
                      border: `1px solid ${getRarityColor(achievement.rarity)}30`,
                    }}
                  >
                    {getRarityLabel(achievement.rarity)}
                  </span>
                </div>
                <h4
                  className="text-sm font-bold text-sci-white sci-text-glow truncate"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  {achievement.name}
                </h4>
                <p className="text-xs text-sci-white/60 mt-0.5 leading-relaxed">
                  {achievement.description}
                </p>
              </div>
            </div>

            {/* Auto-dismiss progress bar */}
            <div className="mt-3 h-0.5 bg-space-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getRarityColor(achievement.rarity) }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

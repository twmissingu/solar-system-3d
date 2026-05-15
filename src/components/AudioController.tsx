import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toggleMute, getMuteState, playUISound } from '../utils/audio';

export default function AudioController() {
  const [muted, setMuted] = useState(getMuteState);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggle = useCallback(() => {
    const newState = toggleMute();
    setMuted(newState);
    if (!newState) {
      playUISound('click');
    }
  }, []);

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="fixed bottom-3 left-3 z-30"
    >
      <div className="relative">
        <button
          onClick={handleToggle}
          onMouseEnter={() => {
            setShowTooltip(true);
            if (!muted) playUISound('hover');
          }}
          onMouseLeave={() => setShowTooltip(false)}
          className="sci-button w-10 h-10 flex items-center justify-center text-lg"
          aria-label={muted ? '开启声音' : '静音'}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 sci-panel px-2 py-1 rounded whitespace-nowrap"
          >
            <span className="text-xs text-sci-white/80">声音开关</span>
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-space-800/60" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion'

interface WelcomeFallbackProps {
  onEnter: () => void
}

export default function WelcomeFallback({ onEnter }: WelcomeFallbackProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-end pb-20 sm:pb-28"
      style={{ background: '#000000' }}
    >
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="text-center mb-10 sm:mb-14"
      >
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-sci-white sci-text-glow tracking-[0.12em] mb-3"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          太阳系 3D 探索
        </h1>
        <p className="text-xs sm:text-sm text-sci-cyan/50 tracking-[0.4em] uppercase font-light">
          Interstellar Exploration
        </p>
      </motion.div>

      {/* 进入按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
      >
        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="sci-button-primary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-3.5 rounded-md"
        >
          <span className="flex items-center gap-2">
            进入探索
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
            </svg>
          </span>
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="text-[10px] sm:text-xs text-sci-white/25 mt-6 tracking-wider"
      >
        加载深空背景中 · 移动鼠标探索宇宙
      </motion.p>

      {/* 光柱 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="welcome-light-beam" style={{ left: '15%', animationDelay: '0s' }} />
        <div className="welcome-light-beam" style={{ left: '38%', animationDelay: '2.5s' }} />
        <div className="welcome-light-beam" style={{ left: '62%', animationDelay: '5s' }} />
        <div className="welcome-light-beam" style={{ left: '85%', animationDelay: '1.2s' }} />
      </div>
    </div>
  )
}

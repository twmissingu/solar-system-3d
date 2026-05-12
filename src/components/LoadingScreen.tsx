import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    const steps = [12, 30, 48, 65, 82, 94, 100]
    let idx = 0
    const timer = setInterval(() => {
      if (idx < steps.length) {
        setProgress(steps[idx])
        idx++
      } else {
        clearInterval(timer)
        setStatus('ready')
        setTimeout(() => setVisible(false), 800)
      }
    }, 320)
    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: '#050B14' }}
        >
          {/* 外环装饰 */}
          <motion.div
            className="w-32 h-32 rounded-full border border-sci-cyan/10 mb-8 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-28 h-28 rounded-full border border-sci-cyan/20" />
          </motion.div>

          <h1
            className="text-2xl sm:text-3xl font-bold text-sci-white sci-text-glow tracking-[0.25em] mb-6"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            SOLAR SYSTEM
          </h1>

          {/* 进度条外框 */}
          <div className="w-56 sm:w-64 h-1 bg-space-700 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full"
              style={{ background: status === 'ready' ? '#4ECDC4' : '#4ECDC4' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>

          <motion.p
            className="text-xs text-sci-cyan/60 font-mono tracking-wider"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {status === 'loading' ? `LOADING SYSTEM... ${progress}%` : 'SYSTEM READY'}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generalIntro } from '../data/knowledge'

const stepContent = [
  {
    title: generalIntro.title,
    subtitle: generalIntro.subtitle,
  },
  {
    description: generalIntro.content,
    tips: [
      { icon: '🖱️', text: '鼠标左键拖拽旋转，滚轮缩放，右键平移' },
      { icon: '👆', text: '点击任意行星查看科普知识和真实数据' },
      { icon: '⏱️', text: '底部时间轴控制行星运动速度' },
      { icon: '🌑', text: '试试「月全食演示」按钮，观看真实的月食现象' },
    ],
  },
  {
    ready: true,
  },
]

export default function WelcomeOverlay() {
  const [visible, setVisible] = useState(true)
  const stepRef = useRef(0)
  const [step, setStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // 同步 ref 与 state
  useEffect(() => {
    stepRef.current = step
  }, [step])

  // 自动轮播
  useEffect(() => {
    if (!autoPlay || step >= 2) return
    const timer = setTimeout(() => {
      setStep((s) => s + 1)
    }, 3500)
    return () => clearTimeout(timer)
  }, [step, autoPlay])

  // 键盘导航 - 使用 ref 避免频繁重新绑定
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const current = stepRef.current
    if (e.key === 'Escape') {
      setVisible(false)
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      setAutoPlay(false)
      if (current < 2) {
        setStep(current + 1)
      } else {
        setVisible(false)
      }
    } else if (e.key === 'ArrowLeft') {
      if (current > 0) {
        setAutoPlay(false)
        setStep(current - 1)
      }
    }
  }, [setVisible, setAutoPlay, setStep])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const goToStep = (target: number) => {
    setAutoPlay(false)
    setStep(target)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(5, 11, 20, 0.94)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setVisible(false)
          }}
        >
          <div className="max-w-lg w-full mx-4 relative">
            {/* 跳过按钮 */}
            <button
              onClick={() => setVisible(false)}
              className="absolute -top-10 right-0 text-xs text-sci-white/40 hover:text-sci-cyan transition-colors flex items-center gap-1"
            >
              跳过引导 <span className="hidden sm:inline">(ESC)</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
            </button>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-sci-white sci-text-glow mb-3 sm:mb-4"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    {stepContent[0].title}
                  </h1>
                  <p className="text-sci-cyan text-base sm:text-lg tracking-widest">
                    {stepContent[0].subtitle}
                  </p>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <p className="text-sci-white/80 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                    {stepContent[1].description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
                    {stepContent[1].tips?.map((tip, i) => (
                      <TipCard key={i} icon={tip.icon} text={tip.text} />
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <p className="text-sci-cyan text-lg sm:text-xl mb-5 sm:mb-6">准备好了吗？</p>
                  <button
                    onClick={() => setVisible(false)}
                    className="sci-button-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3"
                  >
                    开始探索 🚀
                  </button>
                  <p className="text-[10px] sm:text-xs text-sci-white/30 mt-4 max-w-sm mx-auto leading-relaxed">
                    免责声明：本展示为简化模型，行星尺寸已放大以便观察，不代表真实比例。
                    轨道计算基于二体开普勒近似，未包含行星摄动效应，长期位置存在偏差。
                    仅供科普教育参考，非精密天文数据。
                  </p>
                  <p className="text-[10px] sm:text-xs text-sci-white/20 mt-2 max-w-sm mx-auto leading-relaxed">
                    🔊 声音提示：太空中没有空气，无法传播声音。你听到的音效是交互反馈和数据的艺术化呈现。
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 步骤导航 */}
            <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
              <button
                onClick={() => goToStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="text-sci-white/30 hover:text-sci-cyan disabled:opacity-20 disabled:hover:text-sci-white/30 transition-colors text-xs"
                aria-label="上一步"
              >
                ◀
              </button>

              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    className={`h-2 rounded-full transition-all ${
                      step === i ? 'bg-sci-cyan w-6' : 'bg-sci-white/20 w-2 hover:bg-sci-white/40'
                    }`}
                    aria-label={`跳转到第 ${i + 1} 步`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (step < 2) goToStep(step + 1)
                  else setVisible(false)
                }}
                className="text-sci-white/30 hover:text-sci-cyan transition-colors text-xs"
                aria-label={step < 2 ? '下一步' : '开始探索'}
              >
                {step < 2 ? '▶' : '✓'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TipCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="sci-panel p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
      <span className="text-lg sm:text-xl shrink-0">{icon}</span>
      <p className="text-xs sm:text-sm text-sci-white/70 leading-relaxed">{text}</p>
    </div>
  )
}

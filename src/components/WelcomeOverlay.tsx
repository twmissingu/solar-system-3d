import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MousePointerClick, Pointer, Timer, Moon, Rocket, X } from 'lucide-react'
import { generalIntro } from '../data/knowledge'

const tips = [
  { Icon: MousePointerClick, text: '鼠标左键拖拽旋转，滚轮缩放，右键平移' },
  { Icon: Pointer, text: '点击任意行星查看科普知识和真实数据' },
  { Icon: Timer, text: '底部时间轴控制行星运动速度' },
  { Icon: Moon, text: '试试「月全食演示」按钮，观看真实的月食现象' },
]

interface WelcomeOverlayProps {
  onClose: () => void
}

export default function WelcomeOverlay({ onClose }: WelcomeOverlayProps) {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    timerRef.current = setTimeout(onClose, 600)
  }, [onClose])

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
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <div className="max-w-lg w-full mx-4 relative">
            <button
              onClick={handleClose}
              className="absolute -top-10 right-0 text-xs text-sci-white/40 hover:text-sci-cyan transition-colors flex items-center gap-1"
            >
              跳过引导
              <X size={12} />
            </button>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1
                className="text-2xl sm:text-3xl font-bold text-sci-white sci-text-glow mb-2"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {generalIntro?.title || '太阳系3D探索'}
              </h1>
              <p className="text-sci-cyan text-sm tracking-widest mb-6">
                {generalIntro?.subtitle}
              </p>

              <p className="text-sci-white/70 text-sm leading-relaxed mb-6">
                {generalIntro?.content}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
                {tips.map((tip, i) => (
                  <TipCard key={i} Icon={tip.Icon} text={tip.text} />
                ))}
              </div>

              <button
                onClick={handleClose}
                className="sci-button-primary text-base px-6 py-2.5 mb-4 inline-flex items-center gap-2"
              >
                开始探索
                <Rocket size={16} />
              </button>

              <p className="text-[10px] text-sci-white/25 max-w-sm mx-auto leading-relaxed">
                免责声明：本展示为简化模型，行星尺寸已放大以便观察，不代表真实比例。
                轨道计算基于二体开普勒近似，未包含行星摄动效应，长期位置存在偏差。
                仅供科普教育参考，非精密天文数据。
              </p>
              <p className="text-[10px] text-sci-white/20 mt-1 max-w-sm mx-auto leading-relaxed">
                太空中没有空气，无法传播声音。你听到的音效是交互反馈和数据的艺术化呈现。
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TipCard({ Icon, text }: { Icon: typeof Rocket; text: string }) {
  return (
    <div className="sci-panel p-3 flex items-start gap-2.5">
      <Icon size={18} className="shrink-0 text-sci-cyan/70" />
      <p className="text-xs text-sci-white/70 leading-relaxed">{text}</p>
    </div>
  )
}

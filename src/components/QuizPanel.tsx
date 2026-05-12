import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { quizQuestions, getQuizResultText } from '../data/quiz'

interface QuizPanelProps {
  onClose: () => void
}

export default function QuizPanel({ onClose }: QuizPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [history, setHistory] = useState<{ correct: boolean; index: number }[]>([])

  if (quizQuestions.length === 0) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(5, 11, 20, 0.92)' }}>
        <div className="text-sci-white/50 text-center">暂无题目</div>
      </div>
    )
  }

  const question = quizQuestions[currentIndex]
  const isCorrect = selectedOption === question.correctIndex

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return
      setSelectedOption(index)
      setAnswered(true)
      const correct = index === question.correctIndex
      if (correct) setScore((s) => s + 1)
      setHistory((h) => [...h, { correct, index }])
    },
    [answered, question.correctIndex]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
      setAnswered(false)
    } else {
      setShowResult(true)
    }
  }, [currentIndex])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setShowResult(false)
    setScore(0)
    setAnswered(false)
    setHistory([])
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(5, 11, 20, 0.92)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-w-lg w-full mx-4">
        {/* 进度条 */}
        {!showResult && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-sci-white/50 mb-1">
              <span>
                第 {currentIndex + 1} / {quizQuestions.length} 题
              </span>
              <span>得分: {score}</span>
            </div>
            <div className="h-1 bg-space-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-sci-cyan rounded-full"
                animate={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={question.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="sci-panel sci-corner p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-sci-white mb-5 leading-relaxed">
                  {question.question}
                </h3>

                <div className="flex flex-col gap-2.5">
                  {question.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border ${
                        answered
                          ? idx === question.correctIndex
                            ? 'bg-green-500/15 border-green-500/40 text-green-300'
                            : idx === selectedOption
                            ? 'bg-red-500/15 border-red-500/40 text-red-300'
                            : 'bg-space-700/30 border-sci-white/10 text-sci-white/40'
                          : 'bg-space-700/30 border-sci-white/10 text-sci-white/80 hover:bg-sci-cyan/10 hover:border-sci-cyan/30'
                      }`}
                    >
                      <span className="font-mono mr-2 opacity-60">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>

                {/* 解析 */}
                <AnimatePresence>
                  {answered && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`mt-4 p-3 rounded-lg text-sm leading-relaxed ${
                          isCorrect
                            ? 'bg-green-500/10 border border-green-500/20 text-green-200'
                            : 'bg-red-500/10 border border-red-500/20 text-red-200'
                        }`}
                      >
                        <p className="font-medium mb-1">
                          {isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}
                        </p>
                        <p className="text-sci-white/70">{question.explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 下一题按钮 */}
                {answered && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={handleNext} className="sci-button-primary text-sm px-5 py-2">
                      {currentIndex < quizQuestions.length - 1 ? '下一题 →' : '查看结果'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="sci-panel sci-corner p-6 sm:p-8">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-sci-white sci-text-glow mb-3"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  挑战完成！
                </h2>
                <p className="text-lg text-sci-cyan mb-2">
                  {score} / {quizQuestions.length}
                </p>
                <p className="text-sm text-sci-white/70 mb-6">
                  {getQuizResultText(score, quizQuestions.length)}
                </p>

                {/* 答题回顾 */}
                <div className="flex justify-center gap-1.5 mb-6">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono ${
                        h.correct
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center">
                  <button onClick={handleRestart} className="sci-button text-sm px-5 py-2">
                    重新挑战
                  </button>
                  <button onClick={onClose} className="sci-button-primary text-sm px-5 py-2">
                    关闭
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

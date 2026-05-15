import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { allBodies, FlatBodyEntry } from '../utils/flattenBodies'
import { getHeliocentricPosition, getSatellitePosition } from '../utils/orbit'
import { getVisualRadius } from '../data/celestialData'
import { evaluateAchievements } from '../utils/achievements'
import { playUISound } from '../utils/audio'

const categoryLabels: Record<string, string> = {
  star: '恒星',
  planet: '行星',
  dwarfPlanet: '矮行星',
  satellite: '卫星',
}

export default function CelestialSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentDay = useStore((s) => s.currentDay)
  const setSelectedBody = useStore((s) => s.setSelectedBody)
  const setCameraFocus = useStore((s) => s.setCameraFocus)
  const addExploredBody = useStore((s) => s.addExploredBody)
  const resetView = useStore((s) => s.resetView)
  const planetScale = useStore((s) => s.planetScale)

  // 按查询过滤
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allBodies
    return allBodies.filter(
      (entry) =>
        entry.body.nameZh.toLowerCase().includes(q) ||
        entry.body.name.toLowerCase().includes(q),
    )
  }, [query])

  // 构建扁平展示列表（含分组标题和"返回概览"）
  const flatItems = useMemo(() => {
    const items: Array<
      | { type: 'overview' }
      | { type: 'group-header'; label: string }
      | { type: 'body'; entry: FlatBodyEntry }
    > = []
    items.push({ type: 'overview' })

    let currentCategory = ''
    for (const entry of filtered) {
      if (entry.category !== currentCategory) {
        currentCategory = entry.category
        items.push({
          type: 'group-header',
          label: categoryLabels[entry.category] || entry.category,
        })
      }
      items.push({ type: 'body', entry })
    }

    return items
  }, [filtered])

  // 查询变更时重置高亮
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // 选中天体后的跳转逻辑
  const jumpToBody = useCallback(
    (entry: FlatBodyEntry | null) => {
      setIsOpen(false)
      setQuery('')
      playUISound('click')

      if (!entry) {
        resetView()
        return
      }

      const body = entry.body
      setSelectedBody(body)
      addExploredBody(body.id)

      // 计算显示半径（与 Planet.tsx 保持一致）
      const effectiveRadius = body.id === 'sun'
        ? getVisualRadius(body.radiusKm)
        : getVisualRadius(body.radiusKm) * planetScale

      // 计算世界坐标（与 Planet.tsx onClick 一致）
      let wx: number
      let wy: number
      let wz: number

      if (body.id === 'sun') {
        wx = 0
        wy = 0
        wz = 0
      } else if (entry.parentOrbit) {
        // 卫星：母星日心坐标 + 卫星相对坐标
        const parentPos = getHeliocentricPosition(entry.parentOrbit, currentDay)
        const satPos = getSatellitePosition(body.orbit, currentDay)
        wx = parentPos[0] + satPos[0]
        wy = parentPos[1] + satPos[1]
        wz = parentPos[2] + satPos[2]
      } else {
        // 行星或矮行星：直接日心坐标
        const pos = getHeliocentricPosition(body.orbit, currentDay)
        wx = pos[0]
        wy = pos[1]
        wz = pos[2]
      }

      const dist = Math.max(effectiveRadius * 5, 3)
      setCameraFocus([wx + dist, wy + dist * 0.3, wz + dist], [wx, wy, wz])

      evaluateAchievements()

      // 如果有活跃任务，记录探索
      const state = useStore.getState()
      if (state.activeMissionId) {
        state.addMissionExploredBody(body.id)
      }
    },
    [currentDay, setSelectedBody, setCameraFocus, addExploredBody, resetView, planetScale],
  )

  // 计算当前高亮项的 aria-activedescendant id
  const activeDescendantId = useMemo(() => {
    const item = flatItems[activeIndex]
    if (!item || item.type === 'group-header') return undefined
    if (item.type === 'overview') return 'search-option-overview'
    return `search-option-${item.entry.body.id}`
  }, [activeIndex, flatItems])

  // 键盘导航（跳过 group-header）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => {
          let next = Math.min(prev + 1, flatItems.length - 1)
          while (next < flatItems.length - 1 && flatItems[next].type === 'group-header') {
            next++
          }
          return next
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => {
          let next = Math.max(prev - 1, 0)
          while (next > 0 && flatItems[next].type === 'group-header') {
            next--
          }
          return next
        })
        break
      case 'Enter': {
        e.preventDefault()
        const selected = flatItems[activeIndex]
        if (!selected) break
        if (selected.type === 'overview') {
          jumpToBody(null)
        } else if (selected.type === 'body') {
          jumpToBody(selected.entry)
        }
        break
      }
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div className="relative mt-1.5" style={{ minWidth: 0 }}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search
          size={12}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-sci-white/40 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="搜索天体..."
          className="w-full bg-space-800/60 border border-sci-cyan/20 rounded pl-6 pr-2 py-1 text-[11px] sm:text-xs text-sci-white/80 placeholder-sci-white/30 focus:outline-none focus:border-sci-cyan/50 transition-colors"
          aria-label="搜索天体"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendantId}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-sci-white/30 hover:text-sci-white/60"
            tabIndex={-1}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* 下拉列表 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 max-h-[60vh] overflow-y-auto sci-panel p-1"
            style={{ minWidth: '220px' }}
          >
            {flatItems.length <= 1 ? (
              /* 只有一个 overview */
              <div className="text-[11px] text-sci-white/40 text-center py-3">
                未找到匹配天体
              </div>
            ) : (
              flatItems.map((item, index) => {
                if (item.type === 'overview') {
                  return (
                    <button
                      key="overview"
                      id="search-option-overview"
                      role="option"
                      aria-selected={index === activeIndex}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center gap-2 transition-colors ${
                        index === activeIndex
                          ? 'bg-sci-cyan/15 text-sci-cyan'
                          : 'text-sci-white/60 hover:text-sci-white hover:bg-sci-white/5'
                      }`}
                      onClick={() => jumpToBody(null)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <RotateCcw size={12} />
                      返回概览
                    </button>
                  )
                }

                if (item.type === 'group-header') {
                  return (
                    <div
                      key={item.label}
                      className="px-2 py-1 mt-1 text-[10px] text-sci-cyan/50 uppercase tracking-wider font-semibold first:mt-0"
                    >
                      ★ {item.label}
                    </div>
                  )
                }

                const { entry } = item
                return (
                  <button
                    key={entry.body.id}
                    id={`search-option-${entry.body.id}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center gap-2 transition-colors ${
                      index === activeIndex
                        ? 'bg-sci-cyan/15 text-sci-cyan'
                        : 'text-sci-white/80 hover:text-sci-white hover:bg-sci-white/5'
                    }`}
                    onClick={() => jumpToBody(entry)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: entry.body.color }}
                    />
                    <span className="font-medium">{entry.body.nameZh}</span>
                    <span className="text-sci-white/30 text-[10px]">
                      {entry.body.name}
                    </span>
                    {entry.category === 'satellite' && entry.parentNameZh && (
                      <span className="text-sci-white/20 text-[10px] ml-auto">
                        {entry.parentNameZh}的卫星
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

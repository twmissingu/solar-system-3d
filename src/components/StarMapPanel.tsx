import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Telescope } from 'lucide-react';
import { useStore } from '../store/useStore';

const SEASONS = [
  {
    id: 'spring',
    name: '春季星空（3-5月）',
    icon: '🌸',
    highlights: [
      { name: '木星', desc: '傍晚出现在西方天空，非常明亮', color: '#D4A373' },
      { name: '火星', desc: '午夜前后出现在东南方，呈淡红色', color: '#E27B58' },
      { name: '狮子座', desc: '春季最显著的星座，头部像一把反写的问号', color: '#FDB813' },
      { name: '北斗七星', desc: '高悬于北方天空，是寻找北极星的钥匙', color: '#5B7CFF' },
    ],
    tip: '春季是观测星系的最佳季节。深夜时分， Leo（狮子座）方向可以看到很多遥远的星系。',
  },
  {
    id: 'summer',
    name: '夏季星空（6-8月）',
    icon: 'sun',
    highlights: [
      { name: '土星', desc: '傍晚出现在东南方，用小望远镜可见光环', color: '#F4D03F' },
      { name: '木星', desc: '前半夜可见，是夜空中最亮的星点之一', color: '#D4A373' },
      { name: '银河', desc: '夏季银河最壮观，横跨整个夜空，肉眼可见一条光带', color: '#E8EEF5' },
      { name: '织女星 / 牛郎星', desc: '夏季大三角的三颗亮星，包含中国民间传说的主角', color: '#AED6F1' },
    ],
    tip: '夏季是观测银河和深空天体的最佳季节。远离城市灯光，肉眼就能看到银河的光带。',
  },
  {
    id: 'autumn',
    name: '秋季星空（9-11月）',
    icon: 'leaf',
    highlights: [
      { name: '木星', desc: '前半夜高悬天空，非常醒目', color: '#D4A373' },
      { name: '土星', desc: '傍晚西南方可见，光环倾斜角度每年变化', color: '#F4D03F' },
      { name: '飞马座四边形', desc: '秋季星空的“定位标志”，四颗亮星组成一个正方形', color: '#C8D6E5' },
      { name: '仙女座星系', desc: '秋季肉眼可见的最远天体，距离我们250万光年', color: '#E8EEF5' },
    ],
    tip: '秋季是观测仙女座星系（M31）的最佳时机。在远离城市的地方，肉眼就能看到一团模糊的光斑。',
  },
  {
    id: 'winter',
    name: '冬季星空（12-2月）',
    icon: 'snow',
    highlights: [
      { name: '火星', desc: '傍晚高悬于东方，亮度变化大', color: '#E27B58' },
      { name: '金星', desc: '黎明前出现在东方（启明星），或日落后西方（长庚星）', color: '#E3BB76' },
      { name: '猎户座', desc: '冬季最壮丽的星座，腰带三颗星排列成一条直线', color: '#FF6B6B' },
      { name: '天狼星', desc: '夜空中最亮的恒星，位于大犬座，呈蓝白色', color: '#64B5F6' },
    ],
    tip: '冬季夜空最清澈，是观测亮星和星座的最佳时机。猎户座大星云（M42）用双筒望远镜就能看到。',
  },
];

export default function StarMapPanel() {
  const { showStarMap, setShowStarMap } = useStore();
  const [activeSeason, setActiveSeason] = useState('spring');

  const handleClose = useCallback(() => {
    setShowStarMap(false);
  }, [setShowStarMap]);

  useEffect(() => {
    if (!showStarMap) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStarMap, handleClose]);

  if (!showStarMap) return null;

  const season = SEASONS.find((s) => s.id === activeSeason);
  if (!season) return null;

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
        className="w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <Telescope size={18} /> 四季星空
            </h2>
            <p className="text-xs text-sci-white/50 mt-1">
              北半球四季夜空的主要观测目标和方向指南
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
          {/* Season tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {SEASONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSeason(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border whitespace-nowrap ${
                  activeSeason === s.id
                    ? 'bg-sci-cyan/20 text-sci-cyan border-sci-cyan/30'
                    : 'text-sci-white/50 hover:text-sci-white/70 border-transparent bg-space-700/20'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name.split('（')[0]}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSeason}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-base font-bold text-sci-white mb-3 flex items-center gap-2">
                <span>{season.icon}</span>
                <span>{season.name}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {season.highlights.map((h) => (
                  <div
                    key={h.name}
                    className="rounded-lg border border-sci-white/5 bg-space-700/20 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: h.color }}
                      />
                      <span className="text-sm font-bold text-sci-white">{h.name}</span>
                    </div>
                    <p className="text-xs text-sci-white/60 leading-relaxed">{h.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-sci-cyan/15 bg-sci-cyan/5 p-3">
                <div className="flex items-start gap-2">
                  <span className="text-sci-cyan shrink-0 text-sm">💡</span>
                  <p className="text-xs text-sci-white/70 leading-relaxed">{season.tip}</p>
                </div>
              </div>

              {/* 方位图示意 */}
              <div className="mt-4 rounded-lg border border-sci-white/5 bg-space-700/10 p-4">
                <p className="text-xs text-sci-white/50 mb-3 text-center">简化方位示意图（面向北方）</p>
                <div className="relative w-full max-w-[280px] mx-auto aspect-square">
                  {/* 方位圆 */}
                  <div className="absolute inset-0 rounded-full border border-sci-white/10" />
                  {/* 中心点 */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sci-white/30" />
                  {/* 方向标签 */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-sci-cyan/60">北</div>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-sci-cyan/60">南</div>
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-sci-cyan/60">西</div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-sci-cyan/60">东</div>
                  {/* 简化星座/行星位置 */}
                  {season.highlights.map((h, i) => {
                    const angles = [45, 135, 225, 315];
                    const angle = (angles[i] * Math.PI) / 180;
                    const r = 35;
                    const x = 50 + r * Math.cos(angle);
                    const y = 50 + r * Math.sin(angle);
                    return (
                      <div
                        key={h.name}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: h.color }}
                        />
                        <span className="text-[8px] text-sci-white/50 mt-0.5 whitespace-nowrap">{h.name}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-sci-white/30 mt-2 text-center">
                  方位示意图仅供大致参考，实际观测请结合当天星图
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

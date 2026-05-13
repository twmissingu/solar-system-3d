import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';
import { useStore } from '../store/useStore';
import { celestialBodies, dwarfPlanets } from '../data/celestialData';

const SCALE_INFO = {
  sunDiameterCm: 24, // 篮球直径
  sunRadiusKm: 696340,
  scaleFactor: 24 / (696340 * 2), // cm per km
};

function kmToScaledCm(km: number): string {
  const cm = km * SCALE_INFO.scaleFactor;
  if (cm >= 100) return `${(cm / 100).toFixed(1)}米`;
  if (cm >= 1) return `${cm.toFixed(1)}厘米`;
  return `${(cm * 10).toFixed(1)}毫米`;
}

function auToScaledMeters(au: number): string {
  const km = au * 149597870.7;
  const cm = km * SCALE_INFO.scaleFactor;
  const meters = cm / 100;
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}公里`;
  return `${meters.toFixed(0)}米`;
}

interface ScaleItem {
  name: string;
  sizeLabel: string;
  distanceLabel: string;
  color: string;
}

export default function ScaleRuler() {
  const { showScaleRuler, setShowScaleRuler } = useStore();

  if (!showScaleRuler) return null;

  const allBodies = [...celestialBodies, ...dwarfPlanets].filter((b) => b.id !== 'sun');

  const items: ScaleItem[] = allBodies.map((b) => ({
    name: b.nameZh,
    sizeLabel: kmToScaledCm(b.radiusKm * 2),
    distanceLabel: auToScaledMeters(b.orbit.a),
    color: b.color,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(5, 11, 20, 0.92)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowScaleRuler(false);
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-xl mx-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <Ruler size={18} /> 比例尺感受器
            </h2>
            <p className="text-xs text-sci-white/50 mt-1">
              如果太阳是一颗篮球，太阳系会是什么样子？
            </p>
          </div>
          <button
            onClick={() => setShowScaleRuler(false)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors shrink-0"
            aria-label="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        <div className="sci-panel sci-corner p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">
          {/* 太阳参照 */}
          <div className="rounded-lg border border-sci-gold/20 bg-sci-gold/5 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shrink-0 shadow-lg shadow-yellow-500/20" />
              <div>
                <h3 className="text-sm font-bold text-sci-gold">太阳 = 一颗篮球</h3>
                <p className="text-xs text-sci-white/60 mt-0.5">
                  直径约24厘米 · 比例尺 1 : {((SCALE_INFO.sunRadiusKm * 2) / (SCALE_INFO.sunDiameterCm / 100)).toExponential(2)}
                </p>
              </div>
            </div>
          </div>

          {/* 行星列表 */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-lg border border-sci-white/5 bg-space-700/20 px-3 py-2.5"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-sci-white">{item.name}</span>
                    <span className="text-xs text-sci-white/40 font-mono">{item.sizeLabel}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="h-1 rounded-full bg-sci-cyan/20 flex-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sci-cyan/50"
                        style={{ width: `${Math.min(100, (parseFloat(item.distanceLabel) / 1000) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-sci-cyan/70 font-mono shrink-0">
                      {item.distanceLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 操场比喻 */}
          <div className="mt-4 rounded-lg border border-sci-cyan/15 bg-sci-cyan/5 p-3">
            <p className="text-xs text-sci-cyan/80 leading-relaxed">
              <span className="font-bold">🎯 操场比喻：</span>如果太阳是放在操场中央的篮球，
              水星是一粒米（约26米外），地球也是一粒米（约68米外），
              木星是一颗玻璃弹珠（约350米外），土星是一颗小弹珠（约640米外），
              而冥王星只是一粒沙（约2.6公里外）。在这之间，几乎全是空无一物的真空。
            </p>
          </div>

          <p className="text-[10px] text-sci-white/30 mt-3 text-center">
            这就是太阳系的真相：99.999%是空无一物的虚空
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

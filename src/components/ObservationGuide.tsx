import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getHeliocentricPosition } from '../utils/orbit';
import { celestialBodies, dwarfPlanets } from '../data/celestialData';

interface ObservationGuideProps {
  bodyId: string;
}

const SIGNS = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座',
];

function longitudeToConstellation(longitudeDeg: number): string {
  const idx = Math.floor(longitudeDeg / 30) % 12;
  return SIGNS[idx < 0 ? idx + 12 : idx];
}

function findBodyById(bodyId: string) {
  for (const body of celestialBodies) {
    if (body.id === bodyId) return body;
    if (body.satellites) {
      for (const sat of body.satellites) {
        if (sat.id === bodyId) return sat;
      }
    }
  }
  for (const dp of dwarfPlanets) {
    if (dp.id === bodyId) return dp;
  }
  return undefined;
}

function getEarth() {
  return celestialBodies.find((b) => b.id === 'earth');
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function getBrightnessInfo(bodyId: string): { mag: number; note: string; needsScope: boolean } {
  switch (bodyId) {
    case 'sun':
      return { mag: -26.7, note: '不可直视！需专用滤镜', needsScope: false };
    case 'moon':
      return { mag: -12.7, note: '夜空最亮的天体', needsScope: false };
    case 'mercury':
      return { mag: 0.5, note: '亮度约0.5等，肉眼可见但靠近地平线', needsScope: false };
    case 'venus':
      return { mag: -4.0, note: '亮度约-4.0等，肉眼极易看到，像一颗明亮的星星', needsScope: false };
    case 'mars':
      return { mag: -1.0, note: '亮度约-1.0等，肉眼可见，呈淡红色', needsScope: false };
    case 'jupiter':
      return { mag: -2.5, note: '亮度约-2.5等，肉眼非常明亮', needsScope: false };
    case 'saturn':
      return { mag: 0.5, note: '亮度约0.5等，肉眼可见', needsScope: false };
    case 'uranus':
      return { mag: 5.5, note: '亮度约5.5等，肉眼极难看到，需要黑暗环境', needsScope: true };
    case 'neptune':
      return { mag: 7.8, note: '亮度约7.8等，肉眼不可见', needsScope: true };
    default:
      return { mag: 8.0, note: '较暗，肉眼不可见', needsScope: true };
  }
}

function getObservationTip(bodyId: string): string {
  switch (bodyId) {
    case 'sun':
      return '绝对不要直接用肉眼或普通望远镜观测太阳，必须使用专业减光滤镜。';
    case 'moon':
      return '用双筒望远镜可以看到月球表面的环形山和月海，满月时最亮但细节较少，上弦月或下弦月时环形山阴影更明显。';
    case 'mercury':
      return '水星靠近太阳，只能在日出前或日落后的一小段时间内观测，需要开阔的地平线。';
    case 'venus':
      return '金星是除日月外最亮的天体，用双筒望远镜可以看到它的相位变化，就像小月亮一样。';
    case 'mars':
      return '火星冲日期间最亮，用小型望远镜可以看到极冠和表面暗斑。';
    case 'jupiter':
      return '用双筒望远镜可以看到木星的四颗伽利略卫星，小型望远镜能看到云带和大红斑。';
    case 'saturn':
      return '土星光环用小型望远镜就能看到，是望远镜观测中最令人震撼的景象之一。';
    case 'uranus':
      return '需要双筒望远镜或小型望远镜，在黑暗的天空下寻找一颗淡绿色的小光点。';
    case 'neptune':
      return '需要至少4英寸口径的望远镜，在星图中仔细比对才能找到这颗蓝色小星球。';
    default:
      return '需要专业望远镜才能观测到这颗天体。';
  }
}

function getFunFact(bodyId: string): string {
  switch (bodyId) {
    case 'sun':
      return '太阳的视直径约为0.5度，和满月差不多大，这是宇宙中的奇妙巧合！';
    case 'moon':
      return '满月时的亮度足以在户外读书，古人甚至称之为"月光如昼"。';
    case 'mercury':
      return '水星在天空中移动很快，古人因此以罗马神话中的信使之神命名它。';
    case 'venus':
      return '金星有时被称为"启明星"或"长庚星"，取决于它出现在黎明还是黄昏。';
    case 'mars':
      return '火星冲日时亮度可以超过木星，成为夜空中最亮的"星星"之一。';
    case 'jupiter':
      return '用稳定支撑的双筒望远镜，你可以看到木星像一个小圆盘，而不是光点。';
    case 'saturn':
      return '伽利略最早看到土星时，以为它长了两个"耳朵"，后来惠更斯才发现那是光环。';
    case 'uranus':
      return '天王星是第一颗用望远镜发现的行星，由威廉·赫歇尔在1781年发现。';
    case 'neptune':
      return '海王星是仅有的两颗通过数学计算预测位置后才发现的行星之一。';
    default:
      return '每一颗星星和行星都在夜空中等待着你去发现！';
  }
}

export default function ObservationGuide({ bodyId }: ObservationGuideProps) {
  const { currentDay, unlockAchievement } = useStore();

  useEffect(() => {
    unlockAchievement('stargazer');
  }, [bodyId, unlockAchievement]);

  const guide = useMemo(() => {
    const body = findBodyById(bodyId);
    if (!body) return null;

    if (bodyId === 'sun') {
      return {
        title: '☀️ 太阳观测指南',
        lines: [
          '太阳是我们的母星，白天肉眼可见。',
          '绝对不要直接用肉眼或望远镜观测，必须使用专业减光滤镜。',
          '日出日落时是拍摄太阳最安全、最美的时刻。',
        ],
        tip: getObservationTip('sun'),
        funFact: getFunFact('sun'),
        needsScope: false,
        constellation: null,
      };
    }

    if (bodyId === 'moon') {
      return {
        title: '🌙 月球观测指南',
        lines: [
          '今晚8点，抬头看天空，月球是最容易找到的天体！',
          '月球是夜空中最亮的天体，肉眼清晰可见。',
          '最佳观测时间：晚上8点到凌晨2点。',
        ],
        tip: getObservationTip('moon'),
        funFact: getFunFact('moon'),
        needsScope: false,
        constellation: null,
      };
    }

    // For non-sun/moon bodies, compute approximate sky position
    const earth = getEarth();
    if (!earth) return null;

    const earthPos = getHeliocentricPosition(earth.orbit, currentDay);
    const bodyPos = getHeliocentricPosition(body.orbit, currentDay);

    // Vector from Earth to body
    const dx = bodyPos[0] - earthPos[0];
    const dy = bodyPos[1] - earthPos[1];
    const dz = bodyPos[2] - earthPos[2];

    // Ecliptic longitude (simplified, ignoring Earth's axial tilt for constellation mapping)
    const longitude = normalizeDeg(radToDeg(Math.atan2(dy, dx)));
    const constellation = longitudeToConstellation(longitude);

    // Elongation (angle between Sun and target as seen from Earth)
    const sunPos: [number, number, number] = [0, 0, 0];
    const sunDx = sunPos[0] - earthPos[0];
    const sunDy = sunPos[1] - earthPos[1];
    const sunDist = Math.sqrt(sunDx * sunDx + sunDy * sunDy);
    const bodyDist = Math.sqrt(dx * dx + dy * dy);
    const dot = sunDx * dx + sunDy * dy;
    const cosElong = dot / (sunDist * bodyDist || 1);
    const elongDeg = radToDeg(Math.acos(Math.max(-1, Math.min(1, cosElong))));

    // Best time estimate based on elongation
    let bestTime = '晚上8点到凌晨2点';
    if (elongDeg < 20) {
      bestTime = '当前该天体靠近太阳，夜晚不可见';
    } else if (elongDeg > 160) {
      bestTime = '晚上8点到凌晨5点（整夜可见）';
    } else if (elongDeg > 90) {
      bestTime = '晚上8点到午夜12点';
    } else {
      bestTime = '凌晨3点到日出前';
    }

    const brightness = getBrightnessInfo(bodyId);
    const visibleText = brightness.needsScope
      ? `亮度约${brightness.mag}等，${brightness.note}`
      : `亮度约${brightness.mag}等，${brightness.note}`;

    const lines: string[] = [
      `今晚8点，向${constellation}方向天空看`,
      `${body.nameZh}在${constellation}附近`,
      visibleText,
      `最佳观测时间：${bestTime}`,
    ];

    return {
      title: `🔭 ${body.nameZh}观测指南`,
      lines,
      tip: getObservationTip(bodyId),
      funFact: getFunFact(bodyId),
      needsScope: brightness.needsScope,
      constellation,
    };
  }, [bodyId, currentDay]);

  if (!guide) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-sci-white/40 italic">暂无该天体的观测指南。</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-sci-cyan/5 border border-sci-cyan/15 rounded-lg p-3">
        <p className="text-xs text-sci-white/60 leading-relaxed">
          以下观测指南基于简化轨道模型生成，实际观测请参考当天星图或天文App。
        </p>
      </div>

      <div className="rounded-lg border border-sci-cyan/15 bg-space-700/30 p-4 space-y-3">
        <h3 className="text-sm font-bold text-sci-cyan">{guide.title}</h3>
        {guide.lines.map((line, idx) => (
          <p key={idx} className="text-xs text-sci-white/80 leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      {guide.needsScope && bodyId !== 'sun' && bodyId !== 'moon' && (
        <div className="rounded-lg border border-sci-gold/20 bg-sci-gold/5 p-3">
          <p className="text-xs text-sci-gold/80 font-medium">需要专业望远镜</p>
          <p className="text-[11px] text-sci-white/50 mt-1">
            这颗天体较暗或体积较小，需要至少4英寸口径的望远镜才能看到更多细节。
          </p>
        </div>
      )}

      <div className="rounded-lg border border-sci-cyan/10 bg-space-700/20 p-3">
        <div className="flex items-start gap-2">
          <span className="text-sci-cyan shrink-0 text-sm">🔍</span>
          <p className="text-xs text-sci-white/70 leading-relaxed">{guide.tip}</p>
        </div>
      </div>

      <div className="rounded-lg border border-sci-cyan/10 bg-space-700/20 p-3">
        <div className="flex items-start gap-2">
          <span className="text-sci-gold shrink-0 text-sm">✨</span>
          <p className="text-xs text-sci-white/70 leading-relaxed">{guide.funFact}</p>
        </div>
      </div>
    </motion.div>
  );
}

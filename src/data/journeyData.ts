export interface JourneyStop {
  bodyId: string;
  bodyNameZh: string;
  distanceAU: number;
  lightMinutes: number; // 从太阳到该天体的光行时间（分钟）
  description: string;
  scaleFact: string;
}

// 从太阳出发，依次到达各天体
// lightMinutes 为从太阳出发累积光行时间
export const journeyStops: JourneyStop[] = [
  {
    bodyId: 'sun',
    bodyNameZh: '太阳',
    distanceAU: 0,
    lightMinutes: 0,
    description: '我们的旅程从太阳开始，它是太阳系的中心，也是地球生命的能量源泉。',
    scaleFact: '',
  },
  {
    bodyId: 'mercury',
    bodyNameZh: '水星',
    distanceAU: 0.387,
    lightMinutes: 3.2,
    description: '水星是离太阳最近的行星，白天 427°C，夜晚 -173°C。它的轨道离心率最大。',
    scaleFact: '从这里看，太阳比地球天空中看到的约大 3 倍！',
  },
  {
    bodyId: 'venus',
    bodyNameZh: '金星',
    distanceAU: 0.723,
    lightMinutes: 6.0,
    description: '金星有极厚的大气层，表面温度高达 462°C，是太阳系最热的行星。',
    scaleFact: '太阳的亮度大约是地球天空中的 1.9 倍',
  },
  {
    bodyId: 'earth',
    bodyNameZh: '地球',
    distanceAU: 1.0,
    lightMinutes: 8.3,
    description: '这是我们的家园——目前已知宇宙中唯一存在生命的行星。',
    scaleFact: '一切正常——你熟悉的大小',
  },
  {
    bodyId: 'moon',
    bodyNameZh: '月球',
    distanceAU: 1.0,
    lightMinutes: 8.32,
    description: '月球是地球唯一的天然卫星，距离地球约 38.4 万公里。它的引力影响着地球的潮汐。',
    scaleFact: '从月球看地球，地球的直径是天空中太阳的 4 倍——壮观的地出！',
  },
  {
    bodyId: 'mars',
    bodyNameZh: '火星',
    distanceAU: 1.524,
    lightMinutes: 12.7,
    description: '火星被称为"红色星球"，是人类探索的重点目标。它拥有太阳系最高的山峰——奥林匹斯山。',
    scaleFact: '太阳的大小只有在地球看到的约 2/3',
  },
  {
    bodyId: 'jupiter',
    bodyNameZh: '木星',
    distanceAU: 5.204,
    lightMinutes: 43.2,
    description: '木星是太阳系最大的行星，大红斑风暴已持续至少 350 年。它的质量是其他所有行星总和的 2.5 倍。',
    scaleFact: '太阳看起来只有在地球看到的 1/25 大',
  },
  {
    bodyId: 'saturn',
    bodyNameZh: '土星',
    distanceAU: 9.582,
    lightMinutes: 79.3,
    description: '土星以其壮丽的光环闻名。它密度比水还小——如果有足够大的海洋，土星会浮起来。',
    scaleFact: '太阳的大小只有在地球看到的约 1/90',
  },
  {
    bodyId: 'uranus',
    bodyNameZh: '天王星',
    distanceAU: 19.218,
    lightMinutes: 159.6,
    description: '天王星几乎是"躺着"自转的——自转轴倾斜 98 度。它的蓝绿色来自大气中的甲烷。',
    scaleFact: '太阳看起来像一颗明亮的星星，不再像圆盘',
  },
  {
    bodyId: 'neptune',
    bodyNameZh: '海王星',
    distanceAU: 30.11,
    lightMinutes: 250.0,
    description: '海王星拥有太阳系最强烈的风暴，风速可达 2100 km/h。它是距离太阳最远的行星。',
    scaleFact: '太阳的亮度只有地球天空中的约 1/900',
  },
];

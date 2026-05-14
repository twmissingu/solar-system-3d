// 天文常数
export const AU = 149597870.7; // km
export const SUN_RADIUS_KM = 696340;
export const EARTH_RADIUS_KM = 6371;

// 视觉缩放因子：用于在3D场景中放大行星，使其可见但不破坏轨道相对距离
export const VISUAL_RADIUS_SCALE = 30;
export const DISTANCE_SCALE = 1; // 距离用真实比例（1 AU 对应场景中的相对单位）

// 真实比例基准：地球在真实比例模式下的显示半径
export const REAL_SCALE_BASE = 0.3;

/**
 * 计算天体在真实比例模式下的显示半径
 * 以地球半径为基准，保持真实比例关系
 */
export function getRealVisualRadius(radiusKm: number): number {
  return (radiusKm / EARTH_RADIUS_KM) * REAL_SCALE_BASE;
}

export interface OrbitalElements {
  a: number; // 半长轴 (AU)
  e: number; // 偏心率
  i: number; // 轨道倾角 (度)
  L: number; // 平黄经 (度)
  longPeri: number; // 近日点经度 (度)
  longNode: number; // 升交点黄经 (度)
  period: number; // 公转周期 (地球日)
}

export interface CelestialBody {
  id: string;
  name: string;
  nameZh: string;
  radiusKm: number;
  visualRadius: number; // 场景中的显示半径（已缩放）
  color: string;
  textureColor?: string; // 简化纹理用色值
  orbit: OrbitalElements;
  rotationPeriod: number; // 自转周期 (小时)
  axialTilt: number; // 自转轴倾角 (度)
  description: string;
  satellites?: CelestialBody[];
  hasRings?: boolean;
  ringColor?: string;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  isTidallyLocked?: boolean; // 是否潮汐锁定（始终同一面朝母星）
}

// 基于 NASA JPL 数据简化（圆轨道近似用于基础展示，偏心率保留真实值）
// 历元 J2000.0
export const celestialBodies: CelestialBody[] = [
  {
    id: "sun",
    name: "Sun",
    nameZh: "太阳",
    radiusKm: SUN_RADIUS_KM,
    visualRadius: 3.5,
    color: "#FDB813",
    textureColor: "#FDB813",
    orbit: { a: 0, e: 0, i: 0, L: 0, longPeri: 0, longNode: 0, period: 0 },
    rotationPeriod: 609.12,
    axialTilt: 7.25,
    description:
      "太阳是太阳系的中心恒星，占太阳系总质量的99.86%。它通过核心的核聚变反应持续发光发热，为地球提供了生命所需的能量。",
  },
  {
    id: "mercury",
    name: "Mercury",
    nameZh: "水星",
    radiusKm: 2439.7,
    visualRadius: 0.6,
    color: "#A5A5A5",
    textureColor: "#8C8C8C",
    orbit: {
      a: 0.3871,
      e: 0.2056,
      i: 7.005,
      L: 252.251,
      longPeri: 77.457,
      longNode: 48.331,
      period: 87.97,
    },
    rotationPeriod: 1407.6,
    axialTilt: 0.034,
    description:
      "水星是离太阳最近的行星，表面布满陨石坑，白天温度可达427°C，夜晚降至-173°C。",
  },
  {
    id: "venus",
    name: "Venus",
    nameZh: "金星",
    radiusKm: 6051.8,
    visualRadius: 0.95,
    color: "#E3BB76",
    textureColor: "#E3BB76",
    orbit: {
      a: 0.7233,
      e: 0.0067,
      i: 3.394,
      L: 181.979,
      longPeri: 131.533,
      longNode: 76.681,
      period: 224.7,
    },
    rotationPeriod: 5832.5,
    axialTilt: 177.4,
    description:
      "金星是太阳系中最热的行星，浓厚的大气层产生极强的温室效应，表面温度高达462°C。",
  },
  {
    id: "earth",
    name: "Earth",
    nameZh: "地球",
    radiusKm: 6371,
    visualRadius: 1.0,
    color: "#4F86F7",
    textureColor: "#2B65EC",
    orbit: {
      a: 1.000,
      e: 0.0167,
      i: 0.000,
      L: 100.466,
      longPeri: 102.947,
      longNode: 348.739,
      period: 365.25,
    },
    rotationPeriod: 23.93,
    axialTilt: 23.44,
    description:
      "地球是我们共同的家园，表面71%被海洋覆盖，是目前已知宇宙中唯一存在生命的行星。",
    satellites: [
      {
        id: "moon",
        name: "Moon",
        nameZh: "月球",
        radiusKm: 1737.4,
        visualRadius: 0.27,
        color: "#C0C0C0",
        textureColor: "#C0C0C0",
        orbit: {
          a: 0.00257,
          e: 0.0549,
          i: 5.145,
          L: 135,
          longPeri: 0,
          longNode: 125.08,
          period: 27.32,
        },
        rotationPeriod: 655.7,
        axialTilt: 1.54,
        description:
          "月球是地球唯一的天然卫星，距离地球约38.4万公里。它的引力影响地球的潮汐，并帮助我们稳定自转轴。",
        isTidallyLocked: true,
      }
    ],
  },
  {
    id: "mars",
    name: "Mars",
    nameZh: "火星",
    radiusKm: 3389.5,
    visualRadius: 0.53,
    color: "#E27B58",
    textureColor: "#C1440E",
    orbit: {
      a: 1.5237,
      e: 0.0934,
      i: 1.851,
      L: 355.453,
      longPeri: 336.041,
      longNode: 49.579,
      period: 686.98,
    },
    rotationPeriod: 24.62,
    axialTilt: 25.19,
    description:
      "火星被称为'红色星球'，表面覆盖着氧化铁（铁锈）。它是人类探索的重点目标，目前已有多辆火星车在其表面行驶。",
    satellites: [
      {
        id: "phobos",
        name: "Phobos",
        nameZh: "火卫一",
        radiusKm: 11.267,
        visualRadius: 0.05,
        color: "#8C7D6B",
        textureColor: "#8C7D6B",
        orbit: {
          a: 0.00006268,
          e: 0.0151,
          i: 1.093,
          L: 45,
          longPeri: 0,
          longNode: 0,
          period: 0.3189,
        },
        rotationPeriod: 7.66,
        axialTilt: 0,
        description: "火卫一是火星最大的卫星，形状不规则，像一个土豆。它离火星非常近，公转周期不到8小时！",
        isTidallyLocked: true,
      },
      {
        id: "deimos",
        name: "Deimos",
        nameZh: "火卫二",
        radiusKm: 6.2,
        visualRadius: 0.04,
        color: "#A39E8B",
        textureColor: "#A39E8B",
        orbit: {
          a: 0.0001568,
          e: 0.0005,
          i: 1.788,
          L: 210,
          longPeri: 0,
          longNode: 0,
          period: 1.262,
        },
        rotationPeriod: 30.35,
        axialTilt: 0,
        description: "火卫二是火星较小的卫星，表面同样布满陨石坑，公转周期约30小时。",
        isTidallyLocked: true,
      }
    ],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    nameZh: "木星",
    radiusKm: 69911,
    visualRadius: 2.5,
    color: "#D4A373",
    textureColor: "#C8A882",
    orbit: {
      a: 5.2044,
      e: 0.0489,
      i: 1.303,
      L: 34.351,
      longPeri: 14.331,
      longNode: 100.464,
      period: 4332.59,
    },
    rotationPeriod: 9.92,
    axialTilt: 3.13,
    description:
      "木星是太阳系最大的行星，质量是其他所有行星总和的2.5倍。它著名的大红斑是一个持续数百年的巨大风暴。",
    satellites: [
      {
        id: "io",
        name: "Io",
        nameZh: "木卫一（艾奥）",
        radiusKm: 1821.6,
        visualRadius: 0.28,
        color: "#E8C547",
        textureColor: "#E8C547",
        orbit: {
          a: 0.00282,
          e: 0.0041,
          i: 0.036,
          L: 300,
          longPeri: 0,
          longNode: 0,
          period: 1.769,
        },
        rotationPeriod: 42.46,
        axialTilt: 0,
        description: "木卫一是太阳系中火山活动最活跃的天体，表面有超过400座活火山！",
        isTidallyLocked: true,
      },
      {
        id: "europa",
        name: "Europa",
        nameZh: "木卫二（欧罗巴）",
        radiusKm: 1560.8,
        visualRadius: 0.24,
        color: "#F0F4F8",
        textureColor: "#E8EEF5",
        orbit: {
          a: 0.00449,
          e: 0.009,
          i: 0.466,
          L: 80,
          longPeri: 0,
          longNode: 0,
          period: 3.551,
        },
        rotationPeriod: 85.22,
        axialTilt: 0,
        description:
          "木卫二表面覆盖着冰层，冰层下可能隐藏着巨大的液态水海洋，是寻找地外生命的热门目标。",
        isTidallyLocked: true,
      },
      {
        id: "ganymede",
        name: "Ganymede",
        nameZh: "木卫三（加尼未）",
        radiusKm: 2634.1,
        visualRadius: 0.41,
        color: "#B0A898",
        textureColor: "#B0A898",
        orbit: {
          a: 0.00715,
          e: 0.0013,
          i: 0.177,
          L: 170,
          longPeri: 0,
          longNode: 0,
          period: 7.155,
        },
        rotationPeriod: 171.7,
        axialTilt: 0,
        description: "木卫三是太阳系中最大的卫星，甚至比水星还大！它拥有自己独立的磁场。",
        isTidallyLocked: true,
      },
      {
        id: "callisto",
        name: "Callisto",
        nameZh: "木卫四（卡利斯托）",
        radiusKm: 2410.3,
        visualRadius: 0.38,
        color: "#6B6358",
        textureColor: "#6B6358",
        orbit: {
          a: 0.01258,
          e: 0.0074,
          i: 0.192,
          L: 260,
          longPeri: 0,
          longNode: 0,
          period: 16.689,
        },
        rotationPeriod: 400.5,
        axialTilt: 0,
        description:
          "木卫四是太阳系中最古老的表面之一，布满了古老的陨石坑，地质活动几乎停止。",
        isTidallyLocked: true,
      }
    ],
  },
  {
    id: "saturn",
    name: "Saturn",
    nameZh: "土星",
    radiusKm: 58232,
    visualRadius: 2.1,
    color: "#F4D03F",
    textureColor: "#EAD18C",
    orbit: {
      a: 9.5826,
      e: 0.0565,
      i: 2.485,
      L: 50.077,
      longPeri: 92.431,
      longNode: 113.665,
      period: 10759.22,
    },
    rotationPeriod: 10.66,
    axialTilt: 26.73,
    description:
      "土星以其壮丽的环系闻名，主要由冰块和岩石碎片组成。它是太阳系中密度最小的行星，甚至比水还轻。",
    hasRings: true,
    ringColor: "#D4C5A3",
    ringInnerRadius: 1.2,
    ringOuterRadius: 2.3,
    satellites: [
      {
        id: "titan",
        name: "Titan",
        nameZh: "土卫六（泰坦）",
        radiusKm: 2574.7,
        visualRadius: 0.4,
        color: "#C8A86E",
        textureColor: "#C8A86E",
        orbit: {
          a: 0.00817,
          e: 0.0288,
          i: 0.348,
          L: 320,
          longPeri: 0,
          longNode: 0,
          period: 15.945,
        },
        rotationPeriod: 382.68,
        axialTilt: 0,
        description:
          "土卫六是太阳系中唯一拥有浓厚大气层的卫星，大气中充满氮气和甲烷，表面有液态甲烷湖泊。",
        isTidallyLocked: true,
      },
      {
        id: "enceladus",
        name: "Enceladus",
        nameZh: "土卫二（恩克拉多斯）",
        radiusKm: 252.1,
        visualRadius: 0.1,
        color: "#F5F5F5",
        textureColor: "#F5F5F5",
        orbit: {
          a: 0.00159,
          e: 0.0047,
          i: 0.009,
          L: 55,
          longPeri: 0,
          longNode: 0,
          period: 1.370,
        },
        rotationPeriod: 32.88,
        axialTilt: 0,
        description:
          "土卫二是一颗冰雪覆盖的明亮卫星，南极地区有活跃的冰火山，向太空喷射水冰和有机分子！",
        isTidallyLocked: true,
      }
    ],
  },
  {
    id: "uranus",
    name: "Uranus",
    nameZh: "天王星",
    radiusKm: 25362,
    visualRadius: 1.5,
    color: "#AED6F1",
    textureColor: "#AED6F1",
    orbit: {
      a: 19.2184,
      e: 0.0457,
      i: 0.773,
      L: 314.055,
      longPeri: 170.964,
      longNode: 74.006,
      period: 30688.5,
    },
    rotationPeriod: 17.24,
    axialTilt: 97.77,
    description:
      "天王星是一颗冰巨星，最特别的是它几乎'横躺'着自转——自转轴倾角接近98度！这导致它的季节极为极端。",
    satellites: [
      {
        id: "titania",
        name: "Titania",
        nameZh: "天卫三（泰坦尼亚）",
        radiusKm: 788.4,
        visualRadius: 0.12,
        color: "#C8D6E5",
        textureColor: "#C8D6E5",
        orbit: {
          a: 0.00291,
          e: 0.0011,
          i: 0.079,
          L: 140,
          longPeri: 0,
          longNode: 0,
          period: 8.706,
        },
        rotationPeriod: 208.95,
        axialTilt: 0,
        description: "天卫三是天王星最大的卫星，表面有巨大的峡谷系统和断层，地质活动曾非常活跃。",
        isTidallyLocked: true,
      }
    ],
  },
  {
    id: "neptune",
    name: "Neptune",
    nameZh: "海王星",
    radiusKm: 24622,
    visualRadius: 1.45,
    color: "#5B7CFF",
    textureColor: "#5B7CFF",
    orbit: {
      a: 30.1104,
      e: 0.0113,
      i: 1.77,
      L: 304.32,
      longPeri: 44.971,
      longNode: 131.784,
      period: 60195,
    },
    rotationPeriod: 16.11,
    axialTilt: 28.32,
    description:
      "海王星是太阳系最远的巨行星，拥有太阳系中最强烈的风暴，风速可达每小时2100公里。它是在数学预测后被望远镜发现的。",
    satellites: [
      {
        id: "triton",
        name: "Triton",
        nameZh: "海卫一（特里同）",
        radiusKm: 1353.4,
        visualRadius: 0.21,
        color: "#E0E0E0",
        textureColor: "#E0E0E0",
        orbit: {
          a: 0.00237,
          e: 0.000016,
          i: 156.865,
          L: 225,
          longPeri: 0,
          longNode: 0,
          period: 5.877,
        },
        rotationPeriod: 141.05,
        axialTilt: 0,
        description:
          "海卫一是海王星最大的卫星，轨道方向与其他卫星相反（逆行轨道），科学家认为它可能曾是柯伊伯带天体，被海王星捕获。",
        isTidallyLocked: true,
      }
    ],
  },
];

// 月全食演示数据：2025年3月14日 真实月全食事件
export const lunarEclipseDemo = {
  date: "2025-03-14",
  julianDay: 2460747.5,
  description:
    "2025年3月14日发生了一次月全食。此时地球正好位于太阳和月球之间，地球的阴影完全覆盖了月球，月球呈现出暗红色。",
  targetBody: "moon",
  cameraPosition: [0, 0, 0] as [number, number, number], // 相对于月球的位置
};

// 矮行星数据
export const dwarfPlanets: CelestialBody[] = [
  {
    id: "pluto",
    name: "Pluto",
    nameZh: "冥王星",
    radiusKm: 1188.3,
    visualRadius: 0.19,
    color: "#D4B896",
    textureColor: "#D4B896",
    orbit: {
      a: 39.48,
      e: 0.2488,
      i: 17.16,
      L: 238.929,
      longPeri: 224.068,
      longNode: 110.299,
      period: 90560,
    },
    rotationPeriod: 153.29,
    axialTilt: 122.5,
    description:
      "冥王星是1930年发现的第一颗矮行星，曾被列为第九大行星。它有一颗大卫星卡戎，两者甚至形成了一个双星系统。",
    satellites: [
      {
        id: "charon",
        name: "Charon",
        nameZh: "卡戎",
        radiusKm: 606.0,
        visualRadius: 0.1,
        color: "#A0A0A0",
        textureColor: "#A0A0A0",
        orbit: {
          a: 0.000117,
          e: 0.0022,
          i: 0.001,
          L: 0,
          longPeri: 0,
          longNode: 0,
          period: 6.387,
        },
        rotationPeriod: 153.29,
        axialTilt: 0,
        description: "卡戎是冥王星最大的卫星，与冥王星形成了相互潮汐锁定的双星系统。",
        isTidallyLocked: true,
      },
    ],
  },
  {
    id: "ceres",
    name: "Ceres",
    nameZh: "谷神星",
    radiusKm: 469.7,
    visualRadius: 0.1,
    color: "#A0A0A0",
    textureColor: "#A0A0A0",
    orbit: {
      a: 2.7675,
      e: 0.0758,
      i: 10.59,
      L: 95.989,
      longPeri: 73.115,
      longNode: 80.329,
      period: 1681.63,
    },
    rotationPeriod: 9.07,
    axialTilt: 4.0,
    description:
      "谷神星是小行星带中最大的天体，也是最早被发现的小行星（1801年）。它占了小行星带总质量的约40%。",
  },
  {
    id: "eris",
    name: "Eris",
    nameZh: "阋神星",
    radiusKm: 1163.0,
    visualRadius: 0.18,
    color: "#C8C8C8",
    textureColor: "#C8C8C8",
    orbit: {
      a: 67.78,
      e: 0.4407,
      i: 44.04,
      L: 125.33,
      longPeri: 150.977,
      longNode: 36.066,
      period: 204870,
    },
    rotationPeriod: 25.9,
    axialTilt: 78.0,
    description:
      "阋神星是太阳系中已知的第二大的矮行星，它的发现直接导致了冥王星被重新分类为矮行星。",
  },
  {
    id: "makemake",
    name: "Makemake",
    nameZh: "鸟神星",
    radiusKm: 715.0,
    visualRadius: 0.14,
    color: "#D4C4A8",
    textureColor: "#D4C4A8",
    orbit: {
      a: 45.79,
      e: 0.159,
      i: 29.01,
      L: 55.09,
      longPeri: 95.352,
      longNode: 79.62,
      period: 111690,
    },
    rotationPeriod: 22.5,
    axialTilt: 0.0,
    description:
      "鸟神星是柯伊伯带中的矮行星，以复活节岛神话中的创世神命名。它是除冥王星外最亮的柯伊伯带天体之一。",
  },
  {
    id: "haumea",
    name: "Haumea",
    nameZh: "妊神星",
    radiusKm: 780.0,
    visualRadius: 0.15,
    color: "#B8B8D4",
    textureColor: "#B8B8D4",
    orbit: {
      a: 43.13,
      e: 0.1913,
      i: 28.22,
      L: 218.51,
      longPeri: 239.662,
      longNode: 121.9,
      period: 103774,
    },
    rotationPeriod: 3.92,
    axialTilt: 0.0,
    description:
      "妊神星是一颗快速自转的矮行星，自转周期不到4小时，这使得它呈椭球形。它有两颗已知的卫星。",
    satellites: [
      {
        id: "hi-iaka",
        name: "Hiʻiaka",
        nameZh: "希亚卡",
        radiusKm: 160.0,
        visualRadius: 0.06,
        color: "#C0C0C0",
        textureColor: "#C0C0C0",
        orbit: {
          a: 0.000325,
          e: 0.0513,
          i: 126.1,
          L: 90,
          longPeri: 0,
          longNode: 0,
          period: 49.12,
        },
        rotationPeriod: 49.12,
        axialTilt: 0,
        description: "希亚卡是妊神星最大的卫星，以夏威夷神话中的舞蹈女神命名。",
        isTidallyLocked: true,
      },
      {
        id: "namaka",
        name: "Namaka",
        nameZh: "纳马卡",
        radiusKm: 85.0,
        visualRadius: 0.04,
        color: "#B0B0B0",
        textureColor: "#B0B0B0",
        orbit: {
          a: 0.00017,
          e: 0.249,
          i: 126.1,
          L: 270,
          longPeri: 0,
          longNode: 0,
          period: 18.278,
        },
        rotationPeriod: 18.278,
        axialTilt: 0,
        description: "纳马卡是妊神星的第二颗卫星，以夏威夷神话中的海之女神命名。",
        isTidallyLocked: true,
      },
    ],
  },
];

// 预设视角
export const presetViews = [
  {
    id: "overview",
    name: "太阳系全景",
    nameZh: "太阳系全景",
    description: "从黄道面上方俯瞰整个太阳系",
    cameraPosition: [0, 40, 50] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
  },
  {
    id: "side-view",
    name: "黄道面侧视",
    nameZh: "黄道面侧视",
    description: "从侧面观察行星轨道面",
    cameraPosition: [0, 5, 60] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
  },
  {
    id: "from-earth",
    name: "从地球看太阳",
    nameZh: "从地球看太阳",
    description: "站在地球上看太阳在天空中的大小",
    cameraPosition: [1.0, 0.3, 0] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
  },
  {
    id: "saturn-rings",
    name: "土星光环特写",
    nameZh: "土星光环特写",
    description: "近距离观察土星壮丽的光环系统",
    cameraPosition: [9.6, 2, 5] as [number, number, number],
    lookAt: [9.6, 0, 0] as [number, number, number],
  },
];

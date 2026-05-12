export type MissionType = 'explore' | 'identify' | 'compare' | 'observe';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: {
    bodyId?: string;
    bodyIds?: string[];
    count?: number;
  };
  hints: string[];
  rewardAchievementId?: string;
  knowledgeId: string;
  difficulty: 1 | 2 | 3;
}

export const missions: Mission[] = [
  {
    id: 'm1',
    type: 'explore',
    title: '火星登陆计划',
    description: '探索火星，了解这颗红色行星的奥秘。',
    target: { bodyId: 'mars' },
    hints: ['火星是红色的行星', '它位于地球轨道外侧', '找一找那颗红色的行星'],
    rewardAchievementId: 'mars_pioneer',
    knowledgeId: 'mars-exploration',
    difficulty: 1,
  },
  {
    id: 'm2',
    type: 'identify',
    title: '寻找风暴之王',
    description: '找到太阳系中最大的行星——木星。',
    target: { bodyId: 'jupiter' },
    hints: ['这颗行星是太阳系最大的', '它的表面有个大红斑', '它有很多卫星'],
    knowledgeId: 'jupiter-red-spot',
    difficulty: 1,
  },
  {
    id: 'm3',
    type: 'explore',
    title: '光环探秘',
    description: '探索土星，欣赏它壮丽的光环系统。',
    target: { bodyId: 'saturn' },
    hints: ['这颗行星的环非常著名', '它是气态巨行星', '它位于木星之外'],
    rewardAchievementId: 'saturn_rings',
    knowledgeId: 'saturn-rings',
    difficulty: 1,
  },
  {
    id: 'm4',
    type: 'identify',
    title: '太阳系边缘',
    description: '找到离太阳最远的巨行星——海王星。',
    target: { bodyId: 'neptune' },
    hints: ['它是最远的巨行星', '它的颜色是深蓝色', '风速可达2100公里/小时'],
    knowledgeId: 'neptune',
    difficulty: 2,
  },
  {
    id: 'm5',
    type: 'compare',
    title: '温度挑战',
    description: '比较金星和海王星的温度差异。',
    target: { bodyIds: ['venus', 'neptune'] },
    hints: ['高温行星有极强的温室效应', '最冷的行星离太阳最远'],
    knowledgeId: 'seasons',
    difficulty: 2,
  },
  {
    id: 'm6',
    type: 'observe',
    title: '月全食见证者',
    description: '观看月全食演示，观察月球如何变成暗红色。',
    target: { bodyId: 'moon' },
    hints: ['点击控制栏的月全食演示按钮', '观察月球如何变成暗红色'],
    rewardAchievementId: 'eclipse_witness',
    knowledgeId: 'lunar-eclipse',
    difficulty: 1,
  },
  {
    id: 'm7',
    type: 'explore',
    title: '卫星大搜索',
    description: '探索太阳系中的卫星，至少找到3颗。',
    target: {
      bodyIds: ['moon', 'io', 'europa', 'ganymede', 'callisto', 'titan', 'enceladus', 'titania', 'triton', 'phobos', 'deimos'],
      count: 3,
    },
    hints: ['地球有一颗卫星叫月球', '木星有很多卫星', '土星也有卫星'],
    rewardAchievementId: 'satellite_hunter',
    knowledgeId: 'moon-phases',
    difficulty: 2,
  },
  {
    id: 'm8',
    type: 'identify',
    title: '躺着的行星',
    description: '找到自转轴倾角接近98度的天王星。',
    target: { bodyId: 'uranus' },
    hints: ['它的自转轴倾角接近98度', '它是冰巨星', '它位于土星之外'],
    knowledgeId: 'neptune',
    difficulty: 2,
  },
  {
    id: 'm9',
    type: 'explore',
    title: '外域之旅',
    description: '探索太阳系的边缘世界——矮行星。',
    target: { bodyIds: ['pluto', 'eris', 'haumea', 'makemake'] },
    hints: ['冥王星曾经是第九大行星', '柯伊伯带有很多矮行星'],
    rewardAchievementId: 'outer_reaches',
    knowledgeId: 'neptune',
    difficulty: 3,
  },
  {
    id: 'm10',
    type: 'identify',
    title: '最热的行星',
    description: '找到表面温度高达462°C的金星。',
    target: { bodyId: 'venus' },
    hints: ['它有极厚的大气层', '表面温度462°C', '它被称为地球的"姐妹星"'],
    knowledgeId: 'sun-nuclear',
    difficulty: 3,
  },
];

export function getMissionById(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}

export function getMissionsByDifficulty(difficulty: 1 | 2 | 3): Mission[] {
  return missions.filter((m) => m.difficulty === difficulty);
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  rarity: Rarity;
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: 'explore'; bodyId: string }
  | { type: 'explore_all'; bodyIds: string[] }
  | { type: 'mission_complete'; count: number }
  | { type: 'knowledge_unlock'; level: 'bronze' | 'silver' | 'gold'; count: number }
  | { type: 'time_travel'; days: number }
  | { type: 'eclipse_witness' };

export const achievements: Achievement[] = [
  {
    id: 'first_step',
    name: '第一步',
    description: '探索任意一个天体',
    icon: '👣',
    rarity: 'common',
    condition: { type: 'explore', bodyId: '*' },
  },
  {
    id: 'mars_pioneer',
    name: '火星先锋',
    description: '探索火星',
    icon: '🔴',
    rarity: 'common',
    condition: { type: 'explore', bodyId: 'mars' },
  },
  {
    id: 'saturn_rings',
    name: '光环巡礼',
    description: '探索土星及其壮丽的环系',
    icon: '🪐',
    rarity: 'common',
    condition: { type: 'explore', bodyId: 'saturn' },
  },
  {
    id: 'satellite_hunter',
    name: '卫星猎人',
    description: '探索3个以上的卫星',
    icon: '🛰️',
    rarity: 'rare',
    condition: {
      type: 'explore_all',
      bodyIds: [
        'moon',
        'io',
        'europa',
        'ganymede',
        'callisto',
        'titan',
        'enceladus',
        'titania',
        'triton',
        'phobos',
        'deimos',
      ],
    },
  },
  {
    id: 'outer_reaches',
    name: '外域探险家',
    description: '探索海王星、冥王星、阋神星、妊神星或鸟神星中的任意一个',
    icon: '❄️',
    rarity: 'rare',
    condition: {
      type: 'explore_all',
      bodyIds: ['neptune', 'pluto', 'eris', 'haumea', 'makemake'],
    },
  },
  {
    id: 'mission_rookie',
    name: '任务新兵',
    description: '完成3个任务',
    icon: '📋',
    rarity: 'common',
    condition: { type: 'mission_complete', count: 3 },
  },
  {
    id: 'mission_expert',
    name: '任务专家',
    description: '完成10个任务',
    icon: '🏆',
    rarity: 'epic',
    condition: { type: 'mission_complete', count: 10 },
  },
  {
    id: 'bronze_scholar',
    name: '青铜学者',
    description: '解锁5个青铜级知识',
    icon: '🥉',
    rarity: 'common',
    condition: { type: 'knowledge_unlock', level: 'bronze', count: 5 },
  },
  {
    id: 'silver_scholar',
    name: '白银学者',
    description: '解锁5个白银级知识',
    icon: '🥈',
    rarity: 'rare',
    condition: { type: 'knowledge_unlock', level: 'silver', count: 5 },
  },
  {
    id: 'gold_scholar',
    name: '黄金学者',
    description: '解锁3个黄金级知识',
    icon: '🥇',
    rarity: 'epic',
    condition: { type: 'knowledge_unlock', level: 'gold', count: 3 },
  },
  {
    id: 'time_traveler',
    name: '时间旅行者',
    description: '累计推进时间1000年',
    icon: '⏳',
    rarity: 'rare',
    condition: { type: 'time_travel', days: 365250 },
  },
  {
    id: 'eclipse_witness',
    name: '月食见证者',
    description: '见证一次月食',
    icon: '🌑',
    rarity: 'common',
    condition: { type: 'eclipse_witness' },
  },
  {
    id: 'solar_system_master',
    name: '太阳系大师',
    description: '探索全部8颗行星',
    icon: '👑',
    rarity: 'legendary',
    condition: {
      type: 'explore_all',
      bodyIds: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
    },
  },
  {
    id: 'prophet',
    name: '预言家',
    description: '预测行星位置误差小于15°',
    icon: '🔮',
    rarity: 'rare',
    condition: { type: 'explore', bodyId: '*' },
  },
  {
    id: 'space_explorer',
    name: '太空探险家',
    description: '查看过任意航天器的轨迹',
    icon: '🛰️',
    rarity: 'common',
    condition: { type: 'explore', bodyId: '*' },
  },
  {
    id: 'interdisciplinary',
    name: '跨界学者',
    description: '查看过跨学科连接',
    icon: '🔗',
    rarity: 'common',
    condition: { type: 'explore', bodyId: '*' },
  },
  {
    id: 'stargazer',
    name: '观星者',
    description: '查看过观测指南',
    icon: '🔭',
    rarity: 'common',
    condition: { type: 'explore', bodyId: '*' },
  },
  {
    id: 'scientist_vote',
    name: '小小科学家',
    description: '参与过科学争议投票',
    icon: '🗳️',
    rarity: 'common',
    condition: { type: 'explore', bodyId: '*' },
  },
  {
    id: 'black_hole_survivor',
    name: '黑洞幸存者',
    description: '成功逃离黑洞并学到一课',
    icon: '🕳️',
    rarity: 'epic',
    condition: { type: 'explore', bodyId: '*' },
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}

export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'common':
      return '#A5A5A5';
    case 'rare':
      return '#5B7CFF';
    case 'epic':
      return '#9B59B6';
    case 'legendary':
      return '#FDB813';
    default:
      return '#A5A5A5';
  }
}

export function getRarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'common':
      return '普通';
    case 'rare':
      return '稀有';
    case 'epic':
      return '史诗';
    case 'legendary':
      return '传说';
    default:
      return '普通';
  }
}

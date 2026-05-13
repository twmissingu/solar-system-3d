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
  | { type: 'explore_any'; bodyIds: string[] }
  | { type: 'mission_complete'; count: number }
  | { type: 'knowledge_unlock'; level: 'bronze' | 'silver' | 'gold'; count: number }
  | { type: 'time_travel'; days: number }
  | { type: 'eclipse_witness' }
  | { type: 'manual' };

export const achievements: Achievement[] = [
  {
    id: 'first_step',
    name: '第一步',
    description: '你迈出了探索宇宙的第一步——接下来想去哪里？',
    icon: '👣',
    rarity: 'common',
    condition: { type: 'explore', bodyId: '*' },
  },
  {
    id: 'mars_pioneer',
    name: '火星先锋',
    description: '火星曾经有水——你觉得，那些水去了哪里？',
    icon: '🔴',
    rarity: 'common',
    condition: { type: 'explore', bodyId: 'mars' },
  },
  {
    id: 'saturn_rings',
    name: '光环巡礼',
    description: '土星环可能正在消失——我们是否是幸运的见证者？',
    icon: '🪐',
    rarity: 'common',
    condition: { type: 'explore', bodyId: 'saturn' },
  },
  {
    id: 'satellite_hunter',
    name: '卫星猎人',
    description: '你发现了几颗卫星——为什么它们总是以同一面朝向母星？',
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
    description: '你来到了太阳系的边缘——这里还隐藏着多少秘密？',
    icon: '❄️',
    rarity: 'rare',
    condition: {
      type: 'explore_any',
      bodyIds: ['neptune', 'pluto', 'eris', 'haumea', 'makemake'],
    },
  },
  {
    id: 'mission_rookie',
    name: '任务新兵',
    description: '你完成了3个任务——如果让你设计一个探测任务，你会选择哪个天体？',
    icon: '📋',
    rarity: 'common',
    condition: { type: 'mission_complete', count: 3 },
  },
  {
    id: 'mission_expert',
    name: '任务专家',
    description: '你完成了10个任务——你的下一个探索目标是什么？',
    icon: '🏆',
    rarity: 'epic',
    condition: { type: 'mission_complete', count: 8 },
  },
  {
    id: 'bronze_scholar',
    name: '青铜学者',
    description: '你解锁了3个青铜级知识——知识越多，问题也就越多。你的下一个问题是什么？',
    icon: '🥉',
    rarity: 'common',
    condition: { type: 'knowledge_unlock', level: 'bronze', count: 3 },
  },
  {
    id: 'silver_scholar',
    name: '白银学者',
    description: '你解锁了5个白银级知识——科学中，答案往往只是新问题的开始。',
    icon: '🥈',
    rarity: 'rare',
    condition: { type: 'knowledge_unlock', level: 'silver', count: 5 },
  },
  {
    id: 'gold_scholar',
    name: '黄金学者',
    description: '你解锁了3个黄金级知识——但请记住，科学中没有永恒的真理，只有更好的问题。',
    icon: '🥇',
    rarity: 'epic',
    condition: { type: 'knowledge_unlock', level: 'gold', count: 3 },
  },
  {
    id: 'time_traveler',
    name: '时间旅行者',
    description: '你穿越了1000年——如果能让过去的天文学家看到今天的宇宙，他们会说什么？',
    icon: '⏳',
    rarity: 'rare',
    condition: { type: 'time_travel', days: 365250 },
  },
  {
    id: 'eclipse_witness',
    name: '月食见证者',
    description: '你见证了一次月食——如果当时没有地球大气层，月亮会是什么颜色？',
    icon: '🌑',
    rarity: 'common',
    condition: { type: 'eclipse_witness' },
  },
  {
    id: 'solar_system_master',
    name: '太阳系大师',
    description: '你探索了全部8颗行星——但你知道，99.86%的质量都在太阳里吗？',
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
    description: '你预测了行星的位置——如果古人也有这样的工具，天文学史会如何改写？',
    icon: '🔮',
    rarity: 'rare',
    condition: { type: 'manual' },
  },
  {
    id: 'space_explorer',
    name: '太空探险家',
    description: '你查看了一艘航天器的轨迹——如果是你，想驾驶它飞向哪里？',
    icon: '🛰️',
    rarity: 'common',
    condition: { type: 'manual' },
  },
  {
    id: 'interdisciplinary',
    name: '跨界学者',
    description: '你发现了不同学科的连接——天文学和你的生活还有什么联系？',
    icon: '🔗',
    rarity: 'common',
    condition: { type: 'manual' },
  },
  {
    id: 'stargazer',
    name: '观星者',
    description: '你读了观测指南——今晚，你想抬头看看哪颗星星？',
    icon: '🔭',
    rarity: 'common',
    condition: { type: 'manual' },
  },
  {
    id: 'scientist_vote',
    name: '小小科学家',
    description: '你参与了科学争议投票——科学的进步，正来自对不确定性的勇敢面对。',
    icon: '🗳️',
    rarity: 'common',
    condition: { type: 'explore', bodyId: '*' },
  },
  {
    id: 'black_hole_survivor',
    name: '黑洞幸存者',
    description: '你逃离了黑洞——但如果是超大质量黑洞，你在事件视界处可能安然无恙。为什么？',
    icon: '🕳️',
    rarity: 'epic',
    condition: { type: 'manual' },
  },
  {
    id: 'quiz_master',
    name: '答题达人',
    description: '你完成了全部测验——但如果让你出一道题，你会问什么？',
    icon: '📝',
    rarity: 'rare',
    condition: { type: 'manual' },
  },
  {
    id: 'eclipse_master',
    name: '月食专家',
    description: '你找到了月全食的条件——下一次真正的月全食是什么时候？',
    icon: '🌘',
    rarity: 'rare',
    condition: { type: 'manual' },
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

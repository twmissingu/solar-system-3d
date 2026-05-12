export interface Controversy {
  id: string;
  bodyId: string | null; // null = general
  question: string;
  description: string;
  options: { id: string; label: string }[];
  funFact: string;
}

export const controversies: Controversy[] = [
  {
    id: 'planet-nine',
    bodyId: null,
    question: '太阳系存在第九行星吗？',
    description:
      '科学家发现柯伊伯带天体的轨道似乎受到一个巨大天体的引力影响。这个"第九行星"可能有地球质量的5-10倍，距离太阳400-800 AU。但至今还没有直接观测到它。',
    options: [
      { id: 'yes', label: '存在！我们还没找到而已' },
      { id: 'no', label: '不存在，轨道异常有其他解释' },
      { id: 'maybe', label: '可能有，但质量没那么大' },
    ],
    funFact: '如果第九行星存在，它绕太阳一圈需要1-2万年！',
  },
  {
    id: 'jupiter-water',
    bodyId: 'jupiter',
    question: '木星内部有多少水？',
    description:
      '朱诺号探测器发现木星大气中的水含量比预期多。但木星内部（核心附近）到底有多少水仍是谜。这关系到木星是如何形成的。',
    options: [
      { id: 'lot', label: '很多，可能有地球海洋的10倍' },
      { id: 'little', label: '很少，大部分在形成时散失了' },
      { id: 'unknown', label: '目前无法确定' },
    ],
    funFact: '木星大气中的水以冰晶形式存在，而不是液态！',
  },
  {
    id: 'mars-life',
    bodyId: 'mars',
    question: '火星上曾经有过生命吗？',
    description:
      '火星车发现了有机分子和甲烷季节性变化。甲烷可能来自地质活动，也可能来自微生物。毅力号正在采集样本，计划2033年送回地球分析。',
    options: [
      { id: 'yes', label: '有过微生物生命' },
      { id: 'no', label: '从来没有' },
      { id: 'now', label: '现在还有！' },
    ],
    funFact: '火星南极冰盖下发现了液态水湖，这是生命的关键条件之一！',
  },
  {
    id: 'dark-matter',
    bodyId: null,
    question: '暗物质是什么？',
    description:
      '星系旋转的速度表明存在大量我们看不见的物质。它被称为"暗物质"，不发光、不反射光，但产生引力。科学家提出了多种假说：弱相互作用大质量粒子(WIMPs)、轴子(axions)、或者引力理论需要修正。',
    options: [
      { id: 'particle', label: '一种尚未发现的粒子' },
      { id: 'gravity', label: '引力理论需要修正' },
      { id: 'unknown', label: '我们完全不知道' },
    ],
    funFact: '暗物质约占宇宙总质量的27%，但我们对它几乎一无所知！',
  },
  {
    id: 'titan-life',
    bodyId: 'saturn',
    question: '土卫六泰坦上可能有生命吗？',
    description:
      '泰坦有浓厚的大气层、液态甲烷湖泊，还有复杂的有机化学反应。虽然温度极低(-180°C)，但一些科学家认为可能存在基于甲烷而非水的生命形式。',
    options: [
      { id: 'yes', label: '可能有甲烷基生命' },
      { id: 'no', label: '太冷了，不可能' },
      { id: 'maybe', label: '需要更多探测才能确定' },
    ],
    funFact: '泰坦是太阳系中除地球外唯一表面有液态湖泊的天体！',
  },
];

export function getControversiesForBody(bodyId: string): Controversy[] {
  return controversies.filter((c) => c.bodyId === bodyId || c.bodyId === null);
}

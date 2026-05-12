export interface NarrativeStep {
  id: string;
  text: string;
  speaker: string;
  action?: string;
  targetBodyId?: string;
}

export interface NarrativeMission {
  id: string;
  title: string;
  description: string;
  steps: NarrativeStep[];
  reward: string;
}

export const narrativeMissions: NarrativeMission[] = [
  {
    id: 'neptune-signal',
    title: '海王星的异常信号',
    description: '2045年，地球接收到来自海王星的神秘信号。作为太阳系探索员，你需要前往调查。',
    steps: [
      { id: 'n1', text: '【指挥中心】2045年3月14日，我们在海王星轨道附近检测到异常电磁波信号。频率与已知自然现象不符。', speaker: '指挥中心' },
      { id: 'n2', text: '【AI助手】分析完成。信号源位于海王星北极区域，强度正在增强。建议立即派遣探测器。', speaker: 'AI助手' },
      { id: 'n3', text: '【任务】前往海王星，定位信号源。点击海王星开始探索。', speaker: '任务', action: '点击海王星', targetBodyId: 'neptune' },
      { id: 'n4', text: '【AI助手】抵达海王星轨道。检测到磁场异常波动。海王星的磁场是太阳系中最复杂的，偏移了约47度。', speaker: 'AI助手' },
      { id: 'n5', text: '【AI助手】信号源确认为海王星大气层中的甲烷等离子体放电现象。这是首次观测到的现象！', speaker: 'AI助手' },
      { id: 'n6', text: '【指挥中心】任务完成！你的发现将帮助科学家理解冰巨星的内部结构。', speaker: '指挥中心' },
    ],
    reward: '信号解码者',
  },
  {
    id: 'save-earth',
    title: '拯救地球：小行星拦截',
    description: '一颗直径500米的小行星正在接近地球！你只有30天时间设计拦截轨道。',
    steps: [
      { id: 's1', text: '【指挥中心】警报！小行星2025-AB7将在30天后撞击地球。我们需要你的帮助！', speaker: '指挥中心' },
      { id: 's2', text: '【AI助手】计算完成。最佳方案：从地球发射拦截器，利用霍曼转移轨道在小行星与地球之间拦截。', speaker: 'AI助手' },
      { id: 's3', text: '【任务】打开"轨道设计器"，计算从地球到小行星轨道的霍曼转移时间。', speaker: '任务', action: '打开轨道设计器' },
      { id: 's4', text: '【AI助手】转移时间约259天...等等，小行星只有30天了！我们需要更快的方案。', speaker: 'AI助手' },
      { id: 's5', text: '【AI助手】替代方案：利用木星的引力弹弓加速。先飞往木星，再转向小行星。', speaker: 'AI助手' },
      { id: 's6', text: '【任务】点击木星，观察引力弹弓原理。', speaker: '任务', action: '点击木星', targetBodyId: 'jupiter' },
      { id: 's7', text: '【指挥中心】拦截器成功发射！利用木星引力弹弓，我们在第28天成功拦截了小行星。地球安全了！', speaker: '指挥中心' },
    ],
    reward: '地球守护者',
  },
  {
    id: 'new-home',
    title: '寻找新家园',
    description: '科学家在距离太阳1.2 AU处发现了一颗潜在宜居行星。评估它的宜居性。',
    steps: [
      { id: 'h1', text: '【指挥中心】开普勒望远镜发现了一颗位于1.2 AU的岩石行星。初步数据显示它可能有液态水。', speaker: '指挥中心' },
      { id: 'h2', text: '【AI助手】1.2 AU处于宜居带边缘。让我计算一下表面温度...', speaker: 'AI助手' },
      { id: 'h3', text: '【任务】打开"沙盘实验"，将地球轨道调整到1.2 AU，观察温度变化。', speaker: '任务', action: '打开沙盘实验' },
      { id: 'h4', text: '【AI助手】计算结果：表面温度约-10°C。虽然有液态水可能，但大部分表面会结冰。', speaker: 'AI助手' },
      { id: 'h5', text: '【AI助手】但如果行星有较厚的大气层（如金星），温室效应可能让温度升高到适宜范围。', speaker: 'AI助手' },
      { id: 'h6', text: '【指挥中心】任务完成！你的分析帮助天文学家确定了下一个探测目标。', speaker: '指挥中心' },
    ],
    reward: '星际移民官',
  },
];

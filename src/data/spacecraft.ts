export interface TrajectoryPoint {
  date: string;
  bodyId: string;
  event: string;
  angle: number;
  distanceAU: number;
}

export interface Spacecraft {
  id: string;
  name: string;
  nameZh: string;
  launchDate: string;
  missionType: string;
  description: string;
  trajectory: TrajectoryPoint[];
  keyDiscoveries: string[];
  status: 'active' | 'inactive';
  color: string;
}

export const spacecraftData: Spacecraft[] = [
  {
    id: 'voyager1',
    name: 'Voyager 1',
    nameZh: '旅行者1号',
    launchDate: '1977-09-05',
    missionType: '外行星探测 / 星际任务',
    description:
      '旅行者1号是美国宇航局发射的无人外太阳系空间探测器，是人类飞得最远的航天器。它于1977年发射，先后造访了木星和土星，并于2012年进入星际空间，至今仍在向地球传回数据。',
    trajectory: [
      { date: '1977-09-05', bodyId: 'earth', event: '从地球发射', angle: 0, distanceAU: 1.0 },
      { date: '1979-03-05', bodyId: 'jupiter', event: '飞越木星', angle: 45, distanceAU: 5.2 },
      { date: '1980-11-12', bodyId: 'saturn', event: '飞越土星', angle: 90, distanceAU: 9.5 },
      { date: '1990-02-14', bodyId: 'interstellar', event: '拍摄太阳系全家福', angle: 120, distanceAU: 40 },
      { date: '2012-08-25', bodyId: 'interstellar', event: '进入星际空间', angle: 150, distanceAU: 121 },
      { date: '2024-01-01', bodyId: 'interstellar', event: '距地球约240亿公里', angle: 180, distanceAU: 160 },
    ],
    keyDiscoveries: [
      '发现了木星的卫星木卫一上的活火山',
      '拍摄了木星大红斑的详细图像',
      '揭示了土星环的复杂结构',
      '首次进入星际空间并测量了星际介质',
    ],
    status: 'active',
    color: '#FFD700',
  },
  {
    id: 'voyager2',
    name: 'Voyager 2',
    nameZh: '旅行者2号',
    launchDate: '1977-08-20',
    missionType: '外行星探测 / 星际任务',
    description:
      '旅行者2号是唯一探访过太阳系四大气体巨行星（木星、土星、天王星、海王星）的航天器。它于1977年发射，完成了对四颗外行星的"大巡游"，并于2018年进入星际空间。',
    trajectory: [
      { date: '1977-08-20', bodyId: 'earth', event: '从地球发射', angle: 0, distanceAU: 1.0 },
      { date: '1979-07-09', bodyId: 'jupiter', event: '飞越木星', angle: 30, distanceAU: 5.2 },
      { date: '1981-08-25', bodyId: 'saturn', event: '飞越土星', angle: 60, distanceAU: 9.5 },
      { date: '1986-01-24', bodyId: 'uranus', event: '飞越天王星', angle: 90, distanceAU: 19.2 },
      { date: '1989-08-25', bodyId: 'neptune', event: '飞越海王星', angle: 120, distanceAU: 30.1 },
      { date: '2018-11-05', bodyId: 'interstellar', event: '进入星际空间', angle: 150, distanceAU: 119 },
    ],
    keyDiscoveries: [
      '发现了海王星的卫星海卫一上的冰火山',
      '揭示了天王星磁场的大幅倾斜',
      '拍摄了土星环的详细结构和间隙',
      '首次近距离观测了天王星的大气层',
    ],
    status: 'active',
    color: '#00FFFF',
  },
  {
    id: 'juno',
    name: 'Juno',
    nameZh: '朱诺号',
    launchDate: '2011-08-05',
    missionType: '木星轨道探测器',
    description:
      '朱诺号是美国宇航局发射的木星极地轨道探测器，旨在研究木星的组成、引力场、磁场和极地磁层。它是第一艘在木星极轨道上运行的航天器。',
    trajectory: [
      { date: '2011-08-05', bodyId: 'earth', event: '从地球发射', angle: 0, distanceAU: 1.0 },
      { date: '2013-10-09', bodyId: 'earth', event: '借助地球引力加速', angle: 180, distanceAU: 1.0 },
      { date: '2016-07-04', bodyId: 'jupiter', event: '进入木星极轨道', angle: 90, distanceAU: 5.2 },
    ],
    keyDiscoveries: [
      '揭示了木星大气中巨大的极地气旋',
      '发现木星的磁场比预期更复杂且不均匀',
      '测量了木星核心的大小和性质',
    ],
    status: 'active',
    color: '#FF4444',
  },
  {
    id: 'newhorizons',
    name: 'New Horizons',
    nameZh: '新视野号',
    launchDate: '2006-01-19',
    missionType: '冥王星 / 柯伊伯带探测',
    description:
      '新视野号是人类首个探访冥王星的航天器，也是有史以来发射速度最快的航天器。它于2006年发射，2015年飞掠冥王星，随后继续深入柯伊伯带，于2019年飞掠阿罗科斯。',
    trajectory: [
      { date: '2006-01-19', bodyId: 'earth', event: '从地球发射', angle: 0, distanceAU: 1.0 },
      { date: '2007-02-28', bodyId: 'jupiter', event: '木星引力辅助', angle: 30, distanceAU: 5.2 },
      { date: '2015-07-14', bodyId: 'pluto', event: '冥王星飞掠', angle: 75, distanceAU: 39.5 },
      { date: '2019-01-01', bodyId: 'arrokoth', event: '阿罗科斯飞掠', angle: 95, distanceAU: 44 },
    ],
    keyDiscoveries: [
      '首次拍摄冥王星高清表面图像',
      '发现了冥王星上的心形平原斯普尼克平原',
      '揭示了阿罗科斯的哑铃状接触双星结构',
      '确认了冥王星大气层的存在和组成',
    ],
    status: 'active',
    color: '#9B59B6',
  },
];

export function getSpacecraftById(id: string): Spacecraft | undefined {
  return spacecraftData.find((s) => s.id === id);
}

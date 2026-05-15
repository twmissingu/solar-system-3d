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
  // ── 国际深空探测器 ──
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
      '携带金唱片，载有人类文明的信息',
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
      '新视野号是人类首个探访冥王星的航天器，也是有史以来发射速度最快的航天器。它于2006年发射，2015年飞掠冥王星，随后继续深入柯伊伯带，于2019年飞掠小行星阿罗科斯。',
    trajectory: [
      { date: '2006-01-19', bodyId: 'earth', event: '从地球发射', angle: 0, distanceAU: 1.0 },
      { date: '2007-02-28', bodyId: 'jupiter', event: '木星引力辅助', angle: 30, distanceAU: 5.2 },
      { date: '2015-07-14', bodyId: 'pluto', event: '冥王星飞掠', angle: 75, distanceAU: 39.5 },
      { date: '2019-01-01', bodyId: 'arrokoth', event: '阿罗科斯飞掠', angle: 95, distanceAU: 44 },
    ],
    keyDiscoveries: [
      '首次拍摄冥王星高清表面图像',
      '发现了冥王星上的心形平原——斯普尼克平原',
      '揭示了阿罗科斯的哑铃状接触双星结构',
      '确认了冥王星大气层的存在和组成',
    ],
    status: 'active',
    color: '#9B59B6',
  },
  {
    id: 'cassini',
    name: 'Cassini-Huygens',
    nameZh: '卡西尼-惠更斯号',
    launchDate: '1997-10-15',
    missionType: '土星系统探测',
    description:
      '卡西尼-惠更斯号是美国宇航局、欧洲空间局和意大利航天局的国际合作项目。它花了7年时间飞抵土星，释放了惠更斯号探测器在土卫六（泰坦）表面着陆——这是人类在外太阳系天体上的首次软着陆。卡西尼围绕土星运行了13年直至2017年主动坠入土星大气，结束使命。',
    trajectory: [
      { date: '1997-10-15', bodyId: 'earth', event: '从地球发射', angle: 0, distanceAU: 1.0 },
      { date: '1998-04-26', bodyId: 'venus', event: '金星引力辅助', angle: 60, distanceAU: 0.72 },
      { date: '1999-06-24', bodyId: 'venus', event: '第二次金星引力辅助', angle: 120, distanceAU: 0.72 },
      { date: '2004-07-01', bodyId: 'saturn', event: '进入土星轨道', angle: 90, distanceAU: 9.5 },
      { date: '2005-01-14', bodyId: 'titan', event: '惠更斯号登陆土卫六', angle: 100, distanceAU: 9.5 },
      { date: '2017-09-15', bodyId: 'saturn', event: '主动坠入土星大气', angle: 180, distanceAU: 9.5 },
    ],
    keyDiscoveries: [
      '发现土卫二存在地下液态水海洋和冰喷泉',
      '惠更斯号在土卫六表面发现了液态甲烷湖泊',
      '揭示了土星环的精细结构和动态变化',
      '发现了土星的多颗新卫星',
    ],
    status: 'inactive',
    color: '#E67E22',
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    nameZh: '哈勃太空望远镜',
    launchDate: '1990-04-24',
    missionType: '空间天文台',
    description:
      '哈勃太空望远镜是人类历史上最重要的天文观测设备之一。它以埃德温·哈勃命名，在地球轨道上运行，避开了地球大气的干扰，提供了前所未有的清晰宇宙图像。哈勃的观测覆盖了从紫外到近红外的广阔波段，深刻改变了几乎所有天文学分支。',
    trajectory: [
      { date: '1990-04-24', bodyId: 'earth', event: '由发现号航天飞机部署入轨', angle: 0, distanceAU: 1.0 },
      { date: '1993-12-01', bodyId: 'earth', event: '首次维修任务，矫正主镜缺陷', angle: 45, distanceAU: 1.0 },
      { date: '2009-05-01', bodyId: 'earth', event: '最后一次维修升级', angle: 135, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '拍摄了哈勃深场——揭示数千个遥远星系',
      '精确测量了宇宙膨胀速度（哈勃常数）',
      '观测了超新星并证实宇宙加速膨胀（获2011年诺贝尔奖）',
      '直接拍摄了系外行星的图像',
    ],
    status: 'active',
    color: '#4169E1',
  },
  {
    id: 'perseverance',
    name: 'Perseverance & Ingenuity',
    nameZh: '毅力号与机智号',
    launchDate: '2020-07-30',
    missionType: '火星探测',
    description:
      '毅力号是美国宇航局发射的最先进的火星漫游车，搭载了数十种科学仪器，在火星杰泽罗陨石坑中寻找古生命迹象。它还携带了机智号——人类第一架在其他行星飞行的直升机。机智号成功完成了数十次飞行，证明了在火星稀薄大气中动力飞行的可行性。',
    trajectory: [
      { date: '2020-07-30', bodyId: 'earth', event: '从地球发射', angle: 0, distanceAU: 1.0 },
      { date: '2021-02-18', bodyId: 'mars', event: '火星着陆', angle: 45, distanceAU: 1.5 },
      { date: '2021-04-19', bodyId: 'mars', event: '机智号首次受控动力飞行', angle: 50, distanceAU: 1.5 },
    ],
    keyDiscoveries: [
      '在杰泽罗陨石坑发现了古代湖泊沉积岩证据',
      '机智号完成了人类在地球外的首次动力飞行',
      '收集了首批火星岩石样本等待未来返回地球',
      '探测了火星大气的氧气生成能力',
    ],
    status: 'active',
    color: '#E74C3C',
  },
  {
    id: 'iss',
    name: 'International Space Station',
    nameZh: '国际空间站',
    launchDate: '1998-11-20',
    missionType: '轨道实验室 / 国际合作',
    description:
      '国际空间站是人类建造过的最大的太空结构，由美国、俄罗斯、欧洲、日本和加拿大等15个国家合作建设。它在近地轨道上运行，自2000年以来持续有人驻守，是微重力科学实验、天文观测和技术测试的重要平台。',
    trajectory: [
      { date: '1998-11-20', bodyId: 'earth', event: '曙光号功能货舱发射', angle: 0, distanceAU: 1.0 },
      { date: '2000-11-02', bodyId: 'earth', event: '首批长期乘员进驻', angle: 45, distanceAU: 1.0 },
      { date: '2011-05-01', bodyId: 'earth', event: '主体建造基本完成', angle: 180, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '完成了数千项微重力科学实验',
      '研究了长期太空飞行对人体健康的影响',
      '测试了太空种植蔬菜和水的循环利用技术',
      '安装了大量天文观测和地球监测设备',
    ],
    status: 'active',
    color: '#3498DB',
  },

  // ── 中国航天器 ──
  {
    id: 'shenzhou5',
    name: 'Shenzhou-5',
    nameZh: '神舟五号',
    launchDate: '2003-10-15',
    missionType: '载人航天',
    description:
      '神舟五号是中国首次载人航天飞行任务，将航天员杨利伟送入太空并安全返回。这次飞行使中国成为继苏联和美国之后第三个独立将人送入太空的国家。杨利伟在太空中度过了21小时，绕地球飞行了14圈。',
    trajectory: [
      { date: '2003-10-15', bodyId: 'earth', event: '从酒泉卫星发射中心发射', angle: 0, distanceAU: 1.0 },
      { date: '2003-10-15', bodyId: 'earth', event: '进入轨道，杨利伟绕地球飞行', angle: 90, distanceAU: 1.0 },
      { date: '2003-10-16', bodyId: 'earth', event: '返回舱在内蒙古着陆', angle: 180, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '中国首次成功实施载人航天飞行',
      '验证了神舟飞船的生命支持系统',
      '实现了中国航天员首次太空体验',
    ],
    status: 'inactive',
    color: '#DC143C',
  },
  {
    id: 'tiangong',
    name: 'Tiangong Space Station',
    nameZh: '天宫空间站',
    launchDate: '2021-04-29',
    missionType: '空间站 / 轨道实验室',
    description:
      '天宫空间站是中国自主建造的模块化空间站。天和核心舱于2021年发射入轨，随后问天实验舱和梦天实验舱先后对接。天宫空间站在轨运行高度约400公里，设计寿命10年以上，支持长期驻留和大量科学实验。',
    trajectory: [
      { date: '2021-04-29', bodyId: 'earth', event: '天和核心舱发射', angle: 0, distanceAU: 1.0 },
      { date: '2022-07-24', bodyId: 'earth', event: '问天实验舱对接', angle: 60, distanceAU: 1.0 },
      { date: '2022-10-31', bodyId: 'earth', event: '梦天实验舱对接，T形基本建成', angle: 120, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '开展了数百项空间科学实（试）验',
      '实现了中国航天员长期在轨驻留',
      '完成了多项舱外活动和技术验证',
    ],
    status: 'active',
    color: '#FF4444',
  },
  {
    id: 'change1',
    name: "Chang'e-1",
    nameZh: '嫦娥一号',
    launchDate: '2007-10-24',
    missionType: '月球轨道探测',
    description:
      '嫦娥一号是中国首颗月球探测卫星，也是中国探月工程（嫦娥工程）的第一步。它成功进入月球轨道，对月球表面进行了全面测绘，获得了中国第一幅全月球影像图，并获取了月球表面的多种元素分布数据。',
    trajectory: [
      { date: '2007-10-24', bodyId: 'earth', event: '从西昌卫星发射中心发射', angle: 0, distanceAU: 1.0 },
      { date: '2007-11-05', bodyId: 'moon', event: '进入环月轨道', angle: 30, distanceAU: 1.0 },
      { date: '2009-03-01', bodyId: 'moon', event: '受控撞月结束使命', angle: 60, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '获得了中国首幅全月球影像图',
      '绘制了月球表面的元素分布图',
      '探测了月球周围的空间环境',
    ],
    status: 'inactive',
    color: '#FFD700',
  },
  {
    id: 'change2',
    name: "Chang'e-2",
    nameZh: '嫦娥二号',
    launchDate: '2010-10-01',
    missionType: '月球探测 / 小行星飞掠',
    description:
      '嫦娥二号是嫦娥一号的备份星改进型，以更高的分辨率对月球进行了测绘。完成任务后，它飞离月球，前往日地拉格朗日L2点，随后成功飞掠了小行星图塔蒂斯——成为首个探访小行星的中国航天器。',
    trajectory: [
      { date: '2010-10-01', bodyId: 'earth', event: '从西昌卫星发射中心发射', angle: 0, distanceAU: 1.0 },
      { date: '2010-10-06', bodyId: 'moon', event: '进入环月轨道，分辨率达7米', angle: 30, distanceAU: 1.0 },
      { date: '2011-06-09', bodyId: 'interstellar', event: '飞离月球前往L2点', angle: 90, distanceAU: 1.5 },
      { date: '2012-12-13', bodyId: 'interstellar', event: '飞越小行星图塔蒂斯', angle: 120, distanceAU: 2.3 },
    ],
    keyDiscoveries: [
      '获得了更高分辨率的全月球影像',
      '完成了中国首次小行星飞掠探测',
      '验证了从月球轨道飞往深空的技术',
    ],
    status: 'inactive',
    color: '#FFA500',
  },
  {
    id: 'change3',
    name: "Chang'e-3 & Yutu",
    nameZh: '嫦娥三号与玉兔号',
    launchDate: '2013-12-02',
    missionType: '月球软着陆 / 巡视探测',
    description:
      '嫦娥三号实现中国首次月球软着陆，携带了玉兔号月球车在月球表面巡视探测。这是1976年苏联月球24号之后第一个在月球软着陆的航天器。玉兔号在月面工作了约31个月，远超3个月的预期寿命。',
    trajectory: [
      { date: '2013-12-02', bodyId: 'earth', event: '从西昌卫星发射中心发射', angle: 0, distanceAU: 1.0 },
      { date: '2013-12-14', bodyId: 'moon', event: '在雨海地区软着陆', angle: 30, distanceAU: 1.0 },
      { date: '2013-12-15', bodyId: 'moon', event: '玉兔号驶离着陆器', angle: 35, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '实现了中国首次地外天体软着陆',
      '玉兔号发现了一种新的月球岩石类型',
      '用望远镜对月球上空的天体进行了紫外观测',
    ],
    status: 'inactive',
    color: '#FF6347',
  },
  {
    id: 'change4',
    name: "Chang'e-4 & Yutu-2",
    nameZh: '嫦娥四号与玉兔二号',
    launchDate: '2018-12-08',
    missionType: '月球背面软着陆 / 巡视探测',
    description:
      '嫦娥四号实现了人类历史上首次在月球背面软着陆。由于月球背面永远背对地球，任务使用了鹊桥号中继卫星传输信号。玉兔二号月球车至今仍在月面工作，是人类在月面工作时间最长的月球车。',
    trajectory: [
      { date: '2018-12-08', bodyId: 'earth', event: '从西昌卫星发射中心发射', angle: 0, distanceAU: 1.0 },
      { date: '2019-01-03', bodyId: 'moon', event: '在月球背面冯·卡门环形山着陆', angle: 30, distanceAU: 1.0 },
      { date: '2019-01-03', bodyId: 'moon', event: '玉兔二号驶上月面', angle: 35, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '人类首次在月球背面软着陆',
      '玉兔二号发现月背表面物质组成与正面不同',
      '在月背进行了低频射电天文观测（不受地球干扰）',
      '验证了棉花种子在月球生态系统中发芽',
    ],
    status: 'active',
    color: '#9370DB',
  },
  {
    id: 'change5',
    name: "Chang'e-5",
    nameZh: '嫦娥五号',
    launchDate: '2020-11-23',
    missionType: '月球采样返回',
    description:
      '嫦娥五号是中国首个无人月球采样返回任务，也是1976年以来人类首次从月球采集样本返回地球。它完成了月面钻取和表取两种采样方式，共带回1731克月球样本，对研究月球的形成和演化历史具有重要意义。',
    trajectory: [
      { date: '2020-11-23', bodyId: 'earth', event: '从文昌航天发射场发射', angle: 0, distanceAU: 1.0 },
      { date: '2020-12-01', bodyId: 'moon', event: '在风暴洋地区着陆', angle: 30, distanceAU: 1.0 },
      { date: '2020-12-03', bodyId: 'moon', event: '完成采样，上升器起飞', angle: 45, distanceAU: 1.0 },
      { date: '2020-12-17', bodyId: 'earth', event: '返回器在内蒙古着陆', angle: 90, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '1976年以来首次月球采样返回',
      '带回了1731克月球样本',
      '发现月球在约20亿年前仍有火山活动（比已知晚8亿年）',
    ],
    status: 'inactive',
    color: '#FFD700',
  },
  {
    id: 'change6',
    name: "Chang'e-6",
    nameZh: '嫦娥六号',
    launchDate: '2024-05-03',
    missionType: '月球背面采样返回',
    description:
      '嫦娥六号是人类历史上首次从月球背面采集样本并返回地球的任务。它在月球背面的南极-艾特肯盆地着陆采样，带回了约2千克月背样本。由于月背无法直接与地球通信，任务继续使用鹊桥二号中继卫星提供通信支持。',
    trajectory: [
      { date: '2024-05-03', bodyId: 'earth', event: '从文昌航天发射场发射', angle: 0, distanceAU: 1.0 },
      { date: '2024-06-02', bodyId: 'moon', event: '在月背南极-艾特肯盆地着陆', angle: 30, distanceAU: 1.0 },
      { date: '2024-06-25', bodyId: 'earth', event: '返回器携带样本着陆', angle: 90, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '人类首次月球背面采样返回',
      '获得了月背古老盆地的岩石样本',
      '为研究月球早期演化历史提供了关键证据',
    ],
    status: 'inactive',
    color: '#FF69B4',
  },
  {
    id: 'tianwen1',
    name: 'Tianwen-1 & Zhurong',
    nameZh: '天问一号与祝融号',
    launchDate: '2020-07-23',
    missionType: '火星探测（环绕+着陆+巡视）',
    description:
      '天问一号是中国首个独立火星探测任务，一次性实现了"环绕、着陆、巡视"三大目标——这是全球首次在一次火星任务中完成全部三个步骤。祝融号火星车在火星乌托邦平原着陆并工作了约一年，累计行驶了近2公里。',
    trajectory: [
      { date: '2020-07-23', bodyId: 'earth', event: '从文昌航天发射场发射', angle: 0, distanceAU: 1.0 },
      { date: '2021-02-10', bodyId: 'mars', event: '进入环火轨道', angle: 60, distanceAU: 1.5 },
      { date: '2021-05-15', bodyId: 'mars', event: '祝融号在乌托邦平原着陆', angle: 90, distanceAU: 1.5 },
    ],
    keyDiscoveries: [
      '中国首次成功着陆火星',
      '一次任务完成环绕、着陆、巡视三大目标（全球首次）',
      '祝融号发现火星表面近期水活动迹象',
      '绘制了火星全球遥感影像图',
    ],
    status: 'active',
    color: '#E74C3C',
  },
  {
    id: 'queqiao',
    name: 'Queqiao',
    nameZh: '鹊桥号中继卫星',
    launchDate: '2018-05-21',
    missionType: '月球中继通信',
    description:
      '鹊桥号是中国发射的月球中继通信卫星，部署在地月L2拉格朗日点附近的晕轮轨道上。它的主要任务是为嫦娥四号在月球背面的着陆和探测提供地球与月背之间的通信中继服务。这是人类第一颗专门用于地月通信中继的卫星。',
    trajectory: [
      { date: '2018-05-21', bodyId: 'earth', event: '从西昌卫星发射中心发射', angle: 0, distanceAU: 1.0 },
      { date: '2018-06-14', bodyId: 'moon', event: '进入地月L2点晕轮轨道', angle: 45, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '人类首颗地月通信中继卫星',
      '支持了人类首次月球背面着陆任务',
      '验证了地月L2点晕轮轨道的长期运行技术',
    ],
    status: 'active',
    color: '#FFB6C1',
  },
  {
    id: 'xihe',
    name: 'Xihe',
    nameZh: '羲和号太阳探测卫星',
    launchDate: '2021-10-14',
    missionType: '太阳观测',
    description:
      '羲和号是中国首颗太阳探测科学技术试验卫星，运行在距离地面约517公里的太阳同步轨道上。它搭载了太阳Hα成像光谱仪，可以同时获得太阳光球和色球的高精度光谱和图像，用于研究太阳爆发活动的物理机制。',
    trajectory: [
      { date: '2021-10-14', bodyId: 'earth', event: '从太原卫星发射中心发射', angle: 0, distanceAU: 1.0 },
      { date: '2022-01-01', bodyId: 'earth', event: '开始在轨科学观测', angle: 45, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '获得了中国首幅太阳Hα波段光谱图像',
      '观测了太阳耀斑爆发和日冕物质抛射',
      '实现了对太阳大气多层结构的同步观测',
    ],
    status: 'active',
    color: '#FF8C00',
  },
  {
    id: 'einstein-probe',
    name: 'Einstein Probe',
    nameZh: '爱因斯坦探针',
    launchDate: '2024-01-09',
    missionType: 'X射线天文观测',
    description:
      '爱因斯坦探针是中国科学院主导的X射线天文卫星，搭载了宽视场X射线望远镜（龙虾眼光学）。它以前所未有的灵敏度和视场监测宇宙中的暂现源和爆发天体，包括超新星、伽马射线暴、潮汐瓦解事件和引力波对应体等。',
    trajectory: [
      { date: '2024-01-09', bodyId: 'earth', event: '从西昌卫星发射中心发射', angle: 0, distanceAU: 1.0 },
      { date: '2024-02-01', bodyId: 'earth', event: '进入距地面约600公里的轨道', angle: 30, distanceAU: 1.0 },
    ],
    keyDiscoveries: [
      '发现了多例新的X射线暂现源',
      '监测到了伽马射线暴的X射线余晖',
      '对黑洞潮汐瓦解恒星事件进行了快速响应观测',
    ],
    status: 'active',
    color: '#00CED1',
  },
];

export function getSpacecraftById(id: string): Spacecraft | undefined {
  return spacecraftData.find((s) => s.id === id);
}

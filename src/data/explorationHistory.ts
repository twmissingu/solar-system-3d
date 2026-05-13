export type ExplorationEra = 'ancient' | 'telescope' | 'space-race' | 'deep-space' | 'future';

export interface ExplorationMilestone {
  id: string;
  year: number;
  era: ExplorationEra;
  title: string;
  titleEn: string;
  description: string;
  significance: string;
  icon: string;
  relatedScientists?: string[];
  relatedSpacecraft?: string[];
  relatedBodies?: string[];
  cameraTarget?: { bodyId: string; distance: number };
  highlightAchievement?: string;
  funFact?: string;
  controversyNote?: string;
  searchKeyword?: string;
}

export const explorationMilestones: ExplorationMilestone[] = [
  // ===== 远古之眼 =====
  {
    id: 'babylonian-records',
    year: -1800,
    era: 'ancient',
    title: '巴比伦天文记录',
    titleEn: 'Babylonian Astronomical Records',
    description:
      '古巴比伦人将天文知识系统化，记录了金星出没的周期，建立了黄道十二宫体系。泥板文献《阿米萨杜卡金星表》记载了金星21年的完整运行轨迹，是人类最早的系统天文观测记录之一。',
    significance:
      '巴比伦人的天文观测传统开创了用数学规律描述天体运动的先河，黄道十二宫体系至今仍是天文学的基本坐标框架。',
    icon: '🏛️',
    relatedBodies: ['venus'],
    funFact: '巴比伦人将一天分为12个"双小时"（每个等于我们现在的2小时），并将一年分为12个朔望月。这个60进制体系影响了我们今天的时间计量。',
    searchKeyword: '巴比伦天文 黄道十二宫 金星表',
  },
  {
    id: 'gan-shi-star-catalog',
    year: -400,
    era: 'ancient',
    title: '甘德与石申编制星表',
    titleEn: 'Gan De & Shi Shen Star Catalog',
    description:
      '中国战国时期天文学家甘德和石申分别编制了星表，记录了约800颗恒星的位置。甘德还用肉眼发现了木星的一颗卫星，比伽利略的发现早了近两千年。他们也是最早记录哈雷彗星回归的天文学家之一。',
    significance:
      '甘德石申星表是世界上最古老的星表之一，比希腊喜帕恰斯星表早约200年，证明了中国古代天文学的独立发展脉络。',
    icon: '⭐',
    relatedScientists: ['gande-shen'],
    relatedBodies: ['jupiter'],
    funFact: '1970年代，国际天文学联合会以甘德和石申的名字命名了月球背面的环形山，以纪念这两位古代天文学家。',
    searchKeyword: '甘德 石申 星表 战国天文学',
  },
  {
    id: 'aristarchus-heliocentric',
    year: -270,
    era: 'ancient',
    title: '阿里斯塔克提出日心说',
    titleEn: 'Aristarchus Proposes Heliocentrism',
    description:
      '古希腊天文学家阿里斯塔克首次提出日心说，认为太阳位于宇宙中心，地球和其他行星绕太阳公转。他还通过几何方法估算了太阳和月球的大小与距离——虽然数值偏小，但方法本身是正确的。',
    significance:
      '阿里斯塔克的日心说比哥白尼早约1800年，但未被当时的人接受。这个故事生动说明了科学理论不仅需要正确，还需要足够证据才能被广泛接受。',
    icon: '☀️',
    relatedBodies: ['sun', 'moon'],
    funFact: '阿里斯塔克还发明了一种计算日地距离的几何方法，利用上弦月时日地月形成的直角三角形。虽然受限于观测精度，但他的思路完全正确。',
    searchKeyword: '阿里斯塔克 日心说 古希腊天文学',
  },
  {
    id: 'ptolemy-almagest',
    year: 150,
    era: 'ancient',
    title: '托勒密《天文学大成》',
    titleEn: "Ptolemy's Almagest",
    description:
      '古希腊天文学家托勒密编纂了《天文学大成》（Almagest），系统总结了古希腊天文学的成就。他提出了以地球为中心、行星在"本轮"上运行的宇宙模型。这部著作成为此后1400多年西方天文学的权威教材。',
    significance:
      '托勒密的地心说是科学史上最持久（近1500年）但最终被证伪的理论。它提醒我们：即便权威理论也终将被新证据修正，这正是科学精神的本质。',
    icon: '📜',
    searchKeyword: '托勒密 天文学大成 地心说',
  },
  {
    id: 'su-song-celestial-globe',
    year: 1090,
    era: 'ancient',
    title: '苏颂建造水运仪象台',
    titleEn: 'Su Song’s Astronomical Clock Tower',
    description:
      '北宋科学家苏颂主持建造了水运仪象台，集浑仪、浑象和报时装置于一体，由水力驱动。这是世界上最早的天文钟，也是人类第一次用机械装置模拟天体运行。',
    significance:
      '水运仪象台代表了中世纪前人类机械设计和天文观测的最高水平，比欧洲同类装置早了两个世纪。',
    icon: '🕰️',
    relatedScientists: ['zhang-heng'],
    funFact: '苏颂的水运仪象台高约11米，分三层：上层观测星象，中间演示天球运转，下层自动报时。每到一个时辰（2小时），就会有木偶人出来敲钟击鼓。',
    searchKeyword: '苏颂 水运仪象台 天文钟',
  },
  {
    id: 'ulugh-beg-observatory',
    year: 1420,
    era: 'ancient',
    title: '兀鲁伯天文台',
    titleEn: "Ulugh Beg's Observatory",
    description:
      '帖木儿帝国的天文学家兀鲁伯在撒马尔罕建造了当时世界上最大的天文台。他编制的《兀鲁伯星表》包含了1018颗恒星的精确位置，误差仅有几角分，是望远镜发明前最精确的星表。',
    significance:
      '在文艺复兴之前的最后一缕光芒中，兀鲁伯的星表精度达到了肉眼观测的极限。直至望远镜发明后的200年，它的数据仍在被欧洲天文学家使用。',
    icon: '🕌',
    searchKeyword: '兀鲁伯 撒马尔罕天文台 星表',
  },

  // ===== 望远镜革命 =====
  {
    id: 'galileo-telescope',
    year: 1609,
    era: 'telescope',
    title: '伽利略将望远镜指向天空',
    titleEn: 'Galileo Turns Telescope to the Sky',
    description:
      '伽利略·伽利莱自己磨制了约20倍放大率的望远镜，首次将其对准夜空。他发现了月球表面的环形山和山脉、木星的四颗大卫星（以他名字命名"伽利略卫星"）、金星的盈亏相位变化，以及银河由无数恒星组成。',
    significance:
      '这些发现彻底动摇了地心说的根基。金星的盈亏变化证明它绕太阳公转，木星的卫星则证明并非所有天体都绕地球转——日心说的观测证据终于到齐了。',
    icon: '🔭',
    relatedBodies: ['moon', 'jupiter', 'venus'],
    funFact: '伽利略把他的望远镜描述为"一个可以看到物体放大约九倍的装置"，但直到他改进到20倍后才敢去看天空。他最初以为木星卫星是固定不动的恒星，连续观测几晚才发现它们在移动。',
    searchKeyword: '伽利略 望远镜 木星卫星 金星相位',
  },
  {
    id: 'kepler-laws',
    year: 1609,
    era: 'telescope',
    title: '开普勒提出行星运动三定律',
    titleEn: "Kepler's Laws of Planetary Motion",
    description:
      '约翰内斯·开普勒基于第谷·布拉赫的精确观测数据，先后提出了行星运动三定律：（一）行星沿椭圆轨道运行，太阳位于一个焦点；（二）相等时间扫过相等面积；（三）轨道周期的平方与半长轴的立方成正比。',
    significance:
      '开普勒定律第一次用精确的数学方程描述了行星运动，打破了"天体必须是完美圆形轨道"的古老教条。它们是牛顿万有引力定律的基础，至今仍是轨道计算的基石。',
    icon: '📐',
    funFact: '开普勒最初坚信完美圆形轨道，经过70多次计算失败后才最终接受椭圆轨道。他感叹道："我打破了一切障碍，推开了一切灰尘，终于看到了最光辉的真理。"',
    searchKeyword: '开普勒三定律 椭圆轨道 天体力学',
  },
  {
    id: 'huygens-saturn-rings',
    year: 1655,
    era: 'telescope',
    title: '惠更斯发现土星环和土卫六',
    titleEn: 'Huygens Discovers Saturn’s Rings & Titan',
    description:
      '克里斯蒂安·惠更斯用自制的改进型望远镜发现了土星周围有环环绕（此前伽利略看到但误以为是"耳朵"），并发现了土星最大的卫星土卫六（泰坦）。他还发明了摆钟，为精确计时作出了贡献。',
    significance:
      '土星环的发现扩展了人们对太阳系结构的认知——原来行星可以有如此壮观而复杂的附属结构。土卫六至今仍是太阳系中除地球外唯一有浓厚大气层的卫星。',
    icon: '💍',
    relatedBodies: ['saturn', 'titan'],
    searchKeyword: '惠更斯 土星环 泰坦 土卫六',
  },
  {
    id: 'herschel-uranus',
    year: 1781,
    era: 'telescope',
    title: '赫歇尔发现天王星',
    titleEn: 'Herschel Discovers Uranus',
    description:
      '威廉·赫歇尔在用自制的望远镜巡天观测时，发现了一个"不像恒星"的移动天体。最初他以为是一颗彗星，但计算轨道后发现它是一颗新行星——天王星，这是人类历史上第一次"发现"一颗行星（此前的水、金、火、木、土自古已知）。',
    significance:
      '天王星的发现使已知太阳系的半径扩大了一倍，第一次向人类展示了"想象之外还有未知"的宇宙尺度。赫歇尔还发现了天王星的卫星和红外线。',
    icon: '🪐',
    relatedBodies: ['uranus'],
    funFact: '赫歇尔最初想将这颗新行星命名为"乔治之星"以纪念英王乔治三世，但欧洲大陆的天文学家拒绝使用这个名字。最终"天王星"（乌拉诺斯）这个名称被普遍接受。作为感谢，乔治三世给了赫歇尔一份年薪200英镑的津贴。',
    searchKeyword: '威廉赫歇尔 天王星发现 巡天观测',
  },
  {
    id: 'levering-neptune',
    year: 1846,
    era: 'telescope',
    title: '勒维耶与加勒发现海王星',
    titleEn: 'Le Verrier & Galle Discover Neptune',
    description:
      '法国天文学家于尔班·勒维耶和英国天文学家约翰·库奇·亚当斯独立计算了天王星轨道异常的来源，预测了一颗新行星的位置。勒维耶将计算结果寄给柏林天文台的约翰·加勒，加勒在收到信的当晚就观测到了海王星。',
    significance:
      '海王星的发现是"笔尖上的发现"——用牛顿力学从纸面计算中预言了未知天体的存在和位置。这是牛顿万有引力定律最辉煌的验证之一，也是理论物理学的胜利。',
    icon: '✏️',
    relatedBodies: ['neptune'],
    funFact: '关于谁先发现了海王星——勒维耶还是亚当斯——引发了英法两国之间激烈的优先权争论。今天科学界普遍认可两人独立作出了贡献。勒维耶的计算误差不到1度，加勒说"那封信上的位置与真实位置的偏差甚至比望远镜视野直径还小"！',
    controversyNote: '勒维耶和亚当斯谁先完成计算存在长期争议，这是科学史上著名的优先权之争。今天普遍认可两人独立发现。',
    searchKeyword: '勒维耶 亚当斯 海王星发现 笔尖上的发现',
  },
  {
    id: 'maria-mitchell-comet',
    year: 1847,
    era: 'telescope',
    title: '玛丽亚·米切尔发现新彗星',
    titleEn: 'Maria Mitchell Discovers a Comet',
    description:
      '29岁的玛丽亚·米切尔用望远镜发现了一颗新彗星，被命名为"米切尔彗星"。她因此获得丹麦国王颁发的金奖章，成为美国第一位女性职业天文学家，后来毕生致力于推动女性接受科学教育。',
    significance:
      '米切尔的成就打破了"女性不能搞科学"的偏见。在美国，她激励了整整一代女性通过科学参与对宇宙的探索。',
    icon: '☄️',
    relatedScientists: ['maria-mitchell'],
    searchKeyword: '玛丽亚米切尔 彗星 女性天文学家',
  },
  {
    id: 'slipher-galaxy-redshift',
    year: 1912,
    era: 'telescope',
    title: '斯莱弗发现星系红移',
    titleEn: 'Slipher Discovers Galactic Redshift',
    description:
      '美国天文学家维斯托·斯莱弗在洛厄尔天文台测量了"旋涡星云"的光谱，发现大多数星云的光谱线都向红端偏移——这意味着它们在远离我们。他的观测为哈勃后来的宇宙膨胀发现奠定了关键基础。',
    significance:
      '斯莱弗的数据是宇宙膨胀的第一个观测线索。他测量了40多个星系的红移，发现其中36个在远离我们——但当时他并不知道这意味着什么。',
    icon: '🔴',
    relatedScientists: ['henrietta-leavitt'],
    funFact: '斯莱弗拍摄一条光谱需要曝光40到80个小时，常常需要连续观测几个晚上。他说："有时候我真希望这些星云能停下来等我。"',
    searchKeyword: '斯莱弗 星系红移 光谱观测',
  },
  {
    id: 'leavitt-period-luminosity',
    year: 1912,
    era: 'telescope',
    title: '勒维特发现造父变星周光关系',
    titleEn: 'Leavitt’s Period-Luminosity Relation',
    description:
      '亨丽爱塔·勒维特在哈佛大学天文台担任"计算员"时，通过研究小麦哲伦云中的造父变星，发现了其光变周期与固有亮度之间的正比关系——即"周光关系"。这一发现使天文学家能够首次精确测量遥远天体甚至星系的距离。',
    significance:
      '勒维特的发现被称为"测量宇宙的标尺"。哈勃正是利用她的方法测量了造父变星的距离，证明仙女座星云在银河系之外，并发现了宇宙膨胀。没有她的工作，人类要到宇宙的距离认知可能推迟数十年。',
    icon: '💫',
    relatedScientists: ['henrietta-leavitt'],
    searchKeyword: '勒维特 造父变星 周光关系 宇宙标尺',
  },
  {
    id: 'einstein-relativity',
    year: 1915,
    era: 'telescope',
    title: '爱因斯坦发表广义相对论',
    titleEn: "Einstein's General Relativity",
    description:
      '阿尔伯特·爱因斯坦发表了广义相对论，将引力描述为时空弯曲的几何效应。1919年，亚瑟·爱丁顿在日全食观测中证实了光线被太阳引力偏折的预言，使爱因斯坦一夜成名。',
    significance:
      '广义相对论是现代天文学的三大理论支柱之一（另两个是量子力学和核物理）。它预言了黑洞、引力透镜、引力波等至今仍在深刻影响天文学的现象。GPS卫星必须修正广义相对论效应才能准确定位。',
    icon: '⚡',
    relatedBodies: ['sun'],
    funFact: '当被问及"如果爱丁顿的观测否定了你的理论你会怎么办"时，爱因斯坦回答："那我只能为亲爱的上帝感到遗憾了。理论是正确的。"',
    searchKeyword: '爱因斯坦 广义相对论 引力 时空弯曲',
  },

  // ===== 太空竞赛 =====
  {
    id: 'sputnik',
    year: 1957,
    era: 'space-race',
    title: '斯普特尼克1号：第一颗人造卫星',
    titleEn: 'Sputnik 1: First Artificial Satellite',
    description:
      '苏联发射了斯普特尼克1号，这是人类历史上第一颗人造地球卫星。它是一个直径58厘米的铝球，携带了两个无线电发射器，在轨道上运行了21天。斯普特尼克的发射触发了美苏之间的太空竞赛。',
    significance:
      '斯普特尼克1号标志着人类太空时代的开始。它证明人造物体可以进入轨道环绕地球，为后续所有的航天探索（包括星际探测）铺平了道路。',
    icon: '📡',
    relatedBodies: ['earth'],
    funFact: '斯普特尼克1号的无线电信号频率为20.005 MHz和40.002 MHz，世界各地的业余无线电爱好者都能收听到它发出的"哔哔"声。一位美国参议员称这是"人类历史上最具深远意义的单次事件"。',
    searchKeyword: '斯普特尼克1号 人造卫星 太空竞赛',
  },
  {
    id: 'luna3-moon-far-side',
    year: 1959,
    era: 'space-race',
    title: '月球3号拍摄月球背面',
    titleEn: 'Luna 3 Photographs the Lunar Far Side',
    description:
      '苏联的月球3号探测器绕过月球，拍摄了人类从未见过的月球背面照片。由于月球被潮汐锁定，背面永远不朝向地球。这些照片虽然分辨率很低，但揭示了月球背面布满环形山、几乎没有"月海"（暗色平原）的惊人面貌。',
    significance:
      '这是人类第一次看到被"隐藏"的月球背面，证明了航天探测可以超越地面观测的极限，获得全新的科学认知。',
    icon: '🌑',
    relatedBodies: ['moon'],
    searchKeyword: '月球3号 月球背面 潮汐锁定',
  },
  {
    id: 'mariner2-venus',
    year: 1962,
    era: 'space-race',
    title: '水手2号飞越金星',
    titleEn: 'Mariner 2 Flies By Venus',
    description:
      '美国的水手2号成功飞越金星，是人类第一个成功的行星际探测器。它发现金星表面温度高达约465°C，大气层主要成分为二氧化碳，并没有之前天文学家幻想的"丛林世界"。这给科幻文学中对金星的浪漫想象画上了句号。',
    significance:
      '水手2号开启了行星实地探测的时代。它用实际测量代替了地面望远镜的推测，证明了"眼见未必为实"——天文观测需要多种手段交叉验证。',
    icon: '🌡️',
    relatedBodies: ['venus'],
    searchKeyword: '水手2号 金星探测 行星际探测器',
  },
  {
    id: 'mariner4-mars',
    year: 1965,
    era: 'space-race',
    title: '水手4号拍摄火星表面',
    titleEn: 'Mariner 4 Photographs Mars',
    description:
      '美国的水手4号飞越火星，传回了22张粗糙但具有历史意义的火星表面照片。这些照片显示火星是一个布满陨石坑的荒凉世界，没有运河、没有植被、没有智慧生命的痕迹。',
    significance:
      '水手4号终结了"火星运河"的幻想。19世纪末天文学家珀西瓦尔·洛厄尔声称看到的"火星运河"被证明是视觉错觉——但这也是科学自我修正的经典案例。',
    icon: '🔴',
    relatedBodies: ['mars'],
    funFact: '水手4号的数据传输速率仅为每秒8.33比特。一张640×640像素的照片需要8小时以上才能传回地球。',
    controversyNote: '"火星运河"在19世纪末至20世纪初被广泛接受，但后来被证明是光学错觉和人为想象。这个案例生动说明了科学假说需要重复验证。',
    searchKeyword: '水手4号 火星探测 火星运河',
  },
  {
    id: 'apollo11',
    year: 1969,
    era: 'space-race',
    title: '阿波罗11号：人类登上月球',
    titleEn: 'Apollo 11: First Moon Landing',
    description:
      '美国宇航员尼尔·阿姆斯特朗和巴兹·奥尔德林乘坐阿波罗11号登月舱"鹰"号降落在月球静海。阿姆斯特朗踏上月球表面的第一句话："这是个人的一小步，却是人类的一大步。"他们在月球表面活动了约2.5小时，采集了21.6公斤月岩样本。',
    significance:
      '阿波罗11号是迄今为止人类离开地球最远的一次实地旅行。月球样本的分析彻底改变了人类对月球起源和太阳系早期历史的认知，确立了"大碰撞假说"的主流地位。',
    icon: '🌙',
    relatedBodies: ['moon'],
    funFact: '阿姆斯特朗和奥尔德林在月球上留下了一个纪念盘，上面刻着："来自行星地球的人类首次在此踏上月球，公元1969年7月，我们为全人类和平而来。"',
    searchKeyword: '阿波罗11号 登月 阿姆斯特朗 月岩',
  },
  {
    id: 'venera7-venus-landing',
    year: 1970,
    era: 'space-race',
    title: '金星7号首次在金星软着陆',
    titleEn: 'Venera 7: First Landing on Venus',
    description:
      '苏联的金星7号探测器成功降落在金星表面，成为第一个在另一颗行星表面软着陆的探测器。它工作了23分钟，传回了金星表面温度约475°C、大气压约90倍地球的信息——环境之恶劣远超此前猜想。',
    significance:
      '金星7号的数据揭示了金星地狱般的真实环境，说明外星世界可能远比人类想象的更加极端。这提醒我们，关于系外行星宜居性的预测需要更多实际数据。',
    icon: '🔥',
    relatedBodies: ['venus'],
    funFact: '金星7号设计耐压为180个大气压，实际着陆时承受了约90个大气压。如果设计余量不足，这个探测器可能根本传不回数据。苏联的工程设计以"皮实耐用"著称。',
    searchKeyword: '金星7号 金星着陆 金星表面',
  },
  {
    id: 'pioneer10',
    year: 1972,
    era: 'space-race',
    title: '先驱者10号穿越小行星带',
    titleEn: 'Pioneer 10 Crosses the Asteroid Belt',
    description:
      '美国发射的先驱者10号是第一个穿越小行星带并飞越木星的探测器。它于1973年抵达木星，传回了木星大红斑和极区的第一张特写照片。它携带了一块刻有人类信息的金属铭牌，供潜在的宇宙文明解读。',
    significance:
      '先驱者10号证明了航天器可以安全穿越小行星带（此前天文学家担心小行星带太密集会摧毁探测器），开辟了外太阳系探索之路。',
    icon: '🚀',
    relatedBodies: ['jupiter'],
    relatedSpacecraft: [],
    funFact: '先驱者10号携带的铭牌上刻画了一男一女的形象、太阳系的位置（以14颗脉冲星为坐标）、以及氢原子的超精细跃迁作为时间尺度基准。这一设计由卡尔·萨根和弗兰克·德雷克构思。',
    searchKeyword: '先驱者10号 木星探测 先驱者铭牌',
  },

  // ===== 深空时代 =====
  {
    id: 'voyager-grand-tour',
    year: 1977,
    era: 'deep-space',
    title: '旅行者号：太阳系大巡游',
    titleEn: 'Voyager Grand Tour',
    description:
      '旅行者2号（8月20日）和旅行者1号（9月5日）先后发射，利用了176年一遇的罕见行星排列（木星、土星、天王星、海王星大致位于太阳同一侧），借助引力弹弓效应实现"一箭四星"的大巡游。旅行者1号探访了木星和土星后向银河系深处飞去；旅行者2号是唯一探访过全部四大外行星的航天器。',
    significance:
      '旅行者任务是人类最具雄心的一次太阳系探测计划。它们发现木卫一有活火山、土卫六有浓厚大气、天王星磁场严重倾斜、海王星有超音速风暴——每个新发现都在改写教科书。',
    icon: '🛸',
    relatedSpacecraft: ['voyager1', 'voyager2'],
    relatedBodies: ['jupiter', 'saturn', 'uranus', 'neptune'],
    funFact: '1990年2月14日，旅行者1号在距地球约60亿公里处回望，拍摄了著名的"暗淡蓝点"照片——地球在宇宙中只是一个0.12像素的微小光点。卡尔·萨根写道："再看看那个光点吧。那是这里，那是家园，那是我们。"',
    highlightAchievement: 'outer_reaches',
    searchKeyword: '旅行者号 暗淡蓝点 大巡游 引力弹弓',
  },
  {
    id: 'hubble-launch',
    year: 1990,
    era: 'deep-space',
    title: '哈勃太空望远镜发射',
    titleEn: 'Hubble Space Telescope Launch',
    description:
      '发现号航天飞机将哈勃太空望远镜送入轨道。这是人类第一座大型空间天文台，不受大气层干扰，能看到地面上无法看到的宇宙。虽然发射后发现主镜有球差（磨错了形状），但1993年的维修任务矫正了这个问题，此后哈勃传回了无数里程碑式的图像。',
    significance:
      '哈勃望远镜极大拓展了人类的宇宙视野。它拍摄了宇宙诞生后仅几亿年的星系、证明了黑洞普遍存在于星系中心、精确测量了宇宙膨胀速率（哈勃常数），还直接见证了一颗超新星的爆发。',
    icon: '🔭',
    relatedBodies: [],
    funFact: '哈勃的主镜误差只有2.3微米——只有头发直径的1/50，但对于光学望远镜来说就是灾难。矫正镜片后，哈勃的性能甚至比原设计还好。',
    searchKeyword: '哈勃太空望远镜 镜面误差 宇宙年龄',
  },
  {
    id: 'pathfinder-mars',
    year: 1997,
    era: 'deep-space',
    title: '火星探路者与索杰纳号',
    titleEn: 'Mars Pathfinder & Sojourner Rover',
    description:
      '美国宇航局的火星探路者号成功着陆火星，释放了世界上第一辆火星车——索杰纳号。它只有微波炉大小，工作了83个火星日，分析了火星岩石成分。全球数百万人通过NASA网站实时跟踪了这一任务，这是互联网时代第一次大规模共享太空探索。',
    significance:
      '探路者开创了"更快、更省、更好"的探测器设计理念，证明了微型火星车可以完成有价值的科学考察。它的大气层进入方案（气囊缓冲着陆）被后续任务沿用。',
    icon: '🛞',
    relatedBodies: ['mars'],
    funFact: '索杰纳号以美国民权活动家索杰纳·特鲁斯命名，是女性、黑人科技贡献的象征。它的最高速度为1厘米/秒——比一只蜗牛还慢。',
    searchKeyword: '火星探路者 索杰纳号 火星车',
  },
  {
    id: 'iss',
    year: 1998,
    era: 'deep-space',
    title: '国际空间站开始建设',
    titleEn: 'International Space Station Assembly',
    description:
      '国际空间站（ISS）的第一个组件"曙光号"功能货舱由俄罗斯发射升空，开启了人类历史上最大的国际科学合作项目。此后来自美国、俄罗斯、欧洲、日本、加拿大等16个国家的宇航员持续驻留，在微重力下进行了数千项科学实验。',
    significance:
      'ISS是人类目前在太空中唯一的长期有人驻留设施。它在微重力下的生物、物理和医学实验为未来深空载人任务（登月、登火）提供了关键数据。',
    icon: '🛰️',
    relatedBodies: ['earth'],
    funFact: 'ISS以约7.66公里/秒的速度运行，每90分钟绕地球一圈。宇航员一天可以看到16次日出和日落。',
    searchKeyword: '国际空间站 微重力实验 太空合作',
  },
  {
    id: 'cassini-huygens',
    year: 2004,
    era: 'deep-space',
    title: '卡西尼-惠更斯号到达土星',
    titleEn: 'Cassini-Huygens Reaches Saturn',
    description:
      '卡西尼-惠更斯号（NASA/ESA/ASI合作）在经历7年飞行后进入土星轨道。2005年，惠更斯探测器在土卫六（泰坦）表面着陆，这是人类在外太阳系最远的一次着陆。卡西尼在土星工作了13年，发现了土卫二的冰喷泉、土卫六的液态甲烷海洋等惊人发现。',
    significance:
      '卡西尼-惠更斯彻底改变了我们对土星系统的认知。土卫二冰喷泉的发现意味着外太阳系可能存在生命——液态水海洋就在冰壳之下。',
    icon: '💧',
    relatedBodies: ['saturn', 'titan', 'enceladus'],
    searchKeyword: '卡西尼惠更斯 土星 泰坦 土卫二 生命',
  },
  {
    id: 'new-horizons-pluto',
    year: 2015,
    era: 'deep-space',
    title: '新视野号飞越冥王星',
    titleEn: 'New Horizons Flies By Pluto',
    description:
      '水星号发射9年半后，新视野号以超过5万公里的时速飞越冥王星，传回了人类第一张冥王星高清图像。冥王星表面有巨大的心形平原（斯普尼克平原）、高达数公里的冰山、稀薄但复杂的氮气大气层——它远不是人们此前以为的死寂冰球。',
    significance:
      '新视野号完成了太阳系"经典九大行星"的第一次（也是最后一次）全面探测。它告诉我们：即使距离太阳近60亿公里，那里仍然是一个动态、复杂的世界。',
    icon: '❤️',
    relatedSpacecraft: ['newhorizons'],
    relatedBodies: ['pluto'],
    funFact: '新视野号飞越冥王星时，以约14公里/秒的速度掠过——如果撞上一粒沙子大小的碎片，就足以让它瞬间报废。但幸运的是它安全通过了。2019年它又飞越了柯伊伯带天体阿罗科斯。',
    highlightAchievement: 'outer_reaches',
    searchKeyword: '新视野号 冥王星 心形平原 柯伊伯带',
  },
  {
    id: 'juno-jupiter',
    year: 2016,
    era: 'deep-space',
    title: '朱诺号进入木星极轨道',
    titleEn: 'Juno Enters Jupiter’s Polar Orbit',
    description:
      '朱诺号成功进入木星极轨道，成为第一个从两极研究木星的探测器。它发现木星两极有巨大的气旋风暴阵列、内部磁场远比预期复杂、核心可能是一个弥散的"模糊"结构而非致密球体。',
    significance:
      '朱诺号正在改写木星的内部结构模型。理解木星的形成对理解整个太阳系的形成至关重要——因为木星是太阳系中最大的行星，它的引力主导了早期太阳系的演化。',
    icon: '🌀',
    relatedSpacecraft: ['juno'],
    relatedBodies: ['jupiter'],
    searchKeyword: '朱诺号 木星极轨道 木星内部 大红斑',
  },
  {
    id: 'webb-launch',
    year: 2021,
    era: 'deep-space',
    title: '詹姆斯·韦伯太空望远镜发射',
    titleEn: 'James Webb Space Telescope Launch',
    description:
      '历经25年研发和约100亿美元投入的詹姆斯·韦伯太空望远镜发射升空，经过1个月飞行抵达距地球150万公里的日地拉格朗日L2点。韦伯的6.5米主镜由18块镀金铍镜组成，在太空中展开折叠结构——这是有史以来最复杂的在轨部署。',
    significance:
      '韦伯望远镜能够探测宇宙第一批星系的光（红移到可见光变为红外线），观测系外行星的大气成分，研究恒星的诞生过程。它代表了人类建造的最强大的空间望远镜。',
    icon: '✨',
    relatedBodies: [],
    funFact: '韦伯望远镜的遮阳罩有五层，每层和人的头发一样薄，但可以阻挡相当于太阳镜SPF 1,000,000的防晒效果。它在太空中需要展开29天，有344个"单点故障"环节——任何一个失败就可能导致任务失败。',
    searchKeyword: '韦伯望远镜 拉格朗日L2点 宇宙第一缕光 系外行星大气',
  },
  {
    id: 'tianwen-1-mars',
    year: 2021,
    era: 'deep-space',
    title: '天问一号：中国首次火星探测',
    titleEn: 'Tianwen-1: China’s First Mars Mission',
    description:
      '中国的天问一号探测器成功到达火星，一次性完成了"环绕、着陆、巡视"三大目标——这是人类历史上首次在一次火星任务中同时实现这三步。祝融号火星车在乌托邦平原开展工作，分析火星表面物质组成和气象特征。',
    significance:
      '天问一号代表了中国深空探测能力的重大跃升。一次任务完成三步的难度极高，此前没有任何国家尝试过。这标志着火星探测进入了多国参与的新阶段。',
    icon: '🇨🇳',
    relatedBodies: ['mars'],
    funFact: '祝融号以中国神话中的火神命名。它的设计寿命为90个火星日，实际工作了超过300个火星日。',
    searchKeyword: '天问一号 祝融号 火星探测 中国航天',
  },

  // ===== 未来征程 =====
  {
    id: 'artemis-moon',
    year: 2025,
    era: 'future',
    title: '阿尔忒弥斯计划重返月球',
    titleEn: 'Artemis Program: Returning to the Moon',
    description:
      '美国宇航局的阿尔忒弥斯计划旨在将首位女性和下一位男性送上月球南极，并在月球建立长期可持续存在。与阿波罗不同，阿尔忒弥斯的最终目标是验证在月球上建立基地的技术，为载人火星任务做准备。',
    significance:
      '阿尔忒弥斯不是简单的"再登一次月"，而是一个长期战略。在月球上获取水资源（极区永久阴影区的水冰）、测试就地资源利用、拓展人类太空活动范围——这些都是火星任务的前置步骤。',
    icon: '👩‍🚀',
    relatedBodies: ['moon'],
    searchKeyword: '阿尔忒弥斯计划 重返月球 月球南极 水冰',
  },
  {
    id: 'europa-clipper',
    year: 2030,
    era: 'future',
    title: '欧罗巴快船：寻找木卫二生命',
    titleEn: 'Europa Clipper: Searching for Life',
    description:
      '美国宇航局的欧罗巴快船任务计划在2030年抵达木星系统，对木卫二（欧罗巴）进行详细探测。它将携带雷达穿透冰层、测量冰壳厚度、分析喷出物质成分，以评估欧罗巴冰下海洋是否具备生命条件。',
    significance:
      '欧罗巴被科学家认为是太阳系中最有希望找到地外生命的地方之一。如果快船探测到冰下海洋中有机化学迹象，这可能成为21世纪最重大的科学发现。',
    icon: '🧊',
    relatedBodies: ['europa'],
    searchKeyword: '欧罗巴快船 木卫二 冰下海洋 地外生命',
  },
  {
    id: 'mars-sample-return',
    year: 2033,
    era: 'future',
    title: '火星样本返回任务',
    titleEn: 'Mars Sample Return Mission',
    description:
      'NASA和ESA正在联合规划火星样本返回任务，计划将毅力号火星车已收集的火星岩石和土壤样本送回地球。这将是人类从另一个行星带回样本的第一次，也是史上最复杂的机器人航天任务之一。',
    significance:
      '火星样本返回是科学界的最高优先任务之一。在地球实验室中，科学家能用地球上最精密的仪器分析火星岩石——寻找生命痕迹的敏感度远高于在火星上的任何自动驾驶仪器。',
    icon: '🧪',
    relatedBodies: ['mars'],
    searchKeyword: '火星样本返回 毅力号 火星岩石 地外生命',
  },
];

export function getMilestonesByEra(era: ExplorationEra): ExplorationMilestone[] {
  return explorationMilestones.filter((m) => m.era === era);
}

export function getMilestoneById(id: string): ExplorationMilestone | undefined {
  return explorationMilestones.find((m) => m.id === id);
}

export function getRelatedMilestones(bodyId: string): ExplorationMilestone[] {
  return explorationMilestones.filter((m) => m.relatedBodies?.includes(bodyId));
}

export const eraConfig: Record<ExplorationEra, { label: string; years: string; description: string }> = {
  ancient: {
    label: '远古之眼',
    years: '公元前—1609年',
    description: '从巴比伦观星者到伊斯兰天文台，人类用肉眼窥探宇宙',
  },
  telescope: {
    label: '望远镜革命',
    years: '1609—1957年',
    description: '从伽利略到帕洛玛天文台，光学仪器揭开了宇宙的新维度',
  },
  'space-race': {
    label: '太空竞赛',
    years: '1957—1990年',
    description: '从斯普特尼克到旅行者，冷战角力意外推动了太阳系的第一次全面踏勘',
  },
  'deep-space': {
    label: '深空时代',
    years: '1990年—至今',
    description: '国际合作、新一代望远镜和火星车，探索广度与深度空前的时代',
  },
  future: {
    label: '未来征程',
    years: '展望',
    description: '从月球基地到火星样本，人类正为下一代飞跃做准备',
  },
};

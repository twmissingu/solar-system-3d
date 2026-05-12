export type Subject = 'geography' | 'physics' | 'history' | 'chemistry' | 'biology';

export interface SubjectConnection {
  subject: Subject;
  subjectName: string;
  icon: string; // emoji
  color: string;
  connections: string[]; // Chinese text explaining the connection
}

export interface BodyInterdisciplinary {
  bodyId: string;
  subjects: SubjectConnection[];
}

const interdisciplinaryData: BodyInterdisciplinary[] = [
  {
    bodyId: 'earth',
    subjects: [
      {
        subject: 'geography',
        subjectName: '地理学',
        icon: '🌍',
        color: '#4ECDC4',
        connections: [
          '地球自转轴倾角23.5°导致了四季更替，是气候带形成的基础',
          '不同纬度接收到的太阳辐射量不同，形成了热带、温带和寒带',
          '地球板块运动塑造了山脉、海沟和火山等地貌特征',
        ],
      },
      {
        subject: 'physics',
        subjectName: '物理学',
        icon: '⚛️',
        color: '#5B7CFF',
        connections: [
          '地球引力将大气层和水牢牢束缚在表面，形成宜居环境',
          '开普勒定律精确描述了地球绕太阳公转的椭圆轨道',
          '地球磁场保护生命免受太阳风和宇宙射线的伤害',
        ],
      },
      {
        subject: 'biology',
        subjectName: '生物学',
        icon: '🧬',
        color: '#2ECC71',
        connections: [
          '液态水的存在是地球生命起源和繁衍的关键条件',
          '适宜的温度范围使得碳基生命能够在地表大量繁衍',
          '大气中的氧气是复杂多细胞生物演化的重要推动力',
        ],
      },
    ],
  },
  {
    bodyId: 'moon',
    subjects: [
      {
        subject: 'physics',
        subjectName: '物理学',
        icon: '⚛️',
        color: '#5B7CFF',
        connections: [
          '月球引力是地球潮汐现象的主要驱动力，每天引起两次涨潮',
          '月球反射太阳光照亮夜空，满月时的亮度约为太阳的四十万分之一',
          '潮汐锁定使月球始终以同一面朝向地球，这是引力长期作用的结果',
        ],
      },
      {
        subject: 'history',
        subjectName: '历史学',
        icon: '📜',
        color: '#E67E22',
        connections: [
          '中国古代使用阴历（农历），以月相周期为基础安排农事',
          '1969年阿波罗11号登月是人类历史上最伟大的探险之一',
          '月食和日食在古代被视为重要天象，常被记录于史书之中',
        ],
      },
      {
        subject: 'geography',
        subjectName: '地理学',
        icon: '🌍',
        color: '#4ECDC4',
        connections: [
          '潮汐作用影响海洋生态系统和海岸线的形态演变',
          '月球引力稳定了地球自转轴的倾角，使气候长期保持稳定',
          '月球的引力影响地壳应力，可能与某些地震活动存在关联',
        ],
      },
    ],
  },
  {
    bodyId: 'sun',
    subjects: [
      {
        subject: 'physics',
        subjectName: '物理学',
        icon: '⚛️',
        color: '#5B7CFF',
        connections: [
          '太阳核心每秒将400万吨质量转化为能量，遵循E=mc²',
          '核聚变产生的高温等离子体通过电磁辐射向太空传递能量',
          '太阳磁场活动形成黑子、耀斑和日冕物质抛射等现象',
        ],
      },
      {
        subject: 'chemistry',
        subjectName: '化学',
        icon: '⚗️',
        color: '#9B59B6',
        connections: [
          '太阳是宇宙中重元素的主要"熔炉"，通过核聚变合成碳、氧等元素',
          '光谱分析显示太阳大气中含有氢、氦、铁、钙、钠等多种元素',
          '太阳风携带的高能粒子与行星大气发生化学反应，影响大气成分',
        ],
      },
      {
        subject: 'biology',
        subjectName: '生物学',
        icon: '🧬',
        color: '#2ECC71',
        connections: [
          '阳光是地球光合作用的能量来源，支撑着整个食物链',
          '紫外线促使人体合成维生素D，但过量会损伤DNA',
          '生物钟的节律与地球昼夜交替直接相关，而昼夜交替源于自转和阳光',
        ],
      },
    ],
  },
  {
    bodyId: 'mars',
    subjects: [
      {
        subject: 'geography',
        subjectName: '地理学',
        icon: '🌍',
        color: '#4ECDC4',
        connections: [
          '奥林帕斯山是太阳系最高的火山，高度约21公里',
          '水手号峡谷长达4000公里，是火星地壳拉伸断裂形成的巨大裂谷',
          '火星极地冰盖由水冰和干冰组成，随季节变化而消长',
        ],
      },
      {
        subject: 'chemistry',
        subjectName: '化学',
        icon: '⚗️',
        color: '#9B59B6',
        connections: [
          '火星表面的红色来自氧化铁（铁锈），说明过去曾有液态水和氧气',
          '大气中95%是二氧化碳，导致难以保留热量',
          '火星土壤中含有高氯酸盐，对未来农业种植既是挑战也是资源',
        ],
      },
      {
        subject: 'biology',
        subjectName: '生物学',
        icon: '🧬',
        color: '#2ECC71',
        connections: [
          '科学家在火星陨石中发现了有机分子，暗示可能存在过生命',
          '毅力号火星车正在采集岩石样本，寻找古代微生物生命的痕迹',
          '地下卤水可能是现存微生物的潜在栖息地',
        ],
      },
    ],
  },
  {
    bodyId: 'jupiter',
    subjects: [
      {
        subject: 'physics',
        subjectName: '物理学',
        icon: '⚛️',
        color: '#5B7CFF',
        connections: [
          '木星磁场是地球磁场的14倍强，能捕获大量带电粒子形成辐射带',
          '木星内部可能是金属氢构成的流体，产生发电机效应形成磁场',
          '木星引力像"太阳系吸尘器"，偏转了许多可能撞击内行星的小天体',
        ],
      },
      {
        subject: 'chemistry',
        subjectName: '化学',
        icon: '⚗️',
        color: '#9B59B6',
        connections: [
          '木星大气主要由氢和氦组成，与太阳的成分非常相似',
          '大气层中的氨和甲烷形成了多彩的云带和巨大的风暴系统',
          '大红斑是一个持续了数百年的巨大反气旋风暴，化学成分至今未完全弄清',
        ],
      },
    ],
  },
  {
    bodyId: 'saturn',
    subjects: [
      {
        subject: 'physics',
        subjectName: '物理学',
        icon: '⚛️',
        color: '#5B7CFF',
        connections: [
          '土星光环由无数冰块和岩石碎片组成，通过引力共振维持稳定结构',
          '卡西尼缝是土卫一与光环粒子轨道共振清出的空隙',
          '土星密度比水还小，如果有足够大的海洋，它能漂浮起来',
        ],
      },
      {
        subject: 'chemistry',
        subjectName: '化学',
        icon: '⚗️',
        color: '#9B59B6',
        connections: [
          '光环中的冰块含有水、氨和有机化合物，是太阳系早期的"时间胶囊"',
          '土星大气中的氦正在缓慢下沉，导致外层氢氦比例与太阳不同',
          '土卫六泰坦拥有浓厚的大气层，存在复杂的有机化学反应',
        ],
      },
    ],
  },
  {
    bodyId: 'venus',
    subjects: [
      {
        subject: 'chemistry',
        subjectName: '化学',
        icon: '⚗️',
        color: '#9B59B6',
        connections: [
          '金星大气中96%是二氧化碳，产生极端的温室效应',
          '大气层中的硫酸云滴具有强腐蚀性，能溶解金属',
          '失控的温室效应使金星表面温度高达462°C，是太阳系最热的行星',
        ],
      },
      {
        subject: 'geography',
        subjectName: '地理学',
        icon: '🌍',
        color: '#4ECDC4',
        connections: [
          '金星表面遍布火山平原，可能有至今仍在活动的火山',
          '浓厚的大气层产生巨大的气压，相当于地球海洋900米深处的压力',
          '逆向自转使太阳从西边升起，这是太阳系中独一无二的现象',
        ],
      },
    ],
  },
  {
    bodyId: 'mercury',
    subjects: [
      {
        subject: 'physics',
        subjectName: '物理学',
        icon: '⚛️',
        color: '#5B7CFF',
        connections: [
          '水星昼夜温差超过600°C，是太阳系温差最大的行星',
          '3:2的自转-公转共振使水星的一"天"等于两个"年"',
          '水星轨道近日点的进动是验证广义相对论的经典证据之一',
        ],
      },
      {
        subject: 'geography',
        subjectName: '地理学',
        icon: '🌍',
        color: '#4ECDC4',
        connections: [
          '水星几乎没有大气层，无法保持热量或阻挡陨石撞击',
          '极地陨石坑底部永久处于阴影中，可能存在水冰沉积',
          '表面布满陨石坑，与月球相似，是太阳系早期猛烈轰炸的见证',
        ],
      },
    ],
  },
  {
    bodyId: 'uranus',
    subjects: [
      {
        subject: 'physics',
        subjectName: '物理学',
        icon: '⚛️',
        color: '#5B7CFF',
        connections: [
          '天王星自转轴倾角达98°，几乎是"躺着"绕太阳公转',
          '极端的轴倾角导致每个极区有长达42年的连续白天或黑夜',
          '天王星磁场轴与自转轴夹角约59°，倾斜的磁场结构至今是个谜',
        ],
      },
      {
        subject: 'chemistry',
        subjectName: '化学',
        icon: '⚗️',
        color: '#9B59B6',
        connections: [
          '天王星大气中的甲烷吸收了红光，使行星呈现蓝绿色',
          '内部可能含有水、甲烷和氨的"冰"，因此被称为冰巨星',
          '大气中检测到硫化氢，闻起来像臭鸡蛋的味道',
        ],
      },
    ],
  },
  {
    bodyId: 'neptune',
    subjects: [
      {
        subject: 'physics',
        subjectName: '物理学',
        icon: '⚛️',
        color: '#5B7CFF',
        connections: [
          '海王星拥有太阳系中最强的风暴，风速可达2100公里/小时',
          '其强大的引力帮助维持了柯伊伯带的结构，并影响着冥王星的轨道',
          '海卫一的逆行轨道暗示它曾是被捕获的柯伊伯带天体',
        ],
      },
      {
        subject: 'chemistry',
        subjectName: '化学',
        icon: '⚗️',
        color: '#9B59B6',
        connections: [
          '海王星大气中甲烷含量更高，因此颜色比天王星更深蓝',
          '内部高温高压环境下可能存在钻石雨现象',
          '大气成分与天王星相似，但活动更剧烈，化学成分分布更复杂',
        ],
      },
    ],
  },
];

export function getInterdisciplinaryForBody(bodyId: string): BodyInterdisciplinary | undefined {
  return interdisciplinaryData.find((d) => d.bodyId === bodyId);
}

export type KnowledgeLevel = 'bronze' | 'silver' | 'gold';

export interface FollowUpItem {
  id: string;
  question: string;
  answer: string;
  nextId: string | null;
}

export interface KnowledgeLevelData {
  title: string;
  content: string;
  funFact: string;
  unlockRequirement: string | null; // achievement ID required, null = unlocked
}

export interface KnowledgeItemV2 {
  id: string;
  targetBody: string | null;
  levels: Record<KnowledgeLevel, KnowledgeLevelData>;
  followUpChain: FollowUpItem[];
}

export const knowledgeDataV2: KnowledgeItemV2[] = [
  {
    id: 'seasons',
    targetBody: 'Earth',
    levels: {
      bronze: {
        title: '地球为什么会有四季？',
        content:
          '地球在绕太阳公转时，地轴倾斜了大约23.5度。这就像你拿着一个手电筒照射一个歪着的球：当北半球歪向太阳时，阳光更集中、更暖和，就是夏天；当北半球歪向远离太阳的方向时，阳光斜斜地照过来、比较分散，就是冬天。南半球的季节正好相反！地球公转一圈需要365天，所以一年有四季更替。',
        funFact: '你知道吗？水星几乎没有四季，因为它的自转轴倾角只有约0.03度，而且公转太快啦！',
        unlockRequirement: null,
      },
      silver: {
        title: '四季形成的深层机制',
        content:
          '四季的本质是太阳直射点在地球表面南北移动。由于地轴倾斜23.5°，太阳赤纬（declination）在一年中从+23.5°（夏至）变化到-23.5°（冬至），春秋分时为0°。直射点处单位面积接收的太阳辐射功率最大，斜射时辐射被分散到更大面积，且大气层路径更长、吸收更多。这就是不同纬度季节差异的物理根源。',
        funFact: '火星的轴倾角约为25.2°，也有四季，但由于轨道偏心率大，南半球冬季比北半球更冷更短。',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '米兰科维奇循环与长期气候',
        content:
          '地球轨道存在三种周期性变化：偏心率（约10万年周期）、地轴倾角（约4.1万年周期）和岁差（约2.6万年周期），合称米兰科维奇循环。这些参数共同决定了高纬度地区夏季的太阳辐射量，进而驱动冰期-间冰期的旋回。例如，当北半球夏季处于远日点且倾角较小时，高纬度冰雪难以融化，冰期便可能降临。',
        funFact: '由于岁差，约1.2万年后织女星（Vega）将成为新的北极星，而不是现在的勾陈一。',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      {
        id: 'why-tilt',
        question: '为什么地轴会倾斜23.5度？',
        answer:
          '科学家普遍认为，这是约45亿年前一颗名为“忒伊亚”（Theia）的原行星与原始地球发生巨大碰撞的结果。这次撞击不仅使地轴倾斜，还抛出了大量物质，最终形成了月球。',
        nextId: 'theia',
      },
      {
        id: 'theia',
        question: '忒伊亚撞击对地球还有什么影响？',
        answer:
          '除了产生月球和倾斜地轴，这次撞击还使地球自转速度显著加快（早期一天可能只有6小时），并可能帮助形成了地球的铁核，增强了磁场保护。',
        nextId: 'moon-formation',
      },
      {
        id: 'moon-formation',
        question: '月球形成后如何影响地球？',
        answer:
          '月球的存在稳定了地轴倾角（现在只在22.1°到24.5°之间小幅摆动），使地球气候长期稳定。同时，月球引力引起的潮汐对海洋生物进化、板块运动和地球自转减速都有深远影响。',
        nextId: null,
      },
    ],
  },
  {
    id: 'moon-phases',
    targetBody: 'Moon',
    levels: {
      bronze: {
        title: '月亮为什么每天看起来不一样？',
        content:
          '月球自己不会发光，它像一面大镜子反射太阳的光。月球围绕地球公转，大约27.3天转一圈。我们在地球上看，有时候看到它被太阳照亮的正面（满月），有时候只看到一点点亮边（新月或弯月），有时候完全藏在地球的影子里（月食）。这就是月相变化！',
        funFact: '你看到的月亮总是同一面！因为月球自转和公转周期相同，这叫“潮汐锁定”。',
        unlockRequirement: null,
      },
      silver: {
        title: '月相的数学规律',
        content:
          '月相周期（朔望月）约为29.53天，而月球真正的公转周期（恒星月）约为27.32天。两者的差异是因为地球也在绕太阳公转——月球需要多走一段距离才能重新对准日地连线。月相变化遵循严格的几何关系：从地球上看，太阳与月球的黄经差决定了照亮可见面的比例。满月时两者相差180°，新月时几乎重合。',
        funFact: '中国传统农历就是以朔望月为基础制定的，每月初一为朔（新月），十五为望（满月）。',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '潮汐锁定的物理机制',
        content:
          '潮汐锁定是引力潮汐摩擦的长期结果。地球对月球的引力在靠近侧和远离侧产生差异（潮汐隆起），月球内部的摩擦会耗散这部分形变能，使其自转逐渐减慢，直到自转周期与公转周期同步。同样的过程也在地球上发生：月球引力使地球自转每世纪减慢约1.7毫秒，日长因此越来越长。',
        funFact: '冥王星和它的卫星卡戎（Charon）是“相互潮汐锁定”的——它们永远只以同一面朝向对方，像一对永恒的舞伴。',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      {
        id: 'why-tidal-lock',
        question: '所有行星的卫星都会被潮汐锁定吗？',
        answer:
          '理论上，只要时间足够长，几乎所有近距离运行的卫星都会被母行星潮汐锁定。太阳系中，木卫一、木卫二、土卫六等主要卫星都已被潮汐锁定。距离较远或轨道偏心率大的卫星可能需要更长时间。',
        nextId: 'tidal-friction',
      },
      {
        id: 'tidal-friction',
        question: '潮汐摩擦会让月球最终撞上地球吗？',
        answer:
          '恰恰相反！潮汐摩擦导致地月系统的角动量从地球自转向月球轨道转移，月球正以每年约3.8厘米的速度远离地球。数十亿年后，地球的一天将和月球公转周期同步（约47天）。',
        nextId: null,
      },
    ],
  },
  {
    id: 'jupiter-red-spot',
    targetBody: 'Jupiter',
    levels: {
      bronze: {
        title: '木星上的“大红斑”是什么？',
        content:
          '木星的大红斑是一个超级巨大的风暴！它已经吹了至少350年了——比你的爷爷的爷爷的爷爷……还要早得多！这个风暴大到可以装下整个地球。它的颜色来自木星大气中的化学物质，在不同的光照条件下，颜色也会发生变化，有时是深红色，有时偏橙色。',
        funFact: '木星转得特别快，一天只有约10小时！所以大红斑虽然在缩小，但短期内还不会消失。',
        unlockRequirement: null,
      },
      silver: {
        title: '大红斑：一个反气旋风暴的解剖',
        content:
          '大红斑本质上是一个巨大的反气旋（高压系统），位于木星南纬22°附近。其顶部云层温度约-150°C，但深处的热源可能来自木星内部余热。风暴内部存在复杂的有机分子（如红磷化合物），可能是其红色的来源。近几十年的观测表明，大红斑正在以每年约900公里的速度缩小，从19世纪的4万公里宽度降到了如今的约1.5万公里。',
        funFact: '朱诺号探测器发现木星上至少还有12个类似的大大小小的风暴，包括几个白色的“ oval ”风暴，它们也曾合并和变化。',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '大红斑与深层射流的卡西尼关系',
        content:
          '卡西尼定律描述了天体自转轴、轨道面和拉普拉斯平面之间的关系。对木星而言，其深层内部存在与表面不同的差速旋转（differential rotation）。朱诺号的引力场测量揭示，大红斑可能向下延伸到数百公里深处，与深层的东向射流（eastward jet）存在动力学耦合。这些射流的能量来源可能与木星内部的热对流和科里奥利力有关。',
        funFact: '木星内部释放的热量比它从太阳接收的还多！这些余热主要来自形成时的收缩，驱动了大气中包括大红斑在内的所有风暴系统。',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      {
        id: 'why-so-long',
        question: '大红斑为什么能持续数百年？',
        answer:
          '木星没有固体表面，大气摩擦损耗远小于地球。同时，木星内部持续释放的巨大热量为大气运动提供了源源不断的能量，使风暴得以长期维持。此外，周围的大气环流结构也起到了“围护”作用。',
        nextId: 'jupiter-interior',
      },
      {
        id: 'jupiter-interior',
        question: '木星内部到底是什么样子？',
        answer:
          '木星可能有一个由岩石和冰组成的致密核心，质量约为地球的10-20倍。核心外是液态金属氢层，在这里氢呈现出导电的液态金属特性，产生了木星强大的磁场（比地球强14倍）。再向外是液态分子氢层，最外层才是我们观察到的大气。',
        nextId: null,
      },
    ],
  },
  {
    id: 'saturn-rings',
    targetBody: 'Saturn',
    levels: {
      bronze: {
        title: '土星为什么戴着漂亮的“项链”？',
        content:
          '土星的光环其实是由无数块冰块和岩石组成的，它们就像微小的“小月亮”，围绕着土星旋转。这些碎片有的只有沙粒大小，有的像房子一样大！科学家认为，光环可能是被土星强大引力撕碎的小卫星，或者是太阳系早期留下的“建筑材料”碎片。',
        funFact: '土星环虽然宽达28万公里，但厚度只有约1公里！比一张纸还薄得多（相对比例来说）。',
        unlockRequirement: null,
      },
      silver: {
        title: '土星环的结构与动力学',
        content:
          '土星环按发现顺序分为A、B、C环（从内到外），以及更暗的D、E、F、G环。A环和B环之间著名的“卡西尼缝”宽约4800公里，由土卫一（Mimas）的轨道共振清扫而成。A环外缘受“牧羊卫星”土卫十八（Pan）和土卫三十五（Daphnis）的引力约束，形成锋利的边界。环内还存在螺旋密度波，可用于测量土星内部质量分布。',
        funFact: '卡西尼号的最终数据暗示，土星环可能相当“年轻”——可能只有1亿到4亿年历史，在恐龙时代之后才可能形成。',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '环的起源与行星形成学',
        content:
          '土星环位于洛希极限（Roche limit）内，任何靠得太近的卫星都会被土星的潮汐力撕裂。关于环的起源有两种主要假说：（1）一颗约400公里大小的卫星被撕裂；（2）原始太阳星云中未能聚合成卫星的残留物。卡西尼号 finale 数据显示，环的总质量较低（约等于土卫一），成分非常纯净（>99%水冰），这与“古老残留物”假说不太一致，更支持相对年轻的撞击起源。',
        funFact: '如果地球也有类似土星环的环系，从地面看，它们将像一道壮丽的光弧横跨夜空，比满月还要亮！',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      {
        id: 'roche-limit',
        question: '洛希极限是怎么计算的？',
        answer:
          '洛希极限d ≈ 2.44 × R × (ρ_M/ρ_m)^(1/3)，其中R是主天体半径，ρ_M和ρ_m分别是主天体和卫星的密度。对土星而言，冰质卫星的洛希极限约在土星赤道上方约14万公里处，正好对应B环的外边界附近。',
        nextId: 'ring-age',
      },
      {
        id: 'ring-age',
        question: '如果土星环很年轻，未来会消失吗？',
        answer:
          '是的！卡西尼号发现，环物质正以“环雨”（ring rain）的形式持续落入土星大气，估计每秒有数百公斤到数吨。按这个速率，土星环可能在1亿到3亿年内完全消失。我们正生活在一个能目睹土星环的幸运时代！',
        nextId: null,
      },
    ],
  },
  {
    id: 'lunar-eclipse',
    targetBody: 'Moon',
    levels: {
      bronze: {
        title: '月食是怎么发生的？',
        content:
          '月食发生时，地球跑到了太阳和月球中间。太阳的光被地球挡住，地球的影子就投射到了月球上。不过月球不会完全变黑——地球大气层会把一部分阳光弯曲并散射到月球表面，这些光中红色光最多，所以月球常常变成暗红色，叫做“血月”！',
        funFact: '月食时，如果你站在月球上，你会看到地球把太阳完全挡住，周围有一圈红色的光环！',
        unlockRequirement: null,
      },
      silver: {
        title: '月食的分类与几何学',
        content:
          '月食分为半影月食、月偏食和月全食三种，取决于月球进入地球阴影的深度。地球本影（umbra）在月球轨道处的直径约为9200公里，远大于月球直径（3474公里），因此月全食时月球可完全没入本影。月食只发生在“食季”——当满月接近黄白交点时。每年通常有2个食季，每个食季约35天。',
        funFact: '月全食的最长理论持续时间约为1小时47分钟——月球必须尽可能穿过本影中心。',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '月食在古代天文学中的意义',
        content:
          '月食是证明地球是球体的最早证据之一：地球在本影中投射的影子永远是圆形的，只有球体才能做到这一点。中国古代天文学家通过精确记录月食来检验历法的准确性，《史记》中就有大量月食记载。公元前3世纪，阿里斯塔克斯（Aristarchus）利用月全食时地球本影跨越月球的时间，估算出地月距离约为地球半径的60-80倍，与现代值（约60倍）相当接近。',
        funFact: '阿里斯塔克斯的距离估算误差仅约10%——这在2000多年前是惊人的成就！他还第一个提出了日心说。',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      {
        id: 'why-red',
        question: '为什么月全食时月亮是红色的，而不是完全黑掉？',
        answer:
          '这是因为地球大气层的瑞利散射。蓝光被散射到四面八方，而波长较长的红光更容易穿透大气层并弯曲（折射）进地球的本影。这些折射后的红光落在月球表面，把它染成暗红色。如果地球没有大气层，月全食时月球将完全不可见。',
        nextId: 'saros-cycle',
      },
      {
        id: 'saros-cycle',
        question: '什么是沙罗周期？',
        answer:
          '沙罗周期约为6585.3天（约18年11天），是朔望月、交点月和近点月的公倍数。经过这样一个周期，日、地、月的相对几何关系几乎完全相同，因此会发生一次非常相似的月食。古代巴比伦天文学家最早发现了这一规律。',
        nextId: null,
      },
    ],
  },
  {
    id: 'sun-nuclear',
    targetBody: 'Sun',
    levels: {
      bronze: {
        title: '太阳为什么会发光发热？',
        content:
          '太阳就像宇宙中的一个超级大锅炉。它的核心温度高达1500万摄氏度，压力大得难以想象。在这种极端条件下，氢原子会发生“核聚变”——4个氢原子合并成1个氦原子，同时释放出巨大的能量。每一秒钟，太阳就把400万吨物质转化成能量！这些能量以光和热的形式传播到太空，给地球带来生命。',
        funFact: '太阳已经燃烧了约46亿年，但它还有约50亿年的燃料！你可以放心地晒太阳。',
        unlockRequirement: null,
      },
      silver: {
        title: '核聚变：质子-质子链反应',
        content:
          '太阳核心的主要能量来源是质子-质子链反应（pp chain）。过程大致为：两个质子聚变成氘，释放正电子和中微子；氘再与一个质子聚变成氦-3；最后两个氦-3聚变成氦-4并释放两个质子。每一步都有质量亏损——约0.7%的初始质量被转化为能量（E=mc²）。太阳每秒将约400万吨氢转化为氦，对应的光度为3.8×10²⁶瓦。',
        funFact: '一个光子从太阳核心走到表面平均需要约17万年！它以随机游走的方式在致密等离子体中艰难前进。',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '太阳结构与恒星演化',
        content:
          '太阳从内到外分为：核心（核聚变区，半径约0.25R☉）、辐射区（能量以辐射传递，约0.25-0.7R☉）、对流区（热等离子体对流翻滚，约0.7-1R☉）。可见大气分为光球层（可见光主要来源，约5778K）、色球层（粉红色薄层）和日冕（温度百万度，延伸至行星际空间）。约50亿年后，核心氢耗尽，太阳将膨胀为红巨星，可能吞噬地球。',
        funFact: '太阳的质量占整个太阳系的99.86%！其余所有行星、卫星、小行星和彗星加起来只占0.14%。',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      {
        id: 'fusion-barrier',
        question: '为什么太阳不会一下子全部炸掉？',
        answer:
          '量子隧穿效应和高温共同作用，使只有极少数质子拥有足够能量克服库仑斥力发生聚变。在太阳核心，一个质子平均要等待约90亿年才能参与一次聚变！这种极低的反应速率反而保证了太阳的稳定燃烧。如果反应太快，核心膨胀降温会自我调节；太慢则会收缩升温——这就是恒星的主序平衡。',
        nextId: 'solar-wind',
      },
      {
        id: 'solar-wind',
        question: '太阳风是什么？对地球有什么影响？',
        answer:
          '太阳风是从日冕持续向外高速喷射的带电粒子流（主要是质子和电子），速度约400-800公里/秒。当太阳风撞击地球磁场时，会被偏转至磁层两侧，形成弓形激波。强烈的太阳风会压缩磁层，引发地磁暴，导致极光增强、卫星故障和电网波动。',
        nextId: null,
      },
    ],
  },
];

export function getKnowledgeForBody(bodyId: string): KnowledgeItemV2 | undefined {
  return knowledgeDataV2.find(
    (k) => k.targetBody?.toLowerCase() === bodyId.toLowerCase()
  );
}

export function getKnowledgeById(id: string): KnowledgeItemV2 | undefined {
  return knowledgeDataV2.find((k) => k.id === id);
}

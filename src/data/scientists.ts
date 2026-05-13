export interface Scientist {
  id: string;
  name: string;
  nameEn: string;
  years: string;
  nationality: string;
  icon: string; // emoji
  tagline: string;
  contribution: string;
  funFact: string;
  searchKeyword: string;
}

export const scientists: Scientist[] = [
  {
    id: 'zhang-heng',
    name: '张衡',
    nameEn: 'Zhang Heng',
    years: '78—139年',
    nationality: '中国·东汉',
    icon: '🔮',
    tagline: '世界上第一台地震仪的发明者',
    contribution:
      '张衡是中国古代最伟大的天文学家之一。他发明了“候风地动仪”——世界上第一台检测地震方向的仪器。他还制造了“浑天仪”，用精密的齿轮系统模拟天体运动，比欧洲的类似装置早了一千多年。他在《灵宪》中提出了宇宙无限论，认为“宇之表无极，宙之端无穷”。',
    funFact: '张衡不仅懂天文，还是文学家、画家和数学家。他的《二京赋》是汉赋的代表作，被誉为“长篇之极轨”。',
    searchKeyword: '张衡 地动仪 浑天仪',
  },
  {
    id: 'al-khwarizmi',
    name: '阿尔·花拉子米',
    nameEn: 'Al-Khwarizmi',
    years: '约780—850年',
    nationality: '阿拉伯·波斯',
    icon: '📐',
    tagline: '代数学之父，天文表的编纂者',
    contribution:
      '阿尔·花拉子米被誉为“代数学之父”。他的著作《还原与对消》（Al-Jabr）奠定了代数学的基础——“算法”（algorithm）一词就来源于他的名字。他还编纂了《信德天文表》，将印度数字系统和零的概念传入阿拉伯世界，并最终传到欧洲。他的天文表精确计算了太阳、月亮和五大行星的位置。',
    funFact: '我们使用的“阿拉伯数字”（0,1,2,3...）其实是印度人发明的，是花拉子米将它们推广到整个阿拉伯世界的。',
    searchKeyword: '花拉子米 代数学 算法',
  },
  {
    id: 'gande-shen',
    name: '甘德与石申',
    nameEn: 'Gan De & Shi Shen',
    years: '约公元前4世纪',
    nationality: '中国·战国',
    icon: '⭐',
    tagline: '世界上最早的星表作者，哈雷彗星的最早记录者',
    contribution:
      '甘德和石申是战国时期两位天文学家，分别著有《天文星占》和《天文》。他们编制的星表比希腊的喜帕恰斯星表早了两个世纪，记录了约800颗恒星的位置。甘德还最早用肉眼发现了木星的卫星（比伽利略的望远镜观测早了近两千年），并在公元前240年左右记录了哈雷彗星的回归。',
    funFact: '1970年代，国际天文学联合会用甘德和石申的名字命名了月球背面的两座环形山，以纪念他们的贡献。',
    searchKeyword: '甘德 石申 星表 哈雷彗星',
  },
  {
    id: 'henrietta-leavitt',
    name: '亨丽爱塔·勒维特',
    nameEn: 'Henrietta Leavitt',
    years: '1868—1921年',
    nationality: '美国',
    icon: '💫',
    tagline: '发现宇宙距离尺度的女性天文学家',
    contribution:
      '亨丽爱塔·勒维特在哈佛大学天文台担任“计算员”（当时女性不被允许使用望远镜）时，发现了造父变星的“周光关系”：变星的光变周期越长，其固有亮度就越大。这一发现让天文学家第一次能够精确测量遥远星系的距离。哈勃正是利用勒维特的发现，证明了银河系之外还存在其他星系，并测量了宇宙的膨胀。',
    funFact: '勒维特的周光关系被天文学家沙普利称为“发现宇宙的关键”。如果没有她的工作，人类可能还要晚几十年才知道宇宙在膨胀。',
    searchKeyword: '亨丽爱塔·勒维特 造父变星 周光关系',
  },
  {
    id: 'jocelyn-bell',
    name: '约瑟琳·贝尔',
    nameEn: 'Jocelyn Bell Burnell',
    years: '1943年—',
    nationality: '英国·北爱尔兰',
    icon: '📡',
    tagline: '脉冲星的发现者',
    contribution:
      '1967年，年仅24岁的约瑟琳·贝尔（当时还是剑桥大学研究生）在检查射电望远镜数据时，发现了一种规律的“闪烁”信号。她最初戏称它为“LGM”（Little Green Men，小绿人），以为是外星文明发出的信号。但后来她和导师休伊什确认，这是一种快速旋转的中子星——脉冲星。然而，1974年诺贝尔物理学奖颁给了导师休伊什，而非贝尔本人，引发了长期的科学伦理争议。',
    funFact: '贝尔虽然没有获得诺贝尔奖，但她在2018年获得了“基础物理学特别突破奖”，奖金300万美元。她将所有奖金捐给了支持女性和少数族裔进入物理学的基金会。',
    searchKeyword: '约瑟琳·贝尔 脉冲星 中子星',
  },
  {
    id: 'vera-rubin',
    name: '薇拉·鲁宾',
    nameEn: 'Vera Rubin',
    years: '1928—2016年',
    nationality: '美国',
    icon: '🌌',
    tagline: '暗物质的发现者',
    contribution:
      '薇拉·鲁宾通过观测螺旋星系的旋转曲线，发现星系边缘的恒星运动速度远比理论预测的快——这意味着存在大量我们看不见的物质在提供额外引力。她的发现为“暗物质”的存在提供了最直接、最坚实的观测证据。在此之前，暗物质只是一个理论假设；鲁宾的数据让它成为现代宇宙学的基石。',
    funFact: '鲁宾从小就热爱天文，但她的中学物理老师告诉她：“女孩不应该学物理。”她没有放弃，最终改变了人类对宇宙的理解。',
    searchKeyword: '薇拉·鲁宾 暗物质 星系旋转曲线',
  },
  {
    id: 'maria-mitchell',
    name: '玛丽亚·米切尔',
    nameEn: 'Maria Mitchell',
    years: '1818—1889年',
    nationality: '美国',
    icon: '🔭',
    tagline: '美国第一位女性职业天文学家',
    contribution:
      '1847年，29岁的玛丽亚·米切尔用望远镜发现了一颗新彗星，被国际天文学联合会命名为“米切尔彗星”。她因此获得了丹麦国王颁发的金奖章，并成为美国第一位女性职业天文学家。后来她担任瓦萨学院天文学教授，毕生致力于推动女性接受科学教育。',
    funFact: '米切尔是贵格会教徒，相信人人平等。她 famously 说过：“我们不仅有权触及星星，还有责任去理解它们。”',
    searchKeyword: '玛丽亚·米切尔 彗星 女性天文学家',
  },
  {
    id: 'margaret-burbidge',
    name: '玛格丽特·伯比奇',
    nameEn: 'Margaret Burbidge',
    years: '1919—2020年',
    nationality: '英国',
    icon: '⚛️',
    tagline: '揭示恒星如何锻造元素',
    contribution:
      '1957年，玛格丽特·伯比奇与丈夫杰弗里·伯比奇、威廉·福勒和弗雷德·霍伊尔共同发表了著名的B²FH论文，首次完整解释了恒星核合成的过程——即恒星如何在核心中通过核聚变锻造出从碳到铀的所有重元素。这一理论是现代天体物理学的基石之一。她后来还担任哈勃太空望远镜项目的重要科学顾问。',
    funFact: '伯比奇曾被拒绝使用威尔逊山望远镜，因为那里“没有女卫生间”。她坚持进入，并说：“我就当没有性别之分。”最终她成功完成了观测。',
    searchKeyword: '玛格丽特·伯比奇 恒星核合成 B2FH论文',
  },
];

export function getScientistById(id: string): Scientist | undefined {
  return scientists.find((s) => s.id === id);
}

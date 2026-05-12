export interface JourneyStop {
  bodyId: string;
  bodyNameZh: string;
  distanceAU: number;
  lightMinutes: number;
  description: string;
  scaleFact: string;
}

export const journeyStops: JourneyStop[] = [
  { bodyId: 'sun', bodyNameZh: '太阳', distanceAU: 0, lightMinutes: 0, description: '我们的旅程从太阳开始，它是太阳系的中心。', scaleFact: '' },
  { bodyId: 'mercury', bodyNameZh: '水星', distanceAU: 0.387, lightMinutes: 3.2, description: '水星是离太阳最近的行星，白天427°C，夜晚-173°C。', scaleFact: '从这里看，太阳比地球天空中大3倍！' },
  { bodyId: 'venus', bodyNameZh: '金星', distanceAU: 0.723, lightMinutes: 6.0, description: '金星有极厚的大气层，表面温度高达462°C。', scaleFact: '太阳亮度是地球上的1.9倍' },
  { bodyId: 'earth', bodyNameZh: '地球', distanceAU: 1.0, lightMinutes: 8.3, description: '这是我们的家园，目前已知唯一存在生命的行星。', scaleFact: '一切正常——你熟悉的大小' },
  { bodyId: 'mars', bodyNameZh: '火星', distanceAU: 1.524, lightMinutes: 12.7, description: '火星被称为红色星球，是人类探索的重点目标。', scaleFact: '太阳只有地球看到的2/3大' },
  { bodyId: 'jupiter', bodyNameZh: '木星', distanceAU: 5.204, lightMinutes: 43.2, description: '木星是太阳系最大的行星，大红斑已持续350年。', scaleFact: '太阳只有地球看到的1/25大' },
  { bodyId: 'saturn', bodyNameZh: '土星', distanceAU: 9.582, lightMinutes: 79.3, description: '土星以其壮丽的光环闻名，密度比水还小。', scaleFact: '太阳只有地球看到的1/90大' },
  { bodyId: 'uranus', bodyNameZh: '天王星', distanceAU: 19.218, lightMinutes: 159.6, description: '天王星几乎横躺着自转，自转轴倾角98度。', scaleFact: '太阳看起来像一个明亮的星星' },
  { bodyId: 'neptune', bodyNameZh: '海王星', distanceAU: 30.11, lightMinutes: 250.0, description: '海王星拥有太阳系最强烈的风暴，风速2100km/h。', scaleFact: '太阳亮度只有地球的1/900' },
  { bodyId: 'pluto', bodyNameZh: '冥王星', distanceAU: 39.48, lightMinutes: 327.0, description: '冥王星是柯伊伯带的矮行星，1930年被发现。', scaleFact: '太阳只是一个明亮的点，和星星差不多' },
];

/**
 * 月食阴影锥几何计算
 * 基于太阳视角直径（约0.53°）和地球半径计算地影锥
 */

const SUN_RADIUS_KM = 696340;
const EARTH_RADIUS_KM = 6371;
const MOON_RADIUS_KM = 1737.4;

/**
 * 计算地球本影锥和半影锥在月球距离处的截面半径
 * @param earthMoonDistance 地月距离（km）
 * @returns umbraRadius 本影截面半径, penumbraRadius 半影截面半径
 */
export function calculateEarthShadow(
  earthMoonDistance: number
): { umbraRadius: number; penumbraRadius: number } {
  // 太阳视角半径（弧度）≈ arcsin(SUN_RADIUS / 1AU)
  // 简化：太阳角半径约 0.2666° = 0.00465 rad
  const solarAngularRadius = 0.00465;

  // 本影锥半顶角
  // tan(umbraAngle) = (SUN_RADIUS - EARTH_RADIUS) / (1AU - earthMoonDistance)
  // 简化计算：本影锥在月球距离处的截面
  const rawUmbra = EARTH_RADIUS_KM - earthMoonDistance * Math.tan(solarAngularRadius);
  const umbraRadius = Math.max(0, rawUmbra);

  // 半影锥截面半径
  const penumbraRadius = EARTH_RADIUS_KM + earthMoonDistance * Math.tan(solarAngularRadius);

  return { umbraRadius, penumbraRadius };
}

/**
 * 判断月球是否在地影中，以及月食阶段
 * @param sunPos 太阳位置（场景坐标）
 * @param earthPos 地球位置（场景坐标）
 * @param moonPos 月球位置（场景坐标）
 * @returns eclipsePhase: 'none' | 'penumbral' | 'partial' | 'total'
 */
export function getLunarEclipsePhase(
  sunPos: [number, number, number],
  earthPos: [number, number, number],
  moonPos: [number, number, number],
  distanceScale: number = 384400 / 3.855
): { phase: 'none' | 'penumbral' | 'partial' | 'total'; coverage: number } {
  // 计算月球相对于地球阴影中心的位置
  // 简化：地球阴影中心在太阳-地球连线的延长线上，距离地球后方

  // 太阳到地球的向量
  const sunToEarth = [
    earthPos[0] - sunPos[0],
    earthPos[1] - sunPos[1],
    earthPos[2] - sunPos[2],
  ];

  // 地球到月球的向量
  const earthToMoon = [
    moonPos[0] - earthPos[0],
    moonPos[1] - earthPos[1],
    moonPos[2] - earthPos[2],
  ];

  // 计算地月距离
  const earthMoonDistance = Math.sqrt(
    earthToMoon[0] ** 2 + earthToMoon[1] ** 2 + earthToMoon[2] ** 2
  );

  // 场景距离缩放到 km（默认值基于 Moon.a=0.00257 AU × 卫星缩放因子 1500 = 3.855 场景单位）
  const distanceKm = earthMoonDistance * distanceScale;

  // 计算阴影半径
  const { umbraRadius, penumbraRadius } = calculateEarthShadow(distanceKm);

  // 计算月球在阴影横截面上的偏移距离
  // 投影到垂直于阴影轴的平面
  const shadowAxis = sunToEarth;
  const shadowAxisLen = Math.sqrt(shadowAxis[0] ** 2 + shadowAxis[1] ** 2 + shadowAxis[2] ** 2);
  if (shadowAxisLen === 0) return { phase: 'none', coverage: 0 };
  const shadowAxisUnit = [
    shadowAxis[0] / shadowAxisLen,
    shadowAxis[1] / shadowAxisLen,
    shadowAxis[2] / shadowAxisLen,
  ];

  // 月球在阴影轴方向的投影长度
  const moonDotAxis =
    earthToMoon[0] * shadowAxisUnit[0] +
    earthToMoon[1] * shadowAxisUnit[1] +
    earthToMoon[2] * shadowAxisUnit[2];

  // 月球到阴影轴的垂直距离
  const perpOffset = Math.sqrt(
    Math.max(0, earthMoonDistance ** 2 - moonDotAxis ** 2)
  );

  // 将垂直距离缩放到 km
  const perpOffsetKm = perpOffset * distanceScale;

  // 月球必须在地球背日侧（moonDotAxis > 0）才可能发生月食
  if (moonDotAxis <= 0) return { phase: 'none', coverage: 0 };

  // 判断月食阶段
  const moonRadiusKm = MOON_RADIUS_KM;

  if (perpOffsetKm > penumbraRadius + moonRadiusKm) {
    return { phase: 'none', coverage: 0 };
  }

  if (perpOffsetKm > umbraRadius + moonRadiusKm) {
    // 半影区
    const coverage =
      (penumbraRadius + moonRadiusKm - perpOffsetKm) / (2 * moonRadiusKm);
    return { phase: 'penumbral', coverage: Math.min(coverage, 1) };
  }

  if (perpOffsetKm > Math.max(0, umbraRadius - moonRadiusKm)) {
    // 偏食区
    const coverage =
      (umbraRadius + moonRadiusKm - perpOffsetKm) / (2 * moonRadiusKm);
    return { phase: 'partial', coverage: Math.min(coverage, 1) };
  }

  // 全食区
  return { phase: 'total', coverage: 1 };
}

/**
 * 月食阶段中文名称
 */
export const eclipsePhaseNames: Record<string, string> = {
  none: '无月食',
  penumbral: '半影月食',
  partial: '月偏食',
  total: '月全食',
};

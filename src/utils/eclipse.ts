/**
 * 月食阴影锥几何计算
 * 基于太阳视角直径（约0.53°）和地球半径计算地影锥
 *
 * @deprecated 此文件功能已弃用，EclipseLab 使用独立的内联计算。
 * calculateEarthShadow 保留供参考，但未在项目中实际引用。
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

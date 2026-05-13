import { OrbitalElements } from '../data/celestialData';

const DEG_TO_RAD = Math.PI / 180;

/**
 * 求解开普勒方程：M = E - e * sin(E)
 * 使用牛顿迭代法
 */
function solveKepler(M: number, e: number, maxIter = 50, epsilon = 1e-8): number {
  let E = M; // 初始猜测
  if (e > 0.8) E = Math.PI;

  for (let i = 0; i < maxIter; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    if (Math.abs(fp) < 1e-12) return E;
    const delta = f / fp;
    E -= delta;
    if (Math.abs(delta) < epsilon) break;
  }
  return E;
}

/**
 * 计算天体在给定时间的日心黄道坐标（单位：AU，已缩放）
 * 使用开普勒轨道近似
 * @param orbit 轨道根数
 * @param days 相对于历元的日数
 */
export function getHeliocentricPosition(
  orbit: OrbitalElements,
  days: number
): [number, number, number] {
  const { a, e, i, L, longPeri, longNode, period } = orbit;

  if (a === 0 || period === 0) return [0, 0, 0];

  const n = (2 * Math.PI) / period;

  const M0Deg = ((L - longPeri) % 360 + 360) % 360;
  const M0Rad = M0Deg * DEG_TO_RAD;
  const M = ((M0Rad + n * days) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

  const E = solveKepler(M, e);

  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const denom = 1 - e * cosE;
  const cosNu = (cosE - e) / denom;
  const sinNu = (Math.sqrt(1 - e * e) * sinE) / denom;

  const r = a * (1 - e * cosE);

  const ωRad = (longPeri - longNode) * DEG_TO_RAD;
  const cosω = Math.cos(ωRad);
  const sinω = Math.sin(ωRad);
  const xOrb = r * (cosNu * cosω - sinNu * sinω);
  const yOrb = r * (sinNu * cosω + cosNu * sinω);

  const iRad = i * DEG_TO_RAD;
  const nodeRad = longNode * DEG_TO_RAD;
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);
  const cosNode = Math.cos(nodeRad);
  const sinNode = Math.sin(nodeRad);

  const x = (cosNode * xOrb - sinNode * yOrb * cosI) * 15;
  const y = (sinNode * xOrb + cosNode * yOrb * cosI) * 15;
  const z = yOrb * sinI * 15;

  return [x, y, z];
}

/**
 * 计算卫星相对于其行星的轨道位置
 * 使用完整的开普勒椭圆轨道（支持偏心率、倾角、升交点）
 * @param orbit 轨道根数（a 单位为 AU）
 * @param days 相对于历元的日数
 * @param scale 距离缩放因子（默认 1500）
 */
export function getSatellitePosition(
  orbit: OrbitalElements,
  days: number,
  scale = 1500
): [number, number, number] {
  const { a, e, i, L, longPeri, longNode, period } = orbit;
  if (a === 0 || period === 0) return [0, 0, 0];

  const n = (2 * Math.PI) / period;

  const M0Deg = ((L - longPeri) % 360 + 360) % 360;
  const M0Rad = M0Deg * DEG_TO_RAD;
  const M = ((M0Rad + n * days) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

  const E = solveKepler(M, e);

  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const denom = 1 - e * cosE;
  const cosNu = (cosE - e) / denom;
  const sinNu = (Math.sqrt(1 - e * e) * sinE) / denom;

  const r = a * (1 - e * cosE) * scale;

  const ωRad = (longPeri - longNode) * DEG_TO_RAD;
  const cosω = Math.cos(ωRad);
  const sinω = Math.sin(ωRad);
  const xOrb = r * (cosNu * cosω - sinNu * sinω);
  const yOrb = r * (sinNu * cosω + cosNu * sinω);

  const iRad = i * DEG_TO_RAD;
  const nodeRad = longNode * DEG_TO_RAD;
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);
  const cosNode = Math.cos(nodeRad);
  const sinNode = Math.sin(nodeRad);

  const x = cosNode * xOrb - sinNode * yOrb * cosI;
  const y = sinNode * xOrb + cosNode * yOrb * cosI;
  const z = yOrb * sinI;

  return [x, y, z];
}

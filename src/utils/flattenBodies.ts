import { CelestialBody, OrbitalElements, celestialBodies, dwarfPlanets } from '../data/celestialData';

export interface FlatBodyEntry {
  body: CelestialBody;
  category: 'star' | 'planet' | 'dwarfPlanet' | 'satellite';
  /** 父天体轨道根数（仅卫星有），用于计算世界坐标 */
  parentOrbit?: OrbitalElements;
  /** 父天体中文名（仅卫星有），用于显示 */
  parentNameZh?: string;
}

/**
 * 将层次化的天体数据（行星→卫星、矮行星→卫星）展平为扁平列表，
 * 同时为卫星保留父天体信息，以便计算世界坐标。
 */
const allBodies: FlatBodyEntry[] = (() => {
  const result: FlatBodyEntry[] = [];

  // 太阳（恒星）
  const sun = celestialBodies.find((b) => b.id === 'sun');
  if (sun) {
    result.push({ body: sun, category: 'star' });
  }

  // 行星及其卫星
  for (const body of celestialBodies) {
    if (body.id === 'sun') continue;
    result.push({ body, category: 'planet' });
    if (body.satellites) {
      for (const sat of body.satellites) {
        result.push({
          body: sat,
          category: 'satellite',
          parentOrbit: body.orbit,
          parentNameZh: body.nameZh,
        });
      }
    }
  }

  // 矮行星及其卫星
  for (const body of dwarfPlanets) {
    result.push({ body, category: 'dwarfPlanet' });
    if (body.satellites) {
      for (const sat of body.satellites) {
        result.push({
          body: sat,
          category: 'satellite',
          parentOrbit: body.orbit,
          parentNameZh: body.nameZh,
        });
      }
    }
  }

  return result;
})();

export { allBodies };

/**
 * 光从太阳到某距离所需时间（分钟）
 */
export function lightTravelMinutes(distanceAU: number): number {
  return distanceAU * 8.317;
}

/**
 * 太阳在某距离的角直径（度）
 */
export function solarAngularDiameter(distanceAU: number): number {
  if (distanceAU <= 0) return 0.53;
  return 0.53 / distanceAU;
}

/**
 * 太阳辐射相对强度（地球=1）
 */
export function solarIrradiance(distanceAU: number): number {
  if (distanceAU <= 0) return 1;
  return 1 / (distanceAU * distanceAU);
}

/**
 * 格式化光行时间
 */
export function formatLightTime(minutes: number): string {
  if (minutes < 1) {
    return `${(minutes * 60).toFixed(0)}秒`;
  }
  if (minutes < 60) {
    return `${Math.floor(minutes)}分${Math.floor((minutes % 1) * 60)}秒`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}小时${mins}分`;
}

/**
 * 宜居带边界（AU）
 */
export function habitableZone(): { inner: number; outer: number } {
  return { inner: 0.95, outer: 1.37 };
}

/**
 * 开普勒第三定律：半长轴→周期（年）
 */
export function keplerThirdLaw(semiMajorAxisAU: number): number {
  return Math.pow(semiMajorAxisAU, 1.5);
}

/**
 * 一生视角下某行星的公转圈数
 */
export function lifetimeOrbits(orbitalPeriodDays: number, lifetimeYears: number = 80): number {
  return lifetimeYears / (orbitalPeriodDays / 365.25);
}

/**
 * 估算表面平衡温度（K）
 */
export function estimatedSurfaceTemperature(distanceAU: number, albedo: number = 0.3): number {
  const earthTemp = 288;
  const fluxRatio = solarIrradiance(distanceAU) * (1 - albedo) / (1 - 0.3);
  return earthTemp * Math.pow(fluxRatio, 0.25);
}

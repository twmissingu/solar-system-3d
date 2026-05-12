/**
 * Julian Day Number → Gregorian Date conversion
 * Based on the algorithm by Jean Meeus (Astronomical Algorithms)
 * J2000.0 = 2000-01-01 12:00 TT = JD 2451545.0
 */

const J2000 = 2451545.0;

/**
 * Convert Julian Day to Gregorian date parts [year, month, day]
 * Valid for JD >= 2299161 (Gregorian calendar)
 */
function jdToGregorian(jd: number): [number, number, number] {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;

  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = b - d - Math.floor(30.6001 * e) + f;

  let month: number;
  if (e < 14) {
    month = e - 1;
  } else {
    month = e - 13;
  }

  let year: number;
  if (month > 2) {
    year = c - 4716;
  } else {
    year = c - 4715;
  }

  return [year, month, day];
}

/**
 * Convert days-since-J2000.0 to formatted Chinese date string
 * @param daysOffset Days since J2000.0 (JD 2451545.0)
 * @returns Formatted string like "2000年1月1日"
 */
export function formatSimulationDate(daysOffset: number): string {
  const jd = J2000 + daysOffset;
  const [year, month, day] = jdToGregorian(jd);
  return `${year}年${month}月${Math.floor(day)}日`;
}

/**
 * Convert days-since-J2000.0 to a detailed string
 * @param daysOffset Days since J2000.0
 * @returns Full description like "2000年1月1日（J2000.0 + 0天）"
 */
export function formatSimulationDateFull(daysOffset: number): string {
  const dateStr = formatSimulationDate(daysOffset);
  const sign = daysOffset >= 0 ? '+' : '';
  return `${dateStr}（J2000.0 ${sign}${Math.round(daysOffset)}天）`;
}

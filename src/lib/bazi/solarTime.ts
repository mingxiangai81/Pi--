import type { BirthInput, TrueSolarTime } from './types';

/** 一年中的第几天（用于均时差） */
function dayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 0);
  const cur = Date.UTC(year, month - 1, day);
  return Math.floor((cur - start) / 86_400_000);
}

/**
 * 真太阳时校正 = 钟表时 + 经度时差 + 均时差
 * - 经度时差：出生地经度相对本时区标准经线，每 1° = 4 分钟
 * - 均时差 (Equation of Time)：地球公转轨道偏心 + 黄赤交角导致的视太阳时差
 *
 * 用 UTC 构造避免宿主机时区干扰；跨日/跨时辰边界由 Date 自动处理（尤其影响时柱）。
 */
export function toTrueSolarTime(input: BirthInput): TrueSolarTime {
  const { year, month, day, hour, minute, longitude, tzOffsetHours } = input;

  const baseMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  // ① 经度时差
  const standardMeridian = tzOffsetHours * 15; // 中国 UTC+8 → 120°E
  const lngCorrectionMin = (longitude - standardMeridian) * 4;

  // ② 均时差（分钟），近似公式
  const N = dayOfYear(year, month, day);
  const B = ((2 * Math.PI) / 364) * (N - 81);
  const eotMin =
    9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  const t = new Date(baseMs + (lngCorrectionMin + eotMin) * 60_000);

  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth() + 1,
    day: t.getUTCDate(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
    lngCorrectionMin: Number(lngCorrectionMin.toFixed(2)),
    eotMin: Number(eotMin.toFixed(2)),
  };
}

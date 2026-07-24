import { describe, it, expect } from 'vitest';
import { computeBazi } from './engine';
import { toTrueSolarTime } from './solarTime';
import type { BirthInput } from './types';

const beijing = { city: '北京', longitude: 116.41, latitude: 39.9, tzOffsetHours: 8 };

describe('toTrueSolarTime', () => {
  it('北京经度 116.41°E 相对 120°E 应约 -14 分钟经度时差', () => {
    const input: BirthInput = {
      year: 1990, month: 6, day: 15, hour: 12, minute: 0, gender: 1, ...beijing,
    };
    const t = toTrueSolarTime(input);
    expect(t.lngCorrectionMin).toBeCloseTo((116.41 - 120) * 4, 1);
    // 12:00 减去约 14 分钟 → 11:4x
    expect(t.hour).toBe(11);
  });
});

describe('computeBazi', () => {
  const input: BirthInput = {
    year: 1990, month: 6, day: 15, hour: 14, minute: 30, gender: 1, ...beijing,
  };
  const chart = computeBazi(input);

  it('输出四柱且每柱含天干地支', () => {
    for (const key of ['year', 'month', 'day', 'time'] as const) {
      const p = chart.pillars[key];
      expect(p.gan).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
      expect(p.zhi).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
      expect(p.hideGan.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('日主取自日柱天干，且五行匹配', () => {
    expect(chart.dayMaster.gan).toBe(chart.pillars.day.gan);
    expect(['木', '火', '土', '金', '水']).toContain(chart.dayMaster.wuxing);
  });

  it('五行百分比合计约 100', () => {
    const sum = Object.values(chart.wuxing.percentages).reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(99);
    expect(sum).toBeLessThan(101);
  });

  it('身强身弱为三态之一，并给出大运数组', () => {
    expect(['strong', 'weak', 'balanced']).toContain(chart.wuxing.dayMasterStrength);
    expect(chart.yun.daYun.length).toBeGreaterThan(0);
    expect(chart.yun.daYun[0].liuNian.length).toBeGreaterThan(0);
  });
});

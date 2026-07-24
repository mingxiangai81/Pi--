import {
  GAN_WUXING,
  ZHI_WUXING,
  SHENG_ME,
  HIDE_GAN_WEIGHTS,
  MONTH_ORDER_BONUS,
  ALL_WUXING,
  type WuXing,
} from './constants';
import type { Pillar, WuXingAnalysis } from './types';

/**
 * 五行力量：遍历四柱天干 + 地支藏干，按本气/中气/余气加权累加；
 * 月支得令另加 MONTH_ORDER_BONUS 系数（司权最重）。
 */
export function computeWuXingStrength(
  pillars: { year: Pillar; month: Pillar; day: Pillar; time: Pillar },
  dayMasterWuXing: WuXing,
): WuXingAnalysis {
  const scores: Record<WuXing, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const list = [
    { p: pillars.year, w: 1 },
    { p: pillars.month, w: MONTH_ORDER_BONUS }, // 月令司权
    { p: pillars.day, w: 1 },
    { p: pillars.time, w: 1 },
  ];

  for (const { p, w } of list) {
    scores[GAN_WUXING[p.gan]] += 1 * w; // 天干
    p.hideGan.forEach((h, i) => {
      // 地支藏干（本/中/余气加权）
      const hw = HIDE_GAN_WEIGHTS[i] ?? 0.3;
      scores[h.wuxing] += hw * w;
    });
  }

  const total = ALL_WUXING.reduce((s, k) => s + scores[k], 0) || 1;
  const percentages = ALL_WUXING.reduce(
    (acc, k) => {
      acc[k] = Number(((scores[k] / total) * 100).toFixed(1));
      return acc;
    },
    {} as Record<WuXing, number>,
  );

  // 身强身弱：帮扶（印=生我 + 比劫=同我） vs 耗泄克（其余）
  const yin = SHENG_ME[dayMasterWuXing]; // 生我者为印
  const supportScore = scores[dayMasterWuXing] + scores[yin];
  const opposeScore = total - supportScore;
  const ratio = supportScore / total;

  let dayMasterStrength: WuXingAnalysis['dayMasterStrength'];
  if (ratio >= 0.55) dayMasterStrength = 'strong';
  else if (ratio <= 0.42) dayMasterStrength = 'weak';
  else dayMasterStrength = 'balanced';

  // 启发式喜用神：身弱喜生扶（印+比劫），身强喜克泄耗
  const favorableHint: WuXing[] =
    dayMasterStrength === 'weak'
      ? [yin, dayMasterWuXing]
      : dayMasterStrength === 'strong'
        ? ALL_WUXING.filter((k) => k !== yin && k !== dayMasterWuXing)
        : [];

  const sorted = [...ALL_WUXING].sort((a, b) => scores[b] - scores[a]);

  return {
    scores: ALL_WUXING.reduce(
      (a, k) => ((a[k] = Number(scores[k].toFixed(2))), a),
      {} as Record<WuXing, number>,
    ),
    percentages,
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
    supportScore: Number(supportScore.toFixed(2)),
    opposeScore: Number(opposeScore.toFixed(2)),
    dayMasterStrength,
    favorableHint,
  };
}

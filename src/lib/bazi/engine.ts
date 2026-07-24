import { Solar } from 'lunar-javascript';
import { GAN_WUXING, GAN_YINYANG, ZHI_WUXING, type WuXing } from './constants';
import { toTrueSolarTime } from './solarTime';
import { computeWuXingStrength } from './wuxing';
import type { BaziChart, BirthInput, Pillar } from './types';

type PillarKey = 'Year' | 'Month' | 'Day' | 'Time';

/**
 * 排盘主函数：阳历出生信息 + 经纬度 → 结构化 BaziChart JSON。
 * 先做真太阳时校正，再交由 lunar-javascript 计算四柱/藏干/十神/大运流年。
 */
export function computeBazi(input: BirthInput): BaziChart {
  const t = toTrueSolarTime(input);

  const solar = Solar.fromYmdHms(t.year, t.month, t.day, t.hour, t.minute, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  // 统一构造一柱：天干/地支/五行/阴阳/十神/藏干/纳音
  const buildPillar = (k: PillarKey): Pillar => {
    const call = <T>(suffix: string): T =>
      (ec as unknown as Record<string, () => T>)[`get${k}${suffix}`]();

    const gan = call<string>('Gan');
    const zhi = call<string>('Zhi');
    const hideGanArr = call<string[]>('HideGan');
    const hideShiShen = call<string[]>('ShiShenZhi');

    return {
      gan,
      zhi,
      ganWuXing: GAN_WUXING[gan],
      zhiWuXing: ZHI_WUXING[zhi],
      ganYinYang: GAN_YINYANG[gan],
      shiShenGan: k === 'Day' ? '日主' : call<string>('ShiShenGan'),
      hideGan: hideGanArr.map((g, i) => ({
        gan: g,
        wuxing: GAN_WUXING[g],
        shishen: hideShiShen[i],
      })),
      naYin: call<string>('NaYin'),
    };
  };

  const pillars = {
    year: buildPillar('Year'),
    month: buildPillar('Month'),
    day: buildPillar('Day'),
    time: buildPillar('Time'),
  };

  const dayGan = pillars.day.gan;
  const dayMasterWuXing: WuXing = GAN_WUXING[dayGan];

  // 大运 / 流年（gender: 1=男, 0=女）
  const yun = ec.getYun(input.gender);
  const daYun = yun.getDaYun().map((d) => ({
    index: d.getIndex(),
    ganZhi: d.getGanZhi(),
    startAge: d.getStartAge(),
    endAge: d.getEndAge(),
    startYear: d.getStartYear(),
    endYear: d.getEndYear(),
    liuNian: d.getLiuNian().map((n) => ({
      year: n.getYear(),
      age: n.getAge(),
      ganZhi: n.getGanZhi(),
    })),
  }));

  return {
    input,
    trueSolar: t,
    lunar: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      monthInChinese: lunar.getMonthInChinese(),
      dayInChinese: lunar.getDayInChinese(),
    },
    pillars,
    dayMaster: {
      gan: dayGan,
      wuxing: dayMasterWuXing,
      yinYang: GAN_YINYANG[dayGan],
    },
    wuxing: computeWuXingStrength(pillars, dayMasterWuXing),
    yun: {
      startAge: daYun[1]?.startAge ?? 0,
      startYear: daYun[1]?.startYear ?? solar.getYear(),
      forward: input.gender === 1, // 顺逆由库内部处理，此处仅作展示标注
      daYun,
    },
  };
}

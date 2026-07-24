import type { WuXing, YinYang } from './constants';

export type { WuXing, YinYang } from './constants';

/** 用户原始输入（阳历 + 校时所需地理信息） */
export interface BirthInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23（钟表时，未校正）
  minute: number; // 0-59
  gender: 1 | 0; // 1=男, 0=女
  city: string; // 出生城市名（展示用）
  longitude: number; // 经度，东经为正
  latitude: number; // 纬度（预留，暂不参与排盘）
  tzOffsetHours: number; // 出生地时区，中国=8
}

/** 藏干项：地支所藏之天干及其十神 */
export interface HideGanItem {
  gan: string;
  wuxing: WuXing;
  shishen: string; // 相对日主的十神
}

/** 单柱（年/月/日/时） */
export interface Pillar {
  gan: string;
  zhi: string;
  ganWuXing: WuXing;
  zhiWuXing: WuXing; // 地支本气五行
  ganYinYang: YinYang;
  shiShenGan: string; // 天干十神（日柱天干为「日主」）
  hideGan: HideGanItem[]; // 地支藏干
  naYin: string; // 纳音
}

/** 真太阳时校正结果 */
export interface TrueSolarTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lngCorrectionMin: number; // 经度时差（分钟）
  eotMin: number; // 均时差（分钟）
}

/** 流年 */
export interface LiuNian {
  year: number;
  age: number;
  ganZhi: string;
}

/** 大运 */
export interface DaYun {
  index: number;
  ganZhi: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  liuNian: LiuNian[];
}

/** 五行力量分析 */
export interface WuXingAnalysis {
  scores: Record<WuXing, number>; // 各五行加权得分
  percentages: Record<WuXing, number>; // 归一化百分比
  strongest: WuXing;
  weakest: WuXing;
  supportScore: number; // 帮扶日主（印+比劫）
  opposeScore: number; // 耗泄克（食伤+财+官杀）
  dayMasterStrength: 'strong' | 'weak' | 'balanced';
  /** 启发式喜用神初判（精细结论由 AI 层给出） */
  favorableHint: WuXing[];
}

/** ★ 最终排盘输出，即传给 LLM 的完整载荷 */
export interface BaziChart {
  input: BirthInput;
  trueSolar: TrueSolarTime;
  lunar: {
    year: number;
    month: number;
    day: number;
    monthInChinese: string;
    dayInChinese: string;
  };
  pillars: { year: Pillar; month: Pillar; day: Pillar; time: Pillar };
  dayMaster: { gan: string; wuxing: WuXing; yinYang: YinYang };
  wuxing: WuXingAnalysis;
  yun: { startAge: number; startYear: number; forward: boolean; daYun: DaYun[] };
}

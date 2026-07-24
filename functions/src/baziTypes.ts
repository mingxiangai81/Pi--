// 与前端 src/lib/bazi/types.ts 同构的精简副本，供 Functions 侧类型引用。
// （Functions 独立部署，不共享前端 tsconfig 路径，故本地复制类型定义。）
export type WuXing = '木' | '火' | '土' | '金' | '水';

export interface HideGanItem {
  gan: string;
  wuxing: WuXing;
  shishen: string;
}

export interface Pillar {
  gan: string;
  zhi: string;
  ganWuXing: WuXing;
  zhiWuXing: WuXing;
  ganYinYang: '阳' | '阴';
  shiShenGan: string;
  hideGan: HideGanItem[];
  naYin: string;
}

export interface DaYun {
  index: number;
  ganZhi: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  liuNian: { year: number; age: number; ganZhi: string }[];
}

export interface BaziChart {
  input: Record<string, unknown>;
  trueSolar: Record<string, number>;
  lunar: Record<string, unknown>;
  pillars: { year: Pillar; month: Pillar; day: Pillar; time: Pillar };
  dayMaster: { gan: string; wuxing: WuXing; yinYang: '阳' | '阴' };
  wuxing: {
    scores: Record<WuXing, number>;
    percentages: Record<WuXing, number>;
    strongest: WuXing;
    weakest: WuXing;
    dayMasterStrength: 'strong' | 'weak' | 'balanced';
    favorableHint: WuXing[];
  };
  yun: { startAge: number; startYear: number; forward: boolean; daYun: DaYun[] };
}

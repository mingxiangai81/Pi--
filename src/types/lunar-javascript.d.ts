// lunar-javascript 无官方 @types，声明本项目用到的最小接口。
declare module 'lunar-javascript' {
  export interface LiuNian {
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
  }

  export interface DaYun {
    getIndex(): number;
    getGanZhi(): string;
    getStartAge(): number;
    getEndAge(): number;
    getStartYear(): number;
    getEndYear(): number;
    getLiuNian(): LiuNian[];
  }

  export interface Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getDaYun(): DaYun[];
  }

  export interface EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getYearHideGan(): string[];
    getYearShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getYearNaYin(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getMonthHideGan(): string[];
    getMonthShiShenGan(): string;
    getMonthShiShenZhi(): string[];
    getMonthNaYin(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getDayHideGan(): string[];
    getDayShiShenGan(): string;
    getDayShiShenZhi(): string[];
    getDayNaYin(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getTimeHideGan(): string[];
    getTimeShiShenGan(): string;
    getTimeShiShenZhi(): string[];
    getTimeNaYin(): string;
    getYun(gender: number, sect?: number): Yun;
  }

  export interface Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getEightChar(): EightChar;
  }

  export interface Solar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getLunar(): Lunar;
  }

  export const Solar: {
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;
    fromDate(date: Date): Solar;
  };

  export const Lunar: {
    fromYmd(year: number, month: number, day: number): Lunar;
  };
}

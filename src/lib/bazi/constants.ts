// 五行 / 阴阳 / 生克 —— 排盘所需的全部基础常量
export type WuXing = '木' | '火' | '土' | '金' | '水';
export type YinYang = '阳' | '阴';

/** 天干 → 五行 */
export const GAN_WUXING: Record<string, WuXing> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

/** 天干 → 阴阳 */
export const GAN_YINYANG: Record<string, YinYang> = {
  甲: '阳', 乙: '阴', 丙: '阳', 丁: '阴', 戊: '阳',
  己: '阴', 庚: '阳', 辛: '阴', 壬: '阳', 癸: '阴',
};

/** 地支 → 五行（本气） */
export const ZHI_WUXING: Record<string, WuXing> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

/** 五行相生：key 生 value */
export const SHENG: Record<WuXing, WuXing> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};

/** 五行相克：key 克 value */
export const KE: Record<WuXing, WuXing> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
};

/** 谁生我（印）：value 生 key，即返回生 key 的那个五行 */
export const SHENG_ME: Record<WuXing, WuXing> = {
  火: '木', 土: '火', 金: '土', 水: '金', 木: '水',
};

/** 藏干本气/中气/余气 权重（getXHideGan 数组本气在前） */
export const HIDE_GAN_WEIGHTS = [1.0, 0.5, 0.3];

/** 月令司权加成：月支得令，力量最强 */
export const MONTH_ORDER_BONUS = 1.5;

/** 全部五行，固定顺序（用于遍历与展示） */
export const ALL_WUXING: WuXing[] = ['木', '火', '土', '金', '水'];

'use client';
import type { BaziChart as BaziChartType, Pillar, WuXing } from '@/lib/bazi/types';
import { Card } from './ui/Card';
import { Grid3x3 } from 'lucide-react';

const WUXING_COLOR: Record<WuXing, string> = {
  木: 'text-wuxing-wood',
  火: 'text-wuxing-fire',
  土: 'text-wuxing-earth',
  金: 'text-wuxing-metal',
  水: 'text-wuxing-water',
};

function PillarColumn({ title, pillar }: { title: string; pillar: Pillar }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-gray-500">{title}</span>
      {/* 天干 */}
      <div className="flex flex-col items-center">
        <span className={`font-serif text-3xl font-bold ${WUXING_COLOR[pillar.ganWuXing]}`}>
          {pillar.gan}
        </span>
        <span className="mt-0.5 text-[10px] text-gray-500">{pillar.shiShenGan}</span>
      </div>
      {/* 地支 */}
      <span className={`font-serif text-3xl font-bold ${WUXING_COLOR[pillar.zhiWuXing]}`}>
        {pillar.zhi}
      </span>
      {/* 藏干 */}
      <div className="flex flex-col items-center gap-0.5">
        {pillar.hideGan.map((h) => (
          <span key={h.gan} className="text-[10px] text-gray-400">
            <span className={WUXING_COLOR[h.wuxing]}>{h.gan}</span>
            <span className="ml-1 text-gray-600">{h.shishen}</span>
          </span>
        ))}
      </div>
      {/* 纳音 */}
      <span className="mt-1 text-[10px] text-gray-600">{pillar.naYin}</span>
    </div>
  );
}

export function BaziChart({ chart }: { chart: BaziChartType }) {
  const { pillars, dayMaster, trueSolar } = chart;
  return (
    <Card title="四柱排盘" icon={<Grid3x3 size={18} />}>
      <div className="grid grid-cols-4 gap-2">
        <PillarColumn title="年柱" pillar={pillars.year} />
        <PillarColumn title="月柱" pillar={pillars.month} />
        <PillarColumn title="日柱" pillar={pillars.day} />
        <PillarColumn title="时柱" pillar={pillars.time} />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-xs text-gray-500">
        <span>
          日主：<span className={`font-semibold ${WUXING_COLOR[dayMaster.wuxing]}`}>
            {dayMaster.gan}（{dayMaster.yinYang}{dayMaster.wuxing}）
          </span>
        </span>
        <span>
          真太阳时校正：{trueSolar.lngCorrectionMin > 0 ? '+' : ''}
          {trueSolar.lngCorrectionMin}′（经度）/ {trueSolar.eotMin > 0 ? '+' : ''}
          {trueSolar.eotMin}′（均时差）
        </span>
      </div>
    </Card>
  );
}

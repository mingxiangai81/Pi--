'use client';
import type { WuXingAnalysis, WuXing } from '@/lib/bazi/types';
import { Card } from './ui/Card';
import { Activity } from 'lucide-react';

const ORDER: WuXing[] = ['木', '火', '土', '金', '水'];
const HEX: Record<WuXing, string> = {
  木: '#4ADE80',
  火: '#F87171',
  土: '#D6B26B',
  金: '#E5E7EB',
  水: '#38BDF8',
};

const STRENGTH_LABEL = {
  strong: '身强',
  weak: '身弱',
  balanced: '中和',
} as const;

/** 纯 SVG 五边形雷达图，无外部图表依赖 */
export function WuXingRadar({ wuxing }: { wuxing: WuXingAnalysis }) {
  const size = 240;
  const c = size / 2;
  const R = 92;
  const maxPct = Math.max(...ORDER.map((k) => wuxing.percentages[k]), 1);

  const pointAt = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return [c + r * Math.cos(angle), c + r * Math.sin(angle)];
  };

  const dataPoints = ORDER.map((k, i) => {
    const r = (wuxing.percentages[k] / maxPct) * R;
    return pointAt(i, r);
  });
  const polygon = dataPoints.map((p) => p.join(',')).join(' ');

  return (
    <Card title="五行力量" icon={<Activity size={18} />}>
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 网格环 */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <polygon
              key={f}
              points={ORDER.map((_, i) => pointAt(i, R * f).join(',')).join(' ')}
              fill="none"
              stroke="rgba(198,161,91,0.15)"
              strokeWidth={1}
            />
          ))}
          {/* 轴线 + 标签 */}
          {ORDER.map((k, i) => {
            const [x, y] = pointAt(i, R);
            const [lx, ly] = pointAt(i, R + 16);
            return (
              <g key={k}>
                <line x1={c} y1={c} x2={x} y2={y} stroke="rgba(198,161,91,0.12)" />
                <text x={lx} y={ly} fill={HEX[k]} fontSize={14} textAnchor="middle" dominantBaseline="middle">
                  {k}
                </text>
              </g>
            );
          })}
          {/* 数据多边形 */}
          <polygon points={polygon} fill="rgba(198,161,91,0.22)" stroke="#C6A15B" strokeWidth={2} />
          {dataPoints.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill={HEX[ORDER[i]]} />
          ))}
        </svg>

        {/* 数值条 */}
        <div className="mt-4 w-full space-y-2">
          {ORDER.map((k) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className="w-4" style={{ color: HEX[k] }}>
                {k}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${wuxing.percentages[k]}%`, background: HEX[k] }}
                />
              </div>
              <span className="w-10 text-right text-gray-400">{wuxing.percentages[k]}%</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
          <span className="rounded-full border border-gold/40 px-3 py-1 text-gold-light">
            {STRENGTH_LABEL[wuxing.dayMasterStrength]}
          </span>
          {wuxing.favorableHint.length > 0 && (
            <span>
              喜用（初判）：
              {wuxing.favorableHint.map((k) => (
                <span key={k} style={{ color: HEX[k] }} className="mx-0.5">
                  {k}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

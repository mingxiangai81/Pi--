'use client';
import type { DaYun } from '@/lib/bazi/types';
import { Card } from './ui/Card';
import { CalendarClock } from 'lucide-react';

export function DaYunTimeline({ daYun, startAge }: { daYun: DaYun[]; startAge: number }) {
  return (
    <Card title="大运" icon={<CalendarClock size={18} />}>
      <p className="mb-3 text-xs text-gray-500">起运约 {startAge} 岁 · 横向滑动查看</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {daYun.slice(0, 9).map((d) => (
          <div
            key={d.index}
            className="flex min-w-[68px] flex-col items-center rounded-xl border border-white/8 bg-ink-900/50 px-3 py-2.5"
          >
            <span className="font-serif text-xl font-bold text-gold-light">{d.ganZhi}</span>
            <span className="mt-1 text-[10px] text-gray-500">{d.startAge}岁起</span>
            <span className="text-[10px] text-gray-600">{d.startYear}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

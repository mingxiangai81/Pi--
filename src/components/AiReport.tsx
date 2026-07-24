'use client';
import type { AiReportContent } from '@/lib/firebase/report';
import { Card } from './ui/Card';
import { ScrollText, Briefcase, Coins, Heart, User, Compass } from 'lucide-react';
import type { ReactNode } from 'react';

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gold-light">
        {icon}
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-300">{children}</p>
    </div>
  );
}

export function AiReport({ report }: { report: AiReportContent }) {
  return (
    <Card title="AI 深度解盘" icon={<ScrollText size={18} />}>
      <div className="space-y-5">
        <Section icon={<Compass size={15} />} title="格局与喜用神">
          {report.geju}
          <br />
          <span className="text-gray-400">
            喜用：{report.xiYongShen.favorable.join('、')}；忌神：
            {report.xiYongShen.unfavorable.join('、')}。{report.xiYongShen.reasoning}
          </span>
        </Section>

        <Section icon={<User size={15} />} title="性格剖析">
          {report.personality}
        </Section>
        <Section icon={<Briefcase size={15} />} title="事业方向">
          {report.career}
        </Section>
        <Section icon={<Coins size={15} />} title="财富格局">
          {report.wealth}
        </Section>
        <Section icon={<Heart size={15} />} title="感情婚姻">
          {report.relationship}
        </Section>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-gold-light">近三年流年</h3>
          <div className="space-y-2">
            {report.recentThreeYears.map((y) => (
              <div key={y.year} className="rounded-xl border border-white/8 bg-ink-900/50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-serif text-lg font-bold text-gold-light">{y.ganZhi}</span>
                  <span className="text-gray-400">{y.year} · {y.theme}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">{y.advice}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-gold/5 p-3 text-sm leading-relaxed text-gray-300">
          {report.summary}
        </div>
        <p className="text-[11px] leading-relaxed text-gray-600">{report.disclaimer}</p>
      </div>
    </Card>
  );
}

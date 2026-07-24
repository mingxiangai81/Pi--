'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { BaziChart } from '@/components/BaziChart';
import { WuXingRadar } from '@/components/WuXingRadar';
import { DaYunTimeline } from '@/components/DaYunTimeline';
import { Paywall } from '@/components/Paywall';
import { AiReport } from '@/components/AiReport';
import { getChart, getReport, type AiReportContent } from '@/lib/firebase/report';
import type { BaziChart as BaziChartType } from '@/lib/bazi/types';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [chart, setChart] = useState<BaziChartType | null>(null);
  const [report, setReport] = useState<AiReportContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 本地降级：sessionStorage
        if (id.startsWith('local-')) {
          const raw = sessionStorage.getItem(id);
          if (raw) setChart(JSON.parse(raw));
          return;
        }
        const [c, r] = await Promise.all([getChart(id), getReport(id).catch(() => null)]);
        setChart(c);
        if (r) setReport(r);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <main className="px-4 py-16 text-center text-sm text-gray-500">正在载入命盘…</main>;
  }
  if (!chart) {
    return (
      <main className="px-4 py-16 text-center text-sm text-gray-500">
        未找到命盘
        <div className="mt-4">
          <button onClick={() => router.push('/')} className="text-gold-light underline">
            返回排盘
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-4 px-4 py-6">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gold-light"
      >
        <ChevronLeft size={16} /> 重新排盘
      </button>

      {/* 免费层 */}
      <BaziChart chart={chart} />
      <WuXingRadar wuxing={chart.wuxing} />
      <DaYunTimeline daYun={chart.yun.daYun} startAge={chart.yun.startAge} />

      {/* 付费层 */}
      {report ? (
        <AiReport report={report} />
      ) : id.startsWith('local-') ? (
        <p className="rounded-xl border border-white/8 p-4 text-center text-xs text-gray-500">
          登录并接入后端后可解锁 AI 深度报告
        </p>
      ) : (
        <Paywall chartId={id} onUnlocked={setReport} />
      )}
    </main>
  );
}

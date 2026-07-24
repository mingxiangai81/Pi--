'use client';
import { useState } from 'react';
import { Lock, Wand2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { startReportPayment } from '@/lib/pi/client';
import { generateReport, type AiReportContent } from '@/lib/firebase/report';

const PRICE = Number(process.env.NEXT_PUBLIC_REPORT_PRICE_PI ?? 1);

const PREVIEW = ['喜用神与调候判断', '性格深度剖析', '事业 · 财富 · 感情', '近三年流年逐年运势'];

export function Paywall({
  chartId,
  onUnlocked,
}: {
  chartId: string;
  onUnlocked: (report: AiReportContent) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setBusy(true);
    setError(null);
    try {
      const pay = await startReportPayment(chartId, PRICE);
      if (!pay.ok) {
        setError('支付未完成或已取消');
        return;
      }
      const report = await generateReport(chartId);
      onUnlocked(report);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-gold/25">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
      <div className="flex items-center gap-2">
        <Lock size={18} className="text-gold" />
        <h2 className="text-base font-semibold text-gold-light">AI 深度命理报告</h2>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-gray-300">
        {PREVIEW.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <Button onClick={handlePay} disabled={busy}>
          <Wand2 size={16} />
          {busy ? '处理中…' : `支付 ${PRICE} Pi 解锁`}
        </Button>
        {error && <p className="mt-2 text-center text-xs text-cinnabar-light">{error}</p>}
        <p className="mt-2 text-center text-[11px] text-gray-600">
          通过 Pi Network 安全支付 · 服务端双向验证
        </p>
      </div>
    </Card>
  );
}

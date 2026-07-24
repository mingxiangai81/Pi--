'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, LogIn } from 'lucide-react';
import { BirthForm } from '@/components/BirthForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePiAuth } from '@/hooks/usePiAuth';
import { computeBazi } from '@/lib/bazi/engine';
import { saveChart } from '@/lib/firebase/report';
import type { BirthInput } from '@/lib/bazi/types';

export default function HomePage() {
  const router = useRouter();
  const { user, username, loading: authLoading, error: authError, login } = usePiAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: BirthInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const chart = computeBazi(input);
      // 已登录 → 存 Firestore 并跳转；未配置后端时降级到 sessionStorage
      let chartId: string;
      try {
        chartId = await saveChart(chart);
      } catch {
        chartId = `local-${Date.now()}`;
        sessionStorage.setItem(chartId, JSON.stringify(chart));
      }
      router.push(`/result/${chartId}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="px-4 py-8">
      <header className="mb-8 text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10">
          <Moon size={26} className="text-gold" />
        </div>
        <h1 className="text-2xl font-bold tracking-wider text-gold-gradient">玄机 · 八字</h1>
        <p className="mt-1 text-xs tracking-widest text-gray-500">CYBER-CHINESE · 命理推演</p>
      </header>

      {!user ? (
        <Card className="text-center">
          <p className="mb-4 text-sm text-gray-300">使用 Pi 账号一键登录，开启你的命盘推演</p>
          <Button onClick={login} disabled={authLoading}>
            <LogIn size={16} />
            {authLoading ? '登录中…' : '使用 Pi 登录'}
          </Button>
          {authError && <p className="mt-2 text-xs text-cinnabar-light">{authError}</p>}
        </Card>
      ) : (
        <Card title={`欢迎，${username ?? '道友'}`}>
          <BirthForm onSubmit={handleSubmit} loading={submitting} />
          {error && <p className="mt-3 text-center text-xs text-cinnabar-light">{error}</p>}
        </Card>
      )}

      <p className="mt-8 text-center text-[11px] text-gray-600">
        命理分析仅供自我认知与决策参考
      </p>
    </main>
  );
}

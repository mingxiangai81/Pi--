import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getDbClient, getAuthClient, getIdToken } from './client';
import type { BaziChart } from '@/lib/bazi/types';

const FN_BASE = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL ?? '';

/** 保存排盘结果（免费层），返回 chartId */
export async function saveChart(chart: BaziChart): Promise<string> {
  const uid = getAuthClient().currentUser?.uid;
  if (!uid) throw new Error('未登录');
  const ref = await addDoc(collection(getDbClient(), 'charts'), {
    ownerUid: uid,
    input: chart.input,
    chart,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** 读取排盘 */
export async function getChart(chartId: string): Promise<BaziChart | null> {
  const snap = await getDoc(doc(getDbClient(), 'charts', chartId));
  return snap.exists() ? (snap.data().chart as BaziChart) : null;
}

export interface AiReportContent {
  geju: string;
  xiYongShen: { favorable: string[]; unfavorable: string[]; reasoning: string };
  personality: string;
  career: string;
  wealth: string;
  relationship: string;
  recentThreeYears: { year: number; ganZhi: string; theme: string; advice: string }[];
  summary: string;
  disclaimer: string;
}

/** 读已有报告（付费后由 Function 写入） */
export async function getReport(chartId: string): Promise<AiReportContent | null> {
  const snap = await getDoc(doc(getDbClient(), 'reports', chartId));
  return snap.exists() ? (snap.data().content as AiReportContent) : null;
}

/** 触发 AI 报告生成（服务端校验支付后调 LLM） */
export async function generateReport(chartId: string): Promise<AiReportContent> {
  const idToken = await getIdToken();
  const res = await fetch(`${FN_BASE}/generateReport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ chartId }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(error);
  }
  const { report } = await res.json();
  return report as AiReportContent;
}

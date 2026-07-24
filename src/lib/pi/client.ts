import type { PiAuthResult, PiIncompletePayment, PiScope } from './types';
import { getIdToken } from '@/lib/firebase/client';

const SANDBOX = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';
const FN_BASE = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL ?? '';

function pi() {
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('Pi SDK 未加载，请在 Pi Browser 中打开本应用。');
  }
  return window.Pi;
}

/** 幂等初始化，SDK 就绪后调用一次即可 */
let initialized = false;
export function initPi(): void {
  if (initialized) return;
  pi().init({ version: '2.0', sandbox: SANDBOX });
  initialized = true;
}

/** 处理登录时发现的「未完成支付」——补跑 complete，避免用户卡单 */
async function onIncompletePaymentFound(payment: PiIncompletePayment) {
  if (payment.transaction?.txid) {
    await callFn('piComplete', {
      paymentId: payment.identifier,
      txid: payment.transaction.txid,
    });
  }
}

/** 无感登录：拿 Pi uid / username + accessToken */
export async function piLogin(): Promise<PiAuthResult> {
  initPi();
  const scopes: PiScope[] = ['username', 'payments'];
  return pi().authenticate(scopes, onIncompletePaymentFound);
}

/**
 * 发起 Pi 支付。onReadyForServerApproval / onReadyForServerCompletion
 * 两个回调分别把 paymentId、txid 打到 Cloud Functions 做服务端双向验证。
 */
export function startReportPayment(
  chartId: string,
  amount: number,
): Promise<{ ok: boolean; paymentId?: string }> {
  initPi();
  return new Promise((resolve) => {
    pi().createPayment(
      { amount, memo: 'AI 深度命理报告解锁', metadata: { chartId, kind: 'report' } },
      {
        // ① 服务端审批：让后端调 Pi Platform /approve
        onReadyForServerApproval: async (paymentId) => {
          await callFn('piApprove', { paymentId });
        },
        // ② 服务端完成：区块链已出 txid，让后端调 Pi Platform /complete
        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await callFn<{ status: string }>('piComplete', { paymentId, txid });
            resolve({ ok: res.status === 'completed', paymentId });
          } catch {
            resolve({ ok: false, paymentId });
          }
        },
        onCancel: (paymentId) => resolve({ ok: false, paymentId }),
        onError: (err, p) => {
          console.error('[Pi payment error]', err, p);
          resolve({ ok: false });
        },
      },
    );
  });
}

/** 带 Firebase ID Token 调 Cloud Functions（用于鉴权与防篡改） */
async function callFn<T = unknown>(name: string, body: Record<string, unknown>): Promise<T> {
  const idToken = await getIdToken();
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { requireAuth } from './piAuth';

const PI_API_KEY = defineSecret('PI_API_KEY'); // Pi 开发者门户的 Server API Key
const PI_API = 'https://api.minepi.com/v2';

interface PiPayment {
  amount?: number;
  metadata?: { chartId?: string };
}

/** ① 审批：Pi 前端 onReadyForServerApproval → 这里调 /approve */
export const piApprove = onRequest({ secrets: [PI_API_KEY], cors: true }, async (req, res) => {
  try {
    const uid = await requireAuth(req);
    const { paymentId } = req.body as { paymentId: string };

    const r = await fetch(`${PI_API}/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Key ${PI_API_KEY.value()}` },
    });
    if (!r.ok) throw new Error(`Pi approve failed: ${r.status}`);
    const payment = (await r.json()) as PiPayment;

    // 落库：记录该笔支付归属与目标 chartId（供后续解锁校验）
    await admin.firestore().doc(`payments/${paymentId}`).set(
      {
        uid,
        chartId: payment?.metadata?.chartId ?? null,
        amount: payment?.amount ?? null,
        status: 'approved',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    res.json({ status: 'approved' });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** ② 完成：Pi 前端 onReadyForServerCompletion(paymentId, txid) → 这里调 /complete */
export const piComplete = onRequest({ secrets: [PI_API_KEY], cors: true }, async (req, res) => {
  try {
    const uid = await requireAuth(req);
    const { paymentId, txid } = req.body as { paymentId: string; txid: string };

    const r = await fetch(`${PI_API}/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${PI_API_KEY.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });
    if (!r.ok) throw new Error(`Pi complete failed: ${r.status}`);
    const payment = (await r.json()) as PiPayment;

    // 校验归属，写入 completed —— 这是解锁 AI 报告的唯一凭据
    const ref = admin.firestore().doc(`payments/${paymentId}`);
    const snap = await ref.get();
    if (snap.exists && snap.data()?.uid !== uid) {
      throw new Error('支付归属校验失败');
    }
    await ref.set(
      {
        uid,
        chartId: payment?.metadata?.chartId ?? snap.data()?.chartId ?? null,
        txid,
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    res.json({ status: 'completed' });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from './piAuth';
import { BAZI_SYSTEM_PROMPT, buildUserMessage } from './ai/prompt';
import type { BaziChart } from './baziTypes';

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const MODEL = 'claude-opus-4-8';

export const generateReport = onRequest(
  { secrets: [ANTHROPIC_API_KEY], cors: true, timeoutSeconds: 120 },
  async (req, res) => {
    try {
      const uid = await requireAuth(req);
      const { chartId } = req.body as { chartId: string };
      const db = admin.firestore();

      // ① 幂等：已生成直接返回
      const existing = await db.doc(`reports/${chartId}`).get();
      if (existing.exists) {
        res.json({ status: 'ready', report: existing.data()!.content });
        return;
      }

      // ② 付费门槛：必须存在一笔该 chartId、该 uid、status=completed 的支付
      const paid = await db
        .collection('payments')
        .where('chartId', '==', chartId)
        .where('uid', '==', uid)
        .where('status', '==', 'completed')
        .limit(1)
        .get();
      if (paid.empty) {
        res.status(402).json({ error: '未完成支付，无法生成报告' });
        return;
      }

      // ③ 取排盘数据
      const chartSnap = await db.doc(`charts/${chartId}`).get();
      if (!chartSnap.exists) {
        res.status(404).json({ error: '排盘不存在' });
        return;
      }
      const chart = chartSnap.data()!.chart as BaziChart;

      // ④ 调 LLM
      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: BAZI_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildUserMessage(chart, new Date().getFullYear()) },
        ],
      });
      const textBlock = msg.content.find((c) => c.type === 'text');
      const text = textBlock && textBlock.type === 'text' ? textBlock.text : '{}';
      const report = JSON.parse(text); // Prompt 已约束纯 JSON 输出

      // ⑤ 落库
      await db.doc(`reports/${chartId}`).set({
        uid,
        content: report,
        model: MODEL,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ status: 'ready', report });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  },
);

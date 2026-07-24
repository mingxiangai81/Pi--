import { onRequest, type Request } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();

/** 前端 usePiAuth 调用：用 Pi accessToken 换 Firebase custom token */
export const piAuth = onRequest({ cors: true }, async (req, res) => {
  try {
    const { accessToken } = req.body as { accessToken?: string };
    if (!accessToken) throw new Error('缺少 accessToken');

    // 用 accessToken 向 Pi 校验身份，拿到可信 uid/username
    const me = await fetch('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!me.ok) throw new Error('Pi 身份校验失败');
    const { uid, username } = (await me.json()) as { uid: string; username: string };

    const firebaseToken = await admin
      .auth()
      .createCustomToken(uid, { username, provider: 'pi' });
    res.json({ firebaseToken });
  } catch (e) {
    res.status(401).json({ error: (e as Error).message });
  }
});

/** 复用工具：校验请求头里的 Firebase ID Token，返回 uid */
export async function requireAuth(req: Request): Promise<string> {
  const authz = req.headers.authorization ?? '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7) : '';
  if (!token) throw new Error('缺少鉴权令牌');
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

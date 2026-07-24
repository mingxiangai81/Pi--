'use client';
import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithCustomToken, type User } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase/client';
import { piLogin } from '@/lib/pi/client';

const FN_BASE = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL ?? '';

export function usePiAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(getAuthClient(), setUser), []);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Pi 无感登录
      const { accessToken, user: piUser } = await piLogin();
      // 2) 用 Pi accessToken 换 Firebase 自定义令牌（服务端校验 Pi /me）
      const res = await fetch(`${FN_BASE}/piAuth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      if (!res.ok) throw new Error('Firebase 令牌换取失败');
      const { firebaseToken } = await res.json();
      // 3) 登录 Firebase
      await signInWithCustomToken(getAuthClient(), firebaseToken);
      setUsername(piUser.username);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, username, loading, error, login };
}

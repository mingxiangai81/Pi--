import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 惰性初始化：getAuth 会对空 apiKey 立即抛错，若在模块顶层初始化会导致
// Next 服务端预渲染崩溃。这里延迟到客户端首次调用时才初始化。
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function app(): FirebaseApp {
  if (!_app) _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return _app;
}

export function getAuthClient(): Auth {
  if (!_auth) _auth = getAuth(app());
  return _auth;
}

export function getDbClient(): Firestore {
  if (!_db) _db = getFirestore(app());
  return _db;
}

/** 取当前用户的 Firebase ID Token，用于调 Cloud Functions 鉴权 */
export async function getIdToken(): Promise<string> {
  const user = getAuthClient().currentUser;
  if (!user) throw new Error('未登录');
  return user.getIdToken();
}

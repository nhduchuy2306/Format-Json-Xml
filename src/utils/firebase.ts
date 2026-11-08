import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  getFirestore
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export interface SharedSnippet {
  id: string;
  content: string;
  language: 'json' | 'xml';
  title: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number; // Timestamp (Date.now() + 7 days)
}

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const COLLECTION_NAME = 'shares';

// Read config from Vite environment variables or fallback placeholders
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Check if user has provided valid Firebase credentials
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('your_api_key')
  );
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

/**
 * Lazy initialization of Firebase & Firestore with IndexedDB Persistence Cache
 */
function getDb(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase chưa được cấu hình. Vui lòng thêm API Key vào file .env');
  }

  if (dbInstance) return dbInstance;

  if (getApps().length === 0) {
    appInstance = initializeApp(firebaseConfig);
  } else {
    appInstance = getApp();
  }

  try {
    // Enable multi-tab IndexedDB cache to save read quota
    dbInstance = initializeFirestore(appInstance, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // Fallback if initializeFirestore has already been called
    dbInstance = getFirestore(appInstance);
  }

  return dbInstance;
}

/**
 * Generate a short, readable 8-character ID
 */
export function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Build shareable link URL for a snippet ID
 */
export function buildShareUrl(shareId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('s', shareId);
  return url.toString();
}

/**
 * Save new snippet to Firestore with 7-day expiration
 */
export async function createShareSnippet(params: {
  content: string;
  language: 'json' | 'xml';
  title?: string;
}): Promise<{ id: string; url: string; snippet: SharedSnippet }> {
  const trimmed = params.content.trim();
  if (!trimmed) {
    throw new Error('Nội dung rỗng, không thể chia sẻ');
  }

  const byteSize = new Blob([params.content]).size;
  if (byteSize > 1024 * 1024) {
    throw new Error('Dung lượng vượt quá 1MB (giới hạn tối đa của Firestore)');
  }

  const db = getDb();
  const id = generateShareId();
  const now = Date.now();
  const expiresAt = now + SEVEN_DAYS_MS;

  const snippet: SharedSnippet = {
    id,
    content: params.content,
    language: params.language,
    title: params.title || `snippet.${params.language}`,
    createdAt: now,
    updatedAt: now,
    expiresAt,
  };

  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, snippet);

  return {
    id,
    url: buildShareUrl(id),
    snippet,
  };
}

/**
 * Fetch a shared snippet from Firestore by ID.
 * Returns null if not found or expired.
 */
export async function getShareSnippet(id: string): Promise<{
  snippet: SharedSnippet | null;
  expired: boolean;
}> {
  if (!id) return { snippet: null, expired: false };

  const db = getDb();
  const docRef = doc(db, COLLECTION_NAME, id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return { snippet: null, expired: false };
  }

  const data = snap.data() as SharedSnippet;

  // Check 7-day expiration
  if (data.expiresAt && Date.now() > data.expiresAt) {
    return { snippet: null, expired: true };
  }

  return { snippet: data, expired: false };
}

/**
 * Update an existing shared snippet on Firestore
 */
export async function updateShareSnippet(id: string, content: string): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error('Nội dung rỗng, không thể cập nhật');
  }

  const byteSize = new Blob([content]).size;
  if (byteSize > 1024 * 1024) {
    throw new Error('Dung lượng vượt quá 1MB (giới hạn tối đa của Firestore)');
  }

  const db = getDb();
  const docRef = doc(db, COLLECTION_NAME, id);

  await updateDoc(docRef, {
    content,
    updatedAt: Date.now(),
  });
}


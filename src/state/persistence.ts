import type { KBFolder, KBArticle } from '@/types';

const STORAGE_KEY = 'kb-prototype:state-v1';

interface PersistedState {
  version: 1;
  folders: KBFolder[];
  articles: KBArticle[];
}

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadKbState(): { folders: KBFolder[]; articles: KBArticle[] } | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return null;
    if (!Array.isArray(parsed.folders) || !Array.isArray(parsed.articles)) return null;
    return { folders: parsed.folders, articles: parsed.articles };
  } catch (e) {
    console.warn('[kb] failed to load persisted state', e);
    return null;
  }
}

export function saveKbState(folders: KBFolder[], articles: KBArticle[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const payload: PersistedState = { version: 1, folders, articles };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[kb] failed to persist state', e);
  }
}

export function clearKbState(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[kb] failed to clear persisted state', e);
  }
}

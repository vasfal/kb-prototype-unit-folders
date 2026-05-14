import type { KBFolder, KBArticle, ArticleActivity } from '@/types';

const STORAGE_KEY = 'kb-prototype:state-v3';
const ACTIVITY_KEY = 'kb-prototype:activity-v3';

interface PersistedState {
  version: 3;
  folders: KBFolder[];
  articles: KBArticle[];
}

interface PersistedActivity {
  version: 3;
  activities: ArticleActivity[];
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
    if (parsed.version !== 3) return null;
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
    const payload: PersistedState = { version: 3, folders, articles };
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
    storage.removeItem(ACTIVITY_KEY);
  } catch (e) {
    console.warn('[kb] failed to clear persisted state', e);
  }
}

export function loadActivity(): ArticleActivity[] | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(ACTIVITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedActivity;
    if (parsed.version !== 3) return null;
    if (!Array.isArray(parsed.activities)) return null;
    return parsed.activities;
  } catch (e) {
    console.warn('[kb] failed to load persisted activity', e);
    return null;
  }
}

export function saveActivity(activities: ArticleActivity[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const payload: PersistedActivity = { version: 3, activities };
    storage.setItem(ACTIVITY_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[kb] failed to persist activity', e);
  }
}

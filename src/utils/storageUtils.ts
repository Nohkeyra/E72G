export const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn(`LocalStorage quota exceeded for key: ${key}, clearing...`);
        localStorage.removeItem(key);
      } else {
        console.error('Error saving to localStorage', e);
      }
    }
  },
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage', e);
    }
  }
};

/**
 * Safely parses a JSON string that may have come from localStorage.
 * Corrupted/legacy-shaped data must NEVER throw during module init —
 * an uncaught throw here happens before React mounts, so even the
 * ErrorBoundary can't catch it, producing a permanent white screen.
 * On any parse failure the offending key is wiped so the app can
 * recover on the very next load instead of crashing forever.
 */
export function safeJSONParse<T>(raw: string | null, fallback: T, storageKey?: string): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Corrupted JSON in localStorage${storageKey ? ` for key "${storageKey}"` : ''}, resetting to default.`, e);
    if (storageKey) {
      safeLocalStorage.removeItem(storageKey);
    }
    return fallback;
  }
}

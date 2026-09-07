import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/storageUtils';

const DEFAULT_GEMINI_KEY = 'AIzaSyDrVpqsExzVg7gBqIzDwVtF1K4yqUPq-Mg';

export function useGeminiKeys() {
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    const saved = safeLocalStorage.getItem('geminiApiKey') || safeLocalStorage.getItem('geminiKey');
    if (saved) return saved;
    const savedKeys = safeLocalStorage.getItem('geminiKeys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        return Array.isArray(parsed) && parsed[0] ? parsed[0] : '';
      } catch {
        return '';
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_API_KEY || (typeof process !== 'undefined' ? (process.env as any).GEMINI_API_KEY : '') || DEFAULT_GEMINI_KEY;
  });

  useEffect(() => {
    safeLocalStorage.setItem('geminiApiKey', geminiApiKey);
  }, [geminiApiKey]);

  const getActiveGeminiKey = useCallback(() => {
    if (geminiApiKey && typeof geminiApiKey === 'string' && geminiApiKey.trim()) {
      return geminiApiKey.trim();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_API_KEY || (typeof process !== 'undefined' ? (process.env as any).GEMINI_API_KEY : '') || DEFAULT_GEMINI_KEY;
  }, [geminiApiKey]);

  // Compatibility aliases
  const geminiKeys = [geminiApiKey];
  const setGeminiKeys = useCallback((keys: string[]) => {
    setGeminiApiKey(keys[0] || '');
  }, []);
  const activeKeyIndex = 0;
  const setActiveKeyIndex = useCallback(() => {}, []);
  const switchToNextKey = useCallback(() => false, []);

  return { 
    geminiApiKey, 
    setGeminiApiKey, 
    geminiKeys, 
    setGeminiKeys, 
    activeKeyIndex, 
    setActiveKeyIndex, 
    getActiveGeminiKey, 
    switchToNextKey 
  };
}

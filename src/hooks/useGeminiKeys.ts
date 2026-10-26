import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/storageUtils';

export function useGeminiKeys() {
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    const saved = safeLocalStorage.getItem('geminiApiKey') || safeLocalStorage.getItem('geminiKey');
    if (saved && typeof saved === 'string') return saved.trim();
    const savedKeys = safeLocalStorage.getItem('geminiKeys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        return Array.isArray(parsed) && parsed[0] ? String(parsed[0]).trim() : '';
      } catch {
        return '';
      }
    }
    return '';
  });

  useEffect(() => {
    if (geminiApiKey) {
      safeLocalStorage.setItem('geminiApiKey', geminiApiKey);
    } else {
      safeLocalStorage.removeItem('geminiApiKey');
      safeLocalStorage.removeItem('geminiKey');
      safeLocalStorage.removeItem('geminiKeys');
    }
  }, [geminiApiKey]);

  const getActiveGeminiKey = useCallback(() => {
    if (geminiApiKey && typeof geminiApiKey === 'string' && geminiApiKey.trim()) {
      return geminiApiKey.trim();
    }
    return '';
  }, [geminiApiKey]);

  // Compatibility aliases
  const geminiKeys = geminiApiKey ? [geminiApiKey] : [];
  const setGeminiKeys = useCallback((keys: string[]) => {
    const primary = keys[0] ? keys[0].trim() : '';
    setGeminiApiKey(primary);
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

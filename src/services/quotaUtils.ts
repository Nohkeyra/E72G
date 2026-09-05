import { safeLocalStorage } from '../utils/storageUtils';

const QUOTA_KEY = 'gemini_standard_quota';
const QUOTA_LIMIT = 200; // Increased to 200 for power users

export interface QuotaData {
  count: number;
  lastReset: number;
}

export const getGeminiQuota = (): QuotaData => {
  const data = safeLocalStorage.getItem(QUOTA_KEY);
  
  const createDefault = () => {
    const newData = { count: 0, lastReset: Date.now() };
    safeLocalStorage.setItem(QUOTA_KEY, JSON.stringify(newData));
    return newData;
  };

  if (!data) {
    return createDefault();
  }
  
  try {
    const parsed = JSON.parse(data);
    
    // Strict validation of the quota object structure
    if (!parsed || typeof parsed !== 'object' || typeof parsed.count !== 'number' || typeof parsed.lastReset !== 'number') {
      return createDefault();
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - parsed.lastReset > oneDay) {
      const resetData = { count: 0, lastReset: now };
      safeLocalStorage.setItem(QUOTA_KEY, JSON.stringify(resetData));
      return resetData;
    }
    
    return parsed as QuotaData;
  } catch (e) {
    console.warn("Gemini Quota Parse Error - resetting to defaults:", e);
    return createDefault();
  }
};

export const incrementGeminiQuota = () => {
  const quota = getGeminiQuota();
  quota.count += 1;
  safeLocalStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
};

export const isGeminiQuotaExceeded = (): boolean => {
  const quota = getGeminiQuota();
  return quota.count >= QUOTA_LIMIT;
};

export const checkQuota = () => {
  const quota = getGeminiQuota();
  if (quota.count >= QUOTA_LIMIT) {
    throw new Error("Gemini Engine Quota Exceeded. Daily limit reached \u2014 please try again tomorrow.");
  }
};

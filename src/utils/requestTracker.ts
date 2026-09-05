import { safeLocalStorage } from './storageUtils';

const LIMIT = 500;
const KEY = 'gemini_request_count';
const DATE_KEY = 'gemini_request_date';

export const checkAndIncrementRequests = () => {
  const today = new Date().toDateString();
  const storedDate = safeLocalStorage.getItem(DATE_KEY);
  let count = parseInt(safeLocalStorage.getItem(KEY) || '0');

  if (storedDate !== today) {
    count = 0;
    safeLocalStorage.setItem(DATE_KEY, today);
  }

  if (count >= LIMIT) {
    return false;
  }

  safeLocalStorage.setItem(KEY, (count + 1).toString());
  return true;
};

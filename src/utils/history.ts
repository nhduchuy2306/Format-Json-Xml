export interface HistoryItem {
  id: string;
  timestamp: number;
  language: 'json' | 'xml';
  title: string;
  content: string;
  size: number; // in bytes
  lines: number;
}

const STORAGE_KEY_HISTORY = 'format_json_xml_history';
export const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000; // 10 days
const MAX_HISTORY_ITEMS = 50;

/**
 * Filter out items older than 10 days
 */
export function cleanExpiredHistory(items: HistoryItem[]): HistoryItem[] {
  const cutoff = Date.now() - TEN_DAYS_MS;
  return items.filter((item) => item.timestamp >= cutoff);
}

/**
 * Retrieve valid history items (within 10 days), sorted newest first.
 * Automatically cleans up expired items from storage.
 */
export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    
    const parsed: HistoryItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const valid = cleanExpiredHistory(parsed);
    
    // If some items expired, sync back to localStorage to reclaim space
    if (valid.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(valid));
    }

    return valid.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.warn('Lỗi khi đọc lịch sử từ localStorage:', err);
    return [];
  }
}

/**
 * Save history to localStorage with graceful fallback on quota exceeded
 */
function saveHistoryWithQuotaHandling(items: HistoryItem[]): boolean {
  let list = [...items];
  while (list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
      return true;
    } catch {
      // If quota exceeded, pop the oldest item and try again
      list.pop();
    }
  }
  return false;
}

/**
 * Add a new formatted content snippet to history.
 * Avoids duplicate consecutive entries and ensures 10-day retention limit.
 */
export function addHistoryItem(entry: {
  language: 'json' | 'xml';
  title?: string;
  content: string;
}): HistoryItem[] {
  const trimmed = entry.content.trim();
  if (!trimmed) return getHistory();

  const currentList = getHistory();

  // If content is identical to the most recent entry, just update timestamp
  if (currentList.length > 0 && currentList[0].content === entry.content) {
    currentList[0].timestamp = Date.now();
    saveHistoryWithQuotaHandling(currentList);
    return currentList;
  }

  const lines = entry.content.split('\n').length;
  const size = new Blob([entry.content]).size;

  const newItem: HistoryItem = {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    language: entry.language,
    title: entry.title || `snippet.${entry.language}`,
    content: entry.content,
    size,
    lines,
  };

  // Prepend new item, filter expired (> 10 days), and limit max count
  const updated = cleanExpiredHistory([newItem, ...currentList]).slice(0, MAX_HISTORY_ITEMS);
  saveHistoryWithQuotaHandling(updated);

  return updated;
}

/**
 * Delete a specific history item by ID
 */
export function deleteHistoryItem(id: string): HistoryItem[] {
  const currentList = getHistory();
  const updated = currentList.filter((item) => item.id !== id);
  saveHistoryWithQuotaHandling(updated);
  return updated;
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch {
    // Ignore
  }
}

/**
 * Format bytes into human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format relative time (e.g., "Vừa xong", "15 phút trước", "Hôm nay 14:30")
 */
export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) {
    const d = new Date(timestamp);
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return `Hôm qua ${timeStr}`;
  }
  if (diffDay < 10) return `${diffDay} ngày trước`;

  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}


import React, { useState, useMemo } from 'react';
import { 
  History, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  FileJson, 
  FileCode, 
  Search, 
  ArrowUpRight,
  PlusCircle,
  Clock
} from 'lucide-react';
import type { HistoryItem } from '../utils/history';
import { formatBytes, formatRelativeTime } from '../utils/history';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onOpenInNewTab: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onOpenInNewTab,
  onDelete,
  onClearAll,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [langFilter, setLangFilter] = useState<'all' | 'json' | 'xml'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  // Filter history based on search query and language
  const filteredList = useMemo(() => {
    return history.filter((item) => {
      const matchLang = langFilter === 'all' || item.language === langFilter;
      if (!matchLang) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
      );
    });
  }, [history, searchQuery, langFilter]);

  if (!isOpen) return null;

  const handleCopy = (item: HistoryItem) => {
    navigator.clipboard.writeText(item.content).then(() => {
      setCopiedId(item.id);
      onNotify('Đã sao chép nội dung lịch sử vào clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90dvh] flex flex-col rounded-xl bg-surface border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40 select-none">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <History size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Lịch sử định dạng</h2>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Lưu 10 ngày gần nhất
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-fg-secondary mt-0.5">
                Dữ liệu lưu an toàn trên trình duyệt này và tự động hủy sau 10 ngày.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-fg-secondary hover:text-foreground hover:bg-surface-hover transition-colors shrink-0"
            title="Đóng (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search, Filters, and Clear */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-surface/50">
          <div className="flex items-center gap-2 flex-1 max-w-full sm:max-w-sm">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-secondary" />
              <input
                type="text"
                placeholder="Tìm kiếm nội dung lịch sử..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-surface-secondary border border-border text-foreground placeholder:text-fg-secondary/60 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Lang filters */}
            <div className="flex items-center bg-surface-secondary rounded-md p-0.5 border border-border text-xs">
              <button
                onClick={() => setLangFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  langFilter === 'all'
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'text-fg-secondary hover:text-foreground'
                }`}
              >
                Tất cả ({history.length})
              </button>
              <button
                onClick={() => setLangFilter('json')}
                className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                  langFilter === 'json'
                    ? 'bg-amber-600 text-white font-medium shadow-xs'
                    : 'text-fg-secondary hover:text-foreground'
                }`}
              >
                <FileJson size={13} />
                JSON
              </button>
              <button
                onClick={() => setLangFilter('xml')}
                className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                  langFilter === 'xml'
                    ? 'bg-emerald-600 text-white font-medium shadow-xs'
                    : 'text-fg-secondary hover:text-foreground'
                }`}
              >
                <FileCode size={13} />
                XML
              </button>
            </div>

            {/* Clear All action */}
            {history.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                      onNotify('Đã xóa toàn bộ lịch sử!', 'info');
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="text-xs px-2 py-1.5 rounded-md hover:bg-surface-hover text-fg-secondary"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Xóa toàn bộ lịch sử"
                >
                  <Trash2 size={13} />
                  <span>Xóa hết</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredList.length === 0 ? (
            <div className="py-16 text-center text-fg-secondary">
              <Clock size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium text-foreground">Chưa có lịch sử định dạng nào</p>
              <p className="text-xs mt-1 max-w-sm mx-auto text-fg-secondary">
                Mỗi khi bạn dán dữ liệu và bấm <b>Format</b> (hoặc <b>Ctrl + S</b>), một bản sao lưu sẽ tự động xuất hiện ở đây trong vòng 10 ngày.
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="group p-3.5 rounded-lg border border-border hover:border-blue-500/40 bg-surface-secondary/40 hover:bg-surface-secondary/80 transition-all shadow-xs flex flex-col gap-2.5"
              >
                {/* Item Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {item.language === 'json' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <FileJson size={13} />
                        JSON
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <FileCode size={13} />
                        XML
                      </span>
                    )}
                    <span className="text-xs font-medium text-foreground">{item.title}</span>
                    <span className="text-[11px] text-fg-secondary flex items-center gap-1">
                      <Clock size={11} />
                      {formatRelativeTime(item.timestamp)}
                    </span>
                    <span className="text-[11px] text-fg-secondary bg-surface px-1.5 py-0.5 rounded border border-border">
                      {item.lines} dòng • {formatBytes(item.size)}
                    </span>
                  </div>

                  {/* Quick Item Actions */}
                  <div className="flex items-center gap-1 self-end sm:self-auto opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-1.5 rounded-md hover:bg-surface text-fg-secondary hover:text-foreground transition-colors"
                      title="Sao chép nội dung"
                    >
                      {copiedId === item.id ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => onRestore(item)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition-colors"
                      title="Nạp nội dung này vào Tab đang mở"
                    >
                      <ArrowUpRight size={13} />
                      <span>Nạp vào Tab</span>
                    </button>
                    <button
                      onClick={() => onOpenInNewTab(item)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-surface hover:bg-surface-hover text-foreground border border-border font-medium transition-colors"
                      title="Mở nội dung trong Tab mới"
                    >
                      <PlusCircle size={13} />
                      <span>Tab mới</span>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-fg-secondary hover:text-red-500 transition-colors"
                      title="Xóa bản ghi này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="p-2.5 rounded bg-surface border border-border/80 font-mono text-[11px] text-fg-secondary overflow-hidden max-h-20 select-text leading-relaxed whitespace-pre-wrap">
                  {item.content.slice(0, 300)}
                  {item.content.length > 300 && '...'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-secondary/30 flex items-center justify-between text-xs text-fg-secondary select-none">
          <span>
            Đang hiển thị {filteredList.length} / {history.length} bản ghi
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-surface border border-border hover:bg-surface-hover text-foreground font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};


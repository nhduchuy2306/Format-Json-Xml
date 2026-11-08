import React from 'react';
import { 
  Code2, 
  Sun, 
  Moon, 
  GitCompare, 
  FileJson, 
  FileCode,
  Columns,
  History,
  Share2
} from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNewTab: (lang?: 'json' | 'xml') => void;
  onOpenCompare: (lang: 'json' | 'xml') => void;
  onOpenSplit: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenShare: () => void;
  activeShareId?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onNewTab,
  onOpenCompare,
  onOpenSplit,
  onOpenHistory,
  historyCount,
  onOpenShare,
  activeShareId,
}) => {
  return (
    <header className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-base tracking-tight text-foreground">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Code2 size={18} />
          </div>
          <span>JSON<span className="text-blue-500">.</span>XML</span>
          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            PRO
          </span>
        </div>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Quick Add Tab Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNewTab('json')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded hover:bg-surface-hover text-foreground transition-colors"
            title="Tạo Tab JSON mới"
          >
            <FileJson size={14} className="text-amber-500" />
            <span>+ JSON</span>
          </button>
          <button
            onClick={() => onNewTab('xml')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded hover:bg-surface-hover text-foreground transition-colors"
            title="Tạo Tab XML mới"
          >
            <FileCode size={14} className="text-emerald-500" />
            <span>+ XML</span>
          </button>
        </div>
      </div>

      {/* Main Compare Buttons & Global Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenCompare('json')}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all shadow-sm active:scale-95"
          title="Mở tab so sánh 2 văn bản JSON (Monaco Diff)"
        >
          <GitCompare size={14} />
          <span>Compare JSON</span>
        </button>

        <button
          onClick={() => onOpenCompare('xml')}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all shadow-sm active:scale-95"
          title="Mở tab so sánh 2 văn bản XML (Monaco Diff)"
        >
          <GitCompare size={14} />
          <span>Compare XML</span>
        </button>

        <button
          onClick={onOpenSplit}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-all shadow-sm active:scale-95"
          title="Mở màn hình chia đôi 2 khung soạn thảo song song"
        >
          <Columns size={14} />
          <span>Split View</span>
        </button>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md hover:bg-surface-hover text-foreground border border-border transition-all shadow-xs active:scale-95"
          title="Xem lịch sử định dạng (10 ngày gần nhất)"
        >
          <History size={14} className="text-blue-500" />
          <span>Lịch sử</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-blue-500 font-semibold">
              {historyCount}
            </span>
          )}
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-all shadow-xs active:scale-95 ${
            activeShareId
              ? 'bg-blue-600 hover:bg-blue-700 text-white font-semibold'
              : 'hover:bg-surface-hover text-foreground border border-border'
          }`}
          title={
            activeShareId
              ? `Đang xem link chia sẻ (${activeShareId}) - Bấm để lưu hoặc quản lý`
              : 'Chia sẻ tài liệu này lên mạng (Firebase)'
          }
        >
          <Share2 size={14} className={activeShareId ? 'text-white' : 'text-blue-500'} />
          <span>{activeShareId ? 'Chia sẻ (Đang mở)' : 'Chia sẻ'}</span>
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md text-fg-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
          title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { 
  Sparkles, 
  Minimize2, 
  Copy, 
  Trash2, 
  Upload, 
  Download, 
  GitCompare, 
  Check, 
  FileJson, 
  FileCode,
  Layers,
  ZoomIn,
  ZoomOut,
  Columns
} from 'lucide-react';

interface ToolbarProps {
  language: 'json' | 'xml';
  onLanguageChange: (lang: 'json' | 'xml') => void;
  indent: number | 'tab';
  onIndentChange: (indent: number | 'tab') => void;
  enableNested: boolean;
  onToggleNested: () => void;
  onFormat: () => void;
  onMinify: () => void;
  onClear: () => void;
  onCopy: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onOpenCompare: (lang: 'json' | 'xml') => void;
  onToggleSplitView?: () => void;
  isSplitMode?: boolean;
  fontSize: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isCompareMode?: boolean;
  isCopied?: boolean;
  stats?: {
    lines: number;
    size: number;
  };
}

export const Toolbar: React.FC<ToolbarProps> = ({
  language,
  onLanguageChange,
  indent,
  onIndentChange,
  enableNested,
  onToggleNested,
  onFormat,
  onMinify,
  onClear,
  onCopy,
  onUpload,
  onDownload,
  onOpenCompare,
  onToggleSplitView,
  isSplitMode = false,
  fontSize,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isCompareMode = false,
  isCopied = false,
  stats,
}) => {
  return (
    <div className="h-10 bg-surface/50 border-b border-border px-2 sm:px-3 flex items-center justify-between text-xs select-none gap-2 overflow-x-auto scrollbar-none">
      {/* Left Action Icons */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {!isCompareMode ? (
          <>
            {/* Format Icon Button (Ctrl + S) */}
            <button
              onClick={onFormat}
              className="p-1.5 rounded-md font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all active:scale-95 flex items-center justify-center"
              title="Format văn bản (Phím tắt: Ctrl + S)"
            >
              <Sparkles size={15} />
            </button>

            {/* Nested Format Icon Toggle */}
            <button
              onClick={onToggleNested}
              className={`p-1.5 rounded-md border transition-all relative flex items-center justify-center ${
                enableNested
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-300'
                  : 'bg-transparent border-border text-fg-secondary hover:text-foreground hover:bg-surface-hover'
              }`}
              title="Nested Format: Tự động giải mã & format các chuỗi serialized lồng nhau"
            >
              <Layers size={15} className={enableNested ? 'text-purple-500' : 'text-fg-secondary'} />
              <span
                className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                  enableNested ? 'bg-purple-500' : 'bg-transparent'
                }`}
              />
            </button>

            {/* Minify Icon */}
            <button
              onClick={onMinify}
              className="p-1.5 rounded-md hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors border border-transparent hover:border-border flex items-center justify-center"
              title="Minify (Nén dòng dữ liệu)"
            >
              <Minimize2 size={15} />
            </button>

            {/* Split Screen Icon Toggle */}
            {onToggleSplitView && (
              <button
                onClick={onToggleSplitView}
                className={`p-1.5 rounded-md border transition-all flex items-center justify-center ${
                  isSplitMode
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-300'
                    : 'bg-transparent border-border text-fg-secondary hover:text-foreground hover:bg-surface-hover'
                }`}
                title={isSplitMode ? 'Quay về màn hình đơn' : 'Chia đôi màn hình'}
              >
                <Columns size={15} className={isSplitMode ? 'text-cyan-500' : 'text-fg-secondary'} />
              </button>
            )}

            <div className="h-4 w-px bg-border mx-1" />

            {/* Language Selector (Icon-based with active indicator) */}
            <div className="flex items-center bg-surface-hover rounded-md p-0.5 border border-border">
              <button
                onClick={() => onLanguageChange('json')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] transition-colors ${
                  language === 'json'
                    ? 'bg-background text-amber-500 font-semibold shadow-xs'
                    : 'text-fg-secondary hover:text-foreground'
                }`}
                title="Định dạng JSON"
              >
                <FileJson size={13} />
                <span>JSON</span>
              </button>
              <button
                onClick={() => onLanguageChange('xml')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] transition-colors ${
                  language === 'xml'
                    ? 'bg-background text-emerald-500 font-semibold shadow-xs'
                    : 'text-fg-secondary hover:text-foreground'
                }`}
                title="Định dạng XML"
              >
                <FileCode size={13} />
                <span>XML</span>
              </button>
            </div>

            {/* Indentation Selector */}
            <select
              value={indent}
              onChange={(e) => {
                const val = e.target.value;
                onIndentChange(val === 'tab' ? 'tab' : parseInt(val, 10));
              }}
              className="bg-surface-hover border border-border rounded-md px-1.5 py-1 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              title="Khoảng cách thụt dòng"
            >
              <option value={2}>2 sp</option>
              <option value={4}>4 sp</option>
              <option value="tab">Tab</option>
            </select>
          </>
        ) : (
          /* Compare Toolbar */
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-500 flex items-center gap-1">
              <GitCompare size={14} />
              <span>Diff ({language.toUpperCase()})</span>
            </span>
          </div>
        )}
      </div>

      {/* Right Utilities (Icon-only with Tooltips) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Zoom Controls (hidden on mobile to save space) */}
        <div 
          className="hidden sm:flex items-center bg-surface-hover/80 rounded-md px-1 py-0.5 border border-border gap-0.5"
          title="Phóng to / Thu nhỏ (Ctrl + Cuộn chuột hoặc phím Ctrl và +/-)"
        >
          <button
            onClick={onZoomOut}
            className="p-1 rounded hover:bg-surface-active text-fg-secondary hover:text-foreground transition-colors"
            title="Thu nhỏ font chữ (Ctrl + -)"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={onZoomReset}
            className="px-1 py-0.5 text-[11px] font-mono font-medium text-fg-secondary hover:text-foreground hover:bg-surface-active rounded transition-colors"
            title="Click để reset 100% (Ctrl + 0)"
          >
            {Math.round((fontSize / 14) * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1 rounded hover:bg-surface-active text-fg-secondary hover:text-foreground transition-colors"
            title="Phóng to font chữ (Ctrl + +)"
          >
            <ZoomIn size={12} />
          </button>
        </div>

        <div className="hidden sm:block h-4 w-px bg-border mx-1" />

        {!isCompareMode && (
          <>
            {/* Quick Compare Icons */}
            <button
              onClick={() => onOpenCompare('json')}
              className="p-1.5 rounded hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors flex items-center justify-center"
              title="Mở tab so sánh JSON (Monaco Diff)"
            >
              <GitCompare size={14} />
            </button>
            <button
              onClick={() => onOpenCompare('xml')}
              className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors flex items-center justify-center"
              title="Mở tab so sánh XML (Monaco Diff)"
            >
              <GitCompare size={14} className="rotate-90" />
            </button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Upload File Icon */}
            <button
              onClick={onUpload}
              className="p-1.5 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors flex items-center justify-center"
              title="Mở file từ máy tính (.json, .xml, .txt)"
            >
              <Upload size={14} />
            </button>

            {/* Download File Icon */}
            <button
              onClick={onDownload}
              className="p-1.5 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors flex items-center justify-center"
              title="Tải nội dung về máy tính"
            >
              <Download size={14} />
            </button>

            {/* Copy Icon */}
            <button
              onClick={onCopy}
              className={`p-1.5 rounded transition-colors flex items-center justify-center ${
                isCopied
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 font-semibold'
                  : 'hover:bg-surface-hover text-fg-secondary hover:text-foreground'
              }`}
              title={isCopied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép toàn bộ'}
            >
              {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>

            {/* Clear Icon */}
            <button
              onClick={onClear}
              className="p-1.5 rounded hover:bg-red-500/10 text-fg-secondary hover:text-red-500 transition-colors flex items-center justify-center"
              title="Xóa trắng nội dung"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}

        {/* Stats Info */}
        {stats && (
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-border text-[11px] text-fg-secondary font-mono">
            <span>{stats.lines.toLocaleString()} l</span>
            <span>&bull;</span>
            <span>{(stats.size / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </div>
    </div>
  );
};

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
  ZoomOut
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
  fontSize,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isCompareMode = false,
  isCopied = false,
  stats,
}) => {
  return (
    <div className="h-10 bg-surface/50 border-b border-border px-3 flex items-center justify-between text-xs select-none gap-2 overflow-x-auto scrollbar-none">
      {/* Left Actions */}
      <div className="flex items-center gap-1.5 min-w-max">
        {!isCompareMode ? (
          <>
            {/* Format Button (Ctrl + S) */}
            <button
              onClick={onFormat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95"
              title="Định dạng văn bản (Phím tắt: Ctrl + S)"
            >
              <Sparkles size={14} />
              <span>Format</span>
              <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 bg-blue-700/60 rounded text-[10px] text-blue-100 font-mono">
                Ctrl+S
              </kbd>
            </button>

            {/* Nested Format Option Toggle */}
            <button
              onClick={onToggleNested}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
                enableNested
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-300 font-medium'
                  : 'bg-transparent border-border text-fg-secondary hover:text-foreground hover:bg-surface-hover'
              }`}
              title="Tự động giải mã & format các chuỗi serialized lồng nhau (Nested JSON string / CDATA XML)"
            >
              <Layers size={14} className={enableNested ? 'text-purple-500' : 'text-fg-secondary'} />
              <span>Nested Format</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  enableNested ? 'bg-purple-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
            </button>

            {/* Minify */}
            <button
              onClick={onMinify}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-surface-hover text-foreground transition-colors border border-transparent hover:border-border"
              title="Nén dòng (Minify / Compact)"
            >
              <Minimize2 size={13} />
              <span>Minify</span>
            </button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Language Selector */}
            <div className="flex items-center bg-surface-hover/80 rounded-md p-0.5 border border-border">
              <button
                onClick={() => onLanguageChange('json')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  language === 'json'
                    ? 'bg-background text-amber-500 font-medium shadow-sm'
                    : 'text-fg-secondary hover:text-foreground'
                }`}
              >
                <FileJson size={12} />
                <span>JSON</span>
              </button>
              <button
                onClick={() => onLanguageChange('xml')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  language === 'xml'
                    ? 'bg-background text-emerald-500 font-medium shadow-sm'
                    : 'text-fg-secondary hover:text-foreground'
                }`}
              >
                <FileCode size={12} />
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
              className="bg-surface-hover border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              title="Khoảng cách thụt dòng"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          </>
        ) : (
          /* Compare Toolbar */
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-500 flex items-center gap-1">
              <GitCompare size={14} />
              <span>Chế độ So Sánh ({language.toUpperCase()})</span>
            </span>
            <div className="text-fg-secondary text-[11px]">
              (Bản Gốc bên trái &bull; Bản Đã Sửa bên phải &bull; Highlight khác biệt trực tiếp)
            </div>
          </div>
        )}
      </div>

      {/* Right Utilities */}
      <div className="flex items-center gap-1.5 min-w-max">
        {/* Zoom In / Out Controls */}
        <div 
          className="flex items-center bg-surface-hover/80 rounded-md px-1 py-0.5 border border-border gap-0.5"
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
            className="px-1.5 py-0.5 text-[11px] font-mono font-medium text-fg-secondary hover:text-foreground hover:bg-surface-active rounded transition-colors"
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

        <div className="h-4 w-px bg-border mx-1" />

        {!isCompareMode && (
          <>
            {/* Quick Compare Buttons */}
            <button
              onClick={() => onOpenCompare('json')}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded hover:bg-surface-hover text-amber-600 dark:text-amber-400 font-medium transition-colors"
              title="So sánh JSON"
            >
              <GitCompare size={12} />
              <span>Compare JSON</span>
            </button>
            <button
              onClick={() => onOpenCompare('xml')}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded hover:bg-surface-hover text-emerald-600 dark:text-emerald-400 font-medium transition-colors"
              title="So sánh XML"
            >
              <GitCompare size={12} />
              <span>Compare XML</span>
            </button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Upload File */}
            <button
              onClick={onUpload}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors"
              title="Mở file từ máy tính (.json, .xml, .txt)"
            >
              <Upload size={13} />
              <span className="hidden sm:inline">Upload</span>
            </button>

            {/* Download File */}
            <button
              onClick={onDownload}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors"
              title="Tải nội dung về máy"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Copy */}
            <button
              onClick={onCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                isCopied
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 font-semibold'
                  : 'hover:bg-surface-hover text-fg-secondary hover:text-foreground'
              }`}
              title="Sao chép toàn bộ"
            >
              {isCopied ? <Check size={13} /> : <Copy size={13} />}
              <span>{isCopied ? 'Đã copy' : 'Copy'}</span>
            </button>

            {/* Clear */}
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10 text-fg-secondary hover:text-red-500 transition-colors"
              title="Xóa trắng nội dung"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </>
        )}

        {/* Stats Info */}
        {stats && (
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border text-[11px] text-fg-secondary">
            <span>{stats.lines.toLocaleString()} dòng</span>
            <span>&bull;</span>
            <span>{(stats.size / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </div>
    </div>
  );
};


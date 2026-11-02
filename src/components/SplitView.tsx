import React, { useRef, useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { 
  ArrowLeftRight, 
  Columns, 
  Rows, 
  Sparkles, 
  Minimize2, 
  Copy, 
  Trash2, 
  GitCompare, 
  FileJson, 
  FileCode,
  Check,
  GripVertical,
  GripHorizontal
} from 'lucide-react';
import { formatJson, formatXml, minifyJson, minifyXml } from '../utils/formatter';

interface SplitViewProps {
  leftTitle?: string;
  leftLanguage: 'json' | 'xml';
  leftContent: string;
  rightTitle?: string;
  rightLanguage: 'json' | 'xml';
  rightContent: string;
  splitOrientation: 'horizontal' | 'vertical';
  onChangeLeftContent: (val: string) => void;
  onChangeRightContent: (val: string) => void;
  onChangeLeftLanguage: (lang: 'json' | 'xml') => void;
  onChangeRightLanguage: (lang: 'json' | 'xml') => void;
  onToggleOrientation: () => void;
  onCompareWithDiff: () => void;
  theme: 'dark' | 'light';
  indent: number | 'tab';
  fontSize: number;
  enableNested: boolean;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SplitView: React.FC<SplitViewProps> = ({
  leftLanguage,
  leftContent,
  rightLanguage,
  rightContent,
  splitOrientation,
  onChangeLeftContent,
  onChangeRightContent,
  onChangeLeftLanguage,
  onChangeRightLanguage,
  onToggleOrientation,
  onCompareWithDiff,
  theme,
  indent,
  fontSize,
  enableNested,
  onNotify,
}) => {
  const [leftCopied, setLeftCopied] = useState(false);
  const [rightCopied, setRightCopied] = useState(false);
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage 15% - 85%
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftEditorRef = useRef<any>(null);
  const rightEditorRef = useRef<any>(null);

  const isHorizontal = splitOrientation === 'horizontal';

  // Format Both
  const handleFormatBoth = useCallback(() => {
    const fnL = leftLanguage === 'json' ? formatJson : formatXml;
    const resL = fnL(leftContent, indent, enableNested);
    if (resL.success) onChangeLeftContent(resL.content);

    const fnR = rightLanguage === 'json' ? formatJson : formatXml;
    const resR = fnR(rightContent, indent, enableNested);
    if (resR.success) onChangeRightContent(resR.content);

    onNotify('✨ Đã format cả 2 khung soạn thảo!', 'success');
  }, [leftLanguage, leftContent, rightLanguage, rightContent, indent, enableNested, onChangeLeftContent, onChangeRightContent, onNotify]);

  const handleLeftMount = (editor: any, monaco: Monaco) => {
    leftEditorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleFormatBoth();
    });
  };

  const handleRightMount = (editor: any, monaco: Monaco) => {
    rightEditorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleFormatBoth();
    });
  };

  // Drag to resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (isHorizontal) {
        const relativeX = e.clientX - rect.left;
        const newRatio = (relativeX / rect.width) * 100;
        setSplitRatio(Math.min(85, Math.max(15, newRatio)));
      } else {
        const relativeY = e.clientY - rect.top;
        const newRatio = (relativeY / rect.height) * 100;
        setSplitRatio(Math.min(85, Math.max(15, newRatio)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isHorizontal]);

  // Reset split ratio to 50% on double click
  const handleResetRatio = () => {
    setSplitRatio(50);
  };

  // Format Left
  const handleFormatLeft = () => {
    const fn = leftLanguage === 'json' ? formatJson : formatXml;
    const res = fn(leftContent, indent, enableNested);
    if (res.success) {
      onChangeLeftContent(res.content);
      onNotify('✨ Đã format khung bên trái!', 'success');
    } else {
      onNotify(res.error || 'Lỗi format khung bên trái', 'error');
    }
  };

  // Format Right
  const handleFormatRight = () => {
    const fn = rightLanguage === 'json' ? formatJson : formatXml;
    const res = fn(rightContent, indent, enableNested);
    if (res.success) {
      onChangeRightContent(res.content);
      onNotify('✨ Đã format khung bên phải!', 'success');
    } else {
      onNotify(res.error || 'Lỗi format khung bên phải', 'error');
    }
  };

  // Minify Left
  const handleMinifyLeft = () => {
    const fn = leftLanguage === 'json' ? minifyJson : minifyXml;
    const res = fn(leftContent);
    if (res.success) {
      onChangeLeftContent(res.content);
      onNotify('Đã nén khung bên trái!', 'success');
    }
  };

  // Minify Right
  const handleMinifyRight = () => {
    const fn = rightLanguage === 'json' ? minifyJson : minifyXml;
    const res = fn(rightContent);
    if (res.success) {
      onChangeRightContent(res.content);
      onNotify('Đã nén khung bên phải!', 'success');
    }
  };

  // Copy Left
  const handleCopyLeft = () => {
    if (!leftContent) return;
    navigator.clipboard.writeText(leftContent).then(() => {
      setLeftCopied(true);
      setTimeout(() => setLeftCopied(false), 1200);
      onNotify('Đã copy khung bên trái!', 'success');
    });
  };

  // Copy Right
  const handleCopyRight = () => {
    if (!rightContent) return;
    navigator.clipboard.writeText(rightContent).then(() => {
      setRightCopied(true);
      setTimeout(() => setRightCopied(false), 1200);
      onNotify('Đã copy khung bên phải!', 'success');
    });
  };

  // Swap Left & Right
  const handleSwap = () => {
    const tempContent = leftContent;
    const tempLang = leftLanguage;
    onChangeLeftContent(rightContent);
    onChangeLeftLanguage(rightLanguage);
    onChangeRightContent(tempContent);
    onChangeRightLanguage(tempLang);
    onNotify('Đã hoán đổi nội dung 2 bên!', 'info');
  };

  const leftLines = leftContent.split('\n').length;
  const leftSize = (new Blob([leftContent]).size / 1024).toFixed(1);

  const rightLines = rightContent.split('\n').length;
  const rightSize = (new Blob([rightContent]).size / 1024).toFixed(1);

  return (
    <div 
      ref={containerRef}
      className={`flex-1 flex ${isHorizontal ? 'flex-row' : 'flex-col'} h-full w-full overflow-hidden bg-background relative ${
        isDragging ? (isHorizontal ? 'cursor-col-resize select-none' : 'cursor-row-resize select-none') : ''
      }`}
    >
      {/* Invisible overlay while dragging to prevent iframe/Monaco from capturing mouse events */}
      {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}

      {/* LEFT PANE */}
      <div 
        style={isHorizontal ? { width: `${splitRatio}%` } : { height: `${splitRatio}%` }}
        className="flex flex-col min-w-0 min-h-0 overflow-hidden"
      >
        {/* Left Sub-Header (No Request text, just clean controls) */}
        <div className="h-8 bg-surface/80 border-b border-border px-2 flex items-center justify-between text-xs select-none">
          {/* Left Language Toggle */}
          <div className="flex items-center bg-surface-hover rounded p-0.5 border border-border text-[11px]">
            <button
              onClick={() => onChangeLeftLanguage('json')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                leftLanguage === 'json'
                  ? 'bg-background text-amber-500 font-semibold shadow-xs'
                  : 'text-fg-secondary hover:text-foreground'
              }`}
              title="Chuyển bên trái sang JSON"
            >
              <FileJson size={11} /> JSON
            </button>
            <button
              onClick={() => onChangeLeftLanguage('xml')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                leftLanguage === 'xml'
                  ? 'bg-background text-emerald-500 font-semibold shadow-xs'
                  : 'text-fg-secondary hover:text-foreground'
              }`}
              title="Chuyển bên trái sang XML"
            >
              <FileCode size={11} /> XML
            </button>
          </div>

          {/* Left Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFormatLeft}
              className="p-1 rounded hover:bg-surface-hover text-blue-500 transition-colors"
              title="Format bên trái"
            >
              <Sparkles size={13} />
            </button>
            <button
              onClick={handleMinifyLeft}
              className="p-1 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors"
              title="Minify bên trái"
            >
              <Minimize2 size={13} />
            </button>
            <button
              onClick={handleCopyLeft}
              className="p-1 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors"
              title="Copy bên trái"
            >
              {leftCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            </button>
            <button
              onClick={() => onChangeLeftContent('')}
              className="p-1 rounded hover:bg-red-500/10 text-fg-secondary hover:text-red-500 transition-colors"
              title="Xóa trắng bên trái"
            >
              <Trash2 size={13} />
            </button>
            <span className="text-[10px] text-fg-secondary pl-1 border-l border-border hidden sm:inline">
              {leftLines} dòng &bull; {leftSize} KB
            </span>
          </div>
        </div>

        {/* Left Monaco Editor */}
        <div className="flex-1 w-full h-[calc(100%-32px)]">
          <Editor
            height="100%"
            language={leftLanguage}
            value={leftContent}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={(val) => onChangeLeftContent(val || '')}
            onMount={handleLeftMount}
            options={{
              fontSize,
              mouseWheelZoom: true,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Menlo, Monaco, monospace",
              lineNumbers: 'on',
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: indent === 'tab' ? 2 : indent,
            }}
          />
        </div>
      </div>

      {/* DRAGGABLE RESIZER & CENTER CONTROLS */}
      <div 
        className={`bg-surface flex ${
          isHorizontal 
            ? 'flex-col w-9 justify-center items-center py-2 border-x border-border' 
            : 'flex-row h-8 justify-center items-center px-2 border-y border-border'
        } gap-1 z-20 shrink-0 select-none shadow-xs relative`}
      >
        {/* Drag handle line on the divider border */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleResetRatio}
          className={`absolute ${
            isHorizontal 
              ? 'inset-y-0 -left-1.5 -right-1.5 cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500/40' 
              : 'inset-x-0 -top-1.5 -bottom-1.5 cursor-row-resize hover:bg-blue-500/20 active:bg-blue-500/40'
          } z-30 flex items-center justify-center transition-colors`}
          title="Kéo sang trái/phải để thu hẹp hoặc mở rộng view (Double click để chia đều 50/50)"
        >
          {isHorizontal ? (
            <GripVertical size={12} className="text-fg-secondary/50 pointer-events-none" />
          ) : (
            <GripHorizontal size={12} className="text-fg-secondary/50 pointer-events-none" />
          )}
        </div>

        {/* Center Quick Action Buttons */}
        <button
          onClick={handleSwap}
          className="p-1.5 rounded hover:bg-surface-active text-fg-secondary hover:text-foreground transition-colors z-40"
          title="Hoán đổi nội dung 2 bên"
        >
          <ArrowLeftRight size={13} />
        </button>

        <button
          onClick={onCompareWithDiff}
          className="p-1.5 rounded hover:bg-surface-active text-amber-500 transition-colors z-40"
          title="So sánh Diff trực tiếp giữa 2 bên"
        >
          <GitCompare size={13} />
        </button>

        <button
          onClick={onToggleOrientation}
          className="p-1.5 rounded hover:bg-surface-active text-fg-secondary hover:text-foreground transition-colors z-40"
          title={isHorizontal ? 'Chuyển sang chia dọc (Trên / Dưới)' : 'Chuyển sang chia ngang (Trái / Phải)'}
        >
          {isHorizontal ? <Rows size={13} /> : <Columns size={13} />}
        </button>

        <button
          onClick={handleFormatBoth}
          className="p-1.5 rounded hover:bg-blue-600 hover:text-white text-blue-500 transition-colors z-40"
          title="Format CẢ 2 bên (Ctrl+S)"
        >
          <Sparkles size={13} />
        </button>
      </div>

      {/* RIGHT PANE */}
      <div 
        style={isHorizontal ? { width: `${100 - splitRatio}%` } : { height: `${100 - splitRatio}%` }}
        className="flex flex-col min-w-0 min-h-0 overflow-hidden"
      >
        {/* Right Sub-Header (No Response text, just clean controls) */}
        <div className="h-8 bg-surface/80 border-b border-border px-2 flex items-center justify-between text-xs select-none">
          {/* Right Language Toggle */}
          <div className="flex items-center bg-surface-hover rounded p-0.5 border border-border text-[11px]">
            <button
              onClick={() => onChangeRightLanguage('json')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                rightLanguage === 'json'
                  ? 'bg-background text-amber-500 font-semibold shadow-xs'
                  : 'text-fg-secondary hover:text-foreground'
              }`}
              title="Chuyển bên phải sang JSON"
            >
              <FileJson size={11} /> JSON
            </button>
            <button
              onClick={() => onChangeRightLanguage('xml')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${
                rightLanguage === 'xml'
                  ? 'bg-background text-emerald-500 font-semibold shadow-xs'
                  : 'text-fg-secondary hover:text-foreground'
              }`}
              title="Chuyển bên phải sang XML"
            >
              <FileCode size={11} /> XML
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFormatRight}
              className="p-1 rounded hover:bg-surface-hover text-emerald-500 transition-colors"
              title="Format bên phải"
            >
              <Sparkles size={13} />
            </button>
            <button
              onClick={handleMinifyRight}
              className="p-1 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors"
              title="Minify bên phải"
            >
              <Minimize2 size={13} />
            </button>
            <button
              onClick={handleCopyRight}
              className="p-1 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors"
              title="Copy bên phải"
            >
              {rightCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            </button>
            <button
              onClick={() => onChangeRightContent('')}
              className="p-1 rounded hover:bg-red-500/10 text-fg-secondary hover:text-red-500 transition-colors"
              title="Xóa trắng bên phải"
            >
              <Trash2 size={13} />
            </button>
            <span className="text-[10px] text-fg-secondary pl-1 border-l border-border hidden sm:inline">
              {rightLines} dòng &bull; {rightSize} KB
            </span>
          </div>
        </div>

        {/* Right Monaco Editor */}
        <div className="flex-1 w-full h-[calc(100%-32px)]">
          <Editor
            height="100%"
            language={rightLanguage}
            value={rightContent}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={(val) => onChangeRightContent(val || '')}
            onMount={handleRightMount}
            options={{
              fontSize,
              mouseWheelZoom: true,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Menlo, Monaco, monospace",
              lineNumbers: 'on',
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: indent === 'tab' ? 2 : indent,
            }}
          />
        </div>
      </div>
    </div>
  );
};

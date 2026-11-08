import React, { useRef, useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { ArrowLeftRight, Columns, Rows, Sparkles } from 'lucide-react';
import { formatJson, formatXml } from '../utils/formatter';

interface CompareViewProps {
  language: 'json' | 'xml';
  originalContent: string;
  modifiedContent: string;
  onChangeOriginal: (val: string) => void;
  onChangeModified: (val: string) => void;
  theme: 'dark' | 'light';
  indent: number | 'tab';
  fontSize: number;
  enableNested: boolean;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  language,
  originalContent,
  modifiedContent,
  onChangeOriginal,
  onChangeModified,
  theme,
  indent,
  fontSize,
  enableNested,
  onNotify,
}) => {
  const [renderSideBySide, setRenderSideBySide] = useState(true);
  const diffEditorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    diffEditorRef.current = editor;

    // Listen to changes on original and modified models
    const originalModel = editor.getOriginalEditor().getModel();
    const modifiedModel = editor.getModifiedEditor().getModel();

    if (originalModel) {
      originalModel.onDidChangeContent(() => {
        onChangeOriginal(originalModel.getValue());
      });
    }

    if (modifiedModel) {
      modifiedModel.onDidChangeContent(() => {
        onChangeModified(modifiedModel.getValue());
      });
    }
  };

  const handleFormatLeft = () => {
    const fn = language === 'json' ? formatJson : formatXml;
    const res = fn(originalContent, indent, enableNested);
    if (res.success) {
      onChangeOriginal(res.content);
      if (diffEditorRef.current) {
        diffEditorRef.current.getOriginalEditor().setValue(res.content);
      }
    } else {
      onNotify(res.error || 'Lỗi format bản Gốc', 'error');
    }
  };

  const handleFormatRight = () => {
    const fn = language === 'json' ? formatJson : formatXml;
    const res = fn(modifiedContent, indent, enableNested);
    if (res.success) {
      onChangeModified(res.content);
      if (diffEditorRef.current) {
        diffEditorRef.current.getModifiedEditor().setValue(res.content);
      }
    } else {
      onNotify(res.error || 'Lỗi format bản So sánh', 'error');
    }
  };

  const handleSwap = () => {
    const temp = originalContent;
    onChangeOriginal(modifiedContent);
    onChangeModified(temp);
    if (diffEditorRef.current) {
      diffEditorRef.current.getOriginalEditor().setValue(modifiedContent);
      diffEditorRef.current.getModifiedEditor().setValue(temp);
    }
    onNotify('Đã hoán đổi 2 văn bản!', 'info');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Sub-toolbar for Diff */}
      <div className="h-8 bg-surface/80 border-b border-border px-3 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-fg-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span>Bản gốc (Original)</span>
            <button
              onClick={handleFormatLeft}
              className="ml-1 text-[11px] text-blue-500 hover:underline flex items-center gap-0.5"
              title="Format bản trái"
            >
              <Sparkles size={11} /> Format
            </button>
          </div>

          <button
            onClick={handleSwap}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors border border-border"
            title="Đổi chỗ 2 bên"
          >
            <ArrowLeftRight size={12} />
            <span>Đổi vị trí</span>
          </button>

          <div className="flex items-center gap-1.5 font-medium text-fg-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span>Bản sửa đổi (Modified)</span>
            <button
              onClick={handleFormatRight}
              className="ml-1 text-[11px] text-blue-500 hover:underline flex items-center gap-0.5"
              title="Format bản phải"
            >
              <Sparkles size={11} /> Format
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Side-by-side or Inline diff */}
          <button
            onClick={() => setRenderSideBySide(!renderSideBySide)}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-surface-hover text-fg-secondary hover:text-foreground transition-colors border border-border"
            title="Chuyển chế độ xem Diff"
          >
            {renderSideBySide ? <Rows size={12} /> : <Columns size={12} />}
            <span>{renderSideBySide ? 'Xem song song' : 'Xem dòng liên tiếp'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Diff Editor */}
      <div className="flex-1 w-full h-[calc(100%-32px)]">
        <DiffEditor
          height="100%"
          language={language}
          original={originalContent}
          modified={modifiedContent}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          options={{
            readOnly: false,
            originalEditable: true,
            renderSideBySide,
            lineNumbers: 'on',
            minimap: { enabled: false },
            fontSize,
            mouseWheelZoom: true,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            diffCodeLens: true,
            enableSplitViewResizing: true,
          }}
        />
      </div>
    </div>
  );
};

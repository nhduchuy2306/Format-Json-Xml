import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { AlertCircle } from 'lucide-react';

interface EditorViewProps {
  language: 'json' | 'xml';
  content: string;
  onChange: (val: string) => void;
  theme: 'dark' | 'light';
  indent: number | 'tab';
  fontSize: number;
  error?: string;
  errorLine?: number;
  errorCol?: number;
  onFormatShortcut: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  language,
  content,
  onChange,
  theme,
  indent,
  fontSize,
  error,
  errorLine,
  errorCol,
  onFormatShortcut,
}) => {
  const editorRef = useRef<any>(null);
  const isInternalChangeRef = useRef<boolean>(false);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Register Ctrl + S / Cmd + S inside Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onFormatShortcut();
    });

    // Configure JSON formatting and validation options
    if (monaco.languages.json) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: true,
        schemas: [],
        enableSchemaRequest: false,
      });
    }
  };

  const handleEditorChange = (val: string | undefined) => {
    isInternalChangeRef.current = true;
    onChange(val || '');
  };

  // Sync external changes (Format, Clear, Upload, Restore from history)
  // without resetting cursor or undo stack
  useEffect(() => {
    if (!editorRef.current) return;

    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    const currentVal = editorRef.current.getValue();
    if (content !== currentVal) {
      const model = editorRef.current.getModel();
      if (model) {
        const pos = editorRef.current.getPosition();
        const scrollTop = editorRef.current.getScrollTop();

        // Use executeEdits to preserve undo/redo history and cursor
        editorRef.current.executeEdits('external-update', [
          {
            range: model.getFullModelRange(),
            text: content,
          },
        ]);

        if (pos) {
          editorRef.current.setPosition(pos);
        }
        editorRef.current.setScrollTop(scrollTop);
      } else {
        editorRef.current.setValue(content);
      }
    }
  }, [content]);

  // Jump cursor to error line when clicked
  const handleJumpToError = () => {
    if (editorRef.current && errorLine) {
      editorRef.current.revealLineInCenter(errorLine);
      editorRef.current.setPosition({ lineNumber: errorLine, column: errorCol || 1 });
      editorRef.current.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 w-full h-full">
        <Editor
          height="100%"
          language={language}
          defaultValue={content}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize,
            mouseWheelZoom: true,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Menlo, Monaco, monospace",
            lineNumbers: 'on',
            lineDecorationsWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 10,
            lineNumbersMinChars: 3,
            minimap: { 
              enabled: typeof window !== 'undefined' ? window.innerWidth >= 768 : true, 
              maxColumn: 80 
            },
            glyphMargin: false,
            folding: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: indent === 'tab' ? 2 : indent,
            insertSpaces: indent !== 'tab',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            formatOnPaste: false,
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
          }}
        />
      </div>

      {/* Error banner at bottom */}
      {error && (
        <div 
          onClick={handleJumpToError}
          className="absolute bottom-2 left-4 right-4 bg-red-500/90 hover:bg-red-600 text-white px-3 py-2 rounded-md shadow-lg flex items-center justify-between text-xs cursor-pointer transition-all z-10 backdrop-blur-sm"
          title="Click để di chuyển con trỏ tới dòng lỗi"
        >
          <div className="flex items-center gap-2 truncate">
            <AlertCircle size={15} className="shrink-0" />
            <span className="font-semibold shrink-0">Lỗi cú pháp:</span>
            <span className="truncate">{error}</span>
          </div>
          {errorLine && (
            <span className="shrink-0 font-mono text-[11px] bg-red-700/80 px-2 py-0.5 rounded ml-2">
              Dòng {errorLine}:{errorCol || 1}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

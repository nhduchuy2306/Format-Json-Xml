import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import type { TabItem } from './components/TabBar';
import { Toolbar } from './components/Toolbar';
import { EditorView } from './components/EditorView';
import { CompareView } from './components/CompareView';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { 
  formatJson, 
  formatXml, 
  minifyJson, 
  minifyXml, 
  detectLanguage 
} from './utils/formatter';
import type { FormatResult } from './utils/formatter';
import { 
  sampleJson, 
  sampleXml, 
  sampleCompareOriginal, 
  sampleCompareModified 
} from './utils/sampleData';

export const App: React.FC = () => {
  // Theme state: default dark mode like VS Code / json.site
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  // Tab state
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      id: 'tab-1',
      title: 'data.json',
      type: 'editor',
      language: 'json',
      content: sampleJson,
    },
    {
      id: 'tab-2',
      title: 'response.xml',
      type: 'editor',
      language: 'xml',
      content: sampleXml,
    },
    {
      id: 'tab-3',
      title: 'Compare JSON',
      type: 'compare',
      language: 'json',
      content: '',
      originalContent: sampleCompareOriginal,
      modifiedContent: sampleCompareModified,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [indent, setIndent] = useState<number | 'tab'>(2);
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseFloat(localStorage.getItem('fontSize') || '14');
  });
  const [enableNested, setEnableNested] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorInfo, setErrorInfo] = useState<{
    message?: string;
    line?: number;
    col?: number;
  }>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Active tab reference
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Notify utility
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      id: Math.random().toString(),
      message,
      type,
    });
  }, []);

  // Update content of active tab
  const handleContentChange = useCallback((newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, content: newContent, isModified: true }
          : tab
      )
    );
    // Clear errors when typing
    setErrorInfo({});
  }, [activeTabId]);

  // Update original content in compare tab
  const handleCompareOriginalChange = useCallback((newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, originalContent: newContent, isModified: true }
          : tab
      )
    );
  }, [activeTabId]);

  // Update modified content in compare tab
  const handleCompareModifiedChange = useCallback((newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, modifiedContent: newContent, isModified: true }
          : tab
      )
    );
  }, [activeTabId]);

  // Format action
  const handleFormat = useCallback(() => {
    if (activeTab.type === 'compare') {
      showToast('Hãy dùng nút Format bên trái/phải trong thanh so sánh', 'info');
      return;
    }

    // Auto-detect language if user pasted XML in JSON tab or JSON in XML tab
    const targetLang = detectLanguage(activeTab.content);

    const isJson = targetLang === 'json';
    const formatter = isJson ? formatJson : formatXml;
    const res: FormatResult = formatter(activeTab.content, indent, enableNested);

    if (res.success) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId 
            ? { 
                ...tab, 
                content: res.content,
                language: targetLang,
                title: tab.title.replace(/\.(json|xml)$/, `.${targetLang}`)
              } 
            : tab
        )
      );
      setErrorInfo({});

      let msg = `✨ Đã format ${isJson ? 'JSON' : 'XML'} thành công!`;
      if (res.stats?.autoRepaired && res.stats.repairedNote) {
        msg = `🛠️ Đã tự fix (${res.stats.repairedNote}) & format!`;
      } else if (res.stats?.nestedDetected) {
        msg += ' (Đã giải mã chuỗi lồng nhau)';
      }
      showToast(msg, 'success');
    } else {
      setErrorInfo({
        message: res.error,
        line: res.errorLine,
        col: res.errorCol,
      });
      showToast(res.error || 'Lỗi cú pháp', 'error');
    }
  }, [activeTab, activeTabId, indent, enableNested, showToast]);

  // Minify action
  const handleMinify = useCallback(() => {
    if (activeTab.type === 'compare') return;
    const isJson = activeTab.language === 'json';
    const minifier = isJson ? minifyJson : minifyXml;
    const res = minifier(activeTab.content);

    if (res.success) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, content: res.content } : tab
        )
      );
      setErrorInfo({});
      showToast(`Đã nén ${isJson ? 'JSON' : 'XML'} (Minified)!`, 'success');
    } else {
      showToast(res.error || 'Lỗi khi nén dữ liệu', 'error');
    }
  }, [activeTab, activeTabId, showToast]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.min(prev + 1.5, 32);
      localStorage.setItem('fontSize', next.toString());
      return next;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.max(prev - 1.5, 10);
      localStorage.setItem('fontSize', next.toString());
      return next;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setFontSize(14);
    localStorage.setItem('fontSize', '14');
  }, []);

  // Global Ctrl + S / Cmd + S and Zoom shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          e.stopPropagation();
          handleFormat();
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          e.stopPropagation();
          handleZoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          e.stopPropagation();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          e.stopPropagation();
          handleZoomReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleFormat, handleZoomIn, handleZoomOut, handleZoomReset]);

  // Add new tab
  const handleNewTab = (lang?: 'json' | 'xml') => {
    const nextLang = lang || 'json';
    const newId = `tab-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: `new-${tabs.length + 1}.${nextLang}`,
      type: 'editor',
      language: nextLang,
      content: nextLang === 'json' ? '{\n  \n}' : '<?xml version="1.0"?>\n<root>\n  \n</root>',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setErrorInfo({});
  };

  // Open Compare tab
  const handleOpenCompare = (lang: 'json' | 'xml') => {
    const newId = `compare-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: `Compare ${lang.toUpperCase()}`,
      type: 'compare',
      language: lang,
      content: '',
      originalContent: lang === 'json' ? sampleCompareOriginal : sampleXml,
      modifiedContent: lang === 'json' ? sampleCompareModified : sampleXml.replace('<status>200</status>', '<status>500</status>'),
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setErrorInfo({});
    showToast(`Đã mở giao diện so sánh ${lang.toUpperCase()}!`, 'info');
  };

  // Close tab
  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const index = tabs.findIndex((t) => t.id === id);
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);

    if (activeTabId === id) {
      const nextActive = remaining[Math.max(0, index - 1)];
      setActiveTabId(nextActive.id);
    }
  };

  // Copy active tab content
  const handleCopy = () => {
    const textToCopy =
      activeTab.type === 'editor'
        ? activeTab.content
        : activeTab.modifiedContent || '';
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      showToast('Đã sao chép vào bộ nhớ tạm!', 'success');
      setTimeout(() => setIsCopied(false), 1500);
    });
  };

  // Clear active tab
  const handleClear = () => {
    if (activeTab.type === 'editor') {
      handleContentChange('');
    } else {
      handleCompareOriginalChange('');
      handleCompareModifiedChange('');
    }
    setErrorInfo({});
    showToast('Đã xóa trắng nội dung', 'info');
  };

  // Trigger file upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const detected = detectLanguage(text);

      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                title: file.name,
                language: detected,
                content: text,
              }
            : tab
        )
      );
      showToast(`Đã nạp file "${file.name}" (${detected.toUpperCase()})`, 'success');
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Download active tab
  const handleDownload = () => {
    const content =
      activeTab.type === 'editor'
        ? activeTab.content
        : activeTab.modifiedContent || '';
    if (!content) return;

    const ext = activeTab.language === 'json' ? 'json' : 'xml';
    const blob = new Blob([content], {
      type: activeTab.language === 'json' ? 'application/json' : 'application/xml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.title.includes('.') ? activeTab.title : `${activeTab.title}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải file xuống máy', 'success');
  };

  // Change language of current tab
  const handleLanguageChange = (lang: 'json' | 'xml') => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              language: lang,
              title: tab.title.replace(/\.(json|xml)$/, `.${lang}`),
            }
            : tab
      )
    );
    setErrorInfo({});
  };

  // Stats calculation
  const stats = {
    lines: (activeTab.type === 'editor' ? activeTab.content : activeTab.modifiedContent || '')
      .split('\n').length,
    size: new Blob([
      activeTab.type === 'editor' ? activeTab.content : activeTab.modifiedContent || '',
    ]).size,
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Hidden File Input for Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.xml,.txt,application/json,application/xml,text/plain"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onNewTab={handleNewTab}
        onOpenCompare={handleOpenCompare}
      />

      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => {
          setActiveTabId(id);
          setErrorInfo({});
        }}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab('json')}
      />

      {/* Action Toolbar */}
      <Toolbar
        language={activeTab.language}
        onLanguageChange={handleLanguageChange}
        indent={indent}
        onIndentChange={setIndent}
        enableNested={enableNested}
        onToggleNested={() => {
          setEnableNested(!enableNested);
          showToast(
            !enableNested
              ? 'Đã BẬT Nested Format: sẽ giải mã chuỗi lồng nhau khi bấm Format'
              : 'Đã TẮT Nested Format',
            'info'
          );
        }}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onClear={handleClear}
        onCopy={handleCopy}
        onUpload={handleUploadClick}
        onDownload={handleDownload}
        onOpenCompare={handleOpenCompare}
        fontSize={fontSize}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        isCompareMode={activeTab.type === 'compare'}
        isCopied={isCopied}
        stats={stats}
      />

      {/* Workspace Area: Editor or Compare View */}
      <main className="flex-1 w-full h-full overflow-hidden relative">
        {activeTab.type === 'editor' ? (
          <EditorView
            language={activeTab.language}
            content={activeTab.content}
            onChange={handleContentChange}
            theme={theme}
            indent={indent}
            fontSize={fontSize}
            error={errorInfo.message}
            errorLine={errorInfo.line}
            errorCol={errorInfo.col}
            onFormatShortcut={handleFormat}
          />
        ) : (
          <CompareView
            language={activeTab.language}
            originalContent={activeTab.originalContent || ''}
            modifiedContent={activeTab.modifiedContent || ''}
            onChangeOriginal={handleCompareOriginalChange}
            onChangeModified={handleCompareModifiedChange}
            theme={theme}
            indent={indent}
            fontSize={fontSize}
            enableNested={enableNested}
            onNotify={showToast}
          />
        )}
      </main>
    </div>
  );
};

export default App;

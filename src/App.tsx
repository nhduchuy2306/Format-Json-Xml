import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import type { TabItem } from './components/TabBar';
import { Toolbar } from './components/Toolbar';
import { EditorView } from './components/EditorView';
import { CompareView } from './components/CompareView';
import { SplitView } from './components/SplitView';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { HistoryModal } from './components/HistoryModal';
import { 
  getHistory, 
  addHistoryItem, 
  deleteHistoryItem, 
  clearHistory 
} from './utils/history';
import type { HistoryItem } from './utils/history';
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
  sampleCompareModified,
  sampleRequest,
  sampleResponse
} from './utils/sampleData';

const STORAGE_KEY_TABS = 'format_json_xml_tabs';
const STORAGE_KEY_ACTIVE_TAB = 'format_json_xml_active_tab';
const STORAGE_KEY_INDENT = 'format_json_xml_indent';

const defaultTabs: TabItem[] = [
  {
    id: 'tab-1',
    title: 'data.json',
    type: 'editor',
    language: 'json',
    content: sampleJson,
  },
  {
    id: 'tab-2',
    title: 'Split View',
    type: 'split',
    language: 'json',
    content: '',
    leftLanguage: 'json',
    leftContent: sampleRequest,
    rightLanguage: 'xml',
    rightContent: sampleResponse,
    splitOrientation: 'horizontal',
  },
  {
    id: 'tab-3',
    title: 'response.xml',
    type: 'editor',
    language: 'xml',
    content: sampleXml,
  },
  {
    id: 'tab-4',
    title: 'Compare JSON',
    type: 'compare',
    language: 'json',
    content: '',
    originalContent: sampleCompareOriginal,
    modifiedContent: sampleCompareModified,
  },
];

export const App: React.FC = () => {
  // Theme state: default dark mode like VS Code / json.site
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  // Tab state: restored from localStorage or fallback to default sample tabs
  const [tabs, setTabs] = useState<TabItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TABS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse error and fallback
    }
    return defaultTabs;
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_TAB);
      if (saved) return saved;
    } catch {
      // Ignore
    }
    return 'tab-1';
  });

  const [indent, setIndent] = useState<number | 'tab'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INDENT);
    if (saved === 'tab') return 'tab';
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 2;
  });

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
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

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

  // Persist indent setting
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INDENT, String(indent));
  }, [indent]);

  // Persist active tab ID
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, activeTabId);
  }, [activeTabId]);

  // Persist tabs content & state to localStorage (debounced for smooth typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
      } catch (err) {
        console.warn('LocalStorage quota exceeded or unavailable:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [tabs]);

  // Ensure synchronous save if user suddenly closes/reloads the window
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
        localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, activeTabId);
      } catch {
        // Ignore
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tabs, activeTabId]);

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

    if (activeTab.type === 'split') {
      const fnL = (activeTab.leftLanguage || 'json') === 'json' ? formatJson : formatXml;
      const resL = fnL(activeTab.leftContent || '', indent, enableNested);

      const fnR = (activeTab.rightLanguage || 'xml') === 'json' ? formatJson : formatXml;
      const resR = fnR(activeTab.rightContent || '', indent, enableNested);

      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                leftContent: resL.success ? resL.content : tab.leftContent,
                rightContent: resR.success ? resR.content : tab.rightContent,
              }
            : tab
        )
      );

      if (resL.success && resL.content.trim()) {
        setHistory(addHistoryItem({
          language: activeTab.leftLanguage || 'json',
          title: `${activeTab.title} (Trái)`,
          content: resL.content,
        }));
      }
      if (resR.success && resR.content.trim()) {
        setHistory(addHistoryItem({
          language: activeTab.rightLanguage || 'xml',
          title: `${activeTab.title} (Phải)`,
          content: resR.content,
        }));
      }

      return;
    }

    // Auto-detect language if user pasted XML in JSON tab or JSON in XML tab
    const targetLang = detectLanguage(activeTab.content);

    const isJson = targetLang === 'json';
    const formatter = isJson ? formatJson : formatXml;
    const res: FormatResult = formatter(activeTab.content, indent, enableNested);

    if (res.success) {
      const nextTitle = activeTab.title.replace(/\.(json|xml)$/, `.${targetLang}`);
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId 
            ? { 
                ...tab, 
                content: res.content,
                language: targetLang,
                title: nextTitle
              } 
            : tab
        )
      );
      setErrorInfo({});

      // Record to 10-day history in localStorage
      if (res.content.trim()) {
        setHistory(addHistoryItem({
          language: targetLang,
          title: nextTitle,
          content: res.content,
        }));
      }
    } else {
      setErrorInfo({
        message: res.error,
        line: res.errorLine,
        col: res.errorCol,
      });
      showToast(res.error || 'Lỗi cú pháp', 'error');
    }
  }, [activeTab, activeTabId, indent, enableNested, showToast]);

  // Split View handlers
  const handleLeftContentChange = useCallback((newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? { ...tab, leftContent: newContent, isModified: true } : tab
      )
    );
  }, [activeTabId]);

  const handleRightContentChange = useCallback((newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? { ...tab, rightContent: newContent, isModified: true } : tab
      )
    );
  }, [activeTabId]);

  const handleLeftLanguageChange = useCallback((lang: 'json' | 'xml') => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? { ...tab, leftLanguage: lang } : tab
      )
    );
  }, [activeTabId]);

  const handleRightLanguageChange = useCallback((lang: 'json' | 'xml') => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? { ...tab, rightLanguage: lang } : tab
      )
    );
  }, [activeTabId]);

  const handleToggleOrientation = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              splitOrientation: tab.splitOrientation === 'vertical' ? 'horizontal' : 'vertical',
            }
          : tab
      )
    );
  }, [activeTabId]);

  const handleCompareFromSplit = useCallback(() => {
    const newId = `compare-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: `Compare Req vs Res`,
      type: 'compare',
      language: activeTab.leftLanguage || 'json',
      content: '',
      originalContent: activeTab.leftContent || '',
      modifiedContent: activeTab.rightContent || '',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    showToast('Đã mở tab so sánh giữa Request và Response!', 'info');
  }, [activeTab, showToast]);

  const handleOpenSplit = useCallback(() => {
    const newId = `split-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: 'Split View',
      type: 'split',
      language: 'json',
      content: '',
      leftLanguage: 'json',
      leftContent: sampleRequest,
      rightLanguage: 'xml',
      rightContent: sampleResponse,
      splitOrientation: 'horizontal',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    showToast('Đã mở màn hình chia đôi Split View!', 'info');
  }, [showToast]);

  const handleToggleSplitView = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        if (tab.type === 'split') {
          return {
            ...tab,
            type: 'editor',
            content: tab.leftContent || tab.content,
            language: tab.leftLanguage || tab.language,
          };
        } else if (tab.type === 'editor') {
          return {
            ...tab,
            type: 'split',
            leftLanguage: tab.language,
            leftContent: tab.content,
            rightLanguage: tab.language,
            rightContent: '',
            splitOrientation: 'horizontal',
          };
        }
        return tab;
      })
    );
  }, [activeTabId]);

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
    } else if (activeTab.type === 'split') {
      handleLeftContentChange('');
      handleRightContentChange('');
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

  // Restore history item into active editor
  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    if (activeTab.type === 'editor') {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                content: item.content,
                language: item.language,
                title: item.title,
                isModified: true,
              }
            : tab
        )
      );
    } else {
      const newId = `tab-${Date.now()}`;
      const newTab: TabItem = {
        id: newId,
        title: item.title,
        type: 'editor',
        language: item.language,
        content: item.content,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newId);
    }
    setIsHistoryOpen(false);
    showToast(`Đã nạp bản ghi "${item.title}"!`, 'success');
  }, [activeTab.type, activeTabId, showToast]);

  // Open history item in a fresh new tab
  const handleOpenHistoryInNewTab = useCallback((item: HistoryItem) => {
    const newId = `tab-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: item.title,
      type: 'editor',
      language: item.language,
      content: item.content,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setIsHistoryOpen(false);
    showToast(`Đã mở "${item.title}" trong Tab mới!`, 'success');
  }, [showToast]);

  const handleDeleteHistory = useCallback((id: string) => {
    setHistory(deleteHistoryItem(id));
  }, []);

  const handleClearAllHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

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
    lines: (activeTab.type === 'split'
      ? (activeTab.leftContent || '').split('\n').length + (activeTab.rightContent || '').split('\n').length
      : activeTab.type === 'editor'
      ? activeTab.content.split('\n').length
      : (activeTab.modifiedContent || '').split('\n').length),
    size: new Blob([
      activeTab.type === 'split'
        ? (activeTab.leftContent || '') + (activeTab.rightContent || '')
        : activeTab.type === 'editor'
        ? activeTab.content
        : activeTab.modifiedContent || '',
    ]).size,
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Format History Modal (10-day retention) */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreHistory}
        onOpenInNewTab={handleOpenHistoryInNewTab}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
        onNotify={showToast}
      />

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
        onOpenSplit={handleOpenSplit}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
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
        onToggleSplitView={handleToggleSplitView}
        isSplitMode={activeTab.type === 'split'}
        fontSize={fontSize}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        isCompareMode={activeTab.type === 'compare'}
        isCopied={isCopied}
        stats={stats}
      />

      {/* Workspace Area: Split, Editor or Compare View */}
      <main className="flex-1 w-full h-full overflow-hidden relative">
        {activeTab.type === 'split' ? (
          <SplitView
            key={activeTabId}
            leftLanguage={activeTab.leftLanguage || 'json'}
            leftContent={activeTab.leftContent || ''}
            rightLanguage={activeTab.rightLanguage || 'xml'}
            rightContent={activeTab.rightContent || ''}
            splitOrientation={activeTab.splitOrientation || 'horizontal'}
            onChangeLeftContent={handleLeftContentChange}
            onChangeRightContent={handleRightContentChange}
            onChangeLeftLanguage={handleLeftLanguageChange}
            onChangeRightLanguage={handleRightLanguageChange}
            onToggleOrientation={handleToggleOrientation}
            onCompareWithDiff={handleCompareFromSplit}
            theme={theme}
            indent={indent}
            fontSize={fontSize}
            enableNested={enableNested}
            onNotify={showToast}
          />
        ) : activeTab.type === 'editor' ? (
          <EditorView
            key={activeTabId}
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
            key={activeTabId}
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

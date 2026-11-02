import React from 'react';
import { X, Plus, FileJson, FileCode, GitCompare, Columns } from 'lucide-react';

export interface TabItem {
  id: string;
  title: string;
  type: 'editor' | 'compare' | 'split';
  language: 'json' | 'xml';
  content: string;
  originalContent?: string;
  modifiedContent?: string;
  leftTitle?: string;
  leftLanguage?: 'json' | 'xml';
  leftContent?: string;
  rightTitle?: string;
  rightLanguage?: 'json' | 'xml';
  rightContent?: string;
  splitOrientation?: 'horizontal' | 'vertical';
  isModified?: boolean;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  return (
    <div className="h-9 bg-surface/80 border-b border-border flex items-center px-2 select-none overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 h-7 px-3 rounded-t text-xs cursor-pointer border-t-2 transition-all ${
                isActive
                  ? 'bg-background border-blue-500 text-foreground font-medium shadow-sm'
                  : 'bg-transparent border-transparent text-fg-secondary hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              {tab.type === 'compare' ? (
                <GitCompare
                  size={13}
                  className={tab.language === 'json' ? 'text-amber-500' : 'text-emerald-500'}
                />
              ) : tab.type === 'split' ? (
                <Columns size={13} className="text-cyan-500" />
              ) : tab.language === 'json' ? (
                <FileJson size={13} className="text-amber-500" />
              ) : (
                <FileCode size={13} className="text-emerald-500" />
              )}

              <span className="truncate max-w-[140px]">{tab.title}</span>

              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-surface-active rounded p-0.5 text-fg-secondary hover:text-foreground transition-all"
                  title="Đóng tab"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={onNewTab}
          className="p-1 rounded text-fg-secondary hover:text-foreground hover:bg-surface-hover transition-colors ml-1"
          title="Mở tab mới"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
};


# Reference: UI Component Hierarchy & State Flow

## 1. Component Hierarchy
```text
App.tsx (Main State Store)
├── Header.tsx         (Branding, +JSON, +XML, Compare JSON/XML, Split View, Theme Toggle)
├── TabBar.tsx         (Active tabs, tab switching, add/close tab, language & type icons)
├── Toolbar.tsx        (Icon-only actions: Format, Nested, Minify, Split, Lang, Indent, Zoom, Upload/Download, Copy/Clear)
└── Main Workspace:
    ├── EditorView.tsx     (Single Document Monaco Editor + Syntax Error banner)
    ├── CompareView.tsx    (Side-by-side / inline Monaco Diff Editor + Swap + Format Left/Right)
    └── SplitView.tsx      (Dual-pane with draggable resizer, independent languages, Format Both)
```

---

## 2. Tab State Model
Each tab in `tabs` array is typed as `TabItem`:
```ts
export interface TabItem {
  id: string;
  title: string;
  type: 'editor' | 'compare' | 'split';
  language: 'json' | 'xml';
  content: string;               // Used in editor mode
  originalContent?: string;      // Used in compare mode (left)
  modifiedContent?: string;      // Used in compare mode (right)
  leftLanguage?: 'json' | 'xml'; // Used in split mode (left)
  leftContent?: string;          // Used in split mode (left)
  rightLanguage?: 'json' | 'xml';// Used in split mode (right)
  rightContent?: string;         // Used in split mode (right)
  splitOrientation?: 'horizontal' | 'vertical';
  isModified?: boolean;
}
```

---

## 3. Keyboard Shortcuts Map
- `Ctrl + S`: Auto-format current tab (formats both sides in Split mode).
- `Ctrl + +` / `Ctrl + =`: Zoom in editor font size.
- `Ctrl + -`: Zoom out editor font size.
- `Ctrl + 0`: Reset zoom to 100% (14px).
- `Ctrl + Mouse Wheel`: Native Monaco scroll zoom.
- `Ctrl + F`: Search & Replace inside Monaco.


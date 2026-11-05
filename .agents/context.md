# Project Context: JSON & XML Studio

## 1. Overview
`format-json-xml` is a modern, high-performance web and desktop tool for developers to format, validate, minify, compare (diff), and manipulate JSON and XML documents. It is inspired by `json.site` and powered by the **Monaco Editor** (the core editor of VS Code).

---

## 2. Technical Stack
- **Framework**: React 19 + TypeScript + Vite 8
- **Editor Engine**: `@monaco-editor/react` (Monaco Editor & Monaco Diff Editor)
- **XML Engine**: `xml-formatter` (v3.7) & `fast-xml-parser` (v5.1)
- **Styling**: Tailwind CSS 3.4 with custom dark/light theme variables
- **Icons**: `lucide-react`
- **Linting**: `oxlint` (ultra-fast Rust linter)
- **Package Manager**: npm

---

## 3. Directory Structure
```text
format-json-xml/
├── .agents/                    # Agent Customizations (Rules, Skills, Context)
│   ├── AGENTS.md               # Main repository rules for AI agents
│   ├── context.md              # High-level architecture and context (this file)
│   ├── rules/
│   │   ├── code-style.md       # TypeScript & Tailwind CSS standards
│   │   └── monaco-guidelines.md# Monaco Editor & Diff Editor rules
│   └── skills/
│       └── format-json-xml/
│           ├── SKILL.md        # Skill runbook for formatter workflows
│           └── references/
│               ├── auto-repair.md  # Detailed repair logic & edge cases
│               └── architecture.md # UI component hierarchy & state flow
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Top bar: Brand, +JSON, +XML, Compare, Split, Theme
│   │   ├── TabBar.tsx          # Tabs manager (Editor, Diff, Split tabs)
│   │   ├── Toolbar.tsx         # Icon-first toolbar with tooltips (No horizontal scroll)
│   │   ├── EditorView.tsx      # Monaco Editor wrapper with Ctrl+S & error banner
│   │   ├── CompareView.tsx     # Monaco Diff Editor wrapper (Side-by-side / inline diff)
│   │   ├── SplitView.tsx       # Draggable dual-pane view with independent controls
│   │   └── Toast.tsx           # Non-blocking feedback notifications
│   ├── utils/
│   │   ├── formatter.ts        # Core parsing, auto-repair, formatting & minifying
│   │   └── sampleData.ts       # Realistic demo payloads (JSON, XML, Split, Diff)
│   ├── App.tsx                 # Central state manager (tabs, theme, zoom, format triggers)
│   ├── main.tsx                # React root mount
│   └── index.css               # Theme definitions, custom scrollbars, animations
├── index.html                  # HTML entry point with metadata & web fonts
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind theme configuration
└── tsconfig.json               # TypeScript compiler config
```

---

## 4. Key Functional Modules

### A. Format & Auto-Repair Engine (`src/utils/formatter.ts`)
- **`formatJson(input, indent, enableNested)`**:
  - Automatically runs `repairJson` first.
  - Strips markdown codeblocks (````json ... ````).
  - Strips enclosing quotes / unescapes stringified objects.
  - Extracts JSON payload from log strings with prefixes (e.g., `Log: {"a": 1}`).
  - Fixes single quotes to double quotes, unquoted keys, trailing commas, Python `True`/`False`/`None`.
  - If `enableNested === true`, recursively executes `deepParseJson` on all stringified sub-properties.
- **`formatXml(input, indent, enableNested)`**:
  - Automatically runs `repairXml` first.
  - Extracts XML starting from `<?xml` or `<tag` up to the closing `>`, stripping log prefixes (e.g. `SearchCurrentAccount: <?xml...`).
  - Fixes unescaped ampersands (`&` -> `&amp;`).
  - If `enableNested === true`, parses JSON/XML within CDATA sections or encoded tags (`&lt;...&gt;`).
- **`detectLanguage(text)`**:
  - Smart detection that checks whether XML `<tag` or JSON `{[` appears first, even in the presence of log labels.

### B. Workspace Views
1. **EditorView**: Monaco editor for a single document with bottom error banner and jump-to-line on click.
2. **CompareView**: Monaco Diff Editor with swap, side-by-side or inline view toggle, and independent formatting for left (original) and right (modified).
3. **SplitView**: Dual-pane view with a draggable resizer (`15%` to `85%`, double-click to reset `50%`), independent language selectors, and format buttons.
4. **Toolbar**: Pure icon-first toolbar with tooltips (`title`) to guarantee zero horizontal scrollbars.
5. **Zoom Controls**: Synchronized zoom across all editors (`Ctrl + Scroll`, `Ctrl + +`, `Ctrl + -`, `Ctrl + 0`).


# Guidelines and Rules for AI Agents

> Repository: `format-json-xml` (JSON & XML Studio)  
> Stack: React 19, TypeScript, Vite, Tailwind CSS, Monaco Editor

---

## 1. Project Principles

1. **Clean & Resilient UI (json.site style)**:
   - Full-viewport layout with zero wasted screen space.
   - The toolbar must remain compact with icon-only buttons + descriptive tooltips (`title` attribute) to prevent horizontal scrollbars on standard displays.
   - Dark mode (`#1e1e1e` / `#252526`) and Light mode (`#ffffff` / `#f8fafc`) must always be supported via CSS variables.

2. **Smart Auto-Repair First**:
   - The user often pastes real-world log dumps containing prefixes/labels (e.g. `SearchCurrentAccount: <?xml...>` or `Response: {"foo": "bar"}`).
   - Format operations must always attempt smart sanitization and auto-repair (stripping prefixes, lenient single-quote to double-quote fixes, trailing commas, unescaped ampersands).

3. **Nested Serialization Support**:
   - Stringified JSON or XML inside properties or CDATA must be recursively parseable when `enableNested` is active.

4. **Zero-Warning & Zero-Error Policy**:
   - Always verify changes with `npm run lint` (`oxlint`) and `npm run build` (`tsc -b && vite build`).
   - Must achieve **0 errors and 0 warnings** before concluding any task.

---

## 2. TypeScript & Code Standards

- **Module Syntax**: Use explicit `import type` for types/interfaces when `verbatimModuleSyntax` is enabled in `tsconfig.json`.
- **No Unused Code**: Avoid unused imports or declared variables. Linters enforce `no-unused-vars` strictly.
- **Escape Sequences**: In regex and template strings, avoid redundant escape characters (e.g., use `/[{[]/` instead of `/[{\[]/`).

---

## 3. Monaco Editor Conventions

- Always configure Monaco Editor with:
  - `fontSize: fontSize`
  - `mouseWheelZoom: true`
  - `wordWrap: 'on'`
  - `automaticLayout: true`
- When registering keyboard shortcuts in Monaco (such as `Ctrl+S`), intercept via `editor.addCommand` inside `onMount` and also attach a window-level listener with `e.preventDefault()` to suppress browser native dialogs.
- For `DiffEditor`, ensure both `originalEditable` and `renderSideBySide` can be toggled cleanly.


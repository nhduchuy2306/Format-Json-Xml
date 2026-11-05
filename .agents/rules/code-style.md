# Coding Style & Design Rules

## 1. TypeScript Standards
- **Verbatim Module Syntax**: Always import types explicitly using `import type { ... } from '...'`.
- **Zero Unused Variables**: Never leave unused imports, variables, or functions.
- **Strict Null Checks**: Always handle optional properties safely (e.g., `errorLine?: number`).
- **Clean Escape Sequences**:
  - In regex character classes, do not escape unnecessary characters (e.g. `[{[]` instead of `[{\[]`).
  - In template literals, use `String.raw` if string contains raw backslashes to prevent `no-useless-escape` warnings.

---

## 2. Tailwind CSS & UI Design
- **Semantic CSS Variables**:
  - Always use theme variables: `var(--background)`, `var(--surface)`, `var(--surface-hover)`, `var(--border)`, `var(--foreground)`, `var(--fg-secondary)`.
  - Do not hardcode random hex colors in utility classes unless for specific accents (e.g., Amber for JSON, Emerald for XML, Cyan for Split, Blue for Primary).
- **Responsive Toolbar**:
  - Maintain icon-only buttons with clear `title` attributes for tooltips in `Toolbar.tsx`.
  - Prevent horizontal scrollbars (`overflow-x-auto` can remain as fallback, but content width should fit comfortably within `~600px`).
- **Interactive Feedback**:
  - Provide instant visual feedback for user actions (`Toast` notifications, `active:scale-95` on clicks, green check icon on Copy).


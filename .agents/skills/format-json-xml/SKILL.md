---
name: format-json-xml
description: >-
  Use this skill when developing, debugging, extending, or maintaining the JSON & XML formatting, validation, smart auto-repair, nested serialized string parsing, Monaco Diff comparison, or draggable dual-pane split features in this codebase.
---

# JSON & XML Studio Skill & Runbook

This skill provides step-by-step procedures and knowledge for maintaining and extending the `format-json-xml` application.

---

## 1. Core Workflow Procedures

### Adding or Modifying a Formatting Feature
1. Open [src/utils/formatter.ts](file:///d:/huynhd/tools/format-json-xml/src/utils/formatter.ts).
2. If modifying parsing or serialization repairs:
   - For JSON: Update `repairJson(raw)` or `deepParseJson(obj)`.
   - For XML: Update `repairXml(raw)` or `processNestedXml(xml)`.
   - Refer to [Auto-Repair Reference](./references/auto-repair.md) for existing regex rules and edge cases.
3. Keep return types strictly compliant with `FormatResult`:
   ```ts
   export interface FormatResult {
     success: boolean;
     content: string;
     error?: string;
     errorLine?: number;
     errorCol?: number;
     stats?: {
       lines: number;
       size: number;
       nestedDetected?: boolean;
       autoRepaired?: boolean;
       repairedNote?: string;
     };
   }
   ```

### Modifying Editor or Diff Capabilities
1. For single editor changes: Edit [src/components/EditorView.tsx](file:///d:/huynhd/tools/format-json-xml/src/components/EditorView.tsx).
2. For diff comparison changes: Edit [src/components/CompareView.tsx](file:///d:/huynhd/tools/format-json-xml/src/components/CompareView.tsx).
3. For split-screen dual-pane changes: Edit [src/components/SplitView.tsx](file:///d:/huynhd/tools/format-json-xml/src/components/SplitView.tsx).
4. Review [Architecture Reference](./references/architecture.md) for component relationships and tab state models.

### Maintaining the Toolbar & Preventing Horizontal Scroll
1. Open [src/components/Toolbar.tsx](file:///d:/huynhd/tools/format-json-xml/src/components/Toolbar.tsx).
2. Every action must be an icon button with a tooltip (`title` attribute).
3. Keep visual padding compact (`p-1.5`, `gap-1.5`) so the total width remains under 600px without overflow.

---

## 2. Verification Runbook

Always execute the following verification commands after making changes:

```powershell
# 1. Typecheck & Build
npm run build

# 2. Linter check (0 errors & 0 warnings required)
npm run lint
```

If any warnings appear:
- Check for unused imports or variables.
- Check for unneeded regex escape characters.
- Ensure all type imports use `import type`.


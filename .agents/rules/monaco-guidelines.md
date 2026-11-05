# Monaco Editor & Diff Editor Guidelines

## 1. Editor Configuration
When configuring Monaco Editor via `@monaco-editor/react`:
- Always pass dynamic `fontSize` state so user zooming updates the text size in real time.
- Set `mouseWheelZoom: true` to enable native Ctrl + Scroll zooming just like in VS Code.
- Set `wordWrap: 'on'` and `automaticLayout: true` so editors automatically adjust to resizing or split-pane changes.
- Hide minimap in split and diff modes to conserve horizontal space (`minimap: { enabled: false }`).

---

## 2. Command & Shortcut Interception
- Register `Ctrl+S` / `Cmd+S` via `editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, callback)` on editor mount.
- Register matching window-level event listener:
  ```ts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      handleFormat();
    }
  }, true);
  ```
  This ensures the browser's native "Save webpage as" prompt is suppressed regardless of where the focus is.

---

## 3. Split-Pane & Dragging
- When implementing draggable split panes over Monaco editors, render a transparent overlay (`<div className="absolute inset-0 z-50 bg-transparent" />`) while `isDragging` is true.
  - *Reason*: Monaco Editor uses internal iframes and event listeners that capture `mousemove` and `mouseup`, which would interrupt smooth dragging if unshielded.


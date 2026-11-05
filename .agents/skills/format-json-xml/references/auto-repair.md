# Reference: Smart Auto-Repair & Nested Parsing Algorithms

## 1. Log Prefix & Noise Stripping

### Problem:
Developers frequently copy-paste logs, network payloads, or CLI output into the editor:
- `SearchCurrentAccount: <?xml version="1.0"...><AccountNo>...</AccountNo></ns2:SearchCurrentAccount>`
- `2026-11-02 21:00:00 [Thread-1] Response: {"status": "OK", "items": [1, 2]}`
- ````xml\n<root>...</root>\n````

### Solution in `repairXml`:
1. Strip Markdown fences: `text.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim()`
2. Strip outer string wrappers: If wrapped in `"..."` or `'...'`, unescape backslashes.
3. Auto-detect & unescape full escaped XML documents (`&lt;...&gt;` entities):
   - Recursively unescapes multi-level entities (e.g. `&amp;lt;` -> `&lt;` -> `<`) up to 3 depth levels.
4. Find start of XML tag: `text.search(/<\??[a-zA-Z0-9_:-]/)`
5. Find end of XML tag: `text.lastIndexOf('>')`
6. If valid range found, slice: `text.substring(xmlStartIdx, xmlEndIdx + 1)`
7. Auto-encode bare `&`: `text.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')`

### Solution in `repairJson`:
1. Strip Markdown fences and outer quotes.
2. Search for first `{` and last `}` (or first `[` and last `]`).
3. Lenient grammar fixes:
   - Python constants: `: True` -> `: true`, `: False` -> `: false`, `: None` -> `: null`.
   - Single quotes to double quotes: `/'([^'\\]*(?:\\.[^'\\]*)*)'/g` -> `"$1"`.
   - Unquoted object keys: `/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g` -> `$1"$2":`.
   - Trailing commas: `/,\s*([}\]])/g` -> `$1`.

---

## 2. Nested Serialization Parsing (Deep Parse)

### JSON Nested Serialization:
When a JSON string contains serialized JSON inside an object property:
```json
{
  "traceId": "123",
  "data": "{\"userId\": 10, \"meta\": \"{\\\"active\\\": true}\"}"
}
```
`deepParseJson(obj)`:
- Recursively traverses objects and arrays.
- If a string starts with `{` or `[`:
  - Tries `JSON.parse`.
  - If successful, recursively calls `deepParseJson` on the parsed object.
  - Automatically handles arbitrary levels of string escape nesting.

### XML Nested Serialization:
`processNestedXml(xml)`:
- Inspects CDATA sections: `<![CDATA[ ... ]]>`. If content is JSON or XML, parses and pretty-prints it inside the CDATA wrapper.
- Inspects encoded XML entities: `&lt;tag&gt;...&lt;/tag&gt;`. Unescapes and formats nested XML blocks.
- Inspects JSON inside text nodes: `><element>{"a": 1}</element><`. Formats nested JSON within XML tags.


import xmlFormatter from 'xml-formatter';
import { XMLValidator } from 'fast-xml-parser';

export type LanguageType = 'json' | 'xml';

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

/**
 * Detect language based on string content, with log/prefix tolerance & escaped XML support
 */
export function detectLanguage(text: string): LanguageType {
  const trimmed = text.trim();
  const xmlStart = trimmed.search(/<\??[a-zA-Z0-9_:-]/);
  const escapedXmlStart = trimmed.search(/&lt;\??[a-zA-Z0-9_:-]/);
  const jsonStart = trimmed.search(/[{[]/);

  const effectiveXmlStart = (xmlStart !== -1 && (escapedXmlStart === -1 || xmlStart < escapedXmlStart))
    ? xmlStart
    : escapedXmlStart;

  if (effectiveXmlStart !== -1 && (jsonStart === -1 || effectiveXmlStart < jsonStart)) {
    return 'xml';
  }
  if (jsonStart !== -1) {
    return 'json';
  }
  return 'json';
}

/**
 * Smart Auto-Repair for JSON:
 * - Strips prefixes/suffixes (e.g., 'Response: { ... }')
 * - Strips markdown code blocks
 * - Fixes single quotes to double quotes
 * - Fixes unquoted keys
 * - Fixes trailing commas
 * - Fixes Python booleans / None
 * - Unescapes stringified wrappers
 */
export function repairJson(raw: string): {
  success: boolean;
  parsed?: any;
  repaired?: boolean;
  note?: string;
  error?: string;
  errorLine?: number;
  errorCol?: number;
} {
  let text = raw.trim();
  if (!text) return { success: true, parsed: {}, repaired: false };

  // 1. Try standard JSON.parse first
  try {
    return { success: true, parsed: JSON.parse(text), repaired: false };
  } catch (err: any) {
    // Collect error line/col
    let errorLine: number | undefined;
    let errorCol: number | undefined;
    const match = err.message.match(/at position (\d+)/);
    if (match && match[1]) {
      const pos = parseInt(match[1], 10);
      const lines = text.substring(0, pos).split('\n');
      errorLine = lines.length;
      errorCol = lines[lines.length - 1].length + 1;
    }

    // 2. Strip markdown blocks
    let cleaned = text;
    const notes: string[] = [];

    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
      notes.push('Loại bỏ markdown block');
    }

    // 3. Strip outer wrapping quotes if the whole text is inside quotes
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      try {
        const unescaped = JSON.parse(cleaned);
        if (typeof unescaped === 'object' && unescaped !== null) {
          return { success: true, parsed: unescaped, repaired: true, note: 'Bóc tách chuỗi escape bọc ngoài' };
        }
        cleaned = String(unescaped).trim();
      } catch {
        cleaned = cleaned.slice(1, -1)
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .trim();
      }
      notes.push('Bóc tách chuỗi bọc ngoài');
    }

    // 4. Extract JSON from surrounding log noise
    const firstCurly = cleaned.indexOf('{');
    const lastCurly = cleaned.lastIndexOf('}');
    if (firstCurly !== -1 && lastCurly > firstCurly) {
      if (firstCurly > 0 || lastCurly + 1 < cleaned.length) {
        cleaned = cleaned.substring(firstCurly, lastCurly + 1);
        notes.push('Loại bỏ tiền tố log');
      }
      try {
        const parsed = JSON.parse(cleaned);
        return { success: true, parsed, repaired: true, note: notes.join(', ') };
      } catch { }
    } else {
      const firstSquare = cleaned.indexOf('[');
      const lastSquare = cleaned.lastIndexOf(']');
      if (firstSquare !== -1 && lastSquare > firstSquare) {
        if (firstSquare > 0 || lastSquare + 1 < cleaned.length) {
          cleaned = cleaned.substring(firstSquare, lastSquare + 1);
          notes.push('Loại bỏ tiền tố log');
        }
        try {
          const parsed = JSON.parse(cleaned);
          return { success: true, parsed, repaired: true, note: notes.join(', ') };
        } catch { }
      }
    }

    // 5. Lenient fixes (Python constants, single quotes, unquoted keys, trailing commas)
    let fixed = cleaned;

    // Python True, False, None
    if (/:\s*(True|False|None)\b/.test(fixed)) {
      fixed = fixed
        .replace(/:\s*True\b/g, ': true')
        .replace(/:\s*False\b/g, ': false')
        .replace(/:\s*None\b/g, ': null');
      notes.push('Chuẩn hóa True/False/None');
    }

    // Replace single quotes with double quotes
    if (/'[^']*'/.test(fixed)) {
      fixed = fixed.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
      notes.push('Đổi nháy đơn thành nháy kép');
    }

    // Fix unquoted keys { foo: "bar" } -> { "foo": "bar" }
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

    // Remove trailing commas: ,} -> } and ,] -> ]
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');

    try {
      const parsed = JSON.parse(fixed);
      return { success: true, parsed, repaired: true, note: notes.join(', ') || 'Tự động sửa lỗi cú pháp JSON' };
    } catch {
      return {
        success: false,
        error: `JSON Syntax Error: ${err.message}`,
        errorLine,
        errorCol,
      };
    }
  }
}

/**
 * Smart Auto-Repair for XML:
 * - Strips prefixes/suffixes (e.g., 'SearchCurrentAccount: <?xml ...>')
 * - Strips markdown code blocks
 * - Strips outer quotes
 * - Fixes unescaped ampersands '&'
 */
export function repairXml(raw: string): {
  success: boolean;
  text?: string;
  repaired?: boolean;
  note?: string;
  error?: string;
  errorLine?: number;
  errorCol?: number;
} {
  let text = raw.trim();
  if (!text) return { success: true, text: '', repaired: false };

  let repaired = false;
  const notes: string[] = [];

  // 1. Strip markdown
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
    repaired = true;
    notes.push('Loại bỏ markdown block');
  }

  // 2. Strip outer quotes
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .trim();
    repaired = true;
    notes.push('Bóc tách chuỗi bọc ngoài');
  }

  // 3. Auto-detect & unescape escaped XML entities (&lt;?xml... or &lt;tag&gt;...)
  if (text.includes('&lt;') && text.includes('&gt;')) {
    const unescaped = unescapeXml(text);
    const uStart = unescaped.search(/<\??[a-zA-Z0-9_:-]/);
    const uEnd = unescaped.lastIndexOf('>');
    if (uStart !== -1 && uEnd > uStart) {
      text = unescaped;
      repaired = true;
      notes.push('Tự động unescape XML entities (&lt; &gt;)');
    }
  }

  // 4. Extract XML if prefix exists (like: 'SearchCurrentAccount: <?xml...')
  const xmlStartIdx = text.search(/<\??[a-zA-Z0-9_:-]/);
  const xmlEndIdx = text.lastIndexOf('>');

  if (xmlStartIdx !== -1 && xmlEndIdx > xmlStartIdx) {
    if (xmlStartIdx > 0 || xmlEndIdx + 1 < text.length) {
      text = text.substring(xmlStartIdx, xmlEndIdx + 1);
      repaired = true;
      notes.push('Loại bỏ tiền tố log / label');
    }
  }

  // 5. Validate XML
  let validation = XMLValidator.validate(text);
  if (validation === true) {
    return { success: true, text, repaired, note: notes.join(', ') };
  }

  // 5. Try fixing unescaped ampersands
  const fixedAmp = text.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
  validation = XMLValidator.validate(fixedAmp);
  if (validation === true) {
    notes.push('Tự động mã hóa ký tự &');
    return { success: true, text: fixedAmp, repaired: true, note: notes.join(', ') };
  }

  const err = validation.err;
  return {
    success: false,
    text,
    error: `XML Syntax Error: ${err.msg || 'Cú pháp XML không hợp lệ'}`,
    errorLine: err.line,
    errorCol: err.col,
  };
}

/**
 * Recursively parse serialized strings in JSON (Nested JSON strings / XML strings)
 */
export function deepParseJson(obj: any, detectedNested: { count: number } = { count: 0 }): any {
  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        detectedNested.count++;
        return deepParseJson(parsed, detectedNested);
      } catch {
        // Try repair for nested string too!
        const rep = repairJson(trimmed);
        if (rep.success && rep.parsed) {
          detectedNested.count++;
          return deepParseJson(rep.parsed, detectedNested);
        }
      }
    }

    // If string is an escaped XML document inside JSON
    if (trimmed.startsWith('&lt;') && trimmed.endsWith('&gt;')) {
      const unescaped = unescapeXml(trimmed);
      const repXml = repairXml(unescaped);
      if (repXml.success && repXml.text) {
        detectedNested.count++;
        return repXml.text;
      }
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepParseJson(item, detectedNested));
  }

  if (obj !== null && typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = deepParseJson(v, detectedNested);
    }
    return res;
  }

  return obj;
}

/**
 * Format JSON with auto-repair and optional deep nested serialization parsing
 */
export function formatJson(
  input: string,
  indent: number | string = 2,
  enableNested: boolean = false
): FormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: true, content: '', stats: { lines: 0, size: 0 } };
  }

  const rep = repairJson(trimmed);
  if (!rep.success) {
    return {
      success: false,
      content: input,
      error: rep.error,
      errorLine: rep.errorLine,
      errorCol: rep.errorCol,
    };
  }

  try {
    let parsed = rep.parsed;
    let nestedDetected = false;

    if (enableNested) {
      const detected = { count: 0 };
      parsed = deepParseJson(parsed, detected);
      nestedDetected = detected.count > 0;
    }

    const spaceIndent = typeof indent === 'number' ? indent : indent === 'tab' ? '\t' : 2;
    const formatted = JSON.stringify(parsed, null, spaceIndent);
    const lineCount = formatted.split('\n').length;

    return {
      success: true,
      content: formatted,
      stats: {
        lines: lineCount,
        size: new Blob([formatted]).size,
        nestedDetected,
        autoRepaired: rep.repaired,
        repairedNote: rep.note,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      content: input,
      error: err.message || 'Failed to format JSON',
    };
  }
}

/**
 * Minify JSON with auto-repair
 */
export function minifyJson(input: string): FormatResult {
  const trimmed = input.trim();
  if (!trimmed) return { success: true, content: '' };

  const rep = repairJson(trimmed);
  if (!rep.success) {
    return {
      success: false,
      content: input,
      error: rep.error,
    };
  }

  try {
    const minified = JSON.stringify(rep.parsed);
    return {
      success: true,
      content: minified,
      stats: {
        lines: 1,
        size: new Blob([minified]).size,
        autoRepaired: rep.repaired,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      content: input,
      error: `JSON Minify Error: ${err.message}`,
    };
  }
}

/**
 * Unescape XML entities (supports multi-level unescape like &amp;lt; -> &lt; -> <)
 */
export function unescapeXml(str: string): string {
  let prev = '';
  let curr = str;
  let depth = 0;
  while (prev !== curr && depth < 3) {
    prev = curr;
    curr = curr
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    depth++;
  }
  return curr;
}

/**
 * Process nested content inside XML (JSON strings or escaped XML)
 */
function processNestedXml(xml: string, detected: { count: number }): string {
  // 1. Process CDATA sections
  let result = xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_match, cdataContent) => {
    const trimmed = cdataContent.trim();
    // If it's JSON inside CDATA
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      const rep = repairJson(trimmed);
      if (rep.success && rep.parsed) {
        const deep = deepParseJson(rep.parsed);
        detected.count++;
        return `<![CDATA[\n${JSON.stringify(deep, null, 2)}\n]]>`;
      }
    }
    // If it's escaped XML inside CDATA (&lt;...&gt;)
    if (trimmed.startsWith('&lt;') && trimmed.endsWith('&gt;')) {
      const unescaped = unescapeXml(trimmed);
      const repXml = repairXml(unescaped);
      if (repXml.success && repXml.text) {
        detected.count++;
        const fmt = xmlFormatter(repXml.text, { indentation: '  ', collapseContent: true });
        return `<![CDATA[\n${fmt}\n]]>`;
      }
    }
    // If it's raw XML inside CDATA
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      const repXml = repairXml(trimmed);
      if (repXml.success && repXml.text) {
        detected.count++;
        const fmt = xmlFormatter(repXml.text, { indentation: '  ', collapseContent: true });
        return `<![CDATA[\n${fmt}\n]]>`;
      }
    }
    return _match;
  });

  // 2. Process escaped XML tags &lt;tag&gt;...&lt;/tag&gt; inside element content
  result = result.replace(/>([\s\S]*?)</g, (_match, textContent) => {
    const trimmed = textContent.trim();
    if (trimmed.startsWith('&lt;') && trimmed.endsWith('&gt;')) {
      const unescaped = unescapeXml(trimmed);
      const repXml = repairXml(unescaped);
      if (repXml.success && repXml.text) {
        detected.count++;
        const fmt = xmlFormatter(repXml.text, { indentation: '  ', collapseContent: true });
        return `>\n${fmt}\n<`;
      }
    }
    return _match;
  });

  // 3. Process serialized JSON inside XML elements >{"a":1}<
  result = result.replace(/>(\s*\{[\s\S]*?\}\s*|\s*\[[\s\S]*?\]\s*)</g, (_match, jsonStr) => {
    const rep = repairJson(jsonStr.trim());
    if (rep.success && rep.parsed) {
      detected.count++;
      return `>\n${JSON.stringify(deepParseJson(rep.parsed), null, 2)}\n<`;
    }
    return _match;
  });

  return result;
}

/**
 * Format XML with auto-repair and optional nested serialization support
 */
export function formatXml(
  input: string,
  indent: number | string = 2,
  enableNested: boolean = false
): FormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: true, content: '', stats: { lines: 0, size: 0 } };
  }

  // Auto repair XML issues (strip log prefix, clean markdown, fix &)
  const rep = repairXml(trimmed);
  if (!rep.success || !rep.text) {
    return {
      success: false,
      content: input,
      error: rep.error,
      errorLine: rep.errorLine,
      errorCol: rep.errorCol,
    };
  }

  try {
    let xmlToFormat = rep.text;
    let nestedDetected = false;

    if (enableNested) {
      const detected = { count: 0 };
      xmlToFormat = processNestedXml(xmlToFormat, detected);
      nestedDetected = detected.count > 0;
    }

    const indentation = typeof indent === 'number' ? ' '.repeat(indent) : indent === 'tab' ? '\t' : '  ';
    const formatted = xmlFormatter(xmlToFormat, {
      indentation,
      collapseContent: true,
      lineSeparator: '\n',
    });

    const lineCount = formatted.split('\n').length;
    return {
      success: true,
      content: formatted,
      stats: {
        lines: lineCount,
        size: new Blob([formatted]).size,
        nestedDetected,
        autoRepaired: rep.repaired,
        repairedNote: rep.note,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      content: input,
      error: err.message || 'Failed to format XML',
    };
  }
}

/**
 * Minify XML with auto-repair
 */
export function minifyXml(input: string): FormatResult {
  const trimmed = input.trim();
  if (!trimmed) return { success: true, content: '' };

  const rep = repairXml(trimmed);
  if (!rep.success || !rep.text) {
    return {
      success: false,
      content: input,
      error: rep.error,
    };
  }

  try {
    const minified = rep.text
      .replace(/>\s+</g, '><')
      .replace(/(\r\n|\n|\r)/gm, '')
      .trim();

    return {
      success: true,
      content: minified,
      stats: {
        lines: 1,
        size: new Blob([minified]).size,
        autoRepaired: rep.repaired,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      content: input,
      error: `XML Minify Error: ${err.message}`,
    };
  }
}

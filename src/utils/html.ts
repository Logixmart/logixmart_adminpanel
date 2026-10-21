const BLOCK_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'LI',
  'UL',
  'OL',
  'BLOCKQUOTE',
  'PRE',
  'DIV',
  'TR',
  'TD',
  'TH',
]);

export function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Plain text from HTML (for word counts, search, and card previews). */
export function htmlToPlainText(html: string): string {
  if (!html?.trim()) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\u00a0/g, ' ').trim();
}

export function countWordsFromHtml(html: string): number {
  return countWords(htmlToPlainText(html));
}

export function isEmptyHtml(html: string): boolean {
  return !htmlToPlainText(html);
}

/**
 * Newline-separated plain text from HTML: each block (paragraph, list item,
 * heading, hard break) becomes its own line. Use before splitting HTML body
 * content into string[] fields.
 */
export function htmlToTextLines(html: string): string {
  if (!html?.trim()) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const lines: string[] = [];
  let current = '';

  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      current += (node.textContent || '').replace(/\u00a0/g, ' ');
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = (node as Element).tagName.toUpperCase();

    if (tag === 'BR') {
      if (current.trim()) lines.push(current.trim());
      current = '';
      return;
    }

    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock && current.trim()) {
      lines.push(current.trim());
      current = '';
    }
    for (const child of Array.from(node.childNodes)) walk(child);
    if (isBlock && current.trim()) {
      lines.push(current.trim());
      current = '';
    }
  };

  for (const child of Array.from(doc.body.childNodes)) walk(child);
  if (current.trim()) lines.push(current.trim());

  return lines.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Plain-text items rendered as an HTML bullet list (for rich-text editors). */
export function listToHtml(items: string[]): string {
  const listItems = items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<li>${escapeHtml(item)}</li>`);
  if (listItems.length === 0) return '';
  return `<ul>${listItems.join('')}</ul>`;
}

const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'S',
  'STRIKE',
  'H1',
  'H2',
  'H3',
  'UL',
  'OL',
  'LI',
  'A',
  'BLOCKQUOTE',
  'CODE',
  'PRE',
]);

const SAFE_URL = /^(https?:|mailto:|tel:)/i;

/**
 * Allowlist sanitizer for TipTap HTML before storage or public render.
 * Strips scripts, event handlers, and unsafe URLs.
 * Reuse on the public website when rendering blog HTML:
 *   dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.description) }}
 */
export function sanitizeHtml(html: string): string {
  if (!html?.trim()) return '';

  const doc = new DOMParser().parseFromString(html, 'text/html');
  sanitizeChildren(doc.body);
  return doc.body.innerHTML;
}

function sanitizeChildren(parent: ParentNode): void {
  let child = parent.firstChild;

  while (child) {
    const next = child.nextSibling;

    if (child.nodeType === Node.TEXT_NODE) {
      child = next;
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      parent.removeChild(child);
      child = next;
      continue;
    }

    const el = child as HTMLElement;
    const tag = el.tagName.toUpperCase();

    if (!ALLOWED_TAGS.has(tag)) {
      const firstInserted = el.firstChild;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
      child = firstInserted ?? next;
      continue;
    }

    const href = tag === 'A' ? el.getAttribute('href')?.trim() ?? '' : '';

    for (const attr of Array.from(el.attributes)) {
      el.removeAttribute(attr.name);
    }

    if (tag === 'A' && href && SAFE_URL.test(href)) {
      el.setAttribute('href', href);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }

    sanitizeChildren(el);
    child = next;
  }
}

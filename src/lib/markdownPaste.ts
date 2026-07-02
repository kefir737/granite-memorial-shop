import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export function looksLikeMarkdown(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    /^#{1,6}\s/m.test(t) ||
    /^\s*[-*+]\s/m.test(t) ||
    /^\s*\d+\.\s/m.test(t) ||
    /\*\*[^*]+\*\*/.test(t) ||
    /^>\s/m.test(t)
  );
}

function decodeHtml(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

export function markdownToHtml(markdown: string): string {
  const parsed = marked.parse(markdown.trim());
  return typeof parsed === 'string' ? parsed : '';
}

/** Convert IDE paste (<pre><code>) or raw markdown blocks into article HTML. */
export function sanitizeEditorHtml(html: string): string {
  if (!html || !/<pre[\s>]/i.test(html)) return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const code = doc.querySelector('pre code');
  if (!code) return html;

  const raw = decodeHtml(code.textContent || '');
  if (!raw.trim()) return html;

  if (looksLikeMarkdown(raw) || raw.includes('# ') || raw.includes('## ')) {
    return markdownToHtml(raw);
  }

  return raw
    .split(/\n{2,}/)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function transformPastedHtml(html: string): string {
  if (!html || !/<pre[\s>]/i.test(html)) return html;
  return sanitizeEditorHtml(html);
}

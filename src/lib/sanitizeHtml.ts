import DOMPurify from 'dompurify';

/**
 * Sanitizes a raw HTML string before it is ever set via `innerHTML`.
 *
 * This is the *only* XSS boundary for raw-HTML markdown blocks: Tauri's
 * `security.csp` is `null` (see `src-tauri/tauri.conf.json`), so there is no
 * Content-Security-Policy backstop in the webview. DOMPurify's defaults
 * already strip `<script>`, `on*` event handler attributes, `javascript:`
 * URLs, and `<iframe>`/`<object>`/`<embed>` — exactly what we want for
 * untrusted markdown content pasted or imported into the editor.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

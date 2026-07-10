import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useMemo } from 'react';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

/**
 * Renders a raw-HTML markdown block (`<dl>`, `<details>`, arbitrary tags —
 * see `htmlBlock` in `src/extensions/rawHtml.ts`) as real, sanitized DOM.
 * DOMPurify is the only XSS boundary here (Tauri's CSP is `null`), so the
 * raw string is always sanitized immediately before `innerHTML`, never
 * rendered unsanitized even transiently.
 *
 * `contentEditable={false}`: the block is atomic (edit its source in Source
 * mode) rather than inline-editable — arbitrary sanitized HTML isn't a
 * ProseMirror-editable structure.
 */
export function HtmlBlockNodeView({ node }: NodeViewProps) {
  const html = (node.attrs.html as string) || '';
  const safeHtml = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <NodeViewWrapper
      className="html-block"
      contentEditable={false}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

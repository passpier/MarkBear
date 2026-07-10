import { Editor } from '@tiptap/core';
import { createMarkdownExtensions, type MarkdownExtensionOverrides } from './markdownExtensions';

/**
 * Headless Tiptap editor for round-trip tests, built from the exact same
 * `createMarkdownExtensions()` factory `Editor.tsx` uses — so these tests
 * exercise the real production markdown pipeline, not a parallel one that
 * could silently drift.
 *
 * tiptap-markdown patches `Editor`'s `content` option: if it's a string, it's
 * run through the markdown parser before the doc is built (see
 * `MarkdownParser` in `node_modules/tiptap-markdown`), exactly like
 * `Editor.tsx` passing raw markdown as `content` to `useEditor`. No DOM
 * mounting is required — `@tiptap/core`'s `Editor` creates its own detached
 * element when none is given, which works fine under Vitest's jsdom
 * environment.
 */
export function createHeadlessEditor(markdown: string, overrides?: MarkdownExtensionOverrides): Editor {
  return new Editor({
    extensions: createMarkdownExtensions(overrides),
    content: markdown,
  });
}

export function getMarkdown(editor: Editor): string {
  return (editor.storage['markdown'] as { getMarkdown: () => string }).getMarkdown();
}

/** Parse `markdown` into the editor, serialize it straight back out, and clean up. */
export function mdRoundTrip(markdown: string): string {
  const editor = createHeadlessEditor(markdown);
  const out = getMarkdown(editor);
  editor.destroy();
  return out;
}

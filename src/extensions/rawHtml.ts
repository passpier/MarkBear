import { Mark, Node, mergeAttributes } from '@tiptap/core';
import type { MarkdownSerializerState } from '@tiptap/pm/markdown';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

interface MarkdownItLike {
  renderer: {
    rules: Record<string, (tokens: HtmlBlockToken[], idx: number) => string>;
  };
}
interface HtmlBlockToken {
  content: string;
}

/**
 * Overrides markdown-it's `html_block` rule (any HTML tag markdown-it itself
 * recognizes as block-level per CommonMark, e.g. `<dl>`, `<details>`,
 * `<div>` — not a fixed tag list we maintain) so the *entire* raw chunk is
 * captured verbatim in a `data-html-block` attribute instead of being
 * emitted as literal markup. Emitting it as markup would otherwise go
 * through the browser's `DOMParser` and then ProseMirror's schema-based
 * `DOMParser.fromSchema`, which silently drops any tag with no matching
 * schema node (that's the bug this feature fixes). Wrapping it in a single
 * leaf attribute sidesteps that entirely — the content only re-becomes real
 * DOM once, sanitized, inside `HtmlBlockNodeView`.
 *
 * `encodeURIComponent` (not raw HTML) is used for the attribute payload so
 * embedded quotes/newlines can't break out of the `data-html-block="…"`
 * attribute during the browser's HTML parse step.
 */
function installHtmlBlockRenderer(md: MarkdownItLike) {
  md.renderer.rules.html_block = (tokens, idx) => {
    const raw = tokens[idx].content.trimEnd();
    return `<div data-html-block="${encodeURIComponent(raw)}"></div>`;
  };
}

/**
 * Leaf/atom node holding one raw HTML block verbatim. Deliberately has no
 * `addNodeView` here — this file is imported by both the live editor
 * (`Editor.tsx`) and headless Vitest round-trip tests
 * (`src/extensions/rawHtml.test.ts`), and the sanitized React node view
 * (`HtmlBlockNodeView`) only makes sense inside a mounted editor. Editor.tsx
 * does `HtmlBlock.extend({ addNodeView() {...} })` and registers that
 * extended version instead — the same pattern already used for
 * `MermaidCodeBlock`/`CodeBlockLowlight`.
 *
 * The default `renderHTML` below (used only if no node view is registered,
 * i.e. in headless tests) renders the raw markup as inert *text*, not via
 * `innerHTML` — so it stays safe without DOMPurify even without a node view.
 */
export const HtmlBlock = Node.create({
  name: 'htmlBlock',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: (el: HTMLElement) => {
          const raw = el.getAttribute('data-html-block');
          return raw ? decodeURIComponent(raw) : '';
        },
        renderHTML: (attrs: Record<string, unknown>) => ({
          'data-html-block': encodeURIComponent((attrs.html as string) || ''),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-html-block]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'html-block-fallback' }), node.attrs.html as string];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
          state.write(node.attrs.html as string);
          state.closeBlock(node);
        },
        parse: {
          setup: installHtmlBlockRenderer,
        },
      },
    };
  },
});

/**
 * Curated inline HTML marks. Inline HTML (unlike block HTML) is tokenized
 * per-tag by markdown-it (`html_inline`) and echoed verbatim into the
 * rendered HTML string with no override needed — the browser's `DOMParser`
 * turns e.g. `<kbd>Ctrl</kbd>` back into a real `<kbd>` element, which these
 * marks' `parseHTML` picks up directly. No custom `markdown.serialize` is
 * defined for any of them: tiptap-markdown's `HTMLMark` fallback (active
 * whenever `Markdown.configure({ html: true })`, already set in
 * `markdownExtensions.ts`) writes back the exact `<tag>…</tag>` pair by
 * inspecting each mark's own `renderHTML`, so these round-trip automatically.
 *
 * `<s>`/`<del>`/`<strike>` are deliberately NOT duplicated here — StarterKit's
 * built-in `Strike` mark already parses all three and serializes to GFM
 * `~~text~~`, which is the correct, already-tested behavior elsewhere in the
 * app (`~~Scratch this.~~`). Adding a competing `del` mark would just create
 * a schema ambiguity for no benefit.
 */

export const Kbd = Mark.create({
  name: 'kbd',
  parseHTML() {
    return [{ tag: 'kbd' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['kbd', HTMLAttributes, 0];
  },
});

export const Highlight = Mark.create({
  name: 'highlight',
  parseHTML() {
    return [{ tag: 'mark' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', HTMLAttributes, 0];
  },
});

export const Subscript = Mark.create({
  name: 'subscript',
  parseHTML() {
    return [{ tag: 'sub' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['sub', HTMLAttributes, 0];
  },
});

export const Superscript = Mark.create({
  name: 'superscript',
  parseHTML() {
    // `footnoteReference` (see `footnotes.ts`) also renders as a `<sup>`
    // (with `data-footnote-label`) — exclude it here so parsing is
    // unambiguous instead of relying on registration order.
    return [{ tag: 'sup:not([data-footnote-label])' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['sup', HTMLAttributes, 0];
  },
});

export const Underline = Mark.create({
  name: 'underline',
  parseHTML() {
    return [{ tag: 'u' }, { tag: 'ins' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['u', HTMLAttributes, 0];
  },
});

export const Abbreviation = Mark.create({
  name: 'abbreviation',
  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('title'),
        renderHTML: (attrs: Record<string, unknown>) => (attrs.title ? { title: attrs.title as string } : {}),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'abbr' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['abbr', HTMLAttributes, 0];
  },
});

export const Small = Mark.create({
  name: 'small',
  parseHTML() {
    return [{ tag: 'small' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['small', HTMLAttributes, 0];
  },
});

import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { MarkdownSerializerState } from '@tiptap/pm/markdown';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import footnotePlugin from 'markdown-it-footnote';

// markdown-it's own type surface is loose enough (its plugins mutate
// `md.renderer.rules` with untyped functions) that a structural minimal type
// is clearer here than fighting `@types/markdown-it`'s generics.
interface MarkdownItLike {
  use: (plugin: (md: MarkdownItLike) => void) => void;
  renderer: {
    rules: Record<string, (tokens: FootnoteToken[], idx: number) => string>;
  };
}
interface FootnoteToken {
  meta?: { label?: string };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

/**
 * Wires `markdown-it-footnote` into the shared markdown-it instance and
 * overrides its default renderer rules (which emit `<sup><a href="#fn…">`,
 * `<section><ol><li>`) with markup our ProseMirror schema can parse
 * unambiguously:
 *   - a plain `data-footnote-label` attribute carrying the original `[^id]`
 *     label (not a synthesized numeric id), so serialization can round-trip
 *     the exact label the user wrote.
 *   - no `<a>`/`<ol>`/`<li>` wrappers, which would otherwise be captured by
 *     the `link`/`orderedList`/`listItem` schema nodes instead of by our
 *     footnote nodes.
 * Only `footnoteReference` (below) registers this as its `parse.setup` hook
 * — tiptap-markdown calls `setup` once per registered extension against the
 * *same* markdown-it instance, so calling `md.use(footnotePlugin)` from more
 * than one extension would register the block/inline tokenizer rules twice.
 */
function installFootnoteRenderer(md: MarkdownItLike) {
  md.use(footnotePlugin as unknown as (md: MarkdownItLike) => void);
  md.renderer.rules.footnote_ref = (tokens, idx) => {
    const label = tokens[idx].meta?.label ?? '';
    return `<sup class="footnote-ref" data-footnote-label="${escapeAttr(label)}">${escapeHtml(label)}</sup>`;
  };
  md.renderer.rules.footnote_block_open = () => '<div class="footnotes" data-footnotes="true">';
  md.renderer.rules.footnote_block_close = () => '</div>';
  // The inner `.footnote-item-content` wrapper matches `FootnoteDefinition`'s
  // `renderHTML` exactly (see below) — ProseMirror's content hole (`0`) may
  // not sit alongside sibling elements (the decorative label/backref) in the
  // *same* toDOM array, so those live in an outer node with content nested
  // one level down. `parseHTML`'s `contentElement` selector relies on both
  // this markdown-it output and the live-editor `renderHTML` output having
  // the identical wrapper in the identical place.
  md.renderer.rules.footnote_open = (tokens, idx) => {
    const label = tokens[idx].meta?.label ?? '';
    return `<div class="footnote-item" data-footnote-label="${escapeAttr(label)}"><div class="footnote-item-content">`;
  };
  md.renderer.rules.footnote_close = () => '</div></div>';
  // We render our own backref anchor in `FootnoteDefinition.renderHTML`
  // instead of markdown-it-footnote's per-usage `↩` anchors.
  md.renderer.rules.footnote_anchor = () => '';
}

export const FootnoteReference = Node.create({
  name: 'footnoteReference',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      label: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-footnote-label'),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.label ? { 'data-footnote-label': attrs.label as string } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'sup.footnote-ref[data-footnote-label]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const label = (node.attrs.label as string) ?? '';
    return [
      'sup',
      mergeAttributes(HTMLAttributes, { class: 'footnote-ref', contentEditable: 'false' }),
      label,
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
          state.write(`[^${node.attrs.label as string}]`);
        },
        parse: {
          setup: installFootnoteRenderer,
        },
      },
    };
  },
});

export const FootnotesSection = Node.create({
  name: 'footnotesSection',
  group: 'block',
  content: 'footnoteDefinition+',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-footnotes]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'footnotes', 'data-footnotes': 'true' }), 0];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
          state.renderContent(node);
        },
        parse: {},
      },
    };
  },
});

export const FootnoteDefinition = Node.create({
  name: 'footnoteDefinition',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      label: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-footnote-label'),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.label ? { 'data-footnote-label': attrs.label as string } : {},
      },
    };
  },

  parseHTML() {
    // `contentElement` must match `renderHTML`'s nested content wrapper
    // below — see the comment on `installFootnoteRenderer`'s
    // `footnote_open`/`footnote_close` overrides for why both sides need the
    // identical `.footnote-item-content` shape.
    return [{ tag: 'div.footnote-item[data-footnote-label]', contentElement: '.footnote-item-content' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const label = (node.attrs.label as string) ?? '';
    return [
      'div',
      mergeAttributes(HTMLAttributes, { class: 'footnote-item' }),
      ['span', { class: 'footnote-label', contentEditable: 'false' }, `${label}.`],
      ['div', { class: 'footnote-item-content' }, 0],
      [
        'a',
        {
          href: `#footnote-ref-${label}`,
          class: 'footnote-backref',
          'data-footnote-label': label,
          contentEditable: 'false',
          'aria-label': 'Back to reference',
        },
        '↩',
      ],
    ];
  },

  addStorage() {
    return {
      markdown: {
        // Standard footnote continuation format: the label prefix is only on
        // the first line, every subsequent line (including additional
        // paragraphs after a blank line) is indented 4 spaces, e.g.:
        //   [^first]: Footnote **can have markup**
        //
        //       and multiple paragraphs.
        serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
          const label = node.attrs.label as string;
          state.wrapBlock('    ', `[^${label}]: `, node, () => state.renderContent(node));
        },
        parse: {},
      },
    };
  },
});

/**
 * Click-to-jump navigation between a `[^label]` reference and its
 * definition, and back via the `↩` backref. Implemented as a native DOM
 * click handler (`handleDOMEvents`) rather than per-node React node views —
 * both endpoints are cheap `querySelector` lookups within the editor DOM,
 * so a single plugin covers every reference/definition pair.
 */
export const FootnoteClickPlugin = Extension.create({
  name: 'footnoteClickHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('footnoteClickHandler'),
        props: {
          handleDOMEvents: {
            click(view, event) {
              const target = event.target as HTMLElement | null;
              if (!target) return false;

              const ref = target.closest('.footnote-ref[data-footnote-label]');
              if (ref) {
                const label = ref.getAttribute('data-footnote-label');
                const dest = label
                  ? Array.from(
                      view.dom.querySelectorAll('.footnote-item[data-footnote-label]'),
                    ).find((el) => el.getAttribute('data-footnote-label') === label)
                  : null;
                dest?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                event.preventDefault();
                return true;
              }

              const backref = target.closest('.footnote-backref[data-footnote-label]');
              if (backref) {
                const label = backref.getAttribute('data-footnote-label');
                const dest = label
                  ? Array.from(
                      view.dom.querySelectorAll('.footnote-ref[data-footnote-label]'),
                    ).find((el) => el.getAttribute('data-footnote-label') === label)
                  : null;
                dest?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                event.preventDefault();
                return true;
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});

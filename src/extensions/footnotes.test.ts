import { describe, expect, it } from 'vitest';
import { createHeadlessEditor, mdRoundTrip } from '@/lib/markdownTestUtils';

// Mirrors the "# Footnotes" section of Markdown-Syntax_Validation.md: a
// duplicated reference and a multi-paragraph, 4-space-indented definition.
const FOOTNOTES_MD = [
  'Footnote 1 link[^first].',
  '',
  'Footnote 2 link[^second].',
  '',
  'Duplicated footnote reference[^second].',
  '',
  '[^first]: Footnote **can have markup**',
  '',
  '    and multiple paragraphs.',
  '',
  '[^second]: Footnote text.',
  '',
].join('\n');

describe('footnotes', () => {
  it('parses references and definitions into the schema, preserving labels and duplicates', () => {
    const editor = createHeadlessEditor(FOOTNOTES_MD);
    const refs: string[] = [];
    const defs: string[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'footnoteReference') refs.push(node.attrs.label as string);
      if (node.type.name === 'footnoteDefinition') defs.push(node.attrs.label as string);
    });
    editor.destroy();

    // Three references (duplicated "second" kept as two separate ref nodes)...
    expect(refs).toEqual(['first', 'second', 'second']);
    // ...but only one definition per unique label.
    expect(defs).toEqual(['first', 'second']);
  });

  it('renders references as a single superscript label element', () => {
    const editor = createHeadlessEditor('Ref[^first].\n\n[^first]: Text.');
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toContain('class="footnote-ref"');
    expect(html).toContain('data-footnote-label="first"');
  });

  it('round-trips labels and the multi-paragraph continuation verbatim', () => {
    const out = mdRoundTrip(FOOTNOTES_MD);

    expect(out).toMatch(/\[\^first]: Footnote \*\*can have markup\*\*/);
    expect(out).toMatch(/\n {4}and multiple paragraphs\./);
    expect(out).toContain('[^second]: Footnote text.');
    // Both usages of the duplicated reference survive the round-trip.
    expect(out.match(/\[\^second]/g)?.length).toBe(3); // 2 refs + 1 definition
  });
});

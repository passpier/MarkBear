import { describe, expect, it } from 'vitest';
import { mdRoundTrip } from './markdownTestUtils';

// Guards against the footnote/raw-HTML extensions disturbing existing,
// already-shipped markdown serialization (tables, task lists, links) when
// they're added to the same shared extensions array.
describe('no-regression: pre-existing markdown features still round-trip', () => {
  it('round-trips a task list', () => {
    const md = '- [x] Done\n\n- [ ] Not done';
    const out = mdRoundTrip(md);
    expect(out).toContain('[x] Done');
    expect(out).toContain('[ ] Not done');
  });

  it('round-trips an inline link', () => {
    const md = '[Example](https://example.com)';
    expect(mdRoundTrip(md).trim()).toBe(md);
  });

  it('round-trips a GFM table', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const out = mdRoundTrip(md);
    expect(out).toContain('| A | B |');
    expect(out).toContain('| 1 | 2 |');
  });

  it('round-trips strikethrough from both ~~ and <del>/<s> (StarterKit Strike, not a competing mark)', () => {
    expect(mdRoundTrip('~~Scratch this.~~').trim()).toBe('~~Scratch this.~~');
    expect(mdRoundTrip('<del>Scratch this.</del>').trim()).toBe('~~Scratch this.~~');
  });
});

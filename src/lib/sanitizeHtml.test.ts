import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

// The fixture used for manual smoke testing (Markdown-Syntax_Validation.md)
// has a dedicated "XSS sanitizer test" block with exactly this shape —
// this test is the automated equivalent that doesn't rely on eyeballing a
// rendered webview for whether an alert box did or didn't fire.
describe('sanitizeHtml', () => {
  it('strips <script> tags', () => {
    const dirty = '<div><script>alert(\'xss\')</script><p>safe</p></div>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('alert(');
    expect(clean).toContain('<p>safe</p>');
  });

  it('strips inline event handler attributes', () => {
    const dirty = '<img src="x" onerror="alert(\'xss2\')">';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('alert(');
  });

  it('strips iframe embeds', () => {
    const dirty = '<iframe src="https://evil.example"></iframe>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<iframe');
  });

  it('strips javascript: URLs', () => {
    const dirty = '<a href="javascript:alert(1)">click</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('javascript:');
  });

  it('preserves benign structural HTML (definition lists, details)', () => {
    const dl = '<dl><dt>Term</dt><dd>Definition</dd></dl>';
    const clean = sanitizeHtml(dl);
    expect(clean).toContain('<dt>Term</dt>');
    expect(clean).toContain('<dd>Definition</dd>');

    const details = '<details><summary>More</summary><p>Body</p></details>';
    const cleanDetails = sanitizeHtml(details);
    expect(cleanDetails).toContain('<summary>More</summary>');
    expect(cleanDetails).toContain('<p>Body</p>');
  });
});

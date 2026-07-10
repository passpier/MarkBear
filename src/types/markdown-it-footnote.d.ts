// `markdown-it-footnote` ships no type declarations (no `.d.ts`, no `types`
// field in its package.json) and there's no `@types/markdown-it-footnote`
// package. It's a standard markdown-it plugin: a function taking the
// markdown-it instance and mutating it in place.
declare module 'markdown-it-footnote' {
  export default function footnote(md: unknown): void;
}

# FAQ & Known Limitations

## Is import a round-trip converter?

No. `File → Import` converts a source document **into** Markdown, one-way.
Exporting back to the original format (or to HTML/PDF) will not reconstruct
the exact original layout — Markdown is a simpler format by design, and
Pourdown's value is in getting content *into* an editable, version-controllable
form, not in perfectly mirroring Office/PDF layout back out.

## Why is xlsx import capped at 500 rows per sheet?

This is a deliberate, documented limit, not a bug — very large sheets
produce Markdown tables that are unwieldy to hand-edit anyway. An inline note
is added when rows are omitted so you know data was truncated.

## Why didn't my PDF table convert correctly?

PDF table detection uses conservative geometry clustering — it requires at
least two aligned columns across at least three consecutive rows before it
will treat something as a table, specifically to avoid misreading incidental
alignment (like a `Name: / Role:` pair) as tabular data. If a table cell's
wrapped content is itself an indented or bulleted list, it falls outside that
alignment tolerance and the affected row renders as plain prose instead of a
corrupted table. This is a considered trade-off favoring "definitely correct
prose" over "maybe-correct but silently wrong table."

## Why can't I see some images from my Word/PowerPoint/PDF file?

Vector image formats (EMF/WMF), which are common in Office exports, can't be
rendered by the app's embedded webview. Pourdown replaces them with an
`*(unsupported image)*` note rather than showing a broken image link.

## What happened to pptx animations?

They're dropped on import — Markdown has no way to represent animation, so
there's nothing to convert them to.

## Does Pourdown use any code from MarkItDown?

No. The idea of converting documents into clean, LLM-friendly Markdown was
popularized by Microsoft's [MarkItDown](https://github.com/microsoft/markitdown),
and Pourdown's import feature was **inspired by that concept** — but
Pourdown is an independent reimplementation written in Rust, using an
entirely different set of libraries. It is not a port and not a fork. Both
projects are MIT-licensed. See
[`markdown-import.md`](https://github.com/passpier/Pourdown/blob/main/markdown-import.md)
for the full comparison.

## I found a bug / have a feature idea — where do I report it?

Please use the
[issue templates](https://github.com/passpier/Pourdown/issues/new/choose) on
GitHub. If it's about one of the limitations above, it helps to mention that
you've read this page — we may want to discuss the trade-off before changing
it. See [`CONTRIBUTING.md`](https://github.com/passpier/Pourdown/blob/main/CONTRIBUTING.md)
if you'd like to submit a fix yourself.

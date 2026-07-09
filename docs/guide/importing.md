# Importing Documents

Most writing lives in Word documents, spreadsheets, or slide decks — formats
that are hard to version-control, collaborate on, or publish as-is. Pourdown
lets you import any of them directly into an editable Markdown document, so
you can clean up, restructure, and export without manual copy-pasting.

**How to import:** `File → Import` → choose your format. The file opens
immediately as a new Markdown document.

> Import converts content to Markdown — it's **one-way**. Exporting back to
> the original format will not restore the original layout exactly.

## What gets converted

### Word (`.docx`)

- Headings (styles + outline level), bold / italic / strikethrough
- Nested bullet and numbered lists, tables, hyperlinks
- Embedded images, extracted as sidecar files and shown inline

**Limitations:** vector images (EMF/WMF) can't be displayed in the editor;
tracked changes and comments are dropped; a table of contents becomes a
placeholder rather than being reconstructed.

### Spreadsheet (`.xlsx` / `.xls` / `.ods`)

- Each sheet becomes a section with a full GFM table
- Date columns are auto-detected (header contains "date" / "日期") and
  formatted as ISO dates
- Embedded images are extracted

**Limitations:** capped at 500 rows per sheet (with a note when rows are
omitted); images can't be mapped to a specific sheet/cell, so they're listed
in a best-effort "Embedded Images" section instead of placed inline.

### PDF

- Headings inferred from font-size ratios relative to the page's body text
- Paragraph flow sorted top-to-bottom, left-to-right
- Tables detected via geometry (aligned columns across several consecutive
  rows) and rendered as GFM tables
- Table of Contents entries (dot-leader lines) render as a bulleted list
- Embedded images extracted in reading order

**Limitations:** text-based PDFs only — scanned/image PDFs aren't supported;
complex multi-column layouts may reorder; a table whose wrapped cell content
is itself an indented/bulleted list falls back to plain paragraphs rather
than corrupting the table (a deliberate, conservative trade-off).

### PowerPoint (`.pptx`)

- Slide titles become `#` headings; body text becomes paragraphs, one slide
  per section (separated by `---`)
- Bullet/indent level and basic bold/italic formatting are preserved
- Embedded images are extracted and shown inline

**Limitations:** animations aren't captured (not representable in Markdown);
vector images (EMF/WMF) can't be displayed.

## Image handling

Extracted images across all four formats are saved as sidecar files next to
the imported document — an `assets/` folder while the document is unsaved,
relocated to `<name>.assets/` alongside the `.md` file on first save — and
render live in the editor. The `.md` file only ever stores the relative
path, so the document and its images stay portable together as one unit you
can move, zip, or commit to git.

Vector formats the webview can't render (EMF/WMF, common in Office exports)
are replaced with an `*(unsupported image)*` note instead of a broken image
link.

## Why Markdown Import?

Files are converted to Markdown before processing to minimize token usage.
Community benchmarks show Markdown is roughly 15% more token-efficient than
JSON, and up to 96% more efficient than raw PDF, when fed to LLMs.

This approach was inspired by Microsoft's
[MarkItDown](https://github.com/microsoft/markitdown); Pourdown is an
independent reimplementation in Rust, not a fork or a port — see
[`markdown-import.md`](https://github.com/passpier/Pourdown/blob/main/markdown-import.md)
in the repository for the full technical breakdown of how each converter
works.

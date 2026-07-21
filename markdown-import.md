# Markdown Import

This document explains how Pourdown's document-import feature works, where the
idea came from, and how each format is converted.

## Overview

`File → Import` converts a Word, Excel, PDF, or PowerPoint file into a new
Markdown document that opens immediately in the editor. Import is **one-way**:
source format → Markdown. Pourdown is not a round-trip converter — exporting
back to the original format will not restore the original layout exactly.

## Inspiration & credit

The idea of converting arbitrary documents into clean, LLM-friendly Markdown —
and the rationale that Markdown is more token-efficient than raw PDF/JSON for
downstream processing — was popularized by Microsoft's
[**MarkItDown**](https://github.com/microsoft/markitdown). Pourdown's import
feature was **inspired by that concept**.

To be clear about what that means in practice: **Pourdown does not use or
adapt any MarkItDown code.** It is an independent reimplementation, written in
Rust, using an entirely different set of libraries. It is not a port, and not
a fork.

Both projects are MIT-licensed, so no legal notice is required — this section
exists purely to credit the origin of the idea.

## How Pourdown differs from MarkItDown

| | MarkItDown | Pourdown |
|---|---|---|
| Language | Python | Rust |
| Approach | Often converts via an intermediate HTML representation | Converts each format directly to Markdown |
| Word | `mammoth` | `docx-rs` |
| Spreadsheet | `openpyxl` | `calamine` |
| PDF | `pdfminer` | `pdfium-render` |
| PowerPoint | `python-pptx` | Manual ZIP + XML parsing |

## Import pipeline

1. User selects **File → Import** and picks a file.
2. The frontend calls the Tauri `import_document` command (see
   `src-tauri/src/main.rs`), which dispatches by file extension and runs the
   conversion on a background thread (`tokio::task::spawn_blocking`) so the UI
   stays responsive.
3. The matching converter in `src-tauri/src/convert/{docx,xlsx,pdf,pptx}.rs`
   turns the source file into a Markdown string.
4. The returned Markdown opens as a new document in the Tiptap editor (or is
   viewable in raw Source mode).

The reverse path (`export_document`) is intentionally narrower than import: it
writes Markdown out to **HTML** (`convert::html::markdown_to_html`) or **PDF**
(`convert::pdf::markdown_to_pdf`) only. Office export (docx/xlsx/pptx) was
removed — Pourdown's core value is importing rich formats into editable
Markdown, not faithfully round-tripping Office layout/styling back out, which
Markdown can't represent anyway. HTML and PDF are the two general-purpose,
layout-controllable targets Markdown naturally maps to (web share/embed and
standardized read/print, respectively).

## Per-format conversion approach

### Word (`.docx`) — `docx-rs`

- Headings are detected from paragraph style IDs (`Heading1`–`Heading6`) with
  a fallback to the paragraph's outline level.
- Bold, italic, and strikethrough runs are mapped to `**`, `*`, and `~~`
  markers; adjacent runs with identical formatting are merged to avoid
  artifacts like `****`.
- Numbered vs. bulleted lists are resolved via the document's numbering
  definitions (abstract numbering ID → format), with nested indentation.
  Tables become GFM tables.
- External hyperlinks become `[text](url)`; internal anchor links are flattened
  to plain text.
- A table of contents is replaced with an HTML comment placeholder rather than
  being reconstructed.
- Embedded pictures (`word/media/*`) are extracted and written as sidecar
  files next to the imported document, referenced with a real `![]()` Markdown
  image link in place of the original run. Vector formats the webview can't
  render (EMF/WMF) fall back to an `*(unsupported image)*` note instead.

### Spreadsheet (`.xlsx` / `.xls` / `.ods`) — `calamine`

- Each worksheet becomes a `##` section followed by a full GFM table.
- Columns whose header text looks like a date (e.g. contains "date" or "日期")
  have their numeric values reinterpreted as Excel date serials and formatted
  as ISO dates (`YYYY-MM-DD`).
- "Continuation rows" — where a long cell pushes trailing columns onto the next
  physical row — are merged back into the previous row when the two rows'
  non-empty cells don't overlap.
- Capped at 500 data rows per sheet, with an inline note when rows are omitted.
- Embedded pictures (`xl/media/*`) are extracted as sidecar files. calamine
  doesn't expose which cell/sheet a picture belongs to, so they're listed in a
  best-effort "Embedded Images" section rather than placed inline.

### PDF — `pdfium-render`

- Text is extracted per page as positioned blocks (x/y coordinates + font
  size), not as a raw text stream.
- Repeated running headers/footers (author/title strips, page numbers) are
  detected and stripped before any page is rendered:
  `detect_running_headers_footers` scans every page's top/bottom margin band,
  normalizes digit runs to `#` so incrementing page numbers compare equal
  (`normalize_hf`), and flags any band line recurring on at least 3 distinct
  pages — the same "require repeated structural evidence" gate used for table
  and gutter detection. Because this runs on the raw text blocks, it also
  catches a page number fused into body text by reading-order reconstruction
  (e.g. "...components. 18913"), not just a standalone header/footer line.
  A header/footer that recurs on fewer than 3 pages, or is fused with unique
  per-page text (e.g. a page-1 footer merged into a copyright notice), is
  conservatively left in place.
- Standard two-column layouts (IEEE Access and similar journals) are
  detected before reading order is reconstructed: `detect_gutter` looks for a
  vertical strip repeatedly uncrossed by text across several lines (mirroring
  the same "require repeated structural evidence" gate used for table
  detection, not just one incidental gap), and `segment_page` splits the page
  into full-width dividers (titles, running headers/footers, wide
  figures/tables) and two-column bands, each read top-to-bottom
  independently — left column in full, then right column. Pages without a
  detected gutter fall back to the original single-column path unchanged.
- Within each region, blocks are grouped into visual lines by vertical
  proximity, then sorted top-to-bottom and left-to-right to reconstruct
  reading order. Consecutive plain body lines are reflowed into single
  paragraphs, de-hyphenating words that wrapped across a line break (e.g.
  "bet-\nter" becomes "better") — a heuristic that only fires on an explicit
  hyphen character, so a line break with no literal hyphen glyph in the PDF's
  text stream isn't rejoined.
- Heading levels are inferred from font-size ratio relative to the page's
  median (body) font size, with an ALL-CAPS short-line heuristic as a fallback
  when font sizes don't vary.
- Large vertical gaps between lines insert a blank line to preserve paragraph
  breaks. An import notice is prepended noting that layout is inferred, not
  exact.
- Tables are detected with conservative geometry clustering: visual lines are
  segmented into cells on large horizontal gaps, and a table region only
  starts where at least three consecutive lines share the same ≥2 column
  x-positions (`detect_table_regions` in `convert/pdf.rs`) — this avoids
  misreading incidental two-line alignment (e.g. a "Name: / Role:" pair) as a
  table. A wrapped cell that continues onto its own physical line (its text
  aligns under one interior column, other columns empty) is merged back into
  the row above with `<br>`. Detected regions render as GFM tables. As a
  hybrid confirming signal, ruling lines drawn as PDF path objects are used
  to refuse a continuation merge across an explicit row separator. A short
  bordered table (as few as 2 aligned rows) additionally clears the gate on
  its own — without waiting for a third aligned row — when it's enclosed by
  a real ruled box: a horizontal rule immediately above and below the row
  range, plus an interior vertical rule between the columns
  (`is_bordered_grid`, fed by a second path-object scan,
  `collect_vertical_rules`, mirroring the existing horizontal-rule scan).
  This never loosens the borderless path — a page with no drawn table
  borders (`v_rules`/`h_rules` empty) behaves exactly as before.
- Equations are demarcated best-effort, not reconstructed as LaTeX: a run
  whose PDF font is a recognized math family — Computer Modern/AMS
  (`CMMI`/`CMSY`/`CMEX`/`MSBM`, LaTeX output) or MathType (`RMTMI`/`MTSYN`/
  `MTEX`, Word/desktop-publishing output) — or whose text is dense in math
  symbols/Greek letters is wrapped inline as `$…$` (`is_math_font`,
  `block_is_math` in `convert/pdf.rs`). A whole line that's math-dominant by
  character-weighted ratio renders as its own `$$…$$` display equation
  instead, with a trailing parenthesized equation number kept outside the
  delimiters (`split_trailing_eq_number`). Unicode symbols are preserved as
  extracted; this is a font-position heuristic, not a math-OCR model, so it
  cannot produce true LaTeX.
- Embedded images are extracted from each page's image objects and written as
  sidecar files, positioned in reading order alongside the surrounding text;
  exact placement is approximate for complex layouts. An adjacent caption
  line (`Figure N`, `Fig. N`, `Table N`, `表 N`, `圖 N` — `is_caption_label`)
  is used as the image's alt text (`with_caption_alt`), preferring the line
  right after the image and falling back to the one right before; the
  caption line itself is left in place, this only adds alt text.

### PowerPoint (`.pptx`) — manual ZIP + XML parsing

- The `.pptx` archive is read directly (it's a ZIP of XML parts); slides are
  parsed without a dedicated OOXML presentation crate.
- Each slide becomes a section, separated by `---`; the slide title placeholder
  becomes a `#` heading.
- Body paragraphs preserve bullet/indent level and basic bold/italic
  formatting.
- Image relationships are resolved from each slide's `.rels` file; the
  referenced picture is extracted from `ppt/media/*` and written as a sidecar
  file, rendered inline as a real `![]()` Markdown image link.

## Image handling

Embedded images across all four formats are written as sidecar files next to
the imported document (an `assets/` folder while the document is unsaved,
relocated to `<name>.assets/` alongside the `.md` on first save) and rendered
live in the Tiptap editor via Tauri's asset protocol. The `.md` file itself
only ever stores the relative path, so the document and its image folder stay
portable together.

Vector formats the webview can't display (EMF/WMF, common in Office exports)
are not converted — they're replaced with an `*(unsupported image)*` note
rather than a broken image link.

> Optional image captioning via an external vision-capable LLM (MarkItDown-style,
> opt-in, off by default) is planned as a follow-up but not yet implemented.

## Known limitations

- xlsx import is capped at 500 rows per sheet; embedded images can't be
  mapped to a specific sheet/cell and are listed separately.
- PDF import infers layout, not an exact reconstruction; image placement in
  complex layouts is approximate. Table detection is conservative by design:
  a table whose wrapped cell content is itself an indented/bulleted list
  (outside the column-alignment tolerance) drops that row back to plain
  paragraphs rather than corrupting the table. Math is demarcated
  best-effort (`$…$` / `$$…$$`, Unicode symbols preserved as extracted) from
  math-font/math-symbol detection, not reconstructed as true LaTeX — that
  would require a math-OCR model, which is out of scope for this pure-Rust,
  offline heuristic pipeline. A trailing all-digit parenthetical on a
  display-math line (e.g. a citation year) is indistinguishable from an
  equation number and gets split off the same way; in practice this only
  matters on lines already math-dominant enough to be treated as display
  equations.
- Two-column detection targets the common two-column journal layout
  specifically; three-or-more-column layouts, mixed/irregular column widths,
  and rotated text aren't handled and fall back to single-column reading
  order. Repeated running headers/footers (page numbers, author/title
  strips) are stripped when they recur on at least 3 pages in a page's
  margin band; one that appears fewer times, or is fused with unique
  per-page text, is left inline.
- docx, pptx, and PDF images in vector formats (EMF/WMF) can't be rendered by
  the webview and are replaced with a text note.
- pptx animations are dropped (not representable in Markdown).

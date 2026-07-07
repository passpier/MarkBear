# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pourdown is a Tauri v2 desktop Markdown editor (React 18 + TypeScript frontend, Rust backend) that imports Word/Excel/PowerPoint/PDF files into Markdown and edits them with a Tiptap WYSIWYG editor plus a raw Source mode.

## Structure

- `src/` — React frontend (Vite, TypeScript, Tailwind CSS, Tiptap editor, Zustand state, i18next)
  - `components/{Sidebar,Toolbar,Search,CodeBlockRenderer,Editor}`, `stores/`, `extensions/`, `theme/`, `hooks/`, `lib/`, `i18n/locales/`
- `src-tauri/` — Rust backend, single crate named `Pourdown` (no Cargo workspace)
  - `src/convert/{docx,pdf,pptx,xlsx}.rs` — per-format conversion to/from Markdown
  - `tauri.conf.json`, `capabilities/`, `permissions/`
- No `tests/` directory exists anywhere in the repo — there is no automated test suite for conversion logic.

## Commands

- `pnpm dev` — Vite dev server (frontend only)
- `pnpm tauri dev` — full Tauri dev app
- `pnpm build` — `tsc && vite build`
- `pnpm tauri build` — production desktop build
- `pnpm lint` — `tsc --noEmit && eslint .` (ESLint flat config at `eslint.config.js`)
- `cd src-tauri && cargo clippy --all-targets` — Rust lint (no `cargo test` suite exists; verify Rust conversion changes by running the app and importing a sample file — see `/verify-conversion` skill)
- Package manager is **pnpm** (not npm/yarn) — `pnpm-lock.yaml` is present.

## Rust crate API gotchas (verified against installed versions)

- **pulldown-cmark 0.13** — GFM table header row has NO `TableRow` wrapper; cells sit directly in `TableHead` (`Start(TableHead) → Start(TableCell)… → End(TableHead)`). Data rows DO have `TableRow` wrappers. Capture cells in a `current_row` buffer during `TableHead` and save to `header_row` on `End(TableHead)`.
- **calamine 0.33** — `DataType` is a trait, not the cell enum. The concrete enum is `Data` (`use calamine::{Data, Reader}`). No `Duration` variant; use `DurationIso(String)`. `worksheet_range` returns `Result<Range<Data>, _>`.
- **docx-rs 0.4.x** — `read_docx(buf: &[u8]) -> Result<Docx, ReaderError>` returns a `Result` directly (no `.parse()`). Body children live in `docx.document.children: Vec<DocumentChild>`, with variants `DocumentChild::Paragraph(Box<Paragraph>)` and `DocumentChild::Table(Box<Table>)`. `Bold.val` is private — use `.is_some()` as a proxy for whether bold is enabled.
- **markdown2pdf 0.2.x** — API is `markdown2pdf::parse_into_file(content: String, path: &str, ConfigSource::Default, None)`, not `markdown_to_pdf`. Import `markdown2pdf::config::ConfigSource`.
- **PDF import uses `pdfium-render 0.9`** (not `pdf-extract`) and requires a PDFium library to be available at runtime.
- **Tauri v2 menus** — `event.id()` returns `&MenuId`; use `.0` for string ops (`event.id().0.starts_with(...)`). `menu.get(&id)` returns `Option<MenuItemKind<R>>`. To enable/disable items, match on the `MenuItemKind` variant and call `.set_enabled()` on each arm.

## Image-preserving import (docx/pptx/pdf/xlsx)

All four importers extract embedded images as sidecar files (`convert/media.rs`
`MediaSink`) and emit real `![]()` links instead of dropping/placeholder-ing
them. Images are written to `imports/{id}/assets/` (via `import_document` in
`main.rs`) and relocated to `<name>.assets/` next to the `.md` on first save
(`relocate_media` command, wired from `documentStore.ts` `saveDocument`).
Rendering in the Tiptap editor goes through Tauri's asset protocol
(`tauri.conf.json` `app.security.assetProtocol`) — see `CustomImage.renderHTML`
in `Editor.tsx`, which resolves the document's `assetDir` via `convertFileSrc`.

## Known conversion limitations (document, don't "fix" without discussion)

- xlsx import is capped at 500 rows per sheet; embedded images can't be
  mapped to a specific sheet/cell (best-effort "Embedded Images" section).
- PDF import infers layout, not an exact reconstruction; image placement is
  approximate for complex/multi-column layouts.
- Vector image formats (EMF/WMF, common in Office exports) can't be rendered
  by the webview — replaced with an `*(unsupported image)*` note.
- pptx animations are dropped (not representable in Markdown).
- Optional LLM-vision image captioning (opt-in, off by default) is planned
  but not yet implemented — see `markdown-import.md`.

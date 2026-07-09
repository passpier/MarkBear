# Editing

Once a document is open — whether imported or created fresh — Pourdown gives
you two ways to work with it.

## Visual (WYSIWYG) editing

The default view, powered by the [Tiptap](https://tiptap.dev/) editor. Write
Markdown the way you see it: type `# ` for a heading, `- ` for a bullet, wrap
text in `**` for bold, and it renders live — no raw symbols to manage. Rich
formatting is supported: bold, italic, strikethrough, nested lists, tables,
code blocks with syntax highlighting, and blockquotes.

## Source mode

Toggle to raw Markdown text at any time from the toolbar. Useful when you
want to see or hand-edit the exact Markdown, paste in Markdown from
elsewhere, or check exactly what will be saved to disk.

## File management

Open, save, and manage your Markdown files using native system dialogs. The
sidebar (toggleable per-panel — files, outline, or hidden) lets you browse
and switch between open documents.

## Find & Replace

In-document search with replace support (accessible via the usual
find/replace shortcut), plus cross-file search from the sidebar when you
need to find something across your whole document folder.

## Auto-save

Your work is saved automatically at regular intervals, in addition to
explicit `Cmd/Ctrl+S` saves.

## Themes

Choose from seven built-in UI themes (including GitHub Light/Dark, Dracula,
Nord, and Solarized) from the app's theme switcher.

## Language (i18n)

The interface is available in English and Traditional Chinese (繁體中文).
Switch languages from the app settings — it takes effect immediately, no
restart needed.

## Exporting

Pourdown's core value is importing rich formats *into* Markdown, not
round-tripping Office layout back out (Markdown can't represent that layout
anyway). Export targets are the two general-purpose, layout-controllable
formats Markdown naturally maps to:

- **HTML** — for web sharing/embedding
- **PDF** — for standardized reading/printing

Office export (`.docx`/`.xlsx`/`.pptx`) is intentionally not supported.

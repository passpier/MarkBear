# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev server (Vite only, no Tauri)
pnpm dev

# Full desktop app dev with hot reload
pnpm tauri dev

# Type-check (lint)
pnpm lint

# Production frontend build
pnpm build

# Package desktop app
pnpm tauri build
```

The package manager is **pnpm**. There are no test scripts configured.

## Architecture

MarkBear is a **Tauri v2 desktop app** with a React frontend and a Rust backend. The two layers communicate exclusively through Tauri's `invoke` (frontend→backend commands) and `emit`/`listen` (bidirectional events).

## Constraints
- Rust is single source of truth for ALL menu states
- Not save any status related to Rust Native Menus to frontend LocalStorage
- Rust-first recovery without frontend dependency

### Frontend (`src/`)

**State management** uses four Zustand stores:

| Store | Purpose | Persistence |
|---|---|---|
| `documentStore` | Open documents, active doc, CRUD | None (in-memory) |
| `uiStore` | Theme, sidebar, editor mode, OS platform | `localStorage` (`ui-preferences`) |
| `settingsStore` | Auto-save, language, spell-check | `localStorage` (`editor-settings`) |
| `editorStore` | Holds the live Tiptap `Editor` instance | None |

**Editor** (`src/components/Editor/Editor.tsx`) uses **Tiptap v2** with the `tiptap-markdown` extension for bidirectional Markdown↔ProseMirror conversion. The editor emits content changes debounced at 500ms, writing Markdown back to `documentStore`. A `SourceEditor` component provides a raw-text fallback mode, toggled by `uiStore.editorMode` (`'wysiwyg'` | `'source'`).

**Theming** (`src/theme/`) is CSS-variable-based. `ThemeDefinition` objects in `types.ts` map to CSS custom properties applied by `applyTheme()` in `utils.ts`. Available themes: `github-light`, `github-dark`, `dracula`, `nord-light`, `nord-dark`, `solarized-light`, `solarized-dark`.

**i18n** (`src/i18n/`) uses `i18next` + `react-i18next`. Supported languages: `en` and `zh` (Traditional Chinese). **Auto-detection is disabled**; language is initialized in this priority order:
1. Backend persistent storage (`UserSettings` via `get_user_settings` invoke)
2. System OS locale (`get_system_locale` invoke)
3. Default `'en'`

Language changes from the native menu flow: Rust menu event → `language-changed` event emitted → `settingsStore.updateSettings({ language })` → `useEffect` in `App.tsx` calls `invoke('set_language')` and `invoke('save_language_preference')`.

**Platform detection** is handled in `usePlatformInitialization` hook, which queries the Rust backend (`get_os_platform`) and listens for the `init-platform` event. The platform value (`'macos'` | `'windows'` | `'gnome'`) drives titlebar rendering (macOS uses native traffic-light controls via `tauri-controls`; Windows/Linux renders custom controls).

### Backend (`src-tauri/src/main.rs`)

All backend logic is in a single file. Key areas:

- **`AppState`**: In-memory state with `Mutex`-guarded fields for `recent_files`, `pending_open_files`, and `language`.
- **`UserSettings`**: Persisted as JSON to platform config dirs (`~/Library/Application Support/MarkBear/settings.json` on macOS).
- **File operations**: `read_markdown_file`, `save_markdown_file`, `list_directory`, `create_file`, `delete_file`, `rename_file` — thin wrappers over `std::fs`.
- **Native menu**: Built in `create_app_menu()`. Menu labels are translated at build time using `get_label(lang, key)`. When the user switches language from the menu, `create_app_menu()` is called again and `app.set_menu()` replaces the entire menu.
- **Single-instance**: `tauri-plugin-single-instance` ensures a second launch passes file paths to the running instance via `queue_open_files` → `open-file` event.
- **File association**: On macOS, `RunEvent::Opened` handles files opened from Finder. CLI args are parsed on startup via `collect_open_paths`.

### Key event/invoke contracts

| Name | Direction | Purpose |
|---|---|---|
| `invoke('read_markdown_file', {path})` | F→B | Read `.md` file content |
| `invoke('save_markdown_file', {path, content})` | F→B | Write file |
| `invoke('get_user_settings')` | F→B | Load persisted `UserSettings` |
| `invoke('save_language_preference', {lang})` | F→B | Persist language to config file |
| `invoke('take_pending_open_files')` | F→B | Drain startup file queue |
| `invoke('update_menu_item_state', {id, checked})` | F→B | Sync check-menu state (e.g. source code toggle) |
| `emit('open-file', path)` | B→F | Open a file (single-instance or file association) |
| `emit('language-changed', lang)` | B→F | Native menu language changed |
| `emit('menu-*')` | B→F | Native menu actions (new, save, theme, etc.) |
| `emit('init-platform', platform)` | B→F | OS platform on `RunEvent::Ready` |

### Path aliases

`@/` resolves to `src/` (configured in Vite and TypeScript).

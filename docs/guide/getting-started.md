# Getting Started

Pourdown is a free, offline, open-source desktop Markdown editor. It's built
with [Tauri v2](https://v2.tauri.app/), so it ships as a small native app for
macOS and Windows — no browser, no account, no telemetry.

## Install

Download the installer for your platform from the
[latest release](https://github.com/passpier/Pourdown/releases/latest).

Unsigned builds are intended for local testing only — for normal
distribution, a signed/notarized build is preferred. Because Pourdown isn't
yet code-signed, you'll need one extra step per platform to open it the first
time.

### macOS (`.dmg`)

Open a terminal **in the folder containing the downloaded file** and run:

```bash
# 1) Mount DMG (Apple Silicon)
hdiutil attach Pourdown_*_aarch64.dmg
# On Intel Mac use: hdiutil attach Pourdown_*_x64.dmg

# 2) Copy app into Applications
cp -R "/Volumes/Pourdown/Pourdown.app" "/Applications/"

# 3) Remove quarantine flag so macOS can open this unsigned app
xattr -dr com.apple.quarantine "/Applications/Pourdown.app"

# 4) Start app
open -a "Pourdown"
```

> Download only the `.dmg` for your architecture (Apple Silicon or Intel) so
> the glob above matches exactly one file.

### Windows (`.msi` or `.exe`)

Open PowerShell in the folder containing the installer, then:

```powershell
# Remove Mark-of-the-Web and install in one step
Get-ChildItem Pourdown_*_x64_en-US.msi | Unblock-File
msiexec /i (Get-ChildItem Pourdown_*_x64_en-US.msi).FullName
```

For `.exe` installers, Windows SmartScreen may still require a one-time
manual "More info" → "Run anyway".

## Your first import

1. Launch Pourdown.
2. **File → Import**, then choose a Word (`.docx`), Excel
   (`.xlsx`/`.xls`/`.ods`), PDF, or PowerPoint (`.pptx`) file.
3. The file opens immediately as a new Markdown document — headings, lists,
   tables, links, and embedded images are converted automatically. See
   [Importing Documents](./importing) for exactly what's preserved per
   format.
4. Edit visually (the default WYSIWYG view) or toggle to raw **Source** mode
   with the toolbar button — see [Editing](./editing).
5. Save with `Cmd/Ctrl+S`. On first save, any extracted images move from a
   temporary `imports/` folder into a `<name>.assets/` folder next to your
   `.md` file, so the document stays portable.

## Building from source

If you'd rather build Pourdown yourself (or want to contribute — see
[`CONTRIBUTING.md`](https://github.com/passpier/Pourdown/blob/main/CONTRIBUTING.md)):

**Prerequisites:** [Node.js](https://nodejs.org/) v20+, [pnpm](https://pnpm.io/),
[Rust](https://www.rust-lang.org/) (for the Tauri desktop build).

```bash
git clone https://github.com/passpier/Pourdown.git
cd Pourdown
pnpm install

pnpm dev          # frontend only, via Vite
pnpm tauri dev    # full desktop app with hot reload

pnpm build        # production frontend build (tsc && vite build)
pnpm tauri build  # production desktop application
```

# Contributing to Pourdown

Thanks for your interest in contributing! Pourdown is a Tauri v2 desktop
Markdown editor (React + TypeScript frontend, Rust backend) that imports
Word/Excel/PowerPoint/PDF files into Markdown. This guide covers everything
you need to get a change from idea to merged PR.

For a deeper look at how the app is put together, see
[`CLAUDE.md`](CLAUDE.md) (architecture, commands, conversion-crate gotchas)
and [`markdown-import.md`](markdown-import.md) (how the document-import
pipeline works). The [docs site](https://passpier.github.io/Pourdown/) is the
user-facing manual, and is the best place to check current behavior before
changing it.

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [pnpm](https://pnpm.io/) (this repo uses `pnpm-lock.yaml`, not npm/yarn)
- [Rust](https://www.rust-lang.org/) (stable toolchain) for the Tauri backend

## Getting set up

```bash
git clone https://github.com/passpier/Pourdown.git
cd Pourdown
pnpm install
pnpm tauri dev   # full desktop app with hot reload
# or: pnpm dev    # frontend only, via Vite
```

## Before opening a PR

Run the checks that CI will also run:

```bash
pnpm lint                              # tsc --noEmit && eslint .
cd src-tauri
cargo test                             # conversion test suite
cargo clippy --all-targets             # Rust lint
```

If your change touches `src-tauri/src/convert/*.rs` (docx/xlsx/pptx/pdf
import, HTML/PDF export), **write or extend a test first**. Each converter
has an inline `#[cfg(test)]` module with unit tests for pure helpers plus
fixture-backed end-to-end tests under `src-tauri/tests/fixtures/`. `cargo
test` is the primary way to verify a conversion change — manually running the
app is a fallback for scenarios that aren't cheaply observable from Rust
tests. See the `/verify-conversion` workflow referenced in `CLAUDE.md` for
more detail.

There is currently no frontend test runner — for React/Tiptap/Zustand
changes, `pnpm lint` plus manually exercising the affected flow in the app is
the expected verification.

## Conversion limitations are often intentional

`CLAUDE.md` documents several conversion behaviors that look like bugs but
are deliberate trade-offs (e.g. the 500-row xlsx cap, conservative PDF table
detection, dropped pptx animations, unsupported vector image formats). Please
open an issue or discussion **before** submitting a PR that changes this
behavior, so we can agree on the trade-off first.

## Branch & PR flow

1. Fork the repo and create a branch off `main` (e.g. `fix/pptx-bullet-indent`).
2. Make your change, following the existing code style in the surrounding
   file rather than introducing a new pattern.
3. Run the checks above.
4. Open a pull request against `main` using the PR template — fill in what
   changed, why, and how you tested it.
5. A maintainer will review; small, focused PRs are easier to review and
   land faster than large ones.

## Reporting bugs / requesting features

Please use the issue templates (bug report / feature request) so we get the
information needed to act on it — especially your OS/version and, for
import-related bugs, a sample file or format if you can share one.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By
participating, you agree to abide by its terms.

## License

By contributing, you agree that your contributions will be licensed under
the [MIT License](LICENSE), the same license that covers the rest of the
project.

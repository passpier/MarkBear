---
layout: home
title: Pourdown — Markdown editor that imports Word, Excel, PDF & PowerPoint
description: Desktop Markdown editor that converts Word, Excel, PDF, and PowerPoint files into clean, editable Markdown — with live visual (WYSIWYG) editing. Built with Tauri v2, React, and Rust. Free and open source.
---

<div class="pourdown-home">

<section class="pd-hero">
  <div class="pd-container">
    <h1>Turn any document into<br>clean, editable Markdown</h1>
    <p class="pd-tagline">
      Import Word files, spreadsheets, PDFs, and presentations in one click,
      then write and edit with a live visual preview. Free, offline, open source.
    </p>
    <div class="pd-cta-row">
      <a class="pd-btn pd-btn-primary" href="https://github.com/passpier/Pourdown/releases/latest">
        ⬇ Download
      </a>
      <a class="pd-btn pd-btn-secondary" href="/guide/getting-started">
        Get Started
      </a>
      <a class="pd-btn pd-btn-secondary" href="https://github.com/passpier/Pourdown">
        View on GitHub
      </a>
    </div>
  </div>
</section>

<section class="pd-screenshot">
  <div class="pd-container">
    <img
      src="/home-860.webp"
      srcset="/home-860.webp 860w, /home-1720.webp 1720w"
      sizes="(max-width: 900px) 100vw, 860px"
      alt="Pourdown editor showing a Markdown document with file sidebar and toolbar"
      width="860"
      height="574"
      loading="lazy"
      decoding="async"
    />
  </div>
</section>

<section class="pd-section">
  <div class="pd-container">
    <h2 class="pd-section-title">Import from any format</h2>
    <p class="pd-section-sub">
      Pourdown converts your existing documents to Markdown before you edit —
      preserving structure while cutting token cost by up to 96% vs raw PDF.
    </p>

| Format | What's preserved | Known limitations |
|---|---|---|
| <span class="pd-badge">Word .docx</span> | Headings, bold/italic/strikethrough, nested lists, tables, hyperlinks, embedded images | Vector images (EMF/WMF) can't be displayed; tracked changes dropped; TOC placeholder inserted |
| <span class="pd-badge">Excel .xlsx / .ods</span> | Each sheet → GFM table section; dates formatted as ISO; embedded images extracted | Capped at 500 rows per sheet; images can't be mapped to a specific cell |
| <span class="pd-badge">PDF</span> | Headings inferred from font size; paragraphs sorted top-to-bottom; tables detected | Text-only PDFs; scanned/image PDFs not supported; complex multi-column layouts may reorder |
| <span class="pd-badge">PowerPoint .pptx</span> | Slide titles → `#` headings; body text → paragraphs; embedded images extracted | Animations not captured; vector images (EMF/WMF) can't be displayed |

  </div>
</section>

<section class="pd-features">
  <div class="pd-container">
    <h2 class="pd-section-title">Everything you need to write in Markdown</h2>
    <div class="pd-grid">
      <div class="pd-card">
        <div class="pd-card-icon">✏️</div>
        <h3>Visual Editing</h3>
        <p>Write without raw Markdown symbols using the WYSIWYG editor powered by Tiptap.</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">💻</div>
        <h3>Source Mode</h3>
        <p>Toggle to raw Markdown text at any time — full control when you need it.</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">🔍</div>
        <h3>Find &amp; Replace</h3>
        <p>In-document search with replace and cross-file search in the sidebar.</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">💾</div>
        <h3>Auto-save</h3>
        <p>Your work is saved automatically at regular intervals — no lost edits.</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">🎨</div>
        <h3>Seven Themes</h3>
        <p>GitHub Light/Dark, Dracula, Nord, and Solarized — pick your look.</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">🌐</div>
        <h3>i18n</h3>
        <p>English and Traditional Chinese interface out of the box.</p>
      </div>
    </div>
  </div>
</section>

<section class="pd-tech">
  <div class="pd-container">
    <h2 class="pd-section-title">Built with</h2>
    <div class="pd-pill-row">
      <span class="pd-pill">Tauri v2</span>
      <span class="pd-pill">React 18</span>
      <span class="pd-pill">Rust</span>
      <span class="pd-pill">TypeScript</span>
      <span class="pd-pill">Tiptap v2</span>
      <span class="pd-pill">Zustand</span>
      <span class="pd-pill">Tailwind CSS</span>
      <span class="pd-pill">Vite</span>
    </div>
  </div>
</section>

</div>

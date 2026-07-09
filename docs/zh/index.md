---
layout: home
title: Pourdown — 匯入 Word、Excel、PDF 與 PowerPoint 的 Markdown 編輯器
description: 將 Word、Excel、PDF、PowerPoint 檔案轉換成乾淨、可編輯 Markdown 的桌面編輯器，並提供即時視覺化（WYSIWYG）編輯。以 Tauri v2、React 與 Rust 打造，免費、開源。
---

<div class="pourdown-home">

<section class="pd-hero">
  <div class="pd-container">
    <h1>將任何文件<br>轉換成乾淨、可編輯的 Markdown</h1>
    <p class="pd-tagline">
      一鍵匯入 Word 文件、試算表、PDF 與簡報，接著用即時視覺化預覽撰寫與編輯。
      免費、離線、開源。
    </p>
    <div class="pd-cta-row">
      <a class="pd-btn pd-btn-primary" href="https://github.com/passpier/Pourdown/releases/latest">
        ⬇ 下載
      </a>
      <a class="pd-btn pd-btn-secondary" href="/zh/guide/getting-started">
        快速開始
      </a>
      <a class="pd-btn pd-btn-secondary" href="https://github.com/passpier/Pourdown">
        前往 GitHub
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
      alt="Pourdown 編輯器畫面，顯示 Markdown 文件、檔案側欄與工具列"
      width="860"
      height="574"
      loading="lazy"
      decoding="async"
    />
  </div>
</section>

<section class="pd-section">
  <div class="pd-container">
    <h2 class="pd-section-title">從任何格式匯入</h2>
    <p class="pd-section-sub">
      Pourdown 會在你編輯前先將現有文件轉換成 Markdown ——
      在保留結構的同時，比原始 PDF 減少高達 96% 的 token 成本。
    </p>

| 格式 | 保留內容 | 已知限制 |
|---|---|---|
| <span class="pd-badge">Word .docx</span> | 標題、粗體/斜體/刪除線、巢狀清單、表格、超連結、內嵌圖片 | 向量圖片（EMF/WMF）無法顯示；追蹤修訂會被捨棄；目錄以佔位符呈現 |
| <span class="pd-badge">Excel .xlsx / .ods</span> | 每個工作表 → GFM 表格區塊；日期格式化為 ISO；內嵌圖片會被擷取 | 每個工作表上限 500 列；圖片無法對應到特定儲存格 |
| <span class="pd-badge">PDF</span> | 依字型大小推斷標題；段落依上到下排序；偵測表格 | 僅支援文字型 PDF；掃描/影像式 PDF 不支援；複雜多欄版面可能重新排序 |
| <span class="pd-badge">PowerPoint .pptx</span> | 投影片標題 → `#` 標題；內文 → 段落；內嵌圖片會被擷取 | 動畫不會被擷取；向量圖片（EMF/WMF）無法顯示 |

  </div>
</section>

<section class="pd-features">
  <div class="pd-container">
    <h2 class="pd-section-title">撰寫 Markdown 所需的一切</h2>
    <div class="pd-grid">
      <div class="pd-card">
        <div class="pd-card-icon">✏️</div>
        <h3>視覺化編輯</h3>
        <p>透過 Tiptap 驅動的 WYSIWYG 編輯器撰寫，不需處理原始 Markdown 符號。</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">💻</div>
        <h3>原始碼模式</h3>
        <p>隨時切換至原始 Markdown 文字 —— 需要時完全掌控內容。</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">🔍</div>
        <h3>尋找與取代</h3>
        <p>文件內搜尋與取代，並可在側欄進行跨檔案搜尋。</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">💾</div>
        <h3>自動儲存</h3>
        <p>你的工作會定期自動儲存 —— 不會遺失編輯內容。</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">🎨</div>
        <h3>七種主題</h3>
        <p>GitHub Light/Dark、Dracula、Nord、Solarized —— 挑選你喜歡的外觀。</p>
      </div>
      <div class="pd-card">
        <div class="pd-card-icon">🌐</div>
        <h3>多語系</h3>
        <p>內建英文與繁體中文介面。</p>
      </div>
    </div>
  </div>
</section>

<section class="pd-tech">
  <div class="pd-container">
    <h2 class="pd-section-title">技術棧</h2>
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

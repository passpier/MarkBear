# 常見問題與限制

## 匯入是雙向轉換器嗎？

不是。`檔案 → 匯入` 是將來源文件轉換**成** Markdown 的單向流程。匯出回原始格式
（或匯出成 HTML/PDF）並不會重建完全相同的原始版面 —— Markdown 本質上是較簡單的格式，
Pourdown 的價值在於讓內容能進入可編輯、可版本控制的形式，而非完美鏡像還原
Office／PDF 的版面配置。

## 為什麼 xlsx 匯入每個工作表上限 500 列？

這是刻意且已記錄的限制，而非臭蟲 —— 非常大的工作表產生的 Markdown 表格
本來就難以手動編輯。當有列被省略時，會加上一行提示，讓你知道資料已被截斷。

## 為什麼我的 PDF 表格沒有正確轉換？

PDF 表格偵測使用保守的幾何分群方式 —— 至少需要兩個對齊欄位、且連續至少三列，
才會被視為表格，這是為了避免誤判偶然對齊的內容（例如「姓名：／職稱：」這種一對）
為表格資料。如果某個表格儲存格的換行內容本身是縮排或條列清單，就會落在對齊容許範圍之外，
該列會轉換為一般段落，而非產出損壞的表格。這是刻意的取捨，優先選擇
「確定正確的段落」而非「可能正確但悄悄出錯的表格」。

## 為什麼我的 Word／PowerPoint／PDF 檔案中有些圖片看不到？

向量圖片格式（EMF/WMF，常見於 Office 匯出檔）無法由應用程式內嵌的網頁檢視元件呈現。
Pourdown 會以 `*(unsupported image)*` 提示取代，而非顯示失效的圖片連結。

## pptx 的動畫怎麼不見了？

匯入時會被捨棄 —— Markdown 沒有辦法表示動畫，因此沒有對應的轉換方式。

## Pourdown 有使用 MarkItDown 的程式碼嗎？

沒有。將文件轉換成乾淨、適合 LLM 使用的 Markdown 這個想法，是由微軟的
[MarkItDown](https://github.com/microsoft/markitdown) 推廣開來的，Pourdown
的匯入功能**受此概念啟發** —— 但 Pourdown 是以 Rust 獨立重新實作，
使用完全不同的函式庫組合，並非移植（port）或分支（fork）。兩個專案都採用
MIT 授權條款。完整比較請參閱
[`markdown-import.md`](https://github.com/passpier/Pourdown/blob/main/markdown-import.md)。

## 我發現了臭蟲／有功能想法 —— 該去哪裡回報？

請使用 GitHub 上的
[issue 範本](https://github.com/passpier/Pourdown/issues/new/choose)。
如果與上述限制有關，建議說明你已閱讀過這頁內容 —— 我們可能會想先討論這個取捨，
再決定是否變更。如果你想自行送出修正，請參閱
[`CONTRIBUTING.md`](https://github.com/passpier/Pourdown/blob/main/CONTRIBUTING.md)。

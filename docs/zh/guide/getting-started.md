# 快速開始

Pourdown 是一款免費、離線、開源的桌面 Markdown 編輯器，以
[Tauri v2](https://v2.tauri.app/) 打造，因此它是一個給 macOS 與 Windows 使用的輕量原生應用程式
—— 不需要瀏覽器、不需要帳號、沒有遙測。

## 安裝

從[最新版本](https://github.com/passpier/Pourdown/releases/latest)下載對應平台的安裝檔。

未簽署的版本僅供本機測試使用 —— 若要正式散布，建議使用已簽署／公證的版本。由於
Pourdown 尚未進行程式碼簽署，第一次開啟時每個平台都需要多做一個步驟。

### macOS（`.dmg`）

在**下載檔案所在的資料夾**中開啟終端機，執行：

```bash
# 1) 掛載 DMG（Apple Silicon）
hdiutil attach Pourdown_*_aarch64.dmg
# Intel Mac 請使用：hdiutil attach Pourdown_*_x64.dmg

# 2) 複製 App 到 Applications
cp -R "/Volumes/Pourdown/Pourdown.app" "/Applications/"

# 3) 移除隔離標記，讓 macOS 可以開啟這個未簽署的 App
xattr -dr com.apple.quarantine "/Applications/Pourdown.app"

# 4) 啟動 App
open -a "Pourdown"
```

> 請只下載符合你架構（Apple Silicon 或 Intel）的 `.dmg`，這樣上面的萬用字元才會精準比對到單一檔案。

### Windows（`.msi` 或 `.exe`）

在安裝檔所在的資料夾開啟 PowerShell，執行：

```powershell
# 一次移除 Mark-of-the-Web 並安裝
Get-ChildItem Pourdown_*_x64_en-US.msi | Unblock-File
msiexec /i (Get-ChildItem Pourdown_*_x64_en-US.msi).FullName
```

若使用 `.exe` 安裝檔，Windows SmartScreen 可能仍需要手動點選一次「其他資訊」→「仍要執行」。

## 第一次匯入文件

1. 啟動 Pourdown。
2. 選擇 **檔案 → 匯入**，然後選取 Word（`.docx`）、Excel
   （`.xlsx`/`.xls`/`.ods`）、PDF 或 PowerPoint（`.pptx`）檔案。
3. 檔案會立即以新的 Markdown 文件開啟 —— 標題、清單、表格、連結與內嵌圖片都會自動轉換。
   各格式確切保留的內容請參閱[匯入文件](./importing)。
4. 以視覺化方式編輯（預設的 WYSIWYG 檢視），或透過工具列按鈕切換到原始
   **原始碼**模式 —— 參閱[編輯](./editing)。
5. 使用 `Cmd/Ctrl+S` 儲存。第一次儲存時，擷取出的圖片會從暫存的 `imports/` 資料夾
   移動到 `.md` 檔案旁的 `<檔名>.assets/` 資料夾，讓文件保持可攜性。

## 從原始碼建置

如果你想自行建置 Pourdown（或想要貢獻專案 ——
參閱 [`CONTRIBUTING.md`](https://github.com/passpier/Pourdown/blob/main/CONTRIBUTING.md)）：

**前置需求：** [Node.js](https://nodejs.org/) v20+、[pnpm](https://pnpm.io/)、
[Rust](https://www.rust-lang.org/)（用於 Tauri 桌面應用建置）。

```bash
git clone https://github.com/passpier/Pourdown.git
cd Pourdown
pnpm install

pnpm dev          # 僅前端，使用 Vite
pnpm tauri dev    # 完整桌面應用，支援熱重載

pnpm build        # 正式前端建置（tsc && vite build）
pnpm tauri build  # 正式桌面應用程式
```

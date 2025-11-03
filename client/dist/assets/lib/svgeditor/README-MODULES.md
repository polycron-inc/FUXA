# FUXA Editor 模組化拆分說明

## 概述

原始的 `fuxa-editor.js` (496KB, 9613行) 已被拆分為多個較小的模組，便於閱讀和維護。

## 模組列表

按照載入順序：

1. **pathseg.js** (58KB) - SVGPathSeg polyfill
2. **browser.js** (7.5KB) - 瀏覽器檢測和兼容性
3. **transformlist.js** (4.8KB) - SVG 轉換列表管理
4. **units.js** (2.9KB) - 單位轉換工具
5. **math.js** (3.7KB) - 數學運算工具
6. **utilities.js** (16KB) - 通用工具函數
7. **history.js** (12KB) - 撤銷/重做歷史記錄
8. **sanitize.js** (13KB) - SVG 清理和驗證
9. **coords.js** (6.8KB) - 坐標轉換
10. **select.js** (13KB) - 選擇器管理
11. **recalculate.js** (19KB) - 尺寸重新計算
12. **path.js** (39KB) - 路徑操作
13. **svgcanvas.js** (296KB) - SVG 畫布和編輯器主邏輯

## 使用方式

### 選項 1: 使用拆分後的模組（推薦用於開發）

在 HTML 中按順序載入：

```html
<script src="assets/lib/svgeditor/pathseg.js"></script>
<script src="assets/lib/svgeditor/browser.js"></script>
<script src="assets/lib/svgeditor/transformlist.js"></script>
<script src="assets/lib/svgeditor/units.js"></script>
<script src="assets/lib/svgeditor/math.js"></script>
<script src="assets/lib/svgeditor/utilities.js"></script>
<script src="assets/lib/svgeditor/history.js"></script>
<script src="assets/lib/svgeditor/sanitize.js"></script>
<script src="assets/lib/svgeditor/coords.js"></script>
<script src="assets/lib/svgeditor/select.js"></script>
<script src="assets/lib/svgeditor/recalculate.js"></script>
<script src="assets/lib/svgeditor/path.js"></script>
<script src="assets/lib/svgeditor/svgcanvas.js"></script>
```

### 選項 2: 使用原始的單一檔案（生產環境）

```html
<script src="assets/lib/svgeditor/fuxa-editor.js"></script>
```

或使用壓縮版：

```html
<script src="assets/lib/svgeditor/fuxa-editor.min.js"></script>
```

## 備份

原始檔案已備份為 `fuxa-editor.js.backup`

## 注意事項

- 拆分後的模組必須按照上述順序載入，因為存在依賴關係
- 所有模組都會向全局 `svgedit` 對象添加功能
- `pathseg.js` 必須最先載入，因為它提供了 polyfill
- `svgcanvas.js` 必須最後載入，因為它依賴所有其他模組

## 模組大小對比

- 原始檔案: 496KB
- 拆分後總大小: 相同（496KB），但分成13個較小的文件
- 最大模組: svgcanvas.js (296KB)
- 最小模組: units.js (2.9KB)

## 背景圖片設置相關代碼

如果你需要查找背景圖片相關的代碼，請查看：

- **svgcanvas.js** 的 `setBackground` 函數 (約第 3462行，原文件第7065行)
- **svgcanvas.js** 的 `setDocProperty` 函數 (約第 4873行，原文件第8476行)

這兩個函數負責設置 `canvasBackground` 的背景顏色和背景圖片。

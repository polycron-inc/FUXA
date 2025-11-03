# 背景圖片修復 - 快速參考

## 🎯 核心修復

### 問題
背景圖片（base64）沒有顯示，因為被 rect 的背景色遮蓋了。

### 解決方案
智能控制 rect 的 fill 屬性：

```javascript
// ✅ 修復後
if (有背景圖片) {
    rect.fill = "none"          // 透明，讓圖片顯示
} else {
    rect.fill = 背景色           // 有色，作為背景
}
```

```javascript
// ❌ 修復前
rect.fill = 背景色  // 總是有色，遮蓋圖片！
```

## 📁 修改的文件

- `svgcanvas.js` (行 3465-3504)
- `fuxa-editor.js` (行 7065-7104)

## 🔍 DOM 結構

```
canvasBackground (SVG)
  ├─ rect (fill="none" 或 fill="#ffffff")
  └─ image (id="background_image") ← 背景圖片在這裡
```

## 🧪 測試方法

1. 清除瀏覽器緩存
2. 重新載入編輯器
3. 設置背景圖片
4. 在控制台運行：
   ```javascript
   debugBackgroundImage();
   ```
5. 檢查：
   - rect 的 fill 是否為 "none"
   - background_image 是否存在
   - href 是否有 base64 數據

## 🐛 如果還是不顯示

檢查：
1. base64 格式：`data:image/png;base64,...`
2. canvasBackground 尺寸不為 0
3. 控制台沒有錯誤

## 📚 詳細文檔

請參閱 `BACKGROUND-FIX.md`

// 背景圖片調試工具
// 在瀏覽器控制台中運行以下函數來檢查背景圖片狀態

window.debugBackgroundImage = function() {
    console.log("=== 背景圖片調試信息 ===");

    // 1. 檢查 canvasBackground 元素
    const canvasBackground = document.getElementById("canvasBackground");
    console.log("1. canvasBackground 元素:", canvasBackground);

    if (canvasBackground) {
        console.log("   - 寬度:", canvasBackground.getAttribute("width"));
        console.log("   - 高度:", canvasBackground.getAttribute("height"));
        console.log("   - x:", canvasBackground.getAttribute("x"));
        console.log("   - y:", canvasBackground.getAttribute("y"));
        console.log("   - style:", canvasBackground.getAttribute("style"));

        // 2. 檢查 rect 背景色元素
        const rect = canvasBackground.querySelector("rect");
        console.log("\n2. 背景色 rect 元素:", rect);
        if (rect) {
            console.log("   - fill:", rect.getAttribute("fill"));
        }

        // 3. 檢查 background_image 元素
        const bgImage = document.getElementById("background_image");
        console.log("\n3. background_image 元素:", bgImage);

        if (bgImage) {
            console.log("   - width:", bgImage.getAttribute("width"));
            console.log("   - height:", bgImage.getAttribute("height"));
            console.log("   - href:", bgImage.getAttributeNS("http://www.w3.org/1999/xlink", "href")?.substring(0, 100) + "...");
            console.log("   - preserveAspectRatio:", bgImage.getAttribute("preserveAspectRatio"));
            console.log("   - style:", bgImage.getAttribute("style"));
            console.log("   - 父元素:", bgImage.parentElement?.id);

            // 檢查圖片是否實際被渲染
            const bbox = bgImage.getBBox();
            console.log("   - BBox:", bbox);
            console.log("   - 計算後的樣式:", window.getComputedStyle(bgImage));
        } else {
            console.log("   ⚠️ background_image 元素不存在！");
        }

        // 4. 檢查 canvasBackground 的所有子元素
        console.log("\n4. canvasBackground 的所有子元素:");
        Array.from(canvasBackground.children).forEach((child, index) => {
            console.log(`   [${index}] ${child.tagName}#${child.id || '(no id)'}`, child);
        });
    } else {
        console.log("   ⚠️ canvasBackground 元素不存在！");
    }

    // 5. 檢查 SVG 結構
    console.log("\n5. SVG 根元素結構:");
    const svgRoot = document.querySelector("#svgcanvas > svg");
    if (svgRoot) {
        console.log("   SVG 根元素的前5個子元素:");
        Array.from(svgRoot.children).slice(0, 5).forEach((child, index) => {
            console.log(`   [${index}] ${child.tagName}#${child.id || '(no id)'}`, child);
        });
    }

    console.log("\n=== 調試結束 ===");
    console.log("提示：如果 background_image 存在但不可見，可能的原因：");
    console.log("  1. href 屬性沒有正確設置");
    console.log("  2. 圖片數據格式不正確");
    console.log("  3. z-index 或圖層順序問題");
    console.log("  4. width/height 設置為 100% 但父元素尺寸為 0");
};

// 自動運行
console.log("背景圖片調試工具已加載！");
console.log("請在控制台運行: debugBackgroundImage()");

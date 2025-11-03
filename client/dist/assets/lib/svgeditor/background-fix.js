/**
 * 背景圖片修復補丁
 *
 * 問題分析：
 * 1. setBackground 函數使用 xlink:href 設置圖片，在某些瀏覽器中可能有兼容性問題
 * 2. image 元素的 width/height 設置為 "100%"，但 canvasBackground 可能尺寸不正確
 * 3. 圖片可能在插入後需要手動觸發重繪
 *
 * 解決方案：
 * 修改 setBackground 函數，同時設置 href 和 xlink:href，
 * 並確保圖片元素的尺寸正確
 */

(function() {
    'use strict';

    // 等待 SVG 編輯器初始化
    function waitForSvgEditor(callback) {
        if (window.svgEditor && window.svgEditor.canvas) {
            callback();
        } else {
            setTimeout(function() {
                waitForSvgEditor(callback);
            }, 100);
        }
    }

    waitForSvgEditor(function() {
        console.log('[背景修復] 開始修補 setBackground 函數');

        // 保存原始的 setBackground 函數
        const originalSetBackground = window.svgEditor.canvas.setBackground;

        // 覆蓋 setBackground 函數
        window.svgEditor.canvas.setBackground = function(color, imageUrl) {
            console.log('[背景修復] setBackground 被調用:', { color, imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : null });

            // 獲取 canvasBackground 元素
            const canvasBackground = svgedit.utilities.getElem("canvasBackground");
            if (!canvasBackground) {
                console.error('[背景修復] canvasBackground 元素不存在！');
                return false;
            }

            // 獲取 rect 和 image 元素
            const rect = $(canvasBackground).find("rect")[0];
            let bgImage = svgedit.utilities.getElem("background_image");

            if (imageUrl) {
                // 有背景圖片時，rect 設為透明
                if (rect) {
                    rect.setAttribute("fill", "none");
                    console.log('[背景修復] 背景色已設為透明（因為有背景圖片）');
                }
                // 如果提供了圖片 URL
                if (!bgImage) {
                    // 創建新的 image 元素
                    bgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
                    bgImage.setAttribute("id", "background_image");
                    bgImage.setAttribute("width", "100%");
                    bgImage.setAttribute("height", "100%");
                    bgImage.setAttribute("x", "0");
                    bgImage.setAttribute("y", "0");
                    bgImage.setAttribute("preserveAspectRatio", "xMidYMid meet");
                    bgImage.setAttribute("style", "pointer-events:none");

                    console.log('[背景修復] 創建新的 background_image 元素');
                }

                // 同時設置 href 和 xlink:href（兼容性）
                bgImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imageUrl);
                bgImage.setAttribute("href", imageUrl);

                console.log('[背景修復] 圖片 href 已設置');

                // 將圖片添加到 canvasBackground（如果還沒有）
                if (!bgImage.parentNode) {
                    // 插入到 rect 之後
                    const rect = canvasBackground.querySelector("rect");
                    if (rect && rect.nextSibling) {
                        canvasBackground.insertBefore(bgImage, rect.nextSibling);
                    } else {
                        canvasBackground.appendChild(bgImage);
                    }
                    console.log('[背景修復] 圖片已添加到 DOM');
                }

                // 強制重繪
                setTimeout(function() {
                    bgImage.style.display = 'none';
                    bgImage.offsetHeight; // 觸發重排
                    bgImage.style.display = '';
                    console.log('[背景修復] 圖片已重繪');
                }, 0);

            } else {
                // 沒有背景圖片時，設置背景色
                if (rect) {
                    rect.setAttribute("fill", color || "#ffffff");
                    console.log('[背景修復] 背景色已設置:', color || "#ffffff");
                }

                // 移除圖片
                if (bgImage && bgImage.parentNode) {
                    bgImage.parentNode.removeChild(bgImage);
                    console.log('[背景修復] 背景圖片已移除');
                }
            }

            return true;
        };

        console.log('[背景修復] setBackground 函數修補完成！');
    });
})();

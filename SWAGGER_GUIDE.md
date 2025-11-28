# FUXA Swagger API 文檔指南

## 概述

FUXA 現已整合 Swagger/OpenAPI 3.0 文檔，提供互動式 API 文檔界面。

## 訪問方式

### 1. Swagger UI (互動式文檔)

啟動 FUXA 服務器後，在瀏覽器中訪問：

```
http://localhost:1881/api-docs
```

如果使用自定義端口，替換 `1881` 為您的端口號。

### 2. Swagger JSON (OpenAPI 規範)

獲取原始 OpenAPI JSON 規範：

```
http://localhost:1881/api-docs.json
```

## 使用 Swagger UI

### 1. 查看 API 端點

Swagger UI 會顯示所有可用的 API 端點，按標籤分組：

- **Play Restrictions**: 播放限制和視圖訪問控制
- **Authentication**: 用戶認證
- **Project**: 項目和視圖管理
- **Users**: 用戶和角色管理

### 2. 測試 API

#### 步驟 1: 獲取認證令牌

大多數 API 需要認證。首先需要登錄：

1. 展開 **Authentication** 標籤下的 `POST /api/signin`
2. 點擊 "Try it out"
3. 輸入您的憑證：
   ```json
   {
     "username": "admin",
     "password": "your_password"
   }
   ```
4. 點擊 "Execute"
5. 從響應中複製 `token` 值

#### 步驟 2: 配置認證

1. 點擊頁面右上角的 "Authorize" 按鈕
2. 在彈出的對話框中，輸入令牌：
   - 選擇 **apiKeyAuth** (推薦)
   - 在 Value 欄位輸入您的 token
   - 點擊 "Authorize"
   - 點擊 "Close"

現在您可以測試需要認證的 API 了。

#### 步驟 3: 測試 Play Restrictions API

**獲取所有播放限制：**

1. 展開 `GET /api/playrestrictions`
2. 點擊 "Try it out"
3. (可選) 輸入 `viewId` 參數以過濾特定視圖
4. 點擊 "Execute"
5. 查看響應

**創建播放限制：**

1. 展開 `POST /api/playrestrictions`
2. 點擊 "Try it out"
3. 選擇示例或編輯請求體：

   用戶限制示例：
   ```json
   {
     "type": "user",
     "view_id": "v_12345",
     "user_id": "john",
     "role_id": null
   }
   ```

   角色限制示例：
   ```json
   {
     "type": "role",
     "view_id": "v_67890",
     "user_id": null,
     "role_id": "operators"
   }
   ```
4. 點擊 "Execute"
5. 查看響應，會返回新創建的限制 ID

**刪除播放限制：**

1. 展開 `DELETE /api/playrestrictions/{id}`
2. 點擊 "Try it out"
3. 在 `id` 參數中輸入要刪除的限制 ID
4. 點擊 "Execute"

**獲取允許的視圖：**

1. 展開 `GET /api/playrestrictions/allowed-views`
2. 點擊 "Try it out"
3. 點擊 "Execute"
4. 響應會顯示當前用戶可以訪問的所有視圖 ID

## Swagger UI 功能

### 1. 模型/架構查看

點擊任何端點的響應部分，可以看到：
- 響應狀態碼
- 響應數據結構
- 字段說明和類型
- 示例值

### 2. 請求示例

每個 POST/PUT 端點都提供多個請求示例：
- 用戶限制示例
- 角色限制示例

點擊示例名稱即可快速填充請求體。

### 3. 響應預覽

執行請求後可以看到：
- 響應代碼
- 響應時間
- 響應頭
- 響應體 (JSON 格式)

### 4. 代碼生成

Swagger UI 可以為不同編程語言生成示例代碼：
- cURL
- JavaScript (fetch)
- Python
- Java
- 等等

## 安全認證

Swagger 文檔支持兩種認證方式：

### 1. API Key (推薦)

在 HTTP Header 中使用 `x-access-token`：

```bash
curl -X GET "http://localhost:1881/api/playrestrictions" \
  -H "x-access-token: YOUR_JWT_TOKEN"
```

### 2. Bearer Token

使用標準 Bearer 認證：

```bash
curl -X GET "http://localhost:1881/api/playrestrictions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 常見使用場景

### 場景 1: 為特定用戶限制視圖

```bash
# 1. 登錄獲取 token
curl -X POST "http://localhost:1881/api/signin" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'

# 2. 創建用戶限制
curl -X POST "http://localhost:1881/api/playrestrictions" \
  -H "x-access-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user",
    "view_id": "v_dashboard",
    "user_id": "john",
    "role_id": null
  }'
```

### 場景 2: 為角色限制視圖

```bash
curl -X POST "http://localhost:1881/api/playrestrictions" \
  -H "x-access-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "role",
    "view_id": "v_control_panel",
    "user_id": null,
    "role_id": "operators"
  }'
```

### 場景 3: 查看用戶允許的視圖

```bash
curl -X GET "http://localhost:1881/api/playrestrictions/allowed-views" \
  -H "x-access-token: USER_TOKEN"
```

## OpenAPI 規範導出

### 獲取 OpenAPI JSON

```bash
curl http://localhost:1881/api-docs.json > fuxa-openapi.json
```

### 使用 OpenAPI 工具

導出的 JSON 可以用於：

1. **代碼生成**: 使用 OpenAPI Generator 生成客戶端 SDK
   ```bash
   openapi-generator-cli generate \
     -i fuxa-openapi.json \
     -g javascript \
     -o ./fuxa-client
   ```

2. **API 測試**: 使用 Postman、Insomnia 等工具導入

3. **文檔生成**: 使用 Redoc、Slate 等工具生成靜態文檔

## 自定義和擴展

### 添加新 API 的 Swagger 註解

在 API 路由文件中使用 JSDoc 註釋：

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: 端點摘要
 *     description: 詳細描述
 *     tags: [YourTag]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/api/your-endpoint', handler);
```

### 修改 Swagger 配置

編輯 `server/swagger.js` 以：
- 更新 API 信息（標題、版本、描述）
- 添加新的服務器 URL
- 定義新的數據模型（schemas）
- 添加新的標籤

## 故障排除

### 問題 1: 無法訪問 /api-docs

**解決方案:**
- 確認服務器已啟動
- 檢查端口是否正確
- 查看服務器日誌確認沒有錯誤

### 問題 2: 認證失敗

**解決方案:**
- 確認令牌未過期
- 檢查令牌格式正確
- 確保在 Authorize 對話框中正確配置

### 問題 3: API 返回 401/403

**解決方案:**
- 確認用戶有適當的權限（管理員權限）
- 重新獲取新的令牌
- 檢查 `secureEnabled` 設置

## 生產環境建議

### 1. 保護 Swagger UI

在生產環境中，考慮：
- 禁用 Swagger UI（僅在開發環境啟用）
- 添加額外的認證層
- 限制訪問 IP

### 2. 環境變數控制

添加環境變數控制 Swagger：

```javascript
// server/api/index.js
if (process.env.SWAGGER_ENABLED === 'true') {
    apiApp.use('/api-docs', swaggerUi.serve);
    apiApp.get('/api-docs', swaggerUi.setup(swaggerSpec));
}
```

### 3. 文檔版本管理

- 為每個 API 版本維護單獨的 Swagger 文檔
- 使用 Git 追踪文檔變更
- 定期更新 API 版本號

## 相關資源

- **Swagger 官方文檔**: https://swagger.io/docs/
- **OpenAPI 規範**: https://spec.openapis.org/oas/latest.html
- **Swagger UI**: https://github.com/swagger-api/swagger-ui
- **FUXA 項目**: https://github.com/frangoteam/FUXA

## 更新日誌

### v1.2.6 (2024)
- ✅ 初始 Swagger 整合
- ✅ Play Restrictions API 完整文檔
- ✅ 認證支持（API Key / Bearer Token）
- ✅ 互動式 API 測試界面

## 技術細節

### 依賴套件

```json
{
  "swagger-jsdoc": "^6.x",
  "swagger-ui-express": "^5.x"
}
```

### 文件結構

```
server/
├── swagger.js              # Swagger 配置
├── api/
│   ├── index.js           # Swagger UI 路由註冊
│   └── playrestrictions/
│       └── index.js       # Play Restrictions API (含 Swagger 註解)
```

### OpenAPI 3.0 規範

本文檔遵循 OpenAPI 3.0.0 規範，包括：
- 完整的 API 端點描述
- 請求/響應模型定義
- 安全方案配置
- 示例數據
- 標籤分組

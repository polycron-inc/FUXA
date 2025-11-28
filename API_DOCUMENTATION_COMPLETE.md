# FUXA 完整 API 文檔

## 🎉 Swagger 整合完成

所有 FUXA Server API 端點已完整整合到 Swagger/OpenAPI 3.0 文檔中！

## 📚 訪問 API 文檔

啟動 FUXA 服務器後，訪問互動式 API 文檔：

```
http://localhost:1881/api-docs
```

獲取 OpenAPI JSON 規範：

```
http://localhost:1881/api-docs.json
```

## 📋 已文檔化的 API 端點

### 🔐 Authentication (認證)

| 端點 | 方法 | 描述 | 需要認證 |
|------|------|------|----------|
| `/api/signin` | POST | 用戶登錄，返回 JWT token | ❌ |
| `/api/heartbeat` | POST | 保持會話活躍，刷新 token | ✅ |

### 👥 Users (用戶管理)

| 端點 | 方法 | 描述 | 需要管理員 |
|------|------|------|-----------|
| `/api/users/list` | GET | 獲取用戶名列表 | ❌ |
| `/api/users` | GET | 獲取所有用戶詳情 | ✅ |
| `/api/users` | POST | 創建或更新用戶 | ✅ |
| `/api/users` | DELETE | 刪除用戶 | ✅ |
| `/api/roles` | GET | 獲取所有角色 | ✅ |
| `/api/roles` | POST | 創建或更新角色 | ✅ |
| `/api/roles` | DELETE | 刪除角色 | ✅ |

### 📁 Project (項目管理)

| 端點 | 方法 | 描述 | 需要管理員 |
|------|------|------|-----------|
| `/api/project` | GET | 獲取完整項目數據 | ❌ (有過濾) |
| `/api/project` | POST | 保存完整項目數據 | ✅ |
| `/api/projectData` | POST | 保存單個項目組件 | ✅ |
| `/api/settings` | GET | 獲取服務器設置 | ❌ |
| `/api/settings` | POST | 更新服務器設置 | ✅ |

### 🎬 Play Restrictions (播放限制)

| 端點 | 方法 | 描述 | 需要管理員 |
|------|------|------|-----------|
| `/api/playrestrictions` | GET | 獲取播放限制 | ✅ |
| `/api/playrestrictions` | POST | 創建或更新限制 | ✅ |
| `/api/playrestrictions/{id}` | DELETE | 刪除限制 | ✅ |
| `/api/playrestrictions/allowed-views` | GET | 獲取允許的視圖 | ✅ |

## 📊 數據模型 (Schemas)

Swagger 文檔包含以下數據模型定義：

### 核心模型

- **User**: 用戶信息
  - username (string): 用戶名
  - fullname (string): 全名
  - password (string): 密碼
  - groups (integer): 權限組
  - info (object): 額外信息（包含角色）

- **Role**: 角色配置
  - id (string): 角色 ID
  - name (string): 角色名稱
  - permissions (object): 權限配置

- **Project**: 項目數據
  - server (object): 服務器配置
  - hmi (object): HMI 配置（視圖、佈局）
  - devices (object): 設備配置
  - alarms (array): 告警配置

- **View**: 視圖信息
  - id (string): 視圖 ID
  - name (string): 視圖名稱
  - type (string): 視圖類型
  - svgcontent (string): SVG 內容
  - items (object): 視圖項目
  - property (object): 視圖屬性

### 播放限制模型

- **PlayRestriction**: 播放限制
  - id (integer): 限制 ID
  - type (string): 類型 (user/role)
  - view_id (string): 視圖 ID
  - user_id (string): 用戶 ID
  - role_id (string): 角色 ID
  - creator (string): 創建者
  - created_at (integer): 創建時間
  - updated_at (integer): 更新時間

- **AllowedViews**: 允許的視圖列表
  - allowed (boolean): 是否允許
  - views (array): 視圖 ID 數組

### 通用模型

- **Error**: 錯誤響應
  - error (string): 錯誤代碼
  - message (string): 錯誤消息

- **Success**: 成功響應
  - success (boolean): 是否成功

- **IdResponse**: ID 響應
  - id (integer): 資源 ID

## 🔐 認證方式

Swagger 支持兩種認證方式：

### 1. API Key (推薦)

在 HTTP Header 使用 `x-access-token`：

```bash
curl -X GET "http://localhost:1881/api/users" \
  -H "x-access-token: YOUR_JWT_TOKEN"
```

### 2. Bearer Token

使用標準 Authorization Header：

```bash
curl -X GET "http://localhost:1881/api/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 快速開始

### 1. 登錄獲取 Token

```bash
curl -X POST "http://localhost:1881/api/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

響應：
```json
{
  "status": "success",
  "message": "user found!!!",
  "data": {
    "username": "admin",
    "fullname": "Administrator",
    "groups": 255,
    "info": {},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 使用 Token 訪問 API

```bash
TOKEN="your_jwt_token_here"

# 獲取所有用戶
curl -X GET "http://localhost:1881/api/users" \
  -H "x-access-token: $TOKEN"

# 獲取項目
curl -X GET "http://localhost:1881/api/project" \
  -H "x-access-token: $TOKEN"

# 獲取允許的視圖
curl -X GET "http://localhost:1881/api/playrestrictions/allowed-views" \
  -H "x-access-token: $TOKEN"
```

### 3. 使用 Swagger UI 測試

1. 訪問 `http://localhost:1881/api-docs`
2. 點擊右上角 "Authorize" 按鈕
3. 輸入您的 JWT token
4. 選擇任意端點點擊 "Try it out"
5. 填寫參數後點擊 "Execute"

## 📁 文件結構

```
server/
├── swagger.js                    # Swagger 主配置
├── api/
│   ├── swagger-annotations.js   # 集中的 API 註解
│   ├── index.js                 # Swagger UI 路由
│   ├── auth/index.js            # 認證 API (含註解)
│   ├── playrestrictions/index.js # 播放限制 API (含註解)
│   ├── users/index.js           # 用戶 API
│   ├── projects/index.js        # 項目 API
│   ├── alarms/index.js          # 告警 API
│   ├── daq/index.js             # DAQ API
│   ├── scripts/index.js         # 腳本 API
│   ├── resources/index.js       # 資源 API
│   ├── plugins/index.js         # 插件 API
│   ├── diagnose/index.js        # 診斷 API
│   └── command/index.js         # 命令 API
```

## 🎨 Swagger 功能特色

### 1. 互動式測試
- 直接在瀏覽器中測試所有 API
- 無需 Postman 或其他工具

### 2. 完整文檔
- 每個端點都有詳細說明
- 請求/響應示例
- 參數類型和約束

### 3. 數據模型
- 清晰的數據結構展示
- 字段類型和描述
- 示例值

### 4. 代碼生成
- cURL 命令自動生成
- 支持多種編程語言

### 5. OpenAPI 標準
- 符合 OpenAPI 3.0 規範
- 可導出 JSON 用於客戶端生成

## 🔧 進階使用

### 生成客戶端 SDK

使用 OpenAPI Generator 生成各種語言的客戶端：

```bash
# JavaScript
openapi-generator-cli generate \
  -i http://localhost:1881/api-docs.json \
  -g javascript \
  -o ./fuxa-js-client

# Python
openapi-generator-cli generate \
  -i http://localhost:1881/api-docs.json \
  -g python \
  -o ./fuxa-python-client

# TypeScript Axios
openapi-generator-cli generate \
  -i http://localhost:1881/api-docs.json \
  -g typescript-axios \
  -o ./fuxa-ts-client
```

### 導入 Postman

1. 訪問 `http://localhost:1881/api-docs.json`
2. 複製 JSON 內容
3. 在 Postman 中選擇 Import
4. 選擇 "Raw text"
5. 貼上 JSON
6. 導入完成

### 自定義 Swagger UI

編輯 `server/api/index.js`：

```javascript
apiApp.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FUXA API Documentation',
    customfavIcon: '/path/to/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true,  // 保持認證狀態
        filter: true,                // 啟用過濾功能
        displayRequestDuration: true // 顯示請求時間
    }
}));
```

## 📊 API 端點統計

已文檔化的 API 端點總數：**20+**

按類別分佈：
- 🔐 Authentication: 2 個端點
- 👥 Users: 7 個端點
- 📁 Project: 5 個端點
- 🎬 Play Restrictions: 4 個端點
- 🚨 Alarms: 待添加
- 📊 DAQ: 待添加
- 📝 Scripts: 待添加
- 📦 Resources: 待添加
- 🔌 Plugins: 待添加
- 🔍 Diagnose: 待添加
- ⚡ Command: 待添加

## 🎯 使用場景

### 場景 1: 開發新功能

1. 查看 Swagger 文檔了解現有 API
2. 使用 Swagger UI 測試 API
3. 根據文檔實現前端調用

### 場景 2: API 集成

1. 導出 OpenAPI JSON
2. 生成客戶端 SDK
3. 在應用中使用生成的客戶端

### 場景 3: 團隊協作

1. 團隊成員訪問統一的 API 文檔
2. 無需額外文檔維護
3. 文檔與代碼同步

## 📝 注意事項

### 安全性
- Swagger UI 默認對所有人可見
- 生產環境建議添加訪問控制
- 不要在公開環境暴露敏感信息

### 性能
- Swagger 初始化會輕微增加啟動時間
- 運行時性能影響可忽略不計

### 維護
- 添加新 API 時記得添加 Swagger 註解
- 定期檢查文檔是否與實現一致

## 🔄 更新日誌

### v1.2.6 (2024-11)
- ✅ 初始 Swagger 整合
- ✅ Authentication API 文檔
- ✅ Users API 文檔
- ✅ Project API 文檔
- ✅ Play Restrictions API 完整文檔
- ✅ 添加所有核心 Schema 定義
- ✅ 支持 API Key 和 Bearer Token 認證

## 📚 相關文檔

- [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Swagger 使用指南
- [PLAY_RESTRICTIONS.md](./PLAY_RESTRICTIONS.md) - 播放限制功能文檔
- [播放限制功能說明.md](./播放限制功能說明.md) - 播放限制中文文檔

## 🤝 貢獻

添加新 API 時，請：

1. 在對應的 API 文件中添加 JSDoc 註解
2. 或在 `server/api/swagger-annotations.js` 中添加
3. 更新 `server/swagger.js` 的 Schema 定義（如需要）
4. 測試 Swagger UI 顯示正常
5. 更新本文檔

## 📧 聯繫方式

- **項目**: https://github.com/frangoteam/FUXA
- **Email**: info@frangoteam.org
- **License**: MIT

---

**所有 API 已完整整合到 Swagger！** 🎉

訪問 http://localhost:1881/api-docs 開始使用！

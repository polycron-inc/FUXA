# DMS User API 文檔

## 概述

DMS User API 是從前端項目 `fms-frontend/src/api/user.ts` 導入的用戶管理 API。此 API 提供完整的用戶 CRUD 操作，包括列表查詢、詳情查詢、創建、更新、刪除和密碼重置功能。

## 訪問方式

所有 API 端點已整合到 Swagger 文檔中：

```
http://localhost:1881/api-docs
```

在 Swagger UI 中查找 **DMS Users** 標籤。

## API 端點列表

### 📋 用戶列表查詢

**端點:** `GET /schideron/openApi/user/list`

**描述:** 獲取分頁的用戶列表，支持搜索過濾

**需要認證:** ✅ 是

**需要管理員:** ❌ 否

**查詢參數:**

| 參數 | 類型 | 必需 | 預設值 | 描述 |
|------|------|------|--------|------|
| page | integer | 否 | 1 | 頁碼 |
| pageSize | integer | 否 | 10 | 每頁項目數 |
| username | string | 否 | - | 按用戶名過濾 |
| requester | string | 否 | - | 請求者標識 |

**響應示例:**

```json
{
  "data": [
    {
      "id": "admin",
      "username": "admin",
      "roleId": "255",
      "roleName": "Administrator",
      "phone": "15862589286",
      "email": "admin@example.com",
      "createTime": "2025-07-24",
      "status": 1
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

**cURL 示例:**

```bash
curl -X GET "http://localhost:1881/schideron/openApi/user/list?page=1&pageSize=10" \
  -H "x-access-token: YOUR_TOKEN"
```

---

### 🔐 獲取當前用戶資訊

**端點:** `GET /schideron/openApi/user/me`

**描述:** 根據 JWT token 獲取當前登入用戶的詳細信息（前端開啟頁面時第一個調用的 API）

**需要認證:** ✅ 是

**需要管理員:** ❌ 否

**響應示例:**

```json
{
  "detailInfo": {
    "id": "admin",
    "username": "admin",
    "roleId": "255",
    "roleName": "Administrator",
    "phone": "15862589286",
    "email": "admin@example.com",
    "createTime": "2025-07-24"
  },
  "code": 200,
  "status": "SUCCESS"
}
```

**cURL 示例:**

```bash
curl -X GET "http://localhost:1881/schideron/openApi/user/me" \
  -H "x-access-token: YOUR_TOKEN"
```

**使用場景:**

前端應用開啟時，應該首先調用此 API 來獲取當前登入用戶的資訊，不需要提供 userId 參數，系統會自動從 JWT token 中解析用戶身份。

---

### 👤 用戶詳情查詢

**端點:** `GET /schideron/openApi/user/detail/{userId}`

**描述:** 獲取特定用戶的詳細信息

**需要認證:** ✅ 是

**需要管理員:** ❌ 否

**路徑參數:**

| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| userId | string | 是 | 用戶 ID（用戶名） |

**查詢參數:**

| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| requester | string | 否 | 請求者標識 |

**響應示例:**

```json
{
  "detailInfo": {
    "id": "admin",
    "username": "admin",
    "roleId": "255",
    "roleName": "Administrator",
    "phone": "15862589286",
    "email": "admin@example.com",
    "createTime": "2025-07-24"
  },
  "code": 200,
  "status": "SUCCESS"
}
```

**cURL 示例:**

```bash
curl -X GET "http://localhost:1881/schideron/openApi/user/detail/admin?requester=system" \
  -H "x-access-token: YOUR_TOKEN"
```

---

### ➕ 創建用戶

**端點:** `POST /schideron/openApi/user/add`

**描述:** 創建新用戶

**需要認證:** ✅ 是

**需要管理員:** ✅ 是

**請求體:**

```json
{
  "requester": "system",
  "username": "newuser",
  "password": "encrypted_password_here",
  "roleId": "1",
  "phone": "13800138000",
  "email": "newuser@example.com"
}
```

**欄位說明:**

| 欄位 | 類型 | 必需 | 描述 |
|------|------|------|------|
| username | string | 是 | 用戶名 |
| password | string | 是 | 加密後的密碼 |
| roleId | string | 是 | 角色 ID |
| phone | string | 否 | 電話號碼 |
| email | string | 否 | 電子郵件 |
| requester | string | 否 | 請求者標識 |

**響應示例:**

```json
{
  "code": 200,
  "status": "SUCCESS",
  "message": "User created successfully"
}
```

**cURL 示例:**

```bash
curl -X POST "http://localhost:1881/schideron/openApi/user/add" \
  -H "x-access-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "encrypted_password",
    "roleId": "1",
    "phone": "13800138000",
    "email": "newuser@example.com"
  }'
```

---

### ✏️ 更新用戶

**端點:** `PUT /schideron/openApi/user/edit/{userId}`

**描述:** 更新用戶信息

**需要認證:** ✅ 是

**需要管理員:** ✅ 是

**路徑參數:**

| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| userId | string | 是 | 用戶 ID（用戶名） |

**請求體:**

```json
{
  "requester": "system",
  "username": "newuser",
  "roleId": "2",
  "phone": "13900139000",
  "email": "updated@example.com"
}
```

**響應示例:**

```json
{
  "code": 200,
  "status": "SUCCESS",
  "message": "User updated successfully"
}
```

**cURL 示例:**

```bash
curl -X PUT "http://localhost:1881/schideron/openApi/user/edit/newuser" \
  -H "x-access-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "roleId": "2",
    "phone": "13900139000",
    "email": "updated@example.com"
  }'
```

---

### 🗑️ 刪除用戶

**端點:** `DELETE /schideron/openApi/user/delete/{userId}`

**描述:** 刪除用戶

**需要認證:** ✅ 是

**需要管理員:** ✅ 是

**路徑參數:**

| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| userId | string | 是 | 用戶 ID（用戶名） |

**請求體（可選）:**

```json
{
  "requester": "system"
}
```

**響應示例:**

```json
{
  "code": 200,
  "status": "SUCCESS",
  "message": "User deleted successfully"
}
```

**cURL 示例:**

```bash
curl -X DELETE "http://localhost:1881/schideron/openApi/user/delete/newuser" \
  -H "x-access-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requester": "system"}'
```

---

### 🔑 重置密碼

**端點:** `POST /schideron/openApi/user/resetPassword/{userId}`

**描述:** 重置用戶密碼

**需要認證:** ✅ 是

**需要管理員:** ✅ 是

**路徑參數:**

| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| userId | string | 是 | 用戶 ID（用戶名） |

**請求體:**

```json
{
  "defaultPassword": "encrypted_new_password_here",
  "requester": "system"
}
```

**響應示例:**

```json
{
  "code": 200,
  "status": "SUCCESS",
  "message": "Password reset successfully"
}
```

**cURL 示例:**

```bash
curl -X POST "http://localhost:1881/schideron/openApi/user/resetPassword/newuser" \
  -H "x-access-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultPassword": "encrypted_password",
    "requester": "system"
  }'
```

---

### 📝 獲取用戶選項

**端點:** `GET /api/users/getUserSelectOptions`

**描述:** 獲取用戶選項列表，用於下拉選單/選擇器

**需要認證:** ✅ 是

**需要管理員:** ❌ 否

**查詢參數:**

| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| opR | integer | 否 | 角色 ID 操作符 (1=>, 2=<, 3==, 4=in, 84=跳過) |
| rIds | string | 否 | 角色 IDs（逗號分隔） |
| opO | integer | 否 | 組織 ID 操作符 |
| oIds | string | 否 | 組織 IDs（逗號分隔） |

**響應示例:**

```json
[
  {
    "id": "admin",
    "user_name": "Administrator",
    "org_id": 0
  },
  {
    "id": "user1",
    "user_name": "User One",
    "org_id": 1
  }
]
```

**cURL 示例:**

```bash
curl -X GET "http://localhost:1881/api/users/getUserSelectOptions" \
  -H "x-access-token: YOUR_TOKEN"
```

---

## 數據模型

### DmsUser

```typescript
{
  id: string;              // 用戶 ID
  username: string;        // 用戶名
  roleId: string;          // 角色 ID
  roleName: string;        // 角色名稱
  phone: string;           // 電話號碼
  email: string;           // 電子郵件
  createTime: string;      // 創建日期 (YYYY-MM-DD)
  status: number;          // 狀態 (0=停用, 1=啟用)
}
```

## 認證方式

所有 API 端點都需要 JWT 認證令牌。有兩種方式提供令牌：

### 1. API Key Header（推薦）

```http
x-access-token: YOUR_JWT_TOKEN
```

### 2. Bearer Token

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 權限說明

| 端點 | 需要認證 | 需要管理員 |
|------|----------|-----------|
| GET /schideron/openApi/user/me | ✅ | ❌ |
| GET /schideron/openApi/user/list | ✅ | ❌ |
| GET /schideron/openApi/user/detail/{userId} | ✅ | ❌ |
| POST /schideron/openApi/user/add | ✅ | ✅ |
| PUT /schideron/openApi/user/edit/{userId} | ✅ | ✅ |
| DELETE /schideron/openApi/user/delete/{userId} | ✅ | ✅ |
| POST /schideron/openApi/user/resetPassword/{userId} | ✅ | ✅ |
| GET /api/users/getUserSelectOptions | ✅ | ❌ |

## 完整使用流程

### 1. 登錄獲取令牌

```bash
curl -X POST "http://localhost:1881/api/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

### 2. 獲取當前用戶資訊（前端頁面載入時第一個調用）

```bash
TOKEN="your_jwt_token_here"

curl -X GET "http://localhost:1881/schideron/openApi/user/me" \
  -H "x-access-token: $TOKEN"
```

### 3. 獲取用戶列表

```bash
TOKEN="your_jwt_token_here"

curl -X GET "http://localhost:1881/schideron/openApi/user/list?page=1&pageSize=10" \
  -H "x-access-token: $TOKEN"
```

### 3. 查看用戶詳情

```bash
curl -X GET "http://localhost:1881/schideron/openApi/user/detail/admin" \
  -H "x-access-token: $TOKEN"
```

### 4. 創建新用戶

```bash
curl -X POST "http://localhost:1881/schideron/openApi/user/add" \
  -H "x-access-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "encrypted_password",
    "roleId": "1",
    "phone": "13800138000",
    "email": "test@example.com"
  }'
```

### 5. 更新用戶

```bash
curl -X PUT "http://localhost:1881/schideron/openApi/user/edit/testuser" \
  -H "x-access-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "roleId": "2",
    "email": "newemail@example.com"
  }'
```

### 6. 重置密碼

```bash
curl -X POST "http://localhost:1881/schideron/openApi/user/resetPassword/testuser" \
  -H "x-access-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultPassword": "new_encrypted_password"
  }'
```

### 7. 刪除用戶

```bash
curl -X DELETE "http://localhost:1881/schideron/openApi/user/delete/testuser" \
  -H "x-access-token: $TOKEN"
```

## 注意事項

### 密碼加密

- 前端發送的密碼應該已經加密
- 後端直接使用前端提供的加密密碼
- 原始密碼不應在網絡傳輸

### 角色 ID 映射

- `255` 或 `-1`: 管理員
- `1-254`: 一般用戶
- 根據 FUXA 的用戶系統自動映射

### 用戶狀態

- `1`: 啟用
- `0`: 停用

### Requester 參數

- 某些端點接受 `requester` 參數
- 用於記錄操作來源
- 非必需參數

## 錯誤處理

### 常見錯誤碼

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 400 | 請求錯誤 |
| 401 | 未授權（需要管理員權限） |
| 403 | 令牌過期 |
| 404 | 用戶未找到 |

### 錯誤響應格式

```json
{
  "error": "unauthorized_error",
  "message": "Unauthorized!"
}
```

或

```json
{
  "code": 404,
  "status": "ERROR",
  "message": "User not found"
}
```

## Swagger UI 使用

1. 訪問 `http://localhost:1881/api-docs`
2. 找到 **DMS Users** 標籤
3. 點擊 "Authorize" 按鈕
4. 輸入 JWT 令牌
5. 測試任意端點

## 與前端集成

DMS User API 完全兼容前端 `fms-frontend/src/api/user.ts` 的接口設計。

前端可以直接使用以下方式調用：

```typescript
// 前端代碼示例
import { getUserList, getProfile, addUser, updateUser, deleteUser } from '@/api/user';

// 獲取用戶列表
const users = await getUserList({ page: 1, pageSize: 10 });

// 獲取用戶詳情
const profile = await getProfile('admin');

// 創建用戶
await addUser({
  username: 'newuser',
  password: 'password',
  roleId: '1',
  phone: '13800138000',
  email: 'user@example.com'
});
```

## 文件位置

- **API 實現**: `server/api/dmsUser/index.js`
- **Swagger 配置**: `server/swagger.js`
- **API 註冊**: `server/api/index.js`
- **文檔**: `DMS_USER_API.md`

## 更新日誌

### v1.0.0 (2024-11)
- ✅ 初始版本
- ✅ 從 fms-frontend/src/api/user.ts 導入
- ✅ 完整的 CRUD 操作
- ✅ Swagger 文檔整合
- ✅ JWT 認證支持
- ✅ 角色權限控制

---

**DMS User API 已完整整合！**

訪問 http://localhost:1881/api-docs 查看完整 API 文檔！

# FUXA WebAPI 文檔

FUXA 是一個基於 Web 的過程視覺化（SCADA/HMI/Dashboard）軟體。本文檔提供 FUXA WebAPI 的完整列表、請求和回應格式。

## 目錄
- [基本資訊](#基本資訊)
- [認證相關 API](#認證相關-api)
- [設定相關 API](#設定相關-api)
- [專案管理 API](#專案管理-api)
- [設備管理 API](#設備管理-api)
- [標籤操作 API](#標籤操作-api)
- [報警管理 API](#報警管理-api)
- [用戶管理 API](#用戶管理-api)
- [外掛程式管理 API](#外掛程式管理-api)
- [數據查詢 API](#數據查詢-api)
- [日誌管理 API](#日誌管理-api)
- [郵件和腳本 API](#郵件和腳本-api)

## 基本資訊

**基礎 URL**: `http://localhost:1881/api`

**內容類型**: `application/json`

**快取控制**: `no-cache`

## 認證相關 API

### 登入並取得 Token

```http
POST /api/signin
```

**請求參數**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**回應**:
```json
{
  "status": 200,
  "token": "your_jwt_token_here"
}
```

## 設定相關 API

### 取得應用程式設定

```http
GET /api/settings
```

**請求參數**: 
- `c` (可選)

**回應範例**:
```json
{
  "language": "en",
  "uiPort": 1881,
  "secureEnabled": false,
  "tokenExpiresIn": "1h",
  "smtp": {
    "host": "smtp.example.com",
    "port": 587,
    "username": "user@example.com"
  }
}
```

### 設定應用程式設定

```http
POST /api/settings
```

**請求參數**:
```json
{
  "language": "en",
  "uiPort": 1881,
  "secureEnabled": false,
  "tokenExpiresIn": "1h",
  "smtp": {
    "host": "smtp.example.com",
    "port": 587,
    "username": "user@example.com",
    "password": "password"
  }
}
```

**回應**: `200 OK`

**備註**: 設定儲存在 `server/_appdata/mysettings.json` 檔案中

## 專案管理 API

### 取得專案屬性

```http
GET /api/project
```

**請求參數**: 無

**回應**:
```json
{
  "version": "1.00",
  "server": {},
  "hmi": {
    "layout": {},
    "views": []
  },
  "devices": {},
  "charts": [],
  "graphs": [],
  "alarms": [],
  "notifications": [],
  "scripts": [],
  "texts": [],
  "plugin": []
}
```

### 設定專案屬性

```http
POST /api/project
```

**請求參數**:
```json
{
  "version": "1.00",
  "server": {},
  "hmi": {
    "layout": {},
    "views": [
      {
        "MainView": {}
      }
    ]
  },
  "devices": {},
  "charts": [],
  "graphs": [],
  "alarms": [],
  "notifications": [],
  "scripts": [],
  "texts": [],
  "plugin": []
}
```

**回應**: `200 OK`

**備註**: 用於建立新專案，清除所有內容並設定新的空專案

### 設定專案特定屬性

```http
POST /api/projectData
```

**請求參數**:
```json
{
  "cmd": "set-device",
  "data": {
    "id": "device_id",
    "name": "Device Name",
    "type": "modbus",
    "property": {}
  }
}
```

**支援的命令**:
- `set-device`, `del-device`
- `set-view`, `del-view`
- `layout`
- `charts`
- `graphs`
- `set-text`, `del-text`
- `set-alarm`, `del-alarm`
- `set-notification`, `del-notification`
- `set-script`, `del-script`

**回應**: `200 OK`

### 上傳專案

```http
POST /api/upload
```

**請求參數**: JSON 檔案

**回應**: `200 OK`

## 設備管理 API

### 取得設備安全屬性

```http
GET /api/device
```

**請求參數**:
```json
{
  "query": "security",
  "name": "My OPCUA"
}
```

**回應**:
```json
{
  "mode": "",
  "uid": "username",
  "pwd": "password",
  "clientId": "123456"
}
```

### 設定設備安全屬性

```http
POST /api/device
```

**請求參數**:
```json
{
  "query": "security",
  "name": "My OPCUA",
  "value": {
    "mode": "",
    "uid": "username",
    "pwd": "password",
    "clientId": "123456"
  }
}
```

**回應**: `200 OK`

## 標籤操作 API

### 取得標籤值

```http
GET /api/getTagValue?ids=["t_2f47264f-b9e4451d"]
```

**查詢參數**:
- `ids`: 標籤 ID 陣列（JSON 格式字串）

**回應範例**:
```json
[
  {
    "id": "t_2f47264f-b9e4451d",
    "value": "25.5",
    "timestamp": 1640995200000
  }
]
```

### 設定標籤值

```http
POST /api/setTagValue
```

**請求參數**:
```json
{
  "tags": [
    {
      "id": "t_2f47264f-b9e4451d",
      "value": "22"
    },
    {
      "id": "t_ea53ed8d-60c5401c",
      "value": "1"
    }
  ]
}
```

**回應**: `200 OK`

## 報警管理 API

### 取得活動報警列表

```http
GET /api/alarms
```

**請求參數**: 無

**回應**:
```json
[
  {
    "name": "Alarm name",
    "type": "HIGH",
    "ontime": "2023-01-01T10:00:00Z",
    "offtime": "",
    "acktime": "",
    "status": "ACTIVE",
    "text": "Temperature too high",
    "group": "Temperature",
    "bkcolor": "#FF0000",
    "color": "#FFFFFF",
    "toack": true
  }
]
```

### 確認報警

```http
POST /api/alarmack
```

**請求參數**:
```json
{
  "params": "alarm_id"
}
```

**回應**: `200 OK`

**備註**: `alarm_id` 由名稱和類型組成

## 用戶管理 API

### 取得用戶列表

```http
GET /api/users
```

**請求參數**: 無

**回應**:
```json
[
  {
    "username": "username",
    "password": "123456",
    "groups": 3
  }
]
```

### 設定用戶屬性

```http
POST /api/users
```

**請求參數**:
```json
{
  "username": "username",
  "fullname": "Full Name",
  "password": "123456",
  "groups": 3
}
```

**回應**: `200 OK`

### 刪除用戶

```http
DELETE /api/users
```

**請求參數**:
```json
{
  "param": "username"
}
```

**回應**: `200 OK`

## 外掛程式管理 API

### 取得已安裝外掛程式

```http
GET /api/plugins
```

**請求參數**: 無

**回應**:
```json
[
  {
    "name": "modbus-serial",
    "type": "Modbus",
    "version": "8.0.1",
    "current": "8.0.1",
    "status": "",
    "pkg": true,
    "dinamic": true
  }
]
```

### 安裝外掛程式

```http
POST /api/plugins
```

**請求參數**:
```json
{
  "name": "modbus-serial",
  "type": "Modbus",
  "version": "8.0.1",
  "current": "8.0.1",
  "status": "",
  "pkg": true,
  "dinamic": true
}
```

**回應**: `200 OK`

### 移除外掛程式

```http
DELETE /api/plugins
```

**請求參數**:
```json
{
  "param": "modbus-serial"
}
```

**回應**: `200 OK`

## 數據查詢 API

### 取得 DAQ 數據

```http
GET /api/daq
```

**請求參數**:
```json
{
  "query": {
    "gid": "gauge_id",
    "from": "1640995200000",
    "to": "1640998800000",
    "event": "B",
    "sids": ["tag_id_1", "tag_id_2"]
  }
}
```

**回應**:
```json
[
  {
    "id": "tag_id_1",
    "ts": "1640995200000",
    "value": "12.5"
  }
]
```

**備註**:
- `gid`: GUI 元件參考
- `timestamp`: 毫秒時間戳
- `event`: 可以是 'B'（向後）或 'F'（向前）來控制查詢範圍方向
- `sids`: 標籤 ID 列表

## 日誌管理 API

### 取得日誌檔案列表

```http
GET /api/logsdir
```

**請求參數**: 無

**回應**:
```json
[
  "fuxa.log",
  "fuxa1.log",
  "fuxa-err.log"
]
```

### 取得日誌檔案內容

```http
GET /api/logs
```

**請求參數**:
```json
{
  "query": {
    "file": "fuxa1.log"
  }
}
```

**回應**: 下載檔案內容

## 郵件和腳本 API

### 發送郵件

```http
POST /api/sendmail
```

**請求參數**:
```json
{
  "msg": {
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "subject": "Test Subject",
    "text": "Text content",
    "html": "<p>HTML content</p>"
  },
  "smtp": {
    "host": "smtp.example.com",
    "port": 587,
    "mailsender": "sender@example.com",
    "username": "username",
    "password": "password"
  }
}
```

**回應**: `200 OK`

**備註**: `smtp` 參數為可選，用於配置和測試

### 執行腳本

```http
POST /api/runscript
```

**請求參數**:
```json
{
  "script": {
    "id": "script_id",
    "name": "Script Name",
    "code": "console.log('Hello World');",
    "parameters": [
      {
        "name": "param_name",
        "type": "value",
        "value": "12.5"
      }
    ]
  }
}
```

**回應**: `200 OK`

**備註**: `code` 和 `name` 參數為可選，用於配置和測試

## 錯誤處理

所有 API 呼叫都應該處理以下錯誤狀態碼：

- `400 Bad Request`: 請求參數無效
- `401 Unauthorized`: 未認證或 token 無效
- `403 Forbidden`: 權限不足
- `404 Not Found`: 資源不存在
- `500 Internal Server Error`: 伺服器內部錯誤

## 使用範例

### JavaScript 範例

```javascript
// 取得標籤值
const getTagValue = async (tagIds) => {
  const response = await fetch(`/api/getTagValue?ids=${JSON.stringify(tagIds)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
  return response.json();
};

// 設定標籤值
const setTagValue = async (tags) => {
  const response = await fetch('/api/setTagValue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify({ tags })
  });
  return response.json();
};
```

### Python 範例

```python
import requests
import json

# 取得標籤值
def get_tag_value(tag_ids):
    url = f"http://localhost:1881/api/getTagValue?ids={json.dumps(tag_ids)}"
    headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    }
    response = requests.get(url, headers=headers)
    return response.json()

# 設定標籤值
def set_tag_value(tags):
    url = "http://localhost:1881/api/setTagValue"
    headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    }
    data = {'tags': tags}
    response = requests.post(url, headers=headers, json=data)
    return response.json()
```

## 注意事項

1. 目前 FUXA 的 WebAPI 主要支援 GET 功能，數據包採用 JSON 格式
2. 所有 API 請求都應包含適當的 Content-Type 標頭
3. 某些 API 可能需要認證 token
4. 標籤 ID 格式通常為 "t_" 開頭的UUID格式
5. 時間戳使用毫秒格式的 Unix timestamp

## 相關資源

- [FUXA GitHub 專案](https://github.com/frangoteam/FUXA)
- [FUXA 官方網站](https://frangoteam.org/)
- [FUXA Wiki 文檔](https://github.com/frangoteam/FUXA/wiki)

---

**最後更新**: 2025年7月

**版本**: 基於 FUXA 最新版本編寫
# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in `FUXA/`.

## ⚠️ This is a FUXA fork, not pure upstream — but most edits should still go upstream

`FUXA/` 是 [frangoteam/FUXA](https://github.com/frangoteam/FUXA) 的 fork，由 FMS team 維護於 `polycron-inc/FUXA`，default branch `develop`。**有 FMS-specific 改動**，但大多數仍是直接從 upstream 拉的：

```
upstream:  https://github.com/frangoteam/FUXA.git
origin:    https://github.com/polycron-inc/FUXA.git
```

## 該不該改這份 fork？

- ✅ **CI / 部署相關**（`.github/workflows/`、`Dockerfile`、`.env.sample`）— FMS 自己的，可改
- ✅ **`compose.yml`** — FMS 整合用的 compose 設定，本地客製
- ⚠️ **App / Server source code** — 改之前先想清楚：是 FMS 特有需求嗎？或這是 upstream bug 該回 PR？大多數情況該往 upstream 提 PR、本 fork 拉 latest 即可。本 fork 累積太多 divergence 會難 sync upstream
- ❌ **README.md** — 維持 upstream 內容（已經有 FMS team 的修訂歷史，但仍是延續 upstream 風格）

## FMS 怎麼用 FUXA

FUXA 是 FMS 的 SCADA 螢幕引擎 — 提供低代碼 HMI / SCADA 編輯器，讓使用者拖拉做出工業圖控介面，再嵌進 fms-frontend 透過 iframe / direct link 呈現給終端用戶。

```
使用者開瀏覽器
    │
    ▼
fms-frontend (Vue 3 SPA)
    │
    │ 透過 fuxaClient (axios) 呼叫 FUXA REST API
    ▼
FUXA container (port 1881)
    │
    │ 內部透過 driver 跟現場設備溝通（也可訂閱 fms-backend 的資料）
    ▼
工業設備 / fms-backend
```

| 接點 | 在哪 |
|---|---|
| FMS 前端對 FUXA 的 client | `fms-frontend/src/api/createApiClient.ts::fuxaClient`（不簽名、不刷 token，是獨立 axios instance） |
| FUXA container 設定 | `FUXA/compose.yml`（port 1881，掛 `appdata/db/logs/images` volume） |
| FUXA image | `fms/fuxa:latest`（GHCR `ghcr.io/polycron-inc/fuxa:<tag>`） |
| FUXA 螢幕資料 | `FUXA/appdata/`（**git ignored**，每個部署環境自己的） |

## 啟動 FUXA

```bash
cd FUXA
docker compose up -d
# 開瀏覽器 http://localhost:1881
```

healthcheck 走 `GET /api/settings`（compose.yml 已配）。

## fms-frontend 怎麼接

`createApiClient.ts` 提供 `fuxaClient`：

- **不掛 Bearer token**（FUXA 自己的 auth 機制不同）
- **不做 request signing**
- **不會被 401 觸發 token refresh**
- base URL 由 `VITE_FUXA_BASE` 環變數注入（build-time）

要嵌 FUXA 螢幕到 Vue 元件，常見用法：

```vue
<iframe :src="`${fuxaBase}/${viewId}`" />
```

或透過 `fuxaClient` 拉 view 定義 → 自己 render。

## upstream 同步策略

本 fork 跟 upstream 同步建議：

```bash
cd FUXA
git fetch upstream
git checkout develop
git merge upstream/main          # 或 upstream/develop, 看 upstream 的 default branch
# 解衝突，特別注意 .github/workflows / Dockerfile（FMS 自己的）
git push origin develop
```

衝突常見點：
- `.github/workflows/` — FMS GHCR publish workflow vs upstream CI
- `Dockerfile` / `Dockerfile.runtime` — FMS 可能加了 healthcheck / FMS-specific env
- `.env.sample` — FMS 加了自己的環變數
- `README.md` — 雖然多次被 FMS team 改過，但內容主要還是延續 upstream

## 改了 server / client source 後的責任

如果真的修了 `server/` 或 `client/` 下的 application code：

1. **先評估能否回 PR** — 通用 bug fix / feature 該回 upstream
2. **若必須留在 fork**，commit message 要清楚標 `fms:` prefix（例 `fms: integrate with backend auth`）方便日後 rebase 時辨識
3. **不要動 file structure** — 能加新檔就加新檔，不要 rearrange，下次 upstream pull 衝突會嚴重

## graphify

FUXA 是 fork 的 fork，application code 主要是 upstream Angular + Node.js stack。直接 `/graphify .` 會把全部 upstream code 都建進 graph，訊號低。本目錄的 graphify 只建構**FMS-relevant 部分**：CLAUDE.md / compose.yml / Dockerfile / .github/workflows / FMS 特殊的 server config。要看 FUXA 內部架構，看 upstream README 或 wiki/。

## 已知坑

- **`FUXA/appdata/`、`db/`、`logs/`、`images/` 是 runtime volume** — 不要 commit；本地測試後不小心 commit 進去會泄漏資料
- **port 1881** 不是 FUXA 預設 1881（咦剛好一樣）— 確認 compose.yml 跟前端 `VITE_FUXA_BASE` 環變數對齊
- **Image tag drift** — FMS 用 `fms/fuxa:latest`，沒釘版本；GHCR 上有 tag 化的版本，正式環境建議釘版本避免無預警 breaking change

## 相關文件

- `README.md`（upstream 風格的專案介紹）
- `API_DOCUMENTATION_COMPLETE.md` / `DMS_USER_API.md` — API reference
- `SWAGGER_GUIDE.md` — Swagger UI 使用指南
- `wiki/` — upstream wiki 內容
- `播放限制功能說明.md` / `PLAY_RESTRICTIONS.md` — 中文 / 英文播放限制功能說明

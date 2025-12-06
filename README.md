# EngLearningSystem｜英文單字＆文法學習平台

🎯 **打造一套小規模英文學習 LMS，展示「前端互動 + 資料處理 + 後端雛形」的完整開發流程**

> 主要負責：系統架構、前端互動功能設計、爬蟲與題庫建置、資料流程整合

---

## 🚀 Demo & 截圖
（建議放 Demo 影片連結、學生端/教師端登入畫面、題庫頁面等 Screenshot）

---

## 🛠 技術亮點（Engineering Highlights）
- **模組化的前端架構**（Bootstrap + JS 核心模組分層）
- **爬蟲 + 資料標準化流程自動化**（輸出 GEPT 字彙題庫）
- **預留後端可成長架構**（FastAPI + SQLAlchemy + Pydantic）
- **帳號與學習歷程管理設計**（教師端/學生端雙角色體驗）
- **前端與資料層清晰分離**（可平滑接後端 API）

---

## 📌 我的貢獻（My Role）
✔ 前端 UI + 互動功能實作  
✔ GEPT 字彙爬蟲 + 格式轉換工具  
✔ 題庫資料設計與效能考量  
✔ 後端雛形規劃與 DB 結構設計  
✔ 需求與使用情境分析
# EngLearningSystem｜英文單字＆文法學習平台

  一個以前端模擬為主的英語自學/教學系統，包含學生端複習與測驗、教師端帳號管理與學習紀錄查詢，並附上題庫/字彙資料集與爬蟲、轉檔腳本。預留
  FastAPI + SQLAlchemy 的後端雛形，方便日後接軌資料庫。

  ## 功能重點
  - 學生端：登入後可依「複習/測驗」與「單字/文法」選擇學習；單字表支援搜尋+分頁；文法以投影片 Carousel 呈現；測驗支援標記題目、計分、錯題
  摘要並寫入歷程。
  - 教師端：新增/修改學生（學號自動遞增、密碼=學號+家長電話）、依條件快速查詢、查看最新 15 筆紀錄、查詢指定題目 QID、分頁檢視所有紀錄；可
  一鍵進入新學年（年級自動進位）。
  - 資料集：GEPT 字彙（多等級）、文法投影片、單字/文法題庫（CSV 轉 JSON）；附 ERD 圖（`master - EngLearningSystem - dbo.png`）。
  - 爬蟲/處理：從 LTTC GEPT 頁面擷取字彙，轉為標準欄位，並輸出 CSV/JSON；工具化的 HTTP 請求與存檔 utilities。
  - 後端雛形：預留 FastAPI 入口、SQLAlchemy 模型、Pydantic schema、SQL Server 連線設定與載入文法投影片的腳本。

  ## 專案結構
  - `frontend/`：登入/學生/教師頁面（Bootstrap 5）、核心模組 `js/*.js`
  - `data/raw`：原始字彙/投影片 JSON；`data/processed`：清洗後 CSV；`data/quiz`：單字/文法題庫 CSV+JSON
  - `crawler/`：`gept_crawl.py` 爬取 GEPT 字彙、`gept_normalize.py` 轉檔、`utils.py` 請求工具
  - `backend/`：FastAPI/SQLAlchemy 架構草稿，`csv_to_json.py` 資料轉換、`load_grammar_slides_to_db.py` 將投影片 JSON 寫入 SQL Server、
  `routers/data.sql` 調整資料表欄位
  - 其它：`canva.html`（導向 Canva 設計）、`requirements.txt`（後端/爬蟲依賴）

  ## 快速開始（前端體驗）
  1) 從專案根目錄開啟簡易伺服器（確保 fetch 可讀檔案），例如：
  ```bash
  python -m http.server 8000

  2. 瀏覽 http://localhost:8000/frontend/login.html。
  3. 教師帳密預設寫在 frontend/js/seed.js：Senna / 1229。先用教師端建立學生帳號（學號自動產生）。
  4. 學生端登入後即可複習單字/文法、進行測驗並查看個人歷程（資料存於 localStorage）。

  ## 資料與設定

  - 學生/進度儲存在瀏覽器 localStorage；種子設定與題庫路徑：frontend/js/seed.js
  - 資料讀取：dataApi.js 會依 CONFIG 讀取 data/raw 字彙、data/quiz 題庫與投影片 JSON，並依學生等級過濾
  - 題庫格式：data/quiz/*/*.json 每筆至少包含 quiz_type, level_id, unit, question, option, answer, qid
  - 文法投影片：data/raw/slide_A22.json 內含 A22/C02 單元對應的 backend/grammar/*/*.png

  ## 爬蟲與資料轉換流程

  1. 以 crawler/gept_crawl.py 從 LTTC 抓取字彙（含詞性/中文/等級），輸出至 data/raw
  2. 用 crawler/gept_normalize.py 或 backend/csv_to_json.py 轉為 CSV/JSON（輸出在 data/processed、data/quiz）
  3. 若接 SQL Server，可執行 backend/load_grammar_slides_to_db.py 將投影片 JSON 寫回 GrammarUnit.slide 欄位；backend/select.sql、backend/
     routers/data.sql 為資料表調整示例

  ## 下一步

- **使用 Spring Boot 實作完整後端 API**
  - RESTful 課程／測驗／帳號管理等路由
  - Controller / Service / Repository 分層設計
  - 使用 DTO（MapStruct）與 ResponseWrapper 統一回傳格式

- **導入資料庫與使用者權限驗證**
  - MySQL / PostgreSQL + JPA（Hibernate）
  - Argon2 / BCrypt 密碼編碼
  - Spring Security RBAC（Teacher / Student）
  - JWT Token Login + Refresh Token 機制

- **建立學習歷程資料模型**
  - 與前端 localStorage 比對與遷移
  - 設計測驗紀錄、錯題本、復習狀態 Schema
  - ERD 正規化、建立索引提升查詢效率

- **將題庫與文法資料統一由後端提供**
  - 加入 `/api/vocab`、`/api/grammar`、`/api/quiz` 路由
  - 分頁查詢、依等級過濾、快取 / ETag 提升效能

- **擴充爬蟲與批次資料載入流程**
  - 將資料寫入 DB，而非僅存 JSON
  - 建立 Data Ingestion Pipeline（排程維護語料更新）
  - 建立管理端後台操作匯入匯出

- **布署與 DevOps**
  - Docker 化整套系統
  - 可布署至 Render / Railway / Fly.io 或自架伺服器
  - CI/CD（GitHub Actions）執行自動化測試與格式檢查

  —
  開發者：Senna

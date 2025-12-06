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

  ## 可能的下一步

  - 實作 FastAPI 路由、SQLAlchemy 模型與 Pydantic schema（backend/main.py, backend/models.py, backend/schemas.py 目前為草稿）
  - 將前端的 localStorage 資料改由後端 API 提供，並串接真正的 DB/Auth
  - 完整化題庫欄位/檢核（含 qid 唯一性與選項格式），擴充錯題本/重練流程
  - 修整前端零碎程式碼（例如 frontend/js/auth.js 中未定義的 TEACHER_CREDENTIALS）

  ———

  開發者：Senna

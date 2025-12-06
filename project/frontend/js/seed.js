// seed.js：系統常數、初始資料
export const CONFIG = {
    // 唯一教師帳密（可自行修改）
    TEACHER: { username: "Senna", password: "1229" },
  
    // 單字複習來源（你的 raw 檔案）
    VOCAB_RAW_FILES: [
      "../data/raw/intermediate_A1.json",
      "../data/raw/intermediate_F_all.json",
      "../data/raw/intermediate_J2.json",
      "../data/raw/intermediate_S4.json",
    ],
  
    // 文法投影片：可能是一檔含多單元
    // 若你只有 slide_A22.json 但內含 A22/C02，保持 MERGED_SLIDE_FILES。
    GRAMMAR_SLIDE_FILE_BY_UNIT: {
      A22: "../data/raw/slide_A22.json",
      C02: "../data/raw/slide_A22.json"
    },
    // 若未來切成每單元一檔，也可直接填入對應 json。
  
    // 題庫（CSV 已轉 JSON 後）
    QUIZ_FILES: {
      vocab: {
        A1: "../data/quiz/vocab/A1.json",
        F_all: "../data/quiz/vocab/F_all.json",
        J2: "../data/quiz/vocab/J2.json",
        S4: "../data/quiz/vocab/S4.json",
      },
      grammar: {
        A22: "../data/quiz/grammar/A22.json",
        C02: "../data/quiz/grammar/C02.json",
      },
    },
  
    // 下拉選單可選的單元
    GRAMMAR_UNITS: ["A22", "C02"],
    VOCAB_UNITS: ["A1", "F_all", "J2", "S4"],
  
    // 學號前綴
    SID_PREFIX: "PWLC",
  };
  
  // 初始化 localStorage 的容器 key
  const ensureKey = (key, initial) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, JSON.stringify(initial));
    }
  };
  
  // 第一次載入時建立必要容器
  ensureKey("students", []);     // 學生清單
  ensureKey("progress", []);     // 作答/複習紀錄陣列
  ensureKey("seq", { student: 0 }); // 學號序號
  // 若要更改教師帳密，直接改 CONFIG 即可
  
  
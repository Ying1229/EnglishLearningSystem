import { CONFIG } from "./seed.js";
import { fetchJSON } from "./utils.js";

// 單字複習：讀多個 raw 檔，合併後依 level 過濾
export async function loadVocabForLevel(maxLevel = 1) {
  const merged = [];
  for (const path of CONFIG.VOCAB_RAW_FILES) {
    const arr = await fetchJSON(path); // 每筆 {word,pos,meaning,level_id}
    for (const it of arr) {
      const lv = Number(it.level_id || it.level || 0);
      if (lv <= maxLevel) merged.push({ word: it.word, pos: it.pos, meaning: it.meaning, level_id: lv });
    }
  }
  return merged;
}

// 文法投影片：讀 slide_xxx.json（可能一檔含多單元）
export async function loadSlides(unit) {
  const path = CONFIG.GRAMMAR_SLIDE_FILE_BY_UNIT[unit];
  if (!path) return [];
  const data = await fetchJSON(path);
  // 支援兩種格式：
  // { unit, slide:[...], level_id } 或 [ {unit, slide:[...]}, ... ]
  if (Array.isArray(data)) {
    const found = data.find(x => x.unit === unit);
    return found ? found.slide : [];
  } else if (data.unit && data.slide) {
    // 如果檔案名稱雖 A22，但內容是 A22，拿得到；若不是同單元則回空
    return (data.unit === unit) ? data.slide : [];
  } else if (Array.isArray(data.slide)) {
    return data.slide;
  }
  return [];
}

// 題庫：讀 data/quiz/{type}/{unit}.json 並依 level 過濾
export async function loadQuiz(type, unit, maxLevel = 1) {
  const path = CONFIG.QUIZ_FILES[type]?.[unit];
  if (!path) return [];
  const list = await fetchJSON(path); // 每筆 {quiz_type,level_id,unit,question,option,answer}
  return list.filter(q => Number(q.level_id) <= maxLevel);
}



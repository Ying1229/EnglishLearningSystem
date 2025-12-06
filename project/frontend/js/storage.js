import { CONFIG } from "./seed.js";
import { fmt } from "./utils.js";

// 目前登入者
export function setCurrentUser(u) { localStorage.setItem("currentUser", JSON.stringify(u)); }
export function getCurrentUser() { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
export function clearCurrentUser() { localStorage.removeItem("currentUser"); }

// 產生學號：PWLC001…
function nextStudentId() {
  const seq = JSON.parse(localStorage.getItem("seq"));
  seq.student += 1;
  localStorage.setItem("seq", JSON.stringify(seq));
  return `${CONFIG.SID_PREFIX}${String(seq.student).padStart(3, "0")}`;
}

// 依規格：密碼 = 學號 + 家長電話
export function buildPassword(student_id, parent_phone) {
  return `${student_id}${parent_phone}`;
}

// 新增學生
export function addStudent({ name, parent_phone, grade = "", school = "", class_level = 1 }) {
  const students = JSON.parse(localStorage.getItem("students"));
  const student_id = nextStudentId();
  const password = buildPassword(student_id, parent_phone);

  const s = { student_id, name, parent_phone, grade, school, class_level: Number(class_level), create_at: fmt(), password };
  students.push(s);
  localStorage.setItem("students", JSON.stringify(students));
  return s;
}

export function saveStudents(students) {
  localStorage.setItem("students", JSON.stringify(students));
}

// 查 students
export function allStudents() { return JSON.parse(localStorage.getItem("students")); }
export function findStudentById(id) { return allStudents().find(s => s.student_id === id); }

// // 進度：push 一筆
// export function addProgress({ student_id, type, unit, level_id, score, total, meta }) {
//   const list = JSON.parse(localStorage.getItem("progress"));
//   list.push({
//     student_id, type, unit, level_id,
//     score, total,
//     meta: meta || {},
//     answered_at: fmt()
//   });
//   localStorage.setItem("progress", JSON.stringify(list));
// }

// // 查某生進度
// export function getProgressOf(student_id) {
//   return JSON.parse(localStorage.getItem("progress")).filter(p => p.student_id === student_id);
// }

export function addProgress({ student_id, type, unit, level_id, score, total, meta, markedQuestions, wrongQuestionIds, wrongQuestionIndexes}) {
  const list = JSON.parse(localStorage.getItem("progress") || "[]");

  list.push({
    student_id,
    type,
    unit,
    level_id,
    score,
    total,
    meta: meta || {},
    answered_at: fmt(),
    marked_questions: markedQuestions || [],
    wrong_question_ids: wrongQuestionIds || [], // ⬅️ 新增錯題題目 ID（qid）
    wrong_question_indexes: wrongQuestionIndexes || []
  });

  localStorage.setItem("progress", JSON.stringify(list));
}


// 查某生進度
export function getProgressOf(student_id) {
  const progressList = JSON.parse(localStorage.getItem("progress") || "[]");
  return progressList.filter(p => p.student_id === student_id);
}

// 0908新增（查詢、升級相關）

// ---------- 新增：更新學生資料（單筆） ----------
export function updateStudentById(student_id, patch) {
  // patch: { name?, parent_phone?, grade?, school?, class_level?, password? }
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const idx = students.findIndex(s => s.student_id === student_id);
  if (idx === -1) return null;
  students[idx] = { ...students[idx], ...patch };
  localStorage.setItem('students', JSON.stringify(students));
  return students[idx];
}

// ---------- 新增：依篩選條件找學生（用於教師端查詢） ----------
export function findStudentsByFilter({ level, school, grade, keyword }) {
  // level: 1|2 (或 undefined)，school: string (partial)，grade: string (exact or partial)，keyword: 名字或學號關鍵
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  return students.filter(s => {
    if (level && Number(s.class_level) !== Number(level)) return false;
    if (school && !String(s.school || '').includes(school)) return false;
    if (grade && !String(s.grade || '').includes(grade)) return false;
    if (keyword) {
      const k = keyword.toLowerCase();
      if (!String(s.name || '').toLowerCase().includes(k) && !String(s.student_id || '').toLowerCase().includes(k)) return false;
    }
    return true;
  });
}

// ---------- 新增：全體升級年級（教務「進入新學年」） ----------
export function upgradeAllStudentsGrades() {
  // 依你指定的台灣 12 年級邏輯做升級
  // 若欄位 students[].grade = '小一' / '小二' ... '小六' / '國一' / '國二' / '國三' / '高一' / '高二' / '高三'
  // -> 若 '高三' -> '畢業'
  const students = JSON.parse(localStorage.getItem('students') || '[]');

  function nextGrade(g) {
    if (!g) return g;
    // 小一..小六 -> 小二..國一
    const r = g.match(/^(.)(.)$/); // 第一字：小國高　第二字：一二三四五六
    if (!r) return g;
    const phase = r[1]; // '小' / '國' / '高'
    const num = r[2]; // '一'|'二'...
    // 將中文數字轉int
    const map = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
    const inv = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
    if (phase === '小') {
      const n = map[num] || 1;
      if (n < 6) return `小${inv[n + 1]}`;
      return '國一';
    }
    if (phase === '國') {
      const n = map[num] || 1;
      if (n < 3) return `國${inv[n + 1]}`;
      return '高一';
    }
    if (phase === '高') {
      const n = map[num] || 1;
      if (n < 3) return `高${inv[n + 1]}`;
      return '畢業';
    }
    return g;
  }

  const updated = students.map(s => ({ ...s, grade: nextGrade(s.grade) }));
  localStorage.setItem('students', JSON.stringify(updated));
  return updated;
}
// // 0909 錯題新增： 以後再完成
// // 取得該學生錯題本（回傳陣列）
// export function getWrongBook(student_id) {
//   const raw = localStorage.getItem('wrong_book') || '{}';
//   const all = JSON.parse(raw);
//   return all[student_id] || [];
// }

// // 存該學生的錯題本陣列
// export function saveWrongBook(student_id, arr) {
//   const raw = localStorage.getItem('wrong_book') || '{}';
//   const all = JSON.parse(raw);
//   all[student_id] = arr;
//   localStorage.setItem('wrong_book', JSON.stringify(all));
// }

// // 取得錯題歷史（不可刪）
// export function getWrongHistory(student_id) {
//   const raw = localStorage.getItem('wrong_history') || '{}';
//   const all = JSON.parse(raw);
//   return all[student_id] || [];
// }
// export function saveWrongHistory(student_id, arr) {
//   const raw = localStorage.getItem('wrong_history') || '{}';
//   const all = JSON.parse(raw);
//   all[student_id] = arr;
//   localStorage.setItem('wrong_history', JSON.stringify(all));
// }

// // 新增錯題（同時寫入錯題本跟歷史）
// export function addWrongItem(student_id, item) {
//   // item 必須包含: qid, quiz_type, level_id, unit, question, option, answer, chosen, flagged, created_at
//   const wb = getWrongBook(student_id);
//   wb.push({ ...item, resolved: false });
//   saveWrongBook(student_id, wb);

//   const his = getWrongHistory(student_id);
//   his.push({ ...item, resolved: false });
//   saveWrongHistory(student_id, his);
// }

// // 移除錯題本中的該 qid（學生點「我已了解」）
// export function resolveWrongItem(student_id, qid) {
//   const wb = getWrongBook(student_id).filter(x => x.qid !== qid);
//   saveWrongBook(student_id, wb);

//   const his = getWrongHistory(student_id).map(x => {
//     if (x.qid === qid && !x.resolved) return { ...x, resolved: true, resolved_at: new Date().toISOString() };
//     return x;
//   });
//   saveWrongHistory(student_id, his);
// }

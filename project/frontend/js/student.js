import { ensureRole, fillUnitSelect } from "./main.js";
import { loadVocabForLevel, loadSlides, loadQuiz } from "./dataApi.js";
import { getCurrentUser } from "./storage.js";
import { addProgress, getProgressOf } from "./storage.js";
import { h, shuffle } from "./utils.js";
import * as storage from './storage.js';

const user = ensureRole("student");

const sId = document.getElementById("sId");
const sName = document.getElementById("sName");
const sLevel = document.getElementById("sLevel");
sId.textContent = user.student_id;
sName.textContent = user.name || "-";
sLevel.textContent = user.class_level;

const modeSel = document.getElementById("modeSelect");
const typeSel = document.getElementById("typeSelect");
const unitSel = document.getElementById("unitSelect");
const startBtn = document.getElementById("startBtn");
const resetArea = document.getElementById("resetArea");

const area = document.getElementById("displayArea");
const quizBar = document.getElementById("quizBar");
const submitQuizBtn = document.getElementById("submitQuiz");
const scoreLabel = document.getElementById("scoreLabel");
const progressList = document.getElementById("progressList");

// 依選擇的類型，填下拉
function refreshUnitOptions() {
  const t = typeSel.value;

  if (modeSel.value === "wrongBook") {
    unitSel.innerHTML = `<option value="">（錯題本不需選單元）</option>`;
    unitSel.disabled = true;
  }
  else if (modeSel.value === "review" && t === "vocab") {
    unitSel.innerHTML = `<option value="">（單字複習不需選單元）</option>`;
    unitSel.disabled = true;
  }
  else {
    unitSel.disabled = false;
    fillUnitSelect(unitSel, t);
  }
}
typeSel.addEventListener("change", refreshUnitOptions);
modeSel.addEventListener("change", refreshUnitOptions);
refreshUnitOptions();

resetArea.addEventListener("click", () => {
  area.innerHTML = "";
  quizBar.classList.add("d-none");
  scoreLabel.textContent = "";
});

startBtn.addEventListener("click", async () => {
  area.innerHTML = "";
  quizBar.classList.add("d-none");
  scoreLabel.textContent = "";

  const mode = modeSel.value;      // review | quiz
  const type = typeSel.value;      // vocab | grammar
  const unit = unitSel.value || ""; // A22/C02 或 vocab 的單元名稱

  if (mode === "review" && type === "vocab") {
    // 單字複習：列出單字（<= 學生等級）
    const words = await loadVocabForLevel(user.class_level);
    renderVocabList(words);
    addProgress({ student_id: user.student_id, type: "review_vocab", unit: "ALL", level_id: user.class_level, score: 'complete', meta: { preview: true } });
    renderProgress();
  }

  if (mode === "review" && type === "grammar") {
    // 文法複習：顯示投影片（Bootstrap Carousel）
    if (!unit) return area.append(h(`<div class="alert alert-warning">請選擇文法單元</div>`));
    const slides = await loadSlides(unit);
    if (!slides.length) return area.append(h(`<div class="alert alert-secondary">此單元尚無投影片</div>`));
    renderSlides(slides);
    addProgress({ student_id: user.student_id, type: "review_grammar", unit, level_id: user.class_level, score: 'complete', meta: { preview: true } });
    renderProgress();
  }

  if (mode === "quiz") {
    if (!unit) return area.append(h(`<div class="alert alert-warning">請選擇單元</div>`));
    const qs = await loadQuiz(type, unit, user.class_level);
    if (!qs.length) return area.append(h(`<div class="alert alert-secondary">此單元於你的等級沒有題目</div>`));
    renderQuiz(qs);
  }
  // 原本 study-mode 的 change handler 補這段：
  // if (mode === 'wrongBook') {
  //   document.getElementById('unit-select-wrap').classList.add('d-none'); // 不挑單元
  //   document.getElementById('wb-note').classList.remove('d-none');
  //   renderWrongBook(); // 新增函式
  // } else {
  //   document.getElementById('wb-note').classList.add('d-none');
  //   document.getElementById('unit-select-wrap').classList.remove('d-none');
  // }

});

// 單字表
// function renderVocabList(items) {
//   const search = h(`<input class="form-control mb-2" placeholder="搜尋英文或中文...">`);
//   const table = h(`<div class="table-responsive"><table class="table table-striped table-sm">
//     <thead><tr><th>單字</th><th>詞性</th><th>中文</th><th>等級</th></tr></thead>
//     <tbody></tbody></table></div>`);
//   const tbody = table.querySelector("tbody");

//   const draw = (list) => {
//     tbody.innerHTML = list.map(w => `<tr><td>${w.word}</td><td>${w.pos}</td><td>${w.meaning}</td><td>${w.level_id}</td></tr>`).join("");
//   };
//   draw(items);

//   search.addEventListener("input", () => {
//     const q = search.value.trim().toLowerCase();
//     draw(items.filter(w => `${w.word}${w.meaning}`.toLowerCase().includes(q)));
//   });

//   area.append(search, table);
// }

function renderVocabList(items) {
  const search = h(`<input class="form-control mb-2" placeholder="篩選單字:請搜尋英文或中文...">`);
  const table = h(`
    <div class="table-responsive">
      <table class="table table-striped table-sm">
        <thead><tr><th>單字</th><th>詞性</th><th>中文</th><th>等級</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>`);
  const tbody = table.querySelector("tbody");

  // 分頁外框：白底＋圓角＋陰影
  const pagination = h(`
    <div class="d-flex justify-content-center my-3">
      <div class="vocab-pagination-container shadow-sm bg-white rounded p-2 d-inline-flex align-items-center gap-2"></div>
    </div>
  `);

  const paginationContainer = pagination.querySelector('.vocab-pagination-container');

  const areaContainer = h(`<div></div>`);
  areaContainer.append(search, table, pagination);

  let currentPage = 1;
  const pageSize = 15;
  let filteredItems = [...items];

  function drawPage(page = 1) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filteredItems.slice(start, end);

    tbody.innerHTML = pageItems.map(w => `
      <tr>
        <td>${w.word}</td>
        <td>${w.pos}</td>
        <td>${w.meaning}</td>
        <td>${w.level_id}</td>
      </tr>`).join("");

    drawPaginationControls();
  }

  function drawPaginationControls() {
    const totalPages = Math.ceil(filteredItems.length / pageSize);
    paginationContainer.innerHTML = ''; // 清除原本按鈕

    // 建立分頁按鈕
    const firstBtn = h(`<button class="btn btn-outline-secondary btn-sm" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`);
    const prevBtn  = h(`<button class="btn btn-outline-secondary btn-sm" ${currentPage === 1 ? 'disabled' : ''}>上一頁</button>`);
    const nextBtn  = h(`<button class="btn btn-outline-secondary btn-sm" ${currentPage === totalPages ? 'disabled' : ''}>下一頁</button>`);
    const lastBtn  = h(`<button class="btn btn-outline-secondary btn-sm" ${currentPage === totalPages ? 'disabled' : ''}>&raquo;</button>`);
    const pageIndicator = h(`<span class="align-self-center text-muted">第 ${currentPage} / ${totalPages || 1} 頁</span>`);

    // 綁定事件
    firstBtn.addEventListener("click", () => {
      currentPage = 1;
      drawPage(currentPage);
    });
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        drawPage(currentPage);
      }
    });
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        drawPage(currentPage);
      }
    });
    lastBtn.addEventListener("click", () => {
      currentPage = totalPages;
      drawPage(currentPage);
    });

    // 加入分頁按鈕到畫面
    paginationContainer.append(firstBtn, prevBtn, pageIndicator, nextBtn, lastBtn);
  }

  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    filteredItems = items.filter(w =>
      `${w.word}${w.meaning}`.toLowerCase().includes(q)
    );
    currentPage = 1;
    drawPage();
  });

  drawPage();

  area.innerHTML = ''; // 清空原本的內容
  area.append(areaContainer);
}


// 文法投影片（Bootstrap Carousel）
function renderSlides(slides) {
  const id = `carousel-${Date.now()}`;
  const inner = slides.map((src, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <img src="../${src}" class="d-block w-100" alt="slide ${i + 1}">
    </div>`).join("");
  const el = h(`
    <div id="${id}" class="carousel slide">
      <div class="carousel-inner">${inner}</div>
      <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>
  `);
  area.append(el);
}

// 題目與作答
// let currentQuiz = [];
// function renderQuiz(qs) {
//   currentQuiz = shuffle(qs);
//   const list = h(`<div class="vstack gap-3"></div>`);
//   currentQuiz.forEach((q, idx) => {
//     const opts = JSON.parse(q.option);
//     const block = h(`<div class="card">
//       <div class="card-body">
//         <input type="checkbox" class="mark-question">
//         <div class="fw-bold mb-2">${idx + 1}. ${q.question}</div>
//         ${Object.entries(opts).map(([k,v]) => `
//           <div class="form-check">
//             <input class="form-check-input" type="radio" name="q${idx}" id="q${idx}-${k}" value="${k}">
//             <label class="form-check-label" for="q${idx}-${k}">${k}. ${v}</label>
//           </div>`).join("")}
//       </div>
//     </div>`);
//     list.append(block);
//   });
//   area.append(list);
//   quizBar.classList.remove("d-none");
// }

// submitQuizBtn.addEventListener("click", () => {
//   if (!currentQuiz.length) return;

//   let correct = 0;
//   currentQuiz.forEach((q, i) => {
//     const chosen = document.querySelector(`input[name="q${i}"]:checked`);
//     if (chosen && chosen.value === q.answer) correct += 1;
//   });

//   scoreLabel.textContent = `得分：${correct} / ${currentQuiz.length}`;
//   // 寫進 progress
//   const unit = unitSel.value;
//   const type = typeSel.value;
//   addProgress({
//     student_id: user.student_id,
//     type: `quiz_${type}`,
//     unit,
//     level_id: user.class_level,
//     score: correct,
//     total: currentQuiz.length
//   });
//   renderProgress();
// });

// // 顯示作答紀錄
// function renderProgress() {
//   const rows = getProgressOf(user.student_id)
//     .slice()
//     .reverse()
//     .map(p => `<div>【${p.answered_at}】${p.type} / 單元:${p.unit} / 等級:${p.level_id} / 分數:${p.score}/${p.total}</div>`);
//   progressList.innerHTML = rows.join("") || `<div class="text-muted">尚無紀錄</div>`;
// }
// renderProgress();


let currentQuiz = [];

function renderQuiz(qs) {
  currentQuiz = shuffle(qs); // 打亂題目順序
  const list = h(`<div class="vstack gap-3"></div>`); // 建立題目列表容器

  currentQuiz.forEach((q, idx) => {
    const opts = JSON.parse(q.option); // 題目選項（JSON 形式）
    const block = h(`<div class="card">
      <div class="card-body">
        <!-- 題目前的標記 checkbox，加上 data-id 屬性儲存題目 ID -->
        <input type="checkbox" class="mark-question" data-id="${q.qid}">
        <div class="fw-bold mb-2">${idx + 1}. ${q.question}</div>
        ${Object.entries(opts).map(([k, v]) => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="q${idx}" id="q${idx}-${k}" value="${k}">
            <label class="form-check-label" for="q${idx}-${k}">${k}. ${v}</label>
          </div>`).join("")}
      </div>
    </div>`);

    list.append(block); // 將題目 block 加入列表
  });

  area.append(list); // 顯示所有題目
  quizBar.classList.remove("d-none"); // 顯示下方按鈕欄
}
// 0904 ver.
submitQuizBtn.addEventListener("click", () => {
  if (!currentQuiz.length) return;

  let correct = 0;
  const answers = [];

  const markedQuestions = [];
  document.querySelectorAll(".mark-question:checked").forEach(chk => {
    const qid = chk.dataset.id;
    if (qid) markedQuestions.push(qid);
  });

  const wrongIndexes = []; // 給學生看 (從 1 開始的題號)
  const wrongQuestionIds = [];     // 給老師看 (qid)

  currentQuiz.forEach((q, i) => {
    const chosen = document.querySelector(`input[name="q${i}"]:checked`);
  
    if (chosen && chosen.value === q.answer) {
      correct += 1; // ✅ 答對才加分
    } else {
      wrongQuestionIds.push(q.qid);
      wrongIndexes.push(i + 1); // 題號從 1 開始
    }
  
    answers.push({
      questionId: q.qid,
      selected: chosen ? chosen.value : null
    });
  });  

  // 顯示得分與錯題
  scoreLabel.innerHTML = `
  <div class="card mt-4 shadow-sm">
    <div class="card-body">
      <h5 class="card-title text-primary">
        得分：<span class="badge bg-success fs-6">${correct}</span> / 
        <span class="fs-6">${currentQuiz.length}</span>
      </h5>
      <hr>
      <p class="card-text mb-1 fw-bold">錯誤題號：</p>
      ${
        wrongIndexes.length
          ? `<div class="d-flex flex-wrap gap-2">
              ${wrongIndexes.map(n => `<span class="badge bg-danger">${n}</span>`).join("")}
            </div>`
          : `<div class="text-muted">無錯題 🎉</div>`
      }
    </div>
  </div>
`;

  const unit = unitSel.value;
  const type = typeSel.value;

  addProgress({
    student_id: user.student_id,
    type: `quiz_${type}`,
    unit,
    level_id: user.class_level,
    score: correct,
    total: currentQuiz.length,
    markedQuestions,
    wrongQuestionIds, // ⬅️ 新增給老師看的錯題 ID（qid）
    wrongQuestionIndexes: wrongIndexes
  });

  renderProgress();
});

// function renderProgress() {
//   const rows = getProgressOf(user.student_id)
//     .slice()
//     .reverse()
//     .map(p => {
//       const marked = Array.isArray(p.marked_questions) ? p.marked_questions : [];
//       const markedText = marked.length ? marked.join(", ") : "無標記";

//       return `<div>
//         【${p.answered_at}】${p.type} / 單元:${p.unit} / 等級:${p.level_id} / 分數:${p.score}/${p.total}
//       </div>`;
//     });

//   progressList.innerHTML = rows.join("") || `<div class="text-muted">尚無紀錄</div>`;
// }

function renderProgress() {
  const rows = getProgressOf(user.student_id)
    .slice()
    .reverse()
    .filter(p => p.answered_at && p.type)
    .map(p => {
      const marked = Array.isArray(p.marked_questions) ? p.marked_questions : [];
      const markedText = marked.length ? marked.join(", ") : "無標記";

      const wrongs = Array.isArray(p.wrong_question_indexes) ? p.wrong_question_indexes : [];
      const wrongsText = wrongs.length ? wrongs.join(", ") : "無錯題";

      const scoreDisplay = (typeof p.score === 'string' && p.score === 'complete')
        ? '完成'
        : `${p.score}/${p.total}`;

      return `<div>
        【${p.answered_at}】${p.type} / 單元:${p.unit} / 等級:${p.level_id} / 分數:${scoreDisplay} / 錯誤題號:${wrongsText}
      </div>`;
    });

  progressList.innerHTML = rows.join("") || `<div class="text-muted">尚無紀錄</div>`;
}


// 0909更新錯題



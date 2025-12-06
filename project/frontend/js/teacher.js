import { ensureRole } from "./main.js";
import { addStudent, allStudents, getProgressOf, saveStudents, updateStudentById, findStudentsByFilter, upgradeAllStudentsGrades, buildPassword, findStudentById } from "./storage.js";
import { h } from "./utils.js";
import { loadQuiz } from "./dataApi.js";
import { CONFIG } from "./seed.js";             // 你的設定（教師密碼存在這）


ensureRole("teacher");

// tab 對應的 panel 對照表
const tabMapping = {
  "tab-add": "panelAdd",
  "tab-fast": "panelQueryFast",
  "tab-all": "panelQueryAll",
};

// 統一的面板切換函式
function showPanel(activeTabId) {
  for (const [tabId, panelId] of Object.entries(tabMapping)) {
    const tab = document.getElementById(tabId);
    const panel = document.getElementById(panelId);

    if (tabId === activeTabId) {
      tab.classList.add("active");
      panel.classList.remove("d-none");
    } else {
      tab.classList.remove("active");
      panel.classList.add("d-none");
    }
  }
}

// ➤ 初始顯示「新增/修改學生資料」
showPanel("tab-add");

document.getElementById("dropdownMenuButton").addEventListener("click", (e) => {
  e.preventDefault(); // 阻止預設跳轉
  showPanel("tab-fast"); // 預設顯示快速查詢面板
});

// ➤ 綁定點擊事件
Object.keys(tabMapping).forEach(tabId => {
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.addEventListener("click", () => showPanel(tabId));
  }
});


//////
const tbody = document.getElementById("studentTbody");
const listSel = document.getElementById("progressStudent");
const msg = document.getElementById("createMsg");

// 新增學生
document.getElementById("addStudentForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const s = addStudent({
    name: document.getElementById("name").value.trim(),
    parent_phone: document.getElementById("parentPhone").value.trim(),
    grade: document.getElementById("grade").value.trim(),
    school: document.getElementById("school").value.trim(),
    class_level: Number(document.getElementById("classLevel").value)
  });
  alert(`學號： ${s.student_id} 建立成功，請記得將帳號密碼發送給該學生。 `)
  msg.textContent = `建立成功：學號 ${s.student_id}，密碼（學號+家長電話）已自動設定。`;
  e.target.reset();
  drawStudents();
  fillStudentSelect();
});

// 列名單
// function drawStudents() {
//   const arr = allStudents();
//   tbody.innerHTML = "";
//   arr.forEach(s => {
//     const tr = h(`<tr>
//       <td>${s.student_id}</td>
//       <td>${s.name}</td>
//       <td>${s.class_level}</td>
//       <td>${s.parent_phone}</td>
//       <td>${s.school || "-"}</td>
//       <td>${s.grade}</td>
//       <td><button class="btn btn-sm btn-outline-primary" data-sid="${s.student_id}">看紀錄</button></td>
//     </tr>`);
//     tr.querySelector("button").addEventListener("click", () => renderProgress(s.student_id));
//     tbody.append(tr);
//   });
// }
// drawStudents();

// function fillStudentSelect() {
//   const arr = allStudents();
//   listSel.innerHTML = arr.map(s => `<option value="${s.student_id}">${s.student_id} - ${s.name}</option>`).join("");
// }
// fillStudentSelect();
// 0908更新
function renderStudentList(students) {
  const tbody = document.getElementById("studentTbody");
  tbody.innerHTML = "";
  students.forEach((s) => {
    const tr = h(`<tr>
      <td>${s.student_id}</td>
      <td>${s.name}</td>
      <td>${s.class_level}</td>
      <td>${s.parent_phone}</td>
      <td>${s.school || "-"}</td>
      <td>${s.grade}</td>
      <td><button class="btn btn-sm btn-outline-primary" data-sid="${s.student_id}">看紀錄</button></td>
    </tr>`);
    tr.querySelector("button").addEventListener("click", () => renderProgress(s.student_id));
    tbody.append(tr);
  });
}
// 進度
// document.getElementById("refreshProgress").addEventListener("click", () => {
//   const sid = listSel.value;
//   renderProgress(sid);
// });

// function renderProgress(sid) {
//   const box = document.getElementById("progressBox");
//   const rows = getProgressOf(sid).slice().reverse()
//     .map(p => `<div>【${p.answered_at}】${p.student_id} / ${p.type} / 單元:${p.unit} / 等級:${p.level_id} / 分數:${p.score}/${p.total}</div>`);
//   box.innerHTML = rows.join("") || `<div class="text-muted">尚無紀錄</div>`;
// }

// function renderProgress(sid) {
//   const box = document.getElementById("progressBox");

//   const rows = getProgressOf(sid)
//     .slice()
//     .reverse()
//     .map(p => {
//       // 判斷要套用的顏色 class（根據得分）
//       const score = p.score;
//       let rowClass = "";
//       if (score <= 2) rowClass = "text-danger";       // 紅色背景
//       else if (score <= 4) rowClass = "text-warning"; // 黃色背景

//       const marked = Array.isArray(p.marked_questions) ? p.marked_questions : [];
//       const markedText = marked.length ? marked.join(", ") : "無標記";

//       return `<div class="${rowClass} p-2 rounded">
//         【${p.answered_at}】${p.type} / 單元:${p.unit} / 等級:${p.level_id} / 分數:${p.score}/${p.total} / 標記題目ID: ${markedText}
//       </div>`;
//     });

//   box.innerHTML = rows.join("") || `<div class="text-muted">尚無紀錄</div>`;
// }


function renderProgress(sid) {
  const box = document.getElementById("progressBox");

  const student = findStudentById(sid);
  const studentInfo = student
    ? `<div class="mb-3 fs-5 fw-bold">
         👤 學號：${student.student_id}　姓名：${student.name}
       </div>`
    : `<div class="mb-3 text-muted">找不到學生資料</div>`;

  // 取得學生的所有進度紀錄
  const progressList = getProgressOf(sid)
    .slice()
    .sort((a, b) => new Date(b.answered_at) - new Date(a.answered_at)); // 新的在前

  // 只取最近 15 筆紀錄
  const recentProgress = progressList.slice(0, 15);

  // 渲染這 15 筆紀錄
  const rows = recentProgress.map(p => {
    const score = p.score;
    const total = p.total;
    let rowClass = "";

    const ratio = score / total;

    if (ratio < 0.5) {
      rowClass = "text-danger";
    } else if (ratio < 0.75) {
      rowClass = "text-primary";
    }

    const marked = Array.isArray(p.marked_questions) ? p.marked_questions : [];
    const markedText = marked.length ? marked.join(", ") : "無標記";

    const wrong = Array.isArray(p.wrong_question_ids) ? p.wrong_question_ids : [];
    const wrongText = wrong.length ? wrong.join(", ") : "無錯題";

    const scoreDisplay = (typeof p.score === 'string' && p.score === 'complete')
      ? '✅複習完成'
      : `📊分數${p.score}/${p.total}`;
    const reviewDisplay = (typeof p.score === 'string' && p.score === 'complete')
      ? '📖複習無需標題'
      : `🔖 標記題目 ID：${markedText}`;
    const wrongDisplay = (typeof p.score === 'string' && p.score === 'complete')
      ? '📚複習無錯題'
      : `❌ 錯題 ID（qid）：${wrongText}`;


    return `
      <div class="${rowClass} p-2 rounded mb-2 border bg-light">
        <div><strong>【${p.answered_at}】</strong> ${p.type} / 單元: ${p.unit} / 等級: ${p.level_id}</div>
        <div> <strong>${scoreDisplay}</strong></div>
        <div>${reviewDisplay}</div>
        <div>${wrongDisplay}</div>
      </div>
    `;
  });

  box.innerHTML = studentInfo + rows.join("") || `<div class="text-muted">尚無作答紀錄</div>`;
}


// 0908新增：新學年函式、查詢、錯題

document.getElementById('btnNewSchoolYear').addEventListener('click', () => {
  const pw = window.prompt('請再次輸入教師端密碼進入新學年：');
  if (pw === null) return; // 取消
  if (pw !== CONFIG.TEACHER.password) {
    alert('密碼錯誤，無法進入新學年');
    return;
  }
  const updated = upgradeAllStudentsGrades();
  // 若你有 renderStudentList 函式，呼叫它重新渲染（或手動載入 students）
  if (typeof drawStudents === 'function') drawStudents(updated);
  else {
    // fallback: 重新載入畫面
    alert('所有學生年級已升級（畫面將重新整理）');
    location.reload();
  }
});

document.getElementById('edit-student').addEventListener('submit', (event) => {
  event.preventDefault();
  const sid = document.getElementById('edit-stu-id').value.trim();
  if (!sid) return alert('請輸入學號');

  const patch = {};
  const vname = document.getElementById('edit-stu-name').value.trim();
  const vgrade = document.getElementById('edit-stu-grade').value.trim();
  const vschool = document.getElementById('edit-stu-school').value.trim();
  const vparentPhone = document.getElementById('edit-stu-parentPhone').value.trim();
  const vlevel = document.getElementById('edit-stu-level').value;

  if (vname) patch.name = vname;
  if (vgrade) patch.grade = vgrade;
  if (vschool) patch.school = vschool;
  if (vparentPhone) {
    patch.parent_phone = vparentPhone;
    patch.password = buildPassword(sid, vparentPhone);
  }
  if (vlevel) patch.class_level = Number(vlevel);

  const updated = updateStudentById(sid, patch);
  if (!updated) return alert('找不到該學號：' + sid);
  alert('已更新學生資料');
  if (typeof drawStudents === 'function') drawStudents(); // 若你有顯示學生列表的函式
});

document.getElementById("btn-apply-filter").addEventListener("click", () => {
  const level = document.getElementById("filter_level").value;
  const school = document.getElementById("filter_school").value.trim();
  const grade = document.getElementById("filter_grade").value.trim();
  const key = document.getElementById("filter_key").value.trim();

  const filtered = findStudentsByFilter({ level, school, grade, keyword: key });
  renderStudentList(filtered);
});

// function renderAllProgress(progressList) {
//   const container = document.getElementById('progress-container');
//   const pagination = document.getElementById('progress-pagination');

//   progressList.sort((a, b) => new Date(b.answered_at) - new Date(a.answered_at));

//   let currentPage = 1;
//   const itemsPerPage = 10;
//   const totalPages = Math.ceil(progressList.length / itemsPerPage);

//   function renderPage(page) {
//     const start = (page - 1) * itemsPerPage;
//     const end = start + itemsPerPage;
//     const pageData = progressList.slice(start, end);

//     container.innerHTML = pageData.map(p => {
//       return `
//         <div class="card mb-2">
//           <div class="card-body">
//             <h5>單元：${p.unit || '（未填）'} (${p.type || '未知'})</h5>
//             <p>日期：${p.answered_at || '未知時間'}</p>
//             <p>成績：${p.score ?? '-'} / ${p.total ?? '-'}</p>
//             <p>提問題：${p.marked_questions}</p>
//           </div>
//         </div>
//       `;
//     }).join('');

//     // 建立分頁按鈕
//     pagination.innerHTML = '';
//     if (totalPages > 1) {
//       for (let i = 1; i <= totalPages; i++) {
//         const btn = document.createElement('button');
//         btn.textContent = i;
//         btn.className = 'btn btn-sm mx-1 ' + (i === page ? 'btn-primary' : 'btn-outline-primary');
//         btn.addEventListener('click', () => {
//           currentPage = i;
//           renderPage(currentPage);
//         });
//         pagination.appendChild(btn);
//       }
//     }
//   }

//   renderPage(currentPage);
// }
function renderAllProgress(progressList) {
  const container = document.getElementById('progress-container');
  const pagination = document.getElementById('progress-pagination');

  // 依照時間排序，最新在最前
  progressList.sort((a, b) => new Date(b.answered_at) - new Date(a.answered_at));

  let currentPage = 1;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(progressList.length / itemsPerPage);

  function renderPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = progressList.slice(start, end);

    container.innerHTML = pageData.map(p => {
      const score = p.score;
      const total = p.total;
      const ratio = typeof score === 'number' && typeof total === 'number' ? score / total : 1;

      let rowClass = "";
      if (typeof score === 'number') {
        if (ratio < 0.5) rowClass = "text-danger";
        else if (ratio < 0.75) rowClass = "text-primary";
      }

      const marked = Array.isArray(p.marked_questions) ? p.marked_questions : [];
      const markedText = marked.length ? marked.join(", ") : "無標記";

      const wrong = Array.isArray(p.wrong_question_ids) ? p.wrong_question_ids : [];
      const wrongText = wrong.length ? wrong.join(", ") : "無錯題";


      const scoreDisplay = (typeof score === 'string' && score === 'complete')
        ? '✅ 複習完成'
        : `📊 分數：${score}/${total}`;

      const reviewDisplay = (typeof score === 'string' && score === 'complete')
        ? '📖 複習無需標記'
        : `🔖 標記題目 ID：${markedText}`;

      const wrongDisplay = (typeof score === 'string' && score === 'complete')
        ? '📚 複習無錯題'
        : `❌ 錯題 ID（qid）：${wrongText}`;

      return `
        <div class="p-3 rounded mb-3 border bg-light ${rowClass}">
          <div><strong>【${p.answered_at || '未知時間'}】</strong> ${p.type || '未知'} / 單元: ${p.unit || '（未填）'} / 等級: ${p.level_id || '-'}</div>
          <div><strong>${scoreDisplay}</strong></div>
          <div>${reviewDisplay}</div>
          <div>${wrongDisplay}</div>
        </div>
      `;
    }).join("");

    renderPagination(page);
  }

  function renderPagination(current) {
    pagination.innerHTML = "";

    const nav = document.createElement('nav');
    nav.setAttribute("aria-label", "頁數導航");

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    // ⬅️ 上一頁
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item ' + (current === 1 ? 'disabled' : '');
    prevLi.innerHTML = `<a class="page-link" href="#">上一頁</a>`;
    prevLi.addEventListener('click', e => {
      e.preventDefault();
      if (current > 1) {
        currentPage--;
        renderPage(currentPage);
      }
    });
    ul.appendChild(prevLi);

    // 頁碼按鈕
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.className = 'page-item ' + (i === current ? 'active' : '');
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', e => {
        e.preventDefault();
        currentPage = i;
        renderPage(currentPage);
      });
      ul.appendChild(li);
    }

    // ➡️ 下一頁
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item ' + (current === totalPages ? 'disabled' : '');
    nextLi.innerHTML = `<a class="page-link" href="#">下一頁</a>`;
    nextLi.addEventListener('click', e => {
      e.preventDefault();
      if (current < totalPages) {
        currentPage++;
        renderPage(currentPage);
      }
    });
    ul.appendChild(nextLi);

    nav.appendChild(ul);
    pagination.appendChild(nav);
  }

  renderPage(currentPage);
}


document.getElementById('btn-search-all').addEventListener('click', () => {
  const keyword = document.getElementById('search-all-records').value.trim();
  if (!keyword) {
    alert('請輸入學號或姓名');
    return;
  }

  const matched = findStudentsByFilter({ keyword });

  if (matched.length === 0) {
    alert('找不到該學生');
    return;
  }

  if (matched.length > 1) {
    alert('找到多位學生，請輸入更精確的學號或全名');
    return;
  }

  const student = matched[0];
  const progressList = getProgressOf(student.student_id);
  if (!progressList || progressList.length === 0) {
    return alert(`學生 ${student.name} 沒有任何學習紀錄`);
  }

  renderAllProgress(progressList);
});

// 全域索引表
const qidMap = {};

async function preloadAllQuizzes() {
  const quizTypes = Object.keys(CONFIG.QUIZ_FILES);

  for (const type of quizTypes) {
    const units = Object.keys(CONFIG.QUIZ_FILES[type]);

    for (const unit of units) {
      const list = await loadQuiz(type, unit, 99); // 載入全部等級題目

      list.forEach(q => {
        qidMap[q.qid] = {
          ...q,
          type,
          unit
        };
      });
    }
  }

  console.log("✅ 題目資料載入完成，共", Object.keys(qidMap).length, "題");
}
document.getElementById("searchQidBtn").addEventListener("click", () => {
  const qid = document.getElementById("qidInput").value.trim();
  const resultBox = document.getElementById("qidResult");
  console.log("載入題目 qid:", qid);
  if (!qid) {
    resultBox.innerHTML = `<div class="text-danger">請輸入 QID</div>`;
    return;
  }

  const quiz = qidMap[qid];

  if (!quiz) {
    resultBox.innerHTML = `<div class="text-danger">❌ 找不到題目 QID：${qid}</div>`;
    return;
  }

  let optionsArray;
  if (Array.isArray(quiz.option)) {
    optionsArray = quiz.option;
  } else if (typeof quiz.option === "string") {
    optionsArray = quiz.option.split(",").map(s => s.trim());
  } else {
    optionsArray = [];
  }
  const optionsHtml = optionsArray.length
    ? optionsArray.map(opt => `<li>${opt}</li>`).join("")
    : `<li><em>無選項資料</em></li>`;


  resultBox.innerHTML = `
    <div class="card border-success">
      <div class="card-body">
        <h5 class="card-title">📘 題目查詢結果</h5>
        <p><strong>QID：</strong>${quiz.qid}</p>
        <p><strong>類型：</strong>${quiz.type}</p>
        <p><strong>單元：</strong>${quiz.unit}</p>
        <p><strong>等級：</strong>${quiz.level_id}</p>
        <p><strong>題目：</strong>${quiz.question}</p>
        <p><strong>選項：</strong></p>
        <ul>${optionsHtml}</ul>
        <p><strong>答案：</strong>✅ ${quiz.answer}</p>
      </div>
    </div>
  `;
});

window.addEventListener("DOMContentLoaded", () => {
  preloadAllQuizzes();
});
// 顯示/隱藏按鈕
window.addEventListener("scroll", () => {
  const btn = document.getElementById("scrollToTopBtn");
  if (window.scrollY > 200) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
});

// 滾動到最上方
document.getElementById("scrollToTopBtn").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

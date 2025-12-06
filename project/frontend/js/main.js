import { getCurrentUser, clearCurrentUser } from "./storage.js";
import { CONFIG } from "./seed.js";

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearCurrentUser();
    location.href = "login.html";
    alert("已登出帳號")
  });
}

// 提供共用的單元下拉填充
export function fillUnitSelect(selectEl, type = "grammar") {
  const units = (type === "vocab") ? CONFIG.VOCAB_UNITS : CONFIG.GRAMMAR_UNITS;
  selectEl.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join("");
}

// 若需要在各頁確認登入身分
export function ensureRole(role) {
  const u = getCurrentUser();
  if (!u || u.role !== role) {
    location.href = "login.html";
  }
  return u;
}

import { loadQuiz } from "./dataApi.js"; // 如果 loadQuiz 放這裡



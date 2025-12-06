import { CONFIG } from "./seed.js";
import { setCurrentUser } from "./storage.js";

const msg = document.getElementById("msg");
function showMsg(t) { msg.textContent = t; msg.classList.remove("d-none"); }

const stuForm = document.getElementById("studentLoginForm");
if (stuForm) {
  stuForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const sid = document.getElementById("stuId").value.trim();
    const pwd = document.getElementById("stuPwd").value.trim();

    const students = JSON.parse(localStorage.getItem("students"));
    const s = students.find(x => x.student_id === sid);
    if (!s) return showMsg("學號不存在");
    if (pwd !== s.password) return showMsg("密碼錯誤！(請確認是否輸入正確，忘記密碼請聯繫當班老師)");

    setCurrentUser({ role: "student", student_id: s.student_id, name: s.name, class_level: s.class_level });
    location.href = "student.html";
    alert('同學好～請選擇學習模式，祝學習順利😉')
  });
}

const tForm = document.getElementById("teacherLoginForm");
if (tForm) {
  tForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("tUser").value.trim();
    const p = document.getElementById("tPwd").value.trim();
    if (u === CONFIG.TEACHER.username && p === CONFIG.TEACHER.password) {
      setCurrentUser({ role: "teacher", name: "Teacher" });
      location.href = "teacher.html";
      alert('您已登入教師端，請於上方功能列選擇操作功能😊')
    } else {
      showMsg("教師帳號或密碼錯誤");
    }
  });
}
export function validateTeacherPassword(inputPwd) {
  return String(inputPwd || '') === TEACHER_CREDENTIALS.password;
}



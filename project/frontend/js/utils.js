// utils.js：通用工具

// 讀 JSON（加上 cache-busting）
export async function fetchJSON(path) {
  const url = `${path}?v=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`無法讀取：${path}`);
  return res.json();
}

// 陣列洗牌
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 格式化時間
export function fmt(dt = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

// 建 DOM 節點
export function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// 取得下一學年邏輯已由 storage.upgradeAllStudentsGrades 處理，這裡提供分頁工具與 escapeHtml
export function paginate(arr, page = 1, pageSize = 20) {
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * pageSize;
  return { items: arr.slice(start, start + pageSize), totalPages, page: p };
}

export function escapeHtml(s='') {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}



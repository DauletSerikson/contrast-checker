// ========== ЭЛЕМЕНТЫ ==========
const bg = document.getElementById("bg");
const fg = document.getElementById("fg");
const bgHex = document.getElementById("bgHex");
const fgHex = document.getElementById("fgHex");
const swapBtn = document.getElementById("swap");
const copyBtn = document.getElementById("copyLink");

const fontSize = document.getElementById("fontSize");
const fontWeight = document.getElementById("fontWeight");
const lineHeight = document.getElementById("lineHeight");
const fontSizeVal = document.getElementById("fontSizeVal");
const lineHeightVal = document.getElementById("lineHeightVal");

const preview = document.getElementById("preview");
const ratioEl = document.getElementById("ratio");
const aaNormal = document.getElementById("aaNormal");
const aaaNormal = document.getElementById("aaaNormal");
const aaLarge = document.getElementById("aaLarge");
const aaaLarge = document.getElementById("aaaLarge");

const historyEl = document.getElementById("history");
const toast = document.getElementById("toast");

// ========== УТИЛИТЫ ЦВЕТА ==========
function clamp01(x){ return Math.min(1, Math.max(0, x)); }

function hexToRgb(hex) {
  const h = hex.replace("#","").trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return {r,g,b};
  } else if (h.length === 6) {
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
  }
  return {r:0,g:0,b:0};
}

function relLuminance({r,g,b}) {
  // sRGB -> линейное
  const Rs = r/255, Gs = g/255, Bs = b/255;
  const toLin = s => (s <= 0.03928) ? (s/12.92) : Math.pow((s+0.055)/1.055, 2.4);
  const R = toLin(Rs), G = toLin(Gs), B = toLin(Bs);
  return 0.2126*R + 0.7152*G + 0.0722*B;
}

function contrastRatio(rgb1, rgb2) {
  const L1 = relLuminance(rgb1);
  const L2 = relLuminance(rgb2);
  const [light, dark] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

function normalizeHex(s) {
  let v = s.trim().toLowerCase();
  if (!v.startsWith("#")) v = "#" + v;
  if (v.length === 4 || v.length === 7) return v;
  return "#000000";
}

// ========== ИСТОРИЯ ==========
const HISTORY_KEY = "cc_history_v1";
function loadHistory(){ try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } }
function saveHistory(arr){ localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, 10))); }
function addHistory(bgVal, fgVal){
  const item = `${bgVal} on ${fgVal}`;
  const arr = loadHistory();
  if (!arr.includes(item)) arr.unshift(item);
  saveHistory(arr); renderHistory();
}
function renderHistory(){
  const arr = loadHistory();
  historyEl.innerHTML = "";
  arr.forEach(s => {
    const li = document.createElement("li");
    const [b, , f] = s.split(" ");
    li.innerHTML = `<span>${s}</span> <span style="display:inline-flex; gap:6px; align-items:center">
      <span class="dot" style="width:14px;height:14px;border-radius:50%;background:${b};border:1px solid #0003"></span>
      <span class="dot" style="width:14px;height:14px;border-radius:50%;background:${f};border:1px solid #0003"></span>
    </span>`;
    li.addEventListener("click", () => {
      bg.value = b; bgHex.value = b;
      fg.value = f; fgHex.value = f;
      updateAll();
    });
    historyEl.appendChild(li);
  });
}

// ========== КОПИРОВАНИЕ ССЫЛКИ ==========
function setUrlParams() {
  const url = new URL(location.href);
  url.searchParams.set("bg", bgHex.value);
  url.searchParams.set("fg", fgHex.value);
  url.searchParams.set("fs", fontSize.value);
  url.searchParams.set("fw", fontWeight.value);
  url.searchParams.set("lh", lineHeight.value);
  history.replaceState(null, "", url.toString());
  return url.toString();
}

async function copyLink() {
  const url = setUrlParams();
  copyBtn.disabled = true;
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } else {
      const ta = document.createElement("textarea");
      ta.value = url; ta.setAttribute("readonly", ""); ta.style.position="fixed"; ta.style.top="-9999px";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      showToast("Link copied");
    }
  } catch {
    prompt("Скопируй ссылку вручную:", url);
  } finally {
    copyBtn.disabled = false;
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1200);
}

// ========== ОБНОВЛЕНИЕ UI ==========
function setBadge(el, pass){
  el.classList.remove("pass","fail");
  el.classList.add(pass ? "pass" : "fail");
}

function updateAll() {
  // синхронизация hex<->color
  bgHex.value = normalizeHex(bgHex.value); fgHex.value = normalizeHex(fgHex.value);
  bg.value = bgHex.value; fg.value = fgHex.value;

  // применяем стили превью
  preview.style.background = bgHex.value;
  preview.style.color = fgHex.value;
  preview.style.setProperty("--btn-border", "#1f2937");
  preview.style.fontSize = fontSize.value + "px";
  preview.style.fontWeight = fontWeight.value;
  preview.style.lineHeight = lineHeight.value;

  fontSizeVal.textContent = fontSize.value;
  lineHeightVal.textContent = lineHeight.value;

  // считаем контраст
  const r = contrastRatio(hexToRgb(fgHex.value), hexToRgb(bgHex.value));
  ratioEl.textContent = r.toFixed(2) + ":1";

  // WCAG пороги:
  // AA normal >= 4.5, AAA normal >= 7.0
  // AA large >= 3.0,  AAA large >= 4.5
  setBadge(aaNormal, r >= 4.5);
  setBadge(aaaNormal, r >= 7.0);
  setBadge(aaLarge, r >= 3.0);
  setBadge(aaaLarge, r >= 4.5);

  addHistory(bgHex.value, fgHex.value);
}

function swapColors() {
  const b = bgHex.value; bgHex.value = fgHex.value; fgHex.value = b;
  updateAll();
}

function initFromUrl() {
  const url = new URL(location.href);
  const p = (k, d) => url.searchParams.get(k) || d;
  bgHex.value = normalizeHex(p("bg", bgHex.value));
  fgHex.value = normalizeHex(p("fg", fgHex.value));
  fontSize.value = p("fs", fontSize.value);
  fontWeight.value = p("fw", fontWeight.value);
  lineHeight.value = p("lh", lineHeight.value);

  // refl into color inputs
  bg.value = bgHex.value; fg.value = fgHex.value;
}

// ========== СЛУШАТЕЛИ ==========
[bg, fg].forEach(inp => inp.addEventListener("input", () => {
  const hexInput = inp === bg ? bgHex : fgHex;
  hexInput.value = inp.value;
  updateAll();
}));
[bgHex, fgHex].forEach(inp => inp.addEventListener("change", () => {
  inp.value = normalizeHex(inp.value);
  const colorInput = inp === bgHex ? bg : fg;
  colorInput.value = inp.value;
  updateAll();
}));

fontSize.addEventListener("input", updateAll);
fontWeight.addEventListener("change", updateAll);
lineHeight.addEventListener("input", updateAll);
swapBtn.addEventListener("click", swapColors);
copyBtn.addEventListener("click", copyLink);

// старт
renderHistory();
initFromUrl();
updateAll();

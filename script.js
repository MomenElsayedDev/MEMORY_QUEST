const POOL = [
  "🌌",
  "🛰️",
  "☄️",
  "🪐",
  "🔭",
  "👽",
  "🛸",
  "🚀",
  "🌑",
  "🌞",
  "🌍",
  "🌋",
  "🍄",
  "🐉",
  "💎",
  "🔥",
  "⚡",
  "🌈",
  "🦋",
  "🎯",
  "🦄",
  "🌺",
  "🐬",
  "🎪",
  "🎭",
];
const MAX_ERR = 3;
const LVL = {
  easy: { pairs: 2, grid: "g4", sm: 10, cm: 10 },
  medium: { pairs: 4, grid: "g4", sm: 20, cm: 20 },
  hard: { pairs: 6, grid: "g6", sm: 40, cm: 40 },
};
const ADEFS = [
  {
    id: "speed",
    ico: "⚡",
    col: "#22d3ee",
    glow: "rgba(34,211,238,.38)",
    nm: "Speed Demon",
    dc: "Win in <30s",
  },
  {
    id: "perfect",
    ico: "🎯",
    col: "#34d399",
    glow: "rgba(52,211,153,.38)",
    nm: "Perfect",
    dc: "0 mistakes",
  },
  {
    id: "combo",
    ico: "🔥",
    col: "#fb923c",
    glow: "rgba(251,146,60,.38)",
    nm: "Combo King",
    dc: "Reach ×4",
  },
  {
    id: "coins",
    ico: "💰",
    col: "#fbbf24",
    glow: "rgba(251,191,36,.38)",
    nm: "Collector",
    dc: "500 coins",
  },
  {
    id: "legend",
    ico: "🏆",
    col: "#c084fc",
    glow: "rgba(192,132,252,.38)",
    nm: "Legend",
    dc: "Beat HARD",
  },
];
const A = {
  menu: document.getElementById("bgm-menu"),
  game: document.getElementById("bgm-game"),
  over: document.getElementById("bgm-over"),
  flip: document.getElementById("sfx-flip"),
  match: document.getElementById("sfx-match"),
  wrong: document.getElementById("sfx-wrong"),
  win: document.getElementById("sfx-win"),
  btn: document.getElementById("sfx-btn"),
  ach: document.getElementById("sfx-ach"),
  coin: document.getElementById("sfx-coin"),
  heart: document.getElementById("sfx-heart"),
  combo: document.getElementById("sfx-combo"),
  err: document.getElementById("sfx-err"),
  hint: document.getElementById("sfx-hint"),
  score: document.getElementById("sfx-score"),
  tick: document.getElementById("sfx-tick"),
  logo: document.getElementById("sfx-logo"),
  lvl: document.getElementById("sfx-lvl"),
};
const G = {
  level: "easy",
  timer: 0,
  errors: 0,
  matches: 0,
  hints: 3,
  score: 0,
  coins: 0,
  combo: 1,
  comboCount: 0,
  isLocked: false,
  flipped: [],
  interval: null,
  totalPairs: 0,
  totalCoins: 0,
  bestScore: 0,
  achList: [],
};
let soundOn = true,
  isDayMode = false,
  menuPlayed = false;
(function () {
  const cv = document.getElementById("cvs"),
    ctx = cv.getContext("2d");
  let W,
    H,
    pts = [];
  const rsz = () => {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
  };
  window.addEventListener("resize", rsz);
  rsz();
  for (let i = 0; i < 200; i++)
    pts.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random(),
      da: (Math.random() * 0.004 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      hue: Math.floor(Math.random() * 360),
    });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p) => {
      p.a += p.da;
      if (p.a < 0 || p.a > 1) p.da *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},75%,80%,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
})();
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const board = $("gb");
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function snd(el, vol = 0.65) {
  if (!soundOn || !el) return;
  try {
    el.currentTime = 0;
    el.volume = Math.min(vol, 1);
    el.play().catch(() => {});
  } catch (e) {}
}
function stopBgm() {
  [A.menu, A.game, A.over].forEach((a) => {
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  });
}
function toggleSnd() {
  soundOn = !soundOn;
  $("sndbtn").querySelector(".ti").textContent = soundOn ? "🔊" : "🔇";
  $("snlbl").textContent = soundOn ? "SOUND" : "MUTE";
  if (!soundOn) Object.values(A).forEach((a) => a && a.pause && a.pause());
  else snd(A.btn);
}
function toggleTheme() {
  isDayMode = !isDayMode;
  document.body.classList.toggle("day", isDayMode);
  $("thico").textContent = isDayMode ? "🌙" : "☀️";
  $("thlbl").textContent = isDayMode ? "NIGHT" : "DAY";
  snd(A.btn);
}
const SCRS = ["ss", "gs", "ws", "gos"];
function show(id) {
  SCRS.forEach((s) => $(s).classList.toggle("off", s !== id));
  document.body.classList.toggle("scrollable", id === "gs");
}
function save() {
  localStorage.setItem("mq_c", G.totalCoins);
  localStorage.setItem("mq_b", G.bestScore);
  localStorage.setItem("mq_a", JSON.stringify(G.achList));
}
function load() {
  G.totalCoins = +localStorage.getItem("mq_c") || 0;
  G.bestScore = +localStorage.getItem("mq_b") || 0;
  G.achList = JSON.parse(localStorage.getItem("mq_a")) || [];
}
function unlock(id) {
  if (G.achList.includes(id)) return;
  G.achList.push(id);
  save();
  renderAch();
  const a = ADEFS.find((x) => x.id === id);
  toast("🏆 " + a.nm + " Unlocked!");
  snd(A.ach, 0.85);
}
function renderAch() {
  const ag = $("ag");
  ag.innerHTML = "";
  ADEFS.forEach((a) => {
    const on = G.achList.includes(a.id);
    const d = document.createElement("div");
    d.className = "achip" + (on ? " on" : "");
    d.id = "ach-" + a.id;
    d.style.setProperty("--ag", a.glow);
    if (on) d.style.borderColor = a.col;
    d.onclick = () => snd(A.ach);
    d.title = a.dc;
    d.innerHTML = `<span class="aico">${a.ico}</span><div><div class="aname" style="color:${a.col}">${a.nm}</div><div class="adesc">${a.dc}</div></div>`;
    ag.appendChild(d);
  });
  $("ma").textContent = G.achList.length + "/5";
}
function checkAch() {
  if (G.timer < 30) unlock("speed");
  if (G.errors === 0) unlock("perfect");
  if (G.combo >= 4) unlock("combo");
  if (G.totalCoins >= 500) unlock("coins");
  if (G.level === "hard") unlock("legend");
}
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("on"), 2700);
}
function setLvl(lvl, el) {
  G.level = lvl;
  snd(A.lvl);
  document.querySelectorAll(".lcard").forEach((c) => c.classList.remove("sel"));
  el.classList.add("sel");
}
function initGame() {
  snd(A.btn);
  stopBgm();
  setTimeout(() => snd(A.game, 0.2), 200);
  show("gs");
  resetState();
  buildBoard();
  startTimer();
}
function resetState() {
  clearInterval(G.interval);
  Object.assign(G, {
    timer: 0,
    errors: 0,
    matches: 0,
    hints: 3,
    score: 0,
    coins: 0,
    combo: 1,
    comboCount: 0,
    isLocked: false,
    flipped: [],
    totalPairs: LVL[G.level].pairs,
  });
  $("clk").textContent = "00:00";
  $("hsc").textContent = "0";
  $("hco").textContent = "0";
  $("hcb").textContent = "×1";
  $("hhi").textContent = "3";
  $("herr").textContent = "0";
  $("pf").style.width = "0%";
  $("hintbtn").disabled = false;
  updateHearts();
}
function updateHearts() {
  const rem = MAX_ERR - G.errors;
  $("hts").innerHTML = Array.from(
    { length: MAX_ERR },
    (_, i) =>
      `<span class="ht${i >= rem ? " lost" : ""}">${i < rem ? "❤️" : "🖤"}</span>`,
  ).join("");
}
function buildBoard() {
  const lvl = LVL[G.level];
  const vw = window.innerWidth;
  const isHard = G.level === "hard";
  const cols = isHard && vw > 480 ? 6 : 4;
  const maxW = Math.min(vw - 20, cols === 6 ? 720 : 600);
  const gap = vw < 360 ? 5 : vw < 481 ? 6 : 8;
  const cw = Math.floor((maxW - (cols - 1) * gap) / cols);
  const ch = Math.floor((cw * 4) / 3);
  board.className = cols === 6 ? "g6" : "g4";
  board.style.cssText = `width:${maxW}px;gap:${gap}px`;
  board.innerHTML = "";
  const emojis = POOL.slice(0, lvl.pairs);
  shuffle([...emojis, ...emojis]).forEach((sym) => {
    const c = document.createElement("div");
    c.className = "card";
    c.style.width = cw + "px";
    c.style.height = ch + "px";
    c.dataset.s = sym;
    c.innerHTML = `<div class="cface cbk">?</div><div class="cface cfr">${sym}</div>`;
    c.addEventListener("click", () => flip(c));
    board.appendChild(c);
  });
}
function flip(card) {
  if (
    G.isLocked ||
    card.classList.contains("flp") ||
    card.classList.contains("mat")
  )
    return;
  snd(A.flip, 0.5);
  card.classList.add("flp");
  G.flipped.push(card);
  if (G.flipped.length === 2) {
    G.isLocked = true;
    setTimeout(checkMatch, 430);
  }
}
function checkMatch() {
  const [a, b] = G.flipped;
  if (a.dataset.s === b.dataset.s) {
    snd(A.match, 0.75);
    a.classList.add("mat");
    b.classList.add("mat");
    G.matches++;
    G.comboCount++;
    G.combo = G.comboCount >= 2 ? Math.min(G.comboCount, 6) : 1;
    if (G.comboCount >= 2) {
      spawnCombo("×" + G.combo + " COMBO!", a);
      snd(A.combo, 0.7);
      if (G.combo >= 4) checkAch();
    }
    const L = LVL[G.level];
    const gained = L.sm * G.combo,
      gainedC = L.cm * G.combo;
    G.score += gained;
    G.coins += gainedC;
    G.totalCoins += gainedC;
    $("hsc").textContent = G.score;
    $("hsc").style.transform = "scale(1.25)";
    setTimeout(() => ($("hsc").style.transform = ""), 250);
    $("hco").textContent = G.coins;
    $("hcb").textContent = "×" + G.combo;
    $("pf").style.width = (G.matches / G.totalPairs) * 100 + "%";
    G.flipped = [];
    G.isLocked = false;
    if (G.matches === G.totalPairs) handleWin();
  } else {
    a.classList.add("wrg");
    b.classList.add("wrg");
    setTimeout(() => {
      snd(A.wrong, 0.6);
      a.classList.remove("flp", "wrg");
      b.classList.remove("flp", "wrg");
      G.errors++;
      G.comboCount = 0;
      G.combo = 1;
      $("herr").textContent = G.errors;
      $("hcb").textContent = "×1";
      snd(A.heart, 0.5);
      updateHearts();
      G.flipped = [];
      G.isLocked = false;
      if (G.errors >= MAX_ERR) handleGameOver();
    }, 660);
  }
}
function spawnCombo(text, ref) {
  const p = document.createElement("div");
  const r = ref.getBoundingClientRect();
  const hue = G.combo <= 2 ? 45 : G.combo <= 4 ? 25 : 5;
  p.style.cssText = `top:${r.top + scrollY - 10}px;left:${r.left + r.width / 2}px;transform:translateX(-50%);font-size:${0.82 + G.combo * 0.13}rem;color:hsl(${hue},100%,62%)`;
  p.className = "cpop";
  p.textContent = text;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1050);
}
function useHint() {
  if (G.hints <= 0 || G.isLocked) return;
  snd(A.hint, 0.65);
  G.hints--;
  G.isLocked = true;
  $("hhi").textContent = G.hints;
  const cards = board.querySelectorAll(".card:not(.mat)");
  cards.forEach((c) => c.classList.add("flp"));
  setTimeout(() => {
    cards.forEach((c) => {
      if (!G.flipped.includes(c)) c.classList.remove("flp");
    });
    G.isLocked = false;
    if (!G.hints) $("hintbtn").disabled = true;
  }, 1350);
}
function startTimer() {
  G.interval = setInterval(() => {
    G.timer++;
    $("clk").textContent =
      pad(Math.floor(G.timer / 60)) + ":" + pad(G.timer % 60);
    if (G.timer % 10 === 0) snd(A.tick, 0.18);
  }, 1000);
}
function handleWin() {
  clearInterval(G.interval);
  stopBgm();
  snd(A.win, 0.85);
  if (G.score > G.bestScore) G.bestScore = G.score;
  checkAch();
  G.totalCoins += G.coins;
  save();
  const acc =
    G.totalPairs + G.errors
      ? Math.round((G.totalPairs / (G.totalPairs + G.errors)) * 100)
      : 100;
  $("wsc").textContent = "⭐ " + G.score;
  $("wst").innerHTML = mkRows([
    { i: "🎮", l: "Level", v: G.level.toUpperCase(), c: "pu" },
    { i: "⏱️", l: "Time", v: $("clk").textContent, c: "" },
    { i: "❌", l: "Errors", v: G.errors + " / " + MAX_ERR, c: "re" },
    { i: "🎯", l: "Accuracy", v: acc + "%", c: "gr" },
    { i: "💰", l: "Coins", v: "💰 " + G.coins, c: "go" },
    { i: "🔥", l: "Combo", v: "×" + G.combo, c: "go" },
  ]);
  $("wach").textContent = G.achList.length
    ? "🏆 " +
      G.achList
        .map((id) => {
          const a = ADEFS.find((x) => x.id === id);
          return a ? a.ico + " " + a.nm : "";
        })
        .join(" · ")
    : "";
  show("ws");
  playWin();
}
function handleGameOver() {
  clearInterval(G.interval);
  stopBgm();
  setTimeout(() => snd(A.over, 0.3), 300);
  G.totalCoins += G.coins;
  save();
  $("gst").innerHTML = mkRows([
    { i: "🎮", l: "Level", v: G.level.toUpperCase(), c: "pu" },
    { i: "⏱️", l: "Survived", v: $("clk").textContent, c: "" },
    {
      i: "✅",
      l: "Pairs Found",
      v: G.matches + " / " + G.totalPairs,
      c: "gr",
    },
    { i: "💰", l: "Coins", v: "💰 " + G.coins, c: "go" },
    { i: "❌", l: "Mistakes", v: "3 / 3 — FAILED", c: "re" },
  ]);
  show("gos");
}
function mkRows(arr) {
  return arr
    .map(
      (r) =>
        `<div class="srow"><span class="slb">${r.i} ${r.l}</span><span class="svl ${r.c}">${r.v}</span></div>`,
    )
    .join("");
}
function toMenu() {
  snd(A.btn);
  stopBgm();
  clearInterval(G.interval);
  load();
  updateMeta();
  renderAch();
  show("ss");
  setTimeout(() => snd(A.menu, 0.17), 300);
}
function replay() {
  snd(A.btn);
  initGame();
}
function doQuit() {
  if (confirm("Quit mission and return to menu?")) toMenu();
}
function updateMeta() {
  $("mc").textContent = G.totalCoins;
  $("mb").textContent = G.bestScore;
  $("ma").textContent = G.achList.length + "/5";
}
function playWin() {
  A.win.play();
  const congrats = new Audio("sounds/congratulations.mp3");
  congrats.volume = 0.8;
  congrats.play();
  showToast("🎉 Congratulations!");
}
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("on");
  setTimeout(() => toast.classList.remove("on"), 3000);
}
window.addEventListener("resize", () => {
  clearTimeout(rT);
  rT = setTimeout(() => {
    $("gs").classList.contains("off") || buildBoard();
  }, 240);
})(function boot() {
  load();
  updateMeta();
  renderAch();
  document.addEventListener(
    "click",
    function once() {
      if (!$("ss").classList.contains("off")) snd(A.menu, 0.17);
      document.removeEventListener("click", once);
    },
    { once: true },
  );
})();
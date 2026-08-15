/* ============================================================
   script.js – 8 two-player browser games with AI & Achievements
   ============================================================ */

// ── Master Volume & Audio Control ──────────────────────────────
let masterVolume = 0.8;
let activeGame = "";
let soundEnabled = true;
let lastPongTime = 0;
let lastAhTime = 0;
const fpsInterval = 1000 / 60;

// Single Player & Tournament State
let isSinglePlayer = false;
let globalScores = JSON.parse(localStorage.getItem("gamehub_scores")) || [0, 0];

window.filterGames = function (query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll(".game-card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? "flex" : "none";
  });
};

window.changeMasterVolume = function (val) {
  masterVolume = parseFloat(val) / 100;
  const icon = document.getElementById("vol-icon");
  if (icon) {
    icon.textContent = masterVolume === 0 ? "🔇" : masterVolume < 0.5 ? "🔉" : "🔊";
  }
};

// ── CPU AI Difficulty Level Manager ────────────────────────────
let aiDifficulty = "medium"; // 'easy', 'medium', 'hard'

window.setDifficulty = function (val) {
  aiDifficulty = val;
  synth.play("click");
  document.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.diff === val);
  });
  const diffNames = { easy: "Easy", medium: "Medium", hard: "Master 👑" };
  showToast(`🎯 CPU Level set to: ${diffNames[val] || val}`);
};
window.changeAIDifficulty = window.setDifficulty;

// ── Player Profiles System ─────────────────────────────────────
let editingProfileIdx = 1;
let profiles = JSON.parse(localStorage.getItem("gamehub_profiles")) || {
  1: { name: "Player 1", avatar: "👾" },
  2: { name: "Player 2", avatar: "🤖" },
};

// Migrate legacy Polish names saved in browser's localStorage
if (profiles[1] && profiles[1].name.toLowerCase().includes("gracz")) {
  profiles[1].name = "Player 1";
}
if (profiles[2] && profiles[2].name.toLowerCase().includes("gracz")) {
  profiles[2].name = "Player 2";
}
localStorage.setItem("gamehub_profiles", JSON.stringify(profiles));

function saveProfiles() {
  localStorage.setItem("gamehub_profiles", JSON.stringify(profiles));
  updateProfilesUI();
}

function updateProfilesUI() {
  const p1Name = document.getElementById("p1-name-display");
  const p1Av = document.getElementById("p1-avatar-display");
  const p2Name = document.getElementById("p2-name-display");
  const p2Av = document.getElementById("p2-avatar-display");

  if (p1Name) p1Name.textContent = profiles[1].name;
  if (p1Av) p1Av.textContent = profiles[1].avatar;
  if (p2Name) p2Name.textContent = isSinglePlayer ? "CPU Bot" : profiles[2].name;
  if (p2Av) p2Av.textContent = isSinglePlayer ? "🤖" : profiles[2].avatar;
}

window.openProfileModal = function (pIdx) {
  synth.play("click");
  editingProfileIdx = pIdx;
  const modal = document.getElementById("profile-modal");
  const title = document.getElementById("profile-modal-title");
  const input = document.getElementById("profile-name-input");

  if (title) title.textContent = `Edit Player ${pIdx} Profile`;
  if (input) input.value = profiles[pIdx].name;

  document.querySelectorAll(".avatar-opt").forEach((btn) => {
    btn.classList.toggle("selected", btn.textContent === profiles[pIdx].avatar);
  });

  if (modal) {
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("active"), 10);
  }
};

window.selectAvatar = function (emoji) {
  synth.play("click");
  profiles[editingProfileIdx].avatar = emoji;
  document.querySelectorAll(".avatar-opt").forEach((btn) => {
    btn.classList.toggle("selected", btn.textContent === emoji);
  });
};

window.saveProfileEdit = function () {
  synth.play("click");
  const input = document.getElementById("profile-name-input");
  if (input && input.value.trim().length > 0) {
    profiles[editingProfileIdx].name = input.value.trim().substring(0, 12);
  }
  saveProfiles();
  hideProfileModal();
  showToast(`✅ Player ${editingProfileIdx} profile saved!`);
};

window.hideProfileModal = function () {
  synth.play("click");
  const modal = document.getElementById("profile-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => (modal.style.display = "none"), 250);
  }
};

// ── Achievements System ────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: "first_win", name: "🏆 First Victory", desc: "Win any game in GameHub." },
  { id: "master_bot", name: "🤖 Master Duelist", desc: "Defeat the CPU on Master level." },
  { id: "pong_speed", name: "⚡ Lightning Fast", desc: "Score a point with speed boost active in Pong." },
  { id: "snake_king", name: "🍎 Snake Ruler", desc: "Score 15+ points in Snake." },
  { id: "sea_wolf", name: "⚓ Sea Wolf", desc: "Sink an enemy ship in Battleship." },
  { id: "checkers_king", name: "👑 Royal Crown", desc: "Promote a piece to King in Checkers." },
  { id: "hockey_pro", name: "🏒 Rink Champion", desc: "Score 5 points in Air Hockey." },
  { id: "memo_pair", name: "🃏 Eagle Eye", desc: "Find 3 pairs in a row in Memo." },
];

let unlockedAchievements = JSON.parse(localStorage.getItem("gamehub_achievements")) || [];

function unlockAchievement(id) {
  if (!unlockedAchievements.includes(id)) {
    unlockedAchievements.push(id);
    localStorage.setItem("gamehub_achievements", JSON.stringify(unlockedAchievements));
    updateAchievementsUI();
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    if (ach) {
      synth.play("win");
      launchConfetti();
      showToast(`🏆 Achievement Unlocked: ${ach.name}!`);
    }
  }
}

function updateAchievementsUI() {
  const badgeCount = document.getElementById("achievements-badge-count");
  if (badgeCount) {
    badgeCount.textContent = `${unlockedAchievements.length}/${ACHIEVEMENTS.length}`;
  }
}

window.showAchievementsModal = function () {
  synth.play("click");
  const modal = document.getElementById("achievements-modal");
  const grid = document.getElementById("achievements-grid");
  if (!modal || !grid) return;

  grid.innerHTML = ACHIEVEMENTS.map((ach) => {
    const isUnlocked = unlockedAchievements.includes(ach.id);
    return `
      <div class="achievement-card ${isUnlocked ? "unlocked" : ""}">
        <div class="ach-icon">${isUnlocked ? "🏆" : "🔒"}</div>
        <div class="ach-info">
          <h4>${ach.name}</h4>
          <p>${ach.desc}</p>
        </div>
      </div>
    `;
  }).join("");

  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("active"), 10);
};

window.hideAchievementsModal = function () {
  synth.play("click");
  const modal = document.getElementById("achievements-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => (modal.style.display = "none"), 250);
  }
};

// ── Cyber Particle Canvas Background ───────────────────────────
function initCyberParticles() {
  const canvas = document.getElementById("cyber-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.2,
  }));

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124, 58, 237, ${p.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#06b6d4";
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

function updateGlobalScoresUI() {
  const el1 = document.getElementById("global-s1");
  const el2 = document.getElementById("global-s2");
  if (el1) el1.textContent = globalScores[0];
  if (el2) el2.textContent = globalScores[1];
}

function addGlobalScore(playerIdx) {
  if (playerIdx === 0 || playerIdx === 1) {
    globalScores[playerIdx]++;
    localStorage.setItem("gamehub_scores", JSON.stringify(globalScores));
    updateGlobalScoresUI();
    unlockAchievement("first_win");
    if (playerIdx === 0 && isSinglePlayer && aiDifficulty === "hard") {
      unlockAchievement("master_bot");
    }
  }
}

function resetGlobalScores() {
  globalScores = [0, 0];
  localStorage.setItem("gamehub_scores", JSON.stringify(globalScores));
  updateGlobalScoresUI();
  synth.play("score");
  showToast("🏆 Tournament scores have been reset!");
}

function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function updateAIToggleUI() {
  const toggle = document.getElementById("ai-toggle");
  const diffPicker = document.querySelector(".custom-diff-picker");
  if (toggle) {
    isSinglePlayer = toggle.checked;
    if (diffPicker) {
      if (isSinglePlayer) {
        diffPicker.classList.remove("hidden-diff");
      } else {
        diffPicker.classList.add("hidden-diff");
      }
    }
    updateProfilesUI();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateGlobalScoresUI();
  updateProfilesUI();
  updateAchievementsUI();
  updateAIToggleUI();
  initCyberParticles();
  const unlockAudio = () => {
    synth.init();
    if (synth.ctx && synth.ctx.state === "suspended") synth.ctx.resume();
  };
  window.addEventListener("click", unlockAudio, { once: true });
  window.addEventListener("touchstart", unlockAudio, { once: true });
});

function triggerShake(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

const synth = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  play(type) {
    if (!soundEnabled) return;
    try {
      this.init();
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      const now = this.ctx.currentTime;
      const vol = masterVolume;

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.08 * vol, now);
        gain.gain.linearRampToValueAtTime(0.01 * vol, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "hit") {
        const pitchVar = (Math.random() - 0.5) * 40;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150 + pitchVar, now);
        osc.frequency.exponentialRampToValueAtTime(320 + pitchVar, now + 0.12);
        gain.gain.setValueAtTime(0.12 * vol, now);
        gain.gain.linearRampToValueAtTime(0.01 * vol, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "score") {
        const pitchVar = (Math.random() - 0.5) * 100;
        osc.type = "sine";
        osc.frequency.setValueAtTime(450 + pitchVar, now);
        osc.frequency.setValueAtTime(670 + pitchVar, now + 0.08);
        osc.frequency.setValueAtTime(900 + pitchVar, now + 0.16);
        gain.gain.setValueAtTime(0.08 * vol, now);
        gain.gain.linearRampToValueAtTime(0.01 * vol, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "win") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(261.63, now);
        osc.frequency.setValueAtTime(329.63, now + 0.1);
        osc.frequency.setValueAtTime(392.0, now + 0.2);
        osc.frequency.setValueAtTime(523.25, now + 0.3);
        gain.gain.setValueAtTime(0.06 * vol, now);
        gain.gain.linearRampToValueAtTime(0.01 * vol, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === "draw" || type === "lose") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.45);
        gain.gain.setValueAtTime(0.08 * vol, now);
        gain.gain.linearRampToValueAtTime(0.01 * vol, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === "countdown_beep") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);
        gain.gain.setValueAtTime(0.15 * vol, now);
        gain.gain.linearRampToValueAtTime(0.01 * vol, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "countdown_go") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        osc.frequency.setValueAtTime(1046.5, now + 0.24);
        gain.gain.setValueAtTime(0.2 * vol, now);
        gain.gain.linearRampToValueAtTime(0.01 * vol, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn("AudioContext blocked or failed", e);
    }
  },
};

// ── Countdown System ─────────────────────────────────────────
let isCountdownRunning = false;

window.startCountdown = function (onComplete) {
  if (isCountdownRunning) return;
  isCountdownRunning = true;

  const overlay = document.getElementById("countdown-overlay");
  const numEl = document.getElementById("cd-number");
  const subtextEl = document.getElementById("cd-subtext");
  const p1Av = document.getElementById("cd-p1-avatar");
  const p1Name = document.getElementById("cd-p1-name");
  const p2Av = document.getElementById("cd-p2-avatar");
  const p2Name = document.getElementById("cd-p2-name");

  if (p1Av && p1Name) {
    p1Av.textContent = profiles[1]?.avatar || "👾";
    p1Name.textContent = profiles[1]?.name || "Player 1";
  }
  if (p2Av && p2Name) {
    p2Av.textContent = isSinglePlayer ? "🤖" : (profiles[2]?.avatar || "🤖");
    p2Name.textContent = isSinglePlayer ? "CPU Bot" : (profiles[2]?.name || "Player 2");
  }

  if (overlay) {
    overlay.classList.remove("hidden");
    requestAnimationFrame(() => overlay.classList.add("active"));
  }

  const steps = [
    { text: "3", sub: "GET READY!", sound: "countdown_beep", isGo: false },
    { text: "2", sub: "PLAYERS READY...", sound: "countdown_beep", isGo: false },
    { text: "1", sub: "ON YOUR MARK...", sound: "countdown_beep", isGo: false },
    { text: "START!", sub: "FIGHT FOR VICTORY! 🔥", sound: "countdown_go", isGo: true },
  ];

  let stepIdx = 0;

  function runStep() {
    if (stepIdx >= steps.length) {
      if (overlay) {
        overlay.classList.remove("active");
        setTimeout(() => overlay.classList.add("hidden"), 200);
      }
      isCountdownRunning = false;
      if (typeof onComplete === "function") onComplete();
      return;
    }

    const cur = steps[stepIdx];
    if (subtextEl) subtextEl.textContent = cur.sub;
    if (numEl) {
      numEl.textContent = cur.text;
      numEl.className = "countdown-number " + (cur.isGo ? "go-pop" : "pop");
    }

    synth.play(cur.sound);

    const duration = cur.isGo ? 450 : 700;
    stepIdx++;
    setTimeout(runStep, duration);
  }

  runStep();
};

// ── Confetti ─────────────────────────────────────────────────
function launchConfetti() {
  const c = document.getElementById("confetti-container");
  c.innerHTML = "";
  const colors = [
    "#7c3aed",
    "#06b6d4",
    "#f59e0b",
    "#ef4444",
    "#4ade80",
    "#f472b6",
    "#a78bfa",
  ];
  for (let i = 0; i < 100; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};width:${5 + Math.random() * 10}px;height:${5 + Math.random() * 10}px;border-radius:${Math.random() > 0.5 ? "50%" : "3px"};animation-delay:${Math.random() * 0.8}s;animation-duration:${1.5 + Math.random() * 2}s;`;
    c.appendChild(p);
  }
  setTimeout(() => (c.innerHTML = ""), 5000);
}

// ── Navigation & Control Panel ───────────────────────────────
function launchGame(name) {
  pongStop();
  snakeStop();
  ahStop();
  const current = document.querySelector(".screen.active");
  if (current) {
    current.classList.add("fade-out");
    setTimeout(() => {
      current.classList.remove("active", "fade-out");
      document.getElementById(name + "-screen").classList.add("active");
    }, 280);
  } else {
    document.getElementById(name + "-screen").classList.add("active");
  }

  activeGame = name;

  if (name === "tictactoe") tttInit();
  if (name === "pong") pongInit();
  if (name === "connect4") c4Init();
  if (name === "snake") snakeInit();
  if (name === "battleship") bsInit();
  if (name === "checkers") chkInit();
  if (name === "airhockey") ahInit();
  if (name === "memo") memoInit();
}

function goBack() {
  synth.play("click");
  const current = document.querySelector(".screen.active");
  if (current) {
    current.classList.add("fade-out");
    setTimeout(() => {
      current.classList.remove("active", "fade-out");
      document.getElementById("menu-screen").classList.add("active");
    }, 280);
  } else {
    document.getElementById("menu-screen").classList.add("active");
  }
  pongStop();
  snakeStop();
  ahStop();
  activeGame = "";
}

function quickSwitchGame(name) {
  if (!name) return;
  synth.play("click");
  launchGame(name);
}

function restartCurrentGame() {
  synth.play("click");
  if (activeGame === "tictactoe") tttReset();
  if (activeGame === "pong") pongInit();
  if (activeGame === "connect4") c4Reset();
  if (activeGame === "snake") snakeInit();
  if (activeGame === "battleship") bsReset();
  if (activeGame === "checkers") chkReset();
  if (activeGame === "airhockey") ahInit();
  if (activeGame === "memo") memoReset();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.querySelectorAll(".sound-toggle").forEach((btn) => {
    btn.textContent = soundEnabled ? "🔊" : "🔇";
    btn.title = soundEnabled ? "Sound: On" : "Sound: Muted";
  });
  synth.play("click");
}

function toggleAI() {
  updateAIToggleUI();
  showToast(
    isSinglePlayer
      ? "🤖 1 Player Mode enabled!"
      : "👥 2 Player Mode enabled!",
  );
  synth.play("click");
  restartCurrentGame();
}

function toggleFullscreen() {
  synth.play("click");
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

const keyStateMap = {};
function triggerKey(key) {
  keyStateMap[key] = true;
  if (activeGame === "snake") snakeKey({ key, preventDefault: () => {} });
  if (activeGame === "pong") pongKey({ key, preventDefault: () => {} });
  if (activeGame === "airhockey") ahKey({ key, preventDefault: () => {} });
}
function releaseKey(key) {
  keyStateMap[key] = false;
  if (activeGame === "snake") {
    if (snakeState && snakeState.s1) snakeState.s1.inputLocked = false;
    if (snakeState && snakeState.s2) snakeState.s2.inputLocked = false;
  }
  if (activeGame === "pong") pongKeyUp({ key, preventDefault: () => {} });
  if (activeGame === "airhockey") ahKeyUp({ key, preventDefault: () => {} });
}

function setupTouchZones() {
  const setupZone = (id, pId, gameObj) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const st = gameObj === "pongState" ? pongState : ahState;
        if (!st || !st.running) return;
        const touch = e.targetTouches[0];
        if (!touch) return;
        const canvas = document.getElementById(
          gameObj === "pongState" ? "pong-canvas" : "ah-canvas",
        );
        const rect = canvas.getBoundingClientRect();
        const scaleY = canvas.height / rect.height;
        const y = (touch.clientY - rect.top) * scaleY;
        const scaleX = canvas.width / rect.width;
        const x = (touch.clientX - rect.left) * scaleX;

        if (gameObj === "pongState") {
          const p = pId === 1 ? st.p1 : st.p2;
          p.y = Math.min(Math.max(0, y - p.padH / 2), st.H - p.padH);
        } else if (gameObj === "ahState") {
          const m = pId === 1 ? st.m1 : st.m2;
          m.y = Math.min(Math.max(m.r, y), st.H - m.r);
          if (pId === 1) {
            m.x = Math.min(Math.max(m.r, x), st.W / 2 - m.r);
          } else {
            m.x = Math.min(Math.max(st.W / 2 + m.r, x), st.W - m.r);
          }
        }
      },
      { passive: false },
    );
  };
  setupZone("pong-zone-1", 1, "pongState");
  setupZone("pong-zone-2", 2, "pongState");
  setupZone("ah-zone-1", 1, "ahState");
  setupZone("ah-zone-2", 2, "ahState");
}
document.addEventListener("DOMContentLoaded", setupTouchZones);

let currentTutorialGame = "tictactoe";
let currentTutorialTab = "rules";

const TUTORIAL_DATA = {
  tictactoe: {
    title: "⭕ Tic-Tac-Toe",
    rules: `
      <p><b>Tic-Tac-Toe</b> is a classic duel of wits on a 3x3 grid.</p>
      <ul>
        <li>Players take turns placing their marks (<b>Player 1: X</b>, <b>Player 2 / CPU: O</b>).</li>
        <li>The first player to align <b>3 of their marks</b> horizontally, vertically, or diagonally wins.</li>
        <li>If all 9 cells are filled with no line formed, the match ends in a <b>Draw</b>.</li>
      </ul>
    `,
    controls: `
      <p><b>Mouse / Touchscreen:</b></p>
      <ul>
        <li>Click or tap any empty cell on the 3x3 board.</li>
      </ul>
      <p><b>1 Player Mode:</b> Toggle <code>1 Player (CPU)</code> in the top navigation to play against the bot!</p>
    `,
    tips: `
      <ul>
        <li>💡 <b>Claim the center:</b> The center cell participates in 4 winning lines!</li>
        <li>💡 <b>Target corners:</b> Corners allow creating double-threat setups (forks).</li>
        <li>💡 <b>Defense:</b> If opponent has 2 marks in a line, block the third cell immediately.</li>
      </ul>
    `
  },
  pong: {
    title: "🏓 Pong ⚡",
    rules: `
      <p><b>Pong ⚡</b> is an arcade classic with fast physics and unique power-ups.</p>
      <ul>
        <li>Bounce the ball with your paddle. Score a point whenever the opponent misses.</li>
        <li>First player to score <b>7 points</b> wins the match.</li>
        <li>Special power-up items spawn in the arena:
          <ul>
            <li>⚡ <b>Speed Bolt</b> – speeds up ball movement.</li>
            <li>🔷 <b>Blue Diamond</b> – extends your paddle length.</li>
            <li>💊 <b>Pill</b> – shrinks opponent's paddle.</li>
          </ul>
        </li>
      </ul>
    `,
    controls: `
      <ul>
        <li><b>🟦 Player 1 (Left):</b> <kbd>W</kbd> (Up) / <kbd>S</kbd> (Down) or left touch zone.</li>
        <li><b>🟥 Player 2 (Right):</b> <kbd>↑</kbd> (Up) / <kbd>↓</kbd> (Down) or right touch zone.</li>
      </ul>
    `,
    tips: `
      <ul>
        <li>💡 <b>Hit on the move:</b> Moving the paddle at the moment of impact adds extra spin and speed to the ball.</li>
        <li>💡 <b>Catch Power-ups:</b> Hit blue diamonds 🔷 to make defense easier!</li>
      </ul>
    `
  },
  connect4: {
    title: "🔴 Connect 4",
    rules: `
      <p><b>Connect 4</b> is a tactical gravity grid strategy game.</p>
      <ul>
        <li>Players take turns dropping colored chips into 7 columns (<b>🔴 Player 1</b>, <b>🔵 Player 2 / CPU</b>).</li>
        <li>The chip falls to the lowest available space within the column.</li>
        <li>First to connect <b>4 chips of their color in a row</b> (horizontally, vertically, or diagonally) wins!</li>
      </ul>
    `,
    controls: `
      <ul>
        <li><b>Mouse / Touch:</b> Click any column or top drop button to insert a chip.</li>
      </ul>
    `,
    tips: `
      <ul>
        <li>💡 <b>Control the Center:</b> The middle column provides the highest number of potential 4-in-a-row lines.</li>
        <li>💡 <b>Double Threat:</b> Set up a position with 2 open winning moves simultaneously!</li>
      </ul>
    `
  },
  snake: {
    title: "🐍 Snake (2-Player Arena)",
    rules: `
      <p><b>2-Player Snake</b> is a fast-paced battle on a shared arena grid.</p>
      <ul>
        <li>Colliding with walls, your own body, or your opponent's body causes elimination.</li>
        <li>Collect items spawning on the grid:
          <ul>
            <li>🍎 <b>Apple:</b> +1 Point & snake growth.</li>
            <li>⭐ <b>Star:</b> +3 Points.</li>
            <li>⚡ <b>Speed Bolt:</b> Temporary turbo boost.</li>
            <li>🛡 <b>Shield:</b> Invincibility for 5 seconds.</li>
          </ul>
        </li>
      </ul>
    `,
    controls: `
      <ul>
        <li><b>🟢 Player 1 (Green):</b> <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or left D-Pad.</li>
        <li><b>🟣 Player 2 (Purple):</b> <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> or right D-Pad.</li>
      </ul>
    `,
    tips: `
      <ul>
        <li>💡 <b>Trap Opponents:</b> Use turbo boost ⚡ to cut off your opponent's escape path!</li>
        <li>💡 <b>Shield Safety:</b> With active shield 🛡, you can pass through the enemy snake body unharmed.</li>
      </ul>
    `
  },
  battleship: {
    title: "⚓ Battleship",
    rules: `
      <p><b>Battleship</b> is a classic naval warfare game with hidden grids.</p>
      <ul>
        <li><b>Deployment Phase:</b> Position 5 warships on your grid. Ships cannot overlap or touch!</li>
        <li><b>Battle Phase:</b> Take turns firing at the opponent's hidden grid.</li>
        <li>A Hit (💥) awards an <b>extra shot</b>! A Miss (💧) passes the turn to your rival.</li>
        <li>First player to sink all 5 enemy ships wins.</li>
      </ul>
    `,
    controls: `
      <ul>
        <li><b>Deployment:</b> Click grid cells to place ships. Click <b>↔ Horizontal</b> to toggle orientation. Click <b>🎲 Random</b> to auto-place.</li>
        <li><b>Firing:</b> Click any unshot cell on the enemy target grid.</li>
      </ul>
    `,
    tips: `
      <ul>
        <li>💡 <b>Checkerboard Pattern:</b> Fire at 2-cell intervals to locate large ships quickly!</li>
        <li>💡 <b>Target Surroundings:</b> After a hit, test all 4 adjacent cells (Up, Down, Left, Right).</li>
      </ul>
    `
  },
  checkers: {
    title: "♟️ Checkers",
    rules: `
      <p><b>Checkers</b> is a classic board game played on dark squares of an 8x8 grid.</p>
      <ul>
        <li>Pieces move diagonally forward 1 step onto dark cells.</li>
        <li><b>Jumping is mandatory!</b> Jump over enemy pieces to capture them.</li>
        <li>Reaching the enemy baseline promotes your piece to a <b>King ♛</b>, which moves forward and backward.</li>
        <li>First player to eliminate all opponent pieces wins.</li>
      </ul>
    `,
    controls: `
      <ul>
        <li><b>Mouse / Touch:</b> Click your piece, then click a highlighted destination cell.</li>
      </ul>
    `,
    tips: `
      <ul>
        <li>💡 <b>Multi-Jumps:</b> After a jump, always check for consecutive jump opportunities!</li>
        <li>💡 <b>Promote Kings:</b> Push pieces towards the back row to create Kings early.</li>
      </ul>
    `
  },
  airhockey: {
    title: "🏒 Air Hockey",
    rules: `
      <p><b>Air Hockey</b> is a fast high-tempo puck battle on an ice rink.</p>
      <ul>
        <li>Strike the puck with your mallet to score goals into the opponent's net.</li>
        <li>First player to score <b>7 goals</b> wins the match.</li>
      </ul>
    `,
    controls: `
      <ul>
        <li><b>🔵 Player 1 (Blue):</b> <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or drag left side.</li>
        <li><b>🔴 Player 2 (Red):</b> <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> or drag right side.</li>
      </ul>
    `,
    tips: `
      <ul>
        <li>💡 <b>Snap Shot:</b> Flicking your mallet forward right at impact launches the puck at high velocity!</li>
      </ul>
    `
  },
  memo: {
    title: "🃏 Memo (Emoji Memory)",
    rules: `
      <p><b>Memo</b> tests visual memory and concentration.</p>
      <ul>
        <li>Flip 2 cards per turn. Finding a matching pair awards +1 point and an <b>extra turn</b>.</li>
        <li>Player with the most pairs after all cards are cleared wins the game.</li>
      </ul>
    `,
    controls: `
      <ul>
        <li><b>Mouse / Touch:</b> Click any face-down card to reveal it.</li>
      </ul>
    `,
    tips: `
      <ul>
        <li>💡 <b>Track Revealed Cards:</b> Pay close attention during your opponent's turn to memorize card locations!</li>
      </ul>
    `
  }
};

window.showRules = function(gameKey) {
  synth.play("click");
  const modal = document.getElementById("rules-modal");
  if (!modal) return;

  if (gameKey && TUTORIAL_DATA[gameKey]) {
    currentTutorialGame = gameKey;
  } else if (activeGame && TUTORIAL_DATA[activeGame]) {
    currentTutorialGame = activeGame;
  } else {
    currentTutorialGame = "tictactoe";
  }

  const selector = document.getElementById("tutorial-game-select");
  if (selector) selector.value = currentTutorialGame;

  renderTutorialContent();

  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("active"), 10);
};

window.switchTutorialTab = function(tabName) {
  synth.play("click");
  currentTutorialTab = tabName;
  renderTutorialContent();
};

function renderTutorialContent() {
  const data = TUTORIAL_DATA[currentTutorialGame] || TUTORIAL_DATA["tictactoe"];
  const title = document.getElementById("modal-game-title");
  if (title) title.textContent = `Tutorial: ${data.title}`;

  const tabs = ["rules", "controls", "tips"];
  tabs.forEach((t) => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const pane = document.getElementById(`tab-pane-${t}`);
    if (btn) btn.classList.toggle("active", t === currentTutorialTab);
    if (pane) {
      pane.classList.toggle("hidden", t !== currentTutorialTab);
      if (t === currentTutorialTab) {
        pane.innerHTML = data[t] || "<p>No data available.</p>";
      }
    }
  });
}

window.hideRules = function() {
  synth.play("click");
  const modal = document.getElementById("rules-modal");
  if (!modal) return;
  modal.classList.remove("active");
  setTimeout(() => (modal.style.display = "none"), 250);
};

/* ====================================================================
   1. TIC-TAC-TOE
   ==================================================================== */
let tttBoard,
  tttCurrent,
  tttScores = [0, 0, 0],
  tttOver;
const TTT_WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function tttInit() {
  tttBoard = Array(9).fill(null);
  tttCurrent = "X";
  tttOver = false;
  updateTTTStatus();
  renderTTTBoard();
  document.getElementById("ttt-s1").textContent = tttScores[0];
  document.getElementById("ttt-sd").textContent = tttScores[1];
  document.getElementById("ttt-s2").textContent = tttScores[2];
}
function renderTTTBoard(winCells = []) {
  const el = document.getElementById("ttt-board");
  el.innerHTML = "";
  tttBoard.forEach((val, i) => {
    const cell = document.createElement("div");
    cell.className =
      "ttt-cell" +
      (val ? " taken " + val.toLowerCase() : "") +
      (winCells.includes(i) ? " win" : "");
    cell.textContent = val || "";
    if (!val && !tttOver) {
      cell.onclick = () => {
        if (isSinglePlayer && tttCurrent === "O") return;
        synth.play("click");
        tttPlay(i);
      };
    }
    el.appendChild(cell);
  });
  document
    .getElementById("ttt-p1")
    .classList.toggle("active", tttCurrent === "X" && !tttOver);
  document
    .getElementById("ttt-p2")
    .classList.toggle("active", tttCurrent === "O" && !tttOver);
}
function tttPlay(i) {
  if (tttBoard[i] || tttOver) return;
  tttBoard[i] = tttCurrent;
  const w = TTT_WINS.find((combo) =>
    combo.every((c) => tttBoard[c] === tttCurrent),
  );
  if (w) {
    tttOver = true;
    const idx = tttCurrent === "X" ? 0 : 2;
    tttScores[idx]++;
    addGlobalScore(idx === 0 ? 0 : 1);
    document.getElementById(
      tttCurrent === "X" ? "ttt-s1" : "ttt-s2",
    ).textContent = tttScores[idx];
    document.getElementById("ttt-status").textContent =
      `🏆 Player ${tttCurrent === "X" ? 1 : 2} (${tttCurrent}) Wins!`;
    renderTTTBoard(w);
    launchConfetti();
    synth.play("win");
    return;
  }
  if (tttBoard.every(Boolean)) {
    tttOver = true;
    tttScores[1]++;
    document.getElementById("ttt-sd").textContent = tttScores[1];
    document.getElementById("ttt-status").textContent = "🤝 It's a Draw!";
    renderTTTBoard();
    synth.play("draw");
    return;
  }
  tttCurrent = tttCurrent === "X" ? "O" : "X";
  updateTTTStatus();
  renderTTTBoard();

  if (isSinglePlayer && tttCurrent === "O" && !tttOver) {
    setTimeout(tttAIPlay, 400 + Math.random() * 600);
  }
}

function tttAIPlay() {
  if (tttOver || tttCurrent !== "O") return;
  let move = -1;
  const empty = tttBoard
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i !== -1);
  if (empty.length === 0) return;

  if (aiDifficulty === "easy") {
    if (Math.random() < 0.7) {
      move = empty[Math.floor(Math.random() * empty.length)];
    } else {
      move = tttFindTacticalMove();
    }
  } else if (aiDifficulty === "medium") {
    if (Math.random() < 0.25) {
      move = empty[Math.floor(Math.random() * empty.length)];
    } else {
      move = tttFindTacticalMove();
    }
  } else {
    let bestScore = -Infinity;
    for (let i of empty) {
      tttBoard[i] = "O";
      let score = tttMinimax(tttBoard, 0, false);
      tttBoard[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  if (move === -1) move = empty[Math.floor(Math.random() * empty.length)];
  tttPlay(move);
}

function tttFindTacticalMove() {
  const empty = tttBoard.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  const findWin = (player) => {
    for (let i of empty) {
      tttBoard[i] = player;
      const w = TTT_WINS.find((combo) => combo.every((c) => tttBoard[c] === player));
      tttBoard[i] = null;
      if (w) return i;
    }
    return -1;
  };
  let m = findWin("O");
  if (m === -1) m = findWin("X");
  if (m === -1 && tttBoard[4] === null) m = 4;
  return m;
}

function tttMinimax(board, depth, isMaximizing) {
  const winner = tttCheckWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (board.every(Boolean)) return 0;

  const empty = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (let i of empty) {
      board[i] = "O";
      let score = tttMinimax(board, depth + 1, false);
      board[i] = null;
      maxScore = Math.max(score, maxScore);
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (let i of empty) {
      board[i] = "X";
      let score = tttMinimax(board, depth + 1, true);
      board[i] = null;
      minScore = Math.min(score, minScore);
    }
    return minScore;
  }
}

function tttCheckWinner(board) {
  for (let combo of TTT_WINS) {
    if (board[combo[0]] && board[combo[0]] === board[combo[1]] && board[combo[0]] === board[combo[2]]) {
      return board[combo[0]];
    }
  }
  return null;
}
function updateTTTStatus() {
  document.getElementById("ttt-status").textContent =
    `Player ${tttCurrent === "X" ? 1 : 2}'s Turn (${tttCurrent})`;
}
function tttReset() {
  tttInit();
}

/* ====================================================================
   2. PONG  (+ particles, power-ups, ball trail)
   ==================================================================== */
let pongAnim,
  pongState,
  pongParticles = [];

function pongInit() {
  document.getElementById("pong-overlay").classList.remove("hidden");
  document.getElementById("pong-overlay-msg").textContent = "Ready for Pong?";
  const btn = document.getElementById("pong-overlay-btn");
  if (btn) btn.textContent = "▶ Continue (Space)";
  pongStop();
  pongParticles = [];
  pongState = {
    ball: { x: 400, y: 225, vx: 0, vy: 0, r: 10, trail: [] },
    p1: { y: 175, score: 0, padH: 100 },
    p2: { y: 175, score: 0, padH: 100 },
    powerups: [],
    keys: {},
    running: false,
    W: 800,
    H: 450,
    PAD_W: 14,
    SPEED: 8,
    puTimer: 0,
  };
  pongDraw();
}
function executePongStart() {
  const st = pongState;
  if (!st) return;

  if (st.p1.score >= 7 || st.p2.score >= 7) {
    st.p1.score = 0;
    st.p2.score = 0;
    document.getElementById("pong-s1").textContent = 0;
    document.getElementById("pong-s2").textContent = 0;
  }

  st.p1.padH = 100;
  st.p2.padH = 100;
  st.powerups = [];
  st.puTimer = 0;

  st.ball.x = st.W / 2;
  st.ball.y = st.H / 2;
  st.ball.trail = [];
  const a = ((Math.random() * 60 - 30) * Math.PI) / 180,
    d = Math.random() < 0.5 ? 1 : -1;
  st.ball.vx = d * 4 * Math.cos(a);
  st.ball.vy = 4 * Math.sin(a);
  st.running = true;
  document.removeEventListener("keydown", pongKey);
  document.removeEventListener("keyup", pongKeyUp);
  document.addEventListener("keydown", pongKey);
  document.addEventListener("keyup", pongKeyUp);
  lastPongTime = performance.now();
  pongLoop();
  synth.play("click");
}

function pongStart() {
  const overlay = document.getElementById("pong-overlay");
  if (overlay && !overlay.classList.contains("hidden")) {
    overlay.classList.add("hidden");
  }
  startCountdown(executePongStart);
}
function pongKey(e) {
  if (pongState) pongState.keys[e.key] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
    e.preventDefault();
}
function pongKeyUp(e) {
  if (pongState) pongState.keys[e.key] = false;
}
function pongLoop(timestamp) {
  if (!pongState?.running) return;
  pongAnim = requestAnimationFrame(pongLoop);
  if (!timestamp) timestamp = performance.now();
  const elapsed = timestamp - lastPongTime;
  if (elapsed >= fpsInterval) {
    lastPongTime = timestamp - (elapsed % fpsInterval);
    pongUpdate();
    pongDraw();
  }
}
function pongUpdate() {
  const st = pongState,
    ks = st.keys;
  if (ks["w"] || ks["W"]) st.p1.y = Math.max(0, st.p1.y - st.SPEED);
  if (ks["s"] || ks["S"])
    st.p1.y = Math.min(st.H - st.p1.padH, st.p1.y + st.SPEED);

  if (isSinglePlayer) {
    let speedMult = 0.5;
    let maxWiggle = 50;
    if (aiDifficulty === "medium") {
      speedMult = 0.75;
      maxWiggle = 25;
    } else if (aiDifficulty === "hard") {
      speedMult = 0.95;
      maxWiggle = 5;
    }

    let targetY = st.ball.y - st.p2.padH / 2;
    if (st.ball.vx > 0 && aiDifficulty === "hard") {
      let timeToReach = (st.W - st.PAD_W - 20 - st.ball.x) / st.ball.vx;
      let predictedY = st.ball.y + st.ball.vy * timeToReach;
      while (predictedY < 0 || predictedY > st.H) {
        if (predictedY < 0) predictedY = -predictedY;
        if (predictedY > st.H) predictedY = 2 * st.H - predictedY;
      }
      targetY = predictedY - st.p2.padH / 2;
    }

    const errorY = Math.sin(performance.now() / 400) * maxWiggle;
    if (st.p2.y < targetY + errorY - 8)
      st.p2.y = Math.min(st.H - st.p2.padH, st.p2.y + st.SPEED * speedMult);
    else if (st.p2.y > targetY + errorY + 8)
      st.p2.y = Math.max(0, st.p2.y - st.SPEED * speedMult);
  } else {
    if (ks["ArrowUp"]) st.p2.y = Math.max(0, st.p2.y - st.SPEED);
    if (ks["ArrowDown"])
      st.p2.y = Math.min(st.H - st.p2.padH, st.p2.y + st.SPEED);
  }

  st.ball.trail.push({ x: st.ball.x, y: st.ball.y });
  if (st.ball.trail.length > 10) st.ball.trail.shift();
  st.ball.x += st.ball.vx;
  st.ball.y += st.ball.vy;

  if (st.ball.y - st.ball.r <= 0) {
    st.ball.y = st.ball.r;
    st.ball.vy *= -1;
    synth.play("hit");
  }
  if (st.ball.y + st.ball.r >= st.H) {
    st.ball.y = st.H - st.ball.r;
    st.ball.vy *= -1;
    synth.play("hit");
  }

  if (
    st.ball.vx < 0 &&
    st.ball.x - st.ball.r <= st.PAD_W + 20 &&
    st.ball.y >= st.p1.y &&
    st.ball.y <= st.p1.y + st.p1.padH
  ) {
    st.ball.x = st.PAD_W + 20 + st.ball.r;
    const rel = (st.ball.y - (st.p1.y + st.p1.padH / 2)) / (st.p1.padH / 2);
    let paddleVy = 0;
    if (ks["w"] || ks["W"]) paddleVy = -2;
    if (ks["s"] || ks["S"]) paddleVy = 2;
    st.ball.vx = Math.min(Math.abs(st.ball.vx) * 1.05, 12);
    st.ball.vy = rel * 6 + paddleVy;
    pongAddPart(st.ball.x, st.ball.y, "#7c3aed");
    synth.play("hit");
    if (Math.abs(st.ball.vx) > 9) triggerShake("pong-screen");
  }
  if (
    st.ball.vx > 0 &&
    st.ball.x + st.ball.r >= st.W - st.PAD_W - 20 &&
    st.ball.y >= st.p2.y &&
    st.ball.y <= st.p2.y + st.p2.padH
  ) {
    st.ball.x = st.W - st.PAD_W - 20 - st.ball.r;
    const rel = (st.ball.y - (st.p2.y + st.p2.padH / 2)) / (st.p2.padH / 2);
    let paddleVy = 0;
    if (ks["ArrowUp"]) paddleVy = -2;
    if (ks["ArrowDown"]) paddleVy = 2;
    st.ball.vx = -Math.min(Math.abs(st.ball.vx) * 1.05, 12);
    st.ball.vy = rel * 6 + paddleVy;
    pongAddPart(st.ball.x, st.ball.y, "#f59e0b");
    synth.play("hit");
    if (Math.abs(st.ball.vx) > 9) triggerShake("pong-screen");
  }

  // power-ups
  st.puTimer++;
  if (st.puTimer > 280 && st.powerups.length < 2) {
    st.puTimer = 0;
    const types = [
      { e: "⚡", ef: "speed", c: "#facc15" },
      { e: "🔷", ef: "grow", c: "#06b6d4" },
      { e: "💊", ef: "shrink", c: "#7c3aed" },
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    st.powerups.push({
      x: 180 + Math.random() * 440,
      y: 40 + Math.random() * 370,
      r: 18,
      pulse: 0,
      ...t,
    });
  }
  st.powerups = st.powerups.filter((pu) => {
    const dx = st.ball.x - pu.x,
      dy = st.ball.y - pu.y;
    if (Math.sqrt(dx * dx + dy * dy) < pu.r + st.ball.r) {
      synth.play("score");
      if (pu.ef === "speed") {
        const s = Math.sqrt(st.ball.vx ** 2 + st.ball.vy ** 2);
        const ns = Math.min(s * 1.25, 10);
        st.ball.vx = (st.ball.vx / s) * ns;
        st.ball.vy = (st.ball.vy / s) * ns;
      } else if (pu.ef === "grow") {
        st.p1.padH = Math.min(180, st.p1.padH + 30);
        setTimeout(() => {
          if (st.p1) st.p1.padH = Math.max(100, st.p1.padH - 30);
        }, 7000);
      } else if (pu.ef === "shrink") {
        st.p2.padH = Math.max(50, st.p2.padH - 25);
        setTimeout(() => {
          if (st.p2) st.p2.padH = Math.min(100, st.p2.padH + 25);
        }, 5000);
      }
      pongAddPart(pu.x, pu.y, pu.c);
      return false;
    }
    pu.pulse += 0.05;
    return true;
  });
  pongParticles = pongParticles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;
    p.vy += 0.1;
    return p.life > 0;
  });

  if (st.ball.x + st.ball.r < 0) {
    st.p2.score++;
    document.getElementById("pong-s2").textContent = st.p2.score;
    pongScored();
  } else if (st.ball.x - st.ball.r > st.W) {
    st.p1.score++;
    document.getElementById("pong-s1").textContent = st.p1.score;
    pongScored();
  }
}
function pongAddPart(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2,
      s = 1 + Math.random() * 5;
    pongParticles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      color,
      size: 2 + Math.random() * 4,
    });
  }
}
function pongScored() {
  const st = pongState;
  st.running = false;
  cancelAnimationFrame(pongAnim);
  document.removeEventListener("keydown", pongKey);
  document.removeEventListener("keyup", pongKeyUp);
  if (st.p1.score >= 7 || st.p2.score >= 7) {
    synth.play("win");
    document.getElementById("pong-overlay").classList.remove("hidden");
    document.getElementById("pong-overlay-msg").textContent =
      `🏆 Player ${st.p1.score >= 7 ? 1 : 2} Wins!`;
    const btn = document.getElementById("pong-overlay-btn");
    if (btn) btn.textContent = "▶ Play Again (Space)";
    addGlobalScore(st.p1.score >= 7 ? 0 : 1);
    launchConfetti();
  } else {
    synth.play("score");
    st.powerups = [];
    document.getElementById("pong-overlay").classList.remove("hidden");
    document.getElementById("pong-overlay-msg").textContent =
      "Point scored! Continue?";
    const btn = document.getElementById("pong-overlay-btn");
    if (btn) btn.textContent = "▶ Continue (Space)";
  }
}
function pongDraw() {
  const st = pongState,
    canvas = document.getElementById("pong-canvas"),
    ctx = canvas.getContext("2d");
  if (!st || !canvas) return;
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, st.W, st.H);
  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(st.W / 2, 0);
  ctx.lineTo(st.W / 2, st.H);
  ctx.stroke();
  ctx.setLineDash([]);

  st.ball.trail.forEach((t, i) => {
    const a = (i / st.ball.trail.length) * 0.3,
      r = st.ball.r * (i / st.ball.trail.length) * 0.8;
    ctx.fillStyle = `rgba(124,58,237,${a})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  st.powerups.forEach((pu) => {
    ctx.save();
    ctx.translate(pu.x, pu.y);
    const sc = 1 + Math.sin(pu.pulse) * 0.1;
    ctx.scale(sc, sc);
    ctx.font = "22px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = pu.c;
    ctx.shadowBlur = 15;
    ctx.fillText(pu.e, 0, 0);
    ctx.restore();
  });

  pongParticles.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  const g1 = ctx.createLinearGradient(0, st.p1.y, 0, st.p1.y + st.p1.padH);
  g1.addColorStop(0, "#7c3aed");
  g1.addColorStop(1, "#06b6d4");
  ctx.fillStyle = g1;
  ctx.shadowColor = "#7c3aed";
  ctx.shadowBlur = 15;
  roundRect(ctx, 20, st.p1.y, st.PAD_W, st.p1.padH, 7);
  const g2 = ctx.createLinearGradient(0, st.p2.y, 0, st.p2.y + st.p2.padH);
  g2.addColorStop(0, "#f59e0b");
  g2.addColorStop(1, "#ef4444");
  ctx.fillStyle = g2;
  ctx.shadowColor = "#f59e0b";
  roundRect(ctx, st.W - 20 - st.PAD_W, st.p2.y, st.PAD_W, st.p2.padH, 7);
  ctx.shadowBlur = 0;

  const grd = ctx.createRadialGradient(
    st.ball.x,
    st.ball.y,
    1,
    st.ball.x,
    st.ball.y,
    st.ball.r * 3,
  );
  grd.addColorStop(0, "rgba(255,255,255,.9)");
  grd.addColorStop(1, "rgba(124,58,237,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(st.ball.x, st.ball.y, st.ball.r * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(st.ball.x, st.ball.y, st.ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
function pongStop() {
  if (pongAnim) cancelAnimationFrame(pongAnim);
  document.removeEventListener("keydown", pongKey);
  document.removeEventListener("keyup", pongKeyUp);
}

/* ====================================================================
   3. CONNECT 4 (+ drop animation)
   ==================================================================== */
let c4Board,
  c4Current,
  c4Over,
  c4Scores = [0, 0],
  c4Anim = false;
function c4Init() {
  c4Board = Array.from({ length: 6 }, () => Array(7).fill(0));
  c4Current = 1;
  c4Over = false;
  c4Anim = false;
  document.getElementById("c4-status").textContent = "Player 1's Turn 🔴";
  document.getElementById("c4-s1").textContent = c4Scores[0];
  document.getElementById("c4-s2").textContent = c4Scores[1];
  renderC4();
}
function renderC4(ar = -1, ac = -1) {
  const btnEl = document.getElementById("c4-col-btns");
  btnEl.innerHTML = "";
  for (let c = 0; c < 7; c++) {
    const b = document.createElement("button");
    b.className = "c4-col-btn";
    b.textContent = c4Current === 1 ? "🔴" : "🔵";
    b.onclick = () => {
      if (!c4Anim && !c4Over && !(isSinglePlayer && c4Current === 2)) {
        synth.play("click");
        c4Drop(c);
      }
    };
    if (c4Over || c4Anim || c4Board[0][c] !== 0) b.disabled = true;
    btnEl.appendChild(b);
  }
  const el = document.getElementById("c4-board");
  el.innerHTML = "";
  const wins = c4Over ? getC4WinCells() : [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 7; c++) {
      const cell = document.createElement("div");
      cell.className = "c4-cell";
      if (c4Board[r][c] === 1) {
        cell.classList.add("p1");
        if (r === ar && c === ac) cell.classList.add("dropping");
      }
      if (c4Board[r][c] === 2) {
        cell.classList.add("p2");
        if (r === ar && c === ac) cell.classList.add("dropping");
      }
      if (wins.some(([wr, wc]) => wr === r && wc === c))
        cell.classList.add("win");
      if (!c4Over && !c4Anim) {
        cell.onclick = () => {
          if (!(isSinglePlayer && c4Current === 2)) {
            synth.play("click");
            c4Drop(c);
          }
        };
        cell.style.cursor = "pointer";
      }
      el.appendChild(cell);
    }
  document
    .getElementById("c4-p1i")
    .classList.toggle("active", c4Current === 1 && !c4Over);
  document
    .getElementById("c4-p2i")
    .classList.toggle("active", c4Current === 2 && !c4Over);
}
function c4Drop(col) {
  if (c4Over || c4Anim) return;
  for (let r = 5; r >= 0; r--) {
    if (!c4Board[r][col]) {
      c4Board[r][col] = c4Current;
      c4Anim = true;
      renderC4(r, col);
      setTimeout(() => {
        c4Anim = false;
        if (c4CheckWin(r, col)) {
          c4Over = true;
          const idx = c4Current - 1;
          c4Scores[idx]++;
          addGlobalScore(idx);
          document.getElementById(
            c4Current === 1 ? "c4-s1" : "c4-s2",
          ).textContent = c4Scores[idx];
          document.getElementById("c4-status").textContent =
            `🏆 Player ${c4Current} Wins!`;
          renderC4();
          launchConfetti();
          synth.play("win");
          return;
        }
        if (c4Board[0].every((val) => val !== 0)) {
          c4Over = true;
          document.getElementById("c4-status").textContent = "🤝 It's a Draw!";
          renderC4();
          synth.play("draw");
          return;
        }
        c4Current = c4Current === 1 ? 2 : 1;
        document.getElementById("c4-status").textContent =
          `Player ${c4Current}'s Turn ${c4Current === 1 ? "🔴" : "🔵"}`;
        renderC4();

        if (isSinglePlayer && c4Current === 2 && !c4Over) {
          setTimeout(c4AIPlay, 500);
        }
      }, 380);
      return;
    }
  }
}
function c4AIPlay() {
  if (c4Over || c4Current !== 2) return;

  const validCols = [];
  for (let c = 0; c < 7; c++) if (!c4Board[0][c]) validCols.push(c);
  if (validCols.length === 0) return;

  const getTargetRow = (col) => {
    for (let r = 5; r >= 0; r--) {
      if (!c4Board[r][col]) return r;
    }
    return -1;
  };

  const canWin = (player) => {
    for (let c of validCols) {
      const r = getTargetRow(c);
      if (r !== -1) {
        c4Board[r][c] = player;
        const w = c4CheckWin(r, c);
        c4Board[r][c] = 0;
        if (w) return c;
      }
    }
    return -1;
  };

  let move = -1;

  if (aiDifficulty === "easy") {
    if (Math.random() < 0.7) {
      move = validCols[Math.floor(Math.random() * validCols.length)];
    } else {
      move = canWin(2);
      if (move === -1) move = canWin(1);
    }
  } else if (aiDifficulty === "medium") {
    if (Math.random() < 0.2) {
      move = validCols[Math.floor(Math.random() * validCols.length)];
    } else {
      move = canWin(2);
      if (move === -1) move = canWin(1);
    }
  } else {
    // Hard / Master
    move = canWin(2); // 1. Win if possible
    if (move === -1) move = canWin(1); // 2. Block opponent win if possible

    if (move === -1) {
      let bestScore = -999;
      const colWeights = [1, 2, 4, 6, 4, 2, 1]; // Prefer center columns

      for (let c of validCols) {
        const r = getTargetRow(c);
        let score = colWeights[c];

        c4Board[r][c] = 2;

        if (r > 0) {
          c4Board[r - 1][c] = 1;
          if (c4CheckWin(r - 1, c)) {
            score -= 100;
          }
          c4Board[r - 1][c] = 0;
        }

        c4Board[r][c] = 0;

        if (score > bestScore) {
          bestScore = score;
          move = c;
        }
      }
    }
  }

  if (move === -1 || !validCols.includes(move)) {
    move = validCols[Math.floor(Math.random() * validCols.length)];
  }

  c4Drop(move);
}
function c4CheckWin(r, c) {
  const p = c4Current;
  return [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ].some(([dr, dc]) => {
    let n = 1;
    for (let d = 1; d < 4; d++) {
      const nr = r + dr * d,
        nc = c + dc * d;
      if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7 || c4Board[nr][nc] !== p)
        break;
      n++;
    }
    for (let d = 1; d < 4; d++) {
      const nr = r - dr * d,
        nc = c - dc * d;
      if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7 || c4Board[nr][nc] !== p)
        break;
      n++;
    }
    return n >= 4;
  });
}
function getC4WinCells() {
  const cells = [];
  [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ].forEach(([dr, dc]) => {
    for (let r = 0; r < 6; r++)
      for (let c = 0; c < 7; c++) {
        const p = c4Board[r][c];
        if (!p) continue;
        let line = [[r, c]];
        for (let d = 1; d < 4; d++) {
          const nr = r + dr * d,
            nc = c + dc * d;
          if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7 || c4Board[nr][nc] !== p)
            break;
          line.push([nr, nc]);
        }
        if (line.length >= 4) cells.push(...line);
      }
  });
  return cells;
}
function c4Reset() {
  c4Init();
}

/* ====================================================================
   4. SNAKE (+ power-ups: apple, star, bolt, shield)
   ==================================================================== */
const CELL = 20,
  COLS = 30,
  ROWS = 30;
let snakeInterval, snakeState;
const FOOD_TYPES = [
  { e: "🍎", type: "apple", pts: 1, c: "#ef4444", w: 5 },
  { e: "⭐", type: "star", pts: 3, c: "#f59e0b", w: 2 },
  { e: "⚡", type: "bolt", pts: 1, c: "#facc15", w: 1 },
  { e: "🛡", type: "shield", pts: 1, c: "#60a5fa", w: 1 },
];

function snakeInit() {
  snakeStop();
  document.getElementById("snake-overlay").classList.remove("hidden");
  document.getElementById("snake-overlay-msg").textContent =
    "2-Player Snake Arena!";
  const btn = document.getElementById("snake-overlay-btn");
  if (btn) btn.textContent = "▶ Continue (Space)";
  snakeDrawStatic();
}
function executeSnakeStart() {
  snakeState = {
    s1: {
      body: [
        { x: 8, y: 15 },
        { x: 7, y: 15 },
        { x: 6, y: 15 },
      ],
      dir: { x: 1, y: 0 },
      moveQueue: [],
      alive: true,
      shield: 0,
      boost: 0,
      moveTimer: 0,
      moveCooldown: 5,
    },
    s2: {
      body: [
        { x: 22, y: 15 },
        { x: 23, y: 15 },
        { x: 24, y: 15 },
      ],
      dir: { x: -1, y: 0 },
      moveQueue: [],
      alive: true,
      shield: 0,
      boost: 0,
      moveTimer: 0,
      moveCooldown: 5,
    },
    foods: [],
    score1: 0,
    score2: 0,
    running: true,
  };
  for (let i = 0; i < 3; i++) snakeSpawnFood();
  document.addEventListener("keydown", snakeKey);
  snakeInterval = setInterval(snakeTick, 35);
  synth.play("click");
}

function snakeStart() {
  const overlay = document.getElementById("snake-overlay");
  if (overlay && !overlay.classList.contains("hidden")) {
    overlay.classList.add("hidden");
  }
  startCountdown(executeSnakeStart);
}
function snakeSpawnFood() {
  const st = snakeState,
    occ = [...st.s1.body, ...st.s2.body, ...st.foods];
  let tot = FOOD_TYPES.reduce((a, b) => a + b.w, 0),
    rnd = Math.random() * tot,
    ft = FOOD_TYPES[0];
  for (const f of FOOD_TYPES) {
    rnd -= f.w;
    if (rnd <= 0) {
      ft = f;
      break;
    }
  }
  let pos,
    at = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    at++;
  } while (at < 100 && occ.some((c) => c.x === pos.x && c.y === pos.y));
  st.foods.push({ ...pos, ...ft, anim: 0 });
}
function snakeKey(e) {
  if (!snakeState?.running) return;
  const s1 = snakeState.s1,
    s2 = snakeState.s2;
  
  const getDir1 = () => s1.moveQueue.length > 0 ? s1.moveQueue[s1.moveQueue.length - 1] : s1.dir;
  const getDir2 = () => s2.moveQueue.length > 0 ? s2.moveQueue[s2.moveQueue.length - 1] : s2.dir;

  if (s1.moveQueue.length < 3) {
    const d1 = getDir1();
    if ((e.key === "w" || e.key === "W") && d1.x !== 0) s1.moveQueue.push({ x: 0, y: -1 });
    if ((e.key === "s" || e.key === "S") && d1.x !== 0) s1.moveQueue.push({ x: 0, y: 1 });
    if ((e.key === "a" || e.key === "A") && d1.y !== 0) s1.moveQueue.push({ x: -1, y: 0 });
    if ((e.key === "d" || e.key === "D") && d1.y !== 0) s1.moveQueue.push({ x: 1, y: 0 });
  }

  if (s2.moveQueue.length < 3) {
    const d2 = getDir2();
    if (e.key === "ArrowUp" && d2.x !== 0) { s2.moveQueue.push({ x: 0, y: -1 }); e.preventDefault(); }
    if (e.key === "ArrowDown" && d2.x !== 0) { s2.moveQueue.push({ x: 0, y: 1 }); e.preventDefault(); }
    if (e.key === "ArrowLeft" && d2.y !== 0) { s2.moveQueue.push({ x: -1, y: 0 }); e.preventDefault(); }
    if (e.key === "ArrowRight" && d2.y !== 0) { s2.moveQueue.push({ x: 1, y: 0 }); e.preventDefault(); }
  }
}
function snakeTick() {
  const st = snakeState;
  if (!st.running) return;
  const s1 = st.s1,
    s2 = st.s2;

  if (s1.boost > 0) {
    s1.boost--;
    s1.moveCooldown = 3;
  } else {
    s1.moveCooldown = 5;
  }
  if (s2.boost > 0) {
    s2.boost--;
    s2.moveCooldown = 3;
  } else {
    s2.moveCooldown = 5;
  }

  s1.moveTimer++;
  s2.moveTimer++;

  let s1Moved = false,
    s2Moved = false;
  let h1 = null,
    h2 = null;

  if (s1.alive && s1.moveTimer >= s1.moveCooldown) {
    if (s1.moveQueue && s1.moveQueue.length > 0) {
      s1.dir = s1.moveQueue.shift();
    }
    h1 = { x: s1.body[0].x + s1.dir.x, y: s1.body[0].y + s1.dir.y };
    s1Moved = true;
    s1.moveTimer = 0;
  }
  if (s2.alive && s2.moveTimer >= s2.moveCooldown) {
    if (isSinglePlayer) {
      let head = s2.body[0];
      let bestDir = s2.dir;
      let targetFood = st.foods[0];
      for (let f of st.foods) {
        if (
          Math.abs(f.x - head.x) + Math.abs(f.y - head.y) <
          Math.abs(targetFood.x - head.x) + Math.abs(targetFood.y - head.y)
        )
          targetFood = f;
      }
      const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];
      const isSafe = (nx, ny) => {
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
        if (s2.body.slice(0, -1).some((c) => c.x === nx && c.y === ny))
          return false;
        if (s1.alive && s1.body.some((c) => c.x === nx && c.y === ny))
          return false;
        return true;
      };
      let bestScore = -9999;
      for (let d of dirs) {
        if (d.x === -s2.dir.x && d.y === -s2.dir.y) continue;
        let nx = head.x + d.x,
          ny = head.y + d.y;
        if (isSafe(nx, ny)) {
          let score = -(
            Math.abs(nx - targetFood.x) + Math.abs(ny - targetFood.y)
          );
          if (score > bestScore) {
            bestScore = score;
            bestDir = d;
          }
        }
      }
      s2.moveQueue = [bestDir];
    }
    if (s2.moveQueue && s2.moveQueue.length > 0) {
      s2.dir = s2.moveQueue.shift();
    }
    h2 = { x: s2.body[0].x + s2.dir.x, y: s2.body[0].y + s2.dir.y };
    s2Moved = true;
    s2.moveTimer = 0;
  }

  if (!s1Moved && !s2Moved) {
    st.foods.forEach((f) => (f.anim += 0.1));
    snakeDraw();
    return;
  }

  const oob = (h) => h.x < 0 || h.x >= COLS || h.y < 0 || h.y >= ROWS;
  const hit = (h, arr) => arr.some((c) => c.x === h.x && c.y === h.y);

  let d1 = false,
    d2 = false;

  if (s1Moved) {
    d1 =
      oob(h1) ||
      hit(h1, s1.body.slice(0, -1)) ||
      (s2.alive && hit(h1, s2.body.slice(0, -1)));
    if (d1 && s1.shield > 0) {
      d1 = false;
      s1.shield = 0;
      synth.play("hit");
    }
  }
  if (s2Moved) {
    d2 =
      oob(h2) ||
      hit(h2, s2.body.slice(0, -1)) ||
      (s1.alive && hit(h2, s1.body.slice(0, -1)));
    if (d2 && s2.shield > 0) {
      d2 = false;
      s2.shield = 0;
      synth.play("hit");
    }
  }

  if (s1Moved && s2Moved && h1.x === h2.x && h1.y === h2.y) {
    d1 = true;
    d2 = true;
  }
  if (d1) s1.alive = false;
  if (d2) s2.alive = false;

  if (!s1.alive && !s2.alive) {
    synth.play("draw");
    snakeGameOver("🤝 It's a Draw!");
    return;
  }
  if (!s1.alive) {
    synth.play("lose");
    snakeGameOver("🏆 Player 2 (Purple) Wins!");
    addGlobalScore(1);
    return;
  }
  if (!s2.alive) {
    synth.play("win");
    snakeGameOver("🏆 Player 1 (Green) Wins!");
    addGlobalScore(0);
    return;
  }

  if (s1Moved) s1.body.unshift(h1);
  if (s2Moved) s2.body.unshift(h2);

  let a1 = false,
    a2 = false;
  st.foods = st.foods.filter((food) => {
    if (s1Moved && h1.x === food.x && h1.y === food.y) {
      a1 = true;
      snakeApply(s1, food, 1);
      snakeSpawnFood();
      return false;
    }
    if (s2Moved && h2.x === food.x && h2.y === food.y) {
      a2 = true;
      snakeApply(s2, food, 2);
      snakeSpawnFood();
      return false;
    }
    return true;
  });

  if (s1Moved && !a1) s1.body.pop();
  if (s2Moved && !a2) s2.body.pop();

  if (s1.shield > 0) s1.shield--;
  if (s2.shield > 0) s2.shield--;
  st.foods.forEach((f) => (f.anim += 0.1));
  document.getElementById("snake-s1").textContent = st.score1;
  document.getElementById("snake-s2").textContent = st.score2;
  if (st.score1 >= 15) unlockAchievement("snake_king");
  snakeDraw();
}
function snakeApply(snake, food, p) {
  const st = snakeState;
  synth.play("score");
  if (food.type === "apple") {
    p === 1 ? (st.score1 += food.pts) : (st.score2 += food.pts);
  } else if (food.type === "star") {
    p === 1 ? (st.score1 += food.pts) : (st.score2 += food.pts);
    const l = snake.body[snake.body.length - 1];
    snake.body.push({ ...l }, { ...l });
  } else if (food.type === "bolt") {
    snake.boost = 60;
    p === 1 ? st.score1++ : st.score2++;
  } else if (food.type === "shield") {
    snake.shield = 140;
    p === 1 ? st.score1++ : st.score2++;
  }
}
function snakeGameOver(msg) {
  clearInterval(snakeInterval);
  snakeState.running = false;
  snakeDraw();
  document.getElementById("snake-overlay").classList.remove("hidden");
  document.getElementById("snake-overlay-msg").textContent = msg;
  const btn = document.getElementById("snake-overlay-btn");
  if (btn) btn.textContent = "▶ Play Again (Space)";
  document.removeEventListener("keydown", snakeKey);
  launchConfetti();
}
function snakeDraw() {
  const canvas = document.getElementById("snake-canvas"),
    ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  ctx.lineWidth = 1;
  for (let x = 0; x < COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(canvas.width, y * CELL);
    ctx.stroke();
  }
  const st = snakeState;
  if (!st) return;
  st.foods.forEach((food) => {
    const sc = 1 + Math.sin(food.anim) * 0.12;
    ctx.save();
    ctx.translate(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2);
    ctx.scale(sc, sc);
    ctx.font = `${CELL - 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = food.c;
    ctx.shadowBlur = 12;
    ctx.fillText(food.e, 0, 0);
    ctx.restore();
  });
  ctx.shadowBlur = 0;
  drawSnakePiece(ctx, st.s1, "#4ade80", "#166534");
  drawSnakePiece(ctx, st.s2, "#c084fc", "#4c1d95");
}
function drawSnakePiece(ctx, snake, hc, bc) {
  snake.body.forEach((seg, i) => {
    const x = seg.x * CELL + 1,
      y = seg.y * CELL + 1,
      s = CELL - 2;
    if (i === 0) {
      ctx.fillStyle = snake.shield > 0 ? "#60a5fa" : hc;
      ctx.shadowColor = snake.shield > 0 ? "#60a5fa" : hc;
      ctx.shadowBlur = snake.shield > 0 ? 18 : 12;
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = bc;
      ctx.globalAlpha = Math.max(0.25, 1 - (i / snake.body.length) * 0.7);
    }
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, s, s, 4);
    else ctx.rect(x, y, s, s);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  ctx.shadowBlur = 0;
}
function snakeDrawStatic() {
  const canvas = document.getElementById("snake-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, 600, 600);
  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 30; x++) {
    ctx.beginPath();
    ctx.moveTo(x * 20, 0);
    ctx.lineTo(x * 20, 600);
    ctx.stroke();
  }
  for (let y = 0; y < 30; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * 20);
    ctx.lineTo(600, y * 20);
    ctx.stroke();
  }
}
function snakeStop() {
  clearInterval(snakeInterval);
  document.removeEventListener("keydown", snakeKey);
  if (snakeState) snakeState.running = false;
}

/* ====================================================================
   5. BATTLESHIP (+ auto-place, ship status, emojis)
   ==================================================================== */
const SHIPS = [
  { name: "Aircraft Carrier", size: 5, e: "🛸" },
  { name: "Battleship", size: 4, e: "🚢" },
  { name: "Cruiser", size: 3, e: "⛴" },
  { name: "Destroyer", size: 2, e: "🛥" },
  { name: "Patrol Boat", size: 1, e: "🚤" },
];
let bsState;

function bsInit() {
  bsState = {
    phase: "place1",
    boards: [
      { ships: [], shots: [] },
      { ships: [], shots: [] },
    ],
    placing: { ships: [...SHIPS], currentIdx: 0, rotate: false, player: 0 },
  };
  setupPlacement(0);
}
function setupPlacement(pi) {
  bsState.placing.player = pi;
  bsState.placing.ships = [...SHIPS];
  bsState.placing.currentIdx = 0;
  bsState.placing.rotate = false;
  bsState.boards[pi] = { ships: [], shots: [] };
  document.getElementById("bs-phase-msg").textContent =
    `Player ${pi + 1} – Deploy your fleet`;
  document.getElementById("bs-left-title").textContent =
    `Your Board (Player ${pi + 1})`;
  document.getElementById("bs-right-title").textContent =
    `Enemy Grid (Player ${pi === 0 ? 2 : 1})`;
  document.getElementById("bs-ready-btn").style.display = "none";
  document.getElementById("bs-rotate-btn").style.display = "inline-block";
  document.getElementById("bs-auto-btn").style.display = "inline-block";
  document.getElementById("bs-ship-selector").style.display = "flex";
  document.getElementById("bs-ship-status").innerHTML = "";
  renderShipSelector();
  renderBsMyBoard();
  renderBsEnemyBoard(true);

  if (isSinglePlayer && pi === 1) {
    setTimeout(() => {
      bsAutoPlace();
      bsReady();
    }, 400);
  }
}
function renderShipSelector() {
  const el = document.getElementById("bs-ship-selector");
  el.innerHTML = "";
  const placed = bsState.boards[bsState.placing.player].ships.map(
    (s) => s.name,
  );
  SHIPS.forEach((ship, i) => {
    const btn = document.createElement("button");
    btn.className =
      "ship-btn" +
      (placed.includes(ship.name) ? " placed" : "") +
      (i === bsState.placing.currentIdx ? " selected" : "");
    btn.textContent = `${ship.e} ${ship.name} (${ship.size})`;
    btn.onclick = () => {
      synth.play("click");
      bsState.placing.currentIdx = i;
      renderShipSelector();
    };
    el.appendChild(btn);
  });
}
function bsToggleRotate() {
  synth.play("click");
  bsState.placing.rotate = !bsState.placing.rotate;
  document.getElementById("bs-rotate-btn").textContent = bsState.placing.rotate
    ? "↕ Vertical"
    : "↔ Horizontal";
}
function bsAutoPlace() {
  synth.play("click");
  const p = bsState.placing.player;
  bsState.boards[p] = { ships: [], shots: [] };
  SHIPS.forEach((ship) => {
    let ok = false,
      at = 0;
    while (!ok && at < 300) {
      at++;
      const rot = Math.random() > 0.5,
        r = Math.floor(Math.random() * 10),
        c = Math.floor(Math.random() * 10);
      let cells = [];
      for (let k = 0; k < ship.size; k++)
        cells.push(rot ? [r + k, c] : [r, c + k]);
      if (!cells.every(([cr, cc]) => cr >= 0 && cr < 10 && cc >= 0 && cc < 10))
        continue;
      if (
        cells.some(([cr, cc]) =>
          bsState.boards[p].ships.some((s) =>
            s.cells.some(([sr, sc]) => sr === cr && sc === cc),
          ),
        )
      )
        continue;
      bsState.boards[p].ships.push({
        name: ship.name,
        size: ship.size,
        cells,
        e: ship.e,
      });
      ok = true;
    }
  });
  bsState.placing.currentIdx = SHIPS.length - 1;
  renderShipSelector();
  renderBsMyBoard();
  document.getElementById("bs-ready-btn").style.display = "inline-block";
}
function renderBsMyBoard(hR = -1, hC = -1) {
  const el = document.getElementById("bs-my-board");
  el.innerHTML = "";
  const p = bsState.placing.player,
    board = bsState.boards[p],
    ship = SHIPS[bsState.placing.currentIdx],
    rot = bsState.placing.rotate,
    placed = board.ships.map((s) => s.name);
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      cell.className = "bs-cell";
      const onShip = board.ships.find((s) =>
        s.cells.some(([sr, sc]) => sr === r && sc === c),
      );
      if (onShip) {
        cell.classList.add("ship");
        cell.textContent = onShip.e || "";
      }
      if (hR !== -1 && ship && !placed.includes(ship.name)) {
        let cells = [];
        for (let k = 0; k < ship.size; k++)
          cells.push(rot ? [hR + k, hC] : [hR, hC + k]);
        const valid = cells.every(
          ([cr, cc]) =>
            cr >= 0 &&
            cr < 10 &&
            cc >= 0 &&
            cc < 10 &&
            !board.ships.some((s) =>
              s.cells.some(([sr, sc]) => sr === cr && sc === cc),
            ),
        );
        if (cells.some(([cr, cc]) => cr === r && cc === c))
          cell.classList.add(valid ? "preview" : "hit");
      }
      cell.onmouseenter = () => renderBsMyBoard(r, c);
      cell.onmouseleave = () => renderBsMyBoard();
      cell.onclick = () => bsPlaceShip(r, c);
      el.appendChild(cell);
    }
  if (board.ships.length === SHIPS.length)
    document.getElementById("bs-ready-btn").style.display = "inline-block";
}
function bsPlaceShip(r, c) {
  const p = bsState.placing.player,
    board = bsState.boards[p],
    ship = SHIPS[bsState.placing.currentIdx],
    rot = bsState.placing.rotate,
    placed = board.ships.map((s) => s.name);
  if (placed.includes(ship.name)) return;
  let cells = [];
  for (let k = 0; k < ship.size; k++) cells.push(rot ? [r + k, c] : [r, c + k]);
  if (!cells.every(([cr, cc]) => cr >= 0 && cr < 10 && cc >= 0 && cc < 10))
    return;
  if (
    cells.some(([cr, cc]) =>
      board.ships.some((s) =>
        s.cells.some(([sr, sc]) => sr === cr && sc === cc),
      ),
    )
  )
    return;
  board.ships.push({ name: ship.name, size: ship.size, cells, e: ship.e });
  synth.play("click");
  const next = SHIPS.findIndex(
    (s, i) =>
      i !== bsState.placing.currentIdx &&
      !board.ships.map((x) => x.name).includes(s.name),
  );
  if (next !== -1) bsState.placing.currentIdx = next;
  renderShipSelector();
  renderBsMyBoard();
}
function bsReady() {
  synth.play("click");
  if (bsState.placing.player === 0) {
    bsState.placing.player = 1;
    if (!isSinglePlayer) showBsTurnOverlay(1);
    setupPlacement(1);
  } else {
    bsState.phase = "battle1";
    bsState.activePlayer = 0;
    if (!isSinglePlayer) showBsTurnOverlay(0);
    startBattle();
  }
}
function startBattle() {
  bsState.activePlayer = 0;
  document.getElementById("bs-ship-selector").style.display = "none";
  document.getElementById("bs-rotate-btn").style.display = "none";
  document.getElementById("bs-auto-btn").style.display = "none";
  document.getElementById("bs-ready-btn").style.display = "none";
  renderBattleView();
}
function renderBattleView() {
  const ap = bsState.activePlayer,
    ep = 1 - ap;
  document.getElementById("bs-phase-msg").textContent =
    `Player ${ap + 1}'s Turn – Select target!`;
  document.getElementById("bs-left-title").textContent =
    `Your Board (Player ${ap + 1})`;
  document.getElementById("bs-right-title").textContent =
    `Enemy Grid (Player ${ep + 1}) – Click to fire!`;
  renderOwnBoardBattle(ap);
  renderEnemyBoardBattle(ep);
  renderShipStatus(ep);
}
function renderShipStatus(ep) {
  const el = document.getElementById("bs-ship-status");
  el.innerHTML =
    '<div style="font-size:.8rem;color:var(--text-muted);margin-bottom:.3rem">Fleet Status:</div>';
  const board = bsState.boards[ep];
  SHIPS.forEach((ship) => {
    const my = board.ships.find((s) => s.name === ship.name);
    if (!my) return;
    const sunk = my.cells.every(([sr, sc]) =>
      board.shots.some(([shr, shc]) => shr === sr && shc === sc),
    );
    const div = document.createElement("div");
    div.className = "ship-status-item" + (sunk ? " sunk-ship" : "");
    div.textContent = `${ship.e} ${ship.name}`;
    el.appendChild(div);
  });
}
function renderOwnBoardBattle(p) {
  const el = document.getElementById("bs-my-board");
  el.innerHTML = "";
  const board = bsState.boards[p];
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      cell.className = "bs-cell locked-cell";
      const onShip = board.ships.find((s) =>
        s.cells.some(([sr, sc]) => sr === r && sc === c),
      );
      if (onShip) cell.classList.add("ship");
      const shot = board.shots.find(([sr, sc]) => sr === r && sc === c);
      if (shot) {
        cell.textContent = onShip ? "💥" : "💧";
        cell.classList.add(onShip ? "hit" : "miss");
      }
      el.appendChild(cell);
    }
}
function renderEnemyBoardBattle(ep) {
  const el = document.getElementById("bs-enemy-board");
  el.className = "bs-grid";
  el.innerHTML = "";
  const board = bsState.boards[ep];
  const isAITurn = isSinglePlayer && bsState.activePlayer === 1;
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      const as = board.shots.some(([sr, sc]) => sr === r && sc === c);
      cell.className = "bs-cell" + (as ? " shot" : "");
      const shot = board.shots.find(([sr, sc]) => sr === r && sc === c);
      if (shot) {
        const hit = board.ships.some((s) =>
          s.cells.some(([sr, sc]) => sr === r && sc === c),
        );
        cell.textContent = hit ? "💥" : "💧";
        cell.classList.add(hit ? "hit" : "miss");
      }
      if (!as && !isAITurn) cell.onclick = () => bsShoot(ep, r, c);
      el.appendChild(cell);
    }
}
function bsShoot(ep, r, c) {
  const board = bsState.boards[ep];
  if (board.shots.some(([sr, sc]) => sr === r && sc === c)) return;
  board.shots.push([r, c]);
  const allSunk = board.ships.every((ship) =>
    ship.cells.every(([sr, sc]) =>
      board.shots.some(([shr, shc]) => shr === sr && shc === sc),
    ),
  );
  if (allSunk) {
    synth.play("win");
    const w = bsState.activePlayer + 1;
    document.getElementById("bs-phase-msg").textContent =
      `🏆 Player ${w} Wins! Enemy fleet destroyed!`;
    renderOwnBoardBattle(bsState.activePlayer);
    renderFinalEnemyBoard(ep);
    launchConfetti();
    addGlobalScore(w - 1);
    return;
  }
  const hit = board.ships.some((s) =>
    s.cells.some(([sr, sc]) => sr === r && sc === c),
  );
  if (hit) {
    synth.play("hit");
    renderBattleView();
    if (isSinglePlayer && bsState.activePlayer === 1)
      setTimeout(bsAIShoot, 500);
  } else {
    synth.play("score");
    bsState.activePlayer = 1 - bsState.activePlayer;
    if (!isSinglePlayer) showBsTurnOverlay(bsState.activePlayer);
    renderBattleView();
    if (isSinglePlayer && bsState.activePlayer === 1)
      setTimeout(bsAIShoot, 500);
  }
}
function bsAIShoot() {
  if (bsState.activePlayer !== 1 || bsState.phase !== "battle1") return;
  const board = bsState.boards[0];
  const unshot = [];
  const hits = [];

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (!board.shots.some(([sr, sc]) => sr === i && sc === j)) {
        unshot.push([i, j]);
      } else {
        const hitShip = board.ships.find((s) =>
          s.cells.some(([cr, cc]) => cr === i && cc === j),
        );
        if (hitShip) {
          const isSunk = hitShip.cells.every(([cr, cc]) =>
            board.shots.some(([shr, shc]) => shr === cr && shc === cc),
          );
          if (!isSunk) hits.push([i, j]);
        }
      }
    }
  }
  if (unshot.length === 0) return;

  let r, c;

  if (aiDifficulty === "easy") {
    const pick = unshot[Math.floor(Math.random() * unshot.length)];
    r = pick[0];
    c = pick[1];
  } else if (aiDifficulty === "medium") {
    if (hits.length > 0) {
      const adj = [];
      hits.forEach(([hr, hc]) => {
        [
          [hr - 1, hc],
          [hr + 1, hc],
          [hr, hc - 1],
          [hr, hc + 1],
        ].forEach(([ar, ac]) => {
          if (
            ar >= 0 &&
            ar < 10 &&
            ac >= 0 &&
            ac < 10 &&
            !board.shots.some(([sr, sc]) => sr === ar && sc === ac)
          ) {
            adj.push([ar, ac]);
          }
        });
      });
      if (adj.length > 0) {
        const pick = adj[Math.floor(Math.random() * adj.length)];
        r = pick[0];
        c = pick[1];
      }
    }
    if (r === undefined) {
      const pick = unshot[Math.floor(Math.random() * unshot.length)];
      r = pick[0];
      c = pick[1];
    }
  } else {
    // Hard / Master
    if (hits.length > 1) {
      const lineAdj = [];
      for (let i = 0; i < hits.length; i++) {
        for (let j = i + 1; j < hits.length; j++) {
          if (hits[i][0] === hits[j][0]) {
            const hr = hits[i][0];
            const minC = Math.min(hits[i][1], hits[j][1]);
            const maxC = Math.max(hits[i][1], hits[j][1]);
            if (minC - 1 >= 0 && !board.shots.some(([sr, sc]) => sr === hr && sc === minC - 1)) lineAdj.push([hr, minC - 1]);
            if (maxC + 1 < 10 && !board.shots.some(([sr, sc]) => sr === hr && sc === maxC + 1)) lineAdj.push([hr, maxC + 1]);
          } else if (hits[i][1] === hits[j][1]) {
            const hc = hits[i][1];
            const minR = Math.min(hits[i][0], hits[j][0]);
            const maxR = Math.max(hits[i][0], hits[j][0]);
            if (minR - 1 >= 0 && !board.shots.some(([sr, sc]) => sr === minR - 1 && sc === hc)) lineAdj.push([minR - 1, hc]);
            if (maxR + 1 < 10 && !board.shots.some(([sr, sc]) => sr === maxR + 1 && sc === hc)) lineAdj.push([maxR + 1, hc]);
          }
        }
      }
      if (lineAdj.length > 0) {
        const pick = lineAdj[Math.floor(Math.random() * lineAdj.length)];
        r = pick[0];
        c = pick[1];
      }
    }

    if (r === undefined && hits.length > 0) {
      const adj = [];
      hits.forEach(([hr, hc]) => {
        [
          [hr - 1, hc],
          [hr + 1, hc],
          [hr, hc - 1],
          [hr, hc + 1],
        ].forEach(([ar, ac]) => {
          if (
            ar >= 0 &&
            ar < 10 &&
            ac >= 0 &&
            ac < 10 &&
            !board.shots.some(([sr, sc]) => sr === ar && sc === ac)
          ) {
            adj.push([ar, ac]);
          }
        });
      });
      if (adj.length > 0) {
        const pick = adj[Math.floor(Math.random() * adj.length)];
        r = pick[0];
        c = pick[1];
      }
    }

    if (r === undefined) {
      const parityUnshot = unshot.filter(([ur, uc]) => (ur + uc) % 2 === 0);
      const candidates = parityUnshot.length > 0 ? parityUnshot : unshot;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      r = pick[0];
      c = pick[1];
    }
  }

  bsShoot(0, r, c);
}
function renderFinalEnemyBoard(ep) {
  const el = document.getElementById("bs-enemy-board");
  el.innerHTML = "";
  const board = bsState.boards[ep];
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      const onS = board.ships.some((s) =>
        s.cells.some(([sr, sc]) => sr === r && sc === c),
      );
      const shot = board.shots.some(([sr, sc]) => sr === r && sc === c);
      cell.className = "bs-cell locked-cell";
      if (onS && shot) {
        cell.classList.add("sunk");
        cell.textContent = "💥";
      } else if (shot) {
        cell.classList.add("miss");
        cell.textContent = "💧";
      } else if (onS) cell.classList.add("ship");
      el.appendChild(cell);
    }
}
function renderBsEnemyBoard(lock) {
  const el = document.getElementById("bs-enemy-board");
  el.className = "bs-grid" + (lock ? " locked" : "");
  el.innerHTML = "";
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      cell.className = "bs-cell";
      el.appendChild(cell);
    }
}
function bsReset() {
  bsInit();
}

// Hotseat helpers
function showBsTurnOverlay(playerIdx) {
  const overlay = document.getElementById("bs-turn-overlay");
  const title = document.getElementById("bs-overlay-player-title");
  title.textContent = `Player ${playerIdx + 1}'s Turn`;
  const btn = document.getElementById("bs-turn-overlay-btn");
  if (btn) btn.textContent = "▶ Continue Turn (Space)";
  overlay.classList.remove("hidden");
}
function bsStartTurn() {
  synth.play("click");
  const overlay = document.getElementById("bs-turn-overlay");
  overlay.classList.add("hidden");
  startCountdown(() => {
    if (bsState && bsState.phase === "battle1") {
      renderBattleView();
    }
  });
}

/* ====================================================================
   6. CHECKERS / WARCABY
   ==================================================================== */
// 0=empty, 1=p1, 2=p2, 3=p1king, 4=p2king. Dark squares: (r+c)%2===1
// p1 starts rows 0-2 moves DOWN, p2 starts rows 5-7 moves UP
let chkBoard,
  chkCurrent,
  chkSelected,
  chkScores = [0, 0],
  chkOver,
  chkMulti;

function chkInit() {
  chkBoard = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) chkBoard[r][c] = 1;
  for (let r = 5; r < 8; r++)
    for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) chkBoard[r][c] = 2;
  chkCurrent = 1;
  chkSelected = null;
  chkOver = false;
  chkMulti = null;
  document.getElementById("chk-s1").textContent = chkScores[0];
  document.getElementById("chk-s2").textContent = chkScores[1];
  chkUpdateStatus();
  chkRender();
}
function chkMoves(r, c, board, capOnly = false) {
  const piece = board[r][c];
  if (!piece) return [];
  const player = piece <= 2 ? piece : piece - 2,
    isKing = piece > 2;
  const allDirs = [
    [1, -1],
    [1, 1],
    [-1, -1],
    [-1, 1],
  ];
  const mv = [];
  allDirs.forEach(([dr, dc]) => {
    const nr = r + dr,
      nc = c + dc;
    if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) return;
    if (board[nr][nc] === 0) {
      if (!capOnly) {
        const isForward =
          (player === 1 && dr === 1) || (player === 2 && dr === -1);
        if (isKing || isForward) {
          mv.push({ from: [r, c], to: [nr, nc], cap: null });
        }
      }
    } else {
      const tp = board[nr][nc] <= 2 ? board[nr][nc] : board[nr][nc] - 2;
      if (tp !== player) {
        const jr = r + 2 * dr,
          jc = c + 2 * dc;
        if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && board[jr][jc] === 0) {
          mv.push({ from: [r, c], to: [jr, jc], cap: [nr, nc] });
        }
      }
    }
  });
  return mv;
}
function chkAllMoves(player, board) {
  const all = [],
    caps = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const pp = p <= 2 ? p : p - 2;
      if (pp !== player) continue;
      const ms = chkMoves(r, c, board);
      all.push(...ms);
      caps.push(...ms.filter((m) => m.cap));
    }
  return caps.length > 0 ? caps : all;
}
function chkRender(validMoves = []) {
  const el = document.getElementById("chk-board");
  el.innerHTML = "";
  const av = chkMulti
    ? chkMoves(chkMulti[0], chkMulti[1], chkBoard, true)
    : chkAllMoves(chkCurrent, chkBoard);
  const movable = new Set(av.map((m) => m.from[0] * 8 + m.from[1]));
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const dark = (r + c) % 2 === 1,
        cell = document.createElement("div");
      cell.className = "chk-cell " + (dark ? "chk-dark" : "chk-light");
      if (validMoves.some((m) => m.to[0] === r && m.to[1] === c))
        cell.classList.add("chk-valid-dest");
      const piece = chkBoard[r][c];
      if (piece) {
        const player = piece <= 2 ? piece : piece - 2,
          isKing = piece > 2,
          pe = document.createElement("div");
        pe.className = `chk-piece chk-piece-p${player}${isKing ? " chk-king" : ""}`;
        if (isKing) pe.textContent = "♛";
        if (chkSelected && chkSelected[0] === r && chkSelected[1] === c)
          pe.classList.add("chk-selected");
        if (!chkSelected && movable.has(r * 8 + c))
          cell.classList.add("chk-can-move");
        cell.appendChild(pe);
      }
      cell.onclick = () => chkClick(r, c);
      el.appendChild(cell);
    }
  document
    .getElementById("chk-p1")
    .classList.toggle("active", chkCurrent === 1 && !chkOver);
  document
    .getElementById("chk-p2")
    .classList.toggle("active", chkCurrent === 2 && !chkOver);
}
function chkClick(r, c) {
  if (chkOver) return;
  const piece = chkBoard[r][c],
    pp = piece ? (piece <= 2 ? piece : piece - 2) : 0;
  if (isSinglePlayer && chkCurrent === 2) return;
  if (chkMulti) {
    const ms = chkMoves(chkMulti[0], chkMulti[1], chkBoard, true);
    const mv = ms.find((m) => m.to[0] === r && m.to[1] === c);
    if (mv) {
      synth.play("click");
      chkExec(mv);
    }
    return;
  }
  if (chkSelected) {
    const av = chkAllMoves(chkCurrent, chkBoard);
    const fromSel = av.filter(
      (m) => m.from[0] === chkSelected[0] && m.from[1] === chkSelected[1],
    );
    const mv = fromSel.find((m) => m.to[0] === r && m.to[1] === c);
    if (mv) {
      synth.play("click");
      chkExec(mv);
      return;
    }
    if (pp === chkCurrent) {
      synth.play("click");
      chkSelected = [r, c];
      const ms = av.filter((m) => m.from[0] === r && m.from[1] === c);
      chkRender(ms);
      return;
    }
    chkSelected = null;
    chkRender();
  } else {
    if (pp === chkCurrent) {
      synth.play("click");
      chkSelected = [r, c];
      const av = chkAllMoves(chkCurrent, chkBoard);
      const ms = av.filter((m) => m.from[0] === r && m.from[1] === c);
      chkRender(ms);
    }
  }
}
function chkExec(move) {
  const [fr, fc] = move.from,
    [tr, tc] = move.to,
    mp = chkBoard[fr][fc];
  chkBoard[tr][tc] = mp;
  chkBoard[fr][fc] = 0;
  if (move.cap) {
    chkBoard[move.cap[0]][move.cap[1]] = 0;
    synth.play("hit");
  } else {
    synth.play("click");
  }
  const promoted = (mp === 1 && tr === 7) || (mp === 2 && tr === 0);
  if (mp === 1 && tr === 7) chkBoard[tr][tc] = 3;
  if (mp === 2 && tr === 0) chkBoard[tr][tc] = 4;
  if (promoted && mp === 1) unlockAchievement("checkers_king");
  chkSelected = null;
  chkMulti = null;
  if (move.cap && !promoted) {
    const fur = chkMoves(tr, tc, chkBoard, true);
    if (fur.length > 0) {
      chkMulti = [tr, tc];
      chkSelected = [tr, tc];
      chkRender(fur);
      if (isSinglePlayer && chkCurrent === 2)
        setTimeout(() => {
          if (chkCurrent !== 2 || chkOver) return;
          const pick = fur[Math.floor(Math.random() * fur.length)];
          chkExec(pick);
        }, 500);
      return;
    }
  }
  chkCurrent = chkCurrent === 1 ? 2 : 1;
  const opp = chkAllMoves(chkCurrent, chkBoard);
  if (opp.length === 0) {
    const w = chkCurrent === 1 ? 2 : 1;
    chkScores[w - 1]++;
    document.getElementById(`chk-s${w}`).textContent = chkScores[w - 1];
    document.getElementById("chk-status").textContent =
      `🏆 Player ${w} Wins!`;
    chkOver = true;
    addGlobalScore(w - 1);
    chkRender();
    launchConfetti();
    synth.play("win");
    return;
  }
  chkUpdateStatus();
  chkRender();
  if (isSinglePlayer && chkCurrent === 2) setTimeout(chkAIPlay, 500);
}
function chkAIPlay() {
  if (chkOver || chkCurrent !== 2) return;
  const av = chkAllMoves(2, chkBoard);
  if (av.length === 0) return;

  let pick = null;

  if (aiDifficulty === "easy") {
    pick = av[Math.floor(Math.random() * av.length)];
  } else if (aiDifficulty === "medium") {
    const caps = av.filter((m) => m.cap);
    if (caps.length > 0) pick = caps[Math.floor(Math.random() * caps.length)];
    else pick = av[Math.floor(Math.random() * av.length)];
  } else {
    // Hard / Master
    let bestScore = -999;
    av.forEach((m) => {
      let score = 0;
      if (m.cap) score += 12;
      const [tr, tc] = m.to;
      const piece = chkBoard[m.from[0]][m.from[1]];

      if (piece === 2 && tr === 0) score += 15;
      if (m.from[0] === 7) score -= 3;
      if (tr >= 2 && tr <= 5 && tc >= 2 && tc <= 5) score += 4;

      if (score > bestScore) {
        bestScore = score;
        pick = m;
      }
    });
  }

  if (!pick) pick = av[Math.floor(Math.random() * av.length)];

  chkSelected = [pick.from[0], pick.from[1]];
  chkExec(pick);
}
function chkUpdateStatus() {
  const mc = chkAllMoves(chkCurrent, chkBoard).some((m) => m.cap);
  document.getElementById("chk-status").textContent =
    `Player ${chkCurrent}'s Turn${mc ? " – ⚡ Mandatory Jump!" : ""}`;
}
function chkReset() {
  chkInit();
}

/* ====================================================================
   7. AIR HOCKEY
   ==================================================================== */
let ahAnim, ahState;
function ahInit() {
  document.getElementById("ah-overlay").classList.remove("hidden");
  document.getElementById("ah-overlay-msg").textContent = "Air Hockey Arena!";
  const btn = document.getElementById("ah-overlay-btn");
  if (btn) btn.textContent = "▶ Continue (Space)";
  ahStop();
  ahState = null;
  ahDrawStatic();
}
function executeAhStart() {
  const W = 700,
    H = 500;
  let s1 = ahState?.m1?.score || 0,
    s2 = ahState?.m2?.score || 0;
  if (s1 >= 7 || s2 >= 7) {
    s1 = 0;
    s2 = 0;
  }
  ahState = {
    W,
    H,
    puck: {
      x: W / 2,
      y: H / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() < 0.5 ? 4 : -4,
      r: 18,
      trail: [],
    },
    m1: {
      x: 90,
      y: H / 2,
      r: 32,
      color: "#3b82f6",
      score: s1,
      vx: 0,
      vy: 0,
      prevX: 90,
      prevY: H / 2,
    },
    m2: {
      x: W - 90,
      y: H / 2,
      r: 32,
      color: "#ef4444",
      score: s2,
      vx: 0,
      vy: 0,
      prevX: W - 90,
      prevY: H / 2,
    },
    keys: {},
    running: true,
    SPEED: 11,
    goalH: 140,
  };
  document.getElementById("ah-s1").textContent = s1;
  document.getElementById("ah-s2").textContent = s2;
  document.removeEventListener("keydown", ahKey);
  document.removeEventListener("keyup", ahKeyUp);
  document.addEventListener("keydown", ahKey);
  document.addEventListener("keyup", ahKeyUp);
  lastAhTime = performance.now();
  ahLoop();
  synth.play("click");
}

function ahStart() {
  const overlay = document.getElementById("ah-overlay");
  if (overlay && !overlay.classList.contains("hidden")) {
    overlay.classList.add("hidden");
  }
  startCountdown(executeAhStart);
}
function ahKey(e) {
  if (ahState) ahState.keys[e.key] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
    e.preventDefault();
}
function ahKeyUp(e) {
  if (ahState) ahState.keys[e.key] = false;
}
function ahLoop(timestamp) {
  if (!ahState?.running) return;
  ahAnim = requestAnimationFrame(ahLoop);
  if (!timestamp) timestamp = performance.now();
  const elapsed = timestamp - lastAhTime;
  if (elapsed >= fpsInterval) {
    lastAhTime = timestamp - (elapsed % fpsInterval);
    ahUpdate();
    ahDraw();
  }
}
function ahUpdate() {
  const st = ahState,
    ks = st.keys,
    S = st.SPEED;
  if (ks["w"] || ks["W"]) st.m1.y = Math.max(st.m1.r, st.m1.y - S);
  if (ks["s"] || ks["S"]) st.m1.y = Math.min(st.H - st.m1.r, st.m1.y + S);
  if (ks["a"] || ks["A"]) st.m1.x = Math.max(st.m1.r, st.m1.x - S);
  if (ks["d"] || ks["D"]) st.m1.x = Math.min(st.W / 2 - st.m1.r, st.m1.x + S);

  if (isSinglePlayer) {
    let speedMult = 0.5;
    let maxWiggle = 45;
    if (aiDifficulty === "medium") {
      speedMult = 0.75;
      maxWiggle = 20;
    } else if (aiDifficulty === "hard") {
      speedMult = 0.95;
      maxWiggle = 2;
    }

    const targetY = st.puck.y;
    let targetX = st.W - 70;
    if (st.puck.x > st.W / 2) {
      targetX = aiDifficulty === "hard" ? st.puck.x + 15 : st.puck.x + 5;
    }

    const errorY = Math.sin(performance.now() / 300) * maxWiggle;
    if (st.m2.y < targetY + errorY - 8)
      st.m2.y = Math.min(st.H - st.m2.r, st.m2.y + S * speedMult);
    else if (st.m2.y > targetY + errorY + 8)
      st.m2.y = Math.max(st.m2.r, st.m2.y - S * speedMult);

    if (st.puck.x > st.W / 2) {
      if (st.m2.x < targetX - 5)
        st.m2.x = Math.min(st.W - st.m2.r, st.m2.x + S * speedMult * 0.85);
      else if (st.m2.x > targetX + 5)
        st.m2.x = Math.max(st.W / 2 + st.m2.r, st.m2.x - S * speedMult * 0.85);
    } else {
      if (st.m2.x > st.W - 80) st.m2.x -= S * 0.4;
      else if (st.m2.x < st.W - 80) st.m2.x += S * 0.4;
    }
  } else {
    if (ks["ArrowUp"]) st.m2.y = Math.max(st.m2.r, st.m2.y - S);
    if (ks["ArrowDown"]) st.m2.y = Math.min(st.H - st.m2.r, st.m2.y + S);
    if (ks["ArrowLeft"]) st.m2.x = Math.max(st.W / 2 + st.m2.r, st.m2.x - S);
    if (ks["ArrowRight"]) st.m2.x = Math.min(st.W - st.m2.r, st.m2.x + S);
  }

  st.m1.vx = st.m1.x - st.m1.prevX;
  st.m1.vy = st.m1.y - st.m1.prevY;
  st.m2.vx = st.m2.x - st.m2.prevX;
  st.m2.vy = st.m2.y - st.m2.prevY;

  st.m1.prevX = st.m1.x;
  st.m1.prevY = st.m1.y;
  st.m2.prevX = st.m2.x;
  st.m2.prevY = st.m2.y;

  st.puck.trail.push({ x: st.puck.x, y: st.puck.y });
  if (st.puck.trail.length > 8) st.puck.trail.shift();
  st.puck.x += st.puck.vx;
  st.puck.y += st.puck.vy;

  st.puck.x = Math.max(st.puck.r, Math.min(st.W - st.puck.r, st.puck.x));
  st.puck.y = Math.max(st.puck.r, Math.min(st.H - st.puck.r, st.puck.y));

  const gT = (st.H - st.goalH) / 2,
    gB = gT + st.goalH;
  if (st.puck.y - st.puck.r <= 0) {
    st.puck.y = st.puck.r;
    st.puck.vy = Math.abs(st.puck.vy);
    synth.play("hit");
  }
  if (st.puck.y + st.puck.r >= st.H) {
    st.puck.y = st.H - st.puck.r;
    st.puck.vy = -Math.abs(st.puck.vy);
    synth.play("hit");
  }
  if (st.puck.x - st.puck.r <= 0) {
    if (st.puck.y >= gT && st.puck.y <= gB) {
      ahScore(2);
      return;
    }
    st.puck.x = st.puck.r;
    st.puck.vx = Math.abs(st.puck.vx);
    synth.play("hit");
  }
  if (st.puck.x + st.puck.r >= st.W) {
    if (st.puck.y >= gT && st.puck.y <= gB) {
      ahScore(1);
      return;
    }
    st.puck.x = st.W - st.puck.r;
    st.puck.vx = -Math.abs(st.puck.vx);
    synth.play("hit");
  }
  st.puck.vx *= 0.9995;
  st.puck.vy *= 0.9995;
  const spd = Math.sqrt(st.puck.vx ** 2 + st.puck.vy ** 2);
  if (spd > 13) {
    st.puck.vx = (st.puck.vx / spd) * 13;
    st.puck.vy = (st.puck.vy / spd) * 13;
  }
  if (spd < 1.5 && spd > 0) {
    st.puck.vx = (st.puck.vx / spd) * 1.5;
    st.puck.vy = (st.puck.vy / spd) * 1.5;
  }
  ahHit(st.m1);
  ahHit(st.m2);
}
function ahHit(m) {
  const p = ahState.puck,
    dx = p.x - m.x,
    dy = p.y - m.y,
    d = Math.sqrt(dx * dx + dy * dy),
    md = p.r + m.r;
  if (d < md && d > 0) {
    synth.play("hit");
    const nx = dx / d,
      ny = dy / d;
    p.x = m.x + nx * md;
    p.y = m.y + ny * md;
    p.x = Math.max(p.r, Math.min(ahState.W - p.r, p.x));
    p.y = Math.max(p.r, Math.min(ahState.H - p.r, p.y));

    const rvx = p.vx - m.vx;
    const rvy = p.vy - m.vy;
    const velAlongNormal = rvx * nx + rvy * ny;
    if (velAlongNormal < 0) {
      const restitution = 0.95;
      let impulse = -(1 + restitution) * velAlongNormal;
      p.vx += impulse * nx;
      p.vy += impulse * ny;
    }
    p.vx += m.vx * 0.55;
    p.vy += m.vy * 0.55;

    if (Math.abs(p.vx) + Math.abs(p.vy) > 14) triggerShake("ah-screen");
  }
}
function ahScore(player) {
  const st = ahState;
  st.running = false;
  cancelAnimationFrame(ahAnim);
  document.removeEventListener("keydown", ahKey);
  document.removeEventListener("keyup", ahKeyUp);
  if (player === 1) {
    st.m1.score++;
    document.getElementById("ah-s1").textContent = st.m1.score;
  } else {
    st.m2.score++;
    document.getElementById("ah-s2").textContent = st.m2.score;
  }
  document.getElementById("ah-overlay").classList.remove("hidden");
  if (st.m1.score >= 7 || st.m2.score >= 7) {
    synth.play("win");
    document.getElementById("ah-overlay-msg").textContent =
      `🏆 Player ${st.m1.score >= 7 ? 1 : 2} Wins!`;
    const btn = document.getElementById("ah-overlay-btn");
    if (btn) btn.textContent = "▶ Play Again (Space)";
    addGlobalScore(st.m1.score >= 7 ? 0 : 1);
    launchConfetti();
  } else {
    synth.play("score");
    document.getElementById("ah-overlay-msg").textContent =
      `⚽ Goal for Player ${player}! Continue?`;
    const btn = document.getElementById("ah-overlay-btn");
    if (btn) btn.textContent = "▶ Continue (Space)";
  }
}
function ahDraw() {
  const st = ahState,
    canvas = document.getElementById("ah-canvas"),
    ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, st.W, st.H);
  const gT = (st.H - st.goalH) / 2,
    gB = gT + st.goalH;
  ctx.fillStyle = "rgba(239,68,68,0.2)";
  ctx.fillRect(0, gT, 18, st.goalH);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, gT, 18, st.goalH);
  ctx.fillStyle = "rgba(59,130,246,0.2)";
  ctx.fillRect(st.W - 18, gT, 18, st.goalH);
  ctx.strokeStyle = "#3b82f6";
  ctx.strokeRect(st.W - 18, gT, 18, st.goalH);
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(st.W, 0);
  ctx.moveTo(0, st.H);
  ctx.lineTo(st.W, st.H);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, gT);
  ctx.moveTo(0, gB);
  ctx.lineTo(0, st.H);
  ctx.moveTo(st.W, 0);
  ctx.lineTo(st.W, gT);
  ctx.moveTo(st.W, gB);
  ctx.lineTo(st.W, st.H);
  ctx.stroke();
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(st.W / 2, 0);
  ctx.lineTo(st.W / 2, st.H);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(st.W / 2, st.H / 2, 60, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.arc(st.W / 2, st.H / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  st.puck.trail.forEach((t, i) => {
    const a = (i / st.puck.trail.length) * 0.2,
      r = st.puck.r * (i / st.puck.trail.length) * 0.7;
    ctx.fillStyle = `rgba(200,200,255,${a})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ahDrawMallet(ctx, st.m1);
  ahDrawMallet(ctx, st.m2);
  ctx.shadowColor = "rgba(255,255,255,.8)";
  ctx.shadowBlur = 20;
  const pg = ctx.createRadialGradient(
    st.puck.x - 4,
    st.puck.y - 4,
    2,
    st.puck.x,
    st.puck.y,
    st.puck.r,
  );
  pg.addColorStop(0, "#fff");
  pg.addColorStop(1, "#9090cc");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(st.puck.x, st.puck.y, st.puck.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
function ahDrawMallet(ctx, m) {
  ctx.shadowColor = m.color;
  ctx.shadowBlur = 25;
  const g = ctx.createRadialGradient(
    m.x - m.r * 0.3,
    m.y - m.r * 0.3,
    3,
    m.x,
    m.y,
    m.r,
  );
  g.addColorStop(0, m.color + "dd");
  g.addColorStop(1, m.color + "88");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r * 0.5, 0, Math.PI * 2);
  ctx.stroke();
}
function ahDrawStatic() {
  const canvas = document.getElementById("ah-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, 700, 500);
}
function ahStop() {
  if (ahAnim) cancelAnimationFrame(ahAnim);
  document.removeEventListener("keydown", ahKey);
  document.removeEventListener("keyup", ahKeyUp);
  if (ahState) ahState.running = false;
}

/* ====================================================================
   8. MEMO / MEMORY CARDS
   ==================================================================== */
const MEMO_EMOJIS = [
  "🎮",
  "🚀",
  "⭐",
  "🌈",
  "🎵",
  "🔥",
  "💎",
  "🌙",
  "🦊",
  "🐉",
  "🎭",
  "🏆",
  "🌺",
  "🎪",
  "🦋",
  "🎯",
];
let memoState;
function memoInit() {
  const pairs = MEMO_EMOJIS.slice(0, 8),
    deck = [...pairs, ...pairs];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  memoState = {
    cards: deck.map((e, i) => ({
      id: i,
      emoji: e,
      flipped: false,
      matched: false,
    })),
    current: 1,
    flipped: [],
    scores: [0, 0],
    locked: false,
    total: 8,
  };
  document.getElementById("memo-s1").textContent = 0;
  document.getElementById("memo-s2").textContent = 0;
  memoUpdateStatus();
  memoRender();
}
function memoRender() {
  const el = document.getElementById("memo-board");
  el.innerHTML = "";
  const st = memoState;
  st.cards.forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "memo-card";
    if (card.flipped || card.matched) div.classList.add("flipped");
    if (card.matched) div.classList.add("matched");
    div.innerHTML = `<div class="memo-inner"><div class="memo-front">❓</div><div class="memo-back">${card.emoji}</div></div>`;
    if (!card.flipped && !card.matched && !st.locked) {
      div.onclick = () => {
        if (isSinglePlayer && st.current === 2) return;
        memoFlip(i);
      };
      div.style.cursor = "pointer";
    }
    el.appendChild(div);
  });
  document
    .getElementById("memo-p1")
    .classList.toggle("active", st.current === 1);
  document
    .getElementById("memo-p2")
    .classList.toggle("active", st.current === 2);
}
function memoFlip(i) {
  const st = memoState;
  if (
    st.locked ||
    st.cards[i].flipped ||
    st.cards[i].matched ||
    st.flipped.length >= 2
  )
    return;
  synth.play("click");
  st.cards[i].flipped = true;
  st.flipped.push(i);
  memoRender();
  if (st.flipped.length === 2) {
    st.locked = true;
    const [a, b] = st.flipped;
    setTimeout(() => {
      if (st.cards[a].emoji === st.cards[b].emoji) {
        synth.play("score");
        st.cards[a].matched = true;
        st.cards[b].matched = true;
        st.scores[st.current - 1]++;
        document.getElementById(`memo-s${st.current}`).textContent =
          st.scores[st.current - 1];
        st.flipped = [];
        st.locked = false;
        if (st.scores[0] + st.scores[1] === st.total) {
          const w =
            st.scores[0] > st.scores[1]
              ? 1
              : st.scores[1] > st.scores[0]
                ? 2
                : 0;
          document.getElementById("memo-status").textContent = w
            ? `🏆 Player ${w} Wins!`
            : "🤝 It's a Draw!";
          if (w) {
            synth.play("win");
            launchConfetti();
            addGlobalScore(w - 1);
          } else {
            synth.play("draw");
          }
          memoRender();
          return;
        }
        memoUpdateStatus();
        memoRender();
        if (isSinglePlayer && st.current === 2) setTimeout(memoAIPlay, 500);
      } else {
        st.cards[a].flipped = false;
        st.cards[b].flipped = false;
        st.flipped = [];
        st.locked = false;
        st.current = st.current === 1 ? 2 : 1;
        memoUpdateStatus();
        memoRender();
        if (isSinglePlayer && st.current === 2) setTimeout(memoAIPlay, 500);
      }
    }, 950);
  }
}
function memoAIPlay() {
  const st = memoState;
  if (st.current !== 2 || st.locked || st.scores[0] + st.scores[1] === st.total)
    return;
  let pickA = -1,
    pickB = -1;
  const unflipped = [];
  st.cards.forEach((c, i) => {
    if (!c.matched && !c.flipped) unflipped.push(i);
  });
  if (unflipped.length === 0) return;
  pickA = unflipped[Math.floor(Math.random() * unflipped.length)];
  memoFlip(pickA);

  setTimeout(() => {
    let second = unflipped.filter((i) => i !== pickA);
    pickB = second[Math.floor(Math.random() * second.length)];

    let memoryChance = 0.25;
    if (aiDifficulty === "medium") memoryChance = 0.55;
    else if (aiDifficulty === "hard") memoryChance = 0.85;

    if (Math.random() < memoryChance) {
      const matchIdx = st.cards.findIndex(
        (c, i) =>
          i !== pickA && c.emoji === st.cards[pickA].emoji && !c.matched,
      );
      if (matchIdx !== -1) pickB = matchIdx;
    }
    memoFlip(pickB);
  }, 600);
}

// Global Keyboard Shortcuts (R key for Battleship rotation, Space/Enter for game overlays)
window.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") {
    if (activeGame === "battleship" && bsState && (bsState.phase === "place1" || bsState.phase === "place2")) {
      bsToggleRotate();
    }
  }

  if (e.code === "Space" || e.key === " " || e.key === "Enter") {
    if (isCountdownRunning) {
      e.preventDefault();
      return;
    }
    const pongOverlay = document.getElementById("pong-overlay");
    if (activeGame === "pong" && pongOverlay && !pongOverlay.classList.contains("hidden")) {
      e.preventDefault();
      pongStart();
      return;
    }
    const ahOverlay = document.getElementById("ah-overlay");
    if (activeGame === "airhockey" && ahOverlay && !ahOverlay.classList.contains("hidden")) {
      e.preventDefault();
      ahStart();
      return;
    }
    const snakeOverlay = document.getElementById("snake-overlay");
    if (activeGame === "snake" && snakeOverlay && !snakeOverlay.classList.contains("hidden")) {
      e.preventDefault();
      snakeStart();
      return;
    }
    const bsOverlay = document.getElementById("bs-turn-overlay");
    if (activeGame === "battleship" && bsOverlay && !bsOverlay.classList.contains("hidden")) {
      e.preventDefault();
      bsStartTurn();
      return;
    }
  }
});
function memoUpdateStatus() {
  document.getElementById("memo-status").textContent =
    `Player ${memoState.current}'s Turn – Flip 2 cards!`;
}
function memoReset() {
  memoInit();
}

// EXPORTS FOR VITE BUILD
window.launchGame = launchGame;
window.goBack = goBack;
window.quickSwitchGame = quickSwitchGame;
window.restartCurrentGame = restartCurrentGame;
window.toggleSound = toggleSound;
window.toggleAI = toggleAI;
window.resetGlobalScores = resetGlobalScores;
window.toggleFullscreen = toggleFullscreen;
window.triggerKey = triggerKey;
window.releaseKey = releaseKey;
window.showRules = showRules;
window.hideRules = hideRules;
window.tttReset = tttReset;
window.pongStart = pongStart;
window.c4Reset = c4Reset;
window.snakeStart = snakeStart;
window.bsToggleRotate = bsToggleRotate;
window.bsAutoPlace = bsAutoPlace;
window.bsReady = bsReady;
window.bsReset = bsReset;
window.chkReset = chkReset;
window.ahStart = ahStart;
window.memoReset = memoReset;
window.bsStartTurn = bsStartTurn;
window.tttPlay = tttPlay;

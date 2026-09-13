// Get DOM Elements
const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const fwCanvas = document.getElementById("fireworksCanvas");
const fwCtx = fwCanvas.getContext("2d");

const pencilCursor = document.getElementById("pencilCursor");
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");
const mainTitle = document.getElementById("mainTitle");
const subTitle = document.getElementById("subTitle");
const progressFill = document.getElementById("progressFill");
const progressPct = document.getElementById("progressPct");

const finalCelebration = document.getElementById("finalCelebration");
const replayBtn = document.getElementById("replayBtn");
const soundToggle = document.getElementById("soundToggle");
const bgAudio = document.getElementById("bgAudio");

const skipBtn = document.getElementById("skipBtn");
const speedBtn = document.getElementById("speedBtn");

// Load Image Objects from Base64 Assets
const img1 = new Image();
const img2 = new Image();
const img3 = new Image();
const imgFinal = new Image();

let imagesLoadedCount = 0;

function onImageLoadSuccess() {
  imagesLoadedCount++;
  if (imagesLoadedCount === 4) {
    initCanvas();
  }
}

img1.onload = onImageLoadSuccess;
img2.onload = onImageLoadSuccess;
img3.onload = onImageLoadSuccess;
imgFinal.onload = onImageLoadSuccess;

img1.src = typeof IMAGE_1_DATA !== 'undefined' ? IMAGE_1_DATA : 'assets/drawing1.jpg';
img2.src = typeof IMAGE_2_DATA !== 'undefined' ? IMAGE_2_DATA : 'assets/drawing2.jpg';
img3.src = typeof IMAGE_3_DATA !== 'undefined' ? IMAGE_3_DATA : 'assets/drawing3.jpg';
imgFinal.src = typeof IMAGE_FINAL_DATA !== 'undefined' ? IMAGE_FINAL_DATA : 'assets/final_artwork.jpg';

// Offscreen Canvas for Progressive Brush Masking
let maskCanvas = document.createElement("canvas");
let maskCtx = maskCanvas.getContext("2d");

// Audio Playback Handler
function startSongPlayback() {
  if (bgAudio) {
    bgAudio.volume = 0.85;
    bgAudio.play().then(() => {
      soundToggle.innerText = "🎵 Song: ON";
    }).catch(err => {
      console.log("Audio play error:", err);
    });
  }
}

// Web Audio API Synthesizer for Fireworks pops
let audioCtx = null;
function playFireworkSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180 + Math.random() * 220, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {}
}

// State Management
// State: 0 = Start Overlay, 1 = Drawing 1, 2 = Drawing 2, 3 = Drawing 3, 4 = Final Celebration & Fireworks
let currentState = 0;
let progress = 0;
let isAnimating = false;
let animFrameId = null;

let speedMultiplier = 1; // 1x, 3x, 8x
const BASE_STEP = 0.008; // Ultra-slow pacing (~120s per drawing total)

// Fireworks Particles Engine
let fwParticles = [];

function launchFirework(x, y) {
  const colors = ['#f59e0b', '#fbbf24', '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#fef08a'];
  const baseColor = colors[Math.floor(Math.random() * colors.length)];
  playFireworkSound();

  for (let i = 0; i < 55; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 7.5 + 2;
    fwParticles.push({
      x: x || Math.random() * (fwCanvas.width - 80) + 40,
      y: y || Math.random() * (fwCanvas.height / 2) + 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: baseColor,
      alpha: 1,
      decay: Math.random() * 0.022 + 0.012,
      size: Math.random() * 3.5 + 2
    });
  }
}

function updateFireworks() {
  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
  if (currentState === 4) {
    if (Math.random() < 0.14) {
      launchFirework();
    }
    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.x += p.vx;
      p.y += p.vy + 0.18; // gravity
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        fwParticles.splice(i, 1);
      } else {
        fwCtx.save();
        fwCtx.globalAlpha = p.alpha;
        fwCtx.fillStyle = p.color;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fwCtx.fill();
        fwCtx.restore();
      }
    }
  }
}

// Canvas Initialization
function initCanvas() {
  canvas.width = 480;
  canvas.height = 720;
  fwCanvas.width = 480;
  fwCanvas.height = 720;
  maskCanvas.width = 480;
  maskCanvas.height = 720;
  drawPaperBackground();
}

function drawPaperBackground() {
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Start Button Click Listener
startBtn.addEventListener("click", () => {
  startSongPlayback();
  startOverlay.classList.add("hidden-overlay");
  startState(1);
});

// State Switcher
function startState(stateNum) {
  currentState = stateNum;
  progress = 0;
  isAnimating = true;
  finalCelebration.classList.remove("active");

  maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

  if (stateNum === 1) {
    mainTitle.innerText = "✨ First Image (1 of 3)";
    subTitle.innerText = "Stage A: Pencil Line Sketching (Baby Ganesha & Mouse)";
  } else if (stateNum === 2) {
    mainTitle.innerText = "✨ Second Image (2 of 3)";
    subTitle.innerText = "Stage A: Pencil Line Sketching (Hibiscus Flower Ganesha)";
  } else if (stateNum === 3) {
    mainTitle.innerText = "✨ Third Image (3 of 3)";
    subTitle.innerText = "Stage A: Pencil Line Sketching (Four-Armed Seated Ganesha)";
  }

  if (animFrameId) cancelAnimationFrame(animFrameId);
  renderLoop();
}

// Render Loop
function renderLoop() {
  if (currentState >= 1 && currentState <= 3) {
    if (isAnimating) {
      progress += BASE_STEP * speedMultiplier;
      if (progress >= 100) {
        progress = 100;
        isAnimating = false;
        renderDrawing(currentState, 100);
        onDrawingStageComplete();
        return;
      }
    }
    renderDrawing(currentState, progress);
  } else if (currentState === 4) {
    updateFireworks();
  }

  animFrameId = requestAnimationFrame(renderLoop);
}

// Two-Stage Artist Renderer: Stage A (Pencil ✍️) -> Stage B (Paintbrush 🖌️)
function renderDrawing(stateNum, pct) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let targetImg, strokes;
  if (stateNum === 1) {
    targetImg = img1;
    strokes = typeof STROKES_1 !== 'undefined' ? STROKES_1 : [];
  } else if (stateNum === 2) {
    targetImg = img2;
    strokes = typeof STROKES_2 !== 'undefined' ? STROKES_2 : [];
  } else {
    targetImg = img3;
    strokes = typeof STROKES_3 !== 'undefined' ? STROKES_3 : [];
  }

  // 1. Draw Paper Background
  drawPaperBackground();

  if (pct <= 65) {
    // ==========================================
    // STAGE A: REALISTIC PENCIL LINE DRAWING (0% - 65%)
    // ==========================================
    const linePct = pct / 65; // 0.0 to 1.0
    subTitle.innerText = `Stage A: Line Sketching with Pencil... (${Math.floor(pct)}%)`;

    ctx.strokeStyle = '#3b2510';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';

    const numStrokesToDraw = Math.floor(strokes.length * linePct);
    let lastPoint = null;

    for (let i = 0; i < numStrokesToDraw; i++) {
      const stroke = strokes[i];
      if (stroke && stroke.length > 0) {
        ctx.beginPath();
        for (let j = 0; j < stroke.length; j++) {
          const pt = stroke[j];
          if (j === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
          lastPoint = pt;
        }
        ctx.stroke();
      }
    }

    if (isAnimating && lastPoint) {
      positionCursor(lastPoint[0], lastPoint[1], "✍️");
    } else {
      hideCursor();
    }

  } else {
    // ==========================================
    // STAGE B: REALISTIC ARTIST COLOUR PAINTING (65% - 100%)
    // ==========================================
    const paintPct = (pct - 65) / 35; // 0.0 to 1.0
    subTitle.innerText = `Stage B: Colour Painting & Golden Lighting... (${Math.floor(pct)}%)`;

    // 1. Render complete pencil drawing lines on paper
    ctx.strokeStyle = `rgba(59, 37, 16, ${Math.max(0.15, 0.9 - paintPct * 0.75)})`;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';

    for (let i = 0; i < strokes.length; i++) {
      const stroke = strokes[i];
      if (stroke && stroke.length > 0) {
        ctx.beginPath();
        for (let j = 0; j < stroke.length; j++) {
          const pt = stroke[j];
          if (j === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        }
        ctx.stroke();
      }
    }

    // 2. Paint color strokes onto offscreen mask canvas
    const paintStrokesToDraw = Math.floor(strokes.length * paintPct);
    maskCtx.fillStyle = '#000000';
    maskCtx.strokeStyle = '#000000';
    maskCtx.lineWidth = 28 + paintPct * 30; // Expanding brush stroke
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    let lastPaintPoint = null;

    for (let i = 0; i < paintStrokesToDraw; i++) {
      const stroke = strokes[i];
      if (stroke && stroke.length > 0) {
        maskCtx.beginPath();
        for (let j = 0; j < stroke.length; j++) {
          const pt = stroke[j];
          if (j === 0) maskCtx.moveTo(pt[0], pt[1]);
          else maskCtx.lineTo(pt[0], pt[1]);
          lastPaintPoint = pt;
        }
        maskCtx.stroke();
      }
    }

    // 3. Clip & Render target artwork color image
    ctx.save();
    ctx.beginPath();
    const maxRadius = Math.sqrt(canvas.width**2 + canvas.height**2);
    ctx.arc(canvas.width / 2, canvas.height / 2, maxRadius * paintPct, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 4. Divine Golden Aura Bloom
    ctx.save();
    ctx.globalAlpha = Math.sin(paintPct * Math.PI) * 0.4;
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 3, 10,
      canvas.width / 2, canvas.height / 3, 250
    );
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Position Paintbrush cursor
    if (isAnimating && lastPaintPoint && paintPct < 0.98) {
      positionCursor(lastPaintPoint[0], lastPaintPoint[1], "🖌️");
    } else {
      hideCursor();
    }
  }

  // Update Progress Bar
  const roundPct = Math.floor(pct);
  progressFill.style.width = roundPct + "%";
  progressPct.innerText = roundPct + "%";
}

function positionCursor(cX, cY, symbol) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;
  const posX = canvas.offsetLeft + cX * scaleX;
  const posY = canvas.offsetTop + cY * scaleY;

  pencilCursor.innerText = symbol;
  pencilCursor.style.left = posX + "px";
  pencilCursor.style.top = posY + "px";
  pencilCursor.style.opacity = "1";
}

function hideCursor() {
  pencilCursor.style.opacity = "0";
}

// Handle Drawing Stage Complete & Automatic Sequence
function onDrawingStageComplete() {
  hideCursor();

  if (currentState === 1) {
    subTitle.innerText = "Image 1 Complete ✨ (Moving to Image 2...)";
    setTimeout(() => {
      startState(2);
    }, 2800);

  } else if (currentState === 2) {
    subTitle.innerText = "Image 2 Complete ✨ (Moving to Image 3...)";
    setTimeout(() => {
      startState(3);
    }, 2800);

  } else if (currentState === 3) {
    subTitle.innerText = "Image 3 Complete ✨ (Starting Grand Celebration...)";
    setTimeout(() => {
      triggerFinalWishesAndFireworks();
    }, 2800);
  }
}

// Trigger Final Celebration & Fireworks
function triggerFinalWishesAndFireworks() {
  currentState = 4;
  hideCursor();
  mainTitle.innerText = "🎆 Vinayagar Chaturthi Celebration";
  subTitle.innerText = "HAPPY VINAYAGAR CHATURTHI - நல்ல வாழ்த்துகள்";

  finalCelebration.style.backgroundImage = `url('${imgFinal.src}')`;
  finalCelebration.classList.add("active");

  for (let i = 0; i < 6; i++) {
    setTimeout(() => launchFirework(), i * 250);
  }
}

// Skip Button Listener (Instantly Jump to Next Stage)
if (skipBtn) {
  skipBtn.addEventListener("click", () => {
    if (currentState >= 1 && currentState <= 3) {
      progress = 100;
      isAnimating = false;
      renderDrawing(currentState, 100);
      onDrawingStageComplete();
    }
  });
}

// Speed Toggle Listener (1x -> 3x -> 8x -> 1x)
if (speedBtn) {
  speedBtn.addEventListener("click", () => {
    if (speedMultiplier === 1) speedMultiplier = 3;
    else if (speedMultiplier === 3) speedMultiplier = 8;
    else speedMultiplier = 1;
    speedBtn.innerText = `⚡ ${speedMultiplier}x Speed`;
  });
}

// Interactive Firework Launch on Click
fwCanvas.addEventListener("click", (e) => {
  if (currentState === 4) {
    const rect = fwCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (fwCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (fwCanvas.height / rect.height);
    launchFirework(x, y);
  }
});

// Replay Button Listener
replayBtn.addEventListener("click", () => {
  if (bgAudio) {
    bgAudio.currentTime = 0;
    bgAudio.play();
  }
  startOverlay.classList.remove("hidden-overlay");
  currentState = 0;
  progress = 0;
  isAnimating = false;
  finalCelebration.classList.remove("active");
  hideCursor();
  drawPaperBackground();
  mainTitle.innerText = "✨ Lord Ganesha Festival Art Reveal";
  subTitle.innerText = "Click Start to Begin the Slow Divine Drawing Journey";
  progressFill.style.width = "0%";
  progressPct.innerText = "0%";
});

// Song Toggle Listener
soundToggle.addEventListener("click", () => {
  if (bgAudio) {
    if (bgAudio.paused) {
      bgAudio.play();
      soundToggle.innerText = "🎵 Song: ON";
    } else {
      bgAudio.pause();
      soundToggle.innerText = "🔇 Song: OFF";
    }
  }
});

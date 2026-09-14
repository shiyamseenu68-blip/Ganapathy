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
let tempColorCanvas = document.createElement("canvas");
let tempColorCtx = tempColorCanvas.getContext("2d");

// Automatic Devotional Song Playback Engine
const AUDIO_URL = "https://videotourl.com/audio/1789306599295-2737a983-59f2-473e-b238-2452b12d2272.mp3";

function startSongPlayback() {
  if (!bgAudio) return;
  if (!bgAudio.src || !bgAudio.src.includes("videotourl")) {
    bgAudio.src = AUDIO_URL;
  }
  bgAudio.volume = 1.0;
  bgAudio.play().then(() => {
    soundToggle.innerText = "🎵 Song: ON";
  }).catch(err => {
    console.log("Autoplay error:", err);
  });
}

// Instant Mobile Tap Audio Unlocker
function unlockMobileAudioOnFirstTap() {
  startSongPlayback();
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

document.addEventListener("pointerdown", unlockMobileAudioOnFirstTap, { once: true });
document.addEventListener("touchstart", unlockMobileAudioOnFirstTap, { once: true });

// Web Audio API Synthesizer for Fireworks pops & Divine Temple Bell Chime
let audioCtx = null;

function playTempleBellSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 brass bell note
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, audioCtx.currentTime); // Metallic overtone

    gain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 1.8);
    osc2.stop(audioCtx.currentTime + 1.8);
  } catch (e) {}
}

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

// Fireworks & Golden Petal Confetti Engine
let fwParticles = [];
let fallingPetals = [];

function launchFirework(x, y) {
  const colors = ['#f59e0b', '#fbbf24', '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#fef08a', '#ffffff', '#8b5cf6'];
  const baseColor = colors[Math.floor(Math.random() * colors.length)];
  playFireworkSound();

  const burstX = x || Math.random() * (fwCanvas.width - 100) + 50;
  const burstY = y || Math.random() * (fwCanvas.height / 2.2) + 50;

  for (let i = 0; i < 75; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8.5 + 2.5;
    fwParticles.push({
      x: burstX,
      y: burstY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: baseColor,
      alpha: 1,
      decay: Math.random() * 0.02 + 0.01,
      size: Math.random() * 4.0 + 2.0
    });
  }

  // Add falling gold flower petals / confetti
  for (let i = 0; i < 6; i++) {
    fallingPetals.push({
      x: burstX + (Math.random() * 40 - 20),
      y: burstY,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.1,
      color: Math.random() > 0.5 ? '#fbbf24' : '#fef08a',
      alpha: 1,
      decay: 0.006,
      size: Math.random() * 6 + 4
    });
  }
}

function updateFireworks() {
  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
  if (currentState === 4) {
    if (Math.random() < 0.18) {
      launchFirework();
    }

    // Render Fireworks Particles
    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.x += p.vx;
      p.y += p.vy + 0.16; // gravity
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

    // Render Falling Gold Petals / Confetti
    for (let i = fallingPetals.length - 1; i >= 0; i--) {
      const petal = fallingPetals[i];
      petal.x += petal.vx;
      petal.y += petal.vy;
      petal.rot += petal.vRot;
      petal.alpha -= petal.decay;

      if (petal.alpha <= 0 || petal.y > fwCanvas.height) {
        fallingPetals.splice(i, 1);
      } else {
        fwCtx.save();
        fwCtx.globalAlpha = petal.alpha;
        fwCtx.translate(petal.x, petal.y);
        fwCtx.rotate(petal.rot);
        fwCtx.fillStyle = petal.color;
        fwCtx.fillRect(-petal.size / 2, -petal.size / 4, petal.size, petal.size / 2);
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
  tempColorCanvas.width = 480;
  tempColorCanvas.height = 720;
  drawPaperBackground();
}

// Divine Brush Sparkles & Atmosphere Engine
let strokeParticles = [];
let cursorTargetX = 240, cursorTargetY = 360;
let currentCursorX = 240, currentCursorY = 360;

function emitBrushSparkle(x, y, isColorStage) {
  if (strokeParticles.length > 35) strokeParticles.shift();
  const count = isColorStage ? 2 : 1;
  const allColors = ['#fef08a', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#ffffff'];
  for (let i = 0; i < count; i++) {
    strokeParticles.push({
      x: x + (Math.random() * 16 - 8),
      y: y + (Math.random() * 16 - 8),
      vx: (Math.random() - 0.5) * 2.2,
      vy: -Math.random() * 2.5 - 0.5,
      size: Math.random() * (isColorStage ? 4.5 : 2.5) + 1.2,
      color: allColors[Math.floor(Math.random() * allColors.length)],
      alpha: 1,
      decay: Math.random() * 0.035 + 0.02
    });
  }
}

function updateBrushSparkles() {
  for (let i = strokeParticles.length - 1; i >= 0; i--) {
    const p = strokeParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      strokeParticles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

let sunburstAngle = 0;

function drawPaperBackground() {
  // Pitch Dark Canvas (Matching Reference Image)
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dynamic Rotating Divine Sunburst Light Rays
  sunburstAngle += 0.003;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2.3);
  ctx.rotate(sunburstAngle);
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = '#f59e0b';
  const numRays = 16;
  for (let i = 0; i < numRays; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 480, (i * 2 * Math.PI) / numRays, ((i * 2 + 1) * Math.PI) / numRays);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Divine Glowing Halo Core
  const haloGrad = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2.3, 10,
    canvas.width / 2, canvas.height / 2.3, 290
  );
  haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
  haloGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
  haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = haloGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
// State Switcher
function startState(stateNum) {
  currentState = stateNum;
  progress = 0;
  isAnimating = true;
  finalCelebration.classList.remove("active");

  maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

  if (stateNum === 1) {
    mainTitle.innerText = "✨ First Image (1 of 3)";
    subTitle.innerText = "Stage A: Glowing Fire Sparkler Sketch (Baby Ganesha & Mouse)";
  } else if (stateNum === 2) {
    mainTitle.innerText = "✨ Second Image (2 of 3)";
    subTitle.innerText = "Stage A: Glowing Fire Sparkler Sketch (Hibiscus Flower Ganesha)";
  } else if (stateNum === 3) {
    mainTitle.innerText = "✨ Third Image (3 of 3)";
    subTitle.innerText = "Stage A: Glowing Fire Sparkler Sketch (Four-Armed Seated Ganesha)";
  }

  if (animFrameId) cancelAnimationFrame(animFrameId);
  renderLoop();
}

// Render Animation Loop
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

// Render Drawing Engine
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

  // 1. Pitch Dark & Divine Halo Background
  drawPaperBackground();

  if (pct <= 60) {
    // ==========================================
    // STAGE A: GLOWING GOLDEN FIRE SPARKLER SKETCH (0% - 60%) - 60 FPS Mobile Optimized
    // ==========================================
    const linePct = pct / 60; // 0.0 to 1.0
    subTitle.innerText = `Stage A: Glowing Sparkler Fire Sketch... (${Math.floor(pct)}%)`;

    const numStrokesToDraw = Math.floor(strokes.length * linePct);
    let lastPoint = null;

    // Pass 1: Outer Warm Glow Line
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

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

    // Pass 2: Bright Golden Core Line
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < numStrokesToDraw; i++) {
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
    ctx.restore();

    if (isAnimating && lastPoint) {
      emitBrushSparkle(lastPoint[0], lastPoint[1], false);
      positionCursor(lastPoint[0], lastPoint[1], "🪄");
    } else {
      hideCursor();
    }

  } else {
    // ==========================================
    // STAGE B: REALISTIC ARTIST COLOUR PAINTING (60% - 100%) - 60 FPS Mobile Optimized
    // ==========================================
    const paintPct = (pct - 60) / 40; // 0.0 to 1.0
    subTitle.innerText = `Stage B: Realistic Painting & Gold Reveal... (${Math.floor(pct)}%)`;

    // 1. Render complete glowing gold sketch lines (Fast Dual Pass)
    const lineAlpha = Math.max(0.12, 0.95 - paintPct * 0.78);
    ctx.save();
    ctx.strokeStyle = `rgba(254, 240, 138, ${lineAlpha})`;
    ctx.lineWidth = 2.2;
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
    ctx.restore();

    // 2. Build organic wet-ink watercolor paint mask on offscreen canvas
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.fillStyle = '#000000';
    maskCtx.strokeStyle = '#000000';
    maskCtx.lineWidth = 36 + paintPct * 20;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    const paintStrokesToDraw = Math.floor(strokes.length * paintPct);
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

    // Add soft watercolor bloom spots along current painting strokes
    if (lastPaintPoint) {
      const radGrad = maskCtx.createRadialGradient(
        lastPaintPoint[0], lastPaintPoint[1], 0,
        lastPaintPoint[0], lastPaintPoint[1], 55
      );
      radGrad.addColorStop(0, 'rgba(0,0,0,1)');
      radGrad.addColorStop(0.7, 'rgba(0,0,0,0.8)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      maskCtx.fillStyle = radGrad;
      maskCtx.beginPath();
      maskCtx.arc(lastPaintPoint[0], lastPaintPoint[1], 55, 0, Math.PI * 2);
      maskCtx.fill();
    }

    // Progressive radial fill from image center so entire image gracefully completes
    const centerRadius = Math.sqrt(canvas.width**2 + canvas.height**2) * 0.82 * paintPct;
    const centerGrad = maskCtx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(1, centerRadius)
    );
    centerGrad.addColorStop(0, 'rgba(0,0,0,1)');
    centerGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
    maskCtx.fillStyle = centerGrad;
    maskCtx.beginPath();
    maskCtx.arc(canvas.width / 2, canvas.height / 2, Math.max(1, centerRadius), 0, Math.PI * 2);
    maskCtx.fill();

    // 3. Composite targetImg with paint mask
    tempColorCtx.clearRect(0, 0, tempColorCanvas.width, tempColorCanvas.height);
    tempColorCtx.drawImage(targetImg, 0, 0, canvas.width, canvas.height);
    tempColorCtx.globalCompositeOperation = 'destination-in';
    tempColorCtx.drawImage(maskCanvas, 0, 0);
    tempColorCtx.globalCompositeOperation = 'source-over';

    // Draw masked paint artwork onto main canvas
    ctx.drawImage(tempColorCanvas, 0, 0);

    // Smooth global color fade overlay as progress approaches 100%
    const smoothGlobalBlend = Math.pow(paintPct, 2.0);
    if (smoothGlobalBlend > 0.01) {
      ctx.save();
      ctx.globalAlpha = smoothGlobalBlend;
      ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // 4. Divine Golden Brush Glow & Sparkles at tip position
    if (lastPaintPoint && isAnimating) {
      emitBrushSparkle(lastPaintPoint[0], lastPaintPoint[1], true);

      ctx.save();
      ctx.globalAlpha = 0.6 * (1 - paintPct * 0.4);
      const tipGlow = ctx.createRadialGradient(
        lastPaintPoint[0], lastPaintPoint[1], 2,
        lastPaintPoint[0], lastPaintPoint[1], 42
      );
      tipGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      tipGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
      tipGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(lastPaintPoint[0], lastPaintPoint[1], 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Position Paintbrush cursor
    if (isAnimating && lastPaintPoint && paintPct < 0.98) {
      positionCursor(lastPaintPoint[0], lastPaintPoint[1], "🖌️");
    } else {
      hideCursor();
    }
  }

  // 5. Draw active floating divine sparkles on top
  updateBrushSparkles();

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
  playTempleBellSound();
  mainTitle.innerText = "🎆 Vinayagar Chaturthi Celebration";
  subTitle.innerText = "HAPPY VINAYAGAR CHATURTHI - நல்ல வாழ்த்துகள்";

  finalCelebration.style.backgroundImage = `url('${imgFinal.src}')`;
  finalCelebration.classList.add("active");

  for (let i = 0; i < 12; i++) {
    setTimeout(() => launchFirework(), i * 200);
  }
}

// Universal Touch & Click Event Listener Helper
function attachTouchAndClick(element, callback) {
  if (!element) return;
  let handled = false;
  element.addEventListener("pointerdown", (e) => {
    callback(e);
    handled = true;
    setTimeout(() => { handled = false; }, 350);
  });
  element.addEventListener("click", (e) => {
    if (!handled) callback(e);
  });
}

// Start Button Handler
if (startBtn) {
  attachTouchAndClick(startBtn, (e) => {
    playTempleBellSound();
    startSongPlayback();
    startOverlay.classList.add("hidden-overlay");
    startState(1);
  });
}

// Skip Button Handler
if (skipBtn) {
  attachTouchAndClick(skipBtn, (e) => {
    if (currentState >= 1 && currentState <= 3) {
      progress = 100;
      isAnimating = false;
      renderDrawing(currentState, 100);
      onDrawingStageComplete();
    }
  });
}

// Speed Toggle Handler (1x -> 3x -> 8x -> 15x -> 1x)
if (speedBtn) {
  attachTouchAndClick(speedBtn, (e) => {
    if (speedMultiplier === 1) speedMultiplier = 3;
    else if (speedMultiplier === 3) speedMultiplier = 8;
    else if (speedMultiplier === 8) speedMultiplier = 15;
    else speedMultiplier = 1;
    speedBtn.innerText = `⚡ ${speedMultiplier}x Speed`;
  });
}

// Replay Button Handler
if (replayBtn) {
  attachTouchAndClick(replayBtn, (e) => {
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
}

// Song Toggle Handler
if (soundToggle) {
  attachTouchAndClick(soundToggle, (e) => {
    if (bgAudio) {
      if (bgAudio.paused) {
        startSongPlayback();
      } else {
        bgAudio.pause();
        soundToggle.innerText = "🔇 Song: OFF";
      }
    }
  });
}

// Interactive Firework Launch on Click & Touch (Final Stage)
function handleCanvasTouchOrClick(e) {
  if (currentState === 4) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : (e.clientX || e.pageX);
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : (e.clientY || e.pageY);
    if (clientX !== undefined && clientY !== undefined) {
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      launchFirework(x, y);
    }
  }
}

const canvasViewport = document.querySelector(".canvas-wrapper");
if (canvasViewport) {
  canvasViewport.addEventListener("pointerdown", handleCanvasTouchOrClick);
  canvasViewport.addEventListener("click", handleCanvasTouchOrClick);
}

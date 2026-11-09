/**
 * FunTools - Morse Code Trainer Controller
 */

/* =========================================================================
   Morse Code Dictionary
   ========================================================================= */
const alphamorsedic = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
  F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
  P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--",
  Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
  5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----."
};

const fullAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* =========================================================================
   Web Audio Synthesizer
   ========================================================================= */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playMorseTone(durationMs) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(650, ctx.currentTime);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.005);
  gain.gain.setValueAtTime(0.12, ctx.currentTime + (durationMs / 1000) - 0.005);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + (durationMs / 1000));

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + (durationMs / 1000));
}

function playCorrectSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

function playWrongSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(196, now); // G3
  osc.frequency.exponentialRampToValueAtTime(130.81, now + 0.15); // C3

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

function playLetterMorseSequence(morseStr) {
  const ctx = getAudioContext();
  const dotMs = 80;
  const dashMs = 240;
  const gapMs = 80;

  let delay = 0;
  for (let i = 0; i < morseStr.length; i++) {
    const symbol = morseStr[i];
    const duration = symbol === "-" ? dashMs : dotMs;

    setTimeout(() => {
      playMorseTone(duration);
    }, delay);

    delay += duration + gapMs;
  }
}

/* =========================================================================
   Game State & Metrics
   ========================================================================= */
let currentMode = "GuessMorse"; // "GuessMorse" or "GuessABC"
let currentSecretLetter = "A";
let score = 0;
let streak = 0;
let bestStreak = 0;
let totalAnswered = 0;
let totalCorrect = 0;
let canAnswer = true;

$(document).ready(function() {
  populateDropdowns();
  buildCheatsheetTable();
  generateQuestion();

  $("#starting, #ending").change(function() {
    generateQuestion();
  });

  // Modal Handlers
  $("#hintbtn").click(function() {
    $("#hintsheet").addClass("show");
  });

  $("#closeinfo, #closeinfo-btn").click(function() {
    $("#hintsheet").removeClass("show");
  });

  $("#hintsheet").click(function(e) {
    if ($(e.target).is("#hintsheet")) {
      $("#hintsheet").removeClass("show");
    }
  });

  // Audio Hint Button
  $("#listenAudioBtn").click(function() {
    const morse = alphamorsedic[currentSecretLetter];
    if (morse) {
      playLetterMorseSequence(morse);
    }
  });

  // Global Keyboard listener
  $(document).keydown(function(e) {
    // Ignore keypresses if typing in modal or outside
    if ($("#hintsheet").hasClass("show")) return;

    if (e.key === "Enter") {
      e.preventDefault();
      checkanswer();
    } else if (currentMode === "GuessMorse") {
      if (e.key === "." || e.key === "Period") {
        e.preventDefault();
        dotinput();
      } else if (e.key === "-" || e.key === "Minus") {
        e.preventDefault();
        dashinput();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backspaceInput();
      }
    }
  });
});

/* =========================================================================
   Setup Helpers
   ========================================================================= */
function populateDropdowns() {
  const $start = $("#starting");
  const $end = $("#ending");
  $start.empty();
  $end.empty();

  for (let i = 0; i < fullAlphabet.length; i++) {
    const char = fullAlphabet[i];
    $start.append(`<option value="${i}">${char}</option>`);
    $end.append(`<option value="${i + 1}">${char}</option>`);
  }

  $start.val(0); // A
  $end.val(26);  // Z
}

function buildCheatsheetTable() {
  const $grid = $("#morseAlphabetGrid");
  $grid.empty();

  for (let i = 0; i < fullAlphabet.length; i++) {
    const char = fullAlphabet[i];
    const code = alphamorsedic[char] || "";
    const $tile = $(`
      <div class="morse-tile" title="Click to hear ${char} in Morse">
        <span class="tile-char">${char}</span>
        <span class="tile-code">${code}</span>
      </div>
    `);

    $tile.click(function() {
      playLetterMorseSequence(code);
    });

    $grid.append($tile);
  }
}

/* =========================================================================
   Mode Switcher
   ========================================================================= */
function toggleMode() {
  clearanswer();
  clearFeedback();

  if (currentMode === "GuessMorse") {
    currentMode = "GuessABC";
    $("#modeText").text("Mode: Guess Letter (•− → A)");
    $("#promptLabel").text("Identify this Morse pattern as an Alphabet letter:");
    $("#morseKeypad").hide();
    $("#answer").hide();
    $("#abcInput").show().val("").focus();
  } else {
    currentMode = "GuessMorse";
    $("#modeText").text("Mode: Guess Morse (A → •−)");
    $("#promptLabel").text("Translate this letter into Morse dots and dashes:");
    $("#morseKeypad").show();
    $("#answer").show();
    $("#abcInput").hide();
  }

  generateQuestion();
}

/* =========================================================================
   Input Manipulation
   ========================================================================= */
function dashinput() {
  playMorseTone(180);
  const $ans = $("#answer");
  $ans.text($ans.text() + "-");
}

function dotinput() {
  playMorseTone(70);
  const $ans = $("#answer");
  $ans.text($ans.text() + ".");
}

function backspaceInput() {
  const $ans = $("#answer");
  const current = $ans.text();
  if (current.length > 0) {
    $ans.text(current.slice(0, -1));
  }
}

function clearanswer() {
  $("#answer").text("");
  $("#abcInput").val("");
}

/* =========================================================================
   Question Generation
   ========================================================================= */
function generateQuestion() {
  canAnswer = true;
  clearFeedback();
  clearanswer();

  let startIdx = parseInt($("#starting").val());
  let endIdx = parseInt($("#ending").val());

  if (startIdx >= endIdx) {
    endIdx = startIdx + 1;
    $("#ending").val(endIdx);
  }

  const pool = fullAlphabet.substring(startIdx, endIdx);
  const randomIndex = Math.floor(Math.random() * pool.length);
  currentSecretLetter = pool[randomIndex];

  if (currentMode === "GuessMorse") {
    $("#question").text(currentSecretLetter);
  } else {
    $("#question").text(alphamorsedic[currentSecretLetter]);
    $("#abcInput").val("").focus();
  }
}

/* =========================================================================
   Answer Verification
   ========================================================================= */
function clearFeedback() {
  $("#feedbackBanner").text("").removeClass("success error");
  $(".flashcard").removeClass("flash-correct flash-wrong");
}

function updateMetrics(isCorrect) {
  totalAnswered++;
  if (isCorrect) {
    totalCorrect++;
    score += 10 + Math.min(streak * 2, 20); // Streak bonus
    streak++;
    if (streak > bestStreak) {
      bestStreak = streak;
    }
  } else {
    streak = 0;
  }

  const accuracy = Math.round((totalCorrect / totalAnswered) * 100);

  $("#scoreDisplay").text(score);
  $("#streakDisplay").text(`🔥 ${streak}`);
  $("#bestStreakDisplay").text(bestStreak);
  $("#accuracyDisplay").text(`${accuracy}%`);
}

function checkanswer() {
  if (!canAnswer) return;

  let userAns = "";
  let correctAns = "";

  if (currentMode === "GuessMorse") {
    userAns = $("#answer").text().trim();
    correctAns = alphamorsedic[currentSecretLetter];
  } else {
    userAns = $("#abcInput").val().trim().toUpperCase();
    correctAns = currentSecretLetter;
  }

  if (!userAns) {
    $("#feedbackBanner").text("Please enter your answer first!").addClass("error");
    return;
  }

  canAnswer = false;

  if (userAns === correctAns) {
    playCorrectSound();
    updateMetrics(true);

    $("#feedbackBanner").text("✨ Spot on! Excellent work.").addClass("success");
    $(".flashcard").addClass("flash-correct");

    setTimeout(() => {
      generateQuestion();
    }, 750);
  } else {
    playWrongSound();
    updateMetrics(false);

    const hint = currentMode === "GuessMorse"
      ? `${currentSecretLetter} in Morse is ${correctAns}`
      : `${alphamorsedic[currentSecretLetter]} is letter ${correctAns}`;

    $("#feedbackBanner").text(`Incorrect! ${hint}`).addClass("error");
    $(".flashcard").addClass("flash-wrong");

    setTimeout(() => {
      generateQuestion();
    }, 1500);
  }
}

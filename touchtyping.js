/**
 * FunTools - Touch Typing Trainer Engine
 */

$(document).ready(function() {
  // =========================================================================
  // Game & Telemetry State
  // =========================================================================
  let mistakes = 0;
  let istyping = false;
  let time = 0;
  let timerInterval = null;
  let totalRawMistakes = 0;
  let previousTextLength = 0;
  let totalKeystrokes = 0;
  let soundEnabled = true;

  // Finger placement mapping for the guide
  const fingerMap = {
    // Left hand
    q: "Left Pinky", a: "Left Pinky", z: "Left Pinky", "1": "Left Pinky",
    w: "Left Ring", s: "Left Ring", x: "Left Ring", "2": "Left Ring",
    e: "Left Middle", d: "Left Middle", c: "Left Middle", "3": "Left Middle",
    r: "Left Index", f: "Left Index (Home)", v: "Left Index", t: "Left Index", g: "Left Index", b: "Left Index", "4": "Left Index", "5": "Left Index",
    // Right hand
    y: "Right Index", h: "Right Index", n: "Right Index", u: "Right Index", j: "Right Index (Home)", m: "Right Index", "6": "Right Index", "7": "Right Index",
    i: "Right Middle", k: "Right Middle", ",": "Right Middle", "8": "Right Middle",
    o: "Right Ring", l: "Right Ring", ".": "Right Ring", "9": "Right Ring",
    p: "Right Pinky", ";": "Right Pinky", "/": "Right Pinky", "-": "Right Pinky", "=": "Right Pinky", "[": "Right Pinky", "]": "Right Pinky", "0": "Right Pinky",
    " ": "Thumb (Spacebar)"
  };

  // Expanded Rich Vocabulary Pool
  const words = [
    // Core Connectors
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
    "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if",
    "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him",

    // Technology & Coding
    "code", "data", "web", "node", "loop", "byte", "stack", "react", "build", "cloud", "logic", "debug",
    "cache", "query", "array", "string", "server", "system", "script", "cyber", "design", "stream", "packet",

    // Action & Common Verbs
    "learn", "write", "think", "create", "boost", "focus", "reach", "shine", "spark", "solve", "craft",
    "expand", "rapid", "smooth", "master", "drive", "swift", "clever", "fluid", "sharp", "bright", "glance",

    // Descriptive & Flow Words
    "future", "energy", "motion", "forest", "galaxy", "planet", "nature", "rhythm", "signal", "vector",
    "screen", "cursor", "zenith", "vertex", "matrix", "beacon", "voyage", "summit", "spirit", "simple"
  ];

  // =========================================================================
  // Web Audio Click Synthesizer
  // =========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playClickSound() {
    if (!soundEnabled) return;
    initAudio();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    // Varied subtle frequency for mechanical key click realism
    osc.frequency.setValueAtTime(540 + Math.random() * 80, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Sound toggle button
  $("#soundToggleBtn").click(function() {
    soundEnabled = !soundEnabled;
    $(this).text(soundEnabled ? "🔊 Sound: ON" : "🔈 Sound: OFF");
  });

  // =========================================================================
  // Virtual Keyboard Generator
  // =========================================================================
  const keyboardLayout = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    [" "]
  ];

  function renderVisualKeyboard() {
    const $kb = $("#visualKeyboard");
    $kb.empty();

    keyboardLayout.forEach(row => {
      const $rowDiv = $('<div class="keyboard-row"></div>');
      row.forEach(char => {
        const isSpace = char === " ";
        const displayChar = isSpace ? "SPACEBAR" : char.toUpperCase();
        const keyClass = isSpace ? "key space-key" : "key";
        const $key = $(`<div class="${keyClass}" data-key="${char}">${displayChar}</div>`);
        $rowDiv.append($key);
      });
      $kb.append($rowDiv);
    });
  }

  renderVisualKeyboard();

  function updateVisualTarget(targetChar) {
    $(".key").removeClass("target-key");
    if (!targetChar) return;

    const lower = targetChar.toLowerCase();
    const $targetKey = $(`.key[data-key="${lower}"]`);

    if ($targetKey.length > 0) {
      $targetKey.addClass("target-key");
    }

    const tip = fingerMap[lower] || "Fingers centered on Home Row";
    $("#fingerGuideTip").text(`Target: '${targetChar === " " ? "Space" : targetChar.toUpperCase()}' → ${tip}`);
  }

  // =========================================================================
  // Message / Exercise Generator
  // =========================================================================
  function loadmessage() {
    clearInterval(timerInterval);
    istyping = false;
    time = 0;
    mistakes = 0;
    totalRawMistakes = 0;
    previousTextLength = 0;
    totalKeystrokes = 0;

    $("#timer").text("0s");
    $("#mistakes").text("0");
    $("#wpm").html('0 <small>WPM</small>');
    $("#accuracy").text("100%");

    $("#resultsboard").removeClass("show");
    $("body").css("overflow", "");

    let count = parseInt($("#wordrange").val()) || 25;
    if ($("#wordrange").val() === "custom") {
      count = parseInt($("#customrange").val()) || 30;
      if (count < 5) count = 5;
      if (count > 100) count = 100;
    }

    let generatedWords = [];
    for (let i = 0; i < count; i++) {
      const rIdx = Math.floor(Math.random() * words.length);
      generatedWords.push(words[rIdx]);
    }

    const fullText = generatedWords.join(" ");
    const $wordsContainer = $("#typingwords");
    $wordsContainer.empty();

    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i];
      $wordsContainer.append(`<span data-char="${char}">${char}</span>`);
    }

    const $firstChar = $wordsContainer.find("span").first();
    $firstChar.addClass("active");
    updateVisualTarget($firstChar.attr("data-char"));

    $("#typinginput").prop("disabled", false).val("").focus();
  }

  // Initial load
  loadmessage();

  // Focus redirection
  $("#typingwordpad").click(function() {
    $("#typinginput").focus();
  });

  // Mode Dropdown Listener
  $("#wordrange").change(function() {
    if ($(this).val() === "custom") {
      $("#customrange").fadeIn(200).focus();
    } else {
      $("#customrange").hide();
      loadmessage();
    }
  });

  $("#customrange").on("change blur", function() {
    loadmessage();
  });

  $("#manualRestartBtn, #restartbtn").click(function() {
    loadmessage();
  });

  // =========================================================================
  // Typing Input Engine
  // =========================================================================
  $("#typinginput").on("input", function() {
    playClickSound();

    if (!istyping) {
      istyping = true;
      timerInterval = setInterval(() => {
        time++;
        $("#timer").text(`${time}s`);
        updateWPMAndAccuracy();
      }, 1000);
    }

    const typedVal = $(this).val();
    const typedArr = typedVal.split("");
    const spans = $("#typingwords span");

    // Keystroke tracking
    totalKeystrokes++;
    const currentLength = typedArr.length;
    if (currentLength > previousTextLength) {
      const lastTypedIdx = currentLength - 1;
      const typedChar = typedArr[lastTypedIdx];
      const expectedChar = spans.eq(lastTypedIdx).attr("data-char");

      if (typedChar !== expectedChar) {
        totalRawMistakes++;
      }
    }
    previousTextLength = currentLength;

    spans.removeClass("correct incorrect active");
    mistakes = 0;

    spans.each(function(index) {
      const typedChar = typedArr[index];
      const expectedChar = $(this).attr("data-char");

      if (typedChar == null) {
        $(this).text(expectedChar);
      } else if (typedChar === expectedChar) {
        $(this).text(expectedChar);
        $(this).addClass("correct");
      } else {
        $(this).text(typedChar);
        $(this).addClass("incorrect");
        mistakes++;
      }
    });

    $("#mistakes").text(mistakes);
    updateWPMAndAccuracy();

    // Check completion
    if (typedVal.length >= spans.length) {
      finishTest();
      return;
    }

    // Move active cursor & highlight virtual keyboard
    const nextIdx = typedVal.length;
    const $nextSpan = spans.eq(nextIdx);
    $nextSpan.addClass("active");
    updateVisualTarget($nextSpan.attr("data-char"));
  });

  function updateWPMAndAccuracy() {
    const totalTyped = $("#typinginput").val().length;
    let currentWPM = 0;
    if (time > 0) {
      currentWPM = Math.round((totalTyped / 5) / (time / 60));
      if (!isFinite(currentWPM) || currentWPM < 0) currentWPM = 0;
    }
    $("#wpm").html(`${currentWPM} <small>WPM</small>`);

    // Accuracy calculation
    let accuracyPct = 100;
    if (totalTyped > 0) {
      const correctChars = Math.max(0, totalTyped - totalRawMistakes);
      accuracyPct = Math.round((correctChars / totalTyped) * 100);
      if (accuracyPct < 0) accuracyPct = 0;
    }
    $("#accuracy").text(`${accuracyPct}%`);
  }

  // =========================================================================
  // Completion / Results Board
  // =========================================================================
  function finishTest() {
    clearInterval(timerInterval);
    $("#typinginput").prop("disabled", true);
    $(".key").removeClass("target-key");
    updateWPMAndAccuracy();

    const finalWPM = parseInt($("#wpm").text()) || 0;
    const finalAccuracy = $("#accuracy").text();
    const mode = $("#wordrange").val();

    $("#res-time").text(time);
    $("#res-wpm").text(finalWPM);
    $("#res-accuracy").text(finalAccuracy);
    $("#res-totaltypos").text(totalRawMistakes);

    // Performance Tier Badge
    const $badge = $("#performanceBadge");
    if (finalWPM >= 100) {
      $badge.text("GODLIKE TYPIST ⚡");
    } else if (finalWPM >= 70) {
      $badge.text("MASTER TYPIST 🚀");
    } else if (finalWPM >= 45) {
      $badge.text("PRO TYPIST ✨");
    } else if (finalWPM >= 25) {
      $badge.text("INTERMEDIATE 🌱");
    } else {
      $badge.text("BEGINNER 🎯");
    }

    // High Score tracking
    if (mode !== "custom") {
      const storageKey = "funtools_typing_hs_" + mode;
      let savedHS = parseInt(localStorage.getItem(storageKey) || 0);

      if (finalWPM > savedHS) {
        localStorage.setItem(storageKey, finalWPM);
        savedHS = finalWPM;
        $("#highscore-alert").fadeIn(300);
      } else {
        $("#highscore-alert").hide();
      }

      $("#hs-category").text(mode);
      $("#res-highscore").text(`${savedHS} WPM`);
      $("#highScoreRow").show();
    } else {
      $("#highScoreRow").hide();
      $("#highscore-alert").hide();
    }

    $("#resultsboard").addClass("show");
  }

  // =========================================================================
  // Technique Modal
  // =========================================================================
  $("#cheetsheeton").click(function() {
    $(".cheatsheet").addClass("show");
  });

  $("#cheetsheetoff, #guideGotItBtn").click(function() {
    $(".cheatsheet").removeClass("show");
    $("#typinginput").focus();
  });

  $(".cheatsheet").click(function(e) {
    if ($(e.target).is(".cheatsheet")) {
      $(".cheatsheet").removeClass("show");
      $("#typinginput").focus();
    }
  });

  // Global keydown: Fix the critical bug where 'event' was referenced improperly
  $(document).keydown(function(e) {
    if (e.key === "Tab" || (e.key === "Enter" && $("#resultsboard").hasClass("show"))) {
      e.preventDefault();
      loadmessage();
    }
  });
});

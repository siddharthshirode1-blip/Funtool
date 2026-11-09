/**
 * FunTools - Quick Quiz & MCQ Maker Engine
 */

// Preset Question Banks for Quick Starter Tests
const quizPresets = {
  webdev: [
    {
      q: "Which HTML5 tag is used to specify an independent, self-contained piece of content?",
      options: ["<section>", "<article>", "<aside>", "<main>"],
      answer: 1
    },
    {
      q: "In modern JavaScript, what is the output of typeof NaN?",
      options: ["'undefined'", "'number'", "'NaN'", "'object'"],
      answer: 1
    },
    {
      q: "Which CSS property enables a flexbox or grid container to arrange items?",
      options: ["display", "flex-direction", "align-items", "position"],
      answer: 0
    }
  ],
  cs: [
    {
      q: "What is the decimal equivalent of the 8-bit binary number 00101010?",
      options: ["42", "38", "54", "62"],
      answer: 0
    },
    {
      q: "Which data structure follows the First-In, First-Out (FIFO) principle?",
      options: ["Stack", "Binary Tree", "Queue", "Hash Map"],
      answer: 2
    },
    {
      q: "What is the worst-case time complexity of standard Binary Search?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: 2
    }
  ],
  science: [
    {
      q: "What is the closest planet to the Sun in our Solar System?",
      options: ["Venus", "Mars", "Mercury", "Earth"],
      answer: 2
    },
    {
      q: "Which subatomic particle carries a negative electric charge?",
      options: ["Proton", "Neutron", "Positron", "Electron"],
      answer: 3
    },
    {
      q: "What gas do plants primarily absorb from the atmosphere for photosynthesis?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Methane"],
      answer: 1
    }
  ],
  trivia: [
    {
      q: "In Morse code, what famous international distress signal consists of '... --- ...'?",
      options: ["MAYDAY", "SOS", "HELP", "CQD"],
      answer: 1
    },
    {
      q: "How many bits are in a single standard byte?",
      options: ["4", "8", "16", "32"],
      answer: 1
    },
    {
      q: "Which finger rests on the 'F' home key in standard touch typing?",
      options: ["Left Ring Finger", "Left Thumb", "Left Index Finger", "Right Index Finger"],
      answer: 2
    }
  ]
};

let currentTestData = [];
let questionCount = 0;
let isPreviewMode = false;

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

$(document).ready(function() {
  // Check URL query for incoming test link
  const urlParams = new URLSearchParams(window.location.search);
  const encodedTest = urlParams.get("test");

  if (encodedTest) {
    loadTestFromLink(encodedTest);
  } else {
    $("#creator-mode").show();
    // Start with a friendly preset
    loadPreset("webdev");
  }

  // Creator button listeners
  $("#add-question-btn").click(function() {
    addQuestionBlock();
  });

  $("#preview-test-btn").click(function() {
    previewTest();
  });

  $("#generate-link-btn").click(function() {
    generateShareLink();
  });

  $("#copy-link-btn").click(function() {
    const link = $("#share-link").val();
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      showToast("Shareable link copied to clipboard! 📋");
    });
  });

  // Taker mode listeners
  $("#submit-answer-btn").click(function() {
    submitTestAnswers();
  });

  $("#back-to-editor-btn").click(function() {
    $("#taker-mode").hide();
    $("#creator-mode").fadeIn(200);
  });

  $("#retake-test-btn").click(function() {
    renderTestUI();
  });

  $("#create-own-btn").click(function() {
    window.location.href = window.location.pathname;
  });
});

/* =========================================================================
   Creator Mode Logic
   ========================================================================= */

function addQuestionBlock(questionText = "", options = ["Option 1", "Option 2", "Option 3", "Option 4"], correctIndex = 0) {
  const qId = questionCount;

  let optionsHtml = "";
  options.forEach((optText, optIdx) => {
    optionsHtml += `
      <div class="option-row">
        <label class="radio-correct-wrap" title="Mark this option as the correct answer">
          <input type="radio" name="correct-answer-${qId}" value="${optIdx}" ${optIdx === correctIndex ? "checked" : ""}>
          Correct
        </label>
        <input type="text" class="opt-text" placeholder="Option ${optIdx + 1}" value="${optText}">
        <button type="button" class="delete-option-btn" title="Remove Option" onclick="deleteOption(this)">&times;</button>
      </div>
    `;
  });

  const blockHtml = `
    <div class="question-block" data-qid="${qId}">
      <div class="q-block-header">
        <span class="q-number-title">Question <span class="q-num-label">${$(".question-block").length + 1}</span></span>
        <button type="button" class="delete-question-btn" onclick="deleteQuestion(this)">🗑 Delete</button>
      </div>
      <input type="text" class="question-input" placeholder="Type your question prompt here..." value="${questionText}">
      <div class="options-list-header">Options (Select radio for correct answer):</div>
      <div class="options-list">
        ${optionsHtml}
      </div>
      <button type="button" class="add-option-btn" onclick="addOptionToBlock(${qId})">+ Add Option</button>
    </div>
  `;

  $("#all-questions-container").append(blockHtml);
  questionCount++;
}

function addOptionToBlock(qId) {
  const $block = $(`.question-block[data-qid='${qId}']`);
  const $list = $block.find(".options-list");
  const count = $list.find(".option-row").length;

  const newRow = `
    <div class="option-row">
      <label class="radio-correct-wrap" title="Mark this option as correct answer">
        <input type="radio" name="correct-answer-${qId}" value="${count}">
        Correct
      </label>
      <input type="text" class="opt-text" placeholder="Option ${count + 1}" value="">
      <button type="button" class="delete-option-btn" title="Remove Option" onclick="deleteOption(this)">&times;</button>
    </div>
  `;
  $list.append(newRow);
}

function deleteOption(btn) {
  const $block = $(btn).closest(".question-block");
  const $rows = $block.find(".option-row");

  if ($rows.length <= 2) {
    showToast("Each question needs at least 2 options!");
    return;
  }

  const qId = $block.data("qid");
  $(btn).closest(".option-row").remove();

  // Renumber remaining radio values
  $block.find(".option-row").each(function(idx) {
    $(this).find('input[type="radio"]').val(idx);
    $(this).find(".opt-text").attr("placeholder", `Option ${idx + 1}`);
  });
}

function deleteQuestion(btn) {
  if ($(".question-block").length <= 1) {
    showToast("You need at least one question in your quiz!");
    return;
  }

  $(btn).closest(".question-block").remove();
  renumberQuestions();
}

function renumberQuestions() {
  $(".question-block").each(function(idx) {
    $(this).find(".q-num-label").text(idx + 1);
  });
}

function resetToBlank() {
  $("#all-questions-container").empty();
  questionCount = 0;
  addQuestionBlock("", ["", ""], 0);
  $("#quiz-title-input").val("Custom Quiz");
  showToast("Cleared to blank template");
}

function loadPreset(presetKey) {
  const presetData = quizPresets[presetKey];
  if (!presetData) return;

  $("#all-questions-container").empty();
  questionCount = 0;

  presetData.forEach(item => {
    addQuestionBlock(item.q, item.options, item.answer);
  });

  const titles = {
    webdev: "Web Development Essentials Quiz",
    cs: "Computer Science & Binary Quiz",
    science: "Science & Space Explorer Quiz",
    trivia: "Tech & Cipher Trivia Challenge"
  };

  $("#quiz-title-input").val(titles[presetKey] || "Quick Quiz");
  showToast(`Loaded ${presetKey.toUpperCase()} preset!`);
}

function getValidatedData() {
  const testArray = [];
  let isValid = true;
  let validationMessage = "";

  const title = $("#quiz-title-input").val().trim() || "Quick Knowledge Test";

  $(".question-block").each(function(qIdx) {
    const qId = $(this).data("qid");
    const questionText = $(this).find(".question-input").val().trim();
    const optionsArray = [];
    const correctVal = $(this).find(`input[name='correct-answer-${qId}']:checked`).val();

    $(this).find(".opt-text").each(function() {
      const optVal = $(this).val().trim();
      if (optVal !== "") {
        optionsArray.push(optVal);
      }
    });

    if (!questionText) {
      isValid = false;
      validationMessage = `Question ${qIdx + 1} is missing its question text!`;
      return false;
    }

    if (optionsArray.length < 2) {
      isValid = false;
      validationMessage = `Question ${qIdx + 1} needs at least 2 non-empty options!`;
      return false;
    }

    if (correctVal === undefined) {
      isValid = false;
      validationMessage = `Please select the correct answer radio button for Question ${qIdx + 1}!`;
      return false;
    }

    testArray.push({
      q: questionText,
      options: optionsArray,
      answer: parseInt(correctVal)
    });
  });

  if (!isValid) {
    showToast(validationMessage);
    return null;
  }

  return { title, questions: testArray };
}

/* =========================================================================
   Sharing & Link Generation
   ========================================================================= */

function generateShareLink() {
  const data = getValidatedData();
  if (!data) return;

  const payload = {
    t: data.title,
    q: data.questions,
    createdAt: Date.now()
  };

  const jsonString = JSON.stringify(payload);
  const secretCode = btoa(encodeURIComponent(jsonString));
  const baseUrl = window.location.href.split("?")[0];
  const shareLink = `${baseUrl}?test=${secretCode}`;

  $("#share-box").slideDown();
  $("#share-link").val(shareLink);
  showToast("Link generated! Ready to share.");
}

function previewTest() {
  const data = getValidatedData();
  if (!data) return;

  currentTestData = data.questions;
  isPreviewMode = true;

  $("#creator-mode").hide();
  $("#taker-title").text(`👀 Preview: ${data.title}`);
  $("#exam-mode-badge").text("PREVIEW MODE");
  $("#back-to-editor-btn").show();

  renderTestUI();
}

/* =========================================================================
   Taker Mode Execution
   ========================================================================= */

function loadTestFromLink(base64Data) {
  try {
    const jsonString = decodeURIComponent(atob(base64Data));
    const decodedPayload = JSON.parse(jsonString);

    currentTestData = decodedPayload.q || decodedPayload.questions;
    const title = decodedPayload.t || "Knowledge Test";

    isPreviewMode = false;
    $("#creator-mode").hide();
    $("#taker-title").text(title);
    $("#exam-mode-badge").text("EXAM MODE");
    $("#back-to-editor-btn").hide();

    renderTestUI();
  } catch (error) {
    showToast("This test link appears corrupted. Redirecting to creator...");
    setTimeout(() => {
      window.location.href = window.location.pathname;
    }, 1500);
  }
}

function renderTestUI() {
  $("#taker-mode").fadeIn();
  $("#test-questions-display").empty();
  $("#result-message-container").hide();
  $("#submit-answer-btn").show();

  currentTestData.forEach((item, qIdx) => {
    let optionsHtml = "";

    item.options.forEach((optText, optIdx) => {
      optionsHtml += `
        <label class="taker-option-row">
          <input type="radio" name="taker-ans-${qIdx}" value="${optIdx}">
          <span>${optText}</span>
        </label>
      `;
    });

    const qBlock = `
      <div class="taker-question-block" id="taker-q-${qIdx}">
        <h3>${qIdx + 1}. ${item.q}</h3>
        <div class="taker-options">
          ${optionsHtml}
        </div>
      </div>
    `;

    $("#test-questions-display").append(qBlock);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function submitTestAnswers() {
  let allAnswered = true;

  currentTestData.forEach((item, qIdx) => {
    const selected = $(`input[name='taker-ans-${qIdx}']:checked`).val();
    if (selected === undefined) {
      allAnswered = false;
    }
  });

  if (!allAnswered) {
    showToast("Please answer every question before submitting!");
    return;
  }

  let score = 0;
  const total = currentTestData.length;

  currentTestData.forEach((item, qIdx) => {
    const selected = parseInt($(`input[name='taker-ans-${qIdx}']:checked`).val());
    const $qBlock = $(`#taker-q-${qIdx}`);

    $qBlock.find(".taker-option-row").each(function(optIdx) {
      const $row = $(this);
      const isSelected = optIdx === selected;
      const isCorrect = optIdx === item.answer;

      if (isSelected && isCorrect) {
        $row.addClass("selected-correct");
      } else if (isSelected && !isCorrect) {
        $row.addClass("selected-wrong");
      } else if (isCorrect) {
        $row.addClass("actual-correct");
      }
    });

    if (selected === item.answer) {
      score++;
    }
  });

  // Lock inputs
  $("input[type='radio']").prop("disabled", true);
  $("#submit-answer-btn").hide();

  // Show Grade Card
  const percentage = Math.round((score / total) * 100);
  $("#result-score-box").text(`${score} / ${total} (${percentage}%)`);

  let headline = "Good Effort!";
  if (percentage === 100) headline = "🌟 Perfect Score! Flawless Victory!";
  else if (percentage >= 80) headline = "🎉 Great Job! Outstanding Performance!";
  else if (percentage >= 60) headline = "👍 Solid Work! Passed with Confidence.";
  else headline = "📚 Keep Practicing! You'll Master This.";

  $("#result-headline").text(headline);
  $("#result-summary").text(`You answered ${score} out of ${total} questions correctly.`);
  $("#result-message-container").fadeIn();

  // Scroll smoothly to results card
  document.getElementById("result-message-container").scrollIntoView({ behavior: "smooth" });
}

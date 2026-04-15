$(document).ready(function() {
    
    let currentTestData = []; 
    let questionCount = 0;
    let isPreviewMode = false; // NEW: Track if we are just previewing

    // --- CHECK URL ON LOAD ---
    const urlParams = new URLSearchParams(window.location.search);
    const encodedTest = urlParams.get('test');

    if (encodedTest) {
        loadTestFromLink(encodedTest);
    } else {
        $("#creator-mode").show();
        addQuestionBlock(); 
    }

    // ==========================================
    // CREATOR MODE: ADD/DELETE UI LOGIC
    // ==========================================
    function addQuestionBlock() {
        let qId = questionCount; 
        
        let blockHtml = `
            <div class="question-block" data-qid="${qId}" style="background: #222; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #444; position: relative;">
                <button class="delete-question-btn" style="position: absolute; top: 15px; right: 15px; background: #ff4c4c; padding: 5px 10px; font-size: 0.8rem;">🗑️</button>
                <label>Question ${qId + 1}:</label>
                <input type="text" class="question-input" placeholder="Enter your question here...">
                <label>Options:</label>
                <div class="options-list">
                    <div class="option-row" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <input type="radio" name="correct-answer-${qId}" value="0" checked>
                        <input type="text" class="opt-text" placeholder="Option 1">
                        <button class="delete-option-btn" style="background: transparent; color: #ff4c4c; padding: 0; min-width: 30px; font-size: 1.2rem;">✖</button>
                    </div>
                    <div class="option-row" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <input type="radio" name="correct-answer-${qId}" value="1">
                        <input type="text" class="opt-text" placeholder="Option 2">
                        <button class="delete-option-btn" style="background: transparent; color: #ff4c4c; padding: 0; min-width: 30px; font-size: 1.2rem;">✖</button>
                    </div>
                </div>
                <button class="add-option-btn" data-qid="${qId}">+ Add Option</button>
            </div>
        `;
        $("#all-questions-container").append(blockHtml);
        questionCount++;
    }

    $("#add-question-btn").click(function() { addQuestionBlock(); });

    $(document).on('click', '.add-option-btn', function() {
        let qId = $(this).data('qid');
        let block = $(`.question-block[data-qid='${qId}']`);
        let currentOptionsCount = block.find('.option-row').length;
        
        let newRow = `
            <div class="option-row" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                <input type="radio" name="correct-answer-${qId}" value="${currentOptionsCount}">
                <input type="text" class="opt-text" placeholder="Option ${currentOptionsCount + 1}">
                <button class="delete-option-btn" style="background: transparent; color: #ff4c4c; padding: 0; min-width: 30px; font-size: 1.2rem;">✖</button>
            </div>
        `;
        block.find('.options-list').append(newRow);
    });

    $(document).on('click', '.delete-option-btn', function() {
        let block = $(this).closest('.question-block'); 
        let optionsCount = block.find('.option-row').length;

        if (optionsCount > 2) {
            $(this).closest('.option-row').remove(); 
            block.find('.option-row').each(function(index) {
                $(this).find('input[type="radio"]').val(index);
                $(this).find('.opt-text').attr('placeholder', 'Option ' + (index + 1));
            });
        } else {
            alert("A multiple-choice question needs at least 2 options!");
        }
    });

    $(document).on('click', '.delete-question-btn', function() {
        let totalQuestions = $('.question-block').length;
        if (totalQuestions > 1) {
            $(this).closest('.question-block').remove();
            $('.question-block').each(function(index) {
                $(this).find('label:first').text('Question ' + (index + 1) + ':');
            });
        } else {
            alert("You need at least one question to make a test!");
        }
    });

    // ==========================================
    // DATA VALIDATION HELPER
    // ==========================================
    function getValidatedData() {
        let testArray = [];
        let isValid = true;

        $(".question-block").each(function() {
            let qId = $(this).data('qid');
            let questionText = $(this).find(".question-input").val().trim();
            let optionsArray = [];
            let correctAnswerVal = $(this).find(`input[name='correct-answer-${qId}']:checked`).val();

            $(this).find(".opt-text").each(function() {
                let optVal = $(this).val().trim();
                if(optVal !== "") optionsArray.push(optVal);
            });

            if (!questionText || optionsArray.length < 2 || correctAnswerVal === undefined) {
                isValid = false;
            } else {
                testArray.push({ q: questionText, options: optionsArray, answer: parseInt(correctAnswerVal) });
            }
        });

        if (!isValid) {
            alert("Oops! Make sure every question has text and at least 2 options.");
            return null;
        }
        return testArray;
    }

    // ==========================================
    // NEW: PREVIEW TEST OFFLINE
    // ==========================================
    $("#preview-test-btn").click(function() {
        let testData = getValidatedData();
        if (!testData) return; // Stop if validation failed

        currentTestData = testData;
        isPreviewMode = true;
        
        $("#creator-mode").hide();
        $("#taker-title").text("👀 Preview Mode");
        renderTestUI();
    });

    // ==========================================
    // GENERATE SHAREABLE LINK
    // ==========================================
    $("#generate-link-btn").click(function() {
        let testData = getValidatedData();
        if (!testData) return;

        let hoursUntilExpiry = 24; 
        let expiryTimestamp = Date.now() + (hoursUntilExpiry * 60 * 60 * 1000);

        let finalPayload = { expiresAt: expiryTimestamp, questions: testData };
        let jsonString = JSON.stringify(finalPayload);
        let secretCode = btoa(encodeURIComponent(jsonString)); 
        let baseUrl = window.location.href.split('?')[0]; 
        let longLink = baseUrl + "?test=" + secretCode;

        $("#share-box").slideDown();
        $("#share-link").val("Generating short link... please wait.");
        
        fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longLink)}`)
            .then(response => response.json())
            .then(data => { $("#share-link").val(data.shorturl || longLink); })
            .catch(err => { $("#share-link").val(longLink); });
    });

    // ==========================================
    // TAKER MODE UI RENDERER
    // ==========================================
    function loadTestFromLink(base64Data) {
        try {
            let jsonString = decodeURIComponent(atob(base64Data));
            let decodedPayload = JSON.parse(jsonString);

            if (Date.now() > decodedPayload.expiresAt) {
                alert("⏳ Sorry! This test link has expired.");
                window.location.href = window.location.href.split('?')[0]; 
                return; 
            }

            currentTestData = decodedPayload.questions;
            isPreviewMode = false;
            $("#creator-mode").hide();
            renderTestUI();
        } catch (error) {
            alert("This test link seems to be broken!");
            window.location.href = window.location.href.split('?')[0];
        }
    }

    function renderTestUI() {
        $("#taker-mode").fadeIn();
        $("#test-questions-display").empty();
        $("#result-message").empty();
        $("#submit-answer-btn").show();
        $("#back-to-editor-btn").hide();
        $("#create-own-btn").hide();

        currentTestData.forEach(function(questionObj, qIndex) {
            let qHtml = `
                <div class="taker-question-block" id="tqb-${qIndex}" style="margin-bottom: 30px; background: #222; padding: 20px; border-radius: 10px; border: 2px solid transparent;">
                    <h3>${qIndex + 1}. ${questionObj.q}</h3>
                    <div class="taker-options">
            `;

            questionObj.options.forEach(function(optText, optIndex) {
                qHtml += `
                    <label class="taker-option-row" style="display: block; padding: 10px; border-radius: 5px; margin-bottom: 5px; border: 1px solid #444; transition: 0.3s;">
                        <input type="radio" name="taker-answer-${qIndex}" value="${optIndex}">
                        ${optText}
                    </label>
                `;
            });

            qHtml += `</div></div>`;
            $("#test-questions-display").append(qHtml);
        });
    }

    // ==========================================
    // UPDATED: SUBMIT ANSWER (NOW WITH REVIEW COLORS)
    // ==========================================
    $("#submit-answer-btn").click(function() {
        let score = 0;
        let totalQuestions = currentTestData.length;
        let allAnswered = true;

        // Validation Check
        currentTestData.forEach(function(questionObj, qIndex) {
            let selectedValue = $(`input[name='taker-answer-${qIndex}']:checked`).val();
            if (selectedValue === undefined) allAnswered = false;
        });

        if (!allAnswered) {
            alert("Please answer all the questions before submitting!");
            return;
        }

        // Grading and Coloring Logic
        currentTestData.forEach(function(questionObj, qIndex) {
            let selectedValue = parseInt($(`input[name='taker-answer-${qIndex}']:checked`).val());
            let questionDiv = $(`#tqb-${qIndex}`);

            if (selectedValue === questionObj.answer) {
                score++;
                // Selected Correct - Highlight Green
                questionDiv.find(`input[value='${selectedValue}']`).parent().css({
                    'background-color': 'rgba(0, 255, 204, 0.2)',
                    'border-color': '#00ffcc',
                    'color': '#00ffcc'
                });
            } else {
                // Selected Wrong - Highlight Red
                questionDiv.find(`input[value='${selectedValue}']`).parent().css({
                    'background-color': 'rgba(255, 76, 76, 0.2)',
                    'border-color': '#ff4c4c',
                    'color': '#ff4c4c'
                });
                // Show Actual Correct Answer - Highlight Green
                questionDiv.find(`input[value='${questionObj.answer}']`).parent().css({
                    'background-color': 'rgba(0, 255, 204, 0.2)',
                    'border-color': '#00ffcc',
                    'color': '#00ffcc'
                });
            }
        });

        $("#result-message").html(`Your Score: <span style="color:#00ffcc; font-size: 1.5rem;">${score} / ${totalQuestions}</span>`);
        $(this).hide(); 
        $("input[type='radio']").prop('disabled', true); // Lock inputs

        // Show the correct return button based on mode
        if (isPreviewMode) {
            $("#back-to-editor-btn").show();
        } else {
            $("#create-own-btn").show();
        }
    });

    // ==========================================
    // RETURN BUTTONS
    // ==========================================
    $("#back-to-editor-btn").click(function() {
        $("#taker-mode").hide();
        $("#creator-mode").fadeIn();
        // The data stays exactly as it was in the input fields!
    });

    $("#create-own-btn").click(function() {
        window.location.href = window.location.href.split('?')[0]; 
    });
});
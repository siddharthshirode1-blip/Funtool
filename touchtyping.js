$(document).ready(function(){
    $("#customrange").hide();
    
    // ==== All tracking variables ====
    let mistakes = 0;
    let istyping = false;
    let time = 0;
    let timememory = null;
    let totalRawMistakes = 0; 
    let previousTextLength = 0; 

const words = [
        // --- Grammatical Words ---
        "a", "an", "the", "and", "or", "but", "if", 
        "of", "in", "to", "for", "with", "on", "at", "by", "from", 
        "is", "it", "be", "as", "so", "we", "he", "she", "they", "you", 
        "i", "that", "this", "are", "was", "were", "do", "not", "have",

        // --- Main Words ---
        "apple", "animal", "always", "about", "again",
        "brave", "build", "banana", "basic", "begin",
        "catch", "clever", "cloud", "clean", "color",
        "dance", "dream", "drive", "daily", "doubt",
        "eagle", "every", "energy", "early", "empty",
        "fast", "friend", "future", "false", "fresh",
        "great", "green", "giant", "guess", "glass",
        "happy", "house", "hero", "heavy", "heart",
        "idea", "island", "inside", "image", "issue",
        "jump", "joke", "juice", "joint", "judge",
        "kite", "keep", "kind", "knock", "known",
        "learn", "light", "lucky", "large", "level",
        "magic", "music", "money", "month", "major",
        "never", "night", "nature", "noise", "north",
        "open", "ocean", "orange", "often", "order",
        "peace", "power", "planet", "plant", "piece",
        "quick", "quiet", "queen", "quite", "quote",
        "river", "right", "round", "ready", "reach",
        "smart", "smile", "space", "small", "sound",
        "time", "train", "trust", "today", "thing",
        "under", "uncle", "unique", "until", "usual",
        "voice", "visit", "value", "valid", "video",
        "water", "world", "wonder", "whole", "watch",
        "xray", "xylophone", "xenon", "xerox", "xylem",
        "yellow", "young", "year", "yield", "youth",
        "zebra", "zero", "zone", "zeal", "zoom"
    ];

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playClickSound() {
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'square'; 
        oscillator.frequency.setValueAtTime(700, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); 
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.015);
    }

    // ========================= LOADING MESSAGES =========================
    function loadmessage() {
        //==== Reset game values ====
        clearInterval(timememory);
        istyping = false;
        time = 0;
        mistakes = 0;
        totalRawMistakes = 0; // Reset total typos
        previousTextLength = 0; // Reset keystroke tracker
        
        $("#timer").text(time);
        $("#mistakes").text(mistakes);
        $("#wpm").text("0");

        // UI Resets
        $("#resultsboard").slideUp(); // Hide the results board
        $("#typingwords").removeClass("blur-effect"); // Remove the visual blur

        let messages = "";
        let numbersOfwords = Number($("#wordrange").val());
        if($("#wordrange").val() === "custom"){
            numbersOfwords = Number($("#customrange").val());
        }

        // ==== WordCount in Dashboard ====
        $("#wordscount").text(numbersOfwords);
        
        for(let i = 1; i <= numbersOfwords; i++){
            let randomWordIndex = Math.floor(Math.random() * words.length);
            messages += (words[randomWordIndex] + " "); 
        }
        
        $("#typingwords").empty();
        messages = messages.trim();

        messages.split("").forEach(char =>{
            $("#typingwords").append(`<span data-char="${char}">${char}</span>`);
        });

        // === Animation & Unlock Box ===
        $("#typingwords span").first().addClass("active");
        $("#typinginput").prop("disabled", false).val("").focus(); // Fixed spelling!
    }

    loadmessage();

    // === Auto focus (MOVED OUTSIDE) ===
    $("#typingwordpad").click(function(){
        $("#typinginput").focus();
    });
    
    // Play again button
    $("#restartbtn").click(function(){
        loadmessage();
    });

    // ======================== Range ========================
    $("#wordrange").change(function(){
        if($(this).val() === "custom"){
            $("#customrange").show().focus();
        } else {
            $("#customrange").hide();
            loadmessage();
        }
    });

    $("#customrange").on("change",function(){
        if($(this).val() < 5) { $(this).val(5); }
        else if($(this).val() > 100){ $(this).val(100); }
        loadmessage();
    });

    //======================== OnTyping ===============================
    $("#typinginput").on("input",function(){
        playClickSound();

        if(!istyping){
            istyping = true;
            timememory = setInterval(function(){
                updateTimer();
                updateWPM();
            }, 1000);
        }

        let typedtext = $(this).val().split("");
        let spans = $("#typingwords span");
        
        // --- 🚨 NEW: RAW MISTAKE TRACKER 🚨 ---
        let currentLength = typedtext.length;
        if (currentLength > previousTextLength) {
            // User typed a NEW character (didn't hit backspace)
            let lastCharIndex = currentLength - 1;
            let typedChar = typedtext[lastCharIndex];
            let expectedChar = spans.eq(lastCharIndex).text();
            
            // If the key they just hit doesn't match, log a raw typo!
            if (typedChar !== expectedChar) {
                totalRawMistakes++;
            }
        }
        previousTextLength = currentLength; // Update memory for the next keystroke
        // ---------------------------------------

        spans.removeClass("correct incorrect active");
        mistakes = 0;
        
        spans.each(function(index){
            let typedchar = typedtext[index];
            let expectedchar = $(this).attr("data-char");

            if(typedchar ==  null){
                $(this).text(expectedchar);
                
            } else if (typedchar === expectedchar){
                $(this).text(expectedchar);
                $(this).addClass("correct");
            } else {
                $(this).text(typedchar);
                $(this).addClass("incorrect");

                mistakes++; // This just counts the currently visible red letters
            }
        });

        // ==== THE FINISH LINE ====
        if(typedtext.length === spans.length){
            clearInterval(timememory);
            $("#typinginput").prop("disabled", true);
            spans.removeClass("active");
            
            // 1. Apply the VISUAL BLUR to the text paragraph!
            $("#typingwords").addClass("blur-effect");
            
            updateWPM();
            
            // 2. Load the stats into the results board
            $("#res-time").text(time);
            $("#res-wpm").text($("#wpm").text());
            $("#res-mistakes").text(mistakes);
            $("#res-totaltypos").text(totalRawMistakes); // Show raw typos!
            
            // 3. Show the results board with a cool slide animation
            $("#resultsboard").slideDown();

            return;
        }

        let nextLetterIndex = typedtext.length;
        spans.eq(nextLetterIndex).addClass("active");
        $("#mistakes").text(mistakes);
    });

    // ==================== Timer & WPM ====================
    function updateTimer(){
        time++;
        $("#timer").text(time);
    }

    function updateWPM(){
        let totalTyped = $("#typinginput").val().length;
        if(time > 0){
            let currentWPM = Math.round((totalTyped / 5) / (time / 60));
            if(currentWPM < 0 || !isFinite(currentWPM)){currentWPM = 0;}
            $("#wpm").text(currentWPM);
        }
    }
});

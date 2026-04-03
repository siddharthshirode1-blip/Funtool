/* ================= Dictionary ================= */
const alphamorsedic = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
    F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
    K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
    P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
    U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--",
    Z: "--.."
}

/* ================= Booting up the Game ================= */
let currentMode = "GuessMorse";
let currentSecretLetter = "";

$(document).ready(function(){
    generateQuestion();

    $("#starting, #ending").change(function(){
        generateQuestion();
    });

    let infopanel = document.getElementById("hintsheet");
    let infobutton = document.getElementById("hintbtn");
    let infoClosebutton = document.getElementById("closeinfo")

    infobutton.addEventListener("click",function(){
        infopanel.classList.add("show");
    })

    infoClosebutton.addEventListener("click",function(){
        infopanel.classList.remove("show");
    })
});
/* ================= ModeChecker ================= */
function toggleMode(){
    if(currentMode === "GuessMorse"){
        currentMode = "GuessABC";
        document.getElementById("modebtn").innerText = "Mode: Guess ABC";

        document.querySelector(".answerbtns").style.display = "none";
        document.getElementById("answer").style.display = "none";
        document.getElementById("abcInput").style.display = "inline-block";
    } else{
        currentMode = "GuessMorse";
        document.getElementById("modebtn").innerText = "Mode: Guess Morse";
        document.querySelector(".answerbtns").style.display = "flex";
        document.getElementById("answer").style.display = "inline-block";
        document.getElementById("abcInput").style.display = "none";
    }
    generateQuestion();
}

/* ================= Button Controls ================= */
// Notice we use .innerText instead of .innerHTML!
function dashinput() { document.getElementById("answer").innerText += "-"; }
function dotinput() { document.getElementById("answer").innerText += "."; }
function clearanswer() {
    document.getElementById("answer").innerText = "";
    document.getElementById("abcInput").value = "";
 }

/* ================= Question Logic ================= */
// function generateQuestion() {
//     // Get the numbers from the dropdowns (Subtract 1 from Start so it matches JS arrays starting at 0)
//     let startIdx = parseInt(document.getElementById("starting").value) - 1;
//     let endIdx = parseInt(document.getElementById("ending").value);

//     // Safety check: If they select Z for Start and A for End, fix it automatically
//     if (startIdx >= endIdx) { endIdx = startIdx + 1; }

//     let fullAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
//     // Slice out ONLY the letters the user wants to practice
//     let practicePool = fullAlphabet.substring(startIdx, endIdx);

//     // Pick one random letter from that specific pool
//     let randomIndex = Math.floor(Math.random() * practicePool.length);
//     let randomLetter = practicePool[randomIndex];

//     // Put it on the screen and clear the old answer
//     document.getElementById("question").innerText = randomLetter;
//     clearanswer(); 
// }
function generateQuestion(){
    let startid = parseInt(document.getElementById("starting").value) - 1;
    let endid = parseInt(document.getElementById("ending").value);

    if(startid >= endid){
        endid = startid + 1;
    }

    let fullalphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let practiceRange = fullalphabets.substring(startid, endid);

    let randomindex = Math.floor(Math.random() * practiceRange.length);
    currentSecretLetter = practiceRange[randomindex];
    if(currentMode === "GuessMorse"){
        document.getElementById("question").innerText = currentSecretLetter;
    } else {
        document.getElementById("question").innerText = alphamorsedic[currentSecretLetter]
    }
    clearanswer();
}

/* ================= Checking Answer ================= */
function checkanswer(){
    let quest = document.getElementById("question").innerText;
    let userAns = "";
    let correctAns = "";
    // let quest = document.getElementById("question").innerText;
    // let userAns = document.getElementById("answer").innerText;

    if(currentMode === "GuessMorse"){
        userAns = document.getElementById("answer").innerText;
        correctAns = alphamorsedic[currentSecretLetter];
    } else{
        userAns = document.getElementById("abcInput").value.toUpperCase();
        correctAns = currentSecretLetter;
    }
    
    if(correctAns == userAns){
        alert("Correct!");
        generateQuestion();
    } else{
        alert("Oops! Try again. " + quest + " is " + correctAns);
        clearanswer();
    }
}
// ===================== HintButton =======================


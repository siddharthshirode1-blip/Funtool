$(document).ready(function(){
    $("#card1").mouseenter(function(){
        $("#cardimg").css({
            "background-image": "url('Images/Morse_code.webp')"
        })
        $("#cardinfo").html("<strong>Morse_Code:</strong><br><p>Learn or Convert into the language of dot and dash")
    });

    $("#card2").mouseenter(function(){
        $("#cardimg").css({
            "background-image": "url('Images/Binary.png')"
        })
        $("#cardinfo").html("<h1>Locked</h1><br><strong>Binary:</strong><br><p>Learn or Convert into 1 & 0's")
    })

    $("#card3").mouseenter(function(){
        $("#cardimg").css({
            "background-image": "url('Images/Touch_typing.webp')"
        })
        $("#cardinfo").html("<h1>Locked</h1><br><strong>TouchTying:</strong><br><p>Learn and Type as a professional")
    })

    let panel = document.getElementById("aboutpanel");

    let aboutbtn = document.getElementById("about");

    aboutbtn.addEventListener("click",function(){
        panel.classList.add("show");
    });

    let aclosebtn = document.getElementById("closebtn");
    aclosebtn.onclick = function(){
        panel.classList.remove("show");
    }
})


// let aboutBtn = document.getElementById("about");
// let panel = document.getElementById("aboutpanel");
// let closeBtn = document.getElementById("closebtn");

// aboutBtn.onclick = function(){
//   panel.classList.add("show");
// }

// closeBtn.onclick = function(){
//   panel.classList.remove("show");
// }

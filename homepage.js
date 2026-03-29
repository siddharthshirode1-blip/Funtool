$(document).ready(function(){
    $(".card").mouseenter(function(){

        let hoverdata = $(this).attr("data-info");
        let hoverimg = $(this).attr("data-img");
        
        $("#cardimg").css({
            "background-image": "url('" + hoverimg + "')"
        })

        $("#cardinfo").html(hoverdata)
    });

    // $("#card2").mouseenter(function(){
    //     $("#cardimg").css({
    //         "background-image": "url('/')"
    //     })
    //     $("#cardinfo").html("    ")
    // })

    // $("#card3").mouseenter(function(){
    //     $("#cardimg").css({
    //         "background-image": "url('/')"
    //     })
    //     $("#cardinfo").html("")
    // })

    // let panel = document.getElementById("aboutpanel");

    // let aboutbtn = document.getElementById("about");

    // aboutbtn.addEventListener("click",function(){

    //     panel.classList.add("show");
    // });
    $("#about").click(function(event){
        event.preventDefault();
        $("#aboutpanel").addClass("show");
    });

    // let aclosebtn = document.getElementById("closebtn");
    // aclosebtn.onclick = function(){
    //     panel.classList.remove("show");
    // }
    $("#closebtn").click(function(){
        $("#aboutpanel").removeClass("show");
    });
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
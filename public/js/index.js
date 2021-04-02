
var header = document.querySelector("#navigation");
var btns = header.querySelectorAll(".nav-item");

for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";

  });
}

$( window ).resize(function() {
  if ($(window).width() > 890){
      $("#navtoggle").css("display","flex");
  }
  else
  {
      $("#navtoggle").css("display","none");
  }
});


$(document).ready(function(){
  $("#navbutton").click(function(){
    $("#navtoggle").slideToggle("slow");
    
  });
});
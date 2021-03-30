
var header = document.querySelector("#navigation");
var btns = header.querySelectorAll(".nav-item");

for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {

    var current2 = document.getElementsByClassName("active2");
    current2[0].className = current2[0].className.replace(" active2", "");
    this.className += " active2";

    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";

  });
}

var btns2 = header.querySelectorAll(".nav-item2");

for (var i = 0; i < btns2.length; i++) {
  btns2[i].addEventListener("click", function() {

  var current2 = document.getElementsByClassName("active2");
  current2[0].className = current2[0].className.replace(" active2", "");
  this.className += " active2";

  var current = document.getElementsByClassName("active");
  current[0].className = current[0].className.replace(" active", "");
  this.className += " active";
  });
}


$(document).ready(function(){
  $("#navbutton").click(function(){
    $("#navtoggle").slideToggle("slow");
    console.log(document.querySelector('#navtoggle').style.display);
  });
});
console.log('connected');
var header = document.querySelector("#navigation");
var btns = header.querySelectorAll(".nav-item");
console.log(btns);
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
  var current = document.getElementsByClassName("active");
  current[0].className = current[0].className.replace(" active", "");
  this.className += " active";
  });
}
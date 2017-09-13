function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function testCollisionRectRect(rect1,rect2) {
  return rect1.x <= rect2.x+rect2.width 
    && rect2.x <= rect1.x+rect1.width
    && rect1.y <= rect2.y + rect2.height
    && rect2.y <= rect1.y + rect1.height;
}
function getDistanceBetween (position1,position2) {
  var a = position1.x - position2.x;
  var b = position1.y - position2.y;
  return Math.sqrt(a*a + b*b);
}



// related to index
window.onload = function () {
    var sizeInput = document.getElementById("gameOptions-sizeInput");
    sizeInput.oninput = function (e) {
        var value = parseInt(this.value);
        var maxSize = GAME.gameInstance.mapMaxSize;
        var minSize = GAME.gameInstance.mapMinSize;
        if(!isNaN(value)) {
            if(value < minSize || value > maxSize) this.style.background = "red";
            else this.style.background = "#4dff88";
        }
        else this.style.background = "red";
    }
}
function ShowHideInstructions () {
    var text = document.getElementById("instructions-text");
    if(text.style.visibility == "hidden" || text.style.visibility ==  "")
        text.style.visibility = "visible";
    else text.style.visibility = "hidden";
}











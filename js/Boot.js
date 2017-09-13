var GAME;
// IMAGES
var IMGS = {};
IMGS.loaded = 0;
IMGS.ready = false;
IMGS.checkLoad = function () {
    IMGS.loaded++;
    if (IMGS.loaded == Object.keys(IMGS.images).length) {
    	IMGS.ready = true;
    }
}       
IMGS.images = {
    water: new Image(),
    terrain: new Image(),
    wall: new Image(),
    heart: new Image(),
};
IMGS.images.water.src = ('assets/water.png');
IMGS.images.terrain.src = ('assets/terrain.png');
IMGS.images.wall.src = ('assets/wall.png');
IMGS.images.heart.src = ('assets/heart.png');

for (var i in IMGS.images) {
    IMGS.images[i].addEventListener('load', IMGS.checkLoad, false);
}

// Creates GAME and assigns properties
function CreateGAME (canvas) {
    GAME = new _GAME();
    GAME.canvas = canvas;
    GAME.ctx = canvas.getContext("2d");
    GAME.width = canvas.width;
    GAME.height = canvas.height;
    GAME.mp3 = new musicPlayer(); 
    GAME.UI = {
        menu: new MenuUI(),
        game: new GameUI(),
    }
    //
    HandleCanvasClicks();
    GAME.changeState("on_menu","boot");
}

// LOADER
var interval = setInterval(function () {
    var canvas = document.getElementById("gameCanvas");
    if(canvas != undefined && IMGS.ready) {
        CreateGAME(canvas); 
        clearInterval(interval);          
    }
},1000) 

 
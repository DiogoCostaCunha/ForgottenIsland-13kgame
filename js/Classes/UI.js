var MiniMap = function () {
    // external vars
    var canvas = GAME.canvas;
    var ctx = GAME.ctx;
    var gameInstance = GAME.gameInstance;
    var world = gameInstance.world;
    var maps = world.maps;
    // draw map container
    var self = {
        width: canvas.width,
        height: canvas.height,
        mapSize: null,
        tileSize: null,
        offSet: 10,
    }
    //
    self.mapSize = self.width / maps.length;
    self.tileSize = (gameInstance.tileSize * self.mapSize) / self.width;
    self.sizeIncrease = maps.length / 1.5;
    //
    self.open = function () {
        // don't open if in CD
        if(gameInstance.mapActualCD > 0) return;
        // reset cooldown when map closes
        if(gameInstance.paused == true) gameInstance.mapActualCD = gameInstance.mapStartCD;
        // pause and unpause game
        gameInstance.paused = !gameInstance.paused;
        ctx.save();
        // fill the background
        ctx.fillStyle = "#b3ffec";
        ctx.fillRect(0,0,self.width,self.height);
        // draw the map walls and bounds
        for(var y = 0; y < maps.length; y++) {
            var tileOffSet = self.tileSize * y;
            for(var x = 0; x < maps[y].length; x++) {
                var mapArray = maps[y][x].mapArray;
                for(var yy = 0; yy < mapArray.length; yy++) {
                    for(var xx = 0; xx < mapArray[yy].length; xx++) {
                        ctx.fillStyle = "#33ccff";
                        if(mapArray[yy][xx] == "0") ctx.fillRect(x*self.mapSize + xx*self.tileSize,(y*self.mapSize +yy*self.tileSize) - tileOffSet + self.offSet,self.tileSize,self.tileSize);
                        else {
                            ctx.fillStyle = "white";
                            ctx.fillRect(x*self.mapSize + xx*self.tileSize,(y*self.mapSize +yy*self.tileSize) - tileOffSet + self.offSet,self.tileSize,self.tileSize);
                        }
                    }
                }
                ctx.strokeRect(x*self.mapSize,(y*self.mapSize) - tileOffSet + self.offSet,self.mapSize,self.mapSize-self.tileSize);
            }
        } 
        // required vars
        var player = gameInstance.player;
        var playerSize = (player.width*self.mapSize) / self.width;
        //
        var collectibles = world.collectibles;
        var collectiblesSize = (15*self.mapSize) / self.width;
        // 
        var finish = world.finish;
        var finishSize = (30*self.mapSize) / self.width;
        // get player map and collectibles map location 
        for(var y = 0; y < maps.length; y++) {
            var tileOffSet = self.tileSize * y;
            for(var x = 0; x < maps[y].length; x++) {
                if(maps[y][x].id == gameInstance.map.id) {
                    var playerMap = {x:x,y:y};
                    // draw player
                    ctx.fillStyle = "green";
                    ctx.fillRect( (playerMap.x*self.mapSize) + ((player.x*self.mapSize) / self.width), (playerMap.y*self.mapSize) + ((player.y*self.mapSize) / self.height) - tileOffSet + self.offSet, playerSize*self.sizeIncrease,playerSize*self.sizeIncrease);
                } 
                if(maps[y][x].id == gameInstance.finish.mapId) {
                    var finishMap = {x:x,y:y};
                    var finish = gameInstance.finish;
                    // draw finish
                    ctx.fillStyle = "#004d00";
                    ctx.fillRect( (finishMap.x*self.mapSize) + ((finish.x*self.mapSize) / self.width), (finishMap.y*self.mapSize) + ((finish.y*self.mapSize) / self.height) - tileOffSet + self.offSet, finishSize*self.sizeIncrease,finishSize*self.sizeIncrease);
                } 
                // collectibles
                for(var k in Collectible.list) {
                    if(maps[y][x].id == Collectible.list[k].mapId) {
                        var collectible = Collectible.list[k];
                        if(collectible.collected) continue;
                        var mapPos = {x:x,y:y};
                        ctx.fillStyle = "#ffcc00";
                        ctx.fillRect( (mapPos.x*self.mapSize) + ((collectible.x*self.mapSize) / self.width), (mapPos.y*self.mapSize) + ((collectible.y*self.mapSize) / self.height) - tileOffSet + self.offSet, collectiblesSize*self.sizeIncrease,collectiblesSize*self.sizeIncrease);
                    }
                }
            }
        }
        ctx.restore();
    }
    return self;
}

var MenuUI = function () {
    // ext.vars
    var canvas = GAME.canvas;
    var ctx = GAME.ctx;
    var images = GAME.images;
    // 
    var self = {
        title: {
            string: "Forgotten island",
            stringFont: "56px papyrus",
            stringColor: "white",
            pos: {x:12,y:100},
            subString: "- by PhasedEvolution",
            subStringFont: "24px papyrus",
        },
        playButton: {
            string: "Play",
            stringColor: "white",
            stringFont: "30px Arial",
            width: 200,
            height: 50,
            pos: {x:(canvas.width-200)/2,y:307},
            buttonColor: "#ff1a1a",
        }
    }
    self.draw = function () {
        ctx.save();
        self.drawBackground();
        self.drawTitle();
        self.drawMapSizeOption();
        self.drawPlayButton();
        ctx.restore();
    }
    self.drawBackground = function () {
        var tileNumberX = canvas.width / 30; 
        var tileNumberY = canvas.height / 30;
        for(var y = 0; y < tileNumberY; y++) {
            for(var x = 0; x < tileNumberX; x++) {
                if(y == tileNumberY-1 || y == 0) {
                    if( (x == 6 || x==7) && y == tileNumberY - 1) ctx.drawImage(images.terrain,x*30,y*30);
                    else ctx.drawImage(images.wall,x*30,y*30);
                }
                else ctx.drawImage(images.water,x*30,y*30);
            }
        }
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "green";
        ctx.fillRect(6*30,canvas.height-6,60,6);
        ctx.globalAlpha = 1.0;
    }
    self.drawTitle = function () {
        var title = self.title;
        ctx.font = title.stringFont;
        ctx.fillStyle = title.stringColor;
        ctx.fillText(title.string,title.pos.x,title.pos.y);
        ctx.font = title.subStringFont;
        ctx.fillText(title.subString,title.pos.x + 45,title.pos.y+40);
    },
    self.drawMapSizeOption = function () {
        var sizeOptionDiv = document.getElementById("gameOptions-sizeDiv");
        sizeOptionDiv.style.display = "block";
    }
    self.drawPlayButton = function () {
        var playButton = self.playButton;
        ctx.fillStyle = playButton.buttonColor;
        ctx.fillRect(playButton.pos.x,playButton.pos.y,playButton.width,playButton.height);
        ctx.font = playButton.stringFont;
        ctx.fillStyle = playButton.stringColor;
        ctx.fillText(playButton.string,playButton.pos.x + 70,playButton.pos.y + 37);
    }
    return self;
}

var GameUI = function () {
    // ext.vars
    var canvas = GAME.canvas;
    var ctx = GAME.ctx;
    var gameInstance = GAME.gameInstance;
    var images = GAME.images;
    // 
    var self = {
        bottomContainer: {
            pos: {x:0,y:canvas.height-gameInstance.tileSize},
            barColor: "brown",
            width: canvas.width,
            height: gameInstance.tileSize,
        },
        hp: {
            pos: {x:5,y:canvas.height-26},
            barColor: "red",
            width: 150,
            height: 9,
        },
        stamina: {
            pos: {x:5,y:canvas.height-12},
            barColor: "green",
            width: 150,
            height: 9,
        },
        mapIcon: {
            pos: {x:300,y:canvas.height-27},
            width: 24,
            height: 24,
            fillColor: "#b3ffff",
            CDfillColor: "#ff6666",
            strokeColor: "black",
            string: "M",
            stringFont: "24px Arial",
            stringColor: "#ffcc00",
        },
        livesStats: {
            stringFont: "15px Arial",
            stringColor: "white",
            img: images.heart,
            pos: {x:165,y:canvas.height-30},
            width: 15,
            height: 15,
        },
        collectiblesStats: {
            string: "x",
            stringFont: "20px Arial",
            collectibleFill: "#ffcc00",
            stringColor: "white",
            collectibleStroke: "blue",
            pos: {x:385,y:canvas.height-24},
            width: 18,
            height: 18,
        },
        barDetails: {
            pos:{x: 210, y: canvas.height - 28},
            fillColor: "black",
            strokeColor: "black",
            height: 30,
            width: 1,
        },
        playTime: {
            stringFont: "26px Arial",
            stringColor: "white",
            pos: {x:185,y:20},
            parseGametime: function (seconds) {
                var minutes = Math.floor(seconds/60);
                var hours = Math.floor(minutes/60);
                seconds = seconds % 60;
                minutes = minutes % 60;
                var time = (hours ? (hours > 9 ? hours : "0" + hours) : "00")
                + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00")
                + ":" + (seconds > 9 ? seconds : "0" + seconds);
                return time;
            }
        },
        escapeMenu: {
            string: "Press 'esc' again to continue",
            stringColor: "black",
            stringFont: "30px Arial",
            pos: {x:21,y:canvas.height / 2},
        },
        finishUI: {
            width: 300,
            height: 120,
            fillColor: "#4d88ff",
            string1Font: "40px papyrus",
            string1Color: "#ffd11a",
            string2Color: "black",
            string2Font: "25px papyrus",
            string1: "Congratulations!",
            string2: "Press any key...",
            pos:{x:null,y:null},
        },
        gameOverUI: {
            width: 300,
            height: 120,
            fillColor: "#888844",
            string1Font: "40px papyrus",
            string1Color: "#ff0000",
            string2Color: "white",
            string2Font: "25px papyrus",
            string1: "Game Over!",
            string2: "Press any key...",
            pos:{x:null,y:null},
        },
        atkEffectUI: {
            pos:{x:210,y:canvas.height-11},
            string: "ATK",
            stringColor: "white",
            stringFont: "15px papyrus",
        }
    }
    // finishUI 
    var fUI = self.finishUI;
    self.finishUI.pos.x = (canvas.width - fUI.width) / 2;
    self.finishUI.pos.y = 130;
    // gameOverUI
    var gUI = self.gameOverUI;
    self.gameOverUI.pos.x = (canvas.width - gUI.width) / 2;
    self.gameOverUI.pos.y = 130;
    self.draw = function () {
        ctx.save();
        self.drawBottomContainer();
        self.drawHp();
        self.drawStamina();
        self.drawMapIcon();
        self.drawLivesStats();
        self.drawCollectiblesStats();
        self.drawGameTime(); 
        self.drawAtkEffect();
        ctx.restore();
    },
    self.drawBottomContainer = function () {
        var bC = self.bottomContainer;
        ctx.fillStyle = bC.barColor;
        ctx.fillRect(bC.pos.x,bC.pos.y,bC.width,bC.height);
        ctx.strokeRect(bC.pos.x,bC.pos.y,bC.width,bC.height);
    }
    self.drawHp = function () {
        var hp = self.hp;
        var player = gameInstance.player;
        ctx.fillStyle = "white";
        ctx.fillRect(hp.pos.x,hp.pos.y,hp.width,hp.height);
        ctx.fillStyle = hp.barColor;
        ctx.fillRect(hp.pos.x,hp.pos.y,hp.width*(player.HPactual/player.HPstart),hp.height);
        ctx.strokeRect(hp.pos.x,hp.pos.y,hp.width,hp.height);
    }
    self.drawStamina = function () {
        var stamina = self.stamina;
        var player = gameInstance.player;
        ctx.fillStyle = "white";
        ctx.fillRect(stamina.pos.x,stamina.pos.y,stamina.width,stamina.height);
        ctx.fillStyle = stamina.barColor;
        ctx.fillRect(stamina.pos.x,stamina.pos.y,stamina.width*(player.staminaActual/player.staminaStart),stamina.height);
        ctx.strokeRect(stamina.pos.x,stamina.pos.y,stamina.width,stamina.height);
    },
    self.drawLivesStats = function () {
        var livesStats = self.livesStats;
        // text and element position according to text size;
        var textPosition;
        var posX;
        if(gameInstance.livesNumber >= 10) {posX = livesStats.pos.x + 10; textPosition = posX - 4}
        else {posX = livesStats.pos.x; textPosition = posX + 11;};
        //
        ctx.drawImage(livesStats.img,livesStats.pos.x,livesStats.pos.y,livesStats.img.width*1.1,livesStats.img.height*1.1);
        ctx.font = livesStats.stringFont;
        ctx.fillStyle = livesStats.stringColor;
        ctx.fillText(gameInstance.livesNumber,textPosition,livesStats.pos.y + 20);
    },
    self.drawMapIcon = function () {
        var mapIcon = self.mapIcon;
        ctx.fillStyle = mapIcon.fillColor;
        ctx.fillRect(mapIcon.pos.x,mapIcon.pos.y,mapIcon.width,mapIcon.height);
        ctx.strokeColor = mapIcon.strokeColor;
        ctx.strokeRect(mapIcon.pos.x,mapIcon.pos.y,mapIcon.width,mapIcon.height);
        ctx.font = mapIcon.stringFont;
        ctx.fillStyle = mapIcon.stringColor;
        ctx.fillText(mapIcon.string,mapIcon.pos.x + 2,mapIcon.pos.y + 20);
        // map cooldown
        var CDWidth = (gameInstance.mapActualCD / gameInstance.mapStartCD) * mapIcon.width;
        ctx.save();
        ctx.globalAlpha = "0.8";
        ctx.fillStyle = mapIcon.CDfillColor;
        ctx.fillRect(mapIcon.pos.x,mapIcon.pos.y,CDWidth,mapIcon.height);
        ctx.restore();
    },
    self.drawCollectiblesStats = function () {
        var collectibles = self.collectiblesStats;
        // text and element position according to text size;
        var textPosition;
        var posX;
        if(gameInstance.startCollectiblesNumber >= 10) {posX = collectibles.pos.x; textPosition = posX - 43}
        else {posX = collectibles.pos.x; textPosition = posX - 33;};
        //
        ctx.fillStyle = collectibles.collectibleFill;
        ctx.fillRect(posX,collectibles.pos.y,collectibles.width,collectibles.height);
        ctx.strokeStyle = collectibles.collectibleStroke;
        ctx.strokeRect(posX,collectibles.y,collectibles.width,collectibles.height);
        ctx.font = collectibles.stringFont;
        ctx.fillStyle = collectibles.stringColor;
        var collectiblesDifference = gameInstance.startCollectiblesNumber - gameInstance.actualCollectiblesNumber;
        ctx.fillText(collectibles.string + " " + collectiblesDifference,textPosition,collectibles.pos.y + 15.5);
    }
    self.drawGameTime = function () {
        var playTime = self.playTime;
        ctx.font = playTime.stringFont;
        ctx.fillStyle = playTime.stringColor;
        ctx.fillText(playTime.parseGametime(gameInstance.gameTime),playTime.pos.x - 25,playTime.pos.y + 13);
    },
    // not drawn in update loop
    self.drawEscapeMenu = function () {
        gameInstance.paused = !gameInstance.paused;
        var menu = self.escapeMenu;
        ctx.font = menu.stringFont;
        ctx.fillStyle = menu.stringColor;
        ctx.fillText(menu.string,menu.pos.x,menu.pos.y);
    },
    self.drawFinishUI = function () {
        var fUI = self.finishUI;
        ctx.fillStyle = fUI.fillColor;
        ctx.fillRect(fUI.pos.x,fUI.pos.y,fUI.width,fUI.height);
        ctx.font = fUI.string1Font;
        ctx.fillStyle = fUI.string1Color;
        ctx.fillText(fUI.string1,fUI.pos.x + 5,fUI.pos.y + 38);
        ctx.fillStyle = fUI.string2Color;
        ctx.font = fUI.string2Font;
        ctx.fillText(fUI.string2,fUI.pos.x + 63,fUI.pos.y + 100);
    },
    self.drawGameOverUI = function () {
        var gUI = self.gameOverUI;
        ctx.fillStyle = gUI.fillColor;
        ctx.fillRect(gUI.pos.x,gUI.pos.y,gUI.width,gUI.height);
        ctx.font = gUI.string1Font;
        ctx.fillStyle = gUI.string1Color;
        ctx.fillText(gUI.string1,gUI.pos.x + 40,gUI.pos.y + 38);
        ctx.fillStyle = gUI.string2Color;
        ctx.font = gUI.string2Font;
        ctx.fillText(gUI.string2,gUI.pos.x + 63,gUI.pos.y + 100);
    },
    self.drawAtkEffect = function () {
        var atkEf = self.atkEffectUI;
        var player = gameInstance.player;
        ctx.font = atkEf.stringFont;
        ctx.fillStyle = atkEf.stringColor;
        ctx.fillText(atkEf.string,atkEf.pos.x,atkEf.pos.y);
        ctx.font = "23px papyrus";
        ctx.fillText("x" + player.atkLevel,atkEf.pos.x + 50,atkEf.pos.y+2)
    }
    return self;
}


function HandleCanvasClicks () {
    var canvas = GAME.canvas;
    var rect = canvas.getBoundingClientRect();
    var menuUI = GAME.UI.menu;
    var playBtn = menuUI.playButton;
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height; 
    canvas.onclick = function (e) {
        var clickX = (e.clientX - rect.left) * scaleX;
        var clickY = (e.clientY - rect.top) * scaleY;
        // Applies to menu
        if(GAME.states.on_menu == true) {
            if(clickX >= playBtn.pos.x && clickX <= playBtn.pos.x + playBtn.width && clickY >= playBtn.pos.y && clickY <= playBtn.pos.y + playBtn.height) {
                GAME.changeState("on_game");
            }
        }
    }

}
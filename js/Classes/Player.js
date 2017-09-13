var Player = function () {
    var self = new Actor(0,0,null);
    // 
    var gameInstance = GAME.gameInstance;
    var world = gameInstance.world;
    var canvas = GAME.canvas;
    var gameUI = GAME.UI.game;
    // 
    self.width = 10;
    self.height = 10,
    self.fillColor = "green",
    self.strokeColor = "black";
    //
    self.alive = true;
    self.type = "Player";
    //
    self.moveSpeed = 2.5;
    self.sprintSpeed = 3.7;
    self.HPstart = 100;
    self.HPactual = self.HPstart;
    // 
    self.staminaStart = 100;
    self.staminaActual = self.staminaStart;
    self.staminaRegenRate = 1;
    self.staminaOverloadTime = 20; 
    self.staminaOverloadCounter = 0;
    self.staminaOverload = false;
    // 
    self.attackCounter = 0;
    //
    self.respawnCounter = 0;
    self.respawnLimit = 140;
    //
    self.disguise = false;
    self.disguiseStaminaCost = 1;
    //
    self.atkLevel = 1;
    self.atkEffectCounter = 150;
    //
    self.onInit = function () {
        self.enableControls();
        self.spawnPlayer();
    }
    //
    var super_update = self.update;
    self.update = function () {
        if(self.HPactual > self.HPstart) self.HPactual = self.HPstart;
        // draw color is different when player is disguised
        if(self.disguise) {
            self.playerDisguise();
        }
        else self.fillColor = "green";
        super_update();
        //
        if(self.alive == false) {
            self.respawnCounter++;
            // animation
            if(self.respawnCounter % 20 <= 10) {
                 self.draw();
            } 
            // respawns
            if(self.respawnCounter % self.respawnLimit == 0) {
                self.playerRespawn();
            }
            return;
        } 
        // kill player
        if(self.HPactual <= 0) {
            self.playerDeath();
        }
        //
        if(gameInstance.map.mobsNumber <= 0) self.checkMapExits();
        // attack handler
        if(self.pressingMouseLeft && self.attackCounter % 10 == 0 && self.staminaActual > 0) {
            self.performAttack();
            self.disguise = false;
        }       
        // stamina can't go beyond 0 and when it reaches 0 it enters overload state
        if(self.staminaActual <= 0) {
            self.playerStaminaOverload();
        } 
        // stamina can't surpass max
        if(self.staminaActual >= self.staminaStart) self.staminaActual = self.staminaStart;
        // increase attack counter
        self.attackCounter++;
        // increase stamina
        if(gameInstance.frameCount % self.staminaRegenRate == 0 && self.staminaOverload == false) self.staminaActual += 0.70;
        // atk effect
        if(self.atkEffectCounter <= 0) {
            self.atkLevel--;
            self.atkEffectCounter = 150;
        }
        else if(self.atkLevel > 1) self.atkEffectCounter--;
        //
        if(self.atkLevel<=1) self.atkLevel = 1;
        if(self.atkLevel>=3) self.atkLevel = 3;
    },
    self.playerDisguise = function () {
        self.staminaActual -= self.disguiseStaminaCost;
        self.fillColor = "#ff0080";
    }
    self.playerRespawn = function () {
        self.HPactual = self.HPstart;
        self.staminaActual = self.staminaStart;
        self.alive = true;
        self.respawnCounter = 0; 
    }
    self.playerDeath = function () {
        GAME.mp3.playSound("playerDeath");
        self.alive = false;
        self.HPactual = 0;
        gameInstance.livesNumber--;
        if(gameInstance.livesNumber <= 0) {
            setTimeout(function() {
                gameInstance.gameOver = true;
                gameUI.drawGameOverUI();
            },1600); 
        }
    }
    self.playerStaminaOverload = function () {
        if(self.disguise == true) self.disguise = false;
        self.staminaActual = 0;
        self.staminaOverload = true;
        self.staminaOverloadCounter++;
        if(self.staminaOverloadCounter % self.staminaOverloadTime == 0) self.staminaOverload = false;
    }
    // makes sure player spawns inside a room
    self.spawnPlayer = function () {
        // spawn in the chosen map
        for(var y = 0; y < gameInstance.world.maps.length; y++) {
            for(var x = 0; x < gameInstance.world.maps[y].length; x++) {
                var map = gameInstance.world.maps[x][y];
                if(map.spawnPlayer) gameInstance.map = map;
            } 
        }
        // spawn in the first room
        var roomsList = gameInstance.map.roomsList;
        var spawnRoom = roomsList[0];
        // spawn player randomly inside this room
        do {
            var randX = (spawnRoom.x1+spawnRoom.x2) / 2;
            var randY = (spawnRoom.y1+spawnRoom.y2) / 2;
            self.x = randX;
            self.y = randY; 
        }
        while(self.isOutWalkableArea() == true);
    }
    self.enableControls = function () {
        // mouse
        document.onmousedown = function(mouse){
            if(mouse.which === 1)
                self.pressingMouseLeft = true;
            else
                self.pressingMouseRight = true;
        }
        document.onmouseup = function(mouse){
            if(mouse.which === 1)
                self.pressingMouseLeft = false;
            else
                self.pressingMouseRight = false;
        }
        document.oncontextmenu = function(mouse){
            mouse.preventDefault();
        }
        document.onmousemove = function(mouse){
            var rect = canvas.getBoundingClientRect();
            var scaleX = canvas.width / rect.width;
            var scaleY = canvas.height / rect.height; 
            
            var mouseX = (mouse.clientX - canvas.getBoundingClientRect().left) * scaleX;
            var mouseY = (mouse.clientY - canvas.getBoundingClientRect().top) * scaleY;
            
            mouseX -= self.x;
            mouseY -= self.y;
            
            self.aimAngle = Math.atan2(mouseY,mouseX) / Math.PI * 180;
        }
        //
        document.onkeypress = function (event) {
            if(gameInstance.finished || gameInstance.gameOver) return;
            if(event.key == "m" || event.key == "M") 
                gameInstance.miniMap.open(); // open minimap
            if(event.keyCode == 32) {
                if(self.disguise == true) {
                    self.disguise = false;
                }
                else if(self.disguise == false && self.staminaActual >= 20 && self.alive) 
                    self.disguise = true;
            }
        }
        document.onkeydown = function(event) {
            if(GAME.states.on_menu) return;
            // if game has finished 
            if(gameInstance.finished || gameInstance.gameOver) {
                GAME.changeState("on_menu");
                return;
            }
            if(event.keyCode === 68)
                self.pressingRight = true;
            else if(event.keyCode === 83)	
                self.pressingDown = true;
            else if(event.keyCode === 65) 
                self.pressingLeft = true;
            else if(event.keyCode === 87) 
                self.pressingUp = true;
            else if(event.keyCode === 16)
                self.pressingShift = true;
            else if(event.keyCode === 27)
                gameUI.drawEscapeMenu();
        }
        document.onkeyup = function () {
            if(event.keyCode === 68)
                self.pressingRight = false;
            else if(event.keyCode === 83)	
                self.pressingDown = false;
            else if(event.keyCode === 65) 
                self.pressingLeft = false;
            else if(event.keyCode === 87) 
                self.pressingUp = false;
            else if(event.keyCode === 16)
                self.pressingShift = false;
        }
    }
    // used to see if the player is in the map exit position
    self.checkMapExits = function () {
        // player body
        var playerBody = self.getBody();
        // passages
        if(upperPassage != false) {
            var upperPassage = JSON.parse(JSON.stringify(gameInstance.map.passages.upperPassage));
            upperPassage.y = upperPassage.y - 9;
            if(testCollisionRectRect(playerBody,upperPassage)) {
                world.changeMap("top");
            }
        }
        if(leftPassage != false) {
            var leftPassage = JSON.parse(JSON.stringify(gameInstance.map.passages.leftPassage));
            leftPassage.x = leftPassage.x - 9;
            if(testCollisionRectRect(playerBody,leftPassage)) {
                world.changeMap("left");
            }
        }
        if(bottomPassage != false) {
            var bottomPassage = JSON.parse(JSON.stringify(gameInstance.map.passages.bottomPassage));
            bottomPassage.y = bottomPassage.y + 29;
            if(testCollisionRectRect(playerBody,bottomPassage)) {
                world.changeMap("bottom");
            }
        }
        if(rightPassage != false) {
            var rightPassage = JSON.parse(JSON.stringify(gameInstance.map.passages.rightPassage));
            rightPassage.x = rightPassage.x + 29;
            if(testCollisionRectRect(playerBody,rightPassage)) {
                world.changeMap("right");
            }
        }

    },
    self.performAttack = function () {
        // decrease stamina
        self.staminaActual -=7.7;
        var spdX = Math.cos(self.aimAngle/180*Math.PI)*5;
	    var spdY = Math.sin(self.aimAngle/180*Math.PI)*5;
        //
        var bullet = new PlayerBullet(self.x,self.y,spdX,spdY,gameInstance.map.id,self.atkLevel);
        self.attackCounter = 0;
    },
    // used in order to correct player map change transition
    self.isOutWalkableArea = function () {
        var body = self.getBodyBumpers();
        if(gameInstance.map.isWalkablePosition(body.right) != 0 ||
         gameInstance.map.isWalkablePosition(body.left) != 0  ||
         gameInstance.map.isWalkablePosition(body.top) != 0 ||
         gameInstance.map.isWalkablePosition(body.bot) != 0) {
            return false;
        }
        else return true;
    }
    return self;
}



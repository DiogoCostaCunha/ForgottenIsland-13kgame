var Entity = function (x,y,mapId) {
    var ctx = GAME.ctx;
    var gameInstance = GAME.gameInstance;
    //
    var self = {
        id: Math.random(),
        mapId: mapId,
        tileSize: gameInstance.tileSize,
        x:x,
        y:y,
    }
    self.update = function () {
        self.draw();
        if(self.type == "Finish" || self.type == "Collectible" || self.type == "HPCollectible" || self.type == "AtkCollectible") self.checkCollisionPlayer();
    }
    self.draw = function () {
        ctx.save();
        ctx.fillStyle = self.fillColor;
        ctx.fillRect(self.x,self.y,self.width,self.height);
        ctx.strokeStyle = self.strokeColor;
        ctx.strokeRect(self.x,self.y,self.width,self.height);
        ctx.restore();   
    }
    self.getBody = function () {
        var rect = {
            x: self.x,
            y: self.y,
            width: self.width,
            height: self.height,
        }
        return rect;
    }
    self.checkCollisionPlayer = function () {
        var player = gameInstance.player;
        if(testCollisionRectRect(player.getBody(),self.getBody()) && player.alive != false) {
            if(self.type == "Finish") {
                if(gameInstance.actualCollectiblesNumber == gameInstance.startCollectiblesNumber) {
                    setTimeout(function() {
                        gameInstance.finished = true;
                        GAME.UI.game.drawFinishUI();
                    },1400); 
                } 
                return;
            }
            else if(self.type == "TurretBullet" || self.type == "Mob") {
                if(player.disguise && self.type == "Mob") return;
                player.HPactual -= self.damage;
                if(self.type == "Mob") return;
            }
            else if(self.type == "HPCollectible") {player.HPactual += self.HPeffect; GAME.mp3.playSound("powerUp");}
            else if(self.type == "AtkCollectible") {player.atkLevel++; GAME.mp3.playSound("powerUp");}
            //
            self.toRemove = true;
        }
    }
    return self;
}

Entity.update = function (type) {
    var gameInstance = GAME.gameInstance;
    for(var key in type.list) {
        if(type.list[key].mapId != gameInstance.map.id) continue;
        type.list[key].update();
    }
    for(var key in type.list) {
        if(type.list[key].toRemove) {
            delete type.list[key];
            if(type == TerrainTurret) gameInstance.turretsDestroyed++;
            if(type == Mob) gameInstance.mobsKilled++;
            if(type == Collectible) gameInstance.actualCollectiblesNumber++;
        }   
    }
}

var Bullet = function (x,y,mapId) {
    var self = new Entity(x,y,mapId);
    //
    var canvas = GAME.canvas;
    var gameInstance = GAME.gameInstance;
    //
    var super_update = self.update;
    self.update = function () {
        super_update();
        var player = gameInstance.player;
        if(player.alive == false) return;
        if(self.type != "PlayerBullet") self.checkCollisionPlayer();
        self.updatePosition();
        self.checkCollisionMap();
    }
    self.updatePosition = function () {
        if(self.orientation == "top") 
            self.y+=self.speedY;
        else if(self.orientation == "right") 
            self.x-=self.speedX;
        else if(self.orientation == "bot") 
            self.y-=self.speedY;
        else if(self.orientation == "left") 
            self.x+=self.speedX;
        // for terrain turrets
        else if(self.orientation == "angle") {
            self.y+= self.speedY;
            self.x+= self.speedX;
        }    
    },
    self.checkCollisionMap = function () {
        var point = {x:self.x+self.width/2,y:self.y+self.height/2};
        // if bullet surpasses canvas limits delete bullet
        if(self.x >= canvas.width || self.x <= 0 || self.y >= gameInstance.mapHeight || self.y <= 0 || gameInstance.map.isWalkablePosition(point) == 0) 
            self.toRemove = true;
    }
    return self;
}


var Actor = function (x,y,mapId) {
    var self = new Entity(x,y,mapId);
    //
    var gameInstance = GAME.gameInstance;
    //
    var super_update = self.update;
    self.update = function () {
        var player = gameInstance.player;
        if(player.alive == false) {
            if(self.type != "Mob") {
                self.updatePosition();
            }
            if(self.type != "Player") {
                super_update();
            }
            return;
        }
        super_update();
        self.updatePosition();
    }
    self.updatePosition = function () {
        var body = self.getBodyBumpers();
        var speed = self.moveSpeed;
        if(self.type == "Player") {
            if(self.pressingShift && self.staminaActual > 0 && self.alive == true) {
                speed = self.sprintSpeed;
                self.staminaActual -= 1;
            }
        }
        if(gameInstance.map.isWalkablePosition(body.right) != 0) {
            if(self.pressingRight) {
                self.x += speed;
            }      
        }
        if(gameInstance.map.isWalkablePosition(body.left) != 0) {
            if(self.pressingLeft) {
                self.x -= speed;
            }
        }  
        if(gameInstance.map.isWalkablePosition(body.top) != 0) {
            if(self.pressingUp) {
                self.y -= speed;    
            }
        }   
        if(gameInstance.map.isWalkablePosition(body.bot) != 0) {
            if(self.pressingDown) {
                self.y += speed;
            }          
        }
    },
    self.getBodyBumpers = function () {
        var topBumper = {x:self.x+self.width/2,y:self.y};
        var botBumper = {x:self.x+self.width/2,y:self.y+self.height};
        var leftBumper = {x:self.x,y:self.y+self.height/2};
        var rightBumper = {x:self.x+self.width,y:self.y+self.height/2};
        return {top:topBumper,bot:botBumper,left:leftBumper,right:rightBumper};
    }
    return self;
}

var Turret = function (x,y,mapId) {
    var self = new Entity(x,y,mapId);
    //
    var gameInstance = GAME.gameInstance;
    //
    var super_update = self.update;
    self.update = function () {
        var player = gameInstance.player;
        if(player.alive != false && player.disguise == false) {
            self.checkShoot(player);
        }
        super_update();
    },
    self.checkShoot = function (player) {
        if(gameInstance.frameCount % self.fireRate == 0 && player.alive != false) {
            if(self.type == "WallTurret") {
                self.shoot();
            }
            else if(getDistanceBetween(player,self) <= self.getDistanceRoomLimits() && self.type == "TerrainTurret") {
                //might do special attack
                if(getRandomInt(0,5) == 0) self.specialShoot();
                else self.shoot();
            }
        }
    }
    return self;
}

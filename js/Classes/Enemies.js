var Mob = function (x,y,mapId,room) {
    var self = new Actor(x,y,mapId);
    // 
    var gameInstance = GAME.gameInstance;
    //
    var size = getRandomInt(11,18);
    self.width = size;
    self.height = size;
    self.hp = size * 1.5;
    self.damage = size * 0.30;
    self.moveSpeed =  18/size;
    self.fillColor = "red";
    self.strokeColor = "black";
    self.room = room;
    self.moveLimits = getRandomInt(3,150);
    self.moveCount = 0;
    self.moveCountReset = getRandomInt(30,80);
    self.state = "neutral";
    self.type = "Mob";
    self.rageCounter = 0;
    //
    var super_update = self.update;
    self.update = function () {
        super_update();
        if(gameInstance.frameCount % 20 == 0)
            self.checkCollisionPlayer();
        // 
        if(self.hp <= 0) {
            self.mobDeath();
        }
        self.move();
        // 
        self.moveCount++;
    },
    self.mobDeath = function () {
        GAME.mp3.playSound("enemyDeath");
        self.toRemove = true;
        gameInstance.map.mobsNumber--;
        // will spawn hp collectible?
        var rand = getRandomInt(0,4);
        if(rand == 0) 
            var hpCollectible = new HPCollectible(self.x,self.y,self.mapId);
        else if(rand == 1)
            var atkCollectible = new AttackCollectible(self.x,self.y,self.mapId);
    }
    self.move = function () {
        var player = gameInstance.player;
        if(self.state != "rage") {
            if(getDistanceBetween(player,self) > 80) self.state = "neutral";
            else self.state = "chase"; 
        }
        else {
            // will chase player but will eventually stop
            self.rageCounter++;
            if(self.rageCounter % 300 == 0) self.state = "neutral";
        }
        if(player.disguise) self.state = "neutral";
        // if has not seen the player move randomly
        if(self.state == "neutral") {
            if(self.moveCount % self.moveCountReset == 0) {
                var rand1 = getRandomInt(0,2);
                var rand2 = getRandomInt(0,2);
                // reset all the presses
                self.pressingDown= false; self.pressingUp = false; self.pressingLeft = false; self.pressingRight = false;
                if(rand1==0) self.pressingDown = true;
                if(rand1==1) self.pressingUp = true;
                if(rand2==0) self.pressingLeft = true;
                if(rand2==1) self.pressingRight = true;
                // reset the move count the moveCountReset and the moveLimits
                self.moveCount = 0;
                self.moveCountReset = getRandomInt(30,80);
                self.moveLimits = getRandomInt(3,150);
            }
        }
        else if(self.state == "chase" || self.state == "rage") {
            var diffX = player.x - self.x;
		    var diffY = player.y - self.y;
            self.pressingRight = diffX > 3;
            self.pressingLeft = diffX < -3;
            self.pressingDown = diffY > 3;
            self.pressingUp = diffY < -3;
        }
    },
    Mob.list[self.id] = self;
    return self;
}
Mob.list = {};


var TerrainTurret = function (x,y,mapId,tileSize,room) {
    var self = new Turret(x,y,mapId);
    //
    var gameInstance = GAME.gameInstance;
    //
    self.bulletsSpeed = 1;
    self.fireRate = getRandomInt(20,70);
    self.specialFireRate = getRandomInt(5,15);
    self.room = room;
    self.aimAngle = 0;
    self.fillColor = "#b30000";
    self.strokeColor = "black";
    self.width = 25;
    self.height = 25;
    self.HPstart = getRandomInt(30,40);
    self.HPactual = self.HPstart;
    self.type = "TerrainTurret";
    //
    var super_update = self.update;
    self.update = function () {
        super_update();
        var player = gameInstance.player;
        if(self.HPactual <= 0) {
            self.turretDestruction();
        }
    },
    self.turretDestruction = function () {
        self.toRemove = true;
        GAME.mp3.playSound("enemyDeath");
    }
    // shooting is different on turret types
    self.shoot = function () {
        var player = gameInstance.player;
        var diffX = (player.x - player.width) - self.x;
		var diffY = (player.y - player.height) - self.y;
        self.aimAngle = Math.atan2(diffY,diffX) / Math.PI * 180;
        if(self.aimAngle < 0)
			self.aimAngle = 360 + self.aimAngle;
        var speedX = Math.cos(self.aimAngle/180*Math.PI)*5 * self.bulletsSpeed * 0.4;
	    var speedY = Math.sin(self.aimAngle/180*Math.PI)*5 * self.bulletsSpeed * 0.4;
        var bullet = new TurretBullet(self.x + (self.width/ 2),self.y + (self.height/ 2),"angle",speedX,speedY,self.mapId);
    },
    self.specialShoot = function () {
        for(var i = 0 ; i < 360; i += (360 / self.specialFireRate) ) {
            var speedX = Math.cos(i/180*Math.PI)*5 * self.bulletsSpeed * 0.4;
	        var speedY = Math.sin(i/180*Math.PI)*5 * self.bulletsSpeed * 0.4;
			var bullet = new TurretBullet( self.x + (self.width/ 2),self.y + (self.height/ 2),"angle",speedX,speedY,self.mapId);
            self.specialFireRate = getRandomInt(5,15);
		}
    },
    self.getDistanceRoomLimits = function () {
        var corner = {x:self.room.x1,y:self.room.y1};
        var distance = getDistanceBetween(self,corner);
        return distance;
    },
    TerrainTurret.list[self.id] = self;
    return self;
}
TerrainTurret.list = {};

var WallTurret = function (x,y,orientation,mapId,tileSize) {
    var gameInstance = GAME.gameInstance;
    //
    var self = new Turret(x,y,mapId);
    //
    self.orientation = orientation;
    self.bulletsSpeed = getRandomInt(1,2);
    self.fireRate = getRandomInt(70,100);
    self.fillColor = "black";
    self.strokeColor = "grey";
    self.type = "WallTurret";
    // instanciate turret according to wall orientation
    if(self.orientation == "top" || self.orientation == "bot") {
        self.height = 3;
        self.width = 15;
        self.x += (self.tileSize - self.width) / 2;
        if(self.orientation == "bot") self.y += (self.tileSize - self.height);
        if(self.orientation == "top") self.y -= self.tileSize / 3;
    }
    else if(self.orientation == "left" || self.orientation == "right") {
        self.height = 15;
        self.width = 3;
        self.y += (self.tileSize - self.height) / 2;
        if(self.orientation == "right") self.x += (self.tileSize - self.width);
    }
    var super_update = self.update;
    self.update = function () {
        super_update();
    },
    self.shoot = function () {
        if(self.orientation == "bot" || self.orientation == "top") {
            var shootPosition = (2*self.x + self.width - 5) / 2;
            var shootY;
            if(self.orientation == "top") shootY = self.y + 10;
            else shootY = self.y;
            var bullet = new TurretBullet(shootPosition,shootY,self.orientation,0,self.bulletsSpeed,self.mapId);
        }
        else if(self.orientation == "right" || self.orientation == "left") {
            var shootPosition = (2*self.y + self.height - 5) / 2;
            var bullet = new TurretBullet(self.x,shootPosition,self.orientation,self.bulletsSpeed,0,self.mapId);
        }   
    }
    WallTurret.list[self.id] = self;
    return self;
}
WallTurret.list = {};











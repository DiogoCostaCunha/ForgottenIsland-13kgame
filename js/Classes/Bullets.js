var TurretBullet = function (x,y,orientation,speedX,speedY,mapId) {
    var gameInstance = GAME.gameInstance;
    var canvas = GAME.canvas;
    var self = new Bullet(x,y,mapId);
    // 
    self.width = 6;
    self.height = 6;
    self.speedX = speedX;
    self.speedY = speedY;
    self.orientation = orientation;
    self.damage = 20;
    self.fillColor = "red";
    self.strokeColor = "black";
    self.type = "TurretBullet";
    //
    self.update();
    //
    TurretBullet.list[self.id] = self;
    return self;
}
TurretBullet.list = {};

var PlayerBullet = function (x,y,speedX,speedY,mapId,bulletType) {
    var self = new Bullet(x,y,mapId);
    //
    var gameInstance = GAME.gameInstance;
    //
    if(bulletType == 1) {
        var color = "#666699";
        var damage = 3;
        var size = 5;
    }
    else if(bulletType == 2) {
        var color = "#6600cc";
        var damage = 6;
        var size = 7;
    }
    else if(bulletType == 3) {
        var color = "#9900ff";
        var damage = 9;
        var size = 9;
    }
    //
    self.type = "PlayerBullet";
    self.orientation = "angle";
    self.speedX = speedX;
    self.speedY = speedY;
    self.fillColor = color;
    self.strokeColor = "black";
    self.width = size;
    self.height = size;
    self.damage = damage;
    self.impactEffect = 5;
    //
    var super_update = self.update;
    self.update = function () {
        super_update();
        self.checkCollisionMobs();
        self.checkCollisionTurrets();
    }
    self.checkCollisionMobs = function () {
        for(var key in Mob.list) {
            var mob = Mob.list[key];
            if(mob.mapId != self.mapId) continue;
            if(testCollisionRectRect(mob.getBody(),self.getBody()))  {
                mob.hp -= self.damage;
                mob.state = "rage";
                self.impactMob(mob);
            }
        }
    },
    self.checkCollisionTurrets = function () {
        for(var key in TerrainTurret.list) {
            var turret = TerrainTurret.list[key];
            if(turret.mapId != self.mapId) continue;
            if(testCollisionRectRect(turret.getBody(),self.getBody()))  {
                turret.HPactual -= self.damage;
                self.toRemove = true;
            }
        }
    },
    self.impactMob = function (mob) {
        var body = mob.getBodyBumpers();
        if(gameInstance.map.isWalkablePosition(body.right) != 0) {
            if(self.x <= mob.x) {
                mob.x+=self.impactEffect;
            }
        }
        if(gameInstance.map.isWalkablePosition(body.left) != 0) {
            if(self.x >= mob.x + mob.width / 2) {
                mob.x-=self.impactEffect;
            }
        }  
        if(gameInstance.map.isWalkablePosition(body.bot) != 0) {
            if(self.y <= mob.y) {
                mob.y+=self.impactEffect;
            }
        }    
        if(gameInstance.map.isWalkablePosition(body.top) != 0) {
            if(self.y >= mob.y) {
                mob.y-=self.impactEffect;
            }   
        }     
        self.toRemove = true;
    }
    //
    PlayerBullet.list[self.id] = self;
    return self;
}
PlayerBullet.list = {};

var Collectible = function (x,y,mapId) {
    var self = new Entity(x,y,mapId);
    //
    self.fillColor = "#ffcc00";
    self.strokeColor = "black";
    self.width = 15;
    self.height = 15;
    self.type = "Collectible";
    self.collected = false;
    //
    var super_update = self.update;
    self.update = function () {
        super_update();
    }
    Collectible.list[self.id] = self;
    return self;
}
Collectible.list = {};


var HPCollectible = function (x,y,mapId) {
    var self = new Entity(x,y,mapId);
    //
    self.fillColor = "green";
    self.strokeColor = "black";
    self.width = 5;
    self.height = 5;
    self.HPeffect = 6;
    self.type = "HPCollectible";
    //
    var super_update = self.update;
    self.update = function () {
        super_update();
    }
    HPCollectible.list[self.id] = self;
    return self;
}
HPCollectible.list = {};

var AttackCollectible = function (x,y,mapId) {
    var self = new Entity(x,y,mapId);
    //
    self.fillColor = "#66ffff";
    self.strokeColor = "black";
    self.width = 5;
    self.height = 5;
    self.type = "AtkCollectible";
    //
    var super_update = self.update;
    self.update = function () {
        super_update();
    }
    AttackCollectible.list[self.id] = self;
    return self;
}
AttackCollectible.list = {};
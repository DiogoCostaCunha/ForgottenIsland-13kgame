var Finish = function (x,y,mapId) {
    var gameInstance = GAME.gameInstance;
    //
    var self = new Entity(x,y,mapId);
    //
    self.fillColor = "#004d00";
    self.strokeColor = "white";
    self.width = 30,
    self.height = 30,
    self.type = "Finish";
    //
    var super_update = self.update;
    self.update = function () {
        if(gameInstance.map.id == self.mapId)
            super_update();
    }
    return self;
}

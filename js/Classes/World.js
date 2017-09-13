// contains all the maps
var World = function (worldSize) {
    // external vars
    var gameInstance = GAME.gameInstance;
    //
    var self = {
        maps: [],
        worldSize: worldSize,
        // to avoid continuous map change
        changeMapFlag: true,
        // map flag counter
        changeMapCounter: 0,
    }
    // world update
    self.update = function () {
        self.updateMap();
    }
    // generate the maps
    self.createMaps = function () {
        // get maps that will have collectible or a finish
        var specialMaps = self.randSpecialMaps();
        for(var y = 0; y < self.worldSize; y++) {
            self.maps.push([]);
            for(var x = 0; x < self.worldSize; x++) {
                // check if this map will have collectible
                var collectible = false;
                var finish = false;
                for(var k = 0; k < specialMaps.length; k++) {
                    if(specialMaps[k].y == y && specialMaps[k].x == x) {
                        if(specialMaps[k].finish) finish = true;
                        if(specialMaps[k].collectible) collectible = true;
                    }
                }
                // check what passage corridors info should this map receive
                if(y > 0) {
                    var upperPassage = JSON.parse(JSON.stringify(self.maps[y-1][x].passages.bottomPassage)); 
                    upperPassage.y = 0; // => inversion
                }
                else var upperPassage = false;
                if(x > 0) {
                    var leftPassage = JSON.parse(JSON.stringify(self.maps[y][x-1].passages.rightPassage));
                    leftPassage.x = 0; // => inversion
                } 
                else var leftPassage = false;
                // check what passage corridors should be created in this map
                if(y+1 == self.worldSize) var bottomPassage = false;
                else var bottomPassage = true;
                if(x+1 == self.worldSize) var rightPassage = false;
                else var rightPassage = true;
                var passages = {upperPassage:upperPassage,leftPassage:leftPassage,bottomPassage:bottomPassage,rightPassage:rightPassage};
                // instantiate the map
                var map = new _Map(passages,collectible,finish);
                // generate the map and push it to maps array
                map.onInit();
                self.maps[y].push(map);
            }
        }    
    }
    // update the current map only
    self.updateMap = function () {
        gameInstance.map.update();
        // add to counter
        self.changeMapCounter++;
        // reset flag
        if(self.changeMapFlag == false && self.changeMapCounter >= 10) {
            self.changeMapFlag = true;
        }
    }
    // looks for what map to change to
    self.changeMap = function (type) {
        for(var y = 0; y < self.maps.length; y++) {
            for(var x = 0; x < self.maps[y].length; x++) {
                // first locate the map
                if(self.maps[y][x].id == gameInstance.map.id) {
                    if(self.changeMapFlag == false) break;
                    var mapIndex = {x:x,y:y};
                    // then change the map accordingly
                    if(type == "top") {
                        gameInstance.map = self.maps[mapIndex.y-1][x];
                        // change the player position
                        gameInstance.player.y = gameInstance.map.passages.bottomPassage.y + gameInstance.player.height;
                        // check if this position is out of map walkable area
                        if(gameInstance.player.isOutWalkableArea() == true) gameInstance.player.x = gameInstance.map.passages.bottomPassage.x;
                    } 
                    else if(type == "bottom") {
                        gameInstance.map = self.maps[mapIndex.y+1][x];
                        // change the player position
                        gameInstance.player.y = gameInstance.map.passages.upperPassage.y;
                        // check if this position is out of map walkable area
                        if(gameInstance.player.isOutWalkableArea() == true) gameInstance.player.x = gameInstance.map.passages.upperPassage.x;
                    } 
                    else if(type == "left") {
                        gameInstance.map = self.maps[mapIndex.y][x-1];
                        // change the player position
                        gameInstance.player.x = gameInstance.map.passages.rightPassage.x + gameInstance.player.width + 5;
                        // check if this position is out of map walkable area
                        if(gameInstance.player.isOutWalkableArea() == true) gameInstance.player.y = gameInstance.map.passages.rightPassage.y;
                    } 
                    else if(type == "right") {
                        gameInstance.map = self.maps[mapIndex.y][x+1];
                        // change the player position
                        gameInstance.player.x = gameInstance.map.passages.leftPassage.x;
                        // check if this position is out of map walkable area
                        if(gameInstance.player.isOutWalkableArea() == true) gameInstance.player.y = gameInstance.map.passages.leftPassage.y;
                    }
                    self.changeMapFlag = false;
                    // reset counter
                    self.changeMapCounter = 0;
                }
            }
        }
    },
    // chooses what maps will have collectible
    self.randSpecialMaps = function () {
        var chosenIndexes = [];
        // choose random map indexes to have collectible 
        do{
            var randArrayY = getRandomInt(0,self.worldSize-1);
            var randArrayX = getRandomInt(0,self.worldSize-1);
            var mapObj = {y:randArrayY,x:randArrayX};
            // if it is the last iteration add it as the map finish
            if(chosenIndexes.length == self.worldSize) mapObj.finish = true;
            // else it is collectible   
            else mapObj.collectible = true;
            // if doesn't already contain map
            if(checkArrayHasMap(chosenIndexes,mapObj) == false) chosenIndexes.push(mapObj);
        }
        while(chosenIndexes.length <= self.worldSize);
        // 
        return chosenIndexes;
    }
    return self;
}

// auxiliar to creation
function checkArrayHasMap (array,object) {
    for(var x = 0; x < array.length; x++) {
        if(array[x].x == object.x && array[x].y == object.y)
            return true;
    }
    return false;
}
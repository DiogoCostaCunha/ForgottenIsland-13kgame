var _Map = function (passages,collectible,finish,menu) {
    // external vars
    var canvas = GAME.canvas;
    var ctx = GAME.ctx;
    var gameInstance = GAME.gameInstance;
    var images = GAME.images;
    var world = gameInstance.world;
    var maps = world.maps;
    //
    var self = {
        // map id for reference
        id: Math.random(),
        tileSize: gameInstance.tileSize,
        roomsNumber: getRandomInt(1,10),
        wallTurretsNumber: null, 
        mobsNumber: null,
        // contains info about all the rooms created (x,y,width,height)
        roomsList: [],
        // contains the map grid 
        mapArray: [],
        numWalkTiles: null,
        // contains the position of the adjacent tiles to walls in the map
        wallsIndexes: [],
        // upper and left passages info
        passages:passages,
        // will have collectible or a finish?
        collectible: collectible,
        finish: finish,
        // playerSpawn
        spawnPlayer:false,
        // trigger passages sound
        passagesSound: false,
    }
    self.tileNumberX = gameInstance.mapWidth / self.tileSize;
    self.tileNumberY = gameInstance.mapHeight / self.tileSize;
    // called at map init
    self.onInit = function () {
        // fill the map array with non walkable tiles (0)
        self.fillTerrain();
        // fill the map array with rooms
        self.createRooms();
        // create all the corridors
        var corridors = new Corridors(self);
        corridors.createCorridors();
        // mark the walls in map array with (1.) (0,1,2,3) depending on wall orientation
        self.assignWallIndexes();
        // menu doesn't go further
        if(menu == true) return;
        // get total number of walk tiles
        self.getWalkTilesNumber();
        // this might be the map where player will spawn
        self.assignPlayerSpawnMap();
        // if it is the player spawn map there are no turrets,mobs...
        if(!self.spawnPlayer) {
            // this room might or might not have wall turrets
            if(getRandomInt(0,10) <= 6) self.createWallTurrets();
            if(getRandomInt(0,10) <= 5) self.createMobs();
            if(getRandomInt(0,10) <= 10) self.createTerrainTurrets();
            if(self.collectible) self.spawnCollectible();
            if(self.finish) self.spawnFinish();
        }
    }
    // called at loop
    self.update = function () {
        // paints the whole canvas
        self.drawRestrictedArea();
        // paints the walkable area
        self.drawWallsWalkableArea();    
        // draw passages signs
        self.drawPassageSigns();
    },
    self.assignPlayerSpawnMap = function () {
        if(self.collectible != true && self.finish != true) {
            self.spawnPlayer = true;
            for(var y = 0; y < maps.length; y++) {
                for(var x = 0; x < maps[y].length; x++) {
                    // there is already a map
                    if(maps[y][x].spawnPlayer == true) self.spawnPlayer = false;
                }    
            }
        }
    }
    // fills map array with non walkable tiles
    self.fillTerrain = function () {
        for(var y = 0; y < self.tileNumberY; y++) {
            self.mapArray.push([]);
            for(var x = 0; x < self.tileNumberX; x++) {
                self.mapArray[y].push("0");
            }
        }
    },
    self.createRooms = function () {
        // flag to leave map creation
        var retries = 0;
        do {
            // get random width, height, x and y values
            var randValues = self.getRoomValues();
            // flag
            var failed = false;
            // try a room with this properties
            var room = new Room(randValues,self.tileSize,self.mapArray);
            // check intersection with other rooms: if intersects it failed
            for(var x = 0; x < self.roomsList.length; x++) {
                if(room.checkRoomIntersection(self.roomsList[x])) {
                    failed = true;
                    break;
                }
            }
            // if it passed intersection test add the room
            if(failed == false) {
                // translate room values to tile values and them to mapArray
                room.addToMapArray();
                self.roomsList.push(room);
                retries = 0;
            }
            else {retries++ ;console.log(retries);};
        }
        while(self.roomsList.length < self.roomsNumber && retries >= 2000)
    },
    // get random values for rooms
    self.getRoomValues = function () {
        var width = getRandomInt(2,8) * 30;
        var height = getRandomInt(2,8) * 30;
        do{var x = getRandomInt(0,gameInstance.mapWidth-self.tileSize);}
        while(x % 30 != 0 || width + x > canvas.width);
        do{var y = getRandomInt(0,gameInstance.mapHeight-self.tileSize);}
        while(y % 30 != 0 || height + y > gameInstance.mapHeight);
        return {x:x,y:y,width:width,height:height};
    }
    // draws terrain all over the place
    self.drawRestrictedArea = function () {
        for(var y = 0; y < self.mapArray.length; y++) {
            for(var x = 0; x < self.mapArray[y].length; x++) {
                // check if it is to draw 
                if(self.mapArray[y][x] == "0") {
                    ctx.drawImage(images.water,x*self.tileSize,y*self.tileSize);
                }
            }
        }
    }
    self.drawWallsWalkableArea = function (miniMap) {
        var tileSize = self.tileSize;
        var mapArray = self.mapArray;
        for(var y = 0; y < mapArray.length; y++) {
            for(var x = 0; x < mapArray[y].length; x++) {
                if(mapArray[y][x] != "0") {
                    // draw terrain all over the place
                    ctx.drawImage(images.terrain,x*tileSize,y*tileSize);
                    // take care of wall corners and 1 tile passages    
                    if( (y-1) >= 0 && (x-1) >= 0 && (y+1) < mapArray.length && (x+1) < mapArray[y].length) {
                        // vertical passages
                        if(mapArray[y][x] == "1.1" && mapArray[y][x-1] == "0" && mapArray[y][x+1] == "0") {
                            ctx.drawImage(images.wall,(x-1)*tileSize,y*tileSize);
                        }
                        // horizontal passages
                        if(mapArray[y][x] == "1.0" && mapArray[y-1][x] == "0" && mapArray[y+1][x] == "0") {
                            ctx.drawImage(images.wall,x*tileSize,(y+1)*tileSize);
                        }
                        // top left and top right wall corners
                        if(mapArray[y][x] == "1.0" && mapArray[y-1][x] == "0") {
                            // top left
                            if(mapArray[y][x-1] == "0") {
                                ctx.drawImage(images.wall,(x-1)*tileSize,y*tileSize);
                                ctx.drawImage(images.wall,(x-1)*tileSize,(y-1)*tileSize);
                            }
                            // top right
                            else if(mapArray[y][x+1] == "0") {
                                ctx.drawImage(images.wall,(x+1)*tileSize,y*tileSize);
                                ctx.drawImage(images.wall,(x+1)*tileSize,(y-1)*tileSize);
                            }
                            ctx.drawImage(images.wall,x*tileSize,(y-1)*tileSize);
                        }
                        // bot left and bot right wall corners
                        else if(mapArray[y][x] == "1.2" && mapArray[y+1][x] == "0") {
                            // bot left
                            if(mapArray[y][x-1] == "0") {
                                ctx.drawImage(images.wall,(x-1)*tileSize,y*tileSize);
                                ctx.drawImage(images.wall,(x-1)*tileSize,(y+1)*tileSize);
                            }
                            // bot right
                            else if(mapArray[y][x+1] == "0") {
                                ctx.drawImage(images.wall,(x+1)*tileSize,y*tileSize);
                                ctx.drawImage(images.wall,(x+1)*tileSize,(y+1)*tileSize);
                            }
                            ctx.drawImage(images.wall,x*tileSize,(y+1)*tileSize);
                        }
                    }
                    if(mapArray[y][x] == "1.0") ctx.drawImage(images.wall,x*tileSize,(y-1)*tileSize);
                    if(mapArray[y][x] == "1.1") ctx.drawImage(images.wall,(x+1)*tileSize,y*tileSize);
                    if(mapArray[y][x] == "1.2") ctx.drawImage(images.wall,x*tileSize,(y+1)*tileSize);
                    if(mapArray[y][x] == "1.3") ctx.drawImage(images.wall,(x-1)*tileSize,y*tileSize);
                } 
            }
        }
    },
    // used to check if player can go in that direction
    self.isWalkablePosition = function (pt) {;
        var mapX = Math.floor(pt.x / self.tileSize);
        var mapY = Math.floor(pt.y / self.tileSize);
        // error handling
        if(isNaN(mapX) || isNaN(mapY)) return false;
        if(mapX < 0 || mapX >= self.mapArray[0].length)
            return false;
        if(mapY < 0 || mapY >= self.mapArray.length)
            return false;
        return self.mapArray[mapY][mapX];
    },
    self.assignWallIndexes = function () {
        for(var y = 0; y < self.mapArray.length; y++) {
            for(var x = 0; x < self.mapArray[y].length; x++) {
                // mark the walls in the array as 1. (0,1,2,3)     
                if(self.mapArray[y][x] == "2.0") {
                    // identify walls according to their position to know how they are located
                    var isWall = false;
                    // a top wall
                    if(y == 0 || self.mapArray[y-1][x] == "0") {
                        var orientation = "top";
                        self.mapArray[y][x] = "1.0";
                        isWall = true;
                    }
                    // a bot wall
                    else if(y == self.mapArray.length - 1 || self.mapArray[y+1][x] == "0") {
                        var orientation = "bot";
                        self.mapArray[y][x] = "1.2";
                        isWall = true;
                    }
                    // a right wall
                    else if(x == self.mapArray[y].length - 1 || self.mapArray[y][x+1] == "0") {
                        var orientation = "right";
                        self.mapArray[y][x] = "1.1";
                        isWall = true;
                    }
                    // a left wall
                    else if(x == 0 || self.mapArray[y][x-1] == "0") {
                        var orientation = "left";
                        self.mapArray[y][x] = "1.3";
                        isWall = true;
                    }
                    // push to a specific array of wall indexes
                    if(isWall == true) {
                        // turret cannot be spawned outside map limits
                        if(x != 0 && x != self.mapArray[y].length-1 && y != 0 && y != self.mapArray.length-1 && self.isPassagePosition(x,y) == false)
                            self.wallsIndexes.push({x:x,y:y,orientation:orientation,turret:false});
                    }
                }
            }
        }
    },
    // checks if given coordinates are the same as passage position
    self.isPassagePosition = function (x,y) {
        for(var key in self.passages) {
            var passage = self.passages[key];
            if(passage != false)
                if(passage.x == x || passage.y == y) return true;
        }
        return false;
    }
    self.drawPassageSigns = function () {
        ctx.save();
        if(self.mobsNumber <= 0) {
            ctx.fillStyle = "green";
            if(self.passagesSound != true  && self.mobsNumber != null) {
                GAME.mp3.playSound("passagesUnlocked");
                self.passagesSound = true;
            }
        } 
        else ctx.fillStyle = "red";
        ctx.globalAlpha = 0.7;
        var passages = self.passages;
        if(passages.upperPassage != false) {
            ctx.fillRect(passages.upperPassage.x,passages.upperPassage.y,self.tileSize,self.tileSize/5);
        } 
        if(passages.bottomPassage != false) {
            ctx.fillRect(passages.bottomPassage.x,passages.bottomPassage.y + (self.tileSize - self.tileSize / 5),self.tileSize,self.tileSize/5);
        } 
        if(passages.leftPassage != false) {
            ctx.fillRect(passages.leftPassage.x,passages.leftPassage.y,self.tileSize/5,self.tileSize);
        } 
        if(passages.rightPassage != false) {
            ctx.fillRect(passages.rightPassage.x + (self.tileSize - self.tileSize/5),passages.rightPassage.y,self.tileSize / 5,self.tileSize);
        } 
        ctx.restore();
    },
    self.getWalkTilesNumber = function () {
        for(var y = 0; y < self.mapArray.length; y++) {
            for(var x = 0; x < self.mapArray[y].length; x++) {
                if(self.mapArray[y][x] != "0") self.numWalkTiles++;
            }
        }
    }
    // turrets are placed on the walls
    self.createWallTurrets = function () {
        var turretsNumber = Math.floor(self.wallsIndexes.length/5);
        for(var j = 0; j < turretsNumber; j++) {
            // choose a random position from all the wall indexes positions
            var randNumber = getRandomInt(0,self.wallsIndexes.length-1);
            var randPosition = self.wallsIndexes[randNumber];
            // if position is already occupied
            if(self.wallsIndexes[randNumber].turret == true) continue;
            // occupy that position in wallsIndexes
            self.wallsIndexes[randNumber].turret = true;
            var x = randPosition.x * self.tileSize;
            var y = randPosition.y * self.tileSize;
            var orientation = randPosition.orientation;
            var turret = new WallTurret(x,y,orientation,self.id,self.tileSize);
        }
    },
    self.createTerrainTurrets = function () {
        // only spawn on "large" rooms
        var possibleRooms = [];
        for(var k = 0; k < self.roomsList.length; k++) {
            if(self.roomsList[k].width >= 80 && self.roomsList[k].height >= 80) {
                possibleRooms.push(self.roomsList[k]);
            }
        }
        if(possibleRooms.length == 0) return;
        var rand = getRandomInt(0,possibleRooms.length-1);
        var randRoom = possibleRooms[rand];
        var x = (randRoom.x1 + randRoom.x2) / 2;
        var y = (randRoom.y1+ randRoom.y2) / 2;
        var turret = new TerrainTurret(x,y,self.id,self.tileSize,randRoom);
    },
    self.createMobs = function () {
        for(var k = 0; k < self.roomsList.length;k++) {
            var room = self.roomsList[k];
            var area = room.width * room.height;
            var mobsNumber = Math.sqrt(area / 30) * 0.4;
            self.mobsNumber += mobsNumber;
            for(var j = 0; j < mobsNumber; j++) {
                var x = getRandomInt(room.x1 + 30,room.x2 - 30);
                var y = getRandomInt(room.y1 + 30,room.y2 - 30);
                var mob = new Mob(x,y,self.id,room);
            }
        }
    }
    self.spawnCollectible = function () {
        var rand = getRandomInt(0,self.roomsList.length-1);
        var randRoom = self.roomsList[rand];
        var x = getRandomInt(randRoom.x1 + 15, randRoom.x2 - 15);
        var y = getRandomInt(randRoom.y1 + 15,randRoom.y2 - 15);
        var collectible = new Collectible(x,y,self.id);
        self.collectible = collectible;
    },
    self.spawnFinish = function () {
        var rand = getRandomInt(0,self.roomsList.length-1);
        var randRoom = self.roomsList[rand];
        var x = (randRoom.x1 + randRoom.x2) / 2 + 10;
        var y = (randRoom.y1 + randRoom.y2) / 2 + 10;
        var finish = new Finish(x,y,self.id);
        self.finish = finish;
        // add to world finish 
        gameInstance.finish = finish;
    }
    return self;
}

var Corridors = function (map) {
    // external vars
    var canvas = GAME.canvas;
    var gameInstance = GAME.gameInstance;
    var maps = gameInstance.world.maps;
    //
    this.createCorridors = function () {
        // create the corridors between rooms
        this.createRoomCorridors(map.roomsList);
        // create the map passage corridors
        this.createPassageCorridors();
    },
    this.createRoomCorridors = function(roomsList) {
        for(var x = 1; x < roomsList.length; x++) {
            var previousRoomExit = roomsList[x-1].corridorExit;
            var actualRoomEntry = roomsList[x].corridorEntry;
            // create the corridors according to these positions
            this.positionCorridors(previousRoomExit,actualRoomEntry);
        }
    },
    this.createPassageCorridors = function () {
        // originated in this map
        if(map.passages.rightPassage == true) {
            var randRightPosition = this.getRandPassagePosition("right");
            map.passages.rightPassage = randRightPosition;
            map.passages.rightPassage.width = gameInstance.passagesSize;
            map.passages.rightPassage.height = gameInstance.tileSize;
            // choose a random room to start the corridor from
            var randNumber = getRandomInt(0,map.roomsList.length-1);
            var randRoom = map.roomsList[randNumber];
            this.positionCorridors(randRightPosition,randRoom.corridorEntry);
        }
        // originated in this map
        if(map.passages.bottomPassage == true) {
            var randBotPositon = this.getRandPassagePosition("bottom");
            map.passages.bottomPassage = randBotPositon;
            map.passages.bottomPassage.width = gameInstance.tileSize;
            map.passages.bottomPassage.height = gameInstance.passagesSize;
            // choose a random room to start the corridor from
            var randNumber = getRandomInt(0,map.roomsList.length-1);
            var randRoom = map.roomsList[randNumber];
            this.positionCorridors(randBotPositon,randRoom.corridorEntry);
        }
        // originated in the left map
        if(map.passages.leftPassage != false) {
            var leftPosition = map.passages.leftPassage;
            // choose a random room to start the corridor from
            var randNumber = getRandomInt(0,map.roomsList.length-1);
            var randRoom = map.roomsList[randNumber];
            this.positionCorridors(leftPosition,randRoom.corridorEntry);
        }
        // originated in the upper map
        if(map.passages.upperPassage != false) {
            var upperPosition = map.passages.upperPassage;
            // choose a random room to start the corridor from
            var randNumber = getRandomInt(0,map.roomsList.length-1);
            var randRoom = map.roomsList[randNumber];
            this.positionCorridors(upperPosition,randRoom.corridorEntry);
        }
    },
    this.positionCorridors = function (start,end) {
        // first corridor: horizontal or vertical? random creation
        if(getRandomInt(0,1) == 0) {
            this.createHCorridor(start.x,end.x,start.y);
            this.createVCorridor(start.y,end.y,end.x);
        }
        else {
            this.createVCorridor(start.y,end.y,start.x);
            this.createHCorridor(start.x,end.x,end.y);
        }
    },
    this.getRandPassagePosition = function (side) {
        if(side == "right") {
            var xPosition = canvas.width - map.tileSize;
            do{var yPosition = getRandomInt(0,gameInstance.mapHeight - map.tileSize)}
            while(yPosition % map.tileSize != 0)
            var rightPosition = {x:xPosition,y:yPosition};
            return rightPosition;
        }
        else if(side == "bottom") {
            var yPosition = gameInstance.mapHeight - gameInstance.tileSize;
            do{var xPosition = getRandomInt(0,canvas.width - map.tileSize)}
            while(xPosition % map.tileSize != 0)
            var bottomPosition = {x:xPosition,y:yPosition};
            return bottomPosition;
        }
    },
    this.createHCorridor = function (x1,x2,y) {
        // x1 is the starting x and x2 is the ending x. y is the constant y
        var tileSize = map.tileSize;
        var arrayX1 = x1 / tileSize;
        var arrayX2 = x2 / tileSize;
        var arrayY = y / tileSize;
        if(arrayX1 > arrayX2) {var startX = arrayX2; var endX = arrayX1}
        else {var startX = arrayX1; var endX = arrayX2};
        for(var x = startX; x <= endX; x ++) {
            // if it surpasses map bounds
            if(map.mapArray[arrayY] == undefined) break;
            // add to map array
            map.mapArray[arrayY][x] = "2.0";
        }
    },
    this.createVCorridor = function (y1,y2,x) {
        // y1 is the starting y and y2 is the ending y. x is the constant x
        var tileSize = map.tileSize;
        var arrayY1 = y1 / tileSize;
        var arrayY2 = y2 / tileSize;
        var arrayX = x / tileSize;
        if(arrayY1 > arrayY2) {var startY = arrayY2; var endY = arrayY1}
        else {var startY = arrayY1; var endY = arrayY2};
        for(var y = startY; y <= endY; y++) {
            if(map.mapArray[y] == undefined) break;
            // add to map array
            map.mapArray[y][arrayX] = "2.0";
        }
    }
}


// Room constructor
var Room = function (propValues,tileSize,mapArray) {
    // external vars
    var gameInstance = GAME.gameInstance;
    var canvas = GAME.canvas;
    var ctx = GAME.ctx;
    //
    var self = {
        width: propValues.width,
        height: propValues.height,
        // corners
        x1:propValues.x,
        x2:propValues.x + propValues.width,
        y1:propValues.y,
        y2:propValues.y + propValues.height,
        corridorEntry: {},
    }
    self.corridorEntry = {x: self.x1 + 30, y: self.y1 + 30};
    self.corridorExit = {x:self.x1 + 60, y: self.y1 + 30};
    // check intersection with other rooms
    self.checkRoomIntersection = function (room) {
        return (self.x1 <= room.x2 && self.x2 >= room.x1 && self.y1 <= room.y2 && self.y2 >= room.y1);
    }
    // translate the room properties into tiles positioning and add it to map array
    self.addToMapArray = function () {
        // locates room position in array and replaces the corresponding array values
        var startX = self.x1 / tileSize;
        var endX = self.x2 / tileSize;
        var startY = self.y1 / tileSize;
        var endY = self.y2 / tileSize;
        for(var y = startY; y < endY; y++) {
            for(var x = startX; x < endX; x++) {
                    mapArray[y][x] = "2.0";
            }
        }
    }
    return self;
}


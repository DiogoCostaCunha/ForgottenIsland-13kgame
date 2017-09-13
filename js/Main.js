var _startingGameOptions = function (ctx) {
    //
    var self = {
        frameRate: 60,
        loopTimer: false,
        loop: GameLoop,
        frameCount: 0,
        gameTime: 0, // in seconds
        mapStartCD: 5,
        mapActualCD: 0,
        //
        paused: false,
        gameOver: false,
        finished: false,
        //
        passagesSize: 10,
        tileSize: 30,
        // current map
        map: null,
        // 
        mapMaxSize: 20,
        mapMinSize: 4,
        // size of world: worldSize*worldSize
        worldSize: null, 
        startCollectiblesNumber: null,
        // lives number is equal to worldSize
        livesNumber: null,
        //
        startMobsNumber: null,
        startTurretsNumber: null,
    }
    self.copy = JSON.parse(JSON.stringify(self));
    self.resetProps = function (mainObject,copyObject) {
        for(var x in copyObject) {
            for(var i in mainObject) {
                if(x == i) {
                    mainObject[x] = copyObject[x];
                }
            }
        }
    },
    self.resetEntities = function () {
        // empty lists
        TurretBullet.list = {};
        PlayerBullet.list = {};
        Collectible.list = {};
        Mob.list = {};
        WallTurret.list = {};
        TerrainTurret.list = {};
    }
    // update starting values according to what player chose (mapSize,difficulty...)
    self.changeConfigValues  = function () {
        // player config. options
        var chosenMapSize = document.getElementById("gameOptions-sizeInput").value;
        // if it is not a number
        if(isNaN(chosenMapSize)) {
            alert("Map size was not a number. Map size was set to 4");
            chosenMapSize = this.mapMinSize;
        }
        // limits
        if(chosenMapSize > this.mapMaxSize) chosenMapSize = this.mapMaxSize;
        else if(chosenMapSize < this.mapMinSize) chosenMapSize = this.mapMinSize;
        self.worldSize  = chosenMapSize;
        self.startCollectiblesNumber = self.worldSize;
        self.actualCollectiblesNumber = 0;
        self.livesNumber = self.worldSize;
    }
    return self;
}

var _GAME = function () {
    this.canvas;
    this.ctx;
    this.width;
    this.height;
    this.images = IMGS.images;
    this.states = {
        on_boot: true,
        on_menu: false,
        on_game: false,
    }
    this.UI = {
        menu: false,
        game: false,
    }
    this.gameInstance = _startingGameOptions();
    this.changeState = function (state,bootFlag) {
        for(var x in this.states) {
            if(x == "on_game" && this.states[x] == true) {
                clearInterval(this.gameInstance.loopTimer);
                this.gameInstance.resetProps(this.gameInstance,this.gameInstance.copy);
                this.gameInstance.resetEntities();
            }
        }
        for(var x in this.states) {
            if(x == state) {
                this.states[x] = true;
                this.ctx.clearRect(0,0,this.width,this.height);
                if(state == "on_menu") {
                    if(bootFlag == "boot")
                        GAME.mp3.playSong("song1");
                    this.UI.menu.draw();
                }
                else if(state == "on_game") {
                    //
                    this.gameInstance.changeConfigValues();
                    // make menu DOM elements dissapear
                    var sizeOptionDiv = document.getElementById("gameOptions-sizeDiv");
                    sizeOptionDiv.style.display = "none";
                    //
                    var gameInstance = this.gameInstance;
                    // generate whole world
                    generateGame();
                    this.gameInstance.loopTimer = setInterval(function() {
                        gameInstance.loop();
                    },1000/this.gameInstance.frameRate);
                }
            } 
            else this.states[x] = false;
        }
    }
}

function generateGame () {
    var gameInstance = GAME.gameInstance;
    //
    gameInstance.mapWidth = GAME.canvas.width;
    gameInstance.mapHeight = GAME.canvas.height - gameInstance.tileSize;
    // create a new world with a certain number of maps
    gameInstance.world = new World(gameInstance.worldSize);
    // generate the maps
    gameInstance.world.createMaps();
    // after world creation vars
    gameInstance.startMobsNumber = Object.keys(Mob.list).length;
    gameInstance.mobsKilled = 0;
    gameInstance.startTurretsNumber = Object.keys(TerrainTurret.list).length;
    gameInstance.turretsDestroyed = 0;
    // generate the player
    gameInstance.player = new Player();
    gameInstance.player.onInit();
    // generate minimap
    gameInstance.miniMap = new MiniMap();
}

function GameLoop () {
    // external vars
    var ctx = GAME.ctx;
    var canvasWidth = GAME.width;
    var canvasHeight = GAME.height;
    var gameInstance = GAME.gameInstance;
    var world = gameInstance.world;
    var player = gameInstance.player;
    var finish = gameInstance.finish;
    var gameUI = GAME.UI.game;
    
    if(gameInstance.paused || gameInstance.gameOver || gameInstance.finished) return;
    
    ctx.clearRect(0,0,canvasWidth,canvasHeight);

    if(gameInstance.frameCount % 60 == 0) gameInstance.gameTime++;
    //
    world.update();
    // entities update
    finish.update();
    Entity.update(WallTurret);
    Entity.update(TerrainTurret);
    Entity.update(TurretBullet);
    Entity.update(Mob);
    Entity.update(Collectible);
    Entity.update(PlayerBullet);
    Entity.update(HPCollectible);
    Entity.update(AttackCollectible);
    // 
    player.update();
    //
    gameUI.draw();
    //
    gameInstance.frameCount++;
    // decrease map CD
    if(gameInstance.frameCount % 60 == 0) gameInstance.mapActualCD--;
    if(gameInstance.mapActualCD <= 0) gameInstance.mapActualCD = 0;
}

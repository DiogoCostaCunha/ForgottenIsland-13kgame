var musicPlayer = function () {
  var self = {
    noteIteration:0,
    songCtx: new AudioContext(),
    soundCtx: new AudioContext(),
    song1: {
      name: "song1",
      D: [12,,,,17,,,,,,,,12,,,,15,,,,,,15,,14,,,,13,,,,12,,18,,17,,,,,,,,12,,,,10,,,,,14,,14,,14,,14,,14,,12,,,,17,,,,,,,,12,,,,15,,,,,,15,,14,,,,13,,,,12,,,8,9,10,11,12,13,14,15,16,17,18,,,,,17,,17,,15,,17],
      repeat: 2,
      notes: 40,
      hz: 300,
      type: "sawtooth",
    },
    song2: {
      name: "song2",
      D: [17,,,,14,,12,,11,,12,,,,14,,17,,,,14,,12,,11,,12,,,,14,,17,,,,14,,12,,11,,12,,22,,14,,17,,,,14,,12,,11,,12,,,,14,,12,,,,12,,,,,,,,14,,,,14,,,,,,15,,16,,17,,,,,,17,,,,14,,12,,11,,12,,,,14,,17,,,,17,,,,,,17,,,,17,,,,,,,,17,,17,,17,,17],
      repeat: 2,
      notes: 46,
      hz: 440,
      type: "sawtooth",
    }
  }
  self.playSong = function (name) {
    if(self.songCtx != undefined && self.songCtx != null) {
        self.songCtx.close();
        self.songCtx = new AudioContext();
    }
    var sound;
    if(name == "song1") sound = self.song1;
    else if(name == "song2") sound = self.song2;
    //
    with(self.songCtx) {
      for(i in sound.D) {
        with(createOscillator()) {
          if(sound.D[i]) {
            onended = function () {
              self.noteIteration++;
              if(self.noteIteration >= sound.notes) {
                sound.repeat--;
                var toPlay;
                if(sound.repeat <= 0) {
                  if(sound == self.song1) toPlay = "song2";
                  else if(sound == self.song2) toPlay = "song1";
                  sound.repeat = 2;
                }
                else toPlay = sound.name;
                self.noteIteration = 0;
                setTimeout(function() {
                  self.playSong(toPlay);
                },700);
              }
            }
            G = createGain(),
            connect(G),
            G.connect(destination),
            frequency.value=sound.hz*1.06**(13-sound.D[i]),
            G.gain.value=0.2,
            type=sound.type,start(i*.1),
            stop(i*.1+.1)
          }
        }
      }
    }
  }
  self.playSound = function (name) {
    if(self.soundCtx != undefined && self.soundCtx != null) {
        self.soundCtx.close();
        self.soundCtx = new AudioContext();
    }
    var sound;
    if(name == "enemyDeath") {
      with(self.soundCtx)for(i in D=[16])with(createOscillator())if(D[i])connect(destination),frequency.value=300*1.06**(13-D[i]),type='triangle',start(i*.04),stop(i*.04+.04)
    }
    else if(name == "playerDeath") {
      with(self.soundCtx)for(i in D=[3,9])with(createOscillator())if(D[i])G=createGain(),connect(G),G.connect(destination),frequency.value=130*1.06**(13-D[i]),G.gain.value=0.5,type='sawtooth',start(i*.1),stop(i*.1+.1)
    }
    else if(name == "powerUp") {
      with(self.soundCtx)for(i in D=[12,7])with(createOscillator())if(D[i])G=createGain(),connect(G),G.connect(destination),frequency.value=200*1.06**(13-D[i]),G.gain.value=0.2,type='square',start(i*.1),stop(i*.1+.1)
    }
    else if(name == "passagesUnlocked") {
      with(self.soundCtx)for(i in D=[10,9])with(createOscillator())if(D[i])G=createGain(),connect(G),G.connect(destination),frequency.value=440*1.06**(13-D[i]),G.gain.value=0.3,type='square',start(i*.1),stop(i*.1+.1)
    }
  
  }
  return self;
}


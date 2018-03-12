var Playlist = function(tracks) {
  var self = this;
  self.tracks = tracks;
  self.titles = {};
  for (track in tracks) {
    var title = track[0];
    var files = track.slice(1);
    self.titles[title] = new Track(title, files, {});
  }
};

Playlist.prototype = {
  
};

var Track = function(title, files, meta) {
  var self = this;
  self.title = title;
  self.files = files;
  self.meta = meta;
  self.sound = null;
};

Track.prototype = {
  loadSound: function() {
    var self = this;
    if (self.sound) {
      return self.sound;
    }
    var sound = self.sound = new Howl({
      src: self.files,
      // Force to HTML5 so that the audio can stream in (best for large
      // files). Makes Chrome act up under Webrick(?).
      html5: false,
      preload: false,
    });
    self.play = sound.play.bind(sound);
    self.pause = sound.pause.bind(sound);
    self.seek = sound.seek.bind(sound);
    self.stop = sound.stop.bind(sound);
    self.playing = sound.playing.bind(sound);
    self.duration = sound.duration();
    self.state = sound.state.bind(sound);
    self.load = sound.load.bind(sound);
    return sound;
  },
};

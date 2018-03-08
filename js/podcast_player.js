// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;
      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];
      // 5. Let k be 0.
      var k = 0;
      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }
      // 7. Return -1.
      return -1;
    }
  });
}

/*!
 *  Modified Howler.js Audio Player Demo
 *  howlerjs.com
 *
 *  (c) 2013-2018, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 *  
 *  Modified by Chaim Leib Halbert 2018
 */

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 * @param {string} currentFile Name of file, without the extension, to play first.
 * @param {DOM} dom Element in the page where the player lives.
 */
var Player = function(playlist, currentFile, dom) {
  var self = this;
  self.playlist = playlist;
  self.currentFile = currentFile;
  self.dom = {player: dom};
  self.index = currentFile === undefined ?
    0 :
    playlist.findIndex(function(track) {
      return track.file === currentFile;
    }
  );
  self.showTrackNumber = self.showTrackList = self.playlist.length > 1;
  
  var elms = ['trackTitle', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'volumeBtn', 'progress', 'progressInner', 'loading', 'playlist', 'list', 'volume', 'sliderBtn'];
  for (var i=0; i<elms.length; i++) {
    var cls = elms[i];
    var elm = self.dom.player.getElementsByClassName(cls);
    if (elm.length >= 1) {
      self.dom[cls] = elm[0];
    }
  }
  
  // set initial DOM state
  self._updTrackTitle();

  // Setup the playlist display.
  for (var i=0; i<playlist.length; i++) {
    var track = playlist[i];
    var div = document.createElement('div');
    div.className = 'list-track';
    if (i === self.index) {
      div.className += ' current-track';
    }
    if (self.showTrackNum) {
      var ord = i + 1;
      div.innerHTML = ord + '. ' + track.hdate + ' - ' + track.title;
    } else {
      div.innerHTML = track.hdate + ' - ' + track.title;
    }
    var savedIndex = i;
    div.onclick = function() {
      self.skipTo(savedIndex);
    };
    self.dom.list.appendChild(div);
  }
  
  var sound;
  var track = self.playlist[self.index];

  // If we already loaded this track, use the current one.
  // Otherwise, setup and load a new Howl.
  if (track.howl) {
    sound = track.howl;
  } else {
    sound = track.howl = new Howl({
      src: [track.file + '.m4a'],
      // Force to HTML5 so that the audio can stream in (best for large
      // files). Makes Chrome act up under Webrick(?).
      html5: false,
      onplay: function() {
        // Start upating the progress of the track.
        requestAnimationFrame(self.step.bind(self));

        self.dom.pauseBtn.style.display = 'inline-block';
        self.dom.playBtn.style.display = 'none';
        self._updProgress();
      },
      onload: function() {
        self.dom.loading.style.display = 'none';
        self.dom.playBtn.style.display = 'inline-block';
        self._updProgress();
      },
      onend: function() {
        if (self.index + 1 < self.playlist.length) {
          self.skip('right');
        }
      },
      onpause: function() {
        self.dom.playBtn.style.display = 'inline-block';
        self.dom.pauseBtn.style.display = 'none';
      },
      onstop: function() {
      }
    });
  }

  // Bind our player controls.
  self.dom.playBtn.addEventListener('click', function() { self.play(); });
  self.dom.pauseBtn.addEventListener('click', function() { self.pause(); });
  if (self.showTrackList) {
    self.dom.trackTitle.style['text-decoration'] = 'underline';
    self.dom.prevBtn.style.display = 'inline-block';
    self.dom.nextBtn.style.display = 'inline-block';
    self.dom.playlistBtn.addEventListener('click', function() { self.togglePlaylist(); });
    self.dom.playlist.addEventListener('click', function() { self.togglePlaylist(); });
    self.dom.prevBtn.addEventListener('click', function() { self.skip('prev'); });
    self.dom.nextBtn.addEventListener('click', function() { self.skip('next'); });
  } else {
    self.dom.trackTitle.style['text-decoration'] = 'none';
    self.dom.prevBtn.style.display = 'none';
    self.dom.nextBtn.style.display = 'none';
  }
  self.dom.volumeBtn.addEventListener('click', function() { self.toggleVolume(); });

  // volume drag
  var volumeChanged = function(event) {
    event.preventDefault();
    var sliderHeight = self.dom.sliderBtn.clientHeight;
    var y = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
    var travel = self.dom.volume.clientHeight - sliderHeight;
    var clientY = y - getTop(self.dom.volume) - 0.5 * sliderHeight;
    var per = Math.min(1, Math.max(0, 1 - clientY / travel));
    self.volume(per);
  };
  var startVolumeDrag = function(event) {
    event.preventDefault();
    document.addEventListener('mousemove', volumeChanged);
    document.addEventListener('touchmove', volumeChanged);
    document.addEventListener('mouseup', endVolumeDrag);
    document.addEventListener('touchend', endVolumeDrag);
  };
  var endVolumeDrag = function(event) {
    event.preventDefault();
    document.removeEventListener('mousemove', volumeChanged);
    document.removeEventListener('touchmove', volumeChanged);
  };
  self.dom.volume.addEventListener('mousedown', startVolumeDrag);
  self.dom.volume.addEventListener('touchstart', startVolumeDrag);

  // progress drag
  var progressChanged = function(event) {
    event.preventDefault();
    var progressWidth = self.dom.progressInner.clientWidth;
    var x = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    var travel = progressWidth;
    var clientX = x - getLeft(self.dom.progressInner);
    var per = Math.min(1, Math.max(0, clientX / travel));
    self.seek(per);
  };
  var startProgressDrag = function(event) {
    event.preventDefault();
    progressChanged(event);
    document.addEventListener('mousemove', progressChanged);
    document.addEventListener('touchmove', progressChanged);
    document.addEventListener('mouseup', endProgressDrag);
    document.addEventListener('touchend', endProgressDrag);
  };
  var endProgressDrag = function(event) {
    event.preventDefault();
    document.removeEventListener('mousemove', progressChanged);
    document.removeEventListener('touchmove', progressChanged);
  };
  self.dom.progressInner.addEventListener('mousedown', startProgressDrag);
  self.dom.progressInner.addEventListener('touchstart', startProgressDrag);
  
  var resize = function() {
    self._updVolume();
    self._updProgress();
  };
  resize();
  window.addEventListener('resize', resize);
};

// https://stackoverflow.com/questions/5598743/finding-elements-position-relative-to-the-document
function getLeft(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;
    var left = box.left + scrollLeft - clientLeft;
    return left;
}
function getTop(elem) {
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var top  = box.top +  scrollTop - clientTop;
    return top;
  }

Player.prototype = {
  /**
   * Play a song in the playlist.
   * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
   */
  play: function(index) {
    var self = this;

    // Keep track of the index we are currently playing.
    if (index !== undefined) {
      self.index = index;
    }

    var sound = self.playlist[self.index].howl;

    // Begin playing the sound.
    sound.play();

    // Update the track display.
    self._updTrackTitle();
    self._updProgress();

    // Show the pause button.
    if (sound.state() === 'loaded') {
      self.dom.playBtn.style.display = 'none';
      self.dom.pauseBtn.style.display = 'inline-block';
    } else {
      self.dom.loading.style.display = 'inline-block';
      self.dom.playBtn.style.display = 'none';
      self.dom.pauseBtn.style.display = 'none';
    }

  },
  
  _updTrackTitle: function() {
    var self = this;
    var ord = self.index + 1;
    var track = self.playlist[self.index];
    var title = track.hdate + ' - ' + track.title;
    if (self.showTrackNum) {
      self.dom.trackTitle.innerHTML = ord + '. ' + title;
    } else {
      self.dom.trackTitle.innerHTML = title;
    }
  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Puase the sound.
    sound.pause();

    // Show the play button.
    self.dom.playBtn.style.display = 'inline-block';
    self.dom.pauseBtn.style.display = 'none';
  },

  /**
   * Skip to the next or previous track.
   * @param  {String} direction 'next' or 'prev'.
   */
  skip: function(direction) {
    var self = this;

    // Get the next track based on the direction of the track.
    var index = 0;
    if (direction === 'prev') {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    } else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }

    self.skipTo(index);
  },

  /**
   * Skip to a specific track based on its playlist index.
   * @param  {Number} index Index in the playlist.
   */
  skipTo: function(index) {
    var self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset progress.
    self.dom.progress.style.width = '0%';

    // Play the new track.
    self.play(index);
  },

  /**
   * Set the volume and update the volume slider display.
   * @param  {Number} val Volume between 0 and 1.
   */
  volume: function(val) {
    var self = this;
    Howler.volume(val);
    self._updVolume();
  },
  
  _updVolume: function() {
    // Update the display on the slider.
    var self = this;
    var vol = 1;
    if (typeof Howler.volume === 'function') {
      vol = Howler.volume();
    }
    var sliderHeight = self.dom.sliderBtn.clientHeight;
    var travel = self.dom.volume.clientHeight - sliderHeight;
    self.dom.sliderBtn.style.top = (
      travel * (1 - vol)
    ) + 'px';
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} per Percentage through the song to skip.
   */
  seek: function(per) {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Convert the percent into a seek position.
    sound.seek(sound.duration() * per);
    self._updProgress();
  },

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  step: function() {
    var self = this;

    self._updProgress();
    
    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;
    
    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },
  
  _updProgress: function() {
    var self = this;
    
    // Get the Howl we want to manipulate.
    var track = self.playlist[self.index];
    if (!track || !track.howl) {
      self.dom.timer.innerHTML = self.formatTime(null);
      self.dom.duration.innerHTML = self.formatTime(null);
      self.dom.progress.style.width = '0%';
      return;
    }
    
    var sound = track.howl;
    // Determine our current seek position.
    var seek = sound.seek() || 0;
    self.dom.timer.innerHTML = self.formatTime(Math.round(seek));
    self.dom.duration.innerHTML = self.formatTime(Math.round(sound.duration()));
    self.dom.progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';
  },

  /**
   * Toggle the playlist display on/off.
   */
  togglePlaylist: function() {
    var self = this;
    var display = (self.dom.playlist.style.display === 'block') ? 'none' : 'block';

    setTimeout(function() {
      self.dom.playlist.style.display = display;
    }, (display === 'block') ? 0 : 500);
    self.dom.playlist.classList.toggle('fadein');
    self.dom.playlist.classList.toggle('fadeout');
  },

  /**
   * Toggle the volume display on/off.
   */
  toggleVolume: function() {
    var self = this;
    var display = (self.dom.volume.style.display === 'block') ? 'none' : 'block';

    setTimeout(function() {
      self.dom.volume.style.display = display;
      self._updVolume();
    }, (display === 'block') ? 0 : 500);
    self.dom.volume.classList.toggle('fadein');
    self.dom.volume.classList.toggle('fadeout');
  },

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
  formatTime: function(secs) {
    if (typeof secs !== 'number') {
      return '--:--';
    }
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - 60*minutes) || 0;
    var secondsStr = (seconds < 10 ? '0' : '') + seconds;
    return minutes + ':' + secondsStr;
  }
};

// Cache references to DOM elements.
var players = document.getElementsByClassName("podcast-player");
window.podcast_players = [];
for (var i = 0; i < players.length; i++) {
  var player = players[i];
  var dataPlaylist = window[player.getAttribute("data-playlist")];
  var dataCurrentFile = player.getAttribute("data-currentFile");
  window.podcast_players.push(new Player(dataPlaylist, dataCurrentFile, player));
}


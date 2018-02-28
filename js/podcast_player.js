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
  
  var elms = ['trackTitle', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'volumeBtn', 'progress', 'wave', 'waveform', 'loading', 'playlist', 'list', 'volume', 'sliderBtn'];
  for (var i=0; i<elms.length; i++) {
    var cls = elms[i];
    var elm = self.dom.player.getElementsByClassName(cls);
    if (elm.length >= 1) {
      self.dom[cls] = elm[0];
    }
  }


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
  

  // Bind our player controls.
  self.dom.playBtn.addEventListener('click', function() { self.play(); });
  self.dom.pauseBtn.addEventListener('click', function() { self.pause(); });
  self.dom.waveform.addEventListener('click', function(event) { self.seek(event.clientX / self.dom.player.innerWidth); });
  if (self.showTrackList) {
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
  self.dom.volume.addEventListener('click', function() { self.toggleVolume(); });

  // Setup the event listeners to enable dragging of volume slider.
  self.dom.sliderBtn.addEventListener('mousedown', function() {
    self.sliderDown = true;
  });
  self.dom.sliderBtn.addEventListener('touchstart', function() {
    self.sliderDown = true;
  });
  self.dom.volume.addEventListener('mouseup', function() {
    self.sliderDown = false;
  });
  self.dom.volume.addEventListener('touchend', function() {
    self.sliderDown = false;
  });

  var move = function(event) {
    if (self.sliderDown) {
      var sliderHeight = self.dom.sliderBtn.clientHeight;
      var y = event.clientY || event.touches[0].clientY;
      var travel = self.dom.volume.clientHeight - sliderHeight;
      var clientY = y - self.dom.volume.offsetTop - 0.5 * sliderHeight;
      var per = Math.min(1, Math.max(0, 1 - clientY / travel));
      self.volume(per);
    }
  };
  self.dom.volume.addEventListener('mousemove', move);
  self.dom.volume.addEventListener('touchmove', move);
  
  
  // Setup the "waveform" animation.
  self.wave = new SiriWave({
      container: self.dom.waveform,
      width: self.dom.player.innerWidth,
      height: self.dom.player.innerHeight * 0.3,
      cover: true,
      speed: 0.03,
      amplitude: 0.7,
      frequency: 2
  });
  self.wave.start();

  // Update the height of the wave animation.
  // These are basically some hacks to get SiriWave.js to do what we want.
  var resize = function() {
    var height = self.dom.player.innerHeight * 0.3;
    var width = self.dom.player.innerWidth;
    self.wave.height = height;
    self.wave.height_2 = height / 2;
    self.wave.MAX = self.wave.height_2 - 4;
    self.wave.width = width;
    self.wave.width_2 = width / 2;
    self.wave.width_4 = width / 4;
    self.wave.canvas.height = height;
    self.wave.canvas.width = width;
    self.wave.container.style.margin = -(height / 2) + 'px auto';

    self._updVolume();
  };
  resize();
  window.addEventListener('resize', resize);
  
  // set initial DOM state
  self._updTrackTitle();
  self.dom.loading.style.display = 'none';
  self.dom.playBtn.style.display = 'inline-block';
};

Player.prototype = {
  /**
   * Play a song in the playlist.
   * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
   */
  play: function(index) {
    var self = this;
    var sound;

    index = typeof index === 'number' ? index : self.index;
    var track = self.playlist[index];

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
          // Display the duration.
          self.dom.duration.innerHTML = self.formatTime(Math.round(sound.duration()));

          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));

          // Start the wave animation if we have already loaded
          self.wave.container.style.display = 'block';
          self.dom.pauseBtn.style.display = 'inline-block';
        },
        onload: function() {
          // Start the wave animation.
          self.wave.container.style.display = 'block';
          self.dom.loading.style.display = 'none';
        },
        onend: function() {
          // Stop the wave animation.
          self.wave.container.style.display = 'none';
          if (self.index + 1 < self.playlist.length) {
            self.skip('right');
          }
        },
        onpause: function() {
          // Stop the wave animation.
          self.wave.container.style.display = 'none';
        },
        onstop: function() {
          // Stop the wave animation.
          self.wave.container.style.display = 'none';
        }
      });
    }

    // Begin playing the sound.
    sound.play();

    // Update the track display.
    self._updTrackTitle();

    // Show the pause button.
    if (sound.state() === 'loaded') {
      self.dom.playBtn.style.display = 'none';
      self.dom.pauseBtn.style.display = 'inline-block';
    } else {
      self.dom.loading.style.display = 'inline-block';
      self.dom.playBtn.style.display = 'none';
      self.dom.pauseBtn.style.display = 'none';
    }

    // Keep track of the index we are currently playing.
    self.index = index;
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
    var vol = Howler.volume() || 1;
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
    if (sound.playing()) {
      sound.seek(sound.duration() * per);
    }
  },

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  step: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    self.dom.timer.innerHTML = self.formatTime(Math.round(seek));
    self.dom.progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
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
    var hours = Math.floor(secs/3600) || 0;
    var minutes = Math.floor((secs - 3600*hours) / 60) || 0;
    var seconds = (secs - 60*minutes) || 0;
    var secondsStr = (seconds < 10 ? '0' : '') + seconds;
    if (!hours) {
      return minutes + ':' + secondsStr;
    }
    var minutesStr = (minutes < 10 ? '0' : '') + minutes;
    return hours + ':' + minutesStr + ':' + secondsStr;
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


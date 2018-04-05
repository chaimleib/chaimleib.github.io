
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
  self.id = self.dom.player.id;
  self.playAll = true;

  self.index = currentFile === undefined ?
    0 :
    playlist.findIndex(function(track) {
      return track.file === currentFile;
    }
  );
  self.showTrackNumber = self.showTrackList = self.playlist.length > 1;

  var elms = [
    'trackTitle',
    'playlistBtn', 'playlistFrame', 'playlist',
    'playBtn', 'pauseBtn', 'skippers', 'prevBtn', 'nextBtn', 'loading',
    'volumeBtn', 'volumeFrame', 'volumeActiveZone', 'volumeBar',
    'progressFrame', 'progressActiveZone', 'progressBar',
    'elapsed', 'duration',
  ];
  for (var i=0; i<elms.length; i++) {
    var cls = elms[i];
    var elm = self.dom.player.getElementsByClassName(cls);
    if (elm.length >= 1) {
      self.dom[cls] = elm[0];
    }
  }

  self.volumeActive = false;
  self.playlistActive = false;

  // set initial DOM state
  self._updTrackTitle();
  self._updPlaylist();
  self._updSkippers();

  var sound = self.getSound();

  // Bind our player controls.
  self.dom.playBtn.addEventListener('click', self.play.bind(self));
  self.dom.pauseBtn.addEventListener('click', self.pause.bind(self));

  self.fadeSpeed = 500;
  /**
   * Toggle the volume panel on/off.
   */
  self.dom.volumeFrame.style.transition = 'opacity ' + self.fadeSpeed + 'ms';
  function volumeActivate() {
    self.volumeActive = true;
    self.dom.volumeFrame.style.display = 'block';
    self.dom.volumeFrame.style.opacity = '1'; // instant, b/c disp block
    self._updVolume();
    document.addEventListener('mouseup', volumeDeactivate);
    document.addEventListener('touchend', volumeDeactivate);
  }
  function volumeDeactivate() {
    setTimeout(function() {
      self.dom.volumeFrame.style.display = 'none';
      self.volumeActive = false;
    }, self.fadeSpeed);
    self.dom.volumeFrame.style.opacity = '0';
    document.removeEventListener('mouseup', volumeDeactivate);
    document.removeEventListener('touchend', volumeDeactivate);
  }
  function volumeClicked(event) {
    event.preventDefault();
    if (self.volumeActive) {
      volumeDeactivate();
    } else {
      volumeActivate();
    }
  }
  self.dom.volumeBtn.addEventListener('click', volumeClicked);
  // volume drag
  var volumeChanged = function(event) {
    event.preventDefault();
    var y = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
    var travel = self.dom.volumeActiveZone.clientHeight;
    var clientY = y - getTop(self.dom.volumeActiveZone);
    var per = Math.min(1, Math.max(0, 1 - clientY / travel));
    self.volume(per);
  };
  var startVolumeDrag = function(event) {
    event.preventDefault();
    volumeChanged(event);
    document.addEventListener('mousemove', volumeChanged);
    document.addEventListener('touchmove', volumeChanged);
    document.addEventListener('mouseup', endVolumeDrag);
    document.addEventListener('touchend', endVolumeDrag);
    document.removeEventListener('mouseup', volumeDeactivate);
    document.removeEventListener('touchend', volumeDeactivate);
  };
  var endVolumeDrag = function(event) {
    event.preventDefault();
    document.removeEventListener('mousemove', volumeChanged);
    document.removeEventListener('touchmove', volumeChanged);
    document.removeEventListener('mouseup', endVolumeDrag);
    document.removeEventListener('touchend', endVolumeDrag);
    document.addEventListener('mouseup', volumeDeactivate);
    document.addEventListener('touchend', volumeDeactivate);
  };
  self.dom.volumeActiveZone.addEventListener('mousedown', startVolumeDrag);
  self.dom.volumeActiveZone.addEventListener('touchstart', startVolumeDrag);

  /**
   * Toggle the playlist display on/off.
   */
  self.dom.playlistFrame.style.transition = 'opacity ' + self.fadeSpeed + 'ms';
  function playlistActivate() {
    self.playlistActive = true;
    self.dom.playlistFrame.style.display = 'block';
    self.dom.playlistFrame.style.opacity = '1'; // instant, b/c disp block
    document.addEventListener('mouseup', playlistDeactivate);
    document.addEventListener('touchend', playlistDeactivate);
  }
  function playlistDeactivate() {
    setTimeout(function() {
      self.dom.playlistFrame.style.display = 'none';
      self.playlistActive = false;
    }, self.fadeSpeed);
    self.dom.playlistFrame.style.opacity = '0';
    document.removeEventListener('mouseup', playlistDeactivate);
    document.removeEventListener('touchend', playlistDeactivate);
  }
  function playlistClicked(event) {
    event.preventDefault();
    if (self.playlistActive) {
      playlistDeactivate();
    } else {
      playlistActivate();
    }
  }
  if (self.showTrackList) {
    self.dom.trackTitle.style['text-decoration'] = 'underline';
    self.dom.trackTitle.style['cursor'] = 'pointer';
    self.dom.skippers.style.display = 'inline-block';
    self.dom.playlistBtn.addEventListener('click', playlistClicked);
  } else {
    self.dom.trackTitle.style['text-decoration'] = 'none';
    self.dom.trackTitle.style['cursor'] = 'default';
    self.dom.skippers.style.display = 'none';
  }

  // progress drag
  var progressChanged = function(event) {
    event.preventDefault();
    var progressWidth = self.dom.progressActiveZone.clientWidth;
    var x = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    var travel = progressWidth;
    var clientX = x - getLeft(self.dom.progressActiveZone);
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
    document.removeEventListener('mouseup', endProgressDrag);
    document.removeEventListener('touchend', endProgressDrag);
  };
  self.dom.progressActiveZone.addEventListener('mousedown', startProgressDrag);
  self.dom.progressActiveZone.addEventListener('touchstart', startProgressDrag);

  var resize = function() {
    self._updVolume();
    self._updProgress();
  };
  resize();
  window.addEventListener('resize', resize);
};


Player.prototype = {
  loadSound: function(onload) {
    var self = this;
    var track = self.playlist[self.index];
    var defaultOnload = function() {
      track.howl = this;
      self._updBtns();
      self._updProgress();
      if (typeof onload === 'function') {
        onload();
      }
      if (self.shouldAutostart()) {
        self.play();
      }
    };
    var sound = new Howl({
      src: [track.file + '.m4a'],
      // Force to HTML5 so that the audio can stream in (best for large
      // files). Makes Chrome act up under Webrick(?).
      html5: false,
      onload: defaultOnload,
      onend: function() {
        if (self.shouldPlayAll()) {
          self.skip('right');
        } else {
          self._updSkippers(); // hrefs to no autostart
        }
      },
    });
    track.howl = sound;
  },

  getSound: function(onload) {
    var self = this;
    var track = self.playlist[self.index];
    if (!track.howl) {
      track.howl = self.loadSound(onload);
    } else {
      onload();
    }
  },

  /**
   * Play a song in the playlist.
   * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
   */
  play: function() {
    var self = this;
    self.getSound(function() {
      var track = self.playlist[self.index];
      track.howl.play();
      self._updSkippers(); // change hrefs to autostart
      requestAnimationFrame(self.step.bind(self));
    });
  },

  shouldAutostart: function() {
    var self = this;
    var q = getParams(window.location.search);
    if (!q.hasOwnProperty('autostart')) {
      return false;
    } else if (q.autostart === '') {
      return true;
    } else {
      return self.id && q.autostart === self.id;
    }
  },

  // After finishing this track, should we play the next track?
  shouldPlayAll: function() {
    var self = this;
    return self.playAll && self.index + 1 < self.playlist.length;
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

  _updPlaylist: function() {
    var self = this;
    self.dom.playlist.innerHTML = '';
    for (var i=0; i<self.playlist.length; i++) {
      var track = self.playlist[i];
      var li = document.createElement('li');
      li.className = 'list-track';
      if (i === self.index) {
        li.className += ' current-track';
      }
      var linkText;
      if (self.showTrackNum) {
        var ord = i + 1;
        linkText = ord + '. ' + track.hdate + ' - ' + track.title;
      } else {
        linkText = track.hdate + ' - ' + track.title;
      }
      // TODO: linkText = escape(linkText);
      if (i === self.index) {
        li.innerHTML = linkText;
      } else {
        var a = document.createElement('a');
        a.innerHTML = linkText;
        a.href = self.getTrackLink(i, false);
        li.appendChild(a);
      }
      self.dom.playlist.appendChild(li);
    }
  },

  _updSkippers: function() {
    var self = this;
    var prev = self.getSkip('prev');
    var next = self.getSkip('next');
    var prevBtn = self.dom.prevBtn;
    var nextBtn = self.dom.nextBtn;
    if (prev === null) {
      prevBtn.removeAttribute('href');
    } else {
      prevBtn.href = self.getTrackLink(prev, self.playing());
    }
    if (next === null) {
      nextBtn.removeAttribute('href');
    } else {
      nextBtn.href = self.getTrackLink(next, self.playing());
    }
  },

  playing: function() {
    var self = this;
    var track = self.playlist[self.index];
    return track && track.howl && track.howl.playing();
  },

  getTrackLink: function(i, autostart) {
    var self = this;
    if (i < 0 || i > self.playlist.length) {
      return null;
    }
    var trackLink = self.playlist[i].file + '.html';
    if (!autostart) {
      return trackLink;
    }
    trackLink += '?autostart';
    if (self.id) {
      trackLink += '=' + encodeURIComponent(self.id);
    }
    return trackLink;
  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    var self = this;
    var sound = self.playlist[self.index].howl;
    sound.pause();
    self._updBtns();
    self._updSkippers(); // upd hrefs to no autostart
  },

  /**
   * Skip to the next or previous track.
   * @param  {String} direction 'next' or 'prev'.
   */
  skip: function(direction) {
    var self = this;
    var nextTrack = self.getSkip(direction, true);
    self.skipTo(nextTrack);
  },

  /**
   * @param {String} direction 'next' or 'prev'
   * @param {bool} shouldLoop allows skipping past the ends of self.playlist
   * @return null if can't skip, else integer track index to skip to
   */
  getSkip: function(direction, shouldLoop) {
    var self = this;
    var index;
    if (direction === 'prev') {
      index = self.index - 1;
      if (index >= 0) {
        return index;
      } else if (shouldLoop) {
        return self.playlist.length - 1;
      } else {
        return null;
      }
    } else {
      index = self.index + 1;
      if (index < self.playlist.length) {
        return index;
      } else if (shouldLoop) {
        return 0;
      } else {
        return null;
      }
    }
  },

  /**
   * Skip to a specific track based on its playlist index.
   * @param  {Number} index Index in the playlist.
   */
  skipTo: function(index) {
    var self = this;
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }
    window.location = self.getTrackLink(index, true);
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
    var travel = self.dom.volumeActiveZone.clientHeight;
    var barHeight = travel * vol;
    self.dom.volumeBar.style.bottom = '0';
    self.dom.volumeBar.style.height = barHeight + 'px';
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
    self._updBtns();

    // If the sound is still playing, continue stepping.
    if (self.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  _updProgress: function() {
    var self = this;
    var track = self.playlist[self.index];
    if (!track || !track.howl || track.howl.state() !== 'loaded') {
      self.dom.elapsed.innerHTML = self.formatTime(null);
      self.dom.duration.innerHTML = self.formatTime(null);
      self.dom.progressBar.style.width = '0%';
      return;
    }

    var sound = track.howl;
    // Determine our current seek position.
    var seek = sound.seek();
    self.dom.elapsed.innerHTML = self.formatTime(Math.round(seek));
    self.dom.duration.innerHTML = self.formatTime(Math.round(sound.duration()));
    self.dom.progressBar.style.width = (((seek / sound.duration()) * 100) || 0) + '%';
  },

  _updBtns: function() {
    var self = this;
    var track = self.playlist[self.index];
    if (!track || !track.howl || track.howl.state() !== 'loaded') {
      self.dom.playBtn.style.display = 'none';
      self.dom.pauseBtn.style.display = 'none';
      self.dom.loading.style.display = 'inline-block';
      return;
    }
    var sound = track.howl;
    if (sound.playing()) {
      self.dom.playBtn.style.display = 'none';
      self.dom.pauseBtn.style.display = 'inline-block';
      self.dom.loading.style.display = 'none';
      return;
    }
    //paused
    self.dom.playBtn.style.display = 'inline-block';
    self.dom.pauseBtn.style.display = 'none';
    self.dom.loading.style.display = 'none';
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
var players = document.getElementsByClassName('podcast-player');
window.podcast_players = [];
for (var i = 0; i < players.length; i++) {
  var player = players[i];
  var dataPlaylist = window[player.getAttribute('data-playlist')];
  var dataCurrentFile = player.getAttribute('data-currentFile');
  window.podcast_players.push(new Player(dataPlaylist, dataCurrentFile, player));
}

/**
 * Polyfills and utilities
 */
// https://stackoverflow.com/questions/5598743/finding-elements-position-relative-to-the-document
// Positioning
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

// Parse query strings to k-v map
// Modified from https://stackoverflow.com/a/3855394/2687419
function getParams(query) {
  if (!query) {
    return {};
  }
  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce(function(params, param) {
      var parts = param.split('=');
      var key = parts[0];
      var value = parts[1];
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      return params;
    }, {});
}


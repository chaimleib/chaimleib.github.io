function collectDoms(root, elms) {
  var dom = {};
  dom.root = root;
  elms.forEach(function(cls) {
    var found = dom.root.getElementsByClassName(cls);
    if (found.length === 1) {
      dom[cls] = found[0];
    } else {
      console.warning('expected 1 "' + cls + '", found ' + found.length);
    }
  });
  return dom;
}

var PlayerView = function(elm) {
  var self = this;
  self.dom = collectDoms(elm, [
    'progressOuter',
  ]);
};

var Timeline = function(elm) {
  var self = this;
  self.dom = collectDoms(elm, [
    'progressOuter',
    'progressInner',
    'progress',
  ]);

  // progress drag
  var progressChanged = function(event) {
    event.preventDefault();
    var progressWidth = self.dom.progressInner.clientWidth;
    var x = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    var travel = progressWidth;
    var clientX = x - getLeft(self.dom.progressInner);
    var per = Math.min(1, Math.max(0, clientX / travel));
    if (self.changedTo) {
      self.changedTo(per);
    }
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
};

Timeline.prototype = {
  setProgress: function(frac) {
    var self = this;
    if (!self._setProgress) {
      console.warning('_setProgress(' + frac + '): hook not set');
    } else {
      self._setProgress(frac);
    }
  },
  getProgress: function() {
    var self = this;
    if (!self._getProgress) {
      console.warning('_getProgress() hook not set');
      return 0;
    } else {
      return self._getProgress();
    }
  }
};



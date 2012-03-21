var get = Ember.get, set = Ember.set, fmt = Ember.String.fmt;

var animKeyFramesRE = /^(from|to|\d+%?)$/,
    sorter = function(a, b) { return a.pct - b.pct; },
    animate = $.fn.animate;

$.fn.animate = function(properties, speed, easing, callback) {
  var optall = jQuery.speed(speed, easing, callback);
  if (optall.css) {
    return this.animateCSS(optall);
  } else {
    animate.call(this, properties, speed, easing, callback);
  }
};

$.fn.animateCSS = function(properties, options) {
  var key, keys = [], transition, prefix = '-webkit-';
  for (key in properties) {
    if (key.match(/translate/)) {
      keys.push('-webkit-transform');
    } else {
      keys.push(key);
    }
  }
  options.easing = options.easing === 'swing' ? 'linear' : options.easing;

  transition = {
    'transition-property': keys.uniq().join(', '),
    'transition-duration': options.duration+'ms',
    'transition-delay': options.delay || '0ms',
    'transition-timing-function': options.easing || 'linear'
  };
  this.on('webkitTransitionEnd', function() {
    $(this).off('webkitTransitionEnd').css(prefix+'transition-property', 'none');
    options.complete.call(this);
  });

  for (key in transition) {
    transition[prefix+key] = transition[key];
  }

  if (options.queue) {
    this.queue(options.queue, function() {
      $(this).css(transition).css(properties).dequeue();
    });
  } else {
    this.css(transition).css(properties);
  }
};

/**
  @class

  Overview
  ========

  Ember.Animation is used to animate views. Most of the time you will use Ember.Animatable
  or Ember.AnimationSupport mixin depending on your building blocks: Ember.View or Ember.ViewState

  @extends Ember.Object
 */
Ember.Animation = Ember.Object.extend({
  isAnimation: true,

  view: null,
  before: null,
  from: null,
  to: null,
  keyframes: null,
  after: null,
  delay: 0,
  duration: 'normal',
  easing: 'swing',
  iteration: 1,
  isRunning: false,
  css: true,

  setOptions: function(options) {
    this.setProperties(options);
    return this;
  },

  getOptions: function() {
    return this.getProperties(
      'before',
      'from',
      'to',
      'after',
      'delay',
      'duration',
      'easing',
      'iteration',
      'css'
    );
  },

  /**
   * Run animation
   */
  run: function(options) {
    if (get(this, 'isRunning')) {
      return false;
    }
    options = options || {};
    var view = options.view = options.view || get(this, 'view');
    if (!view) {
      throw fmt("View %@ not found", [view]);
    }
    this.setOptions(options);
    options = Ember.$.extend(this.getOptions(), options);
    set(this, 'isRunning', true);
    set(view, 'animation', this);
    this._queue = options.queue = fmt("fx-%@", [Ember.guidFor(view)]);
    if (!options.context) {options.context = view; }
    this.animateElement(view, options);
    return true;
  },

  /**
   * Stop animation
   */
  stop: function() {
    if (get(this, 'isRunning')) {
      get(this, 'view').$().stop(this._queue, true);
      return true;
    }
    return false;
  },

  /** @private */
  animateElement: function(view, options) {
    var element = view.$(), i, _this = this;
    // delay
    if (options.delay > 0) {
      element.delay(options.delay, options.queue);
    }
    // before
    if (options.before) {
      element.queue(options.queue, function() {
        element.css(options.before);
        Ember.$(this).dequeue();
      });
    }
    if (options.start) {
      element.queue(options.queue, function() {
        _this.callback(options, 'start');
      });
    }
    for (i = options.iteration; i > 0; i--) {
      try {
        this.runAnimationIteration(view, element, options, i);
      } catch (e) {
        this.finalizeAnimation(view, element, options, e);
        throw e;
      }
    }
    // run
    element.dequeue(options.queue);
  },

  runAnimationIteration: function(view, element, options, i) {
    element
      // from
      .animate(options.from, {
        duration: 0,
        queue: options.queue
      })
      // to
      .animate(options.to, {
        duration: options.duration,
        easing: options.easing,
        queue: options.queue,
        complete: Ember.$.proxy(function() {
          if (i === 1) {
            this.finalizeAnimation(view, element, options);
          }
        }, this)
      });
  },

  finalizeAnimation: function(view, element, options, e) {
    // after
    if (options.after) {
      element.css(options.after);
    }
    this._queue = null;
    set(this, 'isRunning', false);
    set(view, 'animation', null);
    // Call end callback
    this.callback(options, 'end', e);
  },

  callback: function(options, method, error) {
    var target = options.context;
    method = options[method];
    if (target && typeof method === 'string') { method = target[method]; }
    if (target && method) {
      method.call(target, this, error);
    }
  },

  /** @private */
  // _keyframesDidChange: function() {
  //   var keyframes = get(this, 'keyframes'),
  //       from = get(this, 'from'),
  //       to = get(this, 'to');
  //   if (keyframes && (to || from)) {
  //     throw new Ember.Error('You can not specify `keyframes` parameter and `to` or `from` parameter at the same time');
  //   } else if (!keyframes && to && from) {
  //     keyframes = {
  //       from: from,
  //       to: to
  //     };
  //   }
  //   if (keyframes) {
  //     this._createTimeline(keyframes);
  //   } else {
  //     set(this, '_timeline', null);
  //   }
  // }.observes('keyframes', 'to', 'from'),

  timeline: Ember.computed(function() {
    var keyframes = get(this, 'keyframes'),
        attrs = [],
        timeline = [],
        duration = get(this, 'duration'),
        prevMs, ms, pct, keyframe, i, l;

    for (pct in keyframes) {
      if (keyframes.hasOwnProperty(pct) && animKeyFramesRE.test(pct)) {
        keyframe = {attrs: keyframes[pct]};

        // CSS3 spec allow for from/to to be specified.
        if (pct == "from") {
          pct = 0;
        } else if (pct == "to") {
          pct = 100;
        }
        // convert % values into integers
        keyframe.pct = parseInt(pct, 10);
        attrs.push(keyframe);
      }
    }

    // Sort by pct property
    attrs = attrs.sort(sorter);

    if (typeof duration === 'string') {
      switch (duration) {
      case 'slow':
        duration = 600;
        break;
      case 'fast':
        duration = 200;
        break;
      default:
        // normal
        duration = 400;
      }
    }

    for (i = 0, l = attrs.length; i < l; i++) {
      prevMs = (attrs[i - 1]) ? duration * (attrs[i - 1].pct / 100) : 0;
      ms = duration * (attrs[i].pct / 100);
      timeline.push({
        duration: ms - prevMs,
        attrs: attrs[i].attrs
      });
    }
    return timeline;
  }).property('keyframes', 'to', 'from', 'duration').cacheable()
});

Ember.Animation.reverseDirectionMap = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

Ember.getAnimation = function(animation) {
  if (typeof animation === 'string') {
  if (!animation.match(/\./)) { animation = 'Ember.Animation.%@'.fmt(animation); }
    animation = Ember.getPath(window, animation);
  }
  if (!animation || !Ember.Animation.detect(animation)) { animation = Ember.Animation; }
  return animation.create();
};

require('ember-animations/animation');

var get = Ember.get;

Ember.Animation.Slide = Ember.Animation.extend({

  duration: 'fast',

  direction: 'left',

  out: false,

  reverse: false,

  from: function() {
    var element = get(this, 'view').$(),
        direction = get(this, 'direction'),
        out = get(this, 'out'),
        reverse = get(this, 'reverse'),
        translateX = 0,
        translateY = 0;

    if (reverse) {
      direction = Ember.Animation.reverseDirectionMap[direction];
    }
    switch (direction) {
    case 'left':
      translateX = element.width();
      break;
    case 'right':
      translateX = -element.width();
      break;
    case 'up':
      translateY = element.height();
      break;
    case 'down':
      translateY = -element.height();
      break;
    }
    return {
      translateX: (out) ? 0 : translateX,
      translateY: (out) ? 0 : translateY
    };
  }.property('view', 'direction', 'out', 'reverse'),

  to: function() {
    var element = get(this, 'view').$(),
        direction = get(this, 'direction'),
        out = get(this, 'out'),
        reverse = get(this, 'reverse'),
        translateX = 0,
        translateY = 0;

    if (reverse) {
      direction = Ember.Animation.reverseDirectionMap[direction];
    }
    switch (direction) {
    case 'left':
      translateX = -element.width();
      break;
    case 'right':
      translateX = element.width();
      break;
    case 'up':
      translateY = -element.height();
      break;
    case 'down':
      translateY = element.height();
      break;
    }
    return {
      translateX: (out) ? translateX : 0,
      translateY: (out) ? translateY : 0
    };
  }.property('view', 'direction', 'out', 'reverse')
});

Ember.Animation.SlideIn = Ember.Animation.Slide;
Ember.Animation.SlideOut = Ember.Animation.Slide.extend({out: true});

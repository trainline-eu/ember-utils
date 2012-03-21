require('ember-animations/animation');

var get = Ember.get;

Ember.Animation.Cube = Ember.Animation.extend({

  duration: 'slow',

  direction: 'left',

  easing: 'ease-in',

  out: false,

  reverse: false,

  before: {
    webkitTransformStyle: 'preserve-3d'
  }
});

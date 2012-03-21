require('ember-animations/animation');

var get = Ember.get;

Ember.Animation.Flip = Ember.Animation.extend({

  duration: 'slow',

  direction: 'left',

  easing: 'ease-in',

  out: false,

  reverse: false,

  before: {
    webkitTransformStyle: 'preserve-3d',
    webkitBackfaceVisibility: 'hidden'
  },

  from: function() {
  }.property('view', 'direction', 'out'),

  to: function() {
  }.property('view', 'direction', 'out')
});

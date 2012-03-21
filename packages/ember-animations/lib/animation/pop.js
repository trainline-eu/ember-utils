require('ember-animations/animation');

var get = Ember.get;

Ember.Animation.Pop = Ember.Animation.extend({

  out: false,

  reverse: false,

  from: function() {
    var out = get(this, 'out'), reverse = get(this, 'reverse');
    if ((out && !reverse) || (!out && reverse)) {
      return {
        opacity: 1,
        scale: 1
      };
    } else {
      return {
        opacity: 0,
        scale: 0
      };
    }
  }.property('out', 'reverse'),

  to: function() {
    var out = get(this, 'out'), reverse = get(this, 'reverse');
    if ((out && !reverse) || (!out && reverse)) {
      return {
        opacity: 0,
        scale: 0
      };
    } else {
      return {
        opacity: 1,
        scale: 1
      };
    }
  }.property('out', 'reverse')
});

Ember.Animation.PopIn = Ember.Animation.Pop;
Ember.Animation.PopOut = Ember.Animation.Pop.extend({out: true});

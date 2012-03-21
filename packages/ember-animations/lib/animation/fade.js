require('ember-animations/animation');

var get = Ember.get;

Ember.Animation.Fade = Ember.Animation.extend({

  out: false,

  reverse: false,

  from: function() {
    var out = get(this, 'out'), reverse = get(this, 'reverse');
    if ((out && !reverse) || (!out && reverse)) {
      return {opacity: 1};
    } else {
      return {opacity: 0};
    }
  }.property('out', 'reverse'),

  to: function() {
    var out = get(this, 'out'), reverse = get(this, 'reverse');
    if ((out && !reverse) || (!out && reverse)) {
      return {opacity: 0};
    } else {
      return {opacity: 1};
    }
  }.property('out', 'reverse')
});

Ember.Animation.FadeIn = Ember.Animation.Fade;
Ember.Animation.FadeOut = Ember.Animation.Fade.extend({out: true});

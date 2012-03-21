var get = Ember.get, set = Ember.set;

Ember.Animatable = Ember.Mixin.create({

  isAnimatable: true,

  animate: function(animation, options) {
    options = options || {};
    options.view = this;
    Ember.run.schedule('render', Ember.getAnimation(animation), 'run', options);
    return this;
  },

  resetAnimation: function() {
    var animation = get(this, 'animation');
    if (animation) { animation.stop(); }
    return this;
  }
});

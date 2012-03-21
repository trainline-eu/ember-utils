var get = Ember.get, set = Ember.set;

var valueProperty = Ember.computed(function(key, value) {
  if (value !== undefined) {
    // normalize invalid value
    if (typeof value !== 'number') {
      value = 0;
    }
    this._value = value;
  }
  return Math.min(get(this, 'max'), Math.max(get(this, 'min'), this._value));
}).property('max', 'min').cacheable();

/**
  @extends Ember.View
*/
Ember.Progress = Ember.View.extend({
  classNames: ['ember-progress'],

  attributeBindings: ['max', 'value', 'position'],

  tagName: 'progress',

  /**
    The WAI-ARIA role of the progressbar.

    @type String
    @default 'button'
    @readOnly
  */
  ariaRole: 'progressbar',

  /**
    @property {Number}
  */
  value: 0,

  /**
    @property {Number}
  */
  min: 0,

  /**
    @property {Number}
  */
  max: 100,

  /**
    @property {Number}
  */
  position: 0,

  /**
    @property {Number}
  */
  isComplete: false,

  didInsertElement: function() {
    this.propertyDidChange('value');
  },

  /** @private */
  defaultTemplate: Ember.Handlebars.compile('<div></div>'),

  init: function() {
    this._super();
    this._value = get(this, 'value');
    Ember.defineProperty(this, 'value', valueProperty);
  },

  willChangeValue: Ember.observer(function() {
    var value = get(this, 'value'),
        max = get(this, 'max'),
        position = 100 * value / max;
    set(this, 'isComplete', value === max);
    set(this, 'position', position);

    this.$('> div:first-child')
      .toggle(value > get(this, 'min'))
      .width(position.toFixed(0) + "%");

    this.change(value);
  }, 'value'),

  change: Ember.K
});


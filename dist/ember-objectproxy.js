
(function(exports) {
var get = Ember.get, set = Ember.set, addObserver = Ember.addObserver, removeObserver = Ember.removeObserver;

var isEnumerable = function(content) {
  return  get(content, 'isEnumerable') === true || Ember.isArray(content);
};

var getPath = function(content, key) {
  var value;
  if (content && isEnumerable(content)) {
    value = content.getEach(key);
    if (get(value, 'length') === 0) {
      value = undefined; // empty array.
    } else if (value.uniq().get('length') === 1) {
      value = get(value, 'firstObject');
    }
  } else {
    value = get(content, key);
  }
  return value;
};

var setPath = function(content, key, value) {
  if (content && isEnumerable(content)) {
    content.setEach(key, value);
  } else {
    set(content, key, value);
  }
};

Ember.ObjectProxy = Ember.Object.extend({
  content: null,
  allowsMultipleContent: false,

  observableContent: Ember.computed(function() {
    var content = get(this, 'content'), len, allowsMultiple;

    // if enumerable, extract the first item or possibly become null
    if (content && isEnumerable(content)) {
      len = get(content, 'length');
      allowsMultiple = get(this, 'allowsMultipleContent');

      if (len === 1) {
        content = get(content, 'firstObject');
      } else if (len === 0 || !allowsMultiple) {
        content = null;
      }

      // if we got some new content, it better not be enum also...
      if (content && !allowsMultiple && isEnumerable(content)) { content = null; }
    }

    return content;
  }).property('content', 'content.@each', 'allowsMultipleContent').cacheable(),

  init: function() {
    this._super();
    this.contentDidChange();
  },

  destroy: function() {
    var content = this.get('content');
    if (content && typeof content.destroy === 'function') {
      content.destroy();
    }
  },

  unknownProperty: function(key) {
    var content = get(this, 'observableContent');

    return content ? getPath(content, key) : undefined;
  },

  setUnknownProperty: function(key, value) {
    var content = get(this, 'observableContent');

    if (content) { setPath(content, key, value); }

    return this;
  },

  contentWillChange: Ember.beforeObserver(function(context, key) {
    if (key !== 'observableContent') { return; }

    var content = get(this, 'observableContent'), observing = this._observedProperties, i, l;

    if (content) {
      for (i = 0, l = observing.length; i < l; i++) {
        removeObserver(content, observing[i], this.contentPropertyDidChange);
      }
    }
  }, 'observableContent'),

  contentDidChange: Ember.observer(function(context, key) {
    if (key !== 'observableContent') { return; }

    var content = get(this, 'observableContent'), observing = this._observedProperties, i, l;

    if (content && this._oldContent !== content) {
      for (i = 0, l = observing.length; i < l; i++) {
        addObserver(content, observing[i], this, this.contentPropertyDidChange);
        this.contentPropertyDidChange(content, observing[i]);
      }
      this._oldContent = content;
    }
  }, 'observableContent'),

  didAddListener: function(eventName, target, method) {
    var content = get(this, 'observableContent'), observing = this._observedProperties,
      property = eventName.split(':').shift();

    if (!observing.contains(property)) {
      if (content) {
        addObserver(content, property, this, this.contentPropertyDidChange);
      }
      observing.push(property);
    }
  },

  contentPropertyDidChange: function(content, property) {
    this.propertyDidChange(property);
  },

  _oldContent: null,

  _observedProperties: Ember.A()
});

})({});


(function(exports) {
})({});

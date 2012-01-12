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

    this.observesProperty(key);

    return content ? getPath(content, key) : undefined;
  },

  setUnknownProperty: function(key, value) {
    var content = get(this, 'observableContent');

    this.observesProperty(key);

    if (content) { setPath(content, key, value); }

    return this;
  },

  contentWillChange: Ember.beforeObserver(function(context, key) {
    if (key !== 'observableContent') { return; }

    var content = get(this, 'observableContent'), i, l;

    if (content) {
      this.forEachObservedProperty(function(property) {
        removeObserver(content, property, this.contentPropertyDidChange);
      }, this);
    }
  }, 'observableContent'),

  contentDidChange: Ember.observer(function(context, key) {
    if (key !== 'observableContent') { return; }

    var content = get(this, 'observableContent'), i, l;

    if (content && this._lastContent !== content) {
      this.forEachObservedProperty(function(property) {
        addObserver(content, property, this, this.contentPropertyDidChange);
        this.contentPropertyDidChange(content, property);
      }, this);
      this._lastContent = content;
    }
  }, 'observableContent'),

  didAddListener: function(eventName, target, method) {
    var content = get(this, 'observableContent'),
      property = eventName.split(':').shift();

    if (!this.observesProperty(property) && content) {
      addObserver(content, property, this, this.contentPropertyDidChange);
    }
  },

  contentPropertyDidChange: function(content, property) {
    this.propertyDidChange(property);
  },

  _lastContent: null,

  observedProperties: Ember.computed(function() {
    return new Ember.Set();
  }).property().cacheable(),

  forEachObservedProperty: function(callback, target) {
    get(this, 'observedProperties').forEach(callback, target);
  },

  observesProperty: function(property) {
    var observed = get(this, 'observedProperties');
    if (observed.contains(property)) {
      return true;
    } else {
      observed.add(property);
    }
    return false;
  }
});

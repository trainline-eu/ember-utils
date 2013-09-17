var get = Ember.get, map = Ember.ArrayPolyfills.map;

function toArray(arr) {
  map.call(arr, function(a) { return a; });
}

var EnumerableExt = Ember.Mixin.create({

  /**
  */
  isEqual: function(ary) {
    if (!ary) { return false ; }
    if (ary === this) { return true; }

    var loc = get(ary, 'length');
    if (loc !== get(this, 'length')) { return false; }

    while (--loc >= 0) {
      if (!Ember.isEqual(ary.objectAt(loc), this.objectAt(loc))) { return false; }
    }
    return true;
  },

  /**
  */
  max: function() {
    return Math.max.apply(Math, this);
  },

  /**
  */
  min: function() {
    return Math.min.apply(Math, this);
  },

  /**
  */
  sum: function() {
    return this.reduce(function(sum, x) { return sum+x; }, 0);
  },

  /**
  */
  flatten: function() {
    return this.reduce(function(a, b) {
      a = (a && Ember.isArray(a)) ? toArray(a) : a;
      b = (b && Ember.isArray(b)) ? toArray(b) : b;
      return a.concat(b);
    }, []);
  },

  uniqCompare: function() {
    var ret = [];
    this.forEach(function(a) {
      var found = ret.find(function(b) {
        return Ember.compare(a, b) === 0;
      });
      if (!found) { ret.push(a); }
    }, this);
    return ret;
  },

  /**
  */
  sortBy: function(key) {
    var keys = (typeof key === 'string') ? arguments : key,
        len  = keys.length,
        src;

    // get the src array to sort
    if (this instanceof Array) {
      src = this;
    } else {
      src = [];
      this.forEach(function(i) { src.push(i); });
    }

    if (!src) return [];
    return src.sort(function(a,b) {
      var idx, key, aValue, bValue, ret = 0;

      for(idx=0; ret===0 && idx<len; idx++) {
        key = keys[idx];
        aValue = a ? Ember.get(a, key) : null;
        bValue = b ? Ember.get(b, key) : null;
        ret = Ember.compare(aValue, bValue);
      }
      return ret;
    });
  },

  /**
    Converts an enumerable into a matrix, with inner arrays grouped based
    on a particular property of the elements of the enumerable.

    @param {String} key the property to test
    @returns {Array} matrix of arrays
  */
  groupBy: function(key){
    var len = get(this, 'length'),
        ret = [],
        grouped = [],
        keyValues = [],
        idx, next, cur;

    this.forEach(function(next) {
      cur = next ? get(next, key) : null;
      if (Ember.isNone(grouped[cur])) {
        grouped[cur] = []; keyValues.push(cur);
      }
      grouped[cur].push(next);
    });

    for (idx=0,len=keyValues.length; idx < len; idx++){
      ret.push(grouped[keyValues[idx]]);
    }
    return ret;
  },

  /**
    Finds and returns the highest value of a given property in an enumerable.
    Ex: [{age: 7}, {age: 77}].maxProperty('age'); // = 77

    @param {String} key
      The property for which we want the largest value.

    @param {Number} start
      Optional minimum value. It's the value that will be returned if no higher value is found.

    @returns {Number}
      The highest value for the given property.
  */
  maxProperty: function(key, start) {
    var value;
    start = start || -Infinity;
    return this.reduce(function(previousValue, item, index, enumerable) {
      value = get(item, key);
      return (value > previousValue) ? value : previousValue;
    }, start);
  },

  /**
    Finds and returns the lowest value of a given property in an enumerable.
    Ex: [{age: 7}, {age: 77}].minProperty('age'); // = 7

    @param {String} key
      The property for which we want the lowest value.

    @param {Number} start
      Optional minimum value. It's the value that will be returned if no lower value is found.

    @returns {Number}
      The lowest value for the given property.
  */
  minProperty: function(key, start) {
    var value;
    start = start || +Infinity;
    return this.reduce(function(previousValue, item, index, enumerable) {
      value = get(item, key);
      return (value < previousValue) ? value : previousValue;
    }, start);
  },

  /**
    Computes the sum of a given property in an enumerable.
    Ex: [{age: 7}, {age: 77}].sumProperty('age'); // = 84

    @param {String} key
      The property we want the sum of.

    @returns {Number}
      The sum of the given property.
  */
  sumProperty: function(key) {
    var value;
    return this.reduce(function(previousValue, item, index, enumerable) {
      value = get(item, key);
      return value + previousValue;
    }, 0);
  }
});

Ember.Enumerable.reopen(EnumerableExt);

if (Ember.EXTEND_PROTOTYPES) {
  EnumerableExt.apply(Array.prototype);
}

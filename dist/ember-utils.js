
(function(exports) {

Ember.Enumerable.reopen({

  flatten: function() {
    return this.reduce(function(array, value) {
      if (Ember.typeOf(value) === 'array') {
        return array.concat(value.flatten());
      } else if (Ember.isArray(value) && value.toArray) {
        return array.concat(value.toArray().flatten());
      } else {
        array.push(value);
        return array;
      }
    }, Ember.A());
  },

  /**
    Returns an array sorted by the value of the passed key parameters.
    null objects will be sorted first.  You can pass either an array of keys
    or multiple parameters which will act as key names

    @param {String} key one or more key names
    @returns {Array}
  */
  sortProperty: function(key) {
    var keys = (typeof key === 'string') ? arguments : key,
        len  = keys.length,
        src;

    // get the src array to sort
    if (this instanceof Array) src = this;
    else {
      src = [];
      this.forEach(function(i) { src.push(i); });
    }

    if (!src) return [];
    return src.sort(function(a,b) {
      var idx, key, aValue, bValue, ret = 0;

      for(idx=0; ret===0 && idx<len; idx++) {
        key = keys[idx];
        aValue = a ? Em.get(a, key) : null;
        bValue = b ? Em.get(b, key) : null;
        ret = Ember.compare(aValue, bValue);
      }
      return ret;
    });
  }
});

})({});


(function(exports) {
})({});


var flatten = function() {
  return this.reduce(function(array, value) {
    if (value && value.isEnumerable) {
      return array.concat(flatten.apply(value));
    } else {
      array.push(value);
      return array;
    }
  }, []);
};

var EnumerableExt = Ember.Mixin.create({

  flatten: flatten,

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

Ember.Enumerable.reopen(EnumerableExt);

if (Ember.EXTEND_PROTOTYPES) {
  EnumerableExt.apply(Array.prototype);
}

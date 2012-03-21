
var getPath = Ember.getPath, isGlobalPath = Ember.isGlobalPath;

Ember.Binding.equal = function(pathA, pathB) {
  var C = this, binding = new C(null, pathA).oneWay();
  binding._operand = pathB;
  binding._operation = function(obj, left, right) {
    return getPath(isGlobalPath(left) ? window : obj, left) === getPath(isGlobalPath(right) ? window : obj, right);
  };
  return binding;
};

Ember.Binding.match = function(path, match) {
  return this.oneWay(path).transform(function(value) {
    return value ? !!value.match(match) : false;
  });
};

Ember.Binding.contains = function(path, obj) {
  return this.oneWay(path).transform(function(value) {
    return value ? !!value.contains(obj) : false;
  });
};

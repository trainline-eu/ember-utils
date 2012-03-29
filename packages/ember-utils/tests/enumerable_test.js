var array;

module("EnumerableExt", {
  setup: function() {
    array = Ember.A([{age: 7}, {age: 17}, {age: 77}]);
  }
});

test("maxProperty should return the highest value of the property in the enumerable", function() {
  var max = array.maxProperty('age');
  equal(max, 77);
});

test("maxProperty should return the start value if no higher value of the property in the enumerable is found", function() {
  var max = array.maxProperty('age', 100);
  equal(max, 100);
});

test("minProperty should return the highest value of the property in the enumerable", function() {
  var min = array.minProperty('age');
  equal(min, 7);
});

test("minProperty should return the start value if no higher value of the property in the enumerable is found", function() {
  var min = array.minProperty('age', 1);
  equal(min, 1);
});


test("sumProperty should return the sum of the properties in the enumerable", function() {
  var sum = array.sumProperty('age');
  equal(sum, 101);
});
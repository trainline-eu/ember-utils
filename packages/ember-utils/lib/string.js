Ember.String.titleize = function(str) {
  var arr = (str || '').split(' '), word, i, l;
  for (i=0, l = arr.length; i < l; i++) {
    word = arr[i].split('');
    if (typeof word[0] !== 'undefined') { word[0] = word[0].toUpperCase(); }
    if (i+1 === l) {
      arr[i] = word.join('');
    } else {
      arr[i] = word.join('') + ' ';
    }
  }
  return arr.join('');
};

var titleize = Ember.String.titleize,
    camelize = Ember.String.camelize;

Ember.String.classify = function(str) {
  return titleize(camelize(str));
};

var classify = Ember.String.classify;

// Extend String prototype
if (Ember.EXTEND_PROTOTYPES) {
  String.prototype.titleize = function() {
    return titleize(this);
  };

  String.prototype.classify = function() {
    return classify(this);
  };
}

var get = Ember.get, set = Ember.set, getPath = Ember.getPath;

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

Ember.String.classify = function(str) {
  return Ember.String.titleize(Ember.String.camelize(str));
};

// Extend String prototype

String.prototype.titleize = function() {
  return Ember.String.titleize(this);
};

String.prototype.classify = function() {
  return Ember.String.classify(this);
};

var fmt = Ember.String.fmt, classify = Ember.String.classify;

Ember.Validator = Ember.Object.extend({

  errorMessage: 'Validation Error',
  attachTo: Ember.K,
  detachFrom: Ember.K,

  validateError: function(form, field) {
    var errorMessage = get(field, 'errorMessage') || get(this, 'errorMessage');
    get(field, 'errors').pushObject(errorMessage);
    return Ember.Validator.ERROR;
  },

  validate: function(form, field) { return true; },

  validateChange: function(form, field, oldValue) {
    return this.validate(form, field) ? Ember.Validator.OK : this.validateError(form, field);
  },

  validateSubmit: function(form, field) {
    return this.validate(form, field) ? Ember.Validator.OK : this.validateError(form, field);
  },

  validatePartial: function(form, field) {
    if (!get(field, 'isValid')) {
      return this.validate(form, field) ? Ember.Validator.OK : this.validateError(form, field);
    } else {
      return Ember.Validator.NO_CHANGE;
    }
  },

  validateKeyDown: function(form, field, charStr) { return true; }
});

Ember.Validator.reopenClass({

  OK: 0,

  NO_CHANGE: 1,

  ERROR: 2,

  findFor: function(form, field, validatorKey) {
    if (!validatorKey) { return; }

    if (typeof validatorKey  === 'string') {
      if (!validatorKey.match(/\./)) {
        validatorKey = "Ember.Validator.%@".fmt(classify(validatorKey));
      }
      validatorKey = getPath(window, validatorKey);
    }

    if (Ember.Validator.detectInstance(validatorKey)) {
      validatorKey = validatorKey;
    } else if (Ember.Validator.detect(validatorKey)) {
      validatorKey = validatorKey.create();
    } else {
      validatorKey = undefined;
    }

    return validatorKey;
  }

});

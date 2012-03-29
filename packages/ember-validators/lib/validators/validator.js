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

  errorMessage: 'Validation Error : (%@)',
  attachTo: Ember.K,
  detachFrom: Ember.K,

  name: Ember.computed(function() {
    var parts = this.toString().split(':').shift().split("."),
        name = parts[parts.length - 1];

    return name.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1);
  }).property(),

  validateError: function(form, field) {
    var name = get(this, 'name'),
        errorProperty = name + 'ErrorMessage',
        errorMessage = get(field, errorProperty) || fmt(get(this, 'errorMessage'), [name]),
        errors = get(field, 'errors'),
        allowsMultipleErrors = get(field, 'allowsMultipleErrors');

    if (get(errors, 'length') === 0 || allowsMultipleErrors) {
      errors.pushObject(errorMessage);
    }
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

  findFor: function(validatorKey) {
    if (!validatorKey) { return; }

    if (typeof validatorKey  === 'string') {
      if (!validatorKey.match(/\./)) {
        validatorKey = "Ember.Validator.%@".fmt(classify(validatorKey));
      }
      validatorKey = getPath(window, validatorKey);
    }

    if (Ember.Validator.detect(validatorKey)) {
      validatorKey = validatorKey.create();
    } else if (!Ember.Validator.detectInstance(validatorKey)) {
      validatorKey = undefined;
    }

    return validatorKey;
  }

});

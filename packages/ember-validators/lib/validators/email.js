require('ember-validators/validators/pattern');

var get = Ember.get;

Ember.Validator.Email = Ember.Validator.Pattern.extend({

  toString: function() {
    return 'Ember.Validator.Email';
  },

  validatePattern: /^([a-zA-Z0-9_\.-]+)@([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})$/

});

Ember.Validator.EmailOrEmpty = Ember.Validator.Email.extend({

  toString: function() {
    return 'Ember.Validator.EmailOrEmpty';
  },

  validate: function(form, field) {
    return Ember.empty(get(field, 'value')) ? true : this._super(form, field);
  }

});

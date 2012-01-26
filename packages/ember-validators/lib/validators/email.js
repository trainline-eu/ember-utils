require('ember-validators/validators/pattern');

var get = Ember.get;

Ember.Validator.Email = Ember.Validator.Pattern.extend({
  errorMessage: 'Invalid Email',
  validatePattern: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
});

Ember.Validator.EmailOrEmpty = Ember.Validator.Email.extend({
  validate: function(form, field) {
    return Ember.empty(get(field, 'value')) ? true : this._super(form, field);
  }
});

require('ember-validators/validators/validator');

var get = Ember.get;

Ember.Validator.Required = Ember.Validator.extend({

  errorMessage: 'Is Required',

  validate: function(form, field) {
    return !Ember.empty(get(field, 'value'));
  }
});

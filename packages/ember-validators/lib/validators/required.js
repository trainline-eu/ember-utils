require('ember-validators/validators/validator');

var get = Ember.get;

Ember.Validator.Required = Ember.Validator.extend({
  name: 'required',
  validate: function(form, field) {
    var value = get(field, 'value');
    if (typeof value === 'string') {
      value = value.replace(/\s+/, '');
    }
    return !Ember.empty(value);
  }
});

Ember.Validator.True = Ember.Validator.extend({
  name: 'true',
  validate: function(form, field) {
    var value = get(field, 'value');
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      value = value.replace(/\s+/, '');
    }
    return !Ember.empty(value);
  }
});

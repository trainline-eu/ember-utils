require('ember-validators/validators/validator');

var get = Ember.get;

Ember.Validator.Pattern = Ember.Validator.extend({

  validatePattern: '',

  validate: function(form, field) {
    var validatePattern = get(field, 'validatePattern') || get(this, 'validatePattern');
    return (get(field, 'value') || '').match(validatePattern);
  }

});

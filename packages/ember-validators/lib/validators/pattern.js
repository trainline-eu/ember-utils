require('ember-validators/validators/validator');

var get = Ember.get;

Ember.Validator.Pattern = Ember.Validator.extend({

  toString: function() {
    return 'Ember.Validator.Pattern';
  },

  validatePattern: '',

  validate: function(form, field) {
    var validatePattern = get(field, 'validatePattern') || get(this, 'validatePattern');
    return (get(field, 'value') || '').match(validatePattern);
  }

});

require('ember-validators/validators/validator');

var get = Ember.get;

Ember.Validator.Number = Ember.Validator.extend({

  errorMessage: 'Invalid Number',

  validate: function(form, field) {
    var value = get(field, 'value');
    return (value === '') || !(isNaN(value) || isNaN(parseFloat(value)));
  },

  /**
    Allow only numbers, dashes, period, and commas
  */
  validateKeyDown: function(form, field, charStr) {
    if (!charStr) { charStr = ''; }
    var text = get(field, 'value');

    if (!text) { text = ''; }
    text += charStr;

    if (get(this, 'places') === 0) {
      if (charStr.length === 0) { return true; }
      else { return text.match(/^[\-{0,1}]?[0-9,\0]*/)[0] === text; }
    } else {
      if (charStr.length === 0) { return true; }
      else { return text.match(/^[\-{0,1}]?[0-9,\0]*\.?[0-9\0]+/) === text; }
    }
  }
});

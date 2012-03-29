require('ember-validators/validators/pattern');

Ember.Validator.Url = Ember.Validator.Pattern.extend({

  validatePattern: /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/

});

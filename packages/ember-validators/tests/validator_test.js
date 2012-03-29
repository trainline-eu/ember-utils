module("Ember.Validator");

test("Validator should have a name", function() {
  var validator = Ember.Validator.create();
  equal(validator.get('name'), 'validator');
  validator = Ember.Validator.Email.create();
  equal(validator.get('name'), 'email');
  validator = Ember.Validator.Url.create();
  equal(validator.get('name'), 'url');
    validator = Ember.Validator.Confirmation.create();
  equal(validator.get('name'), 'confirmation');
    validator = Ember.Validator.CreditCard.create();
  equal(validator.get('name'), 'credit_card');
    validator = Ember.Validator.Number.create();
  equal(validator.get('name'), 'number');
    validator = Ember.Validator.Required.create();
  equal(validator.get('name'), 'required');
    validator = Ember.Validator.Pattern.create();
  equal(validator.get('name'), 'pattern');
});

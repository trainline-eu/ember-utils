require('ember-validators/validators/validator');

var get = Ember.get, set = Ember.set;

var oldFilter = jQuery.event.keyHooks.filter;
jQuery.event.keyHooks.filter = function(evt, original) {
  evt = oldFilter(evt, original);
  if (jQuery.browser.msie && (evt.which == 8 || evt.which == 9 || (evt.which >= 37 && evt.which <= 40))) {
    evt.charString = String.fromCharCode(0);
  } else {
    evt.charString = (evt.which > 0) ? String.fromCharCode(evt.which) : null;
  }
  return evt;
};

Ember.Validatable = Ember.Mixin.create({

  didInsertElement: function() {
    this._super();

    var validators = get(this, 'validators'), form = get(this, 'form');
    if (typeof validators === 'string') { validators = [validators]; }
    validators = validators.map(function(validator) {
      return Ember.String.w(validator);
    }).flatten();
    set(this, 'validators', validators);

    validators = validators.map(function(validatorName, idx) {
      return Ember.Validator.findFor(form, this, validatorName);
    }, this).without();

    set(this, 'validatorObjects', Ember.A(validators));
  },

  concatenatedProperties: ['validators'],
  validators: [],

  validatorObjects: Ember.A(),
  errors: Ember.A(),

  isValidBinding: Ember.Binding.not('errors.length'),
  isInvalidBinding: Ember.Binding.bool('errors.length'),

  allowMultipleErrors: true,

  performValidate: function(partialChange) {
    set(this, 'errors', Ember.A());
    var form = get(this, 'form');
    if (partialChange) {
      return !get(this, 'validatorObjects').invoke('validatePartial', form, this).contains(Ember.Validator.ERROR);
    } else {
      return !get(this, 'validatorObjects').invoke('validateChange', form, this).contains(Ember.Validator.ERROR);
    }
  },

  performValidateSubmit: function() {
    set(this, 'errors', Ember.A());
    return !get(this, 'validatorObjects').invoke('validateSubmit', get(this, 'form'), this).contains(Ember.Validator.ERROR);
  },

  performValidateKeyDown: function(evt) {
    var charStr = evt.charString;
    if (!charStr) return true;

    return !get(this, 'validatorObjects').invoke('validateKeyDown', get(this, 'form'), this, charStr).contains(false);
  }
});

require('ember-validators/validators/validator');

var get = Ember.get, groups = {};
var guidFor = function(form, field) {
  return get(field, 'confirmationGroup') || Ember.guidFor(form);
};

Ember.Validator.Confirmation = Ember.Validator.extend({

  toString: function() {
    return 'Ember.Validator.Confirmation';
  },

  attachTo: function(form, field) {
    var guid = guidFor(form, field);
    groups[guid] = groups[guid] || [];
    groups[guid].push(field);
  },

  detachFrom: function(form, field) {
    var guid = guidFor(form, field);
    groups[guid] = groups[guid] || [];
    groups[guid].removeObject(field);
  },

  validate: function(form, field) {
    var guid = guidFor(form, field),
        fields = groups[guid];

    // As validate will be called by all the fields having this validator,
    // if there's an error, we only return it for the first validate call,
    // ie, the one that is called by the first input field registred
    if (fields[0] === field) {
      return fields.getEach('value').uniq().get('length') === 1;
    } else {
      return true;
    }
  }
});

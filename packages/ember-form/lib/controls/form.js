var get = Ember.get;

Ember.Form = Ember.View.extend(Ember.TargetActionSupport, {
  classNames:      ['ember-form'],
  tagName:         'form',
  propagateEvents: false,

  submit: function(evt) {
    evt.preventDefault();

    this.validateSubmit();

    Ember.run.schedule('sync', this, function() {
      if (get(this, 'isValid')) {
        this.triggerAction();
      }
    });

    return Ember.get(this, 'propagateEvents');
  },

  fields: Ember.computed(function() { return Ember.A(); }).cacheable(),

  validateSubmit: function() {
    return !get(this, 'fields').invoke('performValidateSubmit').contains(Ember.Validator.ERROR);
  },

  isValid: Ember.computed(function() {
    return get(this, 'fields').everyProperty('isValid');
  }).property('fields.@each.isValid').cacheable(),

  fieldsWithError: Ember.computed(function() {
    return get(this, 'fields').filterProperty('isInvalid');
  }).property('fields.@each.isInvalid').cacheable()
});

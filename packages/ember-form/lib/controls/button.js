require('ember-form/mixins/title_support');
require('ember-form/mixins/form_support');

Ember.Button.reopen(Ember.TitleSupport, Ember.TitleRenderSupport, Ember.FormSupport, {
  ariaRole: 'button',

  triggerAction: function() {
    this._super();
    this.submitForm();
  }
});

Ember.ResponderButton = Ember.Button.extend(Ember.ResponderSupport, {
  target: 'form',
  triggerAction: function() {
    this._super();
    this.becomeFirstResponder();
  }
});

Ember.SubmitButton = Ember.ResponderButton.extend({
  isSubmit: true
});

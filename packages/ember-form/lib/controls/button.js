require('ember-form/mixins/title_support');
require('ember-form/mixins/form_support');

Ember.Button.reopen(Ember.TitleSupport, Ember.TitleRenderSupport, Ember.FormSupport, {
  ariaRole: 'button',

  triggerAction: function() {
    this._super();
    this.submitForm();
  }
});

Ember.SubmitButton = Ember.Button.extend(Ember.ResponderSupport, {
  isSubmit: true,

  triggerAction: function() {
    this._super();
    this.becomeFirstResponder();
  }
});

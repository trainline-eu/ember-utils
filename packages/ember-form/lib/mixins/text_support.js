var get = Ember.get;

Ember.TextSupport.reopen({

  hasTextSupport: true,

  readonly: false,
  autofocus: false,

  attributeBindings: ['readonly', 'autofocus']
});

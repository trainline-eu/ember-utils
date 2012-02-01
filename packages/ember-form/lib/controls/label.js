require('ember-form/mixins/title_support');

Ember.Label = Ember.View.extend(Ember.TitleSupport, Ember.TitleRenderSupport, {
  tagName: 'label',
  classNames: ['ember-label']
});

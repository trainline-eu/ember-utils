require('ember-form/mixins/title_support');

Ember.Checkbox.reopen(Ember.TitleSupport, {
  tagName: 'label',
  defaultTemplate: Ember.Handlebars.compile('<input type="checkbox" {{bindAttr checked="value" disabled="disabled"}}/>{{{formattedTitle}}}')
});

require('ember-form/mixins/title_support');

Ember.TextField.reopen(Ember.TitleSupport, {

  autocomplete: 'on',
  autocapitalize: 'off',
  attributeBindings: ['autocomplete', 'autocapitalize', 'pattern'],

  placeholderBinding: 'formattedTitle'
});

Ember.SearchField = Ember.TextField.extend({
  classNames: ['ember-search-field'],
  tagName: 'search'
});

Ember.NumericField = Ember.TextField.extend({
  classNames: ['ember-numeric-field'],
  type: 'number',

  autocomplete: 'off',
  pattern: '[0-9]*',
  min: null,
  max: null,

  attributeBindings: ['min', 'max']
});

Ember.PasswordField = Ember.TextField.extend({
  classNames: ['ember-password-field'],
  type: 'password'
});

Ember.UrlField = Ember.TextField.extend({
  classNames: ['ember-url-field'],
  type: 'url'
});

Ember.EmailField = Ember.TextField.extend({
  classNames: ['ember-email-field'],
  type: 'email'
});

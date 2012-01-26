var get = Ember.get, escapeHTML = Ember.Handlebars.Utils.escapeExpression;

Ember.TitleSupport = Ember.Mixin.create({

  hasTitleSupport: true,
  title: null,
  localize: true,
  localizeOptions: null,
  escapeHTML: true,

  formattedTitle: Ember.computed(function() {
    var title = String(get(this, 'title'));
    if (!Ember.empty(title)) {
      if (get(this, 'localize')) {
        title = Ember.String.loc(title, get(this, 'localizeOptions') || {});
      }
      if (get(this, 'escapeHTML')) {
        title = escapeHTML(title);
      }
    }
    return title;
  }).property('title', 'escapeHTML', 'localize', 'localizeOptions').cacheable()
});

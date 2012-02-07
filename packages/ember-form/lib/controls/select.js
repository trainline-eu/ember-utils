require('ember-form/mixins/title_support');

var get = Ember.get, set = Ember.set;

Ember.Select.reopen({
  classNames: ['ember-select'],
  localize: true,
  escapeHTML: true,
  change: function() {
    var selectedIndex = (this.$()[0] && this.$()[0].selectedIndex) || 0,
        content = get(this, 'content'),
        prompt = get(this, 'prompt');

    if (!content) { return; }
    if (prompt && selectedIndex === 0) { set(this, 'selection', null); return; }

    if (prompt) { selectedIndex -= 1; }
    set(this, 'selection', content.objectAt(selectedIndex));
  }
});

Ember.SelectOption.reopen(Ember.TitleSupport, Ember.TitleRenderSupport, {
  titleBinding: 'label',
  localizeBinding: 'parentView.localize',
  escapeHTMLBinding: 'parentView.escapeHTML',
  template: null
});

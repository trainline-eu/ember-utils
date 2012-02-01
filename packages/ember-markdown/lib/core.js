require('ember-markdown/pagedown');

var converter = new Markdown.Converter();

Ember.Binding.markdown = function(from) {
  return this.oneWay(from).transform(function(value) {
    return value ? converter.makeHtml(value) : null;
  });
};

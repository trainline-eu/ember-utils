var get = Ember.get, set = Ember.set, getPath = Ember.getPath;

Ember.FilePicker = Ember.Button.extend({
  tagName: 'span',
  classNames: ['ember-filepicker'],
  classNameBindings: ['disabled'],

  /**
   * [hasSelection description]
   * @type {Boolean}
   */
  hasSelection: false,

  /**
   * [multiple description]
   * @type {Boolean}
   */
  multiple: true,

  /**
   * [disabled description]
   * @type {Boolean}
   */
  disabled: false,

  /**
   * [files description]
   * @type {Array}
   */
  files: Ember.A(),

  /**
   * [selectionSize description]
   * @type {Number}
   */
  selectionSize: 0,

  didInsertElement: function() {
    this._super();
    this.$().css({position: 'relative'}).append('<input type="file"/>').find('input:file').css({
      position: 'absolute', cursor: 'pointer', opacity: 0,
      top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%'
    })
      .attr('multiple', get(this, 'multiple'))
      .attr('disabled', get(this, 'disabled'))
      .on('change', $.proxy(this, 'didChangeFiles'));
  },
  didChangeFiles: function(evt) {
    var files = Ember.A(evt.currentTarget.files);
    set(this, 'selectionSize', 0);
    files.forEach(function(file) { this.incrementProperty('selectionSize', file.size); }, this);
    get(this, 'files').replace(0, getPath(this, 'files.length'), files);

    Ember.run.schedule('sync', this, function() {
      if (get(this, 'hasSelection')) {
        this.change();
      }
    });
  },

  /**
   * [change description]
   * @type {[type]}
   */
  change: Ember.K,

  didChangeInputProperty: Ember.observer(function(content, key) {
    if (key === 'files.length') {
      set(this, 'hasSelection', !!getPath(this, key));
    } else {
      this.$('input:file').attr(key, get(this, key));
    }
  }, 'files.length', 'multiple', 'disabled'),

  /** @private */
  defaultTemplate: Ember.Handlebars.compile('{{{formattedTitle}}}'),

  click: Ember.K
});

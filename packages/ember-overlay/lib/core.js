var get = Ember.get, set = Ember.set;

Ember.OverlayView = Ember.View.extend({
  classNames: ['ember-overlay'],
  isVisible: false,
  rootElement: 'body',

  show: function() {
    if (get(this, 'state') !== 'inDOM') {
      this.appendTo(get(this, 'rootElement'));
    }
    Ember.run.schedule('render', this, 'applyLayout');
    set(this, 'isVisible', true);
  },

  hide: function() {
    set(this, 'isVisible', false);
  },

  applyLayout: Ember.K
});

Ember.ModalView = Ember.OverlayView.extend({
  classNames: ['ember-modal'],
  opacity: 0.6,
  color: '#444',

  applyLayout: function() {
    this.$().css({
      position: 'fixed',
      zIndex: 100,
      width: '100%',
      height: '100%',
      top: '0px',
      left: '0px',
      opacity: get(this, 'opacity'),
      backgroundColor: get(this, 'color')
    });
  }
});

Ember.DialogView = Ember.OverlayView.extend({
  classNames: ['ember-dialog'],
  top: 100,
  width: 200,
  isModal: true,
  modalView: Ember.ModalView,

  init: function() {
    this._super();
    var view = get(this, 'modalView');
    if (typeof view === 'string') {
      view = Ember.getPath(window, view);
    }
    if (Ember.View.detect(view)) {
      view = view.create({
        rootElement: get(this, 'rootElement')
      });
    }
    set(this, 'modalView', view);
  },

  show: function() {
    if (get(this, 'isModal')) {
      get(this, 'modalView').show();
    }
    this._super();
  },

  hide: function() {
    this._super();
    get(this, 'modalView').hide();
  },

  modalDidChange: Ember.observer(function() {
    if (get(this, 'isModal') && get(this, 'isVisible')) {
      get(this, 'modalView').show();
    } else {
      get(this, 'modalView').hide();
    }
  }, 'isModal'),

  applyLayout: Ember.observer(function() {
    var width = get(this, 'width'),
        height = get(this, 'height');
    if (!!height) {
      this.$().height(height);
    }
    this.$().width(width).css({
      position: 'fixed',
      zIndex: 101,
      left: 50 + '%',
      marginLeft: -(width/2) + "px",
      top: get(this, 'top') + "px"
    });
  }, 'top', 'width', 'height')
});

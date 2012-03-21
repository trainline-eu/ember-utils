var get = Ember.get, set = Ember.set, getPath = Ember.getPath;

Ember.ViewState = Ember.State.extend({
  isViewState: true,
  cache: false,
  isInsertingView: false,

  showView: function() {
    var view = get(this, 'view');
    set(view, 'isVisible', true);
    this.toggleProperty('isInsertingView');
    this.becameVisible();
  },

  showOrAppendView: function(view, stateManager) {
    var root, childViews;
    if (typeof view.show === 'function') {
      view.show();
      this.becameVisible();
    } else {
      if (get(view, 'state') === 'inDOM') {
        this.showView(view);
      } else {
        this.toggleProperty('isInsertingView');

        root = stateManager.get('rootView');

        if (root) {
          childViews = get(root, 'childViews');
          childViews.pushObject(view);
        } else {
          root = stateManager.get('rootElement') || 'body';
          view.appendTo(root);
        }
        Em.run.schedule('render', this, 'showView', view);
      }
    }
  },

  hideView: function() {
    var view = get(this, 'view');
    if (typeof view.hide === 'function') {
      view.hide();
    } else {
      if (get(this, 'cache')) {
        set(view, 'isVisible', false);
      } else {
        // If the view has a parent view, then it is
        // part of a view hierarchy and should be removed
        // from its parent.
        if (get(view, 'parentView')) {
          view.removeFromParent();
        } else {
          // Otherwise, the view is a "root view" and
          // was appended directly to the DOM.
          view.remove();
        }
      }
    }
    this.becameHidden();
  },

  willBecameVisible: Ember.K,
  becameVisible: Ember.K,

  willBecameHidden: Ember.K,
  becameHidden: Ember.K,

  enter: function(stateManager) {
    if (get(this, 'isInsertingView')) { return; }

    var view = get(this, 'view'),
        templateName = get(this, 'templateName');

    if (!view && templateName) {
      view = Ember.View.extend({templateName: templateName});
    }

    if (view) {
      if (typeof view === 'string') {
        view = getPath(window, view);
        set(this, 'view', view);
      }

      if (Ember.View.detect(view)) {
        view = view.create();
        set(this, 'view', view);
      }

      ember_assert('view must be an Ember.View', view instanceof Ember.View);

      if (this.willBecameVisible()) {
        this.showOrAppendView(view, stateManager);
      }
    }
  },

  exit: function(stateManager) {
    var view = get(this, 'view');

    if (view) {
      if (this.willBecameHidden()) {
        this.hideView(view);
      }
    }
  }
});

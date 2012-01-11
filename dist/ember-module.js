
(function(exports) {
var get = Ember.get, set = Ember.set, getPath = Ember.getPath, setPath = Ember.setPath,
  slice = Array.prototype.slice, fmt = Ember.String.fmt;

var stateProperty = SC.computed(function(key) {
  var parent = get(this, 'parentState');
  if (parent) {
    return get(parent, key);
  }
}).property();

var moduleState = Em.State.extend({
  isLoaded: stateProperty,
  isDirty: stateProperty,
  isSaving: stateProperty,
  isDeleted: stateProperty,
  isError: stateProperty,
  isNew: stateProperty,
  isValid: stateProperty
});

var fetch = function(stateManager, execute) {
  $.holdReady(true);
  Ember.$.ajax(getPath(stateManager, 'module.url'), {
    dataType: 'module',
    context: stateManager,
    success: function() {
      if (execute) {
        this.goToState('ready');
      } else {
        this.goToState('loaded');
      }
    },
    error: function() { this.goToState('error'); },
    complete: function() { $.holdReady(false); }
  });
};

var states = {
  rootState: Ember.State.create({
    isReady: false,
    isLoaded: false,
    isLoading: false,
    isPrefetching: false,

    load: function(stateManager) {
      stateManager.goToState('loading');
    },

    prefetch: function(stateManager) {
      stateManager.goToState('prefetching');
    },

    prefetching: moduleState.create({
      isPrefetching: true,
      isLoading: true,
      enter: function(stateManager) {
        fetch(stateManager);
      }
    }),

    loading: moduleState.create({
      isLoading: true,
      enter: function(stateManager) {
        fetch(stateManager, true);
      }
    }),

    loaded: moduleState.create({
      isLoaded: true,
      load: function(stateManager) {
        stateManager.goToState('ready');
      },
      prefetch: Ember.K,
      ready: moduleState.create({
        isReady: true,
        enter: function() {
          var module = get(this, 'module'), source = get(module, 'source');
          if (typeof source === 'string') {
            jQuery.globalEval(source);
            setPath(this, 'module.source', null);
          }
          module.invokeCallbacks();
        }
      })
    })
  })
};

var stateManager = Ember.StateManager.extend({
  module: null,
  initialState: 'rootState',
  states: states
});

var retrieveFromCurrentState = Em.computed(function(key) {
  return get(getPath(this, 'stateManager.currentState'), key);
}).property('stateManager.currentState').cacheable();

Em.Module = Ember.Object.extend({

  isReady: retrieveFromCurrentState,
  isLoaded: retrieveFromCurrentState,
  isLoading: retrieveFromCurrentState,
  isPrefetched: retrieveFromCurrentState,

  prefetchDelay: 500,

  init: function() {
    var stateManager = stateManager.create({
      module: this
    });

    set(this, 'stateManager', stateManager);

    if (get(this, 'isPrefetching')) {
      stateManager.goToState('prefetch');
    }
  },

  /**
   * [load description]
   * @param  {[type]} target [description]
   * @param  {[type]} method [description]
   * @return {[type]}
   */
  load: function(target, method) {
    var stateManager = get(this, 'stateManager'),
        args;

    if (method === undefined && Ember.typeOf(target) === 'function') {
      method = target;
      target = null;
      args = slice.call(arguments, 1);
    } else {
      args = slice.call(arguments, 2);
    }

    this.addCallback(target, method, args);
    stateManager.send('load', stateManager);
  },

  /**
   * [prefetch description]
   * @return {[type]}
   */
  prefetch: function() {
    var stateManager = get(this, 'stateManager');
    stateManager.send('prefetch', stateManager);
  },

  addCallback: function(target, method, args) {
    this._callbacks = this._callbacks || [];
    this._callbacks.push({
      target: target,
      method: method,
      args: args
    });
  },

  invokeCallbacks: function() {
    var i, l, cb, cbs = this._callbacks;
    for (i = 0, l = cbs.length; i < l; i++) {
      cb = cbs[i];
      cb.method.apply(cb.target, cb.args);
    }
    this._callbacks = [];
  }

});

Ember.ModulesManager = Ember.Object.extend({
  init: function() {
    this._super();
    this._initializeModules();
  },

  _initializeModules: function() {
    var modules = get(this, 'modules'), module,
      prefetchedModules = [], key;
    if (modules) {
      for (key in modules) {
        module = modules[key];
        if (Ember.typeOf(module) === 'object') {
          module = Ember.Module.create({name: key, modulesManager: this}, module);
          modules[key] = module;
          if (module.isPrefetched) { module.prefetch(); }
        }
      }
    }
  },

  /**
   * [loadModule description]
   * @param  {[type]} moduleName [description]
   * @param  {[type]} target     [description]
   * @param  {[type]} method     [description]
   * @return {[type]}
   */
  loadModule: function(moduleName, target, method) {
    var module = getPath(this, 'modules.'+moduleName);
    if (module) {
      module.load.apply(module, slice.call(arguments, 1));
    } else {
      throw new Ember.Error(fmt("%@ module not found", [moduleName]));
    }
  },

  /**
   * [prefetchModule description]
   * @param  {[type]} moduleName [description]
   * @return {[type]}
   */
  prefetchModule: function(moduleName) {
    var module = getPath(this, 'modules.'+moduleName);
    if (module) {
      module.prefetch();
    } else {
      throw new Ember.Error(fmt("%@ module not found", [moduleName]));
    }
  },

  /**
    Returns true if the module is ready; false if it is not loaded or its
    dependencies have not yet loaded.

    @param {String} moduleName the name of the module to check
    @returns {Boolean}
  */
  isModuleReady: function(moduleName) {
    return !!getPath(this, 'modules.'+moduleName+'.isReady');
  }
});

Ember.$(function() {
  if (Ember.MODULES) {
    Ember.modules = Ember.ModulesManager.create({modules: Ember.MODULES});
    delete Ember.MODULES;
  }
});

})({});


(function(exports) {
var get = Ember.get, set = Ember.set, getPath = Ember.getPath,
  slice = Array.prototype.slice, fmt = Ember.String.fmt;

Ember.Module = Ember.Object.extend({
  isReady: false,
  isLoaded: false,
  isLoading: false,
  isPrefetched: false,

  prefetchDelay: 500,

  /**
   * [load description]
   * @param  {[type]} target [description]
   * @param  {[type]} method [description]
   * @return {[type]}
   */
  load: function(target, method) {
    var args = slice.call(arguments, 2), _this = this, moduleDidLoad;

    // Treat the first parameter as the callback if the target is a function and there is
    // no method supplied.
    if (method === undefined && Ember.typeOf(target) === 'function') {
      method = target;
      target = null;
    }

    moduleDidLoad = function(module) {
      if (module === _this) {
        amplify.unsubscribe('ember:modules:ready', moduleDidLoad);
        if (method) { method.apply(this, args); }
      }
    };
    amplify.subscribe('ember:modules:ready', target, moduleDidLoad);

    get(this, 'isPrefetching', false);
    if (get(this, 'isLoaded')) {
      this.execute();
      return true;
    } else {
      this.fetch();
      return false;
    }
  },

  /**
   * [fetch description]
   * @return {[type]}
   */
  fetch: function() {
    if (get(this, 'isLoading') || get(this, 'isLoaded')) return;
    set(this, 'isLoading', true);
    $.holdReady(true);
    Ember.$.ajax(get(this, 'url'), {
      dataType: 'script',
      context: this,
      success: function() {
        set(this, 'isLoaded', true);
        if (!get(this, 'isPrefetching')) { this.execute(); }
      },
      complete: function() {
        set(this, 'isLoading', false);
        get(this, 'isPrefetching', false);
        $.holdReady(false);
      }
    });
  },

  /**
   * [prefetch description]
   * @return {[type]}
   */
  prefetch: function() {
    if (get(this, 'isLoading') || get(this, 'isLoaded')) return;
    get(this, 'isPrefetching', true);
    Ember.run.later(this, 'fetch', get(this, 'prefetchDelay'));
  },

  /**
   * [execute description]
   * @return {[type]}
   */
  execute: function() {
    if (!get(this, 'isReady')) {
      var moduleSource = get(this, 'source');
      if (typeof moduleSource === 'string') {
        jQuery.globalEval(moduleSource);
        set(this, 'source', null);
      }
      set(this, 'isReady', true);
    }

    amplify.publish('ember:modules:ready', this);
  }
});

Ember.ModulesManager = Ember.Object.extend({
  init: function() {
    this._super();
    this._initializeModules();
  },

  _initializeModules: function() {
    var modules = get(this, 'modules'), module,
      prefetchedModules = [], key;
    if (modules) {
      for (key in modules) {
        module = modules[key];
        if (Ember.typeOf(module) === 'object') {
          module = Ember.Module.create({name: key, modulesManager: this}, module);
          modules[key] = module;
          if (module.isPrefetched) { module.prefetch(); }
        }
      }
    }
  },

  /**
   * [loadModule description]
   * @param  {[type]} moduleName [description]
   * @param  {[type]} target     [description]
   * @param  {[type]} method     [description]
   * @return {[type]}
   */
  loadModule: function(moduleName, target, method) {
    var module = getPath(this, 'modules.'+moduleName);
    if (module) {
      module.load.apply(module, slice.call(arguments, 1));
    } else {
      throw new Ember.Error(fmt("%@ module not found", [moduleName]));
    }
  },

  /**
   * [prefetchModule description]
   * @param  {[type]} moduleName [description]
   * @return {[type]}
   */
  prefetchModule: function(moduleName) {
    var module = getPath(this, 'modules.'+moduleName);
    if (module) {
      module.prefetch();
    } else {
      throw new Ember.Error(fmt("%@ module not found", [moduleName]));
    }
  },

  /**
    Returns true if the module is ready; false if it is not loaded or its
    dependencies have not yet loaded.

    @param {String} moduleName the name of the module to check
    @returns {Boolean}
  */
  isModuleReady: function(moduleName) {
    var module = getPath(this, 'modules.'+moduleName);
    return module ? !!module.isReady : false;
  }
});

Ember.$(function() {
  if (Ember.MODULES) {
    Ember.modules = Ember.ModulesManager.create({modules: Ember.MODULES});
    delete Ember.MODULES;
  }
});

})({});


(function(exports) {
})({});

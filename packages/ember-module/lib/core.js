var get = Ember.get, set = Ember.set, getPath = Ember.getPath, setPath = Ember.setPath,
  slice = Array.prototype.slice, fmt = Ember.String.fmt;

Ember.$.ajaxSetup({
  converters: {
    '* module': true
  }
});

Ember.$.ajaxPrefilter("module", function(options, originalOptions, xhr) {
  if (!options.crossDomain) {
    xhr.deferred = true;
    return 'text';
  } else {
    return 'script';
  }
});

var stateProperty = Ember.computed(function(key) {
  var parent = get(this, 'parentState');
  if (parent) {
    return get(parent, key);
  }
}).property();

var moduleState = Ember.State.extend({
  isPrefetching: stateProperty,
  isLoading: stateProperty,
  isLoaded: stateProperty,
  isReady: stateProperty,
  isError: stateProperty
});

var fetch = function(stateManager, execute) {
  $.holdReady(true);
  var module = get(stateManager, 'module');
  Ember.$.ajax(get(module, 'url'), {
    dataType: 'module',
    success: function(data, textStatus, xhr) {
      console.log(xhr.deferred, execute);
      if (xhr.deferred) {
        set(module, 'source', data);
      }
      if (execute) {
        stateManager.goToState('loaded.ready');
      } else {
        stateManager.goToState('loaded');
      }
    },
    error: function() { stateManager.goToState('error'); },
    complete: function() { $.holdReady(false); }
  });
};

var states = {
  rootState: Ember.State.create({
    isPrefetching: false,
    isLoading: false,
    isLoaded: false,
    isReady: false,
    isError: false,

    load: function(stateManager) {
      stateManager.goToState('loading');
    },

    prefetch: function(stateManager) {
      stateManager.goToState('prefetching');
    },

    prefetching: moduleState.create({
      isPrefetching: true,
      isLoading: true,
      load: Ember.K,
      enter: function(stateManager) {
        fetch(stateManager);
      }
    }),

    loading: moduleState.create({
      isLoading: true,
      prefetch: Ember.K,
      enter: function(stateManager) {
        fetch(stateManager, true);
      }
    }),

    loaded: moduleState.create({
      isLoaded: true,
      load: function(stateManager) {
        stateManager.goToState('loaded.ready');
      },
      prefetch: Ember.K,
      ready: moduleState.create({
        isReady: true,
        enter: function(stateManager) {
          var module = get(stateManager, 'module'), source = get(module, 'source');
          if (typeof source === 'string') {
            jQuery.globalEval(source);
            setPath(stateManager, 'module.source', null);
          }
          module.invokeCallbacks();
        }
      })
    }),

    error: moduleState.create({
      isError: true
    })
  })
};

var moduleStateManager = Ember.StateManager.extend({
  module: null,
  initialState: 'rootState',
  states: states
});

var retrieveFromCurrentState = Ember.computed(function(key) {
  return get(getPath(this, 'stateManager.currentState'), key);
}).property('stateManager.currentState').cacheable();

Ember.Module = Ember.Object.extend({

  isPrefetching: retrieveFromCurrentState,
  isLoading: retrieveFromCurrentState,
  isLoaded: retrieveFromCurrentState,
  isReady: retrieveFromCurrentState,
  isError: retrieveFromCurrentState,

  isPrefetched: false,
  prefetchDelay: 500,

  init: function() {
    this._super();
    var stateManager = moduleStateManager.create({
      module: this
    });

    set(this, 'stateManager', stateManager);

    if (get(this, 'isPrefetched')) {
      Ember.run.later(this, 'prefetch', get(this, 'prefetchDelay'));
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

    if (method) { this.addCallback(target, method, args); }
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
  },

  _callbacks: []
});

Ember.ModulesManager = Ember.Object.extend({
  init: function() {
    this._super();

    var modules = get(this, 'modules'), key;
    if (modules) {
      for (key in modules) {
        this.createModule(key, modules[key]);
      }
    }
  },

  /**
   * [createModule description]
   * @param  {[type]} moduleName [description]
   * @param  {[type]} module     [description]
   * @return {[type]}
   */
  createModule: function(moduleName, module) {
    if (typeof moduleName === 'string' && module && typeof module.url === 'string') {
      module = Ember.Module.create({name: moduleName, modulesManager: this}, module);
      setPath(this, 'modules.%@'.fmt(moduleName), module);
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
  Ember.modules = Ember.ModulesManager.create({modules: Ember.MODULES || {}});
  delete Ember.MODULES;
});

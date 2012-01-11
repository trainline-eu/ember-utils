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

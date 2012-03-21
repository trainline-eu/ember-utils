var get = Ember.get, getPath = Ember.getPath, fmt = Ember.String.fmt;
var routeRe = /^\/|#/, cleanPath = function(route) {
  return route.replace(routeRe, '');
}, _isSetup = false;

Ember.RouteSupport = Ember.Mixin.create({
  route: null,

  init: function() {
    this._super();

    var route = get(this, 'route');

    if (typeof route === 'string') {
      Ember.run.schedule('sync', this, function() {
        Ember.history.draw(route, get(this, 'path'));
      });
    }
  },

  enter: function(stateManager) {
    this._super(stateManager);
    var route = get(this, 'route');
    if (typeof route === 'string' && route !== Ember.history.get('path')) {
      Ember.history.setLocation(route);
    }
  }
});

Ember.history = Ember.Object.create({
  stateManager: null,
  defaultState: null,
  map: {},

  willChangeLocation: Ember.K,
  didChangeLocation: Ember.K,

  draw: function(route, state) {
    if (typeof route === 'string' && state) {
      this.map[route] = state.replace(/^\./, '');
    } else {
      Ember.$.extend(this.map, route);
    }
    this._setup();
  },

  pathFor: function(state) {
  },

  urlFor: function(state) {
    var path = this.pathFor(state);
  },

  stateFor: function(url) {
    var route, state;
    if (typeof url === 'string' && url.match(routeRe)) {
      route = cleanPath(url);
    } else {
      route = cleanPath((new URI(url)).path());
    }
    state = this.map[route];
    return state ? state : get(this, 'defaultState');
  },

  setLocation: function(url, title, replace) {
    var path = cleanPath(url);
    if (replace === undefined) {
      replace = !(!!History.getState().data.state);
    }
    if (title === undefined) { title = null; }
    if (this.willChangeLocation(path)) {
      this._pushState({state: this.stateFor(path)}, title, path, replace);
      this.didChangeLocation(path);
    }
  },

  goToStateFor: function(path) {
    get(this, 'stateManager').goToState(this.stateFor(path));
  },

  uri: function() {
    return new URI(History.getState().url);
  }.property(),

  path: function() {
    return cleanPath(get(this, 'uri').path());
  }.property('uri'),

  params: function() {
    return get(this, 'uri').search(true);
  }.property('uri'),

  state: function() {
    return this.stateFor(get(this, 'path'));
  }.property('uri'),

  location: function(key, value) {
    if (value !== undefined) {
      this.setLocation(value);
    } else {
      return this.get('path');
    }
  }.property('uri'),

  _pushState: function(data, title, url, replace) {
    url = fmt('/%@', [url]);
    if (replace) {
      History.replaceState(data, null, url);
    } else {
      History.pushState(data, null, url);
    }
  },

  _setup: function() {
    if (_isSetup) { return; }
    _isSetup = true;
    var _this = this;
    Ember.$(function() {
      var stateManager = get(_this, 'stateManager');
      History.Adapter.bind(window, 'statechange', function() {
        var history = History.getState(), state = history.data.state;
        if (!state) {
          state = _this.stateFor(history.url);
        }
        if (state) {
          stateManager.goToState(state);
        } else {
          throw fmt("[%@] unknown route", [history.url]);
        }
      });
      Ember.run.schedule('sync', _this, function() {
        this.setLocation(get(this, 'path'));
      });
    });
  }
});

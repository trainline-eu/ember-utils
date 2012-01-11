/**
  @class

  Route is a class used internally by Ember.RoutesManager. The routes defined by your
  application are stored in a tree structure, and this is the class for the
  nodes.
*/
Ember.Route = Ember.Object.extend({

  target: null,

  method: null,

  staticRoutes: null,

  dynamicRoutes: null,

  wildcardRoutes: null,

  add: function(parts, target, method) {
    var part, nextRoute;

    // clone the parts array because we are going to alter it
    parts = Ember.copy(parts);

    if (!parts || parts.length === 0) {
      this.target = target;
      this.method = method;

    } else {
      part = parts.shift();

      // there are 3 types of routes
      switch (part.slice(0, 1)) {

      // 1. dynamic routes
      case ':':
        part = part.slice(1, part.length);
        if (!this.dynamicRoutes) this.dynamicRoutes = {};
        if (!this.dynamicRoutes[part]) this.dynamicRoutes[part] = Ember.Route.create();
        nextRoute = this.dynamicRoutes[part];
        break;

      // 2. wildcard routes
      case '*':
        part = part.slice(1, part.length);
        if (!this.wildcardRoutes) this.wildcardRoutes = {};
        nextRoute = this.wildcardRoutes[part] = Ember.Route.create();
        break;

      // 3. static routes
      default:
        if (!this.staticRoutes) this.staticRoutes = {};
        if (!this.staticRoutes[part]) this.staticRoutes[part] = Ember.Route.create();
        nextRoute = this.staticRoutes[part];
      }

      // recursively add the rest of the route
      if (nextRoute) nextRoute.add(parts, target, method);
    }
  },

  routeForParts: function(parts, params) {
    var part, key, route;

    // clone the parts array because we are going to alter it
    parts = Ember.copy(parts);

    // if parts is empty, we are done
    if (!parts || parts.length === 0) {
      return this.method ? this : null;

    } else {
      part = parts.shift();

      // try to match a static route
      if (this.staticRoutes && this.staticRoutes[part]) {
        route = this.staticRoutes[part].routeForParts(parts, params);
        if (route) {
          return route;
        }
      }

      // else, try to match a dynamic route
      for (key in this.dynamicRoutes) {
        route = this.dynamicRoutes[key].routeForParts(parts, params);
        if (route) {
          params[key] = part;
          return route;
        }
      }

      // else, try to match a wilcard route
      for (key in this.wildcardRoutes) {
        parts.unshift(part);
        params[key] = parts.join('/');
        return this.wildcardRoutes[key].routeForParts(null, params);
      }

      // if nothing was found, it means that there is no match
      return null;
    }
  }

});


var slice = Array.prototype.slice;

Ember.AmplifyDataRequest = Ember.Object.extend({

  /**
   * [request description]
   * @param  {String} resourceId [description]
   * @param  {Object} data       [description]
   * @param  {Object} target     [description]
   * @param  {Function} method     [description]
   * @param  {Array} args       [description]
   * @return {amplify.request}
   */
  request: function(resourceId, data, target, method, args) {
    return amplify.request({
      resourceId: resourceId,
      data: data,
      success: this._responseSuccess(target, method, args),
      error: this._responseError(target, method, args)
    });
  },

  /**
   * [args description]
   * @param  {[type]} args   [description]
   * @param  {[type]} ignore [description]
   * @return {[type]}
   */
  args: function(args, ignore) {
    ignore = ignore || 2;
    return slice.call(args, ignore);
  },

  /** @private */
  _responseCallback: function(target, method) {
    if (method === undefined) {
      method = target;
      target = undefined;
    }

    if (typeof method === 'string') {
      method = target[method];
    }
    return [target, method];
  },

  /** @private */
  _responseSuccess: function(target, method, args) {
    var callback = this._responseCallback(target, method);
    target = callback[0];
    method = callback[1];

    return function(data, status) {
      var response = {
        status: status,
        isError: false,
        data: data
      };
      args = args ? [response].concat(args) : [response];
      method.apply(target, args);
    };
  },

  /** @private */
  _responseError: function(target, method, args) {
    var callback = this._responseCallback(target, method);
    target = callback[0];
    method = callback[1];

    return function(data, status) {
      var response = {
        status: status,
        isError: true,
        message: data
      };
      args = args ? [response].concat(args) : [response];
      method.apply(target, args);
    };
  }
});

var win = $(window), lastOrientation;
var get = Ember.get;

Ember.orientation = Ember.Object.create({
  init: function () {
    this._super();

    win.bind("orientationchange.ember resize.ember", $.proxy(this, 'orientationDidChange'));
    win.trigger("orientationchange.ember");
  },

  isPortrait: Ember.computed(function() {
    return get(this, 'direction') === 'portrait';
  }).property('direction').cacheable(),

  isLandscape: Ember.computed(function() {
    return get(this, 'direction') === 'landscape';
  }).property('direction').cacheable(),

  direction: Ember.computed(function() {
    if ($.support.orientation) {
      return (window.orientation === 0 || window.orientation === 180) ? "portrait" : "landscape";
    } else {
      return getOrientation();
    }
  }).property().cacheable(),

  /** @private */
  orientationDidChange: function(evt) {
    this.notifyPropertyChange('direction');
  }
});

$.support.orientation = (("orientation" in window) && ("orientationchange" in window));

$.event.special.orientationchange = {
  setup: function() {
    // If the event is supported natively, return false so that jQuery
    // will bind to the event using DOM methods.
    if ($.support.orientation) { return false; }

    // Get the current orientation to avoid initial double-triggering.
    lastOrientation = getOrientation();

    // Because the orientationchange event doesn't exist, simulate the
    // event by testing window dimensions on resize.
    win.bind("resize", handler);
  },
  teardown: function() {
    // If the event is not supported natively, return false so that
    // jQuery will unbind the event using DOM methods.
    if ($.support.orientation) { return false; }

    // Because the orientationchange event doesn't exist, unbind the
    // resize event handler.
    win.unbind("resize", handler);
  },
  add: function(handleObj) {
    // Save a reference to the bound event handler.
    var oldHandler = handleObj.handler;

    handleObj.handler = function(event) {
      // Modify event object, adding the .orientation property.
      event.orientation = getOrientation();

      // Call the originally-bound event handler and return its result.
      return oldHandler.apply(this, arguments);
    };
  }
};

// If the event is not supported natively, this handler will be bound to
// the window resize event to simulate the orientationchange event.
function handler() {
  // Get the current orientation.
  var orientation = getOrientation();

  if (orientation !== lastOrientation) {
    // The orientation has changed, so trigger the orientationchange event.
    lastOrientation = orientation;
    win.trigger("orientationchange");
  }
}

// Get the current page orientation.
function getOrientation() {
  var elem = document.documentElement;
  return elem && elem.clientWidth / elem.clientHeight < 1.1 ? "portrait" : "landscape";
}

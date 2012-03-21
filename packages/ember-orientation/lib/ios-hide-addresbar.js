/*
  * Normalized hide address bar for iOS & Android
  * (c) Scott Jehl, scottjehl.com
  * MIT License
*/

// If we split this up into two functions we can reuse
// this function if we aren't doing full page reloads.

// If we cache this we don't need to re-calibrate everytime we call
// the hide url bar
var BODY_SCROLL_TOP = false;

// So we don't redefine this function everytime we
// we call hideUrlBar
var getScrollTop = function(){
  var win = window,
      doc = document;

  return win.pageYOffset || doc.compatMode === "CSS1Compat" && doc.documentElement.scrollTop || doc.body.scrollTop || 0;
};

// It should be up to the mobile
Ember.hideUrlBar = function(){
    var win = window;

    // if there is a hash, or MBP.BODY_SCROLL_TOP hasn't been set yet, wait till that happens
    if( !location.hash && BODY_SCROLL_TOP !== false){
        win.scrollTo( 0, BODY_SCROLL_TOP === 1 ? 0 : 1 );
    }
};

Ember.hideUrlBarOnLoad = function () {
  var win = window,
      doc = win.document,
      bodycheck;

  // If there's a hash, or addEventListener is undefined, stop here
  if( !location.hash && win.addEventListener ) {

    //scroll to 1
    window.scrollTo( 0, 1 );
    BODY_SCROLL_TOP = 1;

    //reset to 0 on bodyready, if needed
    bodycheck = setInterval(function() {
      if( doc.body ) {
        clearInterval( bodycheck );
        BODY_SCROLL_TOP = getScrollTop();
        Ember.hideUrlBar();
      }
    }, 15 );

    win.addEventListener( "load", function() {
      setTimeout(function() {
        //at load, if user hasn't scrolled more than 20 or so...
        if( getScrollTop() < 20 ) {
          //reset to hide addr bar at onload
          Ember.hideUrlBar();
        }
      }, 0);
    } );
  }
};

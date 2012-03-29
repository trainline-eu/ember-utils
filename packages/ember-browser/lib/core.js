
/**
  The list of browsers that are automatically identified.

  @static
  @constant
*/
Ember.BROWSER = {
  android: 'android',
  blackberry: 'blackberry',
  chrome: 'chrome',
  firefox: 'firefox',
  ie: 'ie',
  opera: 'opera',
  safari: 'safari',
  unknown: 'unknown'
};

/**
  The list of devices that are automatically identified.

  @static
  @constant
*/
Ember.DEVICE = {
  android: 'android',
  blackberry: 'blackberry',
  desktop: 'desktop',
  ipad: 'ipad',
  iphone: 'iphone',
  ipod: 'ipod',
  mobile: 'mobile'
};

/**
  The list of browser engines that are automatically identified.

  @static
  @constant
*/
Ember.ENGINE = {
  gecko: 'gecko',
  opera: 'opera',
  presto: 'presto',
  trident: 'trident',
  webkit: 'webkit'
};

/**
  The list of operating systems that are automatically identified.

  @static
  @constant
*/
Ember.OS = {
  android: 'android',
  blackberry: 'blackberry',
  ios: 'ios',
  linux: 'linux',
  mac: 'mac',
  win: 'windows'
};


/**
  Detects browser properties based on the given userAgent and language.

  @private
*/
Ember.detectBrowser = function(userAgent, language) {
  var browser = {},
      device,
      engineAndVersion,
      isIOSDevice,
      conExp = '(?:[\\/:\\::\\s:;])', // Match the connecting character
      numExp = '(\\S+[^\\s:;:\\)]|)', // Match the "number"
      nameAndVersion,
      osAndVersion,
      override;

  // Use the current values if none are provided.
  userAgent = (userAgent || navigator.userAgent).toLowerCase();
  language = language || navigator.language || navigator.browserLanguage;

  // Calculations to determine the device.  See Ember.DEVICE.
  device =
    userAgent.match( new RegExp('(android|ipad|iphone|ipod|blackberry)') ) ||
    userAgent.match( new RegExp('(mobile)') ) ||
    ['', Ember.DEVICE.desktop];

  /**
    @name Ember.browser.device
    @type {Ember.DEVICE}
  */
  browser.device = device[1];


  // It simplifies further matching by recognizing this group of devices.
  isIOSDevice =
    browser.device === Ember.DEVICE.ipad ||
    browser.device === Ember.DEVICE.iphone ||
    browser.device === Ember.DEVICE.ipod;


  // Calculations to determine the name and version.  See Ember.BROWSER.

  nameAndVersion =
    // Match the specific names first, avoiding commonly spoofed browsers.
    userAgent.match( new RegExp('(opera|chrome|firefox|android|blackberry)' + conExp + numExp) ) ||
    userAgent.match( new RegExp('(ie|safari)' + conExp + numExp) ) ||
    ['', Ember.BROWSER.unknown, '0'];

  // If the device is an iOS device, use Ember.BROWSER.safari for browser.name.
  if (isIOSDevice) { nameAndVersion[1] = Ember.BROWSER.safari; }

  // If a `Version` number is found, use that over the `Name` number
  override = userAgent.match( new RegExp('(version)' + conExp + numExp) );
  if (override) { nameAndVersion[2] = override[2]; }
  // If there is no `Version` in Safari, don't use the Safari number since it is
  // the Webkit number.
  else if (nameAndVersion[1] === Ember.BROWSER.safari) { nameAndVersion[2] = '0'; }


  /**
    @name Ember.browser.name
    @type {Ember.BROWSER}
  */
  browser.name = nameAndVersion[1];

  /**
    @name Ember.browser.version
    @type String
  */
  browser.version = nameAndVersion[2];


  // Calculations to determine the engine and version.  See Ember.ENGINE.
  engineAndVersion =
    // Match the specific engines first, avoiding commonly spoofed browsers.
    userAgent.match( new RegExp('(presto)' + conExp + numExp) ) ||
    userAgent.match( new RegExp('(opera|trident|webkit|gecko)' + conExp + numExp) ) ||
    ['', Ember.BROWSER.unknown, '0'];

  // If the browser is Ember.BROWSER.ie, use Ember.ENGINE.trident.
  override = browser.name === Ember.BROWSER.ie ? Ember.ENGINE.trident : false;
  if (override) { engineAndVersion[1] = override; }

  // If the engineVersion is unknown and the browser is Ember.BROWSER.ie, use
  // browser.version for browser.engineVersion.
  override = browser.name === Ember.BROWSER.ie && engineAndVersion[2] === '0';
  if (override) { engineAndVersion[2] = browser.version; }

  // If a `rv` number is found, use that over the engine number.
  override = userAgent.match( new RegExp('(rv)' + conExp + numExp) );
  if (override) { engineAndVersion[2] = override[2]; }


  /**
    @name Ember.browser.engine
    @type {Ember.ENGINE}
    @type {Ember.BROWSER.unknown}
  */
  browser.engine = engineAndVersion[1];

  /**
    @name Ember.browser.engineVersion
    @type String
  */
  browser.engineVersion = engineAndVersion[2];


  // If we don't know the name of the browser, use the name of the engine.
  if (browser.name === Ember.BROWSER.unknown) { browser.name = browser.engine; }

  // Calculations to determine the os and version.  See Ember.OS.
  osAndVersion =
    // Match the specific names first, avoiding commonly spoofed os's.
    userAgent.match( new RegExp('(blackberry)') ) ||
    userAgent.match( new RegExp('(android|iphone(?: os)|windows(?: nt))' + conExp + numExp) ) ||
    userAgent.match( new RegExp('(os|mac(?: os)(?: x))' + conExp + numExp) ) ||
    userAgent.match( new RegExp('(linux)') ) ||
    [null, Ember.BROWSER.unknown, '0'];

  // Normalize the os name.
  if (isIOSDevice) { osAndVersion[1] = Ember.OS.ios; }
  else if (osAndVersion[1] === 'mac os x' || osAndVersion[1] === 'mac os') { osAndVersion[1] = Ember.OS.mac; }
  else if (osAndVersion[1] === 'windows nt') { osAndVersion[1] = Ember.OS.windows; }

  // Normalize the os version.
  osAndVersion[2] = osAndVersion[2] ? osAndVersion[2].replace(/_/g, '.') : '0';


  /**
    @name Ember.browser.os
    @type {Ember.OS}
    @type {Ember.BROWSER.unknown}
  */
  browser.os = osAndVersion[1];

  /**
    @name Ember.browser.osVersion
    @type String
  */
  browser.osVersion = osAndVersion[2];

  /**
    @name Ember.browser.windows
    @type Boolean
  */
  browser.windows = browser.os === Ember.OS.windows;

  /**
    @name Ember.browser.mac
    @type Boolean
  */
  browser.mac = browser.os === Ember.OS.mac;

  /**
    @name Ember.browser.iPhone
    @type Boolean
  */
  browser.iPhone = browser.device === Ember.DEVICE.iphone;

  /**
    @name Ember.browser.isiPod
    @type Boolean
  */
  browser.iPod = browser.device === Ember.DEVICE.ipod;

  /**
    @name Ember.browser.isiPad
    @type Boolean
  */
  browser.iPad = browser.device === Ember.DEVICE.ipad;

  /**
    @name Ember.browser.iOS
    @type Boolean
  */
  browser.iOS = browser.os === Ember.OS.ios;

  /**
    @name Ember.browser.android
    @type Boolean
  */
  browser.android = browser.os === Ember.OS.android;

  /**
    @name Ember.browser.language
    @type String
  */
  browser.language = language.split('-', 1)[0];

  /**
    @name Ember.browser.countryCode
    @type String
  */
  browser.countryCode = language.split('-')[1] ? language.split('-')[1].toLowerCase() : undefined;

  /** @deprecated Since version 1.7. Use browser.name.  See Ember.BROWSER for possible values.
    Possible values:

      - 'msie'
      - 'mozilla'
      - 'chrome'
      - 'safari'
      - 'opera'
      - 'mobile-safari'
      - 'unknown'

    @name Ember.browser.current
    @type String
    @default 'unknown'
  */
  browser.current = browser.name;

  return browser;
};


/** @class

  This object contains information about the browser environment SproutCore is
  running in. This includes the following properties:

    - browser.device                  ex. Ember.DEVICE.ipad
    - browser.name                    ex. Ember.BROWSER.chrome
    - browser.version                 ex. '16.0.2.34'
    - browser.os                      ex. Ember.OS.mac
    - browser.osVersion               ex. '10.6'
    - browser.engine                  ex. Ember.ENGINE.webkit
    - browser.engineVersion           ex. '533.29'

  Note: User agent sniffing does not provide guaranteed results and spoofing may
  affect the accuracy.  Therefore, as a general rule, it is much better
  to rely on the browser's verified capabilities in Ember.platform.

  Based on the unit test samples, the most stable browser properties appear to
  be `engine` and `engineVersion`.
*/
Ember.browser = Ember.detectBrowser();

var get = Ember.get;

Ember.Searchable = Ember.Mixin.create({

  isSearchable: true,

  searchString: null,
  searchPause: 100,
  minSearchLen: 1,
  sanitize: true,

  init: function() {
    this._super();
    this._runSearch();
  },

  _searchDidChange: Ember.observer(function() {
    var searchPause = get(this, 'searchPause'),
        searchString = get(this, 'searchString') || "",
        minSearchLen = get(this, 'minSearchLen');

    // Check for min length
    if (searchString.length < minSearchLen) {
      this.reset();
      return;
    }

    if (searchPause > 0) {
      this._setSearchInterval(searchPause);
    } else {
      this._runSearch();
    }
  }, 'searchString'),

  _setSearchInterval: function(searchPause) {
    Ember.run.cancel(this._searchTimer);
    this._searchTimer = Ember.run.later(this, '_runSearch', searchPause);
  },

  _sanitizeSearchString: function(str) {
    var specials = [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ];
    this._cachedRegex = this._cachedRegex || new RegExp('(\\' + specials.join('|\\') + ')', 'g');
    return str.replace(this._cachedRegex, '\\$1');
  },

  _runSearch: function() {
    var searchText = get(this, 'searchString');
    if (!Ember.empty(searchText)) {
      searchText = get(this, 'sanitize') ? this._sanitizeSearchString(searchText).toLowerCase() : searchText;
      this.runSearch(searchText);
    } else {
      this.reset();
    }
  },

  /**
    Override to implement searching functionality

    @param {String} searchText a text to search for
  */
  runSearch: Ember.K,

  /**
    Override to implement reset functionality
  */
  reset: Ember.K
});

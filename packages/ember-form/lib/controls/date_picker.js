var get = Ember.get, set = Ember.set, getPath = Ember.getPath, setPath = Ember.setPath;

var dateProperty = function(key, value) {
  if (!Ember.none(value)) {
    this.set(key, get(value, 'value'));
  } else if (value === undefined) {
    var date = this.getPart(key);
    return date ? get(this, '%@s'.fmt(key)).findProperty('value', date) : null;
  }
  return value;
};

Ember.DatePicker = Em.ContainerView.extend({
  classNames: ['ember-date-picker'],

  value: null,

  day: null,
  month: null,
  year: null,

  _day: function(key, value) {
    return dateProperty.call(this, 'day', value);
  }.property('day', 'value.day').cacheable(),

  _month: function(key, value) {
    return dateProperty.call(this, 'month', value);
  }.property('month', 'value.month').cacheable(),

  _year: function(key, value) {
    return dateProperty.call(this, 'year', value);
  }.property('year', 'value.year').cacheable(),

  getPart: function(key) {
    var date = get(this, key);
    return date ? date : getPath(this, 'value.%@'.fmt(key));
  },

  dateDidChange: function() {
    var date;
    if (this.get('isComplete')) {
      set(this, 'value', Ember.DateTime.create(this.getProperties('day', 'month', 'year')));
    } else {
      set(this, 'value', null);
    }
  }.observes('day', 'month', 'year'),

  valueDidChange: function() {
    if (!get(this, 'value')) {
      this.setProperties({ day: null, month: null, year: null });
    }
  }.observes('value'),

  isComplete: function() {
    return this.get('childViews').getEach('name').every(function(key) {
      return !Ember.empty(this.getPart(key));
    }, this);
  }.property('day', 'month', 'year').cacheable(),

  childViews: ['dayView', 'monthView', 'yearView'],
  dayView: Ember.Select.extend({
    name: 'day',
    localize: false,
    prompt: " ",
    contentBinding: 'parentView.days',
    selectionBinding: 'parentView._day',
    optionLabelPath: 'content.label',
    optionValuePath: 'content.value'
  }),
  monthView: Ember.Select.extend({
    name: 'month',
    localize: false,
    prompt: " ",
    contentBinding: 'parentView.months',
    selectionBinding: 'parentView._month',
    optionLabelPath: 'content.label',
    optionValuePath: 'content.value'
  }),
  yearView: Ember.Select.extend({
    name: 'year',
    localize: false,
    prompt: " ",
    contentBinding: 'parentView.years',
    selectionBinding: 'parentView._year',
    optionLabelPath: 'content.label',
    optionValuePath: 'content.value'
  }),

  years: Ember.computed(function() {
    var i, array = [], format = get(this, 'yearFormat') || '%Y',
        yearStart = get(this, 'yearStart') || 0, yearEnd = get(this, 'yearEnd') || '-100',
      year = Em.DateTime.create().get('year'), start = year + parseInt(yearStart, 10), end = year + parseInt(yearEnd, 10);
    if (start >=  end) {
      for (i = start; i > end; i--) {
        array.push({
          label: Em.DateTime.create({year:i}).toFormattedString(format),
          value: i
        });
      }
    } else {
      for (i = start; i < end; i++) {
        array.push({
          label: Em.DateTime.create({year:i}).toFormattedString(format),
          value: i
        });
      }
    }
    return array;
  }).property('yearStart', 'yearEnd', 'yearFormat').cacheable(),

  months: Ember.computed(function() {
    var i, array = [], format = get(this, 'monthFormat') || '%B';
    for (i = 1; i < 13; i++) {
      array.push({
        label: Em.DateTime.create({month:i}).toFormattedString(format),
        value: i
      });
    }
    return array;
  }).property('monthFormat').cacheable(),

  days: Ember.computed(function() {
    var i, array = [], format = get(this, 'dayFormat') || '%d';
    for (i = 1; i < 32; i++) {
      array.push({
        label: Em.DateTime.create({day:i}).toFormattedString(format),
        value: i
      });
    }
    return array;
  }).property('dayFormat').cacheable()
});

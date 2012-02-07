var get = Ember.get, set = Ember.set, getPath = Ember.getPath, setPath = Ember.setPath;

var getDate = function(key, value, fn) {
  var date = get(this, 'value'), options = {};
  if (!Ember.none(value)) {
    options[key] = get(value, 'value');
    date = date ? date : Ember.DateTime.create();
    set(this, 'value', date.adjust(options));
  } else if (value === undefined) {
    return date ? get(this, '%@s'.fmt(key)).findProperty('value', get(date, key)) : null;
  }
  return value;
};

Ember.DatePicker = Em.ContainerView.extend({
  classNames: ['ember-date-picker'],

  value: null,

  day: function(key, value) {
    return getDate.call(this, key, value);
  }.property('value.day').cacheable(),

  month: function(key, value) {
    return getDate.call(this, key, value);
  }.property('value.month').cacheable(),

  year: function(key, value) {
    return getDate.call(this, key, value);
  }.property('value.year').cacheable(),

  childViews: ['dayView', 'monthView', 'yearView'],
  dayView: Ember.Select.extend({
    localize: false,
    prompt: " ",
    contentBinding: 'parentView.days',
    selectionBinding: 'parentView.day',
    optionLabelPath: 'content.label',
    optionValuePath: 'content.value'
  }),
  monthView: Ember.Select.extend({
    localize: false,
    prompt: " ",
    contentBinding: 'parentView.months',
    selectionBinding: 'parentView.month',
    optionLabelPath: 'content.label',
    optionValuePath: 'content.value'
  }),
  yearView: Ember.Select.extend({
    localize: false,
    prompt: " ",
    contentBinding: 'parentView.years',
    selectionBinding: 'parentView.year',
    optionLabelPath: 'content.label',
    optionValuePath: 'content.value'
  }),

  years: Ember.computed(function() {
    var i, array = [], format = get(this, 'yearFormat') || '%Y',
        yearStart = get(this, 'yearStart') || 0, yearEnd = get(this, 'yearEnd') || '-100',
      year = Em.DateTime.create().get('year'), start = year + parseInt(yearStart, 10), end = year + parseInt(yearEnd, 10);
    for (i = start; i > end; i--) {
      array.push({
        label: Em.DateTime.create({year:i}).toFormattedString(format),
        value: i
      });
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

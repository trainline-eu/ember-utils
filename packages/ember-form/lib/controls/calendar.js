var get = Ember.get, set = Ember.set, getPath = Ember.getPath, setPath = Ember.setPath;

Ember.Calendar = Ember.ContainerView.extend({
  month: Ember.DateTime.create(),
  minSelection: null,
  maxSelection: null,
  selection: null,

  previousLabel: '◀',
  nextLabel: '▶',

  titleFormat: '%B %Y',
  title: Ember.computed(function() {
    var month = get(this, 'month'), format = get(this, 'titleFormat');
    return month ? month.toFormattedString(format) : undefined;
  }).property('month', 'titleFormat').cacheable(),

  tagName: 'table',
  classNames: ['ember-calendar'],

  childViews: ['captionView', 'headerView', 'bodyView'],

  captionView: Ember.View.extend({
    tagName: 'caption',
    calendarBinding: 'parentView',
    button: Ember.Button.extend({
      tagName: 'span',
      targetBinding: 'parentView.calendar'
    }),
    template: Ember.Handlebars.compile(
      '{{view button titleBinding="calendar.previousLabel" action="decrementMonth"}}'+
      '{{calendar.title}}'+
      '{{view button titleBinding="calendar.nextLabel" action="incrementMonth"}}'
    )
  }),

  headerView: Ember.ContainerView.extend({
    tagName: 'thead',
    childViews: ['daysOfWeekView'],
    daysOfWeekView: Ember.CollectionView.extend({
      tagName: 'tr',
      contentBinding: 'parentView.parentView.daysOfweek',
      itemViewClass: Ember.View.extend(Ember.TitleSupport, Ember.TitleRenderSupport, {
        tagName: 'th',
        localize: false,
        titleBinding: 'content'
      })
    })
  }),

  bodyView: Ember.CollectionView.extend({
    tagName: 'tbody',
    contentBinding: 'parentView.weeks',
    itemViewClass: Ember.CollectionView.extend({
      tagName: 'tr',
      selectionBinding: 'parentView.parentView.selection',
      itemViewClass: Ember.Button.extend({
        tagName: 'td',
        disabledBinding: 'content.disabled',
        classNameBindings: ['disabled', 'content.notCurrentMonth', 'content.today', 'content.selected'],
        localize: false,
        titleBinding: 'content.value.day',
        target: '*',
        action: function() {
          setPath(this, 'collectionView.selection', getPath(this, 'content.value'));
        }
      })
    })
  }),

  daysOfweek: Ember.computed(function() {
    var i, names = [], day = Ember.DateTime.create().get('lastMonday');
    for (i = 0; i < 7; ++i) {
      names.push(day.toFormattedString('%a').toLowerCase());
      day = day.advance({day: 1});
    }
    return names;
  }).property().cacheable(),

  weeks: Ember.computed(function() {
    var i,
      today = Ember.DateTime.create(),
      month = get(this, 'month'),
      firstVisibleDay = get(this, 'firstVisibleDay'),
      day = firstVisibleDay.copy(),
      selection = get(this, 'selection'),
      weeks = [], days, count = 0;

    for (i = 0; i < 42; ++i) {
      if (count === 7) { count = 0; }
      if (count === 0) {
        days = [];
        weeks.push(days);
      }
      days.push({
        value: day,
        disabled: !this.canSelect(day),
        notCurrentMonth: get(day, 'month') !== get(month, 'month'),
        today: Ember.DateTime.compareDate(today, day) === 0,
        selected: !Ember.empty(selection) && Ember.DateTime.compareDate(selection, day) === 0
      });

      day = day.advance({day: 1});
      count++;
    }
    return weeks;
  }).property('month', 'minSelection', 'maxSelection', 'selection').cacheable(),

  canSelect: function(day) {
    var minSelection = get(this, 'minSelection'),
      maxSelection = get(this, 'maxSelection');
    if ((!minSelection || Ember.DateTime.compareDate(minSelection, day) <= 0) &&
        (!maxSelection || Ember.DateTime.compareDate(maxSelection, day) >= 0)) {
      return true;
    }
    return false;
  },

  incrementMonth: function() {
    var nextMonth = get(this, 'month').advance({ month: 1 });
    if (this.canSelect(nextMonth.adjust({ day: 1 }))) {
      set(this, 'month', nextMonth);
    }
  },

  decrementMonth: function() {
    var previousMonth = this.get('month').advance({ month: -1 });
    if (this.canSelect(previousMonth.adjust({ day: previousMonth.get('daysInMonth') }))) {
      set(this, 'month', previousMonth);
    }
  },

  firstVisibleDay: Ember.computed(function() {
    var day = get(this, 'month').adjust({day: 1});
    if (get(day, 'dayOfWeek') !== 1) day = get(day, 'lastMonday');
    return day;
  }).property('month').cacheable(),

  minSelectionDidChange: Ember.observer(function() {
    var selection = get(this, 'selection'),
      minSelection = get(this, 'minSelection');
    if (minSelection) {
      if (selection && Ember.DateTime.compareDate(minSelection, selection) > 0) {
        set(this, 'selection', minSelection);
        set(this, 'month', minSelection);
      } else if (Ember.DateTime.compareDate(get(this, 'month').adjust({day: 1}), minSelection.adjust({day: 1})) < 0) {
        set(this, 'month', minSelection);
      }
    }
  }, 'minSelection'),

  maxSelectionDidChange: Ember.observer(function() {
    var selection = get(this, 'selection'),
      maxSelection = get(this, 'maxSelection');
    if (maxSelection) {
      if (selection && Ember.DateTime.compareDate(maxSelection, selection) < 0) {
        set(this, 'selection', maxSelection);
        set(this, 'month', maxSelection);
      } else if (Ember.DateTime.compareDate(get(this, 'month').adjust({day: 1}), maxSelection.adjust({day: 1})) > 0) {
        set(this, 'month', maxSelection);
      }
    }
  }, 'maxSelection')
});

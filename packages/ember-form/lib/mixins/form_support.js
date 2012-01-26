var get = Ember.get, getPath = Ember.getPath;

Ember.FormSupport = Ember.Mixin.create({
  hasFormSupport: true,

  isSubmit: false,

  form: Ember.computed(function() {
    return this.nearestInstanceOf(Ember.Form);
  }).property().cacheable(false),

  submitForm: function() {
    var form = get(this, 'form');
    if (form && !get(this, 'disabled') && get(this, 'isSubmit')) { form.$().submit(); }
  }
});

Ember.FieldSupport = Ember.Mixin.create(Ember.ResponderSupport, Ember.Validatable, Ember.FormSupport, {

  hasFieldSupport: true,

  didInsertElement: function() {
    this._super();
    var fields = getPath(this, 'form.fields');
    if (fields && !fields.contains(this)) {
      get(this, 'validatorObjects').invoke('attachTo', get(this, 'form'), this);
      fields.pushObject(this);
    }
  },

  remove: function() {
    var fields = getPath(this, 'form.fields');
    if (fields && fields.contains(this)) {
      get(this, 'validatorObjects').invoke('detachFrom', get(this, 'form'), this);
      fields.removeObject(this);
    }
    this._super();
  },

  // keyDown: function(evt) {
  //   this._super(evt);

  //   if (!this.performValidateKeyDown(evt)) {
  //     evt.preventDefault();
  //     evt.stopPropagation();
  //   }
  // },

  becomeFirstResponder: function() {
    this._super();

    this.performValidate(true);
  },

  resignFirstResponder: function() {
    this._super();

    this.performValidate(true);
  },

  interpretKeyEvents: function(evt) {
    this._super(evt);

    if (!this.performValidateKeyDown(evt)) {
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      this.performValidate(true);
    }
  },

  insertNewline: function(evt) {
    this._super(evt);
    this.submitForm();
  }
});

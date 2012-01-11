var set = Ember.set;

module("Ember.ObjectProxy");

test("should work", function() {
  var proxy = Ember.ObjectProxy.create();
  ok(proxy);
});

test("should delegate gets to content object", function() {
  var proxy = Ember.ObjectProxy.create({
    content: {
      foo: "bar"
    }
  });

  equals(proxy.get('foo'), "bar");
});

test("should not break direct content access", function() {
  var proxy = Ember.ObjectProxy.create({
    content: {
      foo: "bar"
    }
  });

  equals(proxy.getPath('content.foo'), "bar");
});

test("should delegate sets to content object", function() {
  var proxy = Ember.ObjectProxy.create({
    content: {
      foo: "bar"
    }
  });

  proxy.set('zomg', 'bro');

  equals(proxy.getPath('content.zomg'), proxy.get('zomg'));
});

test("proxy is notified of changes to content", function() {
  var content = Ember.Object.create({ foo: 'bar' }),
      observerCount = 0;

  var proxy = Ember.ObjectProxy.create({
    content: content,

    fooDidChange: Ember.observer(function() {
      observerCount++;
    }, 'foo')
  });

  equals(observerCount, 0, 'precond - observer has not been called');

  Ember.run(function() {
    set(content, 'foo', 'baz');
  });

  equals(observerCount, 1, 'should notify proxy of changes');
});

test("handles changing content", function() {
  var oldContent = { foo: 'bar' },
      newContent = { foo: 'baz' },
      observerCount = 0;

  window.billy = true;

  var proxy = Ember.ObjectProxy.create({
    content: oldContent,

    fooDidChange: Ember.observer(function() {
      observerCount++;
    }, 'foo')
  });

  equals(observerCount, 0, 'precond - observer has not been called');

  Ember.run(function() {
    set(proxy, 'content', newContent);
  });

  equals(observerCount, 1, 'observer gets called on change');

  var lastObserverCount = observerCount;

  Ember.run(function() {
    set(oldContent, 'foo', 'bing');
  });

  equals(observerCount, lastObserverCount, 'observer does not get called from old content');
});

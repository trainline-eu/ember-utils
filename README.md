## Ember Addons

A collection of addons for Ember.js framework. Some of them are just snippets of useful code.

### Ember Data Amplify

### Ember DateTime

A class representation of a date and time. It's basically a wrapper around
the Date javascript object, KVO-friendly and with common date/time
manipulation methods.

This object differs from the standard JS Date object, however, in that it
supports time zones other than UTC and that local to the machine on which
it is running.  Any time zone can be specified when creating an
`Ember.DateTime` object, e.g.

```javascript
    // Creates a DateTime representing 5am in Washington, DC and 10am in
    // London
    var d = Ember.DateTime.create({ hour: 5, timezone: 300 }); // -5 hours from UTC
    var e = Ember.DateTime.create({ hour: 10, timezone: 0 }); // same time, specified in UTC
```

and it is true that `d.isEqual(e)`.

The time zone specified upon creation is permanent, and any calls to
`get()` on that instance will return values expressed in that time zone. So,

    d.hour returns 5.
    e.hour returns 10.

but

    d.milliseconds === e.milliseconds

is true, since they are technically the same position in time.

### Ember GeoLocation

### Ember Module

### Ember ObjectProxy

### Ember Routing

### Ember Utils

#### Enumerable

* flatten
* sortProperty

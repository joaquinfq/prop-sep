# prop-sep [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[![npm install prop-sep](https://nodei.co/npm/prop-sep.png?compact=true)](https://npmjs.org/package/prop-sep/)

Check, get, set and remove properties from nested objects using any separator.

```javascript
const propSep = require('prop-sep');
const obj     = {};
propSep.set(obj, 'a.b.c', 5);
console.log(obj); // { a : { b : { c : 5 } } }
```

Also, you can attach and detach this methods to objects and classes.

As instance methods:

```javascript
const propSep = require('prop-sep');

class Class {}
propSep.attach(Class);

const obj = new Class();
obj.set('a.b.c', 5);
console.log(obj); // { a : { b : { c : 5 } } }
```

As class methods:

```javascript
const propSep = require('prop-sep');

class Class {}
class Other extends Class {}
propSep.attach(Class, false);

const obj = {};
Class.set(obj, 'a.b.c', 5);
console.log(obj); // { a : { b : { c : 5 } } }
Other.set(obj, 'b', 1);
console.log(obj); // { a : { b : { c : 5 } }, b : 1 }
```

See [test file](./test.js) for examples.

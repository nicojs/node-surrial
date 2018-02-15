[![Build Status](https://travis-ci.org/nicojs/node-surrial.svg?branch=master)](https://travis-ci.org/nicojs/node-surrial)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/nicojs/node-surrial/master)](https://stryker-mutator.github.io) 

# Surrial 

Serialize anything. Pretty surreal! 

## Install

Install using your favorite package manager:

```bash
npm install surrial
# OR
yarn add surrial
```

## Usage

```javascript
const { serialize, deserialize } = require('surrial');

class Person {
    constructor(name, parent){
        this.name = name;
        this.parent = parent;
    }
}

function identity(thing) { return thing;  }

const stringified = serialize({
    a: 1,
    b: new Date(),
    c: /foo/,
    d: new Set([1, 2, 3]),
    e: new Map([[1, 'one'], [2, 'two']]),
    f: Person,
    g: identity
});

/* => '{ "a": 1, "b": new Date("2018-02-13T20:27:39.073Z"), "c": /foo/, "d": new Set([1, 2, 3]), "e": new Map([[1, "one"], [2, "two"]]), "f": class Person { constructor(name, parent) { this.name = name; this.parent = parent; } }, "g": function identity(thing) { return thing;  } }'      
*/

const output = deserialize(stringified)
/* =>
{ a: 1,
  b: 2018-02-13T20:32:52.218Z,
  c: /foo/,
  d: Set { 1, 2, 3 },
  e: Map { 1 => 'one', 2 => 'two' },
  f: [Function: Person],
  h: [Function: identity] } 
*/
```

Also supports serializing instances of classes.

```javascript
const p = new Person('Foo', new Person('Bar', null));
const personString = serialize(p);
// => 'new Person("Foo", new Person("Bar", null))'

const copy = deserialize(p, [Person]);
// => Person { name: 'Foo', parent: Person { name: 'Bar', parent: null } }
```

## Api

```javascript
/**
 * Serializes the thing to a javascript string. This is NOT necessarily a JSON string, but will be valid javascript.
 * @param thing The thing to be serialized
 */
function serialize(thing: any): string {


/**
 * Deserializes a string into it's javascript equivalent. CAUTION! Evaluates the string in the current javascript engine
 * (`eval` or one of its friends). Be sure the `serializedThing` comes from a trusted source!
 * @param serializedThing The string to deserialize
 * @param knownClasses A list of known classes used to provide as constructor functions
 */
function deserialize(serializedThing: string, knownClasses: ClassConstructor[] = []): any;
```


## Features

* Serializes all primitive types
* Serializes plain objects as JSON
* Support for build in types: `Date`, `RegExp`, `Map`, `Set` and `Buffer`
* Support for functions and classes using their `toString()` 
* Support for instances of classes (see limitations).
* Has a light footprint (&lt; 200 lines of code).
* Written in typescript (type definition included).
* Deserialize using a `deserialize` convenience method. This uses the `new Function(/*...*/)` (comparable to `eval`) (see limitations).

## Limitations

Surrial, like any serialization library, has some limitations, but supports my personal use case. 
If you need more functionality, don't hesitate to open [an issue](https://github.com/nicojs/node-surrial/issues). 
I'm always in for a discussion.

### Circular references

Circular references are not supported.

### Deserializing is no security feature

When you call the `deserialize` method, any string will be interpreted as javascript using the [`new Function(...)` constructor](https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Global_Objects/Function). Keep in mind that any arbitrary code will be executed in the global scope of your current javascript engine! Please be sure to sanitize code coming from not trusted sources.

### Class instances

Class instances are serialized using their constructor. Any additional properties are ignored.

```javascript
class Person {
    constructor(name){
        this.name = name;
    }
}

const p = new Person('foo');
p.age = 10; // => ignored
serialize(p);
// => 'new Person("foo")'
```

Both the `class` syntax and `prototype` syntax (es5 syntax) are supported here. 

When serializing an instance of a class, it is assumed that the constructor parameters are also properties (or attributes) of that class. If not, that parameter will be undefined.

```javascript
class Person {
    constructor(n, age){
        this.name = n; // => ignored
        this.age = age;
    }
}

const p = new Person('foo', 42);
serialize(p);
// => 'new Person(undefined, 42)'
```

When deserializing a class instance, you are responsible for providing a class definition (or a class with the same name).

```javascript
class Person { constructor(name) { this.name = name; }}
deserialize('new Person("Foo")');
// => ReferenceError: Person is not defined

deserialize('new Person("Foo")', [Person]);
// => OK: Person { name: 'Foo' }
```

### 



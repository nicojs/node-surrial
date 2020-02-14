[![Build Status](https://travis-ci.org/nicojs/node-surrial.svg?branch=master)](https://travis-ci.org/nicojs/node-surrial)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fnicojs%2Fnode-surrial%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/nicojs/node-surrial/master)

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
const { serialize, deserialize, surrial } = require('surrial');

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

Also supports serializing instances of classes for known classes.

```javascript
const p = new Person('Foo', new Person('Bar', null));
const knownClasses = [Person];
const personString = serialize(p, knownClasses);
// => 'new Person("Foo", new Person("Bar", null))'

const copy = deserialize(p, knownClasses);
// => Person { name: 'Foo', parent: Person { name: 'Bar', parent: null } }
```
An example of the `surrial` tag for template literals:

```js
const decade = [new Date(2010, 1, 1), new Date(2020, 1, 1)];
surrial`new Set(${decade})`;
// => 'new Set([new Date("2010-01-31T23:00:00.000Z"),new Date("2020-01-31T23:00:00.000Z")])'
```

You can customize the output string using the `surrialize()` method (comparable to the [`toJSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON_behavior) method for `JSON.stringify`). 

```ts
// A typescript example
class Person implements Surrializable {
    public age: number;
    constructor(ageInMonths: number) {
        this.age = Math.floor(ageInMonths / 12);
    }
    surrialize() {
        return surrial`new Person(${this.age * 12})`;
    }
}

const input = new Person(25);
const actual = serialize(input, [Person]);
const output = deserialize(actual, [Person]);
expect(output).instanceOf(Person);
expect(output).deep.eq(input);
```

## Api

TypeScript typings are included in the library.

```javascript
/**
 * A surrial template tag, useful for building templates strings while enforcing the values to be serialized using surrial.
 * @param templateLiterals The template literals
 * @param values The values to be serialized using surrial
 */
export function surrial(templateLiterals: TemplateStringsArray, ...values: unknown[]) {

/**
 * Serializes the thing to a javascript string. This is NOT necessarily a JSON string, but will be valid javascript.
 * @param thing The thing to be serialized
 * @param knownClasses the classes of which instances are serialized as constructor calls (for example "new Person('Henry')").
 */
export function serialize(thing: any, knownClasses: ClassConstructor[] = []): string {


/**
 * Deserializes a string into it's javascript equivalent. CAUTION! Evaluates the string in the current javascript engine
 * (`eval` or one of its friends). Be sure the `serializedThing` comes from a trusted source!
 * @param serializedThing The string to deserialize
 * @param knownClasses A list of known classes used to provide as constructor functions
 */
export function deserialize(serializedThing: string, knownClasses: ClassConstructor[] = []): any;
```


## Features

* Serializes all primitive types
* Serializes plain objects as JSON
* Support for build in types: `Date`, `RegExp`, `Map`, `Set` and `Buffer`
* Support for functions and classes using their `toString()` 
* Support for instances of classes using `new MyClass()` syntax (see [limitations](#class-instances)).
* Support for deeply nested build in types/class instances
* Has a light footprint (&lt; 200 lines of code).
* Written in typescript (type definition included).
* Deserialize using a `deserialize` convenience method. This uses the `new Function(/*...*/)` (comparable to `eval`) (see [limitations](#deserializing-is-no-security-feature-you-will-get-hacked)).
* Serialize values in a template with a handy `surrial` tagged template literal.
* Allow a custom serialize function using `surrialize`.

## Limitations

Surrial, like any serialization library, has some limitations, but supports my personal use case. 
If you need more functionality, don't hesitate to open [an issue](https://github.com/nicojs/node-surrial/issues). 
I'm always in for a discussion.

### Circular references

Circular references are not supported.

### Deserializing is no security feature (you will get hacked!)

When you call the `deserialize` method, any string will be interpreted as javascript using the [`new Function(...)` constructor](https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Global_Objects/Function). Keep in mind that any arbitrary code will be executed in the global scope of your current javascript engine! Please **don't use this library** to deserialize strings coming from untrusted sources!

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
serialize(p, [Person]);
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

When serializing a class instance, only classes you specify as `knownClasses` are actually serialized using `new MyClass()`, 
by default it would just have a JSON format.

```javascript
class Person { constructor(name) { this.name = name; }}
serialize(new Person('Foo'));
// => { "name": "foo" }

serialize(new Person('Foo'), [Person]);
// => new Person("foo")
```

When deserializing a class instance, you are responsible for providing a class definition (or a class with the same name).

```javascript
class Person { constructor(name) { this.name = name; }}
deserialize('new Person("Foo")');
// => ReferenceError: Person is not defined

deserialize('new Person("Foo")', [Person]);
// => OK: Person { name: 'Foo' }
```


## Acknowledgements

* This library is strongly influenced by [serialize-javascript](https://www.npmjs.com/package/serialize-javascript).
This might be what you're looking for when you don't need the class instance serialization support.
* A library which supports circular references: [circular-json](https://www.npmjs.com/package/circular-json)
* Know the class that you're serializing to? [serialize.ts](https://www.npmjs.com/package/serializer.ts) might be for you. This one also looks good: [cerialize](https://www.npmjs.com/package/cerialize)


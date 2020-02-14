import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import * as surrial from '../../src/index';
import { ESPerson, PrototypePerson, ConstructorLessClass, NamelessClass } from '../../testResources/classes';

describe('surrial', () => {
  it('should serialize normal objects', () => {
    const obj = { a: 42, b: true, c: 'foobar', d: null };
    const actual = surrial.serialize(obj);
    expect(actual).eq(JSON.stringify(obj));
  });

  it('should be able to serialize arrays inside of objects', () => {
    const obj = {
      kind: 0,
      constructorArgs: ['foobar']
    };
    const actual = surrial.serialize(obj);
    expect(actual).eq(JSON.stringify(obj));
  });

  it('should serialize functions', () => {
    function foobar(a: string) {
      return 2 + a;
    }
    const actual = surrial.serialize(foobar);
    expect(actual).eq(foobar.toString());
  });

  it('should serialize classes', () => {
    const actual = surrial.serialize(ESPerson);
    const output = surrial.deserialize(actual);
    expect(actual).eq(ESPerson.toString());
    expect(output.name).eq('ESPerson');
  });

  it('should serialize instances of constructor-less classes', () => {
    const actual = surrial.serialize(new ConstructorLessClass(), [ConstructorLessClass]);
    const output = surrial.deserialize(actual, [ConstructorLessClass]);
    expect(actual).eq('new ConstructorLessClass()');
    expect(output).deep.eq({});
  });

  it('should not be able to serialize instances of nameless classes', () => {
    const expectedMessage = `Cannot serialize instances of nameless classes (class was defined as: ${NamelessClass.toString()})`;
    expect(() => surrial.serialize(new NamelessClass(), [NamelessClass])).throws(expectedMessage);
  });

  it('should serialize Date', () => {
    const date = new Date('1900-02-02T02:04:05.006Z');
    const actual = surrial.serialize(date);
    expect(actual).eq('new Date("1900-02-02T02:04:05.006Z")');
  });

  it('should serialize RegExp', () => {
    const regex = /abc/;
    const actual = surrial.serialize(regex);
    expect(actual).eq('/abc/');
  });

  it('should throw a TypeError when serializing native built-ins', () => {
    expect(Number.toString()).to.equal('function Number() { [native code] }');
    expect(() => surrial.serialize(Number)).throws(TypeError);
  });

  it('should serialize class instances', () => {
    class Person {
      constructor(public name: string) {}
    }
    const input = new Person('Foobar');
    const actual = surrial.serialize(input, [Person]);
    expect(actual).eq('new Person("Foobar")');
    const output = surrial.deserialize(`(${actual})`, [Person]);
    expect(output).deep.eq(input);
  });

  it('should serialize a class instance as JSON if it is not a known class', () => {
    const input = new (class {
      constructor(readonly name: string) {}
    })('Foobar');
    const actual = surrial.serialize(input);
    expect(actual).eq(JSON.stringify(input));
  });

  it('should be able to serialize a class instance that is property of another class instance that is not a known class', () => {
    class Foo {
      constructor(readonly n: number) {}
    }
    const input = new (class {
      constructor(readonly foo: Foo) {}
    })(new Foo(42));
    const actual = surrial.serialize(input, [Foo]);
    expect(actual).eq('{"foo":new Foo(42)}');
  });

  it('should serialize class instances recursive', () => {
    class Person {
      constructor(public name: string, public parent: Person | null) {}
    }
    const input = new Person('foo', new Person('bar', new Person('baz', null)));
    const actual = surrial.serialize(input, [Person]);
    expect(actual).eq('new Person("foo", new Person("bar", new Person("baz", null)))');
  });

  it('should be able to deserialize an instance of an ES class', () => {
    const input = new ESPerson('Foo', 42);
    const actual = surrial.serialize(input, [ESPerson]);
    const expected = `new ESPerson("Foo", 42)`;
    const output = surrial.deserialize(actual, [ESPerson]);
    expect(actual).eq(expected);
    expect(output).instanceof(ESPerson);
    expect(output).deep.eq(input);
  });

  it('should be able to deserialize an instance of a prototypical class', () => {
    const input = new PrototypePerson('Foo', 42);
    const actual = surrial.serialize(input, [PrototypePerson]);
    const expected = `new PrototypePerson("Foo", 42)`;
    const output = surrial.deserialize(actual, [PrototypePerson]);
    expect(actual).eq(expected);
    expect(output).instanceof(PrototypePerson);
    expect(output).deep.eq(input);
  });

  it('should throw an error when serializing a native function', () => {
    expect(() => surrial.serialize(String)).throws('Cannot serialize native function: String');
  });

  it('should serialize `undefined`', () => {
    expect(surrial.serialize(undefined)).eq('undefined');
  });

  it('should be able to serialize a Set', () => {
    const input = new Set([42, 'foo', undefined, null]);
    const actual = surrial.serialize(input);
    const output = surrial.deserialize<Set<any>>(actual);
    expectSetEquals(input, output);
  });

  it('should be able to serialize a Map', () => {
    const input = new Map<any, any>([
      [1, '1'],
      ['2', 2]
    ]);
    const actual = surrial.serialize(input);
    const output = surrial.deserialize<Map<any, any>>(actual);
    expectMapEquals(input, output);
  });

  it('should be able to serialize buffers', () => {
    const input = Buffer.from('abc123ڔكښڨڪڬڮ');
    const actual = surrial.serialize(input);
    const output = surrial.deserialize<Buffer>(actual);
    expect(input.toString()).eq(output.toString());
  });

  it('should be able to serialize a png image as buffer', () => {
    const input = fs.readFileSync(path.join(__dirname, '..', '..', 'testResources', 'image.png'));
    const actual = surrial.serialize(input);
    const output = surrial.deserialize<Buffer>(actual);
    expect(input).deep.eq(output);
  });

  it('should be able to serialize a combination of everything', () => {
    const input = {
      a: 1,
      b: new Date(),
      c: /foo/,
      d: new Set([1, 2, 3]),
      e: new Map([
        [1, 'one'],
        [2, 'two']
      ]),
      g: new ESPerson('Foo', 25),
      h: Buffer.from('bar')
    };
    const actual = surrial.serialize(input, [ESPerson]);
    const output = surrial.deserialize(actual, [ESPerson]);
    expect(output).deep.eq(input);
  });

  function expectSetEquals(actual: Set<any>, expected: Set<any>): void {
    expect(actual.size).eq(expected.size);
    expected.forEach(expectedValue => expect(actual).contains(expectedValue));
  }

  function expectMapEquals(actual: Map<any, any>, expected: Map<any, any>): void {
    expect(actual.size).eq(expected.size);
    expected.forEach((expectedValue, expectedKey) => expect(actual.get(expectedKey)).deep.eq(expectedValue));
  }
});

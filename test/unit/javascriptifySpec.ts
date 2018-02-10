import * as path from 'path';
import { expect } from 'chai';
import * as javascriptify from '../../src/javascriptify';
import { ExternalPerson } from '../../testResources/classes';

describe('javascriptify', () => {

    it('should serialize normal objects', () => {
        const obj = { a: 42, b: true, c: 'foobar', d: null };
        const actual = javascriptify.serialize(obj);
        expect(actual).eq(JSON.stringify(obj, null, 2));
    });

    it('should serialize functions', () => {
        function foobar(a: string) {
            return 2 + a;
        }
        const actual = javascriptify.serialize(foobar);
        expect(actual).eq(foobar.toString());
    });

    it('should serialize Date', () => {
        const date = new Date('1900-02-02T02:04:05.006Z');
        const actual = javascriptify.serialize(date);
        expect(actual).eq('new Date("1900-02-02T02:04:05.006Z")');
    });

    it('should serialize RegExp', () => {
        const regex = /abc/;
        const actual = javascriptify.serialize(regex);
        expect(actual).eq('/abc/');
    });

    it('should serialize class instances', () => {
        class Person {
            constructor(public name: string) { }
        }
        const input = new Person('Foobar');
        const actual = javascriptify.serialize(input);
        expect(actual).eq('new Person("Foobar")');
        const output = javascriptify.deserialize(`(${actual})`, [Person]);
        expect(output).deep.eq(input);
    });

    it('should serialize class instances recursive', () => {
        class Person {
            constructor(public name: string, public parent: Person | null) { }
        }
        const actual = javascriptify.serialize(new Person('foo', new Person('bar', new Person('baz', null))));
        expect(actual).eq('new Person("foo", new Person("bar", new Person("baz", null)))');
    });

    it.skip('should be able to deserialize an instance of a class with a $moduleName defined', () => {
        const input = new ExternalPerson('Foo', 42);
        const actual = javascriptify.serialize(input);
        const expected = `new (require('${path.resolve(__dirname, '..', '..', 'testResources', 'classes.js').replace(/\\/g, '/')
            }').ExternalPerson)("Foo", 42)`;
        expect(actual).eq(expected);
        const output = javascriptify.deserialize(actual);
        expect(output).instanceof(ExternalPerson);
        expect(output).deep.eq(input);
    });

    it('should be able to serialize buffers', () => {
        const input = Buffer.from('abc123ڔكښڨڪڬڮ');
        const actual = javascriptify.serialize(input);
        const output = javascriptify.deserialize<Buffer>(actual);
        expect(input.toString()).eq(output.toString());
    });
});
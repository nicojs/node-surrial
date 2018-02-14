import { isClassInstance, getParamList } from './helpers';
import ClassConstructor from './ClassConstructor';

const UID = Math.floor(Math.random() * 0x10000000000).toString(16);
const UNSAFE_CHARS_REGEXP = /[<>\/\u2028\u2029]/g;
const PLACE_HOLDER_REGEXP = new RegExp('"@__' + UID + '-(\\d+)__@"', 'g');
const IS_NATIVE_CODE_REGEXP = /\{\s*\[native code\]\s*\}/g;

// Mapping of unsafe HTML and invalid JavaScript line terminator chars to their
// Unicode char counterparts which are safe to use in JavaScript strings.
interface EscapedChars {
    [key: string]: string;
}

const ESCAPED_CHARS: EscapedChars = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};

function escapeUnsafeChars(unsafeChar: string) {
    return ESCAPED_CHARS[unsafeChar];
}

/**
 * Deserializes a string into it's javascript equivalent. CAUTION! Evaluates the string in the current javascript engine
 * (`eval` or one of its friends). Be sure the `serializedThing` comes from a trusted source!
 * @param serializedThing The string to deserialize
 * @param knownClasses A list of known classes used to provide as constructor functions
 */
export function deserialize<T = any>(serializedThing: string, knownClasses: ClassConstructor[] = []): T {
    const evalFn = new Function(...knownClasses.map(t => t.name), `return (${serializedThing});`);
    return evalFn.apply(null, knownClasses);
}

/**
 * Serializes the thing to a javascript string. This is NOT necessarily a JSON string, but will be valid javascript.
 * @param thing The thing to be serialized
 */
export function serialize(thing: any): string {
    if (thing instanceof Date) {
        return serializeDate(thing);
    } else if (thing instanceof RegExp) {
        return thing.toString();
    } else if (typeof thing === 'function') {
        return serializeFunction(thing);
    } else if (thing instanceof Buffer) {
        return serializeBuffer(thing);
    } else if (thing instanceof Set) {
        return serializeSet(thing);
    } else if (thing instanceof Map) {
        return serializeMap(thing);
    } else if (isClassInstance(thing)) {
        return serializeClassInstance(thing);
    } else {
        return stringifyObject(thing);
    }
}

function stringifyObject(thing: any): string {
    const escapedValues: any[] = [];

    // Returns placeholders for functions and regexps (identified by index)
    // which are later replaced by their string representation.
    function replacer<T>(this: T, key: keyof T, value: any): any {
        if (!value) {
            return value;
        }

        // If the value is an object w/ a toJSON method, toJSON is called before
        // the replacer runs, so we use this[key] to get the non-toJSONed value.
        const origValue = this[key];
        if (isClassInstance(origValue) || typeof origValue === 'function') {
            return `@__${UID}-${escapedValues.push(origValue) - 1}__@`;
        } else {
            return value;
        }
    }

    let str = JSON.stringify(thing, replacer as any, 2);

    // Protects against `JSON.stringify()` returning `undefined`, by serializing
    // to the literal string: "undefined".
    if (typeof str !== 'string') {
        return String(str);
    }

    // Replace unsafe HTML and invalid JavaScript line terminator chars with
    // their safe Unicode char counterpart. This _must_ happen before the
    // regexps and functions are serialized and added back to the string.
    str = str.replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);

    if (escapedValues.length === 0) {
        return str;
    } else {
        // Replaces all occurrences of placeholders in the
        // JSON string with their string representations. If the original value can
        // not be found, then `undefined` is used.
        return str.replace(PLACE_HOLDER_REGEXP, (_, valueIndex) => serialize(escapedValues[valueIndex as any]));
    }
}

function serializeSet(value: Set<any>) {
    const valuesArray: string[] = [];
    value.forEach(v => valuesArray.push(serialize(v)));
    return `new Set([${valuesArray.join(', ')}])`;
}

function serializeMap(map: Map<any, any>): string {
    const valuesArray: string[] = [];
    map.forEach((value, key) => valuesArray.push(`[${serialize(key)}, ${serialize(value)}]`));
    return `new Map([${valuesArray.join(', ')}])`;
}

function serializeDate(value: Date) {
    return `new Date("${value.toISOString()}")`;
}

function serializeBuffer(value: Buffer) {
    return `Buffer.from("${value.toString()}")`;
}

function serializeClassInstance(instance: any): string {
    const constructor: ClassConstructor = instance.constructor;
    const params = getParamList(constructor);
    const paramValues = params.map(param => serialize(instance[param]));
    const newExpression = `new ${constructor.name}(${paramValues.join(', ')})`;
    return newExpression;
}

function serializeFunction(fn: Function) {
    const serializedFn = fn.toString();

    if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) {
        throw new TypeError(`Cannot serialize native function: ${fn.name}`);
    }

    return serializedFn;
}
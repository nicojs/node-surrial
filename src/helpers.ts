import ClassConstructor from './ClassConstructor';

export function isClassInstance(thing: any) {
    return typeof thing === 'object' && thing && thing.constructor && thing.constructor !== Object;
}

function isEcmaScriptClass(constructor: ClassConstructor) {
    return constructor.toString().startsWith('class');
}

export function getParamList(constructor: ClassConstructor): string[] {
    let parametersMatch: RegExpMatchArray | null = null;
    if (isEcmaScriptClass(constructor)) {
        parametersMatch = constructor.toString().match(/constructor[^(]*\(([^)]*)\)/);
    } else {
        parametersMatch = constructor.toString().match(/function[^(]*\(([^)]*)\)/);
    }
    if (!parametersMatch) {
        throw new Error(`Constructor function "${constructor.name}" could not be serialized. Constructor was: ${constructor.toString()}`);
    } else {
        return parametersMatch[1].split(',')
            .map(param => param.trim());
    }
}

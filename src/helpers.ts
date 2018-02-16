import ClassConstructor from './ClassConstructor';

export function isClassInstance(thing: any) {
    return typeof thing === 'object' && thing && thing.constructor && thing.constructor !== Object;
}

function isEcmaScriptClass(constructor: ClassConstructor) {
    return constructor.toString().startsWith('class');
}

export function getParamList(constructor: ClassConstructor): string[] {

    const splitParams = (params: string) =>
        params.split(',').map(param => param.trim());

    const constructorString = constructor.toString();
    if (isEcmaScriptClass(constructor)) {
        const parametersMatch = constructorString.match(/constructor[^(]*\(([^)]*)\)/);
        if (parametersMatch) {
            return splitParams(parametersMatch[1]);
        } else {
            // Constructor is optional in an es6 class
            return [];
        }
    } else {
        const parametersMatch = constructorString.match(/function[^(]*\(([^)]*)\)/);
        if (parametersMatch) {
            return splitParams(parametersMatch[1]);
        } else {
            throw new Error(`Constructor function "${constructor.name}" could not be serialized. Class was defined as: ${constructor.toString()}`);
        }
    }
}

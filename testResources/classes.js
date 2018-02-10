
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = 42;
    }
}

const externalName = 'ExternalPerson';
Person.$moduleName = __filename;
Person.$exportName = externalName;
exports[externalName] = Person;
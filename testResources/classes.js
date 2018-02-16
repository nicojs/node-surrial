'use strict';

class ESPerson {
    constructor(name, age) {
        this.name = name;
        this.age = 42;
    }
}

function PrototypePerson(name, age) {
    this.name = name;
    this.age = age;
}

class ConstructorLessClass {
}

exports.ESPerson = ESPerson;
exports.PrototypePerson = PrototypePerson;
exports.ConstructorLessClass = ConstructorLessClass;
exports.NamelessClass = class { };
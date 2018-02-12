
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

exports.ESPerson = ESPerson;
exports.PrototypePerson = PrototypePerson;
export default interface ClassConstructor {
    name: string;
    new(...params: any[]): any;
}
import { Output } from "./Output";
import { TypeDefinition } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";

export abstract class View<T> {
    private id: string;
    constructor(protected evalContext: Eval, id: string) {
        this.id = id; 
    }

    abstract build(expr: T, type: TypeDefinition, attributes: { [key: string]: string }): void;
    abstract render(output: Output): void;
    abstract getValue(): any;
    getId(): string { return this.id; }

}



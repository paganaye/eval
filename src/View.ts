import { Output } from "./Output";
import { TypeDefinition } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";

export abstract class View<TValue,TTypeDefinition extends TypeDefinition> {
    constructor(protected evalContext: Eval, private readonly id: string) {
        this.id = id; 
    }
    getId(): string { return this.id; }
    abstract build(data: TValue, type: TTypeDefinition, attributes: { [key: string]: string }): void;
    abstract render(output: Output): void;
    abstract getValue(): TValue;
}



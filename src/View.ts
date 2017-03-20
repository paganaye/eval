import { Output } from "./Output";
import { Type } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";

export abstract class View<TValue, TType extends Type> {
    private readonly id: string;

    constructor(protected evalContext: Eval) {
        var prefix = (this as object).constructor.name;
        this.id = evalContext.nextId(prefix);
    }

    getId(): string { return this.id; }
    abstract build(data: TValue, type: TType, attributes: { [key: string]: string }): void;
    abstract render(output: Output): void;
    abstract getValue(): TValue;
}



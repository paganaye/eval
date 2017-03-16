import { Output } from "./Output";
import { TypeDefinition } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";

export abstract class View<T> {
   constructor(protected evalContext: Eval) { }
   abstract build(expr: T, type: TypeDefinition, attributes: { [key: string]: string }): void;   
   abstract render(output: Output): void;
}



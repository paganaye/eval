import { Output } from "./Output";
import { TypeDefinition } from "./Types";
import { Expression } from './Expression';
import { Eval } from "./Eval";

export abstract class View<T> {
   constructor(protected evalContext: Eval) { }
   abstract render(expr: T, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void;
}



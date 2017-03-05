import { Output } from "./Output";
import { TypeDefinition } from "./Types";
import { Expression } from './Expression';

export abstract class View<T> {
   abstract render(expr: T, type: TypeDefinition, output: Output): void;
}



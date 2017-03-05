import { Output } from "./Output";
import { TypeDefinition } from "./Types";

export abstract class View<T> {
   abstract render(expr: T, type: TypeDefinition, output: Output): void;
}



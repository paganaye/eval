import { Eval } from "./Eval";
import { Expression } from './Expression';
import { ParameterDefinition } from './EvalFunction';
import { Output } from "src/Output";

export abstract class Command {
   constructor(protected readonly evalContext: Eval) { }
   abstract getParameters(): ParameterDefinition[];
   abstract run(output: Output): void;
}

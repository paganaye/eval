import { Eval } from "./Eval";
import { Expression } from './Expression';
import { ParameterDefinition, CommandDescription } from './EvalFunction';
import { Output } from "./Output";

export abstract class Command {
   constructor(protected readonly evalContext: Eval) { }
   abstract getDescription(): CommandDescription;
   abstract run(output: Output): void;
}

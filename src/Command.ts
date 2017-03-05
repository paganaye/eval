import { Eval } from "./Eval";
import { Expression } from './Expression';
import { ParameterDefinition } from './EvalFunction';

export abstract class Command {
   abstract getParameters(): ParameterDefinition[];
   abstract run(evalContext: Eval): void;
}

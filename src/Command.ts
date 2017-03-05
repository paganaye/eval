import { Context } from "./Context";
import { Expression } from './Expression';
import { ParameterDefinition } from './EvalFunction';

export abstract class Command {
   abstract getParameters(): ParameterDefinition[];
   abstract run(context: Context): void;
}

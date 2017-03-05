import { Context } from "./Context";
import { Subscriber, Expression } from './Expression';
import { Type } from './Types';

export abstract class EvalFunction<T> {
   abstract getParameters(): ParameterDefinition[];
   abstract calcValue(context: Context): T;
}

export class ParameterDefinition {
   constructor(readonly name: string, readonly type: Type, readonly description?: string) {
   }
}

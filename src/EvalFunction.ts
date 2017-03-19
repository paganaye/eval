import { Eval } from "./Eval";
import { Subscriber, Expression } from './Expression';
import { Type } from './Types';

export abstract class EvalFunction<T> {
   constructor(protected parent: Expression<any>) { }
   abstract getParameters(): ParameterDefinition[];
   abstract calcValue(evalContext: Eval): T;
   protected valueChanged() {
   }
}

export class ParameterDefinition {
   constructor(readonly name: string,
      readonly type: Type | String,
      readonly description?: string,
      readonly multiple?: boolean) {
   }
}

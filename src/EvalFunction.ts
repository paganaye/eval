import { Eval } from "./Eval";
import { Subscriber, Expression } from './Expression';
import { Type } from './Types';

export abstract class EvalFunction<T> {
   constructor(protected parent: Expression<any>) { }
   abstract getDescription(): CommandDescription;
   abstract calcValue(evalContext: Eval): T;
   protected valueChanged() {
   }
}

export class CommandDescription {
   public parameters: ParameterDefinition[] = [];

   addParameter(name: string, type: Type | String, description?: string, multiple?: boolean): CommandDescription {
      this.parameters.push(new ParameterDefinition(name, type, description, multiple));
      return this;
   }
}

export class ParameterDefinition {
   constructor(readonly name: string,
      readonly type: Type | String,
      readonly description?: string,
      readonly multiple?: boolean) {
   }
}

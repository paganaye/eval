import { EvalFunction, ParameterDefinition } from '../EvalFunction';
// import { Type } from "../Types";
import { Eval } from "../Eval";

export class AbsFunction extends EvalFunction<Number> {
   private arg1: number;

   getParameters(): ParameterDefinition[] {
      return [{ name: "arg1", type: "number" }];
   }

   calcValue(evalContext: Eval): number {
      return Math.abs(this.arg1)
   }
}

export class RoundFunction extends EvalFunction<Number> {
   private arg1: number;

   getParameters(): ParameterDefinition[] {
      return [{ name: "arg1", type: "number" }];
   }

   calcValue(evalContext: Eval): number {
      return Math.round(this.arg1)
   }
}

export class RandomFunction extends EvalFunction<Number> {
   value: Number = Math.random();

   getParameters(): ParameterDefinition[] {
      return [];
   }

   calcValue(evalContext: Eval) {
      return this.value;
   }
}


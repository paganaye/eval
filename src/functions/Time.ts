import { EvalFunction, ParameterDefinition } from "../EvalFunction";
import { Type } from "../Types";
import { Eval } from "../Eval";


export class NowFunction extends EvalFunction<number> {

   getParameters(): ParameterDefinition[] {
      return [];
   }

   calcValue(evalContext: Eval): number {
      return new Date().getTime();
   }
}


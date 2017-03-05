import { EvalFunction, ParameterDefinition } from '../EvalFunction';
// import { Type } from "../Types";
import { Eval } from "../Eval";

// class SingleNumberParameter {
//    arg1 = new FunctionParameter<number>();
// }

// export class AbsFunction extends EvalFunction<SingleNumberParameter> {
//    createParameters() {
//       return new SingleNumberParameter();
//    }

//    evalContext(evalContext: Eval, parameters: SingleNumberParameter) {
//       var result = parameters.arg1.getValue(evalContext);
//       return Math.abs(result);
//    }
// }

export class AbsFunction extends EvalFunction<Number> {
   private arg1: number;

   getParameters(): ParameterDefinition[] {
      return [{ name: "arg1", type: "number" }];
   }

   calcValue(evalContext: Eval): number {
      return Math.abs(this.arg1)
   }
}

// export class RoundFunction extends EvalFunction<SingleNumberParameter> {
//    createParameters() {
//       return new SingleNumberParameter();
//    }

//    evalContext(evalContext: Eval, parameters: SingleNumberParameter) {
//       var result = parameters.arg1.getValue(evalContext);
//       return Math.round(result);
//    }
// }

// class RandomParameters {
//    value: Number = Math.random();
// }

// export class RandomFunction extends EvalFunction<RandomParameters> {

//    createParameters() {
//       return new RandomParameters();
//    }

//    evalContext(evalContext: Eval, parameters: RandomParameters) {
//       return parameters.value;
//    }
// }


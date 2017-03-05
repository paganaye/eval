import { EvalFunction, ParameterDefinition } from '../EvalFunction';
// import { Type } from "../Types";
import { Context } from "../Context";

// class SingleNumberParameter {
//    arg1 = new FunctionParameter<number>();
// }

// export class AbsFunction extends EvalFunction<SingleNumberParameter> {
//    createParameters() {
//       return new SingleNumberParameter();
//    }

//    eval(context: Context, parameters: SingleNumberParameter) {
//       var result = parameters.arg1.getValue(context);
//       return Math.abs(result);
//    }
// }

export class AbsFunction extends EvalFunction<Number> {
   private arg1: number;

   getParameters(): ParameterDefinition[] {
      return [{ name: "arg1", type: "number" }];
   }

   calcValue(context: Context): number {
      return Math.abs(this.arg1)
   }
}

// export class RoundFunction extends EvalFunction<SingleNumberParameter> {
//    createParameters() {
//       return new SingleNumberParameter();
//    }

//    eval(context: Context, parameters: SingleNumberParameter) {
//       var result = parameters.arg1.getValue(context);
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

//    eval(context: Context, parameters: RandomParameters) {
//       return parameters.value;
//    }
// }


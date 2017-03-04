import { EvalFunction, FunctionParameter } from '../EvalFunction';
import { Type } from '../Types';
import { Context } from '../Context';

class AbsParameters {
   arg1 = new FunctionParameter<number>();
}

export class AbsFunction extends EvalFunction<AbsParameters> {
   createParameters() {
      return new AbsParameters();      
   }

   eval(context: Context, parameters: AbsParameters) {
      var result = parameters.arg1.getValue(context);
      return Math.abs(result);
   }
}


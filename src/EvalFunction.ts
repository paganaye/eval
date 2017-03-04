import { Context } from './Context';

export abstract class EvalFunction<TParameters> {
   abstract createParameters(): TParameters;
   abstract eval(context: Context, parameters: TParameters): any;
}

export class FunctionParameter<T> {
   value: T;

   public constructor(private options?: any) {
   }

   getValue(context: Context): T {
      return this.value;
   }

   setValue(newValue: T) {
      this.value = newValue;
   }
}

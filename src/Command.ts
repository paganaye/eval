import { ParameterDefinition } from './ParameterDefinition';
import { Context } from './Context';

export abstract class Command<TParameters> {
   abstract getName(): string;
   abstract createParameters(): TParameters;
   abstract run(context: Context, parameters: TParameters): void;
}

export class CommandParameter<T> {
   value: T;

   public constructor(private options?: any) {
   }

   getValue(): T {
      return this.value;
   }

   setValue(newValue: T) {
      this.value = newValue;
   }
}

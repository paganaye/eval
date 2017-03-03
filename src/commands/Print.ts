import { Command, CommandParameter } from '../Command';
import { ParameterDefinition } from '../ParameterDefinition';
import { Type } from '../Types';
import { Context } from '../Context';

class PrintParameters {
   model = new CommandParameter<any>();
   type = new CommandParameter<Type>();
}

export class Print extends Command<PrintParameters> {

   createParameters() {
      return new PrintParameters();
   }

   run(context: Context, parameters: PrintParameters) {
      var model = parameters.model.getValue(context);
      var type = parameters.type.getValue(context);
      context.print(model, type);
   }
}


import { Command, CommandParameter } from '../Command';
import { app } from '../App';
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
      app.print(model, type);
   }
}


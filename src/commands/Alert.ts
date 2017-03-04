import { Command, CommandParameter } from "../Command";
import { Type } from "../Types";
import { Context } from "../Context";

class AlertParameters {
   model = new CommandParameter<any>();
   type = new CommandParameter<Type>();
}

export class Alert extends Command<AlertParameters> {

   createParameters() {
      return new AlertParameters();
   }

   run(context: Context, parameters: AlertParameters) {
      var model = parameters.model.getValue(context);
      var type = parameters.type.getValue(context);
      alert(context.stringify(model, type));
   }
}


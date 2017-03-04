import { Command, CommandParameter } from "../Command";
import { Type } from "../Types";
import { Context } from "../Context";

class AssignParameters {
   variableName = new CommandParameter<string>();
   variableValue = new CommandParameter<any>();
}

export class Assign extends Command<AssignParameters> {

   createParameters() {
      return new AssignParameters();
   }

   run(context: Context, parameters: AssignParameters) {
      var name = parameters.variableName.getValue(context);
      var value = parameters.variableValue.getValue(context);
      context.setVariable(name, value);
   }
}


import { Command } from "../Command";
import { Type } from "../Types";
import { Context } from "../Context";

export class Assign extends Command {
   variableName: string;
   variableValue: any;

   getParameters() {
      return [
         { name: "variableName", type: "string" },
         { name: "variableValue", type: "any" }];
   }


   run(context: Context) {
      context.setVariable(this.variableName, this.variableValue);
   }
}


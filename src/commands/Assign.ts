import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";

export class Assign extends Command {
   variableName: string;
   variableValue: any;

   getParameters() {
      return [
         { name: "variableName", type: "string" },
         { name: "variableValue", type: "any" }];
   }

   run(evalContext: Eval) {
      evalContext.setVariable(this.variableName, this.variableValue);
   }
}


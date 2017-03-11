import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Output } from "src/Output";

export class Assign extends Command {
   variableName: string;
   variableValue: any;

   getParameters() {
      return [
         { name: "variableName", type: "string" },
         { name: "variableValue", type: "any" }];
   }

   run(output: Output) {
      this.evalContext.setVariable(this.variableName, this.variableValue);
   }
}


import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';

export class Input extends Command {
   private variableName: any;
   private type: Type;

   getParameters(): ParameterDefinition[] {
      return [
         { name: "variableName", type: "string" },
         { name: "type", type: "Type" }];
   }

   run(evalContext: Eval) {
      evalContext.input(this.variableName, this.type);
   }
}


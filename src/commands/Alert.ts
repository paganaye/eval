import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';

export class Alert extends Command {
   private data: string;
   private type: Type;

   getParameters(): ParameterDefinition[] {
      return [{ name: "data", type: "string" }];
   }

   run(evalContext: Eval) {
      alert(this.data);
   }
}


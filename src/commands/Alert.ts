import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Output } from "../Output";

export class Alert extends Command {
   private data: string;
   private type: Type;

   getParameters(): ParameterDefinition[] {
      return [{ name: "data", type: "string" }];
   }

   run(output: Output) {
      alert(this.data);
   }
}


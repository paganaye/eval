import { Command } from "../Command";
import { Type } from "../Types";
import { Context } from "../Context";
import { ParameterDefinition } from '../EvalFunction';

export class Alert extends Command {
   private data: string;
   private type: Type;

   getParameters(): ParameterDefinition[] {
      return [{ name: "data", type: "string" }];
   }

   run(context: Context) {
      alert(this.data);
   }
}


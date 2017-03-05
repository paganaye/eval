import { Command } from "../Command";
import { Type } from "../Types";
import { Context } from "../Context";
import { ParameterDefinition } from '../EvalFunction';

export class Print extends Command {
   private data: any;
   private type: Type;

   getParameters(): ParameterDefinition[] {
      return [
         { name: "data", type: "any" },
         { name: "type", type: "Type" }];
   }

   run(context: Context) {
      //var expr = parameters.expr.getValue(context);
      //var type = this.type || expr.getType(context);
      context.print(this.data, this.type);
   }
}


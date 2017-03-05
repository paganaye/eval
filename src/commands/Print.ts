import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';

export class Print extends Command {
   private data: any;
   private type: Type;

   getParameters(): ParameterDefinition[] {
      return [
         { name: "data", type: "any" },
         { name: "type", type: "Type" }];
   }

   run(evalContext: Eval) {
      //var expr = parameters.expr.getValue(evalContext);
      //var type = this.type || expr.getType(evalContext);
      evalContext.print(this.data, this.type);
   }
}


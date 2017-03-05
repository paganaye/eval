import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Expression } from '../Expression';

export class Print extends Command {
   private data: Expression<any>[];

   getParameters(): ParameterDefinition[] {
      return [
         { name: "data", type: "Expression", multiple: true }];
   }

   run(evalContext: Eval) {
      evalContext.output.print(this.data);
   }
}


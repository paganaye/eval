import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Expression } from '../Expression';


export class Hello extends Command {
   who: Expression<string>;

   getParameters() {
      return [{ name: "who", type: "Expression" }];
   }

   run(evalContext: Eval) {
      evalContext.output.print(this.who);
   }
}

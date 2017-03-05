import { Command } from "../Command";
import { Type } from "../Types";
import { Context } from "../Context";
import { Expression } from '../Expression';


export class Hello extends Command {
   who: Expression<string>;

   getParameters() {
      return [{ name: "who", type: "Expression" }];
   }

   run(context: Context) {
      context.print(this.who);
   }
}

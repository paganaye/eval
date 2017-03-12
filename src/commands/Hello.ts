import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Expression } from '../Expression';
import { Output } from "../Output";


export class Hello extends Command {
   who: Expression<string>;

   getParameters() {
      return [{ name: "who", type: "Expression" }];
   }

   run(output: Output) {
      output.print(this.who, null);
   }
}

import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Expression } from '../Expression';
import { Output } from "../Output";
import { View } from "../View";


export class Hello extends Command {
   who: Expression<string>;
   innerView: View<any, any>;

   getParameters() {
      return [{ name: "who", type: "Expression" }];
   }

   run(output: Output) {
      this.innerView = this.evalContext.getViewForExpr(this.who, null, true);
      this.innerView.render(output);

   }
}

import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Expression } from '../Expression';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { ViewOptions } from "Theme";


export class Hello extends Command {
   who: Expression<string>;
   innerView: AnyView;

   getParameters() {
      return [{ name: "who", type: "Expression" }];
   }

   run(output: Output) {
      this.innerView = this.evalContext.getViewForExpr(this.who, null, null, true);
      this.innerView.render(output);
   }

   runTests(output: Output): void {

   }
}

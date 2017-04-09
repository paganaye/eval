import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Expression } from '../Expression';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { ViewOptions } from "../Theme";
import { CommandDescription } from "../EvalFunction";


export class Hello extends Command {
   who: Expression<string>;
   innerView: AnyView;

   getDescription(): CommandDescription {
      return new CommandDescription()
         .addParameter("who", "Expression", "");
   }

   run(output: Output) {
      this.innerView = this.evalContext.instantiate(this.who, null, null, true);
      this.innerView.render(output);
   }

   runTests(output: Output): void {

   }
}

import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Expression } from '../Expression';
import { Output, RenderMode } from "../Output";
import { View, AnyView } from "../View";
import { PrintArgs } from "../Theme";
import { CommandDescription } from "../EvalFunction";


export class Hello extends Command {
   who: Expression<string>;
	innerView: AnyView;

   run(output: Output) {
      this.innerView = this.evalContext.instantiate(null, "hello::", this.who, null, RenderMode.Edit);
      this.innerView.render(output);
   }

   runTests(output: Output): void {

   }
}
Command.registerCommand("hello",{
	getNew: () => new Hello(),
	description: new CommandDescription()
         .addParameter("who", "Expression")
});

import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Output } from "../Output";


export class Tests extends Command {

   getDescription(): CommandDescription {
      return new CommandDescription()
         .addParameter("data", "Expression", "", true);
   }

   run(output: Output) {
      output.printTag("h1", {}, "Commands");
      for (var c in this.evalContext.commands) {
         var commandFactory = this.evalContext.commands[c];
         output.printTag("h2", {}, c);
         try {
            output.printAsync("div", {}, "Test pending...", (elt, output) => {
               setTimeout(() => {
                  try {
                     var commandInstance = commandFactory(this.evalContext);
                     commandInstance.runTests(output);
                     output.printTag("p", {}, "Test Complete");
                  } catch (error) {
                     output.printTag("p", { class: "error" }, error);
                  }
                  output.render();
               }, 2500);
            })
         } catch (error) {
            output.printTag("p", { class: "error" }, error);
         }
      }
      output.printTag("h1", {}, "Functions");
      for (var c in this.evalContext.functions) {
         var evalFunctionFactory = this.evalContext.functions[c];
         output.printTag("h2", {}, c);
         try {
            output.printAsync("div", {}, "Test pending...", (elt, output) => {
               setTimeout(() => {
                  try {
                     var functionInstance = evalFunctionFactory(null);
                     var result = functionInstance.calcValue(this.evalContext);
                     output.printTag("p", {}, "Tests Complete");
                  } catch (error) {
                     output.printTag("p", { class: "error" }, error);
                  }
                  output.render();
               }, 2500);
            })
         } catch (error) {
            output.printTag("p", { class: "error" }, error);
         }
      }
   }

   runTests(output: Output): void {

   }
}

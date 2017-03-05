import { Command } from "./Command";
import { Eval } from "./Eval";
import { Expression, FunctionCall } from './Expression';

export class CommandCall {
   private command: Command;

   constructor(private evalContext: Eval, private source: string, private commandName, private expressions: { [key: string]: Expression<any> }) {
      var getNew = this.evalContext.commands[commandName.toLowerCase()];
      if (!getNew) {
         throw "Unknown command " + commandName;
      }
      this.command = getNew(evalContext);
   }

   getName() {
      return this.commandName;
   }

   getSource() {
      return this.source;
   }

   getCommand(): Command {
      return this.command;
   }

   getParameters(): { [key: string]: Expression<any> } {
      return this.expressions;
   }

   run(evalContext: Eval) {
      FunctionCall.applyParameters(evalContext, this.command.getParameters(), this.expressions, this.command, "command " + this.commandName);
      this.command.run(this.evalContext)
   }
}

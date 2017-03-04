import { Command, CommandParameter } from "./Command";
import { Context } from "./Context";
import { Expression } from './Expression';

export class CommandCall {
   private command: Command<any>;

   constructor(private context: Context, private source: string, private commandName, private parameters: { [key: string]: Expression }) {
      this.command = this.context.commands[commandName.toLowerCase()];
      if (!this.command) {
         throw "Unknown command " + commandName;
      }

   }

   getName() {
      return this.commandName;
   }

   getSource() {
      return this.source;
   }

   getCommand(): Command<any> {
      return this.command;
   }

   getParameters(): { [key: string]: Expression } {
      return this.parameters;
   }

   getParamValues(context: Context): any {
      // TODO: we could be doing some of this in the constructor
      var paramValues = this.command.createParameters();
      var keys = Object.keys(paramValues);
      for (var idx in this.parameters) {
         var paramExpression = this.parameters[idx];
         var isNumber = /^[0-9]+$/.test(idx);
         if (isNumber) {
            var key = keys[idx] as string;
         } else key = idx;
         var actualValue = paramExpression.getValue(context);
         var param = (paramValues[key] as CommandParameter<any>);
         if (param instanceof CommandParameter) param.setValue(actualValue);
         else throw "Parameter " + (isNumber ? (parseInt(idx) + 1).toString() : key) + " does not exist in command " + this.commandName + ".";
      }
      return paramValues;
   }

   run(context: Context) {
      this.command.run(this.context, this.getParamValues(context))
   }
}

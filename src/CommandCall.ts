import { Command, CommandParameter } from './Command';
import { Context } from './Context';
import { ExpressionNode } from './Parser';

export class CommandCall {
   private command: Command<any>;

   constructor(private context: Context, private source: string, private commandName, private parameters: { [key: string]: ExpressionNode }) {
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

   getParameters(): { [key: string]: ExpressionNode } {
      return this.parameters;
   }

   getParamValues(context: Context): any {
      var paramValues = this.command.createParameters();
      var keys = Object.keys(paramValues);
      for (var i in this.parameters) {
         var paramExpression = this.parameters[i];
         if (/[0-9]+/.test(i)) {
            i = keys[i];
         }
         var actualValue = paramExpression.getValue(context);
         (paramValues[i] as CommandParameter<any>).setValue(actualValue);
      }
      return paramValues;
   }

   run(context: Context) {
      this.command.run(this.context, this.getParamValues(context))
   }
}

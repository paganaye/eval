import { Command, CommandParameter } from './Command';
import { ParameterDefinition } from './ParameterDefinition';
import { Context } from './Context';
import { ExpressionNode } from './Parser';

export class CommandCall {

   constructor(private context: Context, private source: string, private command: Command<any>, private parameters: { [key: string]: ExpressionNode }) {
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

   run() {
      debugger;
      var paramValues = this.command.createParameters();
      var keys = Object.keys(paramValues);
      for (var i in this.parameters) {
         var paramExpression = this.parameters[i];
         if (/[0-9]+/.test(i)) {
            i = keys[i];
         }
         var actualValue = paramExpression.getValue();
         (paramValues[i] as CommandParameter<any>).setValue(actualValue);
      }
      this.command.run(this.context, paramValues)
   }
}

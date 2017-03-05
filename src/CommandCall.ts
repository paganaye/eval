import { Command } from "./Command";
import { Context } from "./Context";
import { Expression, FunctionCall } from './Expression';

export class CommandCall {
   private command: Command;

   constructor(private context: Context, private source: string, private commandName, private expressions: { [key: string]: Expression<any> }) {
      var getNew = this.context.commands[commandName.toLowerCase()];
      if (!getNew) {
         throw "Unknown command " + commandName;
      }
      this.command = getNew(context);
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

   // getParamsObject(context: Context): any {
   //    // TODO: we could be doing some of this in the constructor
   //    var keys = Object.keys(paramsObject);
   //    for (var idx in this.parameters) {
   //       var paramExpression = this.parameters[idx];
   //       var isNumber = /^[0-9]+$/.test(idx);
   //       if (isNumber) {
   //          var key = keys[idx] as string;
   //       } else key = idx;
   //       var param = (paramsObject[key] as CommandParameter<any>);
   //       if (param instanceof CommandParameter) param.setExpr(paramExpression);
   //       else throw "Parameter " + (isNumber ? (parseInt(idx) + 1).toString() : key) + " does not exist in command " + this.commandName + ".";
   //    }
   //    return paramsObject;
   // }

   run(context: Context) {
      FunctionCall.applyParameters(context, this.command.getParameters(), this.expressions, this.command, "command " + this.commandName);
      this.command.run(this.context)
   }
}

import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Output } from "../Output";

export class Alert extends Command {
   private data: string;
   private type: Type;

   getDescription(): CommandDescription {
      return new CommandDescription()
         .addParameter("data", "string");
   }

   run(output: Output) {
      alert(this.data);
   }

   runTests(output: Output): void {

   }
}
Command.registerCommand("alert",() =>new Alert())

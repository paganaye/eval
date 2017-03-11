import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';

export class Crud extends Command {
   private tableName: string;
   private recordId: string;

   constructor(private commandName: string) {
      super();
   }

   getParameters(): ParameterDefinition[] {
      return [
         { name: "tableName", type: "stringOrVariableName" },
         { name: "recordId", type: "stringOrVariableName" }];
   }

   run(evalContext: Eval) {
      evalContext.getType(evalContext, this.tableName, (type) => {
         switch (this.commandName.toLowerCase()) {
            case "create":
               evalContext.output.print({}, type);
               break;
            case "read":
            case "update":
            case "delete":
               var id = evalContext.nextId();
               evalContext.output.printTag("div", { id: id }, "Loading " + this.tableName + " " + JSON.stringify(this.recordId) + "...");
               evalContext.afterRender(() => {
                  var res = evalContext.database.on(evalContext, this.tableName + "/" + this.recordId, (evalContext, data, error) => {
                     var elt = document.getElementById(id);
                     elt.innerText += "Result:" + JSON.stringify(data);
                  });
                  evalContext.afterClear(() => {
                     res.off();
                  })
               });
               break;
            default:
               throw "unknown command " + this.commandName;
         }
      });

   }
}

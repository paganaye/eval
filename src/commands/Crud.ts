import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Expression } from '../Expression';

export class Crud extends Command {
   private tableName: string;
   private args: Expression<any>[];

   constructor(private commandName: string) {
      super();
   }

   getParameters(): ParameterDefinition[] {
      return [
         { name: "tableName", type: "stringOrVariableName" },
         { name: "args", type: "Expression", multiple: true }];
   }

   run(evalContext: Eval) {
      debugger;
      switch (this.commandName.toLowerCase()) {
         case "create":
         case "read":
         case "update":
         case "delete":
            var id = evalContext.output.nextId();
            evalContext.output.printTag("div", { id: id }, "Loading...");
            evalContext.afterRender(() => {
               var tableName: any = this.tableName;
               if (tableName instanceof Expression) {
                  tableName = tableName.getValue(evalContext);
               }
               var recordId = this.args[0].getValue(evalContext);
               var res = evalContext.database.on(tableName + "/" + recordId, (data, error) => {
                  var elt = document.getElementById(id);
                  elt.innerText = JSON.stringify(data);
               });
               evalContext.afterClear(() => {
                  res.off();
               })
            });
            break;
         default:
            throw "unknown command " + this.commandName;
      }
      debugger;
      if (this.args) {
         evalContext.output.startTag("div", {});
         evalContext.output.printHTML("Hi " + JSON.stringify(this.args));
         evalContext.output.endTag("div");
      }
      else {
         evalContext.output.startTag("div", {});
         evalContext.output.printTag("H1", {}, "Creating a new page");
         evalContext.output.endTag("div");
      }
   }
}
/*
import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";

export class Load extends Command {
      path: string;
      type: string;

      getParameters() {
            return [
                  { name: "path", type: "string" },
                  { name: "type", type: "string" }];
      }

      run(evalContext: Eval) {
            var id = evalContext.output.nextId();
            evalContext.output.printTag("div", { id: id }, "Loading...");
            evalContext.afterRender(() => {
                  var res = evalContext.database.on(this.path, (data, error) => {
                        var elt = document.getElementById(id);
                        elt.innerText = JSON.stringify(data);
                  });
                  evalContext.afterClear(() => {
                        res.off();
                  })
            });
      }
}


 */

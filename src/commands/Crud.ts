import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";

export class Crud extends Command {
      private tableName: string;
      private recordId: string;

      constructor(evalContext: Eval, private commandName: string) {
            super(evalContext);
      }

      getParameters(): ParameterDefinition[] {
            return [
                  { name: "tableName", type: "stringOrVariableName" },
                  { name: "recordId", type: "stringOrVariableName" }];
      }

      run(output: Output) {
            var output2 = output.printDynamic("div", {}, this.commandName + " " + this.tableName + " " + this.recordId);
            this.evalContext.getType(this.tableName, (type) => {
                  switch (this.commandName.toLowerCase()) {
                        case "create":
                              // this should
                              output2.setEditMode(true);
                              output2.printForm({ buttons: ["Save"] }, () => {
                                    output2.print({}, type, {});
                              });
                              break;
                        case "read":
                              output2.print({}, type, {});

                        case "update":
                        case "delete":
                              // output.printDynamic("div", {}, "Loading " + this.tableName + " " + JSON.stringify(this.recordId) + "...", (output) => {
                              //       var res = this.evalContext.database.on(this.tableName + "/" + this.recordId, (data, error) => {
                              //             output.printText("Result:" + JSON.stringify(data));
                              //       });
                              //       this.evalContext.afterClear(() => {
                              //             res.off();
                              //       })
                              // });
                              break;
                        default:
                              throw "unknown command " + this.commandName;
                  }
                  output2.render();
            });

      }
}

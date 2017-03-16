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
            this.evalContext.getTableType(this.tableName, (type) => {
                  switch (this.commandName.toLowerCase()) {
                        case "create":
                              // this should
                              output2.setEditMode(true);
                              output2.printForm({ buttons: ["Save"] }, () => {
                                    output2.print({}, type, {});
                              });
                              output2.render();
                              location.hash = ("create " + this.tableName);
                              break;
                        case "read":
                              this.evalContext.database.on("tables/" + this.tableName + "/" + this.recordId, (data, error) => {
                                    output2.print(data, type, {});
                                    output2.render();
                              })
                              location.hash = ("read " + this.tableName + " " + this.recordId);
                              break;
                        case "update":
                              this.evalContext.database.on("tables/" + this.tableName + "/" + this.recordId, (data, error) => {
                                    output2.setEditMode(true);
                                    output2.print(data, type, {});
                                    output2.printSection({ name: "" }, (options) => {
                                          output2.printButton({}, "Save", () => {
                                                debugger;
                                                alert("saving..." + JSON.stringify(data));
                                          });
                                    });
                                    output2.render();
                              })
                              location.hash = ("update " + this.tableName + " " + this.recordId);
                              break;
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
            });

      }
}

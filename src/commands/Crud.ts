import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View } from "../View";
import { ElementAttributes } from "Theme";

export class Crud extends Command {
      private tableName: string;
      private recordId: string;
      private innerView: View<any, Type, ElementAttributes>;

      constructor(evalContext: Eval, private commandName: string) {
            super(evalContext);
      }

      getParameters(): ParameterDefinition[] {
            return [
                  { name: "tableName", type: "stringOrVariableName" },
                  { name: "recordId", type: "stringOrVariableName" }];
      }

      run(output: Output) {
            var output2 = output.printAsync("div", {}, this.commandName + " " + this.tableName + " " + this.recordId, (elt) => {
                  //alert("yes?");
            });
            this.evalContext.getTableType(this.tableName, (type) => {
                  switch (this.commandName.toLowerCase()) {
                        case "create":
                              // this should
                              output2.setEditMode(true);
                              output2.printForm({ buttons: ["Save"] }, () => {
                                    this.innerView = this.evalContext.getViewForExpr({}, type, true);
                                    this.innerView.render(output2);
                              });
                              output2.render();
                              location.hash = ("create " + this.tableName);
                              break;
                        case "read":
                              this.evalContext.database.on("tables/" + this.tableName + "/" + this.recordId, (data, error) => {
                                    this.innerView = this.evalContext.getViewForExpr(data, type, false);
                                    this.innerView.render(output2);
                              })
                              location.hash = ("read " + this.tableName + " " + this.recordId);
                              break;
                        case "update":
                              this.evalContext.database.on("tables/" + this.tableName + "/" + this.recordId, (data, error) => {
                                    output2.setEditMode(true);
                                    this.innerView = this.evalContext.getViewForExpr(data, type, true);
                                    this.innerView.render(output2);
                                    output2.printSection({ name: "" }, (attributes) => {
                                          output2.printButton({}, "Save", () => {
                                                var data = this.innerView.getValue();
                                                alert("saving..." + JSON.stringify(data));
                                          });
                                    });
                                    output2.render();
                              })
                              location.hash = ("update " + this.tableName + " " + this.recordId);
                              break;
                        case "delete":
                              // output.printAsync("div", {}, "Loading " + this.tableName + " " + JSON.stringify(this.recordId) + "...", (output) => {
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

import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { PrintArgs } from "../Theme";

export class Crud extends Command {
      private tableName: string;
      private recordId: string;
      private innerView: AnyView;

      constructor(evalContext: Eval, private commandName: string) {
            super(evalContext);
      }

      getDescription(): CommandDescription {
            return new CommandDescription()
                  .addParameter("tableName", "stringOrVariableName")
                  .addParameter("recordId", "stringOrVariableName");
      }

      run(output: Output) {
            this.tableName = (this.tableName || "").toLowerCase();
            this.recordId = (this.recordId || "").toLowerCase();

            output.printAsync("div", {}, this.commandName + " " + this.tableName + " " + this.recordId, (elt, output2) => {
                  var parentView: AnyView = null;

                  this.evalContext.getTableType(this.tableName, (type) => {
                        if (type && !type._kind) type._kind = "object";
                        switch (this.commandName.toLowerCase()) {
                              case "read":
                                    this.evalContext.database.on("tables/" + this.tableName + "/" + this.recordId, (data, error) => {
                                          this.innerView = this.evalContext.instantiate(data, type, parentView, false);
                                          this.innerView.render(output2);
                                          output2.domReplace();
                                    })
                                    location.hash = ("read " + this.tableName + " " + this.recordId);
                                    break;
                              case "update":
                                    if (type._kind == "const") {
                                          output2.printTag("div", {}, type.value);
                                          output2.domReplace();
                                    }
                                    else {
                                          var path = "tables/" + this.tableName + "/" + this.recordId;
                                          var indexPath = "tables/" + this.tableName + "/_index/" + this.recordId;
                                          this.evalContext.database.on(path, (data, error) => {
                                                output2.setEditMode(true);
                                                var isNew: boolean = (data === null);

                                                if (isNew) {
                                                      data = this.evalContext.newInstance(type);
                                                      isNew = true;
                                                }
                                                this.innerView = this.evalContext.instantiate(data, type, parentView, true);
                                                this.innerView.render(output2);
                                                output2.printSection({ name: "crud-update" }, (printArgs) => {
                                                      output2.printButton({ buttonText: "Save" }, () => {
                                                            debugger;
                                                            var data = this.innerView.getValue();
                                                            this.evalContext.database.addUpdate(path, data);
                                                            var json = JSON.stringify(data);
                                                            // var indexData = {
                                                            //       date: new Date().toJSON(),
                                                            //       by: this.evalContext.userName,
                                                            //       size: json.length
                                                            // }
                                                            var indexData = json.length;

                                                            this.evalContext.database.addUpdate(indexPath, indexData);
                                                            this.evalContext.database.runUpdates();
                                                            console.log("eval", "save", this.tableName, this.recordId, json.length + " bytes", data, json);
                                                            alert("saved " + JSON.stringify(data));
                                                      });
                                                });
                                                output2.domReplace();
                                          })
                                          location.hash = ("update " + this.tableName + " " + this.recordId);
                                    }
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
                                    output2.domReplace();
                                    break;
                              default:
                                    throw "unknown command " + this.commandName;
                        }
                  });
            });

      }

      runTests(output: Output): void {

      }
}

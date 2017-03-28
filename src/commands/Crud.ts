import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "../Output";
import { View, AnyView } from "../View";
import { ViewOptions } from "Theme";

export class Crud extends Command {
      private tableName: string;
      private recordId: string;
      private innerView: AnyView;

      constructor(evalContext: Eval, private commandName: string) {
            super(evalContext);
      }

      getDescription(): CommandDescription {
            debugger;
            return new CommandDescription()
                  .addParameter("tableName", "stringOrVariableName", "", true)
                  .addParameter("recordId", "stringOrVariableName", "", true);
      }

      run(output: Output) {
            output.printAsync("div", {}, this.commandName + " " + this.tableName + " " + this.recordId, (elt, output2) => {
                  var parentView: AnyView = null;

                  this.evalContext.getTableType(this.tableName, (type) => {
                        switch (this.commandName.toLowerCase()) {
                              case "create":
                                    // this should
                                    output2.setEditMode(true);
                                    output2.printForm({ buttons: ["Save"] }, (options) => {
                                          this.innerView = this.evalContext.getViewForExpr({}, type, parentView, true);
                                          this.innerView.render(output2);
                                          output2.render();
                                    });
                                    location.hash = ("create " + this.tableName);
                                    break;
                              case "read":
                                    this.evalContext.database.on("tables/" + this.tableName + "/" + this.recordId, (data, error) => {
                                          this.innerView = this.evalContext.getViewForExpr(data, type, parentView, false);
                                          this.innerView.render(output2);
                                          output2.render();
                                    })
                                    location.hash = ("read " + this.tableName + " " + this.recordId);
                                    break;
                              case "update":
                                    var path = "tables/" + this.tableName + "/" + this.recordId;
                                    this.evalContext.database.on(path, (data, error) => {
                                          output2.setEditMode(true);
                                          this.innerView = this.evalContext.getViewForExpr(data, type, parentView, true);
                                          this.innerView.render(output2);
                                          output2.printSection({ name: "crud-update" }, (options) => {
                                                output2.printButton({ buttonText: "Save" }, () => {
                                                      var data = this.innerView.getValue();
                                                      this.evalContext.database.addUpdate(path, data);
                                                      this.evalContext.database.runUpdates();

                                                      // // Get a key for a new Post.
                                                      // var newPostKey = firebase.database().ref().child('posts').push().key;

                                                      // // Write the new post's data simultaneously in the posts list and the user's post list.
                                                      // var updates = {};
                                                      // updates['/posts/' + newPostKey] = postData;
                                                      // updates['/user-posts/' + uid + '/' + newPostKey] = postData;

                                                      // return firebase.database().ref().update(updates);

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
                                    output2.render();
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

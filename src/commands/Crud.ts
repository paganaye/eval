import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Expression } from '../Expression';
import { Type } from '../Types';
import { Output } from "src/Output";

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
            output.printDynamic("div", {}, this.commandName + " " + this.tableName + " " + this.recordId, (output, callback) => {
                  this.evalContext.getType(this.tableName, (type) => {
                        switch (this.commandName.toLowerCase()) {
                              case "create":
                                    output.print({}, type);
                                    break;
                              case "read":
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
                        callback();
                  });
            });

      }
}

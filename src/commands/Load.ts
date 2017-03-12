import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Output } from "../Output";

export class Load extends Command {
      path: string;
      type: string;

      getParameters() {
            return [
                  { name: "path", type: "string" },
                  { name: "type", type: "string" }];
      }

      run(output: Output) {
            // output.printDynamic("div", {}, "Loading...", (output) => {
            //       var res = this.evalContext.database.on(this.path, (data, error) => {
            //             output.printText(error || data);
            //       });
            //       this.evalContext.afterClear(() => {
            //             res.off();
            //       })
            // });
      }
}


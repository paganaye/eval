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


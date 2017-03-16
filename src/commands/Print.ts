import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Expression } from '../Expression';
import { Output } from "../Output";

export class Print extends Command {
      private data: Expression<any>[];

      getParameters(): ParameterDefinition[] {
            return [
                  { name: "data", type: "Expression", multiple: true }];
      }

      run(output: Output) {
            for (var item of this.data) {
                  var view = this.evalContext.getViewForExpr(item.getValue(this.evalContext), item.getType(this.evalContext), false);
                  view.render(output);
            }
      }
}


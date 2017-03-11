import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { ParameterDefinition } from '../EvalFunction';
import { Expression } from '../Expression';

export class Input extends Command {
      private inputs: Expression<any>[];

      getParameters(): ParameterDefinition[] {
            return [{ name: "inputs", type: "Expression", multiple: true }];
      }

      run(evalContext: Eval) {
            for (var input of this.inputs) {
                  evalContext.output.input(input);
            }
      }
}


import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Output } from "../Output";

export class Input extends Command {
	private inputs: Expression<any>[];

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("inputs", "Expression", { multiple: true });
	}

	run(output: Output) {
		for (var input of this.inputs) {
			//output.input(input);
		}
	}

	runTests(output: Output): void {

	}
}


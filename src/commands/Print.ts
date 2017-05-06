import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Output } from "../Output";

export class Print extends Command {
	private data: Expression<any>[];

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("data", "Expression", { multiple: true });
	}

	run(output: Output) {
		for (var item of this.data) {
			var view = this.evalContext.instantiate(item.getValue(this.evalContext), item.getType(this.evalContext), null, false);
			view.render(output);
		}
	}

	runTests(output: Output): void {

	}
}


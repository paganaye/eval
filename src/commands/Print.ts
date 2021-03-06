import { Command } from "../Command";
import { Eval } from "../Eval";
import { ParameterDefinition, CommandDescription } from '../EvalFunction';
import { Expression } from '../Expression';
import { Output, RenderMode } from "../Output";

export class Print extends Command {
	private data: Expression<any>[];

	run(output: Output) {
		for (var item of this.data) {
			var view = this.evalContext.instantiate(null, "print::", item.getValue(this.evalContext), item.getType(this.evalContext), RenderMode.View);
			view.render(output);
		}
	}

	runTests(output: Output): void {

	}
}

Command.registerCommand("print", {
	getNew: () => new Print(),
	description: new CommandDescription()
		.addParameter("data", "Expression", { multiple: true })
});

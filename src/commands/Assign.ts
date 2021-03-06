import { Command } from "../Command";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { Output } from "../Output";
import { CommandDescription } from "../EvalFunction";

export class Assign extends Command {
	variableName: string;
	variableValue: any;

	run(output: Output) {
		this.evalContext.setVariable(this.variableName, this.variableValue);
	}

	runTests(output: Output): void {

	}
}

Command.registerCommand("assign", {
	getNew: () => new Assign(),
	description: new CommandDescription()
			.addParameter("variableName", "string")
			.addParameter("variableValue", "any")
});

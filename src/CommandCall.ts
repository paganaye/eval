import { Command } from "./Command";
import { Eval } from "./Eval";
import { Expression, FunctionCall } from './Expression';
import { Output } from "./Output";
import { CommandDescription } from "./EvalFunction";

export class CommandCall {
	private command: Command;

	constructor(private evalContext: Eval, private source: string, private commandName, private expressions: { [key: string]: Expression<any> }) {
		var getNew = Command.getConstructor(commandName.toLowerCase());
		if (getNew) {
			this.command = getNew();
			this.command.initialize(evalContext);
		}
	}

	getName() {
		return this.commandName;
	}

	getSource() {
		return this.source;
	}

	getCommand(): Command {
		return this.command;
	}

	getParameters(): { [key: string]: Expression<any> } {
		return this.expressions;
	}

	run(output: Output) {
		if (!this.command) {
			output.printTag("div", { class: "error" }, "The command \"" + this.commandName + "\" does not exist.");
			return
		}
		try {
			var description = this.command.getDescription();
			FunctionCall.applyParameters(this.evalContext, description, this.expressions, this.command, "command " + this.commandName);
			this.command.run(output)
		} catch (error) {
			output.printTag("div", { class: "error" }, error);
		}
	}
}

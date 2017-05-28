import { Command, CommandFactory } from './Command';
import { Eval } from "./Eval";
import { Expression, FunctionCall } from './Expression';
import { Output } from "./Output";
import { CommandDescription } from "./EvalFunction";

export class CommandCall {
	private command: Command;
	private commandFactory: CommandFactory;
	private commandDescription: CommandDescription;

	constructor(private evalContext: Eval, private source: string, private commandName, private expressions: { [key: string]: Expression<any> }) {
		this.commandFactory = Command.getCommandFactory(commandName.toLowerCase());
		if (this.commandFactory) {
			this.commandDescription = this.commandFactory.getDescription();
			this.command = this.commandFactory.getNew();
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
			FunctionCall.applyParameters(this.evalContext, this.commandDescription, this.expressions, this.command, "command " + this.commandName);
			this.command.run(output)
		} catch (error) {
			output.printTag("div", { class: "error" }, error);
		}
	}
}

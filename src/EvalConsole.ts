import { Parser } from "./Parser";
import { Eval } from "./Eval";
import { app } from "./App";
import { Output } from "./Output";

export class EvalConsole {
	parser: Parser;
	outputElement: HTMLElement;

	constructor(private evalContext: Eval) {
		this.parser = new Parser(this.evalContext);
	}

	public initialize(outputElement: HTMLElement, visible: boolean): void {
		this.outputElement = outputElement;
	}

	public processCommand(commandString: string) {
		try {
			var res = this.parser.parseCommand(commandString)
			var output = this.evalContext.theme.createOutput(this.outputElement)
			output.printPage({ title: commandString }, () => res.run(output));
			output.domReplace();
		} catch (error) {
			console.error(error);
		}
	}
}
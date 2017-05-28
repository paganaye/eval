import { Eval } from "./Eval";
import { Expression } from './Expression';
import { ParameterDefinition, CommandDescription } from './EvalFunction';
import { Output } from "./Output";
import { ViewParent, AnyView } from "./View";

export abstract class Command implements ViewParent {
	static CommandFactories: { [key: string]: CommandFactory } = {};
	public evalContext: Eval
	abstract run(output: Output): void;

	valueChanged(view: AnyView): void {

	}

	initialize(evalContext: Eval) {
		this.evalContext = evalContext;
	}

	public static registerCommand(commandName: string, commandFactory: CommandFactory): void {
		Command.CommandFactories[commandName] = commandFactory;
	}

	public static getCommandFactory(commandName: string): CommandFactory {
		return Command.CommandFactories[commandName];
	}
}

export interface CommandFactory {
	getNew(): any;
	getDescription(): CommandDescription;
}
import { Eval } from "./Eval";
import { Expression } from './Expression';
import { ParameterDefinition, CommandDescription } from './EvalFunction';
import { Output } from "./Output";
import { ViewParent, AnyView } from "./View";

export abstract class Command implements ViewParent {
	static CommandFactories: { [key: string]: CommandFactory } = {};
	public evalContext: Eval
	abstract getDescription(): CommandDescription;
	abstract run(output: Output): void;

	valueChanged(view: AnyView): void {

	}

	initialize(evalContext: Eval) {
		this.evalContext = evalContext;
	}

	public static registerCommand(commandName: string, commandConstructor: () => Command): void {
		Command.CommandFactories[commandName] = { getNew: commandConstructor };
	}

	public static getConstructor(commandName: string): () => Command {
		var constructorFunction = Command.CommandFactories[commandName];
		return constructorFunction && constructorFunction.getNew;
	}
}

export interface CommandFactory {
	getNew(): any;
}
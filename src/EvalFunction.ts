import { CommandFactory } from './Command';
import { Eval } from "./Eval";
import { Subscriber, Expression } from './Expression';
import { Type } from './Types';

export abstract class EvalFunction<T> {
	static functionFactories: { [key: string]: CommandFactory } = {};
	protected parent: Expression<any>;
	public evalContext: Eval

	initialize(evalContext: Eval, parent: Expression<any>) {
		this.evalContext = evalContext;
		this.parent = parent;
	}

	abstract getDescription(): CommandDescription;
	abstract calcValue(evalContext: Eval): T;
	protected valueChanged() { }


	public static registerFunction(functionName: string, functionFactory: CommandFactory): void {
		EvalFunction.functionFactories[functionName] = functionFactory;
	}

	public static getFunctionFactory(functionName: string): CommandFactory {
		return EvalFunction.functionFactories[functionName];
	}
}

export class CommandDescription {
	public parameters: ParameterDefinition[] = [];

	addParameter(name: string, paramType: Type | String, args?: {
		description?: string,
		multiple?: boolean
	}): CommandDescription {
		if (!args) args = {};
		this.parameters.push(new ParameterDefinition(name, paramType, args.description, args.multiple));
		return this;
	}
}

export class ParameterDefinition {
	constructor(readonly name: string,
		readonly type: Type | String,
		readonly description?: string,
		readonly multiple?: boolean) {
	}
}

import { Eval } from "./Eval";
import { Subscriber, Expression } from './Expression';
import { Type } from './Types';

export abstract class EvalFunction<T> {
	static functionFactories: { [key: string]: () => EvalFunction<any> } = {};
	protected parent: Expression<any>;
	public evalContext: Eval

	initialize(evalContext: Eval, parent: Expression<any>) {
		this.evalContext = evalContext;
		this.parent = parent;
	}

	abstract getDescription(): CommandDescription;
	abstract calcValue(evalContext: Eval): T;
	protected valueChanged() { }


	public static registerFunction(functionName: string, functionConstructor: () => EvalFunction<any>): void {
		EvalFunction.functionFactories[functionName] = functionConstructor;
	}

	public static getConstructor(functionName: string): () => EvalFunction<any> {
		var constructorFunction = EvalFunction.functionFactories[functionName];
		return constructorFunction;
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

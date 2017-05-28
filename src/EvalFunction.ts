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
	public unnamedParametersCount = 0;

	addParameter(name: string, paramType: Type | String, args?: {
		description?: string,
		multiple?: boolean
		mustBeNamed?: boolean
	}): CommandDescription {
		if (!args) args = {};
		this.parameters.push({ name: name, type: paramType, description: args.description, multiple: args.multiple, mustBeNamed: args.mustBeNamed });
		if (!args.mustBeNamed) {
			this.unnamedParametersCount += 1;
		}
		return this;
	}
}

export interface ParameterDefinition {
	readonly name: string,
	readonly type: Type | String,
	readonly description: string,
	readonly multiple: boolean,
	readonly mustBeNamed: boolean
}

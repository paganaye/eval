import { EvalFunction, ParameterDefinition, CommandDescription } from '../EvalFunction';
// import { Type } from "../Types";
import { Eval } from "../Eval";

export class AbsFunction extends EvalFunction<Number> {
	private arg1: number;

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("arg1", "number", "");
	}

	calcValue(evalContext: Eval): number {
		return Math.abs(this.arg1)
	}
}

export class RoundFunction extends EvalFunction<Number> {
	private arg1: number;

	getDescription(): CommandDescription {
		return new CommandDescription()
			.addParameter("arg1", "number", "");
	}

	calcValue(evalContext: Eval): number {
		return Math.round(this.arg1)
	}
}

export class RandomFunction extends EvalFunction<Number> {
	value: Number = Math.random();

	getDescription(): CommandDescription {
		return new CommandDescription();
	}

	calcValue(evalContext: Eval) {
		return this.value;
	}
}


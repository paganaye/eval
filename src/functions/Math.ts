import { EvalFunction, ParameterDefinition, CommandDescription } from '../EvalFunction';
// import { Type } from "../Types";
import { Eval } from "../Eval";

export class AbsFunction extends EvalFunction<Number> {
	private arg1: number;

	calcValue(evalContext: Eval): number {
		return Math.abs(this.arg1)
	}
}

export class RoundFunction extends EvalFunction<Number> {
	private arg1: number;

	calcValue(evalContext: Eval): number {
		return Math.round(this.arg1)
	}
}

export class RandomFunction extends EvalFunction<Number> {
	value: Number = Math.random();

	calcValue(evalContext: Eval) {
		return this.value;
	}
}

EvalFunction.registerFunction("abs", {
	getNew: () => new AbsFunction(),
	description: new CommandDescription()
		.addParameter("arg1", "number", "")
});
EvalFunction.registerFunction("round", {
	getNew: () => new RoundFunction(),
	description: new CommandDescription()
			.addParameter("arg1", "number")
});
EvalFunction.registerFunction("random", {
	getNew: () => new RandomFunction(),
	description: new CommandDescription()
});

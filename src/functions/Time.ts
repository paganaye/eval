import { EvalFunction, ParameterDefinition, CommandDescription } from "../EvalFunction";
import { Type } from "../Types";
import { Eval } from "../Eval";


export class NowFunction extends EvalFunction<number> {

	calcValue(evalContext: Eval): number {
		setTimeout(() => {
			this.valueChanged();
		}, 1000);
		return new Date().getTime();
	}
}

EvalFunction.registerFunction("now", {
	getNew: () => new NowFunction(),
	description: new CommandDescription()
});

import { Eval } from "./Eval";
import { Expression } from './Expression';
import { ParameterDefinition, CommandDescription } from './EvalFunction';
import { Output } from "./Output";
import { ViewParent, AnyView } from "./View";

export abstract class Command implements ViewParent {
	constructor(protected readonly evalContext: Eval) { }
	abstract getDescription(): CommandDescription;
	abstract run(output: Output): void;

	valueChanged(view: AnyView): void {

	}
}

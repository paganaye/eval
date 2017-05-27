import { Eval } from './Eval';
import { EvalFunction, ParameterDefinition, CommandDescription } from './EvalFunction';
import { Type } from './Types';

export interface Subscriber {
	on(publisher: Publisher);
}

export interface Publisher {
	addSubscriber(subscriber: Subscriber): void;
	removeSubscriber(subscriber: Subscriber): void;
}

export interface HasValue extends Publisher {
	getValue(context: Eval): any;
	getType(context: Eval): Type;
	getLabel(context: Eval): string;
	getUnit(context: Eval): string;
}

export abstract class Expression<T> implements HasValue, Publisher, Subscriber {
	private subscribers: Subscriber[] = [];
	private modified: boolean = true;
	private calculatedValue: any;
	private label: string;
	private unit: string;
	private type: Type;
	abstract calcValue(evalContext: Eval): T;

	getLabel(): string {
		return this.label;
	}

	getUnit(): string {
		return this.unit;
	}

	getType(evalContext: Eval): Type {
		var result: Type = this.type;
		if (!result) {
			var value = this.getValue(evalContext);
			result = evalContext.getTypeDef(value, null);
		}
		return result;
	}

	getValue(evalContext: Eval): T {
		if (this.modified) {
			this.calculatedValue = this.calcValue(evalContext);
			this.modified = false;
		}
		return this.calculatedValue;
	}

	constructor(...publishers: Publisher[]) {
		publishers.forEach(p => p.addSubscriber(this));
	}

	addSubscriber(subscriber: Subscriber): void {
		if (this.subscribers.filter(s => s === subscriber).length > 0) return;
		this.subscribers.push(subscriber);
	}

	removeSubscriber(subscriber: Subscriber): void {
		this.subscribers = this.subscribers.filter(s => s != subscriber);
	}

	protected publish() {
		this.subscribers.forEach(s => s.on(this));
	}

	on(publisher: Publisher) {
		if (!this.modified) {
			this.modified = true;
			this.publish();
		}
	}
}

export class Const<T> extends Expression<T> {
	constructor(private value: T) {
		super();
	}
	calcValue(evalContext: Eval): any {
		return this.value;
	}
}

export class GetVariable extends Expression<any> {
	constructor(private variableName: any) {
		super();
	}

	getVariableName(): string { return this.variableName; }
	calcValue(evalContext: Eval): any {
		return evalContext.getVariable(this.variableName);
	}
}

export class UnaryOp extends Expression<any> {
	constructor(private op1: Expression<any>, private operator: string) {
		super();
	}
	calcValue(evalContext: Eval): any {
		switch (this.operator) {
			case "+":
				return + this.op1.getValue(evalContext);
			case "-":
				return - this.op1.getValue(evalContext);
		}
	}
}

export class BinaryOp extends Expression<any> {
	constructor(private operator: string, private op1: Expression<any>, private op2: Expression<any>) {
		super();
	}
	calcValue(evalContext: Eval): any {
		switch (this.operator) {
			case "+":
				return this.op1.getValue(evalContext) + this.op2.getValue(evalContext);
			case "-":
				return this.op1.getValue(evalContext) - this.op2.getValue(evalContext);
			case "*":
				return this.op1.getValue(evalContext) * this.op2.getValue(evalContext);
			case "/":
				return this.op1.getValue(evalContext) / this.op2.getValue(evalContext);
			case "<":
				return this.op1.getValue(evalContext) < this.op2.getValue(evalContext);
			case "<=":
				return this.op1.getValue(evalContext) <= this.op2.getValue(evalContext);
			case "==":
				return this.op1.getValue(evalContext) == this.op2.getValue(evalContext);
			case ">=":
				return this.op1.getValue(evalContext) >= this.op2.getValue(evalContext);
			case ">":
				return this.op1.getValue(evalContext) > this.op2.getValue(evalContext);
			case "!=":
				return this.op1.getValue(evalContext) != this.op2.getValue(evalContext);
		}
	}
}

export class GetMember extends Expression<any> {

	constructor(private evalContext: Eval, private base: Expression<any>, private memberName: string) {
		super();
	}

	calcValue(evalContext: Eval): any {
		var value = this.base.getValue(evalContext);
		if (value != null && value[this.memberName]) {
			value = value[this.memberName];
		}
		return value;
	}

}

export class FunctionCall extends Expression<any> {
	private functionInstance: EvalFunction<any>;

	constructor(evalContext: Eval, private functionName, private expressions: { [key: string]: Expression<any> }) {
		super();
		var getNew = EvalFunction.getConstructor(functionName);
		if (getNew) this.functionInstance = getNew();
		if (this.functionInstance) {
			this.functionInstance.initialize(evalContext, this);
		}
		else {
			throw "Unknown function " + functionName;
		}
	}

	static applyParameters(evalContext: Eval, commandDescription: CommandDescription,
		expressions: any, target: any, targetName) {
		var parameters = commandDescription.parameters || [];
		var lastParameter = parameters[parameters.length - 1];
		var lastParameterIsMultiple = lastParameter && lastParameter.multiple;
		var lastParameterValue = [];
		for (var idx in expressions) {
			var paramExpression = expressions[idx];
			var isNumber = /^[0-9]+$/.test(idx);
			var parameterDefinition: ParameterDefinition;
			if (isNumber) {
				var idxNumber = parseInt(idx);
				if (idxNumber >= parameters.length
					&& lastParameterIsMultiple)
					parameterDefinition = lastParameter;
				else
					parameterDefinition = parameters[idx];
			} else {
				parameterDefinition = parameters.filter(p => p.name === idx)[0];
			}
			if (!parameterDefinition) {
				throw "Parameter " + (isNumber ? (parseInt(idx) + 1).toString() : idx) + " does not exist in " + targetName + ".";
			}
			var actualValue;

			switch (parameterDefinition.type) {
				case "Expression":
					actualValue = paramExpression;
					break;
				case "stringOrVariableName":
					actualValue = (paramExpression instanceof GetVariable)
						? paramExpression.getVariableName()
						: (paramExpression.getValue(evalContext) || "").toString();
					break;
				default:
					actualValue = paramExpression.getValue(evalContext);
					break;
			}
			if (lastParameterIsMultiple && parameterDefinition == lastParameter) {
				lastParameterValue.push(actualValue);
				target[parameterDefinition.name] = lastParameterValue;
			}
			else target[parameterDefinition.name] = actualValue;
		}
	}

	calcValue(evalContext: Eval): any {

		FunctionCall.applyParameters(evalContext, this.functionInstance.getDescription(), this.expressions, this.functionInstance, "function " + this.functionName);
		var result = this.functionInstance.calcValue(evalContext);
		return result;
	}
}

export class JsonObject extends Expression<object> {
	private members: { [key: string]: Expression<any> } = {};

	constructor() {
		super();
	}

	addMember(key: string, value: Expression<any>) {
		this.members[key] = value;
	}

	calcValue(evalContext: Eval): any {
		var result = {};
		for (var m in this.members) {
			var value = this.members[m].getValue(evalContext);
			result[m] = value;
		}
		return result;
	}
}

export class JsonArray extends Expression<any[]> {
	private items: Expression<any>[] = [];

	constructor() {
		super();
	}

	addEntry(value: Expression<any>) {
		this.items.push(value);
	}

	calcValue(evalContext: Eval): any {
		var result = {};
		for (var m in this.items) {
			var value = this.items[m].getValue(evalContext);
			result[m] = value;
		}
		return result;
	}
}

export class Concat extends Expression<string> {

	constructor(evalContext: Eval, private parts: Expression<any>[]) {
		super();
	}


	calcValue(evalContext: Eval): string {
		var result = [];
		for (var e of this.parts) {
			result.push(e.getValue(evalContext))
		}
		return result.join("");
	}
}


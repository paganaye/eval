import { Eval } from './Eval';
import { EvalFunction, ParameterDefinition } from './EvalFunction';
import { TypeDefinition } from './Types';

export interface Subscriber {
	on(publisher: Publisher);
}

export interface Publisher {
	addSubscriber(subscriber: Subscriber): void;
	removeSubscriber(subscriber: Subscriber): void;
}

export abstract class Expression<T> implements Publisher, Subscriber {
	private subscribers: Subscriber[] = [];
	private modified: boolean = true;
	private calculatedValue: any;

	abstract calcValue(evalContext: Eval): T;

	getType(evalContext: Eval): TypeDefinition {
		var result: TypeDefinition;
		var value = this.getValue(evalContext);
		if (value && (value as any).type) result = (value as any).type;
		if (typeof result == "string") result = evalContext.types[result as string];
		if (!result) {
			result = evalContext.types[typeof value] || evalContext.objectType;
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

export class FunctionCall extends Expression<any> {
	private functionInstance: EvalFunction<any>;

	constructor(private evalContext: Eval, private functionName, private expressions: { [key: string]: Expression<any> }) {
		super();
		var getNew = this.evalContext.functions[functionName.toLowerCase()];
		if (getNew) this.functionInstance = getNew(evalContext);
		if (!this.functionInstance) {
			throw "Unknown function " + functionName;
		}
	}

	static applyParameters(evalContext: Eval, parameterDefinitions: ParameterDefinition[],
		expressions: any, target: any, targetName) {
		var lastParameter = parameterDefinitions[parameterDefinitions.length - 1];
		var lastParameterIsMultiple = lastParameter && lastParameter.multiple;
		var lastParameterValue = [];
		for (var idx in expressions) {
			var paramExpression = expressions[idx];
			var isNumber = /^[0-9]+$/.test(idx);
			var parameterDefinition: ParameterDefinition;
			if (isNumber) {
				var idxNumber = parseInt(idx);
				if (idxNumber >= parameterDefinitions.length
					&& lastParameterIsMultiple)
					parameterDefinition = lastParameter;
				else
					parameterDefinition = parameterDefinitions[idx];
			} else {
				parameterDefinition = parameterDefinitions.filter(p => p.name === idx)[0];
			}
			if (!parameterDefinition) {
				throw "Parameter " + (isNumber ? (parseInt(idx) + 1).toString() : idx) + " does not exist in " + targetName + ".";
			}
			var actualValue = (parameterDefinition.type == "Expression")
				? paramExpression
				: paramExpression.getValue(evalContext);
			if (lastParameterIsMultiple && parameterDefinition == lastParameter) {
				lastParameterValue.push(actualValue);
				target[parameterDefinition.name] = lastParameterValue;
			}
			else target[parameterDefinition.name] = actualValue;
		}
	}

	calcValue(evalContext: Eval): any {
		FunctionCall.applyParameters(evalContext, this.functionInstance.getParameters(), this.expressions, this.functionInstance, "function " + this.functionName);
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
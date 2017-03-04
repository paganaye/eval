import { Context } from './Context';
import { EvalFunction, FunctionParameter } from './EvalFunction';

export interface Subscriber {
	on(publisher: Publisher);
}

export interface Publisher {
	addSubscriber(subscriber: Subscriber): void;
	removeSubscriber(subscriber: Subscriber): void;
}

export abstract class Expression implements Publisher, Subscriber {
	private subscribers: Subscriber[] = [];
	private modified: boolean = true;
	private calculatedValue: any;
	
	abstract recalcValue(context: Context): any;

	getValue(context: Context): any {
		if (this.modified) {
			this.calculatedValue = this.recalcValue(context);
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

export class Const extends Expression {
	constructor(private value: any) {
		super();
	}
	recalcValue(context: Context): any {
		return this.value;
	}
}

export class GetVariable extends Expression {
	constructor(private variableName: any) {
		super();
	}

	getVariableName(): string { return this.variableName; }
	recalcValue(context: Context): any {
		return context.getVariable(this.variableName);
	}
}

export class UnaryOp extends Expression {
	constructor(private op1: Expression, private operator: string) {
		super();
	}
	recalcValue(context: Context): any {
		switch (this.operator) {
			case "+":
				return + this.op1.getValue(context);
			case "-":
				return - this.op1.getValue(context);
		}
	}
}

export class BinaryOp extends Expression {
	constructor(private operator: string, private op1: Expression, private op2: Expression) {
		super();
	}
	recalcValue(context: Context): any {
		switch (this.operator) {
			case "+":
				return this.op1.getValue(context) + this.op2.getValue(context);
			case "-":
				return this.op1.getValue(context) - this.op2.getValue(context);
			case "*":
				return this.op1.getValue(context) * this.op2.getValue(context);
			case "/":
				return this.op1.getValue(context) / this.op2.getValue(context);
			case "<":
				return this.op1.getValue(context) < this.op2.getValue(context);
			case "<=":
				return this.op1.getValue(context) <= this.op2.getValue(context);
			case "==":
				return this.op1.getValue(context) == this.op2.getValue(context);
			case ">=":
				return this.op1.getValue(context) >= this.op2.getValue(context);
			case ">":
				return this.op1.getValue(context) > this.op2.getValue(context);
			case "!=":
				return this.op1.getValue(context) != this.op2.getValue(context);
		}
	}
}

export class FunctionCall extends Expression {
	private evalFunction: EvalFunction<any>;

	constructor(private context: Context, private functionName, private parameters: { [key: string]: Expression }) {
		super();
		this.evalFunction = this.context.functions[functionName.toLowerCase()];
		if (!this.evalFunction) {
			throw "Unknown function " + functionName;
		}
	}

	getParamValues(context: Context): any {
		var paramValues = this.evalFunction.createParameters();
		var keys = Object.keys(paramValues);

		for (var idx in this.parameters) {
			var paramExpression = this.parameters[idx];
			var isNumber = /^[0-9]+$/.test(idx);
			if (isNumber) {
				var key = keys[idx] as string;
			} else key = idx;
			var actualValue = paramExpression.getValue(context);
			var param = (paramValues[key] as FunctionParameter<any>);
			if (param instanceof FunctionParameter) param.setValue(actualValue);
			else throw "Parameter " + (isNumber ? (parseInt(idx) + 1).toString() : key) + " does not exist in function " + this.functionName + ".";
		}
		return paramValues;
	}

	recalcValue(context: Context): any {
		var result = this.evalFunction.eval(this.context, this.getParamValues(context))
		return result;
	}
}

export class JsonObject extends Expression {
	private members: { [key: string]: Expression } = {};

	constructor() {
		super();
	}

	addMember(key: string, value: Expression) {
		this.members[key] = value;
	}

	recalcValue(context: Context): any {
		var result = {};
		for (var m in this.members) {
			var value = this.members[m].getValue(context);
			result[m] = value;
		}
		return result;
	}
}

export class JsonArray extends Expression {
	private items: Expression[] = [];

	constructor() {
		super();
	}

	addEntry(value: Expression) {
		this.items.push(value);
	}

	recalcValue(context: Context): any {
		var result = {};
		for (var m in this.items) {
			var value = this.items[m].getValue(context);
			result[m] = value;
		}
		return result;
	}
}
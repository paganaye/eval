import { Tokenizer, Token, TokenType } from './Tokenizer';
import { CommandCall } from "./CommandCall";
import { Context } from "./Context";
import { EvalFunction, FunctionParameter } from "./EvalFunction";

// we keep the same priorities than javascript but with less operators.
// pure function only (no assignment)
// no bitwise operators (not common enough, can be implemented through a class)
export enum Priority {
	Parenthesis = 20,
	UnaryPlusMinus = 16,
	LogicalNot = 16,
	Multiplication = 14,
	Addition = 13,
	Comparison = 11,
	LogicalAnd = 6,
	LogicalOr = 5,
	None = 0
}

export class Parser {
	tokenizer: Tokenizer;
	token: Token;
	expression: string;

	constructor(private context: Context) {
	}

	private init(expression: string) {
		this.expression = expression;
		this.tokenizer = new Tokenizer(expression);
		this.nextToken();
	}

	nextToken(): void {
		this.token = this.tokenizer.nextToken();
	}

	parse(expression: string) {
		this.init(expression);
		return this.parseExpression(Priority.None);
	}

	parseLeft(priority: Priority): ExpressionNode {
		var result: ExpressionNode;
		switch (this.token.type) {
			case TokenType.Operator:
				var op = this.token.stringValue;
				switch (this.token.stringValue) {
					case "+":
					case "-":
						this.nextToken();
						result = new UnaryOp(this.parseLeft(Priority.UnaryPlusMinus), op);
						return result;
					case "(":
						this.nextToken();
						result = this.parseExpression(Priority.None);
						if (this.token.type == TokenType.Operator
							&& this.token.stringValue as string == ")") {
							this.nextToken();
							return result;
						}
						this.unexpectedToken("Expecting closing parenthesis.");
						break;
					case "{":
						result = this.parseJSONObject();
						return result;
					case "[":
						result = this.parseJSONArray();
						return result;
					default:
						this.unexpectedToken("Only + and - operator are tolerated.");
						break;
				}
				break;
			case TokenType.Keyword:
				var variableOrFunction = this.token.stringValue;
				this.nextToken();
				if (this.token.type as TokenType == TokenType.Operator && this.token.stringValue == "(") {
					result = this.parseFunctionCall(variableOrFunction);
				} else {
					result = new GetVariable(variableOrFunction);
				}
				return result;
			case TokenType.Number:
				result = new Const(this.token.numberValue);
				this.nextToken();
				return result;
			case TokenType.String:
				result = new Const(this.token.stringValue);
				this.nextToken();
				return result;
		}
		this.unexpectedToken();
	}

	parseExpression(priority: Priority): ExpressionNode {
		var result = this.parseLeft(priority);
		while (this.token.type != TokenType.EOF) {
			switch (this.token.type) {
				case TokenType.Operator:
					var op = this.token.stringValue;
					if (op == "=") op = "==";
					switch (op) {
						case "+":
						case "-":
							if (priority >= Priority.Addition) return result;
							this.nextToken();
							result = new BinaryOp(op, result, this.parseExpression(Priority.Addition));
							break;
						case "*":
						case "/":
							if (priority >= Priority.Multiplication) return result;
							this.nextToken();
							result = new BinaryOp(op, result, this.parseExpression(Priority.Multiplication));
							break;
						case "<":
						case "<=":
						case "==":
						case ">=":
						case ">":
						case "!=":
							if (priority >= Priority.Comparison) return result;
							this.nextToken();
							result = new BinaryOp(op, result, this.parseExpression(Priority.Comparison));
							break;
						default:
							// closing brackets were here.
							return result;
					}
					break;
				default:
					// someone else will parse it.
					return result;
			}

		}
		return result;
	}

	unexpectedToken(detail?: string): void {
		throw "Unexpected "
		+ TokenType[this.token.type]
		+ " " + (this.token.numberValue || this.token.stringValue || "")
		+ " at position " + this.token.position + "." + detail || "";
	}

	parseFunctionCall(functionName: string): ExpressionNode {
		if (this.token.type !== TokenType.Operator || this.token.stringValue !== "(") {
			this.unexpectedToken("Expected parenthesis in function call.");
		}
		this.nextToken();
		var parameters = {};
		var useNamedParameters = false;
		this.parseParameters(parameters, true);
		return new FunctionCall(this.context, functionName, parameters);
	}

	parseCommand(expression: string): CommandCall {
		this.init(expression);
		//this.commandName = this.parseString(this.allDelimiters);
		var parameters = {};

		if (this.token.type != TokenType.Keyword) {
			this.unexpectedToken("Keyword expected.")
		}
		var commandName = this.token.stringValue;
		this.nextToken();
		if (this.token.type === TokenType.Operator && this.token.stringValue == "=") {
			// variable assignment
			this.nextToken();
			parameters[0] = new Const(commandName);
			commandName = "assign"
		}
		this.parseParameters(parameters, false);
		return new CommandCall(this.context, expression, commandName, parameters);
	}

	parseParameters(parameters: any, requireClosingParenthesis: boolean) {
		var useNamedParameters = false;
		while (this.token.type != TokenType.EOF) {
			if (requireClosingParenthesis
				&& this.token.type == TokenType.Operator
				&& this.token.stringValue == ")") {
				this.nextToken();
				return;
			}

			var value = this.parseExpression(Priority.None);
			//.parseValue(this.allDelimiters);
			if ((this.token.type == TokenType.Operator
				&& this.token.stringValue == ":")
				&& value instanceof (GetVariable)) {
				useNamedParameters = true;
				var parameterName = (value as GetVariable).getVariableName();
				this.nextToken();
				parameters[parameterName] = this.parseExpression(Priority.None);
			} else {
				var parameterNumber = Object.keys(parameters).length;
				if (useNamedParameters) {
					throw "Parameter " + (parameterNumber + 1) + " must be named.";
				}
				parameters[parameterNumber++] = value;
			}
		}
		if (requireClosingParenthesis) {
			this.unexpectedToken("Expected closing parenthesis.");
		}
	}

	// parseHTMLTag(): string {
	// 	var tags = [];
	// 	var result = "";
	// 	while (this.curChar) {
	// 		if (this.curChar == "<") {
	// 			this.nextChar();
	// 		} else throw "Tags start with the character <."

	// 		var closing = (this.curChar as string == "/");
	// 		if (closing) this.nextChar();
	// 		var tagName = this.parseNonQuotedString(this.allDelimiters);

	// 		if (closing) {
	// 			this.skipSpaces();
	// 			if (this.curChar as string == ">") this.nextChar();
	// 			else throw "Invalid character " + this.curChar + " at position " + this.pos + ". Expected: >.";

	// 			if (tags.length == 0) throw "Invalid HTML tag at position " + this.pos;

	// 			result += "</" + tagName + ">";
	// 			var expectedTag = tags.pop();
	// 			if (tagName == expectedTag) {
	// 				if (tags.length == 0) return result;
	// 			} else throw "Invalid closing tag </" + tagName + ">. Expected </" + expectedTag + ">";
	// 		} else {
	// 			tags.push(tagName);
	// 			result += "<" + tagName;
	// 		}
	// 		this.skipSpaces();
	// 		var inText = false;
	// 		var empty = false;
	// 		while (this.curChar && !inText) {
	// 			switch (this.curChar as string) {
	// 				case " ":
	// 				case "\t":
	// 					this.nextChar();
	// 					break;

	// 				case ">":
	// 					this.nextChar();
	// 					result += ">";
	// 					inText = true;
	// 					break;

	// 				case "/":
	// 					this.nextChar();
	// 					if (this.curChar as string == ">") {
	// 						this.nextChar();
	// 						empty = true;
	// 						inText = true;
	// 					}
	// 					else throw "Unexpected character " + this.curChar + " at position " + this.pos;
	// 					break;

	// 				default:
	// 					var attributeName = this.parseNonQuotedString(this.allDelimiters);
	// 					this.skipSpaces();
	// 					if (this.curChar as string == "=") {
	// 						this.nextChar();
	// 						this.skipSpaces();
	// 						var attributeValue = this.parseQuotedString();
	// 						result += " " + attributeName + "=" + attributeValue;
	// 					}
	// 			}
	// 		}
	// 		// in text
	// 		while (this.curChar && this.curChar != "<") {
	// 			result += this.curChar;
	// 			this.nextChar();

	// 		}
	// 	}
	// 	throw "Unexpected character " + this.curChar + " at position " + this.pos;
	// }



	parseJSONObject(): ExpressionNode {
		this.nextToken();
		var result = new JsonObject();
		if (this.token.type as TokenType === TokenType.Operator && this.token.stringValue == "}") {
			this.nextToken();
			return result;
		}
		while (this.token.type !== TokenType.EOF) {
			switch (this.token.type) {
				case TokenType.String:
				case TokenType.Keyword:
					var propertyName = this.token.stringValue;
					this.nextToken();
					if (this.token.type as TokenType == TokenType.Operator && this.token.stringValue == ":") {
						this.nextToken();
						var value = this.parseExpression(Priority.None);
						result.addMember(propertyName, value)
					} else {
						this.unexpectedToken("Missing colon character ':'.");
					}
					break;
				case TokenType.Operator:
					var op = this.token.stringValue;

					switch (op) {
						case ',':
							this.nextToken();
							break;
						case '}':
							this.nextToken();
							return result;
					}
					break;
				default:
					this.unexpectedToken("Invalid JSON object");
			}
		}
		this.unexpectedToken("Missing character '}'.");
	}

	parseJSONArray(): any {
		this.nextToken();
		var result = new JsonArray();
		if (this.token.type as TokenType === TokenType.Operator && this.token.stringValue == "}") {
			this.nextToken();
			return result;
		}
		while (this.token.type != TokenType.EOF) {
			var value = this.parseExpression(Priority.None);
			result.addEntry(value);
			switch (this.token.type) {
				case TokenType.Operator:
					var op = this.token.stringValue;
					switch (op) {
						case ',':
							this.nextToken();
							break;
						case ']':
							this.nextToken();
							return result;
					}
					break;
			}
		}
		this.unexpectedToken("Missing character ']'.");
	}
}

export interface Subscriber {
	on(publisher: Publisher);
}

export interface Publisher {
	addSubscriber(subscriber: Subscriber): void;
	removeSubscriber(subscriber: Subscriber): void;
}

export abstract class ExpressionNode implements Publisher, Subscriber {
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

class Const extends ExpressionNode {
	constructor(private value: any) {
		super();
	}
	recalcValue(context: Context): any {
		return this.value;
	}
}

class GetVariable extends ExpressionNode {
	constructor(private variableName: any) {
		super();
	}

	getVariableName(): string { return this.variableName; }
	recalcValue(context: Context): any {
		return context.getVariable(this.variableName);
	}
}

class UnaryOp extends ExpressionNode {
	constructor(private op1: ExpressionNode, private operator: string) {
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
class BinaryOp extends ExpressionNode {
	constructor(private operator: string, private op1: ExpressionNode, private op2: ExpressionNode) {
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

export class FunctionCall extends ExpressionNode {
	private evalFunction: EvalFunction<any>;

	constructor(private context: Context, private functionName, private parameters: { [key: string]: ExpressionNode }) {
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

export class JsonObject extends ExpressionNode {
	private members: { [key: string]: ExpressionNode } = {};

	constructor() {
		super();
	}

	addMember(key: string, value: ExpressionNode) {
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

export class JsonArray extends ExpressionNode {
	private items: ExpressionNode[] = [];

	constructor() {
		super();
	}

	addEntry(value: ExpressionNode) {
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
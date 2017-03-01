import { Tokenizer, Token, TokenType } from './Tokenizer';
import { CommandCall } from './CommandCall';
import { Context } from './Context';

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

	constructor(private context?: Context) {
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

	parseExpression(priority: Priority): ExpressionNode {
		var result = this.parseLeft(priority);
		while (this.token.type != TokenType.EOF) {
			switch (this.token.type) {
				case TokenType.Operator:
					var op = this.token.stringValue;
					if (op == '=') op = '==';
					switch (op) {
						case '+':
						case '-':
							if (priority > Priority.Addition) return result;
							this.nextToken();
							result = new BinaryOp(op, result, this.parseExpression(Priority.Addition));
							break;
						case '*':
						case '/':
							if (priority > Priority.Multiplication) return result;
							this.nextToken();
							result = new BinaryOp(op, result, this.parseExpression(Priority.Multiplication));
							break;
						case '<':
						case '<=':
						case '==':
						case '>=':
						case '>':
						case '!=':
							if (priority > Priority.Comparison) return result;
							this.nextToken();
							result = new BinaryOp(op, result, this.parseExpression(Priority.Comparison));
							break;
					}
					break;
				default:
					this.unexpectedToken();
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


	parseLeft(priority: Priority): ExpressionNode {
		var result: ExpressionNode;
		switch (this.token.type) {
			case TokenType.Operator:
				var op = this.token.stringValue;
				switch (this.token.stringValue) {
					case '+':
					case '-':
						result = new UnaryOp(this.parseLeft(Priority.UnaryPlusMinus), op);
						return result;
					default:
						this.unexpectedToken("Only + and - operator are tolerated.");
						break;
				}
				break;
			case TokenType.Keyword:
				result = new GetVariable(this.token.numberValue);
				this.nextToken();
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

	parseCommand(expression: string): CommandCall {
		this.init(expression);
		//this.commandName = this.parseString(this.allDelimiters);
		var parameters = {};
		//this.useNamedParameters = false;

		var useNamedParameters = false;
		if (this.token.type != TokenType.Keyword) {
			this.unexpectedToken("Keyword expected.")
		}
		var commandName = this.token.stringValue;
		this.nextToken();
		while (this.token.type != TokenType.EOF) {
			var value = this.parseExpression(Priority.None);
			//.parseValue(this.allDelimiters);

			if ((this.token.type == TokenType.Operator
				&& this.token.stringValue == ':')) {
				useNamedParameters = true;
				var parameterName = this.token.stringValue;
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
		var command = this.context.commands[commandName.toLowerCase()];
		if (!command) {
			throw "Unknown command " + commandName;
		}
		return new CommandCall(this.context, expression, command, parameters);
	}


	// parseHTMLTag(): string {
	// 	var tags = [];
	// 	var result = "";
	// 	while (this.curChar) {
	// 		if (this.curChar == '<') {
	// 			this.nextChar();
	// 		} else throw "Tags start with the character <."

	// 		var closing = (this.curChar as string == '/');
	// 		if (closing) this.nextChar();
	// 		var tagName = this.parseNonQuotedString(this.allDelimiters);

	// 		if (closing) {
	// 			this.skipSpaces();
	// 			if (this.curChar as string == '>') this.nextChar();
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
	// 				case ' ':
	// 				case '\t':
	// 					this.nextChar();
	// 					break;

	// 				case '>':
	// 					this.nextChar();
	// 					result += ">";
	// 					inText = true;
	// 					break;

	// 				case '/':
	// 					this.nextChar();
	// 					if (this.curChar as string == '>') {
	// 						this.nextChar();
	// 						empty = true;
	// 						inText = true;
	// 					}
	// 					else throw "Unexpected character " + this.curChar + " at position " + this.pos;
	// 					break;

	// 				default:
	// 					var attributeName = this.parseNonQuotedString(this.allDelimiters);
	// 					this.skipSpaces();
	// 					if (this.curChar as string == '=') {
	// 						this.nextChar();
	// 						this.skipSpaces();
	// 						var attributeValue = this.parseQuotedString();
	// 						result += " " + attributeName + "=" + attributeValue;
	// 					}
	// 			}
	// 		}
	// 		// in text
	// 		while (this.curChar && this.curChar != '<') {
	// 			result += this.curChar;
	// 			this.nextChar();

	// 		}
	// 	}
	// 	throw "Unexpected character " + this.curChar + " at position " + this.pos;
	// }

	// parseJSONObject(): any {
	// 	this.nextChar();
	// 	var result = {};
	// 	if (this.curChar == '}') {
	// 		this.nextChar();
	// 		return result;
	// 	}
	// 	while (this.curChar) {
	// 		var propertyName = this.parseString(this.allDelimiters);
	// 		if (propertyName in result) {
	// 			throw "Propery " + propertyName + " is already defined at position " + this.pos;
	// 		}
	// 		if (this.curChar != ':') {
	// 			throw "Missing character : at position " + this.pos;
	// 		}
	// 		this.nextChar();
	// 		var value = this.parseValue(this.allDelimiters);
	// 		result[propertyName] = value;
	// 		switch (this.curChar as string) {
	// 			case ',':
	// 				this.nextChar();
	// 				break;
	// 			case '}':
	// 				this.nextChar();
	// 				return result;
	// 			default:
	// 				throw "Unexpected character " + this.curChar + " at position " + this.pos;
	// 		}
	// 	}
	// 	throw "Unexpected end of line at postion " + this.pos;
	// }

	// parseJSONArray(): any {
	// 	this.nextChar();
	// 	var result = [];
	// 	if (this.curChar == ']') {
	// 		this.nextChar();
	// 		return result;
	// 	}
	// 	while (this.curChar) {
	// 		var value = this.parseValue(this.allDelimiters);
	// 		result.push(value);
	// 		switch (this.curChar as string) {
	// 			case ',':
	// 				this.nextChar();
	// 				break;
	// 			case ']':
	// 				this.nextChar();
	// 				return result;
	// 			default:
	// 				throw "Unexpected character " + this.curChar + " at position " + this.pos;
	// 		}
	// 	}
	// 	throw "Unexpected end of line at postion " + this.pos;
	// }

}

export abstract class ExpressionNode {
	abstract getValue(): any;
}

class Const extends ExpressionNode {
	constructor(private value: any) {
		super();
	}
	getValue(): any {
		return this.value;
	}
}

class GetVariable extends ExpressionNode {
	constructor(private variableName: any) {
		super();
	}
	getValue(): any {
		return "todo";
	}
}

class UnaryOp extends ExpressionNode {
	constructor(private op1: ExpressionNode, private operator: string) {
		super();
	}
	getValue(): any {
		switch (this.operator) {
			case '+':
				return + this.op1.getValue();
			case '-':
				return - this.op1.getValue();
		}
	}
}
class BinaryOp extends ExpressionNode {
	constructor(private operator: string, private op1: ExpressionNode, private op2: ExpressionNode) {
		super();
	}
	getValue(): any {
		switch (this.operator) {
			case '+':
				return this.op1.getValue() + this.op2.getValue();
			case '-':
				return this.op1.getValue() - this.op2.getValue();
			case '*':
				return this.op1.getValue() * this.op2.getValue();
			case '/':
				return this.op1.getValue() / this.op2.getValue();
			case '<':
				return this.op1.getValue() < this.op2.getValue();
			case '<=':
				return this.op1.getValue() <= this.op2.getValue();
			case '==':
				return this.op1.getValue() == this.op2.getValue();
			case '>=':
				return this.op1.getValue() >= this.op2.getValue();
			case '>':
				return this.op1.getValue() > this.op2.getValue();
			case '!=':
				return this.op1.getValue() != this.op2.getValue();
		}
	}
}

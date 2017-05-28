import { Command } from './Command';
import { Tokenizer, Token, TokenType } from './Tokenizer';
import { CommandCall } from "./CommandCall";
import { Eval } from "./Eval";
import { EvalFunction, ParameterDefinition } from "./EvalFunction";
import { JsonArray, FunctionCall, Expression, UnaryOp, GetVariable, Const, BinaryOp, JsonObject, GetMember, Concat } from './Expression';

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

	constructor(private evalContext: Eval) {
	}

	private init(expression: string, inTemplate: boolean) {
		this.expression = expression;
		this.tokenizer = new Tokenizer(expression, inTemplate);
		this.nextToken();
	}

	nextToken(): void {
		this.token = this.tokenizer.nextToken();
	}

	parse(expression: string) {
		this.init(expression, false);
		return this.parseExpression(Priority.None);
	}

	parseTemplate(template: string) {
		this.init(template, true);
		//return this.parseExpression(Priority.None);
		var parts: Expression<any>[] = [];
		while (this.token.type != TokenType.EOF) {
			if (this.token.type == TokenType.Operator && this.token.stringValue == "{") {
				this.tokenizer.inTemplate = false;
				this.nextToken();
				var expr = this.parseExpression(Priority.None);
				if (this.token.type == TokenType.Operator && this.token.stringValue as any == "}") {
					parts.push(expr)
					this.tokenizer.inTemplate = true;
					this.nextToken();
				} else {
					this.unexpectedToken("Expected closing character '}'");
				}
			} else if (this.token.type == TokenType.String) {
				parts.push(new Const(this.token.stringValue));
				this.nextToken();
			} else {
				this.unexpectedToken();
			}
		}
		return new Concat(this.evalContext, parts);
	}

	parseLeft(priority: Priority): Expression<any> {
		var result: Expression<any>;
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
				while (this.token.type as TokenType == TokenType.Operator && this.token.stringValue == ".") {
					this.nextToken();
					if (this.token.type == TokenType.Keyword) {
						result = new GetMember(this.evalContext, result, this.token.stringValue);
						this.nextToken();
					} else {
						this.unexpectedToken("Expected member name after the dot.")
					}
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

	parseExpression(priority: Priority): Expression<any> {
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

	parseFunctionCall(functionName: string): Expression<any> {
		if (this.token.type !== TokenType.Operator || this.token.stringValue !== "(") {
			this.unexpectedToken("Expected parenthesis in function call.");
		}
		this.nextToken();
		var parameters = {};
		var useNamedParameters = false;
		var functionFactory = EvalFunction.getConstructor(functionName);

		this.parseParameters(parameters, true, functionFactory);
		return new FunctionCall(this.evalContext, functionName, parameters);
	}

	parseCommand(expression: string): CommandCall {
		this.init(expression, false);
		//this.commandName = this.parseString(this.allDelimiters);
		var parameters = {};

		if (this.token.type != TokenType.Keyword) {
			this.unexpectedToken("Unknown command.")
		}
		var commandName = this.token.stringValue;
		this.nextToken();

		if (this.token.type === TokenType.Operator && this.token.stringValue == "=") {
			// variable assignment
			// XX = 1
			this.nextToken();
			commandName = "assign"
			parameters["variableName"] = new Const(commandName);
		}
		else {
			if (!Command.getConstructor(commandName)) {
				// If the first character is not a command we infer a "READ"
				parameters["pageName"] = new Const(commandName);
				commandName = (this.token.type == TokenType.EOF)
					? "index" : "read";
			}
		}
		var commandFactory = Command.getConstructor(commandName.toLowerCase());
		this.parseParameters(parameters, false, commandFactory);
		return new CommandCall(this.evalContext, expression, commandName, parameters);
	}

	parseParameters(parameters: any, requireClosingParenthesis: boolean, commandFactory: any) {
		var useNamedParameters = false;
		var parameterStart = 0;
		while (this.token.type != TokenType.EOF) {
			if (requireClosingParenthesis
				&& this.token.type == TokenType.Operator
				&& this.token.stringValue == ")") {
				this.nextToken();
				return;
			}
			try {
				var startPos = this.token.position;
				var value = this.parseExpression(Priority.None);
			} catch (error) {
				this.token = this.tokenizer.getRemaining(startPos);
				value = new Const<string>(this.token.stringValue);
				this.nextToken();
			}

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
			if (this.token.type == TokenType.Operator
				&& this.token.stringValue == ",") {
				// we don't care much about commas
				this.nextToken();
			}
		}
		if (requireClosingParenthesis) {
			this.unexpectedToken("Expected closing parenthesis.");
		}
	}

	// print a < p
	// print a <p x="A">
	// print a <br />	

	parseHTMLTag(): string {
		return null;
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
	}



	parseJSONObject(): Expression<any> {
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




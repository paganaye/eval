import { EvalConsole } from "./EvalConsole";
import { Tokenizer, TokenType } from "./Tokenizer";
import { Parser, Priority } from "./Parser";
import { Eval } from "./Eval";
import { Output } from "src/Output";

export class Tests {
	constructor(private console: EvalConsole) { }

	public selfTests() {
		this.console.echo("Running tests...");
		this.testNextChar();
		this.testTokenizer();
		this.testParser();
		this.testFunctions();
		this.testCommands();
	}

	public testFunctions() {
		this.console.echo("Functions...");
		this.assertParse(1, "abs(-1)")
	}

	public testParser() {
		this.console.echo("Parser...");
		this.assertParse(17, "1+2*3+10")
		this.assertParse(1, "6/2/3")
		this.assertParse("AB", "\"A\" + \"B\"")
	}

	public testCommands() {
		var evalContext = new Eval();
		var parser = new Parser(evalContext);

		var command = parser.parseCommand("print 1+2");
		this.assert("print", command.getName());
		//this.assert({ expr: { value: 3 }, type: {} }, command.getParamsObject(evalContext));
		var output = new Output(evalContext, document.createElement("div"));
		var command = parser.parseCommand("a=1+1");
		command.run(output);
		this.assert(2, evalContext.getVariable("a"));
		var command = parser.parseCommand("print abs(-1)");
		command.run(output);
	}

	public assertCommandParser(expectedName: string, expectedParameters: any, line: string) {
		// var commandParser = this.console.commandParser;
		// var commandCall = commandParser.parse(line);
		// this.assert({ name: expectedName, parameters: expectedParameters },
		// 	{ name: commandCall.getCommand().getName(), parameters: commandCall.getParameters() },
		// 	line);
	}

	public assertParse(expectedValue: any, expression: string) {
		var evalContext = new Eval();
		var parser = new Parser(evalContext);
		var node = parser.parse(expression);
		var result = node.getValue(evalContext)
		this.assert(expectedValue, result, expression);
	}

	public testTokenizer() {
		this.console.echo("Tokenizer...");
		var tokenizer = new Tokenizer("12+3<=ab");
		var token = tokenizer.nextToken();
		this.assert(TokenType.Number, token.type);
		this.assert(12, token.numberValue);
		var token = tokenizer.nextToken();
		this.assert(TokenType.Operator, token.type);
		this.assert("+", token.stringValue);
		var token = tokenizer.nextToken();
		this.assert(TokenType.Number, token.type);
		this.assert(3, token.numberValue);
		var token = tokenizer.nextToken();
		this.assert(TokenType.Operator, token.type);
		this.assert("<=", token.stringValue);
		var token = tokenizer.nextToken();
		this.assert(TokenType.Keyword, token.type);
		this.assert("ab", token.stringValue);
	}

	public testNextChar() {
		this.console.echo("NextChar...");
		var tokenizer = new Tokenizer("a 1");
		this.assert("a", tokenizer.curChar);
		this.assert(0, tokenizer.position)
		tokenizer.nextChar();
		this.assert(" ", tokenizer.curChar);
		this.assert(1, tokenizer.position)
		tokenizer.nextChar();
		this.assert("1", tokenizer.curChar);
		tokenizer.nextChar();
		this.assert(null, tokenizer.curChar);
	}

	public commandTests() {
		try {
			this.assert(3, () => 1 + 2, "1 + 2");

			// var commandParser = this.console.commandParser;
			// var commandCall = commandParser.parse("myCommand 1 true "A" n1:\"C D\" \"n2\":{}");
			// this.console.echo(commandCall.getSource());
			// this.assert("myCommand", commandCall.getCommand().getName())

			// this.assertCommandParser("cmd1", { 0: 1, 1: true, 2: "A", 3: "B" },
			// 	"cmd1 1 true "A" \"B\"");
			// this.assertCommandParser("cmd2", { "n1": "C D", "n2": {} },
			// 	"cmd2 n1:\"C D\" \"n2\":{}");
			// this.assertCommandParser("cmd3", { 0: "<p>Hello World</p>" },
			// 	"cmd3 <p>Hello World</p>");

		}
		catch (e) {
			this.console.error(JSON.stringify(e));
		}
	}

	public assert(expected, actual, message?: string) {
		if (!message) message = "";
		var expectedJSON = JSON.stringify(expected);
		if (typeof actual == "function") {
			try {
				actual = actual(message);
			} catch (e) {
				actual = e;
			}
		}
		var actualJSON = JSON.stringify(actual);
		if (actualJSON == expectedJSON) {
			this.console.echo("[Pass] " + message + " => " + actualJSON);
		} else {
			this.console.error("[Fail] " + message);
			this.console.echo("  expected: " + expectedJSON);
			this.console.echo("  actual: " + actualJSON);
		}
	}
}
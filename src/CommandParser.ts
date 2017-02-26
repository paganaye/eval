import { CommandCall } from './CommandCall';
import { Commands } from './Commands'

//TODO: understand JSON litterals
//TODO: understand HTML litterals

export class CommandParser {
	source: string;
	pos: number;
	len: number;
	curChar: string;
	commandName: string;
	parameters: any;
	useNamedParameters: boolean;
	allDelimiters =  /[ \t:{}\[\]<>,'"]/;

	constructor(commands: Commands) {

	}

	private nextChar() {
		if (this.pos < this.len) {
			this.pos++
			if (this.pos < this.len) {
				this.curChar = this.source.charAt(this.pos);
				return;
			}
		}
		this.curChar = null;
	}

	public parse(source: string): CommandCall {
		this.source = source;
		this.pos = -1;
		this.len = source.length;
		this.nextChar();
		this.commandName = this.parseString(this.allDelimiters);
		this.skipSpaces();
		this.parameters = {};
		this.useNamedParameters = false;
		while (this.curChar) {
			this.parseParameter();
			this.skipSpaces();
		}
		return new CommandCall(source, this.commandName, this.parameters);
	}

	parseString(delimiters: RegExp): string {
		switch (this.curChar) {
			case '"':
			case "'":
				return this.parseQuotedString();
			default:
				return this.parseNonQuotedString(delimiters);
		}
	}

	parseQuotedString(): string {
		var closingQuote: string = this.curChar;
		var result: string = '';
		this.nextChar();

		while (this.curChar && this.curChar != closingQuote) {
			result += this.curChar;
			this.nextChar();
		}
		if (this.curChar != closingQuote) throw "missing closing quote: " + closingQuote;
		this.nextChar();
		return result;
	}

	parseNonQuotedString(delimiters: RegExp): string {
		var result: string = '';
		while (this.curChar
			&& !delimiters.test(this.curChar)) {
			result += this.curChar;
			this.nextChar();
		}
		return result;
	}

	skipSpaces(): void {
		while (this.curChar == ' ' || this.curChar == '\t') {
			this.nextChar();
		}
	}

	parseParameter(): void {
		var value = this.parseValue(this.allDelimiters);
		if (this.curChar == ":" && typeof value === "string") {
			this.useNamedParameters = true;
			this.nextChar();
			this.parameters[value] = this.parseValue(this.allDelimiters);
		} else {
			var parameterNumber = Object.keys(this.parameters).length;
			if (this.useNamedParameters) {
				throw "Parameter " + (parameterNumber + 1) + " must be named.";
			}
			this.parameters[parameterNumber++] = value;
		}
	}

	parseValue(delimiters): any {
		var value: any = null;
		switch (this.curChar) {
			case ":":
				throw "Unexpected colon character at position " + this.pos;
			case "<":
				value = this.parseHTML();
				break;
			case "{":
				value = this.parseJSONObject();
				break;
			case "[":
				value = this.parseJSONArray();
				break;
			case "'":
			case '"':
				value = this.parseQuotedString();
				break;
			default:
				value = this.parseStringOrConst(delimiters);
				break;

		}
		this.skipSpaces();
		return value;
	}

	parseHTML() {
		return this.parseNonQuotedString(/>/); // TODO
	}

	parseJSONObject(): any {
		this.nextChar();
		var result = {};
		if (this.curChar == '}') {
			this.nextChar();
			return result;
		}
		while (this.curChar) {
			var propertyName = this.parseString(this.allDelimiters);
			if (propertyName in result) {
				throw "Propery " + propertyName + " is already defined at position " + this.pos;
			}
			if (this.curChar != ':') {
				throw "Missing character : at position " + this.pos;
			}
			this.nextChar();
			var value = this.parseValue(this.allDelimiters);
			result[propertyName] = value;
			switch (this.curChar as string) {
				case ',':
					this.nextChar();
					break;
				case '}':
					this.nextChar();
					return result;
				default:
					throw "Unexpected character " + this.curChar + " at position " + this.pos;
			}
		}
		throw "Unexpected end of line at postion " + this.pos;
	}

	parseJSONArray(): any {
		this.nextChar();
		var result = [];
		if (this.curChar == ']') {
			this.nextChar();
			return result;
		}
		while (this.curChar) {
			var value = this.parseValue(this.allDelimiters);
			result.push(value);
			switch (this.curChar as string) {
				case ',':
					this.nextChar();
					break;
				case ']':
					this.nextChar();
					return result;
				default:
					throw "Unexpected character " + this.curChar + " at position " + this.pos;
			}
		}
		throw "Unexpected end of line at postion " + this.pos;
	}

	parseStringOrConst(delimiters) {
		var value: any = this.parseNonQuotedString(delimiters);
		switch (value.toLowerCase()) {
			case 'true':
				value = true;
				break;
			case 'false':
				value = false;
				break;
			default:
				if (/^[0-9]+$/.test(value)) {
					value = parseInt(value);
				}
				else if (/^[0-9]*\.[0-9]+$/.test(value)) {
					value = parseFloat(value);
				}
				break;
		}
		return value;
	}

}
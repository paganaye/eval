import { app } from "./App";
import { YoutubeView } from "./views/Youtube";
import { ObjectView } from "./views/Object";
import { JSONView } from "./views/JSONView";
import { TypeDefinition, Type } from './Types';
import { View } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';
import { Section } from "src/Theme";


export class Output {
	public html: String[] = [];
	private rendered = false;
	private editMode: boolean;
	constructor(private evalContext: Eval, private outputElt: HTMLElement | string) {

	}

	getEditMode(): boolean {
		return this.editMode;
	}

	setEditMode(value: boolean) {
		//todo: perhaps check that the html is empty
		this.editMode = value;
	}

	printText(text: string) {
		this.html.push(
			"<span class=\"print\">"
			+ Output.escapeHtml(text)
			+ "</span>");
	}

	printHTML(html: string) {
		this.html.push(html);
	}


	printTag(tag: string, attributes: any, content?: string) {
		this.html.push("<" + tag);
		for (var key in attributes) {
			this.html.push(" " + key + "=\"" + Output.escapeAttribute(attributes[key]) + "\"");
		}
		if (content || !Output.selfClosing[tag.toLowerCase()]) {
			this.html.push(">");
			this.html.push(Output.escapeHtml(content));
			this.html.push("</" + tag + ">");
		} else {
			this.html.push(" />");
		}
	}

	private startedTags: String[] = [];

	printStartTag(tag: string, attributes: any) {
		this.html.push("<" + tag);
		for (var key in attributes) {
			this.html.push(" " + key + "=\"" + Output.escapeAttribute(attributes[key]) + "\"");
		}
		this.html.push(">");
		this.startedTags.push(tag);
	}


	printEndTag() {
		this.html.push("</" + this.startedTags.pop() + ">");
	}

	printSection(section: Section, printContent: () => void): void {
		this.evalContext.theme.printSection(this, section, printContent);
	}

	printProperty(key: string, data: any, type: Type): void {
		this.evalContext.theme.printProperty(this, key, data, type)
	}

	input(input: Expression<any>) {
		var variableName = input as any as string;
		if (input instanceof GetVariable) {
			variableName = (input as GetVariable).getVariableName();
		}
		var actualValue = this.evalContext.getVariable(variableName);
		var type = this.evalContext.types[type];
		if (!type) type = this.evalContext.types[typeof actualValue] || this.evalContext.objectType;
	}

	print(expr: any, type: Type, attributes?: { [key: string]: string }) {
		var typeDef = this.evalContext.getTypeDef(expr, type)
		var view: View<any> = this.evalContext.getView(typeDef, this.editMode)
		var actualValue = (expr && expr.getValue)
			? expr.getValue(this)
			: expr;
		view.render(actualValue, typeDef, attributes, this);
	}

	toString(): string {
		return this.html.join("");
	}

	render(): void {
		var htmlText = this.toString();
		var elt = (typeof this.outputElt) === "string" ? document.getElementById(this.outputElt as string) : this.outputElt as HTMLElement;
		if (elt == null) {
			setTimeout(() => this.render());
		} else {
			elt.innerHTML = htmlText;
			this.rendered = true;
			this.html = [];
		}
	}


	static selfClosing = {
		"area": true,
		"base": true,
		"br": true,
		"col": true,
		"command": true,
		"embed": true,
		"hr": true,
		"img": true,
		"input": true,
		"keygen": true,
		"link": true,
		"meta": true,
		"param": true,
		"source": true,
		"track": true,
		"wbr": true
	}

	static entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;"
	};

	static escapeHtml(string) {
		return String(string).replace(/[&<>"]/g, (s) => {
			return Output.entityMap[s];
		});
	}

	static escapeAttribute(string) {
		return String(string).replace(/[&<>"]/g, (s) => {
			return Output.entityMap[s];
		});
	}

	printDynamic(tag: string, attributes: any, text: string): Output {
		var nextId = this.evalContext.nextId();
		if (!attributes) attributes = {};
		attributes.id = nextId;
		this.printTag(tag, attributes, "...");

		var newOutput = new Output(this.evalContext, nextId);
		return newOutput;
	}


}


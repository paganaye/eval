import { app } from "./App";
import { YoutubeView } from "./views/Youtube";
import { ObjectView } from "./views/Object";
import { JSONView } from "./views/JSONView";
import { TypeDefinition, Type } from './Types';
import { View } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';


export class Output {
	public html: String[] = [];

	constructor(private evalContext: Eval) {
	}

	clear() {
		this.html = [];
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

	startTag(tag: string, attributes: any) {
		this.html.push("<" + tag);
		for (var key in attributes) {
			this.html.push(" " + key + "=\"" + Output.escapeAttribute(attributes[key]) + "\"");
		}
		this.html.push(" />");
	}

	endTag(tag: string) {
		this.html.push("</" + tag + ">");
	}


	printProperty(key: string, data: any, type: Type) {
		this.printHTML("<div>");
		this.printTag("label", { for: key }, key);
		this.print(data, type);
		this.printHTML("</div>");
	}

	input(input: Expression<any>) {
		var variableName = input as any as string;
		if (input instanceof GetVariable) {
			variableName = (input as GetVariable).getVariableName();
		}
		var actualValue = this.evalContext.getVariable(variableName);
		var type = this.evalContext.types[type];
		if (!type) type = this.evalContext.types[typeof actualValue] || this.evalContext.objectType;

		//var view: View<any> = type.inputView || this.defaultInputViews[type.type] || this.evalContext.inputView;
		//view.render(actualValue, type as TypeDefinition, this);

	}

	print(expr: any, type: Type) {
		var typeDef = this.evalContext.getTypeDef(expr, type)
		var view: View<any> = this.evalContext.getView(typeDef)
		var actualValue = (expr && expr.getValue)
			? expr.getValue(this)
			: expr;
		view.render(actualValue, type as TypeDefinition, this);
	}

	toString(): string {
		return this.html.join("");
	}

	finishPrinting(): void {
		this.html = null;
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

}


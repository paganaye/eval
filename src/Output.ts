import { app } from "./App";
import { YoutubeView } from "./views/Youtube";
import { ObjectView } from "./views/Object";
import { JSONView } from "./views/JSONView";
import { TypeDefinition, Type } from "./Types";
import { View } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';


export class Output {
	public html: String[] = [];
	counter: number = 0;

	defaultViews: { [key: string]: View<any> } = {};
	defaultInputViews: { [key: string]: View<any> } = {};

	constructor(private evalContext: Eval) {
	}

	nextId(): number {
		return this.counter++;
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

	printProperty(key: string, expr: Expression<any>) {
		this.printHTML("<div>");
		this.printTag("label", { for: key }, key);
		this.print([expr]);
		this.printHTML("</div>");
	}

	input(inputs: Expression<any>[]) {
		for (var input of inputs) {
			var variableName = input as any as string;
			if (input instanceof GetVariable) {
				variableName = (input as GetVariable).getVariableName();
			}
			var actualValue = this.evalContext.getVariable(variableName);
			var type = this.evalContext.types[type];
			if (!type) type = this.evalContext.types[typeof actualValue] || this.evalContext.objectType;

			var view: View<any> = type.inputView || this.defaultInputViews[type.type] || this.evalContext.inputView;
			view.render(actualValue, type as TypeDefinition, this);
		}
	}

	print(list: Expression<any>[]) {
		for (var expr of list) {
			var type: any = expr.getType(this.evalContext);
			if (typeof type == "string") type = this.evalContext.types[type];
			if (!type) type = this.evalContext.types[typeof expr] || this.evalContext.objectType;

			var view: View<any> = type.view || this.defaultViews[type.type] || this.evalContext.jsonView;
			var actualValue = expr.getValue(this.evalContext);
			view.render(actualValue, type as TypeDefinition, this);
		}
	}

	toString(): string {
		return this.html.join("");
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


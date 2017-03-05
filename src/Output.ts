import { app } from "./App";
import { YoutubeView } from "./views/Youtube";
import { ObjectView } from "./views/Object";
import { JSONView } from "./views/JSONView";
import { TypeDefinition, Type } from "./Types";
import { View } from "./View";
import { Context } from "./Context";
import { Expression } from './Expression';


export class Output {
	public html: String[] = [];

	defaultViews: { [key: string]: View<any> } = {};

	constructor(private context: Context) {
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

	printProperty(key: string, expr: Expression<any>, typeDefinition: TypeDefinition) {
		this.printHTML("<div>");
		this.printTag("label", { for: key }, key);
		this.printE(expr, typeDefinition);
		this.printHTML("</div>");
	}

	printE(expr: Expression<any>, type: Type) {
		if (!type && expr.getType) type = expr.getType(this.context);
		if (typeof type == "string") type = this.context.types[type];
		if (!type) type = this.context.types[typeof expr] || this.context.objectType;

		var view: View<any> = type.view || this.defaultViews[type.type] || this.context.jsonView;
		view.render(expr, type as TypeDefinition, this);
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


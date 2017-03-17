import { app } from "./App";
import { YoutubeView } from "./views/YoutubeView";
import { ObjectView } from "./views/ObjectView";
import { JSONView } from "./views/JSONView";
import { TypeDefinition, Type } from './Types';
import { View } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';
import { FormOptions, PageOptions, SectionOptions, ContentOptions, InputOptions, ButtonOptions, ArrayEntryOptions } from "./Theme";


export class Output {
	public html: String[] = [];
	private rendered = false;
	private editMode: boolean;

	constructor(private evalContext: Eval, private outputElt: HTMLElement | string, parent?: Output) {
		this.editMode = (parent && parent.editMode) || false;
	}

	isEditMode(): boolean {
		return this.editMode;
	}

	setEditMode(value: boolean) {
		//todo: perhaps check that the html is empty
		this.editMode = value;
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

	printProperty(key: string, options: ContentOptions, data: any, type: Type): View<any> {
		return this.evalContext.theme.printProperty(this, options, key, data, type);
	}

	printArrayEntry(key: number, options: ArrayEntryOptions, data: any, type: Type): View<any> {
		return this.evalContext.theme.printArrayEntry(this, options, key, data, type)
	}

	printInput(options: InputOptions, data: any, type: Type) {
		this.evalContext.theme.printInput(this, options, data, type)
	}

	printButton(options: ButtonOptions, text: string, action: () => void): void {
		this.evalContext.theme.printButton(this, options, text, action);
	}

	printForm(options: FormOptions, printContent: (contentOptions: ContentOptions) => void) {
		this.evalContext.theme.printForm(this, options, printContent)
	}

	printPage(options: PageOptions, printContent: (contentOptions: ContentOptions) => void) {
		this.evalContext.theme.printPage(this, options, printContent)
	}

	printSection(options: SectionOptions, printContent: (contentOptions: ContentOptions) => void) {
		this.evalContext.theme.printSection(this, options, printContent)
	}

	printDynamicSection(options: SectionOptions): Output {
		return this.evalContext.theme.printDynamicSection(this, options);
	}

	printText(text: string) {
		this.printTag("span", {}, text);
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

	append(): void {
		var htmlText = this.toString();
		var elt = (typeof this.outputElt) === "string" ? document.getElementById(this.outputElt as string) : this.outputElt as HTMLElement;
		if (elt == null) {
			setTimeout(() => this.append());
		} else {
			elt.innerHTML += htmlText;
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

		var newOutput = new Output(this.evalContext, nextId, this);
		return newOutput;
	}


}


import { app } from "./App";
import { YoutubeView } from "./views/YoutubeView";
import { ObjectView } from "./views/ObjectView";
import { JSONView } from "./views/JSONView";
import { Type, EnumEntry } from './Types';
import { View } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';
import { FormOptions, PageOptions, SectionOptions, ContentOptions, InputOptions, ButtonOptions, ArrayEntryOptions, SelectOptions } from "./Theme";
import { ArrayView } from "./views/ArrayView";
import { MapView } from "./views/MapView";


export class Output {
	public html: String[] = [];
	private rendered = false;
	private editMode: boolean;
	private afterRender: ((elt: HTMLElement) => void)[] = [];

	constructor(private evalContext: Eval, private outputElt: HTMLElement | string, parent?: Output) {
		this.editMode = (parent && parent.editMode) || false;
	}

	getOutputElt(): HTMLElement {
		return typeof this.outputElt === "string"
			? document.getElementById(this.outputElt)
			: this.outputElt;
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

	printProperty(objectView: ObjectView | MapView, key: string, options: ContentOptions, data: any, type: Type): View<any, any> {
		return this.evalContext.theme.printProperty(this, objectView, options, key, data, type);
	}

	printArrayEntry(arrayView: ArrayView, key: number, options: ArrayEntryOptions, data: any, type: Type): View<any, any> {
		return this.evalContext.theme.printArrayEntry(this, arrayView, options, key, data, type)
	}

	printInput(options: InputOptions, data: any, type: Type) {
		this.evalContext.theme.printInput(this, options, data, type)
	}

	printSelect(options: SelectOptions, data: string, type: Type, onChanged?: (string) => void) {
		this.evalContext.theme.printSelect(this, options, data, type, onChanged)
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
		var elt = this.getOutputElt();

		if (elt == null) {
			setTimeout(() => this.render());
		} else {
			elt.innerHTML = htmlText;
			this.rendered = true;
			this.html = [];
			this.raiseAfterRender(elt);
		}
	}

	append(): void {
		var htmlText = this.toString();
		var elt = (typeof this.outputElt) === "string" ? document.getElementById(this.outputElt as string) : this.outputElt as HTMLElement;
		if (elt == null) {
			setTimeout(() => this.append());
		} else {
			var tmpDiv = document.createElement('div');
			tmpDiv.innerHTML = htmlText;

			while (tmpDiv.firstChild) {
				elt.appendChild(tmpDiv.firstChild);
			}
			this.rendered = true;
			this.html = [];
			this.raiseAfterRender(elt);
		}
	}

	private raiseAfterRender(elt: HTMLElement) {
		for (var x in this.afterRender) {
			var callback = this.afterRender[x];
			callback(elt);
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

	printDynamic(tag: string, attributes: any, text: string | ((output: Output) => void), callback: (elt: HTMLElement) => void): Output {
		if (!attributes) attributes = {};
		var id = attributes.id;
		if (!id) {
			id = this.evalContext.nextId();
			attributes.id = id;
		}
		if (typeof text === "string") {
			this.printTag(tag, attributes, text);
		} else {
			this.printStartTag(tag, attributes);
			text(this);
			this.printEndTag();
		}
		this.afterRender.push(() => {
			var elt = document.getElementById(id);
			if (elt) {
				callback(elt);
			} else {
				console.error("Could not find element " + id);
			}
		})
		var newOutput = new Output(this.evalContext, id, this);
		return newOutput;

	}

}


import { app } from "./App";
import { YoutubeView } from "./views/YoutubeView";
import { ObjectView } from "./views/ObjectView";
import { JSONView } from "./views/JSONView";
import { Type, EnumEntry } from './Types';
import { View, ViewOrElement, AnyView } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';
import { FormOptions, PageOptions, SectionOptions, ViewOptions, InputOptions, ButtonOptions, ArrayOptions, SelectOptions, ButtonGroupOptions, ElementAttributes, PropertyOptions, ArrayEntryOptions } from "./Theme";
import { ArrayView } from "./views/ArrayView";
import { MapView } from "./views/MapView";
import { DynamicView } from "./views/DynamicView";


export class Output {
	public html: String[] = [];
	private editMode: boolean;
	private afterRenderCallbacks: ((elt: HTMLElement) => void)[] = [];

	constructor(private evalContext: Eval, private elt: HTMLElement, private parentOutput?: Output) {
		this.editMode = (parentOutput && parentOutput.editMode) || false;
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

	printTag(tag: string, attributes: ElementAttributes, content?: string | ((output: Output) => void)) {
		if (content || !Output.selfClosing[tag.toLowerCase()]) {
			this.printStartTag(tag, attributes);
			switch (typeof content) {
				case "function":
					(content as any)(this);
					break;
				case "undefined":
				// empty tag
				default:
					this.html.push(Output.escapeHtml(content));
					break;
			}
			this.printEndTag();
		} else {
			this.printStartTag(tag, attributes, true);
		}
	}

	private startedTags: String[] = [];

	printStartTag(tag: string, attributes: ElementAttributes, empty?: boolean) {
		this.html.push("<" + tag);
		for (var key in attributes) {
			this.html.push(" " + key + "=\"" + Output.escapeAttribute(attributes[key]) + "\"");
		}
		if (empty) {
			this.html.push(" />");
		} else {
			this.html.push(">");
			this.startedTags.push(tag);
		}
	}

	printEndTag() {
		this.html.push("</" + this.startedTags.pop() + ">");
	}

	printLabelAndView(key: string | ((output: Output) => void), options: PropertyOptions, data: any, type: Type, parentView: AnyView): AnyView {
		var view: AnyView;

		view = this.evalContext.getViewForExpr(data, type, parentView, this.editMode, options);

		this.printProperty(options,
			(output, options) => {
				if (typeof key === "string") {
					this.html.push(Output.escapeHtml(key));
				}
				else {
					key(output);
				}
			},
			view);
		return view;
	}

	printProperty(options: PropertyOptions,
		printKey: string | ((output: Output, options: PropertyOptions) => void), view: ViewOrElement) {
		if (!options) options = {};
		this.evalContext.theme.printProperty(this, options, printKey, view);
	}

	printDynamicObject(options: PropertyOptions,
		printKey: string | ((output: Output, options: PropertyOptions) => void), view: ViewOrElement) {
		if (!options) options = {};
		this.evalContext.theme.printDynamicObject(this, options, printKey, view);
	}

	printArrayEntry(arrayView: ArrayView<any>, options: ArrayEntryOptions, data: any, type: Type): AnyView {
		return this.evalContext.theme.printArrayEntry(this, arrayView, options, data, type)
	}

	printInput(options: InputOptions, data: any, type: Type) {
		this.evalContext.theme.printInput(this, options, data, type)
	}

	printSelect(options: SelectOptions, data: string, type: Type, onChanged?: (string) => void) {
		this.evalContext.theme.printSelect(this, options, data, type, onChanged)
	}

	printButton(options: ButtonOptions, action: (ev: Event) => void): void {
		this.evalContext.theme.printButton(this, options, action);
	}

	printButtonGroup(options: ButtonGroupOptions, action: (ev: Event, string) => void) {
		this.evalContext.theme.printButtonGroup(this, options, action);
	}

	printForm(options: FormOptions, printContent: (options: ViewOptions) => void) {
		this.evalContext.theme.printForm(this, options, printContent)
	}

	printPage(options: PageOptions, printContent: (options: ViewOptions) => void) {
		this.evalContext.theme.printPage(this, options, printContent)
	}

	printSection(options: SectionOptions, printContent: (options: ViewOptions) => void) {
		this.evalContext.theme.printSection(this, options, printContent)
	}

	printText(text: string) {
		this.html.push(Output.escapeHtml(text));
	}

	toString(): string {
		return this.html.join("");
	}

	render(): void {
		var htmlText = this.toString();

		this.elt.innerHTML = htmlText;
		this.html = [];
		this.raiseAfterRender();
	}

	append(): void {
		var htmlText = this.toString();
		var tmpDiv = document.createElement('div');
		tmpDiv.innerHTML = htmlText;

		while (tmpDiv.firstChild) {
			this.elt.appendChild(tmpDiv.firstChild);
		}
		this.html = [];
		this.raiseAfterRender();
	}

	private raiseAfterRender() {
		for (var x in this.afterRenderCallbacks) {
			var callback = this.afterRenderCallbacks[x];
			callback(this.elt);
		}
		this.afterRenderCallbacks = [];
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


	printAsync(tag: string, attributes: ElementAttributes, text: string | ((output: Output) => void), callback: (elt: HTMLElement) => void): void {
		if (!attributes) attributes = {};
		var id = attributes.id;
		if (!id) {
			id = this.evalContext.nextId(tag);
			attributes.id = id;
		}
		switch (typeof text) {
			case "string":
				this.printTag(tag, attributes, text);
				break;
			case "function":
				this.printStartTag(tag, attributes);
				(text as ((output: Output) => void))(this);
				this.printEndTag();
				break;
		}
		var elt = document.getElementById(id);
		if (elt) {
			callback(elt);
			return;
		}
		else {
			this.afterRenderCallbacks.push(() => {
				var elt = document.getElementById(id);
				if (elt) {
					callback(elt);
				} else {
					console.error("Could not find element " + id);
				}
			});
		}
	}

	getOutputElt(): HTMLElement {
		return this.elt;
	}
}


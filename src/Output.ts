import { app } from "./App";
import { YoutubeView } from "./views/YoutubeView";
import { ObjectView } from "./views/ObjectView";
import { JSONView } from "./views/JSONView";
import { Type, EnumEntry } from './Types';
import { View } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';
import { FormAttributes, PageAttributes, SectionAttributes, ElementAttributes, InputAttributes, ButtonAttributes, ArrayAttributes, SelectAttributes, ButtonGroupAttributes, CssAttributes } from "./Theme";
import { ArrayView } from "./views/ArrayView";
import { MapView } from "./views/MapView";
import { DynamicView } from "./views/DynamicView";


export class Output {
	public html: String[] = [];
	private rendered = false;
	private editMode: boolean;
	private afterRenderCallbacks: ((elt: HTMLElement) => void)[] = [];

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


	printTag(tag: string, attributes: CssAttributes, content?: string | ((output: Output) => void)) {
		this.html.push("<" + tag);
		for (var key in attributes) {
			this.html.push(" " + key + "=\"" + Output.escapeAttribute(attributes[key]) + "\"");
		}
		if (content || !Output.selfClosing[tag.toLowerCase()]) {
			this.html.push(">");
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

	printPropertyAndView(key: string | ((output: Output) => void), attributes: ElementAttributes, data: any, type: Type): View<any, Type, ElementAttributes> {
		var result: View<any, Type, ElementAttributes>;
		result = this.evalContext.getViewForExpr(data, type, this.editMode, attributes.cssAttributes);
		
		this.printRawProperty(attributes,
			result.getId(),
			(output, attributes) => {
			if (typeof key === "string") {
				this.html.push(Output.escapeHtml(key));
			}
			else {
				key(output);
			}
		}, (output, attributes) => {
			result.render(output);
		});
		return result;
	}

	printRawProperty(attributes: ElementAttributes,
		viewId: string,
		printLabel: string | ((output: Output, attributes: ElementAttributes) => void),
		printData: ((output: Output, attributes: ElementAttributes) => void)): void {
		this.evalContext.theme.printProperty(this, attributes, viewId, printLabel, printData);
	}

	printArrayEntry(arrayView: ArrayView<any>, key: number, attributes: ArrayAttributes, data: any, type: Type): View<any, Type, ElementAttributes> {
		return this.evalContext.theme.printArrayEntry(this, arrayView, attributes, key, data, type)
	}

	printInput(attributes: InputAttributes, data: any, type: Type) {
		this.evalContext.theme.printInput(this, attributes, data, type)
	}

	printSelect(attributes: SelectAttributes, data: string, type: Type, onChanged?: (string) => void) {
		this.evalContext.theme.printSelect(this, attributes, data, type, onChanged)
	}

	printButton(attributes: ButtonAttributes, text: string, action: () => void): void {
		this.evalContext.theme.printButton(this, attributes, text, action);
	}

	printButtonGroup(attributes: ButtonGroupAttributes, text: string, action: (string) => void) {
		this.evalContext.theme.printButtonGroup(this, attributes, text, action);
	}

	printForm(attributes: FormAttributes, printContent: (contentOptions: ElementAttributes) => void) {
		this.evalContext.theme.printForm(this, attributes, printContent)
	}

	printPage(attributes: PageAttributes, printContent: (contentOptions: ElementAttributes) => void) {
		this.evalContext.theme.printPage(this, attributes, printContent)
	}

	printSection(attributes: SectionAttributes, printContent: (contentOptions: ElementAttributes) => void) {
		this.evalContext.theme.printSection(this, attributes, printContent)
	}

	printSectionAsync(attributes: SectionAttributes): Output {
		return this.evalContext.theme.printSectionAsync(this, attributes);
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
		for (var x in this.afterRenderCallbacks) {
			var callback = this.afterRenderCallbacks[x];
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


	printAsync(tag: string, attributes: any, text: string | ((output: Output) => void), callback: (elt: HTMLElement) => void): Output {
		if (!attributes) attributes = {};
		var id = attributes.id;
		if (!id) {
			id = this.evalContext.nextId(tag);
			attributes.id = id;
		}
		if (typeof text === "string") {
			this.printTag(tag, attributes, text);
		} else {
			this.printStartTag(tag, attributes);
			text(this);
			this.printEndTag();
		}
		this.afterRenderCallbacks.push(() => {
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


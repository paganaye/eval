import { app } from "./App";
import { ObjectView } from "./views/ObjectView";
import { JSONView } from "./views/JSONView";
import { Type, EnumEntry, Visibility } from './Types';
import { View, AnyView } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';
import { PagePrintArgs, SectionPrintArgs, PrintArgs, InputPrintArgs, ButtonPrintArgs, ArrayPrintArgs, SelectPrintArgs, ButtonGroupPrintArgs, ElementAttributes, PropertyPrintArgs, ArrayEntryPrintArgs, GroupOptions } from "./Theme";
import { ArrayView } from "./views/ArrayView";
import { VariantView } from "./views/VariantView";


export class Output {
	public html: String[] = [];
	private editMode: boolean;
	private afterDomCreatedCallbacks: ((elt: HTMLElement) => void)[] = [];

	constructor(private evalContext: Eval, private elt?: HTMLElement, private parentOutput?: Output) {
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

	printLabelAndView(printArgs: PropertyPrintArgs, data: any, dataType: Type, parentView: AnyView): AnyView {
		var view: AnyView;

		view = this.evalContext.instantiate(data, dataType, parentView, this.editMode, printArgs);

		if (!printArgs) printArgs = { visibility: dataType.visibility || Visibility.Shown };
		if (dataType.visibility> printArgs.visibility) printArgs.visibility= dataType.visibility;
		this.evalContext.theme.printProperty(this, printArgs, view);
		return view;
	}



	printArrayEntry(arrayView: ArrayView<any>, printArgs: ArrayEntryPrintArgs, data: any, dataType: Type): AnyView {
		return this.evalContext.theme.printArrayEntry(this, arrayView, printArgs, data, dataType)
	}

	printInput(printArgs: InputPrintArgs, data: any, dataType: Type, callback: (elt: HTMLInputElement) => void): void {
		this.evalContext.theme.printInput(this, printArgs, data, dataType, callback)
	}

	printSelect(printArgs: SelectPrintArgs, data: string, dataType: Type, onChanged?: (string) => void) {
		this.evalContext.theme.printSelect(this, printArgs, data, dataType, onChanged)
	}

	printButton(printArgs: ButtonPrintArgs, action: (ev: Event) => void): void {
		this.evalContext.theme.printButton(this, printArgs, action);
	}

	printButtonGroup(printArgs: ButtonGroupPrintArgs, action: (ev: Event, string) => void) {
		this.evalContext.theme.printButtonGroup(this, printArgs, action);
	}

	printPage(printArgs: PagePrintArgs, printContent: (printArgs: PrintArgs) => void) {
		this.evalContext.theme.printPage(this, printArgs, printContent)
	}

	printGroup(printArgs: GroupOptions, printContent: (printArgs: PrintArgs) => void) {
		this.evalContext.theme.printGroup(this, printArgs, printContent)
	}

	printSection(printArgs: SectionPrintArgs, printContent: (printArgs: PrintArgs) => void) {
		this.evalContext.theme.printSection(this, printArgs, printContent)
	}

	printText(text: string) {
		this.html.push(Output.escapeHtml(text));
	}

	toString(): string {
		return this.html.join("");
	}

	domReplace(): void {
		var htmlText = this.toString();

		this.elt.innerHTML = htmlText;
		this.html = [];
		this.raiseAfterDomCreated();
	}

	domAppend(): void {
		var htmlText = this.toString();
		var tmpDiv = document.createElement('div');
		tmpDiv.innerHTML = htmlText;

		while (tmpDiv.firstChild) {
			this.elt.appendChild(tmpDiv.firstChild);
		}
		this.html = [];
		this.raiseAfterDomCreated();
	}

	private raiseAfterDomCreated() {
		for (var x in this.afterDomCreatedCallbacks) {
			var callback = this.afterDomCreatedCallbacks[x];
			callback(this.elt);
		}
		this.afterDomCreatedCallbacks = [];
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


	printAsync(tag: string, attributes: ElementAttributes, text: string | ((output: Output) => void), callback: (elt: HTMLElement, output: Output) => void): void {
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

		this.afterDomCreatedCallbacks.push(() => {
			var elt = document.getElementById(id);
			if (elt) {
				var output = new Output(this.evalContext, elt, this);
				callback(elt, output);
			} else {
				console.error("Could not find element " + id);
			}
		});
	}

	getOutputElt(): HTMLElement {
		return this.elt;
	}
}


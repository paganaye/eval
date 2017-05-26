import { app } from "./App";
import { ObjectView } from "./views/ObjectView";
import { JSONView } from "./views/JSONView";
import { Type, SelectEntry, Visibility } from './Types';
import { View, AnyView, ViewParent } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';
import { PagePrintArgs, SectionPrintArgs, PrintArgs, InputPrintArgs, ButtonPrintArgs, ArrayPrintArgs, SelectPrintArgs, ButtonGroupPrintArgs, ElementAttributes, PropertyPrintArgs, ArrayEntryPrintArgs, GroupOptions, BreadcrumpPrintArgs, JumbotronPrintArgs, NotificationPrintArgs, RefreshOptions, NavbarPrintArgs } from "./Theme";
import { ArrayView, ArrayEntryView } from "./views/ArrayView";
import { VariantView } from "./views/VariantView";
import { Notification } from "./commands/Notification"


export abstract class Output {
	arrayEntriesOutput
	public html: String[] = [];
	private editMode: boolean;
	private afterDomCreatedCallbacks: ((elt: HTMLElement) => void)[] = [];
	private id: string;
	static counter: number = 0;


	constructor(protected evalContext: Eval, private elt?: HTMLElement, private parentOutput?: Output) {
		this.editMode = (parentOutput && parentOutput.editMode) || false;
		this.id = "output#" + (++Output.counter);
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

	printProperty(viewParent: ViewParent, propertyPrintArgs: PropertyPrintArgs, data: any, dataType: Type): AnyView {
		var view: AnyView;

		view = this.evalContext.instantiate(viewParent, propertyPrintArgs.label, data, dataType, this.editMode, propertyPrintArgs);

		if (!propertyPrintArgs) propertyPrintArgs = { visibility: dataType.visibility || "visible" };
		if (dataType.visibility > propertyPrintArgs.visibility) propertyPrintArgs.visibility = dataType.visibility;

		this.printPropertyView(propertyPrintArgs, view);
		return view;
	}

	abstract printPropertyView(propertyPrintArgs: PropertyPrintArgs, view: AnyView): void;

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
			if (callback && typeof callback === "function") callback(this.elt);
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
			return this.entityMap[s];
		});
	}

	static escapeAttribute(string) {
		return String(string).replace(/[&<>"]/g, (s) => {
			return this.entityMap[s];
		});
	}


	printAsync(tag: string, attributes: ElementAttributes, text: string | ((output: Output) => void), callback: (output: Output) => void): void {
		if (!attributes) attributes = {};
		var id = attributes.id;
		if (!id) {
			id = this.evalContext.nextId(tag);
			attributes.id = id;
		}

		switch (typeof text) {
			case "undefined":
				text = "button";
			//continue;
			case "string":
				this.printTag(tag, attributes, text);
				break;
			case "function":
				this.printStartTag(tag, attributes);
				(text as ((output: Output) => void))(this);
				this.printEndTag();
				break;
		}

		this.afterDomCreatedCallbacks.push(() => {
			var elt: HTMLElement = document.getElementById(id);
			if (elt) {
				var newOutput = this.evalContext.theme.createOutput(elt, this);
				callback(newOutput);
			} else {
				console.error("Could not find element " + id);
			}
		});
	}


	getOutputElt(): HTMLElement {
		return this.elt;
	}


	abstract printPage(printArgs: PagePrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void): void;
	abstract printGroup(printArgs: GroupOptions, printContent: (output: Output, printArgs: PrintArgs) => void): void;
	abstract printSection(printArgs: SectionPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void);
	abstract printArray(arrayView: ArrayView<any>, printArgs: ArrayPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void): void;
	abstract printArrayEntry(arrayEntryView: ArrayEntryView, printArgs: ArrayEntryPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void): void;

	abstract printInput(printArgs: InputPrintArgs, data: any, dataType: Type, callback: (elt: HTMLInputElement) => void): void;
	abstract printSelect(printArgs: SelectPrintArgs, data: string, dataType: Type, onChanged?: (string) => void): void;
	abstract printButton(printArgs: ButtonPrintArgs, action: (ev: Event) => void): void;
	abstract printButtonGroup(printArgs: ButtonGroupPrintArgs, action: (ev: Event, text: string) => void): void;
	abstract printNotification(printArgs: NotificationPrintArgs, data: Notification, callback: (notification: Notification, id: string) => void): void;
	abstract printNavbar(printArgs: NavbarPrintArgs);
	abstract printBreadcrump(printArgs: BreadcrumpPrintArgs);
	abstract printJumbotron(printArgs: JumbotronPrintArgs);
}


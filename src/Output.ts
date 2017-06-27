import { TableView } from './views/TableView';
import { app } from "./App";
import { ObjectView } from "./views/ObjectView";
import { JSONView } from "./views/JSONView";
import { Type, SelectEntry, Visibility } from './Types';
import { View, AnyView, ViewParent } from "./View";
import { Eval } from "./Eval";
import { Expression, GetVariable } from './Expression';
import {
	ArrayEntryPrintArgs,
	ArrayPrintArgs,
	BreadcrumpPrintArgs,
	ButtonGroupPrintArgs,
	ButtonPrintArgs,
	ElementAttributes,
	GroupOptions,
	InputPrintArgs,
	JumbotronPrintArgs,
	ModalPrintArgs,
	NavbarPrintArgs,
	NotificationPrintArgs,
	PagePrintArgs,
	PrintArgs,
	PropertyPrintArgs,
	RefreshOptions,
	SectionPrintArgs,
	SelectPrintArgs,
	TablePrintArgs,
	TableRowPrintArgs,
	TabPagePrintArgs
} from './Theme';
import { ArrayView, ArrayEntryView } from "./views/ArrayView";
import { VariantView } from "./views/VariantView";
import { Notification } from "./commands/Notification"
import { SelectView } from "views/SelectView";

var $: any = (window as any).$;

export const enum RenderMode {
	View,
	Edit
}

export class ModalContext {
	buttonText: string;
}

export class Output {
	arrayEntriesOutput
	public html: String[] = [];
	private renderMode: RenderMode;
	private afterDomCreatedCallbacks: ((elt: HTMLElement) => void)[] = [];
	private id: string;
	static counter: number = 0;


	constructor(protected evalContext: Eval, private elt?: HTMLElement, private parentOutput?: Output) {
		this.renderMode = (parentOutput && parentOutput.renderMode) || RenderMode.View;
		this.id = "output#" + (++Output.counter);
	}

	getRenderMode(): RenderMode {
		return this.renderMode;
	}

	setRenderMode(value: RenderMode) {
		//todo: perhaps check that the html is empty
		this.renderMode = value;
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
		view = this.evalContext.instantiate(viewParent, propertyPrintArgs.label, data, dataType, this.renderMode, propertyPrintArgs);
		this.printPropertyView(propertyPrintArgs, view);
		return view;
	}

	printPropertyView(printArgs: PropertyPrintArgs, view: AnyView): void {
		this.printHTML("TODO");
	}

	printText(text: string) {
		this.html.push(Output.escapeHtml(text));
	}

	toString(): string {
		return this.html.join("");
	}

	domReplace(): void {
		var htmlText = this.toString();
		if (this.elt) {
			this.elt.innerHTML = htmlText;
		}
		this.html = [];
		this.raiseAfterDomCreated();
	}

	domAppend(parentTag: string): void {
		if (this.elt) {
			var htmlText = this.toString();
			var tmpDiv = document.createElement(parentTag);
			tmpDiv.innerHTML = htmlText;

			while (tmpDiv.firstChild) {
				this.elt.appendChild(tmpDiv.firstChild);
			}
			this.html = [];
		}
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


	printAsync(tag: string, attributes: ElementAttributes, text: string | (() => void), callback: (output: Output) => void): void {
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


	printPage(printArgs: PagePrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void): void {
		this.printStartTag("div", { class: "container" });
		printContent(this, {});
		this.printEndTag();
		document.title = printArgs.title;
	}

	printGroup(printArgs: GroupOptions, printContent: (output: Output, printArgs: PrintArgs) => void): void {
		this.printStartTag("div", { class: "group" });
		this.printHTML("<p>hello</p>")
		printContent(this, {});
		this.printEndTag();
	}

	public getClassPrefix() {
		return "eval-";
	}

	printTabHeaders(tabs: { text: string, id: string }[]) {
		this.printStartTag("div", { class: "object-body" });

		this.printAsync("div", { class: "form-group" }, "", (output) => {
			if (tabs.length) {
				output.printStartTag("ul", { class: "nav nav-tabs", role: "tablist" });
				var first = true;
				for (var h of tabs) {
					output.printHTML('<li class="nav-item">');
					var headerAttributes = { class: "nav-link", "data-toggle": "tab", href: "#" + h.id, role: "tab" };
					if (first) {
						Output.addClass(headerAttributes, "active");
						first = false;
					}
					output.printTag('a', headerAttributes, h.text);
					output.printHTML('</li>');
				}
				output.printEndTag();
				output.domReplace();
			} else {
				output.getOutputElt().remove();
			}
		});
		this.printEndTag();
	}

	printTabContent(printArgs: PrintArgs, printContent: (output: Output) => void) {
		this.printStartTag("div", { class: "tab-content" });
		printContent(this);
		this.printEndTag();
	}

	printModal(printArgs: ModalPrintArgs, printContent: (output: Output) => void, buttonClicked: (button: ModalContext) => void) {
		var elt = document.createElement("div");
		document.body.appendChild(elt);
		var o = this.evalContext.theme.createOutput(elt, this);
		var id = (printArgs as any).id;
		if (id) {
			var previousElt = document.getElementById(id);
			console.log("shouldRemove");

			if (previousElt) previousElt.remove();

		}
		var attributes: ElementAttributes = { id: id };

		//		var attributes: ElementAttributes = { id: (printArgs as any).id };

		Output.addClass(attributes, "modal fade");
		o.printStartTag("div", attributes);
		o.printHTML('  <div class="modal-dialog" role="document">');
		o.printHTML('    <div class="modal-content">');
		o.printHTML('      <div class="modal-header">');
		o.printTag('h5', { class: "modal-title" }, printArgs.title);
		o.printHTML('        <button type="button" class="close" data-dismiss="modal" aria-label="Close">');
		o.printHTML('          <span aria-hidden="true">&times;</span>');
		o.printHTML('        </button>');
		o.printHTML('      </div>');
		o.printHTML('      <div class="modal-body">');
		printContent(o);
		o.printHTML('      </div>');
		o.printHTML('      <div class="modal-footer">');
		var first = true;
		if (printArgs.buttons) {
			for (var b of printArgs.buttons) {
				o.printButton({ buttonText: b }, ev => {
					buttonClicked({
						buttonText: (ev.target as HTMLInputElement).innerText
					})
				});
				//o.printTag('button', { type: "button", class: first ? "btn btn-primary" : "btn", "data-dismiss": "modal" }, b);
				first = false;
			}
		}
		o.printHTML('      </div>');
		o.printHTML('    </div>');
		o.printHTML('  </div>');
		o.printEndTag();
		o.domReplace();

	}

	showModal(id: string) {
		$('#' + id).modal('show');

	}

	closeModal(id: string) {
		$('#' + id).modal('hide');
	}

	printTabPage(printArgs: TabPagePrintArgs, printContent: (output: Output) => void) {

		if (printArgs.modal) {
			var modalArgs = printArgs as any as ModalPrintArgs;
			modalArgs.buttons = ["Close"];
			this.printModal(modalArgs, (output) => printContent(output), b => {

			});
		} else {
			var attributes: ElementAttributes = { class: this.getClassPrefix() + printArgs.id };

			if (printArgs.title) {
				var id = printArgs.id || this.evalContext.nextId("tab");
				attributes.id = id;
				Output.addClass(attributes, "tab-pane");
				if (printArgs.active) {
					Output.addClass(attributes, "active");
				}
				attributes.role = "tabpanel";
				this.printStartTag("div", attributes);
				printContent(this);
				this.printEndTag();
			} else {
				this.printStartTag("div", attributes);
				printContent(this);
				this.printEndTag();
			}
		}
	}
	/*
				case "property-group":
					if (printArgs.title) {
						var id = this.evalContext.nextId("tab");
						Output.addClass(attributes, "tab-pane");
						if (printArgs.active) {
							Output.addClass(attributes, "active");
						}
						attributes.role = "tabpanel";
						attributes.id = id;
						this.printStartTag("div", attributes);
						printContent(this, {});
						this.printEndTag();
					} else {
						this.printStartTag("div", attributes);
						printContent(this, {});
						this.printEndTag();
					}
					break;
	
	*/
	printSection(printArgs: SectionPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void) {
		var attributes: ElementAttributes = { class: this.getClassPrefix() + printArgs.name };
		switch (printArgs.name) {
			case "array-buttons":
			case "map-properties":
			case "variant-control":
			case "object-properties":
			case "create":
			case "update":
				this.printStartTag("div", attributes);
				printContent(this, {});
				this.printEndTag();
				break;

			case "variant-select-container":
				Output.addClass(attributes, "form-group");
				this.printStartTag("div", attributes);
				printContent(this, {});
				this.printEndTag();
				break;

			// case "array-entries":
			// case "nodiv":
			// case "object-orphans":
			case "frame":
			case "array":
			case "object":
				// no tag for those but we pass the printArgs along
				printContent(this, printArgs);
				break;

			default:
				console.error("Section " + printArgs.name + " not implemented by Bootstrap Eval theme.");
				this.printStartTag("div", attributes);
				printContent(this, {});
				this.printEndTag();

				break;
		}
	}

	printArray(arrayView: ArrayView<any>, printArgs: ArrayPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void): void {
		printContent(this, printArgs);
	}

	printArrayEntry(arrayEntryView: ArrayEntryView, printArgs: ArrayEntryPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void): void {

		this.printStartTag("div", { class: "card array-entry", id: printArgs.id });;//    <div class="card">
		Output.addClass({}, "card-header");
		Output.addClass({}, "collapsed");

		var accordionId = printArgs.entriesElementId
		this.printTag("a", {
			href: "#" + printArgs.id + "-content", class: "sort-handle collapsible-title", "data-toggle": "collapse",
			"data-parent": "#" + accordionId
		}, (output) => {
			if (printArgs.printLabel) printArgs.printLabel(this);
			if (printArgs.deletable) {
				this.printButton({ buttonText: "×", class: "close" }, (ev: Event) => {
					var elt = (ev.target as HTMLElement).parentElement;
					if (elt) elt.parentElement.remove();
				});
			}
		});
		var contentAttributes = { class: "card-block collapse", id: printArgs.id + "-content" };
		//var innerView = this.evalContext.instantiate(arrayView, "[" + printArgs.id + ']', data, dataType, this.isEditMode(), {});

		this.printAsync("div", contentAttributes, "...1", (output) => {
			var $: any = window["$"];
			//innerView.render(output);
			if (printArgs.active) {
				var $elt = $(output.getOutputElt());
				//Output.addClass(contentAttributes, "show");
				$elt.collapse("show");
				$elt.siblings().collapse("hide");
			}
			printContent(output, {});
			output.domReplace();
		})

		// this.printStartTag("div", contentAttributes);
		//this.printEndTag(); // card-block

		this.printEndTag(); // card

		//return innerView;
	}

	printTable(arrayView: TableView<any>, printArgs: TablePrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void): void {
		printContent(this, printArgs);
	}

	printTableRow(arrayEntryView: ArrayEntryView, printArgs: TableRowPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void): void {

		this.printStartTag("div", { class: "card array-entry", id: printArgs.id });;//    <div class="card">
		Output.addClass({}, "card-header");
		Output.addClass({}, "collapsed");

		var accordionId = printArgs.entriesElementId
		this.printTag("a", {
			href: "#" + printArgs.id + "-content", class: "sort-handle collapsible-title", "data-toggle": "collapse",
			"data-parent": "#" + accordionId
		}, (output) => {
			this.printText(printArgs.label);
			if (printArgs.deletable) {
				this.printButton({ buttonText: "×", class: "close" }, (ev: Event) => {
					var elt = (ev.target as HTMLElement).parentElement;
					if (elt) elt.parentElement.remove();
				});
			}
		});
		var contentAttributes = { class: "card-block collapse", id: printArgs.id + "-content" };
		//var innerView = this.evalContext.instantiate(arrayView, "[" + printArgs.id + ']', data, dataType, this.isEditMode(), {});

		this.printAsync("div", contentAttributes, "...1", (output) => {
			var $: any = window["$"];
			//innerView.render(output);
			if (printArgs.active) {
				var $elt = $(output.getOutputElt());
				//Output.addClass(contentAttributes, "show");
				$elt.collapse("show");
				$elt.siblings().collapse("hide");
			}
			printContent(output, {});
			output.domReplace();
		})

		// this.printStartTag("div", contentAttributes);
		//this.printEndTag(); // card-block

		this.printEndTag(); // card

		//return innerView;
	}

	inputTypes = {
		boolean: "checkbox"
	}

	htmlInputType = {
		"button": "Defines a clickable button (mostly used with a JavaScript to activate a script)",
		"checkbox": "Defines a checkbox",
		"color": "Defines a color picker",
		"date": "Defines a date control (year, month and day (no time))",
		"datetime-local": "Defines a date and time control (year, month, day, hour, minute, second, and fraction of a second (no time zone)",
		"email": "Defines a field for an e-mail address",
		"file": "Defines a file-select field and a \"Browse...\" button (for file uploads)",
		"hidden": "Defines a hidden input field",
		"image": "Defines an image as the submit button",
		"month": "Defines a month and year control (no time zone)",
		"number": "Defines a field for entering a number",
		"password": "Defines a password field (characters are masked)",
		"radio": "Defines a radio button",
		"range": "Defines a control for entering a number whose exact value is not important (like a slider control).Default range is from 0 to 100",
		"reset": "Defines a reset button (resets all form values to default values)",
		"search": "Defines a text field for entering a search string",
		"submit": "Defines a submit button",
		"tel": "Defines a field for entering a telephone number",
		"text": "Default. Defines a single- line text field (default width is 20 characters)",
		"time": "Defines a control for entering a time (no time zone)",
		"url": "Defines a field for entering a URL",
		"week": "Defines a week and year control (no time zone)"
	};

	printInput(printArgs: InputPrintArgs, data: any, dataType: Type, callback: (elt: HTMLInputElement) => void): void {
		var attributes: ElementAttributes = { value: data };
		Output.addClass(attributes, "form-control");
		switch (this.renderMode) {
			case RenderMode.View:
				attributes.readonly = "readonly";
				break;
		}
		attributes.id = printArgs.id;

		attributes.type = this.inputTypes[dataType._kind] ||
			(this.htmlInputType[dataType._kind] ? dataType._kind : "text");
		if (attributes.type === "checkbox" && data) {
			attributes.checked = "checked";
		}
		// if (typeof data !== "string") {
		// 	attributes.value = JSON.stringify(data);
		// }
		this.printAsync("input", attributes, "", (output) => {
			callback(output.getOutputElt() as HTMLInputElement);
		});
	}

	printSelect(view: SelectView, printArgs: SelectPrintArgs, data: string, datType: Type, onChanged?: (string) => void) {
		this.printSelectElt(printArgs, data, (output) => {
			var selectElement = output.getOutputElt() as HTMLSelectElement;

			selectElement.onfocus = () => {
				if (view) view.onFocus(selectElement);
			}

			selectElement.onchange = ((a: Event) => {
				var select = a.target as HTMLSelectElement;
				var option = select.selectedOptions[0] as HTMLOptionElement;
				var key = option.attributes['key'];
				var value = key ? key.value : option.value;
				if (onChanged) onChanged(value);
			});
		});
	}

	printSelectElt(printArgs: SelectPrintArgs, data: string, callback: (output: Output) => void) {
		var attributes: ElementAttributes = {};
		attributes.id = printArgs.id;
		this.printAsync("select", attributes, () => {
			this.printSelectOptions(printArgs.entries, data);
		}, callback);
	}

	printSelectOptions(entries: SelectEntry[], data: any) {
		var output = this;
		var currentGroup = null;
		for (var entry of entries) {
			if (entry.group != currentGroup) {
				if (currentGroup) this.printEndTag();
				currentGroup = entry.group;
				output.printStartTag("optgroup", { label: currentGroup });
			}
			var optionAttributes = { key: entry.key };
			if (data == entry.key) {
				optionAttributes["selected"] = true;
			}
			output.printTag("option", optionAttributes, entry.label || entry.key);
		}
		if (currentGroup) {
			output.printEndTag();
			currentGroup = null;
		}
	}


	printButton(printArgs: ButtonPrintArgs, action: (ev: Event) => void): void {
		var attributes: ElementAttributes = { id: printArgs.id };
		if (printArgs.class) attributes.class = printArgs.class;
		this.printAsync("button", attributes, printArgs.buttonText, (output) => {
			var elt = output.getOutputElt();
			elt.onclick = (ev) => action(ev);
		});
	}

	printButtonGroup(printArgs: ButtonGroupPrintArgs, action: (ev: Event, text: string) => void): void {
		this.printTag("div", { class: "dropdown" }, () => {

			this.printStartTag("a",
				{
					type: "button", class: "btn btn-secondary dropdown-toggle", "data-toggle": "dropdown",
					"aria-haspopup": "true", "aria-expanded": "false"
				});
			this.printText(printArgs.buttonText);
			this.printEndTag(); // button

			this.printStartTag("div", { class: "dropdown-menu" });

			var currentGroup = null;
			for (let entry of printArgs.entries) {
				if (entry.group != currentGroup) {
					this.printHTML("<div class=\"dropdown-divider\"></div>");
					this.printText(entry.group);
					this.printHTML("</li>");
				}
				var optionAttributes = { key: entry.key };
				this.printAsync("a", { class: "dropdown-item", href: "#" },
					entry.label || entry.key, (output) => {
						output.getOutputElt().onclick = (ev) => {
							ev.preventDefault();
							action(ev, entry.key);
						}
					});
			}
			this.printEndTag(); // dropdown-menu
		});
	}

	printNotification(printArgs: NotificationPrintArgs, data: Notification, callback: (notification: Notification, id: string) => void): void {
		this.printTag("div", { class: "notification" }, (output) => {
			this.printStartTag("div", { class: "notification-buttons" });
			if (data.buttons && data.buttons.length) {
				for (var b of data.buttons) {
					this.printStartTag("div", { class: "notification-button" });
				}
			}
			if (data.closable) {
				this.printStartTag("div", { class: "close-button" });
			}
			this.printEndTag();
			this.printTag("div", {}, data.title);
			if (data.text) this.printTag("div", {}, data.text);
		});
	}

	printNavbar(printArgs: NavbarPrintArgs) {

	}

	printBreadcrump(printArgs: BreadcrumpPrintArgs) {


	}
	printJumbotron(printArgs: JumbotronPrintArgs) {

	}

	static addClass(css: ElementAttributes, newEntry: string): void {
		if (css.class) {
			var bits = css.class.split(' ');
			if (bits.indexOf(newEntry) >= 0) return;
			bits.push(newEntry);
			css.class = bits.join(" ");

		} else css.class = newEntry;
	}

}

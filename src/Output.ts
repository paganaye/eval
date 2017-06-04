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
import { SelectView } from "views/SelectView";


export class Output {
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

		this.printPropertyView(propertyPrintArgs, view);
		return view;
	}

	printPropertyView(printArgs: PropertyPrintArgs, view: AnyView): void {
		var validationStatus = view.getValidationStatus();
		var attrs = { id: view.getId() };

		var valueAttributes = {};
		var visibility = printArgs.visibility;
		this.printStartTag("div", attrs);
		switch (visibility) {
			case "visible":
				var labelAttributes = { for: view.getId() };
				this.printTag("label", labelAttributes,
					printArgs.printLabel ? (o) => printArgs.printLabel(o, printArgs) : printArgs.label);
				break;
		}
		this.printStartTag("div", valueAttributes);
		view.render(this);

		this.printTag('div', { id: view.getId() + "-validation" },
			view.getValidationText() || "");
		this.printTag('small', { id: view.getId() + "-description" }, view.getDescription() || "");

		this.printEndTag();
		this.printEndTag();
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

	printSection(printArgs: SectionPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void) {
		var attributes: ElementAttributes = { class: this.getClassPrefix() + printArgs.name };
		switch (printArgs.name) {
			case "property-groups":
				// this.printStartTag("div", {});
				// this.printHTML("...hi...")
				// this.printEndTag();
				this.printStartTag("div", { class: "object-body" });
				var headers: { key: string, label: string }[] = [];

				this.printAsync("div", { class: "form-group" }, "", (output) => {
					if (headers.length) {
						output.printStartTag("ul", { class: "nav nav-tabs", role: "tablist" });
						var first = true;
						for (var h of headers) {
							output.printHTML('<li class="nav-item">');
							var headerAttributes = { class: "nav-link", "data-toggle": "tab", href: "#" + h.key, role: "tab" };
							if (first) {
								Output.addClass(headerAttributes, "active");
								first = false;
							}
							output.printTag('a', headerAttributes, h.label);
							output.printHTML('</li>');
						}
						output.printEndTag();
						output.domReplace();
					} else {
						output.getOutputElt().remove();
					}
				});

				Output.addClass(attributes, "tab-content");
				this.printStartTag("div", attributes);
				printContent(this, {
					addHeaderCallback: (key, label) => {
						headers.push({ key: key, label: label });
					}
				});
				this.printEndTag();
				this.printEndTag();
				break;
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

			case "property-group":
				if (printArgs.title) {
					var id = this.evalContext.nextId("tab");
					if (printArgs.addHeaderCallback) {
						printArgs.addHeaderCallback(id, printArgs.title);
					}
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
		if (!this.isEditMode()) {
			attributes.readonly = "readonly";
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

	printSelect(view: SelectView, printArgs: SelectPrintArgs, data: string, dataType: Type, onChanged?: (string) => void): void {
		var attributes: ElementAttributes = { class: "form-control" };
		attributes.id = printArgs.id;
		this.printAsync("select", attributes, () => {
			this.printSelectOptions(printArgs.entries, data);
		}, (output) => {
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

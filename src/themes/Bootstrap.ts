import { Theme, FormOptions, PageOptions, SectionOptions, ViewOptions, InputOptions, ButtonOptions, ArrayOptions, SelectOptions, ButtonGroupOptions, VariantObjectOptions, ElementAttributes, PropertyOptions, ArrayEntryOptions, MapEntryOptions, GroupOptions, RefreshOptions } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { View, AnyView, ValidationStatus } from "../View";
import { ObjectView } from "../views/ObjectView";
import { ArrayView } from "../views/ArrayView";
import { VariantView } from "../views/VariantView";


export class Bootstrap extends Theme {

	classPrefix = "evl-";

	constructor(evalContext: Eval, private addScripts: boolean = true) {
		super(evalContext);
	}

	initialize(output: Output) {
		if (this.addScripts) {
			// remember to remove jquery if you update this. JQuery is in the main page
			output.printHTML('<link rel="stylesheet" href="/libs/bootstrap/css/bootstrap.min.css" >');
			output.printHTML('<script src="/libs/tether.min.js"></script>');
			output.printHTML('<script src="/libs/bootstrap/js/bootstrap.min.js"></script>');
			output.printHTML('<style>');
			output.printHTML('.array-entry > .form-group > label {');
			output.printHTML('    background-color: inherit;');
			output.printHTML('    cursor: move;');
			output.printHTML('    border-right: 2px solid green;');
			output.printHTML('}');
			output.printHTML('</style>');
		}
	}

	printProperty(output: Output, options: PropertyOptions, view: AnyView) {

		var validationStatus = view.getValidationStatus();
		var className = this.getClassName(view.getValidationStatus());

		var attrs = { class: "form-group row", id: view.getId() + "-container" };
		if (className) attrs.class += " " + className;
		output.printStartTag("div", attrs);

		var valueAttributes = {};

		if (options.showLabel) {
			var labelAttributes = { class: "col-form-label col-lg-2", for: view.getId() };
			output.printTag("label", labelAttributes,
				options.printLabel ? (o) => options.printLabel(o, options) : options.label);
			this.addClass(valueAttributes, "col-lg-10");
		}
		else {
			this.addClass(valueAttributes, "col-12");
		}


		output.printStartTag("div", valueAttributes);
		view.render(output);

		output.printTag('div', { class: "form-control-feedback", id: view.getId() + "-validation" },
			view.getValidationText() || "");
		output.printTag('small', { class: "form-text text-muted", id: view.getId() + "-description" }, view.getDescription() || "");

		output.printEndTag(); // col-lg-10;
		output.printEndTag(); // row
	}

	// printVariantProperty(output: Output, options: PropertyOptions, view: View) {
	//     var parentView = view.getParentView();
	//     if (parentView instanceof ArrayView) {

	//     }
	//     output.printStartTag("div", { class: "evl-variant-type" });
	//     output.printTag("label", { class: "col-lg-2 col-form-label", for: view.getId() },
	//         options.printLabel ? (o) => options.printLabel(o, options) : options.label);
	//     output.printEndTag();
	//     view.render(output);
	//     output.printEndTag();
	// }

	printArrayEntry(output: Output, arrayView: ArrayView<any>, options: ArrayEntryOptions, data: any, type: Type): AnyView {
		output.printStartTag("div", { class: "card array-entry", id: options.id });;//    <div class="card">
		this.addClass({}, "card-header");
		this.addClass({}, "collapsed");

		var accordionId = options.entriesElementId
		output.printTag("a", {
			href: "#" + options.id + "-content", class: "sort-handle collapsible-title", "data-toggle": "collapse",
			"data-parent": "#" + accordionId
		}, (output) => {
			output.printText(options.label);
			if (options.deletable) {
				output.printButton({ buttonText: "×", class: "close" }, (ev: Event) => {
					var elt = (ev.target as HTMLElement).parentElement;
					if (elt) elt.parentElement.remove();
				});
			}
		});
		var contentAttributes = { class: "card-block collapse", id: options.id + "-content" };
		var innerView = this.evalContext.instantiate(data, type, arrayView, output.isEditMode(), {});

		output.printAsync("div", contentAttributes, "...", (elt, output) => {
			var $: any = window["$"];
			innerView.render(output);
			output.domReplace();
			if (options.active) {
				//this.addClass(contentAttributes, "show");
				$(elt).collapse("show");
				$(elt).siblings().collapse("hide");
			}
		})
		// output.printStartTag("div", contentAttributes);
		//output.printEndTag(); // card-block

		output.printEndTag(); // card

		return innerView;
	}

	getArrayEntriesIndex(element: HTMLElement): string[] {
		var children = element.children;
		var result = [];
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			result.push(child.id);
		}
		return result;
	}

	printForm(output: Output, options: FormOptions, printContent: (output: Output, options: ViewOptions) => void) {
		output.printStartTag("form", {});
		printContent(output, {});
		// print buttons...
		if (!options.buttons) options.buttons = ["Submit"];

		output.printStartTag("div", {});
		var className = "btn";
		for (var button of options.buttons) {
			output.printTag("button", { type: "button", class: className }, button as string);
			className = "";
		}
		output.printEndTag(); // buttons
		output.printEndTag(); // form                
	}

	printPage(output: Output, options: PageOptions, printContent: (output: Output, options: ViewOptions) => void) {
		output.printStartTag("div", { class: "container" });
		printContent(output, {});
		output.printEndTag();
		document.title = options.title;
	}

	printGroup(output: Output, options: GroupOptions, printContent: (output: Output, options: ViewOptions) => void) {
		output.printStartTag("div", { class: "group" });
		output.printHTML("<p>hello</p>")
		printContent(output, {});
		output.printEndTag();
	}

	printSection(output: Output, options: SectionOptions, printContent: (options: ViewOptions) => void) {
		this.addClass({}, options.name);
		var attributes: ElementAttributes = { class: this.classPrefix + options.name };
		switch (options.name) {
			case "property-groups":
				// output.printStartTag("div", {});
				// output.printHTML("...hi...")
				// output.printEndTag();
				output.printStartTag("div", { class: "object-body" });
				var headers: { key: string, label: string }[] = [];

				output.printAsync("div", { class: "form-group" }, "", (elt, output) => {
					if (headers.length) {
						output.printStartTag("ul", { class: "nav nav-tabs", role: "tablist" });
						var first = true;
						for (var h of headers) {
							output.printHTML('<li class="nav-item">');
							var headerAttributes = { class: "nav-link", "data-toggle": "tab", href: "#" + h.key, role: "tab" };
							if (first) {
								this.addClass(headerAttributes, "active");
								first = false;
							}
							output.printTag('a', headerAttributes, h.label);
							output.printHTML('</li>');
						}
						output.printEndTag();
						output.domReplace();
					} else {
						elt.remove();
					}
				});
				/*<!-- Tab panes -->*/
				this.addClass(attributes, "tab-content");
				output.printStartTag("div", attributes);
				printContent({
					addHeaderCallback: (key, label) => {
						headers.push({ key: key, label: label });
					}
				});
				output.printEndTag();
				output.printEndTag();
				break;
			case "array-buttons":
			case "map-properties":
			case "variant-control":
			case "object-properties":
			case "crud-update":
				output.printStartTag("div", attributes);
				printContent({});
				output.printEndTag();
				break;

			case "variant-select-container":
				this.addClass(attributes, "form-group");
				output.printStartTag("div", attributes);
				printContent({});
				output.printEndTag();
				break;

			case "property-group":
				if (options.title) {
					var id = this.evalContext.nextId("tab");
					if (options.addHeaderCallback) {
						options.addHeaderCallback(id, options.title);
					}
					this.addClass(attributes, "tab-pane");
					if (options.active) {
						this.addClass(attributes, "active");
					}
					attributes.role = "tabpanel";
					attributes.id = id;
					output.printStartTag("div", attributes);
					printContent({});
					output.printEndTag();
				} else {
					output.printStartTag("div", attributes);
					printContent({});
					output.printEndTag();
				}
				break;

			// case "array-entries":
			// case "nodiv":
			case "array":
			// case "object-orphans":
			case "object":
				// no tag for those but we pass the options along
				printContent(options);
				break;

			default:
				console.error("Section " + options.name + " not implemented by Bootstrap Eval theme.");
				output.printStartTag("div", attributes);
				printContent({});
				output.printEndTag();

				break;
		}
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

	printInput(output: Output, options: InputOptions, data: any, type: Type, callback: (elt: HTMLInputElement) => void): void {
		var attributes: ElementAttributes = { value: data };
		this.addClass(attributes, "form-control");
		if (!output.isEditMode()) {
			attributes.readonly = "readonly";
		}
		attributes.id = options.id;

		attributes.type = this.inputTypes[type._kind] ||
			(this.htmlInputType[type._kind] ? type._kind : "text");
		if (attributes.type === "checkbox" && data) {
			attributes.checked = "checked";
		}
		// if (typeof data !== "string") {
		// 	attributes.value = JSON.stringify(data);
		// }
		output.printAsync("input", attributes, "", (elt, output) => {
			callback(elt as HTMLInputElement);
		});
	}

	printSelect(output: Output, options: SelectOptions, data: string, type: Type, onChanged?: (string) => void) {
		var attributes: ElementAttributes = { class: "form-control" };
		attributes.id = options.id;
		output.printAsync("select", attributes, () => {
			var currentGroup = null;
			for (var entry of options.entries) {
				if (entry.group != currentGroup) {
					if (currentGroup) output.printEndTag();
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
		}, (selectElement) => {
			selectElement.onchange = ((a: Event) => {
				var select = a.target as HTMLSelectElement;
				var option = select.selectedOptions[0] as HTMLOptionElement;
				var key = option.attributes['key'];
				var value = key ? key.value : option.value;
				if (onChanged) onChanged(value);
			});
		});
	}


	printButton(output: Output, options: ButtonOptions, action: (ev: Event) => void) {
		var attributes: ElementAttributes = {};
		if (options.class) attributes.class = options.class;
		output.printAsync("button", attributes, options.buttonText, (elt) => {
			elt.onclick = (ev) => action(ev);
		});
	}

	printButtonGroup(output: Output, options: ButtonGroupOptions, action: (ev: Event, string: any) => void) {
		output.printTag("div", { class: "dropdown" }, () => {

			output.printStartTag("a",
				{
					type: "button", class: "btn btn-secondary dropdown-toggle", "data-toggle": "dropdown",
					"aria-haspopup": "true", "aria-expanded": "false"
				});
			output.printText(options.buttonText);
			output.printEndTag(); // button

			output.printStartTag("div", { class: "dropdown-menu" });

			var currentGroup = null;
			for (let entry of options.entries) {
				if (entry.group != currentGroup) {
					output.printHTML("<div class=\"dropdown-divider\"></div>");
					output.printText(entry.group);
					output.printHTML("</li>");
				}
				var optionAttributes = { key: entry.key };
				output.printAsync("a", { class: "dropdown-item", href: "#" },
					entry.label || entry.key, (elt) => {
						elt.onclick = (ev) => {
							ev.preventDefault();
							action(ev, entry.key);
						}
					});
			}
			output.printEndTag(); // dropdown-menu
		});
	}

	addClass(css: ElementAttributes, newEntry: string): void {
		if (css.class) {
			var bits = css.class.split(' ');
			if (bits.indexOf(newEntry) >= 0) return;
			bits.push(newEntry);
			css.class = bits.join(" ");

		} else css.class = newEntry;
	}

	prepareViewBeforeBuild(view: AnyView): void {
		if (view instanceof VariantView) {
			// not sure about this
			// at all
			// view.options.freezeType = true;
		}
	}

	refreshView(view: AnyView, refreshOptions: RefreshOptions): void {
		if (refreshOptions.validationTextChanged) {
			var elt = document.getElementById(view.getId() + "-validation");
			elt.innerText = view.getValidationText();
		}
		if (refreshOptions.validationStatusChanged) {
			var elt = document.getElementById(view.getId() + "-container");
			elt.classList.remove("has-success");
			elt.classList.remove("has-warning");
			elt.classList.remove("has-danger");
			var className = this.getClassName(view.getValidationStatus());
			if (className) elt.classList.add(className);
		}
		if (refreshOptions.valueChanged) {
			var input = document.getElementById(view.getId()) as HTMLInputElement;
			input.value = view.getValue();
		}
		if (refreshOptions.descriptionChanged) {
			var elt = document.getElementById(view.getId() + "-description");
			elt.innerText = view.getValidationText();
		}
	}

	getClassName(validationStatus: ValidationStatus): string {
		switch (validationStatus) {
			case ValidationStatus.success:
				return "has-success";
			case ValidationStatus.warning:
				return "has-warning";
			case ValidationStatus.danger:
				return "has-danger";
			default:
				return null;
		}

	}
}

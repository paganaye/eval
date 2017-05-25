import { Theme, PagePrintArgs, SectionPrintArgs, PrintArgs, InputPrintArgs, ButtonPrintArgs, ArrayPrintArgs, SelectPrintArgs, ButtonGroupPrintArgs, VariantPrintArgs, ElementAttributes, PropertyPrintArgs, ArrayEntryPrintArgs, GroupOptions, RefreshOptions, JumbotronPrintArgs, BreadcrumpPrintArgs, NotificationPrintArgs } from "../Theme";
import { Output } from "../Output";
import { Type, Visibility } from "../Types";
import { Eval } from "../Eval";
import { View, AnyView, ValidationStatus } from "../View";
import { ObjectView } from "../views/ObjectView";
import { ArrayView } from "../views/ArrayView";
import { VariantView } from "../views/VariantView";
import { Notification } from "../commands/Notification"

export class Bootstrap extends Theme {

	static classPrefix = "evl-";

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

	createOutput(elt?: HTMLElement, parentOutput?: Output): Output {
		return new BootstrapOutput(this.evalContext, elt, parentOutput);
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
			var className = BootstrapOutput.getClassName(view.getValidationStatus());
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

	static addClass(css: ElementAttributes, newEntry: string): void {
		if (css.class) {
			var bits = css.class.split(' ');
			if (bits.indexOf(newEntry) >= 0) return;
			bits.push(newEntry);
			css.class = bits.join(" ");

		} else css.class = newEntry;
	}
}

export class BootstrapOutput extends Output {


	printPropertyView(printArgs: PropertyPrintArgs, view: AnyView) {

		var validationStatus = view.getValidationStatus();
		var className = BootstrapOutput.getClassName(view.getValidationStatus());

		var attrs = { class: "form-group row", id: view.getId() + "-container" };
		if (className) Bootstrap.addClass(attrs, className);

		var valueAttributes = {};
		var titleInBox = false;
		var visibility = this.evalContext.fixEnum(printArgs.visibility, Visibility);
		switch (visibility) {
			case Visibility.Shown:
				this.printStartTag("div", attrs);
				var labelAttributes = { class: "col-form-label col-lg-2", for: view.getId() };
				this.printTag("label", labelAttributes,
					printArgs.printLabel ? (o) => printArgs.printLabel(o, printArgs) : printArgs.label);
				Bootstrap.addClass(valueAttributes, "col-lg-10");
				break;
			case Visibility.TitleInBox:
				attrs.class = "card";
				if (className) Bootstrap.addClass(attrs, className);
				this.printStartTag("div", attrs);
				this.printHTML('   <div class="card-header">');
				this.printTag("label", labelAttributes,
					printArgs.printLabel ? (o) => printArgs.printLabel(o, printArgs) : printArgs.label);
				this.printHTML('   </div>');
				this.printHTML('   <div class="card-block">');
				titleInBox = true;
				Bootstrap.addClass(valueAttributes, "col-lg-12");
				break;
			default:
				this.printStartTag("div", attrs);
				Bootstrap.addClass(valueAttributes, "col-12");
				break;
		}


		this.printStartTag("div", valueAttributes);
		view.render(this);

		this.printTag('div', { class: "form-control-feedback", id: view.getId() + "-validation" },
			view.getValidationText() || "");
		this.printTag('small', { class: "form-text text-muted", id: view.getId() + "-description" }, view.getDescription() || "");

		this.printEndTag(); // col-lg-10;
		if (titleInBox) {
			this.printHTML('   </div>');
		}
		this.printEndTag(); // row or card
	}

	printArrayEntry(arrayView: ArrayView<any>, printArgs: ArrayEntryPrintArgs, data: any, dataType: Type): AnyView {
		this.printStartTag("div", { class: "card array-entry", id: printArgs.id });;//    <div class="card">
		Bootstrap.addClass({}, "card-header");
		Bootstrap.addClass({}, "collapsed");

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
		var innerView = this.evalContext.instantiate(arrayView, "[" + printArgs.id + ']', data, dataType, this.isEditMode(), {});

		this.printAsync("div", contentAttributes, "...", (output) => {
			var $: any = window["$"];
			innerView.render(output);
			if (printArgs.active) {
				var $elt = $(output.getOutputElt());
				//Bootstrap.addClass(contentAttributes, "show");
				$elt.collapse("show");
				$elt.siblings().collapse("hide");
			}
			output.domReplace();
		})
		// this.printStartTag("div", contentAttributes);
		//this.printEndTag(); // card-block

		this.printEndTag(); // card

		return innerView;
	}


	printPage(printArgs: PagePrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void) {
		this.printStartTag("div", { class: "container" });
		printContent(this, {});
		this.printEndTag();
		document.title = printArgs.title;
	}

	printGroup(printArgs: GroupOptions, printContent: (output: Output, printArgs: PrintArgs) => void) {
		this.printStartTag("div", { class: "group" });
		this.printHTML("<p>hello</p>")
		printContent(this, {});
		this.printEndTag();
	}

	printSection(printArgs: SectionPrintArgs, printContent: (printArgs: PrintArgs) => void) {
		Bootstrap.addClass({}, printArgs.name);
		var attributes: ElementAttributes = { class: Bootstrap.classPrefix + printArgs.name };
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
								Bootstrap.addClass(headerAttributes, "active");
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
				/*<!-- Tab panes -->*/
				Bootstrap.addClass(attributes, "tab-content");
				this.printStartTag("div", attributes);
				printContent({
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
				printContent({});
				this.printEndTag();
				break;

			case "variant-select-container":
				Bootstrap.addClass(attributes, "form-group");
				this.printStartTag("div", attributes);
				printContent({});
				this.printEndTag();
				break;

			case "property-group":
				if (printArgs.title) {
					var id = this.evalContext.nextId("tab");
					if (printArgs.addHeaderCallback) {
						printArgs.addHeaderCallback(id, printArgs.title);
					}
					Bootstrap.addClass(attributes, "tab-pane");
					if (printArgs.active) {
						Bootstrap.addClass(attributes, "active");
					}
					attributes.role = "tabpanel";
					attributes.id = id;
					this.printStartTag("div", attributes);
					printContent({});
					this.printEndTag();
				} else {
					this.printStartTag("div", attributes);
					printContent({});
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
				printContent(printArgs);
				break;

			default:
				console.error("Section " + printArgs.name + " not implemented by Bootstrap Eval theme.");
				this.printStartTag("div", attributes);
				printContent({});
				this.printEndTag();

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

	printInput(printArgs: InputPrintArgs, data: any, dataType: Type, callback: (elt: HTMLInputElement) => void): void {
		var attributes: ElementAttributes = { value: data };
		Bootstrap.addClass(attributes, "form-control");
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

	printSelect(printArgs: SelectPrintArgs, data: string, datType: Type, onChanged?: (string) => void) {
		var attributes: ElementAttributes = { class: "form-control" };
		attributes.id = printArgs.id;
		this.printAsync("select", attributes, () => {
			var currentGroup = null;
			for (var entry of printArgs.entries) {
				if (entry.group != currentGroup) {
					if (currentGroup) this.printEndTag();
					currentGroup = entry.group;
					this.printStartTag("optgroup", { label: currentGroup });
				}
				var optionAttributes = { key: entry.key };
				if (data == entry.key) {
					optionAttributes["selected"] = true;
				}
				this.printTag("option", optionAttributes, entry.label || entry.key);
			}
			if (currentGroup) {
				this.printEndTag();
				currentGroup = null;
			}

		}, (output) => {
			var selectElement = output.getOutputElt();
			selectElement.onchange = ((a: Event) => {
				var select = a.target as HTMLSelectElement;
				var option = select.selectedOptions[0] as HTMLOptionElement;
				var key = option.attributes['key'];
				var value = key ? key.value : option.value;
				if (onChanged) onChanged(value);
			});
		});
	}


	printButton(printArgs: ButtonPrintArgs, action: (ev: Event) => void): void {
		var attributes: ElementAttributes = { id: printArgs.id };
		if (printArgs.class) attributes.class = printArgs.class;
		this.printAsync("button", attributes, printArgs.buttonText, (output) => {
			var elt = output.getOutputElt();
			elt.onclick = (ev) => action(ev);
		});
	}

	printButtonGroup(printArgs: ButtonGroupPrintArgs, action: (ev: Event, string: any) => void) {
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


	prepareViewBeforeBuild(view: AnyView): void {
		if (view instanceof VariantView) {
			// not sure about this
			// at all
			// view.printArgs.freezeType = true;
		}
	}


	static getClassName(validationStatus: ValidationStatus): string {
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

	printNavbar(printArgs: NavbarOptions) {
		this.printHTML('<nav class="navbar navbar-toggleable-md navbar-light bg-faded">');
		this.printHTML('  <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">');
		this.printHTML('    <span class="navbar-toggler-icon"></span>');
		this.printHTML('  </button>');
		this.printHTML('  <a class="navbar-brand" href="#Welcome">Eval</a>');
		this.printHTML('  <div class="collapse navbar-collapse" id="navbarTogglerDemo02">');
		this.printHTML('    <ul class="navbar-nav mr-auto mt-2 mt-md-0">');
		this.printHTML('        <li class="nav-item active">');
		this.printHTML('          <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>');
		this.printHTML('        </li>');
		this.printHTML('        <li class="nav-item">');
		this.printHTML('          <a class="nav-link" href="#">Link</a>');
		this.printHTML('        </li>');
		this.printHTML('        <li class="nav-item dropdown">');
		this.printHTML('          <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>');
		this.printHTML('          <div class="dropdown-menu">');
		this.printHTML('            <a class="dropdown-item" href="#">Action</a>');
		this.printHTML('            <a class="dropdown-item" href="#">Another action</a>');
		this.printHTML('            <a class="dropdown-item" href="#">Something else here</a>');
		this.printHTML('            <div class="dropdown-divider"></div>');
		this.printHTML('            <a class="dropdown-item" href="#">Separated link</a>');
		this.printHTML('          </div>');
		this.printHTML('        </li>')
		this.printHTML('        <li class="nav-item">');
		this.printHTML('          <a class="nav-link disabled" href="#">Disabled</a>');
		this.printHTML('        </li>');
		this.printHTML('    </ul>');
		this.printHTML('    <form class="form-inline my-2 my-lg-0">');
		this.printHTML('      <input class="form-control mr-sm-2" type="text" placeholder="Search">');
		this.printHTML('      <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>');
		this.printHTML('    </form>');
		this.printHTML('  </div>');
		this.printHTML('</nav>');
	}

	printBreadcrump(printArgs: BreadcrumpPrintArgs) {
		this.printHTML('<nav class="breadcrumb">');
		this.printHTML('  <a class="breadcrumb-item" href="#">Home</a>');
		this.printHTML('  <a class="breadcrumb-item" href="#">Library</a>');
		this.printHTML('  <a class="breadcrumb-item" href="#">Data</a>');
		this.printHTML('  <span class="breadcrumb-item active">Bootstrap</span>');
		this.printHTML('</nav>');
	}

	printJumbotron(printArgs: JumbotronPrintArgs) {
		this.printHTML('<div class="jumbotron jumbotron-fluid">');
		this.printHTML('  <div class="container">');
		this.printTag('h1', { class: "display-3" }, printArgs.title);;
		this.printTag('p', { class: "lead" }, printArgs.description);
		this.printHTML('  </div>');
		this.printHTML('</div>');
	}
}

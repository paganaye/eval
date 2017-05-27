import { Theme, PagePrintArgs, SectionPrintArgs, PrintArgs, InputPrintArgs, ButtonPrintArgs, ArrayPrintArgs, SelectPrintArgs, ButtonGroupPrintArgs, VariantPrintArgs, ElementAttributes, PropertyPrintArgs, ArrayEntryPrintArgs, GroupOptions, RefreshOptions, JumbotronPrintArgs, BreadcrumpPrintArgs, NotificationPrintArgs, NavbarPrintArgs } from "../Theme";
import { Output } from "../Output";
import { Type, Visibility } from "../Types";
import { Eval } from "../Eval";
import { View, AnyView, ValidationStatus } from "../View";
import { ObjectView } from "../views/ObjectView";
import { ArrayView, ArrayEntryView } from "../views/ArrayView";
import { VariantView } from "../views/VariantView";
import { Notification } from "../commands/Notification"

export class Bootstrap extends Theme {

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
}

export class BootstrapOutput extends Output {
	printPropertyView(printArgs: PropertyPrintArgs, view: AnyView) {

		var validationStatus = view.getValidationStatus();
		var className = BootstrapOutput.getClassName(view.getValidationStatus());

		var attrs = { class: "form-group row", id: view.getId() + "-container" };
		if (className) Output.addClass(attrs, className);

		var valueAttributes = {};
		var titleInBox = false;
		var visibility = printArgs.visibility;
		this.printStartTag("div", attrs);
		switch (visibility) {
			case "visible":
				var labelAttributes = { class: "col-form-label col-lg-2", for: view.getId() };
				this.printTag("label", labelAttributes,
					printArgs.printLabel ? (o) => printArgs.printLabel(o, printArgs) : printArgs.label);
				Output.addClass(valueAttributes, "col-lg-10");
				break;
			default:
				Output.addClass(valueAttributes, "col-12");
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

	printArray(arrayView: ArrayView<any>, printArgs: ArrayPrintArgs, printContent: (output, printArgs: PrintArgs) => void): void {
		printContent(this, printArgs);
	}

	printArrayEntry(arrayEntryView: ArrayEntryView, printArgs: ArrayEntryPrintArgs, printContent: (output, printArgs: PrintArgs) => void): void {

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

		this.printAsync("div", contentAttributes, "...", (output) => {
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

	printSection(printArgs: SectionPrintArgs, printContent: (output: Output, printArgs: PrintArgs) => void) {
		Output.addClass({}, printArgs.name);
		var attributes: ElementAttributes = { class: super.getClassPrefix() + printArgs.name };
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
				/*<!-- Tab panes -->*/
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

	printNavbar(printArgs: NavbarPrintArgs) {
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

import { Theme, FormOptions, PageOptions, SectionOptions, ViewOptions, InputOptions, ButtonOptions, ArrayOptions, SelectOptions, ButtonGroupOptions, DynamicObjectOptions, ElementAttributes, PropertyOptions, ArrayEntryOptions, MapEntryOptions, GroupOptions } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { View, ViewOrElement, AnyView } from "../View";
import { ObjectView } from "../views/ObjectView";
import { ArrayView } from "../views/ArrayView";
import { DynamicView } from "../views/DynamicView";


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

    printProperty(output: Output, options: PropertyOptions,
        printKey: string | ((output: Output, options: ViewOptions) => void), view: ViewOrElement) {

        output.printStartTag("div", { class: "form-group row has-warning" });

        output.printTag("label", { class: "col-lg-2 col-form-label", for: view.getId() },
            typeof printKey === "string"
                ? printKey
                : (output) => (printKey as ((output: Output, options: ViewOptions) => void))(output, options));


        output.printStartTag("div", { class: "col-lg-10" });
        view.render(output);
        output.printHTML('<div class="form-control-feedback">Shucks, check the formatting of that and try again.</div>');
        output.printHTML('<small class="form-text text-muted">Example help text that remains unchanged.</small>');

        output.printEndTag(); // col-lg-10;
        output.printEndTag(); // row

        // getValidationStatus(): ValidationStatus {
        //     return ValidationStatus.success;
        // }

        // getValidationText(): string {
        //     return null;
        // }

        // getExampleText(): string {
        //     return null;
        // }

        //   <label class="form-control-label" for="inputWarning1">Input with warning</label>
        //   <input type="text" class="form-control form-control-warning" id="inputWarning1">
    }

    printDynamicObject(output: Output, options: PropertyOptions,
        printKey: string | ((output: Output, options: ViewOptions) => void), view: ViewOrElement) {
        var parentView = view.getParentView();
        if (parentView instanceof ArrayView) {

        }
        output.printStartTag("div", { class: "evl-dynamic-type" });
        output.printTag("label", { class: "", for: view.getId() },
            typeof printKey === "string"
                ? printKey
                : (output) => (printKey as ((output: Output, options: ViewOptions) => void))(output, options));
        output.printEndTag();
        view.render(output);
        output.printEndTag();
    }

    printArrayEntry(output: Output, arrayView: ArrayView<any>, options: ArrayEntryOptions, data: any, type: Type): AnyView {
        output.printStartTag("div", { class: "card", id: options.id });;//    <div class="card">
        this.addClass({}, "card-header");

        output.printTag("h4", { class: "sort-handle" }, (output) => {
            output.printText(options.label);
            if (options.deletable) {
                output.printButton({ buttonText: "x", class: "close" }, (ev: Event) => {
                    var elt = (ev.target as HTMLElement).parentElement;
                    if (elt) elt.parentElement.remove();
                });
            }
        });

        output.printStartTag("div", { class: "card-block" });

        var innerView = this.evalContext.instantiate(data, type, arrayView, output.isEditMode(), {});
        innerView.render(output);

        output.printEndTag(); // card-block
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
            case "object":
            case "array-buttons":
            case "map-properties":
            case "dynamic-control":
            case "crud-update":
            case "object-group":
                output.printStartTag("div", attributes);
                printContent({});
                output.printEndTag();
                break;

            case "array-entries":
            case "nodiv":
            case "array":
            case "object-known-properties":
            case "object-orphans":
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

    printInput(output: Output, options: InputOptions, data: any, type: Type) {
        var attributes: ElementAttributes = { value: data };

        this.addClass(attributes, "form-control");
        if (!output.isEditMode()) {
            attributes.readonly = "readonly";
        }
        attributes.id = options.id;
        attributes.type = (this.htmlInputType[type._kind])
            ? type._kind : "text";

        output.printTag("input", attributes)
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
        if (view instanceof DynamicView) {
            // not sure about this
            // at all
            // view.options.freezeType = true;
        }
    }
}

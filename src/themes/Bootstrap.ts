import { Theme, FormAttributes, PageAttributes, SectionAttributes, ElementAttributes, InputAttributes, ButtonAttributes, ArrayAttributes, SelectAttributes, ButtonGroupAttributes, DynamicObjectAttributes, CssAttributes, PropertyAttributes, ArrayEntryAttributes } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { View, ViewOrElement } from "../View";
import { ObjectView } from "../views/ObjectView";
import { ArrayView } from "../views/ArrayView";
import { MapView } from "../views/MapView";
import { DynamicView } from "../views/DynamicView";


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

    printProperty(output: Output, attributes: PropertyAttributes,
        printKey: string | ((output: Output, attributes: ElementAttributes) => void), view: ViewOrElement) {

        output.printStartTag("div", { class: "form-group row" });

        this.addClass(attributes.labelCssAttributes, "col-sm-2");
        this.addClass(attributes.labelCssAttributes, "col-form-label");
        this.addClass(attributes.cssAttributes, "col-sm-10");
        attributes.labelCssAttributes.for = view.getId();

        output.printTag("label", attributes.labelCssAttributes,
            typeof printKey === "string"
                ? printKey
                : (output) => (printKey as ((output: Output, attributes: ElementAttributes) => void))(output, attributes));

        view.render(output);
        output.printEndTag();
    }

    printArrayEntry(output: Output, arrayView: ArrayView<any>, attributes: ArrayEntryAttributes, data: any, type: Type): View<any, Type, ElementAttributes> {

        output.printStartTag("div", { class: "form-group row", id: attributes.id });
        var cssAttributes = attributes.cssAttributes || {};
        this.addClass(cssAttributes, "col-sm-1");
        this.addClass(cssAttributes, "col-form-label");
        output.printTag("label", cssAttributes, attributes.label);
        var innerView = this.evalContext.getViewForExpr(data, type, output.isEditMode(), { cssAttributes: { class: "col-sm-10" } });
        innerView.render(output);
        output.printStartTag("div", { class: "col-sm-1" });
        if (attributes.deletable) {

            output.printButton({ buttonText: "x" }, (ev: Event) => {    // 
                var elt = (ev.target as HTMLElement).parentElement;
                if (elt) elt.parentElement.remove();
            });
        }
        output.printEndTag(); // right column

        output.printEndTag(); // row
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

    printForm(output: Output, attributes: FormAttributes, printContent: (attributes: ElementAttributes) => void) {
        output.printStartTag("form", {});
        printContent({});
        // print buttons...
        if (!attributes.buttons) attributes.buttons = ["Submit"];

        output.printStartTag("div", {});
        var className = "btn";
        for (var button of attributes.buttons) {
            output.printTag("button", { type: "button", class: className }, button as string);
            className = "";
        }
        output.printEndTag(); // buttons
        output.printEndTag(); // form                
    }

    printPage(output: Output, attributes: PageAttributes, printContent: (attributes: ElementAttributes) => void) {
        output.printStartTag("div", { class: "container" });
        printContent({});
        output.printEndTag();
        document.title = attributes.title;
    }

    printSection(output: Output, attributes: SectionAttributes, printContent: (attributes: ElementAttributes) => void) {
        var cssAttributes = attributes.cssAttributes || {};
        this.addClass(cssAttributes, attributes.name);
        switch (attributes.name) {
            case "object-properties":
            case "array-buttons":
            case "array":
            case "object-orphans":
            case "map-properties":
            case "dynamic-control":
            case "crud-update":
            case "object-known-properties":
                output.printStartTag("div", attributes.cssAttributes);
                printContent({});
                output.printEndTag();
                break;

            case "nodiv":
                // no tag for those but we pass the attributes along
                printContent(attributes);
                break;

            default:
                console.error("Section " + attributes.name + " not implemented by Bootstrap Eval theme.");
                output.printStartTag("div", attributes.cssAttributes);
                printContent({});
                output.printEndTag();

                break;
        }
    }


    printSectionAsync(output: Output, attributes: SectionAttributes, callback: (elt: HTMLElement) => void): void {
        var cssAttributes = attributes.cssAttributes || {};
        this.addClass(cssAttributes, attributes.name);
        switch (attributes.name) {
            case "array-entries":
                output.printAsync("div", attributes.cssAttributes, "...",
                    (elt) => {
                        var Sortable = (window as any).Sortable;
                        var sortable = Sortable.create(elt, {
                            animation: 200
                        });
                        callback(elt);
                    });
                break;
            case "dynamic":
                output.printAsync("div", attributes.cssAttributes, "...", (elt) => {
                    callback(elt);
                });
                break;
            default:
                console.error("Async Section " + attributes.name + " not implemented by Bootstrap Eval theme.");
                output.printAsync("div", attributes.cssAttributes, "...", (elt) => {
                    callback(elt);
                });
                break;
        }
    }

    printInput(output: Output, attributes: InputAttributes, data: any, type: Type) {
        var cssAttributes = attributes.cssAttributes || {};
        cssAttributes.value = data;
        this.addClass(cssAttributes, "form-control");
        if (!output.isEditMode()) {
            cssAttributes.readonly = "readonly";
        }
        output.printTag("input", cssAttributes)
    }

    printSelect(output: Output, attributes: SelectAttributes, data: string, type: Type, onChanged?: (string) => void) {
        var cssAttributes = attributes.cssAttributes || {};

        output.printAsync("select", attributes.cssAttributes, () => {
            var currentGroup = null;
            for (var entry of attributes.entries) {
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


    printButton(output: Output, attributes: ButtonAttributes, action: (ev: Event) => void) {
        var cssAttributes = attributes.cssAttributes || {};
        output.printAsync("button", attributes.cssAttributes, attributes.buttonText, (elt) => {
            elt.onclick = (ev) => action(ev);
        });
    }

    printButtonGroup(output: Output, attributes: ButtonGroupAttributes, action: (ev: Event, string: any) => void) {
        output.printTag("div", { class: "dropdown" }, () => {

            output.printStartTag("a",
                {
                    type: "button", class: "btn btn-secondary dropdown-toggle", "data-toggle": "dropdown",
                    "aria-haspopup": "true", "aria-expanded": "false"
                });
            output.printText(attributes.buttonText);
            output.printEndTag(); // button

            output.printStartTag("div", { class: "dropdown-menu" });

            var currentGroup = null;
            for (let entry of attributes.entries) {
                if (entry.group != currentGroup) {
                    output.printHTML("<div class=\"dropdown-divider\"></div>");
                    output.printText(entry.group);
                    output.printHTML("</li>");
                }
                var optionAttributes = { key: entry.key };
                output.printAsync("a", { class: "dropdown-item", href: "#" },
                    entry.label || entry.key, (elt) => {
                        elt.onclick = (ev) => {
                            action(ev, entry.key);
                        }
                    });
            }
            output.printEndTag(); // dropdown-menu
        });
    }

    addClass(cssAttributes: CssAttributes, newEntry: string): void {
        if (cssAttributes.class) {
            var bits = cssAttributes.class.split(' ');
            if (bits.indexOf(newEntry) >= 0) return;
            bits.push(newEntry);
            cssAttributes.class = bits.join(" ");

        } else cssAttributes.class = newEntry;
    }

    prepareViewBeforeBuild(view: View<any, Type, ElementAttributes>): void {
        if (view instanceof DynamicView) {
            // not sure about this
            view.attributes.freezeType = true;
        }
    }
}

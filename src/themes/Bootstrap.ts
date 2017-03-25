import { Theme, FormAttributes, PageAttributes, SectionAttributes, ElementAttributes, InputAttributes, ButtonAttributes, ArrayAttributes, SelectAttributes, ButtonGroupAttributes, DynamicObjectAttributes, CssAttributes, PropertyAttributes } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { View, LightView } from "../View";
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
        printKey: string | ((output: Output, attributes: ElementAttributes) => void), view: LightView) {

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

    printArrayEntry(output: Output, arrayView: ArrayView<any>, attributes: ArrayAttributes, key: number, data: any, type: Type): View<any, Type, ElementAttributes> {
        output.printStartTag("div", { class: "form-group row" });

        var innerView = this.evalContext.getViewForExpr(data, type, output.isEditMode(), { cssAttributes: { class: "col-sm-10" } });
        var id = innerView.getId();
        output.printTag("label", { class: "col-sm-1 col-form-label", for: id }, '#' + key);
        innerView.render(output);
        output.printStartTag("div", { class: "col-sm-1" });
        if (attributes.deletable) {
            output.printButton({}, "x", () => {
                var elt = document.getElementById(id);
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
            result.push(child.children[1].id);
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
                debugger;
                console.error("Section " + attributes.name + " not implemented by Bootstrap Eval theme.");
                output.printStartTag("div", attributes.cssAttributes);
                printContent({});
                output.printEndTag();

                break;
        }
    }


    printSectionAsync(output: Output, attributes: SectionAttributes): Output {
        var cssAttributes = attributes.cssAttributes || {};
        this.addClass(cssAttributes, attributes.name);
        switch (attributes.name) {
            case "array-entries":
                var output2 = output.printAsync("div", attributes, "...",
                    (elt) => {
                        var Sortable = (window as any).Sortable;
                        var sortable = Sortable.create(elt, {
                            animation: 200
                        });
                    });
                return output2;
            case "dynamic":
                var output2 = output.printAsync("div", attributes, "...", (elt) => {
                    output2.render();
                });
                return output2;

            default:
                console.error("Async Section " + attributes.name + " not implemented by Bootstrap Eval theme.");
                var output2 = output.printAsync("div", attributes, "...", (elt) => {
                    output2.render();
                });
                return output2;
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

        output.printAsync("select", attributes, () => {
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

    printAsync(output: Output, attributes: DynamicObjectAttributes, data: string, type: Type, onChanged?: (string) => void) {


        if (attributes.freezeType) {
            output.printTag("", {}, "...");
            var id: string = attributes.cssAttributes[id];
            output.printAsync("p", {}, "...", () => {

            });
        } else {
            //var entries = 
            this.printSelect(output, { entries: attributes.entries }, data, type, (data) => {

            });
            var id = attributes.cssAttributes[id];
            output.printAsync("p", {}, "...", () => {

            });
        }

    }

    printButton(output: Output, attributes: ButtonAttributes, text: string, action: () => void) {
        var cssAttributes = attributes.cssAttributes || {};
        output.printAsync("button", attributes, text, (elt) => {
            elt.onclick = () => action();
        });
    }

    printButtonGroup(output: Output, attributes: ButtonGroupAttributes, text: string, action: (string: any) => void) {
        output.printTag("div", { class: "dropdown" }, () => {

            output.printStartTag("a",
                {
                    type: "button", class: "btn btn-secondary dropdown-toggle", "data-toggle": "dropdown",
                    "aria-haspopup": "true", "aria-expanded": "false"
                });
            output.printText("Add");
            output.printEndTag(); // button

            output.printStartTag("div", { class: "dropdown-menu" });

            var currentGroup = null;
            for (var entry of attributes.entries) {
                if (entry.group != currentGroup) {
                    output.printHTML("<div class=\"dropdown-divider\"></div>");
                    output.printText(entry.group);
                    output.printHTML("</li>");
                }
                var optionAttributes = { key: entry.key };
                output.printAsync("a", { class: "dropdown-item", href: "#" },
                    entry.label || entry.key, (elt) => {
                        elt.onclick = () => {
                            action(entry.key);
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

}

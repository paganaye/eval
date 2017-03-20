
import { Theme, FormOptions, PageOptions, SectionOptions, ContentOptions, InputOptions, ButtonOptions, ArrayEntryOptions, SelectOptions, ButtonGroupOptions } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { View } from "../View";
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


    // printProperty(output: Output, objectView: ObjectView | MapView | DynamicView, contentOptions: ContentOptions, key: string | ((output: Output) => void), data: any, type: Type): View<any, any> {
    //     var id = this.evalContext.nextId();
    //     output.printStartTag("div", { class: "form-group row" });
    //     output.printTag("label", { class: "col-sm-2 col-form-label", for: id }, key);
    //     var innerView = this.evalContext.getViewForExpr(data, type, output.isEditMode(), { id: id, class: "col-sm-10 " });
    //     innerView.render(output);
    //     output.printEndTag();
    //     return innerView;
    // }

    printProperty(output: Output, options: ContentOptions,
        printKey: string | ((output: Output, options: ContentOptions) => void),
        printData: ((output: Output, options: ContentOptions) => void)): void {

        output.printStartTag("div", { class: "form-group row" });

        output.printTag("label", { class: "col-sm-2 col-form-label", for: options.id },
            typeof printKey === "string"
                ? printKey
                : (output) => (printKey as ((output: Output, options: ContentOptions) => void))(output, options));

        var innerView = printData(output, { attributes: { class: "col-sm-10 " } });
        output.printEndTag();
    }


    printArrayEntry(output: Output, arrayView: ArrayView, options: ArrayEntryOptions, key: number, data: any, type: Type): View<any, any> {
        output.printStartTag("div", { class: "form-group row" });

        var innerView = this.evalContext.getViewForExpr(data, type, output.isEditMode(), { class: "col-sm-10" });
        var id = innerView.getId();
        output.printTag("label", { class: "col-sm-1 col-form-label", for: id }, '#' + key);

        innerView.render(output);
        output.printStartTag("div", { class: "col-sm-1" });
        if (options.deletable) {
            output.printButton({}, "x", () => {
                var elt = document.getElementById(id);
                if (elt) elt.remove();
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

    printForm(output: Output, options: FormOptions, printContent: (options: ContentOptions) => void) {
        output.printStartTag("form", {});
        printContent({});
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

    printPage(output: Output, options: PageOptions, printContent: (options: ContentOptions) => void) {
        output.printStartTag("div", { class: "container" });
        printContent({});
        output.printEndTag();
        document.title = options.title;
    }

    printSection(output: Output, options: SectionOptions, printContent: (options: ContentOptions) => void) {
        var attributes = options.attributes || {};
        this.addClass(attributes, options.name);
        switch (options.name) {
            case "object-properties":
                output.printStartTag("div", attributes);
                printContent({});
                output.printEndTag();
                break;
            default:
                console.log("Section:" + options.name + " unhandled by Bootstrap");

                output.printStartTag("div", attributes);
                printContent({});
                output.printEndTag();

                break;
        }
    }


    printDynamicSection(output: Output, options: SectionOptions): Output {
        var attributes = options.attributes || {};
        this.addClass(attributes, options.name);
        switch (options.name) {
            case "array-entries":
                var output2 = output.printDynamic("div", attributes, "...",
                    (elt) => {
                        var Sortable = (window as any).Sortable;
                        var sortable = Sortable.create(elt, {
                            animation: 200
                        });
                    });
                return output2;

            default:
                console.error("Dynamic Section " + options.name + " not implemented in Bootstrap.");
                var output2 = output.printDynamic("div", attributes, "...", (elt) => {
                    output2.render();
                });
                return output2;
        }
    }

    printInput(output: Output, options: InputOptions, data: any, type: Type) {
        var attributes = options.attributes || {};
        attributes.value = data;
        this.addClass(attributes, "form-control");
        if (!output.isEditMode()) {
            attributes.readonly = "readonly";
        }
        output.printTag("input", attributes)
    }

    printSelect(output: Output, options: SelectOptions, data: string, type: Type, onChanged?: (string) => void) {
        var attributes = options.attributes || {};

        output.printDynamic("select", attributes, () => {
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

    printDynamic(output: Output, options: SelectOptions, data: string, type: Type, onChanged?: (string) => void) {
        this.printSelect(output, options, data, type, (data) => {

        });
        var id = options.attributes[id];
        output.printDynamic("p", {}, "...", () => {

        });
    }

    printButton(output: Output, options: ButtonOptions, text: string, action: () => void) {
        var attributes = options.attributes || {};
        output.printDynamic("button", attributes, text, (elt) => {
            elt.onclick = () => action();
        });
    }

    printButtonGroup(output: Output, options: ButtonGroupOptions, text: string, action: (string: any) => void) {
        output.printTag("div", { class: "dropdown" }, () => {

            output.printStartTag("a", { type: "button", class: "btn btn-secondary dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": true, "aria-expanded": false });
            output.printText("Add");
            output.printEndTag(); // button

            output.printStartTag("div", { class: "dropdown-menu" });

            var currentGroup = null;
            for (var entry of options.entries) {
                if (entry.group != currentGroup) {
                    output.printHTML("<div class=\"dropdown-divider\"></div>");
                    output.printText(entry.group);
                    output.printHTML("</li>");
                }
                var optionAttributes = { key: entry.key };
                output.printDynamic("a", { class: "dropdown-item", href: "#" },
                    entry.label || entry.key, (elt) => {
                        elt.onclick = () => {
                            action(entry.key);
                        }
                    });
            }
            output.printEndTag(); // dropdown-menu
        });
    }

    addClass(attributes: { [key: string]: string }, newEntry: string): void {
        if (attributes.class) {
            var bits = attributes.class.split(' ');
            if (bits.indexOf(newEntry) >= 0) return;
            bits.push(newEntry);
            attributes.class = bits.join(" ");

        } else attributes.class = newEntry;
    }

}

import { Theme, FormOptions, PageOptions, SectionOptions, ViewOptions, InputOptions, ButtonOptions, ArrayOptions, SelectOptions, ButtonGroupOptions, DynamicObjectOptions, ElementAttributes, PropertyOptions, ArrayEntryOptions } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { View, ViewOrElement } from "../View";
import { ObjectView } from "../views/ObjectView";
import { ArrayView } from "../views/ArrayView";
import { MapView } from "../views/MapView";
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

        output.printStartTag("div", { class: "form-group row" });

        output.printTag("label", { class: "col-sm-2 col-form-label", for: view.getId() },
            typeof printKey === "string"
                ? printKey
                : (output) => (printKey as ((output: Output, options: ViewOptions) => void))(output, options));


        output.printStartTag("div", { class: "col-sm-10" });
        view.render(output);
        output.printEndTag(); // col-sm-10;
        output.printEndTag(); // row
    }

    printDynamicObject(output: Output, options: PropertyOptions,
        printKey: string | ((output: Output, options: ViewOptions) => void), view: ViewOrElement) {

        output.printStartTag("div", { class: "form-group row" });

debugger;
        output.printTag("label", { class: "", for: view.getId() },
            typeof printKey === "string"
                ? printKey
                : (output) => (printKey as ((output: Output, options: ViewOptions) => void))(output, options));

        view.render(output);
        output.printEndTag();
    }

    printArrayEntry(output: Output, arrayView: ArrayView<any>, options: ArrayEntryOptions, data: any, type: Type): View<any, Type, ViewOptions> {

        output.printStartTag("div", { class: "card", id: options.id });;//    <div class="card">
        this.addClass({}, "card-header");

        output.printTag("h4", {}, (output) => {
            output.printText(options.label);
            if (options.deletable) {
                output.printButton({ buttonText: "x", class: "close" }, (ev: Event) => {
                    var elt = (ev.target as HTMLElement).parentElement;
                    if (elt) elt.parentElement.remove();
                });
            }
        });

        output.printStartTag("div", { class: "card-block" });

        var innerView = this.evalContext.getViewForExpr(data, type, output.isEditMode(), {});
        innerView.render(output);

        output.printEndTag(); // card-block
        output.printEndTag(); // card


        //output.printStartTag("div", { id: options.id });

        // output.printStartTag("div", { class: "row" });
        // output.printStartTag("div", { class: "col-11" });
        // output.printTag("label", {}, options.label);
        // output.printEndTag();
        // output.printStartTag("div", { class: "col-1" });
        // output.printEndTag(); // right column
        // output.printEndTag(); // top row


        //output.printEndTag(); // row
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

    printSection(output: Output, options: SectionOptions, printContent: (options: ViewOptions) => void) {
        this.addClass({}, options.name);
        var attributes: ElementAttributes = { class: this.classPrefix + options.name };
        switch (options.name) {
            case "object":
            case "array-buttons":
            case "map-properties":
            case "dynamic-control":
            case "crud-update":
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


    // printSectionAsync(output: Output, options: SectionOptions, callback: (elt: HTMLElement) => void): void {
    //     this.addClass({}, options.name);
    //     switch (options.name) {
    //         case "array-entries":
    //             output.printAsync("div", {}, "...",
    //                 (elt) => {
    //                     var Sortable = (window as any).Sortable;
    //                     var sortable = Sortable.create(elt, {
    //                         animation: 200
    //                     });
    //                     callback(elt);
    //                 });
    //             break;
    //         case "dynamic":
    //             output.printAsync("div", {}, "...", (elt) => {
    //                 callback(elt);
    //             });
    //             break;
    //         default:
    //             console.error("Async Section " + options.name + " not implemented by Bootstrap Eval theme.");
    //             output.printAsync("div", {}, "...", (elt) => {
    //                 callback(elt);
    //             });
    //             break;
    //     }
    // }

    printInput(output: Output, options: InputOptions, data: any, type: Type) {
        var attributes: ElementAttributes = { value: data };

        this.addClass(attributes, "form-control");
        if (!output.isEditMode()) {
            attributes.readonly = "readonly";
        }
        attributes.id = options.id;
        output.printTag("input", attributes)
    }

    printSelect(output: Output, options: SelectOptions, data: string, type: Type, onChanged?: (string) => void) {
        var attributes: ElementAttributes = {};
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

    prepareViewBeforeBuild(view: View<any, Type, ViewOptions>): void {
        if (view instanceof DynamicView) {
            // not sure about this
            view.options.freezeType = true;
        }
    }
}

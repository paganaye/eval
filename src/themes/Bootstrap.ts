
import { Theme, FormOptions, PageOptions, SectionOptions, ContentOptions, InputOptions, ButtonOptions, ArrayEntryOptions } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "../Eval";
import { View } from "../View";


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


    printProperty(output: Output, contentOptions: ContentOptions, key: string, data: any, type: Type): View<any> {
        var id = this.evalContext.nextId();
        output.printStartTag("div", { class: "form-group row" });
        output.printTag("label", { class: "col-sm-2 col-form-label", for: id }, key);

        var innerView = this.evalContext.getViewForExpr(data, type, output.isEditMode(), { id: id, class: "col-sm-10 " });
        innerView.render(output);

        output.printEndTag();

        return innerView;
    }

    printArrayEntry(output: Output, options: ArrayEntryOptions, key: number, data: any, type: Type): View<any> {
        var id = this.evalContext.nextId();
        output.printStartTag("div", { class: "form-group row", id: id });
        output.printTag("label", { class: "col-sm-1 col-form-label", for: id }, '#' + key);

        var innerView = this.evalContext.getViewForExpr(data, type, output.isEditMode(), { id: id, class: "col-sm-11 " });
        innerView.render(output);
        if (options.deletable) {
            output.printButton({}, "x", () => {
                var elt = document.getElementById(id);
                if (elt) elt.remove();
            });
        }

        output.printEndTag();
        return innerView;
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
        switch (options.name) {
            case "array-entries":
                var id = this.evalContext.nextId();

                var output2 = output.printDynamic("div", { class: "array-entries", id: id }, "...");

                setTimeout(() => {
                    var elt = document.getElementById(id);
                    if (elt) {
                        var Sortable = (window as any).Sortable;
                        var sortable = Sortable.create(elt, {
                            animation: 200
                        });
                    }
                })
                return output2;

            default:
                console.error("Dynamic Section " + options.name + " not implemented in Bootstrap.");
                var output2 = output.printDynamic("div", { class: options.name }, "...");
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

    printButton(output: Output, options: ButtonOptions, text: string, action: () => void) {
        var attributes = options.attributes || {};
        var id = this.evalContext.nextId();
        attributes.id = id;
        output.printTag("button", attributes, text);
        setTimeout(() => {
            var elt = document.getElementById(id);
            if (elt) elt.onclick = () => action();
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

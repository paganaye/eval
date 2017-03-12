
import { Theme, FormOptions, PageOptions, SectionOptions, ContentOptions, InputOptions } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "src/Eval";

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
        }
    }


    printProperty(output: Output, contentOptions: ContentOptions, key: string, data: any, type: Type): void {
        //debugger;
        var id = this.evalContext.nextId();
        output.printStartTag("div", { class: "form-group row" });
        output.printTag("label", { class: "col-sm-2 col-form-label", for: id }, key);
        output.print(data, type, { id: id, class: "col-sm-10 " });
        output.printEndTag();
    }

    printForm(output: Output, options: FormOptions, printContent: () => void) {
        output.printStartTag("form", {});
        printContent();
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

    printPage(output: Output, options: PageOptions, printContent: () => void) {
        output.printStartTag("div", { class: "container" });
        printContent();
        output.printEndTag();
        document.title = options.title;
    }

    printSection(output: Output, options: SectionOptions, printContent: () => void) {
        var attributes = options.attributes || {};
        attributes.class = (attributes.class ? attributes.class + " " : "") + options.name;
        switch (options.name) {
            case "object-properties":
                output.printStartTag("div", attributes);
                printContent();
                output.printEndTag();
                break;
            case "array-entry":
                output.printStartTag("div", attributes);
                printContent();
                output.printEndTag();
                break;
            default:
                console.log("Section:" + options.name + " unhandled by Bootstrap");

                output.printStartTag("div", attributes);
                printContent();
                output.printEndTag();

                break;
        }
    }

    printInput(output: Output, options: InputOptions, data: any, type: Type) {
        var attributes = options.attributes || {};
        attributes.value = data;
        attributes.class = (attributes.class + " form-control").trim();
        if (!output.isEditMode()) {
            attributes.readonly = "readonly";
        }
        output.printTag("input", attributes)
        //form-control-static
    }
}

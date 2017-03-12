

import { Theme, FormOptions, PageOptions, SectionOptions } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";
import { Eval } from "src/Eval";

export class Bootstrap extends Theme {

    constructor(evalContext: Eval, private addScripts: boolean = true) {
        super(evalContext);
    }

    printProperty(output: Output, key: string, data: any, type: Type): void {
        var id = this.evalContext.nextId();
        output.printStartTag("div", { class: "form-group row" });
        output.printTag("label", { class: "col-sm-2 col-form-label", for: id }, key);
        output.print(data, type, { id: id, class: "col-sm-10 " + (output.getEditMode() ? "form-control" : "form-control-static") });
        output.printEndTag();
    }

    initialize(output: Output) {
        if (this.addScripts) {
            // remember to remove jquery if you update this. JQuery is in the main page
            output.printHTML('<link rel="stylesheet" href="/libs/bootstrap/css/bootstrap.min.css" >');
            output.printHTML('<script src="/libs/tether.min.js"></script>');
            output.printHTML('<script src="/libs/bootstrap/js/bootstrap.min.js"></script>');
        }
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
        printContent();
    }

}
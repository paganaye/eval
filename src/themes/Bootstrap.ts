

import { Theme, Section } from "../Theme";
import { Output } from "../Output";
import { Type } from "../Types";

export class Bootstrap extends Theme {

    printProperty(output: Output, key: string, data: any, type: Type): void {
        var id = this.evalContext.nextId();
        output.printStartTag("div", { class: "form-group row" });
        output.printTag("label", { class: "col-sm-2 col-form-label", for: id }, key);
        output.print(data, type, { id: id, class: "form-control" });
        output.printEndTag();
    }

    initialize(output: Output) {
        // remember to remove jquery if you update this. JQuery is in the main page
        output.printHTML('<link rel="stylesheet" href="/libs/bootstrap/css/bootstrap.min.css" >');
        output.printHTML('<script src="/libs/tether.min.js"></script>');
        output.printHTML('<script src="/libs/bootstrap/js/bootstrap.min.js"></script>');
    }


    printSection(output: Output, section: Section, printContent: () => void): void {
        switch (section.type) {
            case "form":
                output.printStartTag("form", {});
                printContent();
                // print buttons...
                if (!section.buttons) section.buttons = ["Submit"];
                output.printStartTag("div", {});
                var className = "btn";
                for (var button of section.buttons) {
                    output.printTag("button", { type: "button", class: className }, button as string);
                    className = "";
                }
                output.printEndTag(); // buttons
                output.printEndTag(); // form                
                break;
            case "page":
                output.printStartTag("div", { class: "container" });
                printContent();
                output.printEndTag();
                break;
            default:
                this.defaultPrintSection(output, section, printContent);
                break;
        }
    }
}
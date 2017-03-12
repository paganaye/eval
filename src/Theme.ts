import { Output } from "./Output";
import { Type } from "./Types";
import { Eval } from "./Eval";

export abstract class Theme {
   constructor(public readonly evalContext: Eval) { }
   abstract initialize(output: Output): void;
   abstract printProperty(output: Output, key: string, data: any, type: Type): void;
   abstract printSection(output: Output, section: Section, printContent: () => void);

   
   defaultPrintSection(output: Output, section: Section, printContent: () => void): void {
      switch (section.type) {
         case "form":
            output.printStartTag("form", {});
            printContent();
            for (var button of section.buttons) {
               output.printTag("button", { type: "button", class: "btn" }, button as string);
            }
            output.printEndTag();
            break;
         default:
            printContent();
            break;
      }
   }

}

export interface FormSection {
   type: "form";
   buttons?: (FormButton | string)[];
   formAttributes?: any;
}

export interface PageSection {
   type: "page";
   title?: string;
   formAttributes?: any;
}

export interface DivSection {
   type: "div";
   [key: string]: any;
}

export type Section = FormSection | PageSection | DivSection;

export interface FormButton {
   text: string;
}
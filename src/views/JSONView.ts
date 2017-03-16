import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition } from "../Types";
import { ContentOptions } from "src/Theme";
import { Map } from "typescript/lib/typescript";

export class JSONView extends View<any> {
   text: string;
   attributes: { [key: string]: string };
   
   build(expr: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
      this.attributes = attributes;
      this.text = JSON.stringify(expr);
   }

   render(output: Output): void {
      output.printStartTag("span", this.attributes);
      output.printText(this.text);
      output.printEndTag();

   }

}

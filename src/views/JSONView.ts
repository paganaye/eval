import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { ElementAttributes } from "../Theme";
import { Map } from "typescript/lib/typescript";

export class JSONView extends View<any, any, ElementAttributes> {
   data: any;
   text: string;   

   build(): void {
      this.text = JSON.stringify(this.data);
   }

   render(output: Output): void {
      output.printStartTag("span", this.attributes);
      output.printText(this.text);
      output.printEndTag();

   }

   getValue(): any {
      return this.data;
   }
}

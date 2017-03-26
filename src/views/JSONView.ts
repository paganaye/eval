import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";
import { ViewOptions } from "../Theme";
import { Map } from "typescript/lib/typescript";

export class JSONView extends View<any, any, ViewOptions> {
   data: any;
   text: string;

   build(): void {
      this.text = JSON.stringify(this.data);
   }

   render(output: Output): void {
      output.printStartTag("span", {});
      output.printText(this.text);
      output.printEndTag();

   }

   getValue(): any {
      return this.data;
   }
}

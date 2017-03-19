import { View } from "../View";
import { Output } from "../Output";
import { Type } from "../Types";

export class BoxView extends View<any, any> {
   data: any;
   text: string;
   attributes: { [key: string]: string };

   build(data: any, type: Type, attributes: { [key: string]: string }): void {
      this.data = data;
      this.attributes = attributes;
      this.text = JSON.stringify(data);
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
import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition } from "../Types";

export class MapView extends View<any> {
   attributes: { [key: string]: string };
   data: any;
   
   build(data: any, type: TypeDefinition, attributes: { [key: string]: string }): void {
      this.attributes = attributes;
      this.data = data;
   }

   render(output: Output): void {
      if (this.attributes && Object.keys(this.attributes).length > 0) {
         output.printStartTag("span", this.attributes);
         output.printText(this.data);
         output.printEndTag();
      } else {
         output.printText(this.data);
      }

   }
}


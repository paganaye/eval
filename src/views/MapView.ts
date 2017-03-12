import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition } from "../Types";

export class MapView extends View<any> {
   render(data: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
      debugger;
      if (attributes && Object.keys(attributes).length > 0) {
         output.printStartTag("span", attributes);
         output.printText(data);
         output.printEndTag();
      } else {
         output.printText(data);
      }
   }
}


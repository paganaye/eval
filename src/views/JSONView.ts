import { View } from "../View";
import { Output } from "../Output";
import { TypeDefinition } from "../Types";

export class JSONView extends View<any> {
   render(expr: any, type: TypeDefinition, attributes: { [key: string]: string }, output: Output): void {
      output.printStartTag("span", attributes);
      var text = JSON.stringify(expr);
      output.printText(text);
      output.printEndTag();
   }
}

//Docs.views["default"] = new DefaultView();